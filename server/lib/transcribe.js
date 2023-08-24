import { readFileSync } from "fs";
import { SpeechClient } from "@google-cloud/speech";

export class TranscriptionClient {
  /**
   * @constructor
   * @param {SpeechClient} client
   */
  constructor(client) {
    this.client = client;
  }

  static init() {
    const credentials = JSON.parse(
      readFileSync(process.env["GCLOUD_CREDENTIALS"])
    );
    const client = new SpeechClient({ credentials });
    return new TranscriptionClient(client);
  }

  createTranscription(languageCode) {
    return this.client.streamingRecognize({
      config: {
        encoding: "WEBM_OPUS",
        sampleRateHertz: 48000,
        languageCode,
      },
      interimResults: true,
    });
  }
}
