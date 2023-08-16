import fs from "node:fs/promises";
import { SpeechClient } from "@google-cloud/speech";

export class GoogleSpeechToText {
  /**
   * @constructor
   * @param {SpeechClient} client
   */
  constructor(client) {
    this.client = client;
  }

  static async create() {
    const credentialsFile = process.env["GCLOUD_CREDENTIALS"];
    const credentials = await fs
      .readFile(credentialsFile, "utf-8")
      .then((s) => JSON.parse(s));
    const client = new SpeechClient({ credentials });
    return new GoogleSpeechToText(client);
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
