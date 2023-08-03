import fs from "node:fs/promises"
import { Readable } from "node:stream";
import { SpeechClient } from "@google-cloud/speech";
import { Configuration, OpenAIApi } from "openai";

export class OpenAISpeechToText {
  /**
   * @constructor
   * @param {OpenAIApi} openaiApi
   */
  constructor(openaiApi) {
    this.api = openaiApi;
  }

  static create() {
    const config = new Configuration({
      apiKey: process.env["OPENAI_API_KEY"],
    });
    const api = new OpenAIApi(config);
    return new OpenAISpeechToText(api);
  }

  /**
   * @param {import('node:stream').Readable | Buffer} audio
   */
  async transcribe(audio) {
    if (audio instanceof Readable) {
      return this.#transcribeReadable(audio);
    } else {
      // ugh
      return this.#transcribeReadable(Readable.from(audio));
    }
  }

  /**
   * @param {import('node:stream').Readable} audio
   */
  async #transcribeReadable(audio) {
    // hack to let openai understand the readable format as a 'File'
    // see this issue https://github.com/openai/openai-node/issues/77#issuecomment-1455247809
    // note that this should be resolved in v4, so this can be cleared up soon
    var hack = audio;
    hack.path = "audio.webm";
    const result = await this.api.createTranscription(hack, "whisper-1");
    return result.data.text;
  }
}

export class GoogleSpeechToText {
  /**
   * @constructor
   * @param {SpeechClient} client
   */
  constructor(client) {
    this.client = client;
  }

  static async create() {
    const credentialsFile = process.env['GCLOUD_CREDENTIALS']
    const credentials = await fs.readFile(credentialsFile, 'utf-8').then(s => JSON.parse(s))
    const client = new SpeechClient({credentials});
    return new GoogleSpeechToText(client);
  }

  createTranscription() {
    return this.client.streamingRecognize({
      config: {
        encoding: "WEBM_OPUS",
        sampleRateHertz: 48000,
        languageCode: "en-US",
      },
      interimResults: true,
    });
  }
}
