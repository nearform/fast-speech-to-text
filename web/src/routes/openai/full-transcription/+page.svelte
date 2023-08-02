<script lang="ts">
	import { onMount } from 'svelte';

	let mediaRecorder: MediaRecorder;
	$: recording = mediaRecorder?.state === 'recording';

	let currentRecording: { url: string; blob: Blob } | null = null;

	onMount(() => {
		fetch(`${import.meta.env['VITE_API_HOST']}/is-alive`)
			.then((r) => r.json())
			.then(console.log.bind(console, 'connected to api'))
			.catch(console.error.bind(console, 'error connecting to api'));
	});

	async function startRecording() {
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
		mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
		currentRecording = null;

		mediaRecorder.start();
		let chunks: BlobPart[] = [];

		mediaRecorder.ondataavailable = (e) => {
			chunks.push(e.data);
		};

		mediaRecorder.onerror = (e) => {
			console.error(e);
		};

		mediaRecorder.onstop = () => {
			stream.getTracks().forEach((track) => {
				track.stop();
			});
			const blob = new Blob(chunks, { type: 'audio/webm' });
			currentRecording = { url: URL.createObjectURL(blob), blob };
		};
		mediaRecorder = mediaRecorder;
	}
	function stopRecording() {
		mediaRecorder.stop();
		mediaRecorder = mediaRecorder;
	}
	function deleteCurrentRecording() {
		currentRecording = null;
	}

	let transcribing = false;
	let transcription: string | null = null;

	async function transcribeCurrentRecording() {
		if (currentRecording == null) throw new Error('no data to send, please make a new recording');
		transcribing = true;
		transcription = null;
		transcription = await fetch(`${import.meta.env['VITE_API_HOST']}/transcribe/full`, {
			method: 'POST',
			body: currentRecording.blob
		})
			.then((r) => r.json())
			.then((d) => {
				console.log('got transcription result', d);
				return d.transcription;
			})
			.catch((err) => {
				console.error('error transcribing audio', err);
				return `Error: ${err.message}`;
			});
		transcribing = false;
	}
</script>

<h1>Open AI Full Transcription</h1>
<p>
	Proof concept demonstrating capture of audio in-browser, sending that to a server, and receiving a
	transcription in response. Click 'Start' below, talk to your computer like a loon, and then click
	'Stop' to finish
</p>

{#if recording}
	<button on:click={stopRecording}>Stop</button>
{:else}
	<button on:click={startRecording}>Start</button>
{/if}

<br />

{#if currentRecording != null}
	<figure>
		<figcaption>Your recording</figcaption>
		<audio controls src={currentRecording.url} />
	</figure>
	<button on:click={transcribeCurrentRecording}>Transcribe</button>
	<button on:click={deleteCurrentRecording}>Delete</button>

	{#if transcribing}
		<p>GPT-ing it up...</p>
	{:else if transcription != null}
		<p>{transcription}</p>
	{/if}
{/if}
