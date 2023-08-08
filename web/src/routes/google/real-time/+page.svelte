<script lang="ts">
	import { onMount } from 'svelte';
	import { derived, writable } from 'svelte/store';

	type OutgoingMessage = string | ArrayBuffer;
	type TextMessage = string;
	type TranscriptionData = { type: 'transcription'; transcription: string };

	// store vars
	const outgoingMessage = writable<OutgoingMessage>('Initial message');
	const binaryMessages = derived(outgoingMessage, ($msg) => {
		if (typeof $msg === 'string') {
			// if the message is a string, convert it to an array buffer
			const encoder = new TextEncoder();
			const encoded = encoder.encode($msg);
			const buf = new Uint8Array(encoded.byteLength + 1);
			// set first byte to 0 to indicate a string
			buf[0] = 0;
			// copy encoded string into buf
			buf.set(encoded, 1);
			return buf;
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
		{ type: 'transcription', transcription: '' }
	);

	// state vars
	let chunkDuration = 1500;
	let debouncer: NodeJS.Timeout;
	let recorder: MediaRecorder;
	let transcriptionStartTime: number | null = null;

	// effects/reactive vars
	$: isRecording = recorder?.state === 'recording';
	$: lastSpokenWords = <string[]>[];
	$: transcribedText = $transcriptionData.transcription.toLowerCase().split(' ').filter(Boolean);
	// say the most recent words as they're received
	$: transcribedText && debouncedReadBack();
	$: transcriptionTimeDelta =
		transcriptionStartTime != null && $transcriptionData.transcription != ''
			? Date.now() - transcriptionStartTime
			: null;

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
		const sentence = findWordsToSay(lastSpokenWords, transcribedText);

		// if supported by the browser, say it back
		if (sentence.length && window.speechSynthesis) {
			const utterance = new SpeechSynthesisUtterance(sentence.join(' '));
			speechSynthesis.speak(utterance);
		}
	}
	async function startRecording() {
		if (isRecording) return;
		transcriptionStartTime = null;

		const mediaStream = await navigator.mediaDevices.getUserMedia({
			audio: {
				sampleRate: 48000 // Hz
			},
			video: false
		});
		recorder = new MediaRecorder(mediaStream, { mimeType: 'audio/webm; codecs=opus' });

		recorder.ondataavailable = async (e) => {
			const buf = new Uint8Array(e.data.size + 1);
			if (isRecording) {
				buf[0] = 1;
			} else {
				buf[0] = 2;
			}

			buf.set(await e.data.arrayBuffer().then((b) => new Uint8Array(b)), 1);
			outgoingMessage.set(buf.buffer);
		};

		recorder.onerror = (e) => {
			console.error(e);
		};

		recorder.start(chunkDuration);
	}
	function stopRecording() {
		if (!isRecording) return;
		transcriptionStartTime = Date.now();

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
		Click 'Start' and start speaking - a live transcription will be rendered as it comes in below,
		and click 'Stop' to stop recording.
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
	</label>
	<br />
	<output>Chunk Duration: {chunkDuration} ms</output>

	<div>
		{#if isRecording}
			<button on:click={stopRecording}>Stop</button>
		{:else}
			<button on:click={startRecording}>Start</button>
		{/if}
	</div>

	{#if transcriptionTimeDelta != null}
		<p>Time since recording stopped: {transcriptionTimeDelta}ms</p>
	{/if}
	<div class="output">
		{#if transcribedText.length}
			<p class="heard-text">
				Heard <span class="transcription">"{transcribedText.join(' ')}"</span>
			</p>
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
		width: 80%;
	}
	.heard-text {
		font-weight: bold;
	}
	.transcription {
		font-style: italic;
	}
</style>
