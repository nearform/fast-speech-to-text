# OpenAI Whisper (Chunked Audio)

At time of writing, OpenAI does not provide any real-time/streaming capabilities for its transcription API.

One potential workaround for this, however, is to chunk audio client-side, and send each chunk to the API as a standalone audio-file to be transcribed.  
This has some immediate, obvious limitations:

 - Chunk size: a reasonable chunk size needs to be provided to get back sensible transcriptions from the API - the sweet-spot seems to be around 3 seconds of audio - less than this and the API would start returning obviously wrong transcriptions when read as a complete response - at sub-second chunks the API would occasionally send back non-latin characters (although this might be because my code is bad)
   - Another interesting note is that the Whisper model behaves strangely when given empty audio: it returns 'thank you', 'thank you for watching', 'see you next time', and variations on those. This causes problems when there are gaps in the live audio recording, as when chunked they appear to the Whisper model as entirely blank audio clips and so it starts spitting out erroneous transcriptino, whereas in a complete recording they would contextually be recognised as pauses.
   - One possible mitigation from this would be to keep track of the current transcription, and send that as a prompt alongside the audio, which _might_ serve to provide longer-term context for the model to use - this hasn't yet been tried though.
 - Not streaming: an obvious one, but this approach requires sending each chunk of audio via HTTPS, which will add a flat overhead to the latency.
 - API Limits: the docs for the [OpenAI API](https://platform.openai.com/docs/guides/rate-limits/what-are-the-rate-limits-for-our-api) indicate that there are rate limits on the transcription endpoints that would, in all likelihood, prove prohibitive to this approach - an organisation-wide limit of 50 request per-minute would be eaten into quite quickly if audio files are chunked at 3-5 second intervals.

## Conclusion

Pending looking into how sending a prompt along with audio chunks affects the quality of transcription results, OpenAI's Whisper model doesn't seem to be a viable solution for a fast speech-to-text implementation _unless_ we were able/willing to self-host the model, in which case the issues of using the API without explicit streaming capabilities would largely disappear - this would represent a significant expenditure, and would require ML expertise that Nearform _maybe_ doesn't have yet?
