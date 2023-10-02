import { SpeechClient } from '@google-cloud/speech'

export class TranscriptionClient {
  /**
   * @constructor
   * @param {SpeechClient} client
   */
  constructor(client) {
    this.client = client
  }

  static init() {
    const client = new SpeechClient()
    return new TranscriptionClient(client)
  }

  createTranscription(languageCode) {
    return this.client.streamingRecognize({
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
        languageCode
      },
      interimResults: true
    })
  }
}
