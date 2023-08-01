# Fast speech to text experiments

Repo containing experiments/explorations/proofs-of-concept for fast speech to text (and back again).

The basic idea being validated here is that streaming speech to text can allow us to create a speech-to-speech bot that responds more naturally, because it transcribes the input as it arrives.

## Running things

So far, all the experiments have been web-based, using Svelte for a (very) simple web UI, and fastify for a backend service.

```bash
# install all dependencies for the 'web' and 'server' packages
npm install

# run frontend and backend in dev
npm run dev
```

Open [localhost:5173](http://localhost:5173) in your browser.

## Experiments

Each of these will be available in the web example (see above) - there is also a writeup for each linked below:

 - [x] [OpenAI Whisper](https://openai.com/research/whisper)
   - [x] [Full Transcription](./notes/openai-full.md)
   - [x] [Chunked Audio](./notes/openai-chunked.md)
 - [ ] [Google Speech-to-text](https://cloud.google.com/speech-to-text) (not started)
 - [ ] [Assembly AI](https://www.assemblyai.com/) (not started)
