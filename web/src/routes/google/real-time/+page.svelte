<script lang="ts">
	import { onMount } from 'svelte';
	import { derived, writable } from 'svelte/store';

	import { languagesLookup } from '$lib';

	function encodeString(str: string): Uint8Array {
		const encoder = new TextEncoder();
		const encoded = encoder.encode(str);
		const buffer = new Uint8Array(encoded.byteLength + 1);

		buffer[0] = 0;
		buffer.set(encoded, 1);

		return buffer;
	}

	type LanguageCode = keyof typeof languagesLookup;
	type OutgoingMessage = string | ArrayBuffer;
	type TextMessage = string;
	type TranscribedText = { text: string; language: string };
	type TranscriptionData = {
		type: 'transcription';
		transcription: { original: TranscribedText; translated?: TranscribedText };
	};

	const AVAILABLE_COUNTRIES = Object.entries<string>(languagesLookup);

	// store vars
	const outgoingMessage = writable<OutgoingMessage>('Initial message');
	const binaryMessages = derived(outgoingMessage, ($msg) => {
		if (typeof $msg === 'string') {
			// if the message is a string, convert it to an array buffer
			return encodeString($msg);
		} else {
			// message is already an array buffer
			return $msg;
		}
	});
	const textMessage = writable<TextMessage>('');
	const jsonMessage = derived(
		textMessage,
		($msg, set) => {
			try {
				set(JSON.parse($msg));
			} catch {
				//
			}
		},
		null
	);
	const transcriptionData = derived<typeof jsonMessage, TranscriptionData>(
		jsonMessage,
		($obj, set) => {
			if (isTranscriptionData($obj)) {
				set($obj);
			}
		},
		{ type: 'transcription', transcription: { original: { text: '', language: 'en' } } }
	);

	// state vars
	let chunkDuration = 1500;
	let debouncer: NodeJS.Timeout;
	let inputLang: LanguageCode = 'en';
	let outputLang: LanguageCode = inputLang;
	let recorder: MediaRecorder;

	// effects/reactive vars
	$: isRecording = recorder?.state === 'recording';
	$: lastSpokenWords = <string[]>[];
	$: transcribedText = $transcriptionData.transcription.original.text
		.toLowerCase()
		.split(' ')
		.filter(Boolean);
	$: translatedText = ($transcriptionData.transcription.translated?.text || '')
		.toLowerCase()
		.split(' ')
		.filter(Boolean);
	// say the most recent words as they're received
	$: (translatedText.length || transcribedText.length) && debouncedReadBack();

	// helper fns
	function debouncedReadBack() {
		clearTimeout(debouncer);

		debouncer = setTimeout(readBack, 500);
	}
	function findWordsToSay(a: string[], b: string[]): string[] {
		let wordsToSpeak: string[] = [];

		if (b.length < a.length || !a.length) {
			// new string is shorter than previous, implies a new sentence
			// has been processed so just return b
			wordsToSpeak = b;
			lastSpokenWords = wordsToSpeak;
		} else {
			const differentIdx = b.findIndex((word, idx) => a[idx] !== word);

			if (differentIdx < a.length - 1 || (a.length === 1 && differentIdx === 0)) {
				// change mid-sentence, treat as whole new sentence
				wordsToSpeak = b;
				lastSpokenWords = wordsToSpeak;
			} else if (differentIdx >= a.length) {
				// change to end of sentence, just return diff
				wordsToSpeak = b.slice(differentIdx);
				lastSpokenWords = lastSpokenWords.concat(wordsToSpeak);
			}
		}

		return wordsToSpeak;
	}
	function isTranscriptionData(o: unknown): o is TranscriptionData {
		return o != null && typeof o === 'object' && 'type' in o && o.type === 'transcription';
	}
	function readBack() {
		// if we have translated text, read it out.  if not, just read
		// whatever was transcribed
		const sentence = findWordsToSay(
			lastSpokenWords,
			translatedText.length ? translatedText : transcribedText
		);

		// if supported by the browser, say it back
		if (sentence.length && window.speechSynthesis) {
			const utterance = new SpeechSynthesisUtterance(sentence.join(' '));
			utterance.lang = outputLang;
			speechSynthesis.speak(utterance);
		}
	}
	async function startRecording() {
		if (isRecording) return;

		const mediaStream = await navigator.mediaDevices.getUserMedia({
			audio: {
				sampleRate: 48000 // Hz
			},
			video: false
		});
		recorder = new MediaRecorder(mediaStream, { mimeType: 'audio/webm; codecs=opus' });

		recorder.ondataavailable = async (e) => {
			const buffer = new Uint8Array(e.data.size + 22);
			if (isRecording) {
				buffer[0] = 1;
			} else {
				buffer[0] = 2;
			}

			// add the languages used, padding to a fixed length so that
			// we can reliably receive & parse them on the back end
			// N.B - if this padding changes or is removed, the back end
			//       will need updating to match
			const fromLanguage = inputLang.padEnd(10, '*');
			const toLanguage = outputLang.padEnd(10, '*');

			const encoder = new TextEncoder();
			const langsEncoded = encoder.encode(`${fromLanguage}:${toLanguage}`);
			const langBuffer = new Uint8Array(langsEncoded.byteLength);
			langBuffer.set(langsEncoded);
			buffer.set(langBuffer, 1);

			buffer.set(await e.data.arrayBuffer().then((b) => new Uint8Array(b)), 1 + langBuffer.length);
			outgoingMessage.set(buffer.buffer);
		};

		recorder.onerror = (e) => {
			console.error(e);
		};

		recorder.start(chunkDuration);
	}
	function stopRecording() {
		if (!isRecording) return;

		recorder.stop();

		recorder.stream.getTracks().forEach((track) => {
			track.stop();
		});

		// force svelte reactive update
		recorder = recorder;
	}

	// lifecycle hooks
	onMount(() => {
		const url = new URL(import.meta.env['VITE_API_HOST']);
		url.protocol = 'ws';
		url.pathname = '/google/real-time';

		const websocket = new WebSocket(url);
		websocket.binaryType = 'arraybuffer';

		const bufferedMessages: OutgoingMessage[] = [];
		const unsubscribeBinaryMessages = binaryMessages.subscribe((msg) => {
			switch (websocket.readyState) {
				case WebSocket.CONNECTING:
					{
						// if the WebSocket is still connecting, add the message to a buffer
						// to be sent later once the WebSocket connection's open
						bufferedMessages.push(msg);
					}
					break;
				case WebSocket.OPEN:
					{
						websocket.send(msg);
					}
					break;
				default:
					console.warn('WebSocket not in a ready state - message will not be sent:', msg);
			}
		});

		websocket.addEventListener('open', () => {
			if (bufferedMessages.length) {
				for (const msg of bufferedMessages) {
					websocket.send(msg);
				}
			}
		});

		websocket.addEventListener('error', (event) => {
			console.error('Error from webSocket', event);
		});

		websocket.addEventListener('close', () => {
			console.info('WebSocket connection closed');
		});

		websocket.addEventListener('message', (event) => {
			const decoder = new TextDecoder();
			const text = decoder.decode(event.data as ArrayBuffer);
			textMessage.set(text);
		});

		return () => {
			unsubscribeBinaryMessages();
			websocket.close();
		};
	});
</script>

<div class="container">
	<h1>Google Real-Time Speech-to-Text (and Speech-to-Speech) converter</h1>
	<p>
		Proof-of-concept demonstrating using websockets to send chunks of audio for transcription to
		provide a real-time speech-to-text experience.
	</p>
	<p>
		Click the button below and start speaking - a live transcription will be rendered as it comes in
		below, and click again to stop recording.
	</p>
	<p>Use the range slider below to play around with the chunk length</p>

	<label
		>Chunk Duration (ms)
		<input
			type="range"
			min="100"
			max="6000"
			step="100"
			bind:value={chunkDuration}
			disabled={isRecording}
		/>
		{chunkDuration} ms
	</label>

	<p>
		I am speaking in
		<select
			bind:value={inputLang}
			on:change={() => {
				transcribedText = [];
				translatedText = [];
			}}
		>
			{#each AVAILABLE_COUNTRIES as [langCode, name]}
				<option value={langCode}>{name}</option>
			{/each}
		</select>
		, and would like to hear the response in
		<select
			bind:value={outputLang}
			on:change={() => {
				transcribedText = [];
				translatedText = [];
			}}
		>
			{#each AVAILABLE_COUNTRIES as [langCode, name]}
				<option value={langCode}>{name}</option>
			{/each}
		</select>
	</p>

	<button
		class="recording-toggle"
		class:start={!isRecording}
		class:stop={isRecording}
		on:click={isRecording ? stopRecording : startRecording}
		title={`${isRecording ? 'Stop' : 'Start'} recording`}
	>
		<div class="icon" />
	</button>

	<div class="output">
		{#if transcribedText.length}
			<p class="heard-text">
				Heard (in {languagesLookup[inputLang]}):<br /><span class="transcription"
					>"{transcribedText.join(' ')}"</span
				>
			</p>
			{#if translatedText.length}
				<p class="translated-text">
					Translated (to {languagesLookup[outputLang]}):<br /><span class="transcription"
						>{translatedText.join(' ')}</span
					>
				</p>
			{/if}
		{/if}
		{#if !transcribedText.length}
			<p>
				Start recording &amp; say something, you'll see what it hears in this box and then it'll say
				it back to you
			</p>
		{/if}
	</div>
</div>

<style>
	.container {
		display: flex;
		width: 100vw;
		height: 100vh;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		font-family: sans-serif;
		text-align: center;
	}

	.output {
		display: flex;
		flex-direction: column;
		background-color: rgba(0, 0, 0, 0.125);
		border-radius: 3px;
		padding: 1.5em 3em;
		margin-top: 2em;
		width: clamp(200px, 80%, 800px);
	}
	.heard-text {
		font-weight: bold;
	}
	.transcription {
		font-style: italic;
	}

	.recording-toggle {
		height: 40px;
		width: 40px;
		border-radius: 50%;
		outline: none;
		border: 1px solid;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 20px;
		cursor: pointer;
	}

	.recording-toggle .icon {
		height: 20px;
		width: 20px;
	}

	.recording-toggle.start {
		background-color: rgb(240, 240, 240);
		border-color: rgb(128, 128, 128);
	}

	.recording-toggle.start .icon {
		background-color: red;
		border-radius: 50%;
	}
	.recording-toggle.stop .icon {
		background-color: rgb(64, 64, 64);
		height: 15px;
		width: 15px;
	}
</style>
