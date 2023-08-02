# Google Speech-to-Text (Real-Time)

Google Cloud includes [a speech-to-text capability](https://cloud.google.com/speech-to-text) that can be utilised from any GCP project.

It provides a streaming interface over gRPC, with a NodeJS client library available for abstracting away the connection/transport details. This provides a more suitable experience for our use case then the OpenAI API.

The API provides interim transcription results (utilised in the proof-of-concept here to render feedback as the user speaks). The transcription is finalised once the audio input is finished (in the the implementation here, once the underlying writable stream is ended). You should see this in the PoC as the quality of the entire transcription will often improve once you stop recording - this, again, is an improvement on the OpenAI offering, which had issues arising from chunks of audio being sent without any context.

That being said, the quality of transcription results _seems_ to be lower with the Google Speech-to-text model than OpenAI Whisper, although that is not properly verified at this point, and it is possible that some parameter tweaking could improve this.

## Conclusion

The Google speech-to-text offering seems to be a viable aproach - further benchmarking and investigation on improving overall transcription quality may be needed.
