import { v2 } from "@google-cloud/translate";
import { readFileSync } from "fs";

export class TranslationClient {
  /**
   * @constructor
   * @param {v2.Translate} client
   */
  constructor(client) {
    this.client = client;
  }

  static init() {
    try {
      const credentials = JSON.parse(
        readFileSync(process.env.GCLOUD_CREDENTIALS)
      );
      const client = new v2.Translate({ credentials });

      return new TranslationClient(client);
    } catch (error) {
      throw new Error("Failed to initialise translator");
    }
  }

  /**
   * Translate a string from a given language to another given language
   * @param {string} text Text to translate
   * @param {string} targetLang Language to translate to
   * @returns {Promise<string>}
   * @throws
   */
  async translate(text, targetLang) {
    if (!text || !targetLang) {
      throw new Error(
        "Missing one or more arguments.  All fields are mandatory."
      );
    }

    return await this.client.translate(text, { to: targetLang });
  }
}
