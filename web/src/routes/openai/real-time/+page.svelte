<script lang="ts">
	import { onMount } from 'svelte';
	import { derived, writable } from 'svelte/store';

	type TextMessage = string;
	type TranscriptionData = { type: 'transcription'; transcription: string };
	function isTranscriptionData(o: unknown): o is TranscriptionData {
		return o != null && typeof o === 'object' && 'type' in o && o.type === 'transcription';
	}

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
	$: {
		console.log($jsonMessage);
	}
	const transcriptionData = derived<typeof jsonMessage, TranscriptionData>(
		jsonMessage,
		($obj, set) => {
			if (isTranscriptionData($obj)) {
				set($obj);
			}
		},
		{ type: 'transcription', transcription: '' }
	);

	type OutgoingMessage = string | ArrayBuffer;
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

	onMount(() => {
		const url = new URL(import.meta.env['VITE_API_HOST']);
		url.protocol = 'ws';
		url.pathname = '/real-time';

		const websocket = new WebSocket(url);
		websocket.binaryType = 'arraybuffer';

		const bufferedMessages: OutgoingMessage[] = [];
		const unsubscribeBinaryMessages = binaryMessages.subscribe((msg) => {
			switch (websocket.readyState) {
				case WebSocket.CONNECTING:
					{
						console.log(
							'websocket not ready, buffering msg to send once connection is established',
							msg
						);
						bufferedMessages.push(msg);
					}
					break;
				case WebSocket.OPEN:
					{
						websocket.send(msg);
					}
					break;
				default:
					console.warn('message will NOT be sent', msg);
			}
		});

		websocket.addEventListener('open', () => {
			console.log('websocket connection opened');
			if (bufferedMessages.length > 0) {
				console.log('sending', bufferedMessages.length, 'buffered messages');
				for (const msg of bufferedMessages) {
					websocket.send(msg);
				}
			}
		});

		websocket.addEventListener('error', (event) => {
			console.error('error from websocket', event);
		});

		websocket.addEventListener('close', () => {
			console.log('websocket connection closed');
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

	let chunkDuration = 3;
	let recorderInterval: number | null = null;
	let recorder: MediaRecorder;
	$: isRecording = recorderInterval != null;
	let transcriptionStartTime: number | null = null;

	async function startRecording() {
		if (isRecording) return;
		isRecording = true;
		transcriptionStartTime = null;

		const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
		recorder = new MediaRecorder(mediaStream, { mimeType: 'audio/webm' });

		recorder.ondataavailable = async (e) => {
			console.log('Got data from audio source, preparing to send to server');
			const buf = new Uint8Array(e.data.size + 1);
			if (isRecording) {
				console.log('got next continuous audio chunk');
				buf[0] = 1;
			} else {
				console.log('got final audio chunk');
				buf[0] = 2;
			}

			buf.set(await e.data.arrayBuffer().then((b) => new Uint8Array(b)), 1);
			console.log('sending');
			outgoingMessage.set(buf.buffer);
		};

		recorder.onerror = (e) => {
			console.error(e);
		};

		// definitely losing some precious audio bits here
		recorderInterval = window.setInterval(() => {
			if (recorder.state !== 'inactive') {
				recorder.stop();
			}
			recorder.start();
		}, chunkDuration * 1000);
	}

	function stopRecording() {
		if (!isRecording) return;
		transcriptionStartTime = Date.now();

		window.clearInterval(recorderInterval as number);

		recorder.stop();

		recorder.stream.getTracks().forEach((track) => {
			track.stop();
		});

		recorderInterval = null;
	}

	let transcription = '';
	$: {
		if ($transcriptionData.transcription !== '') {
			transcription += ' ' + $transcriptionData.transcription;
		}
	}

	$: transcriptionTimeDelta =
		$transcriptionData.transcription !== '' && transcriptionStartTime != null
			? Date.now() - transcriptionStartTime
			: null;
</script>

<h1>OpenAI Real-Time(ish)</h1>
<p>
	Proof-of-concept demonstrating using websockets to send chunks of audio for transcription to
	provide a real-time-lite speech-to-text experience.
</p>
<p>
	Click 'Start' and start speaking - a live transcription will be rendered as it comes in below.
	Click 'Stop' to stop. Use the range slider to play around with the chunk length
</p>

<label
	>Chunk Duration (seconds)
	<input type="range" min="1" max="20" bind:value={chunkDuration} disabled={isRecording} />
</label>
<br />
<output>Chunk Duration: {chunkDuration} seconds</output>
<pre><code>Open the dev console to see things working (or not working!)</code></pre>

<div>
	{#if isRecording}
		<button on:click={stopRecording}>Stop</button>
	{:else}
		<button on:click={startRecording}>Start</button>
	{/if}
</div>

{#if transcriptionTimeDelta != null}
	<p>Transcription time since recording stopped: {transcriptionTimeDelta}ms</p>
{/if}

<p>{transcription}</p>
