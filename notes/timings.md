# Timings

A very (very) rough benchmarking has been added to the proofs of concept in this repo, which reports the milliseconds elapsed since between the end of user input and receiving the final transcription. (Note in the OpenAI Full Transcription demo, the timing is just on the single http request made to POST the audio and recieve back the transcription).

Reading the first stanza of [Walt Whitman's 'Crossing Brooklyn Ferry'](https://www.poetryfoundation.org/poems/45470/crossing-brooklyn-ferry), the following timings are recorded (numbers are rounded to nearest 10ms):

| Demo                           | Time (ms) | Size vs Control |
| ------------------------------ | --------- | --------------- |
| OpenAI Full Transcription      | 1410ms    | 100.00%         |
| OpenAI Chunked Transcription   | 750ms     | 53.19%          |
| Google Real Time Transcription | 360ms     | 26.24%          |

Reading the first two stanzas of the poem:

| Demo                           | Time (ms) | Size vs Control |
| ------------------------------ | --------- | --------------- |
| OpenAI Full Transcription      | 2130ms    | 100.00%         |
| OpenAI Chunked Transcription   | 700ms     | 32.86%          |
| Google Real Time Transcription | 600ms     | 28.17%          |

The increase in the Google Real Time here is because the api returns the complete transcription every time it responds, vs the OpenAI Chunked approach which only returns transcript for the audio chunk it was working with at a given point.
