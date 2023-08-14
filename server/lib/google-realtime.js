import stream from "node:stream/promises";

import { GoogleSpeechToText } from "./speech-to-text.js";
import { GoogleTranslate } from "./translate.js";
/**
 * @param {import('fastify').FastifyInstance} instance
 * @param {object} opts
 * @param {Function} done
 */
function googleRealtime(instance, opts, done) {
  if (
    !opts.speechToText ||
    !(opts.speechToText instanceof GoogleSpeechToText)
  ) {
    throw new Error("speechToText must be provided");
  }
  instance.decorate("speechToText", opts.speechToText);

  if (!opts.translator || !(opts.translator instanceof GoogleTranslate)) {
    throw new Error("translator must be provided");
  }

  instance.decorate("translator", opts.translator);

  instance.get("/transcribe", { websocket: true }, (connection) => {
    connection.socket.on("connect", () => {
      instance.log.info("Connection opened with a remote client");
    });

    /**
     * @param {string} text
     */
    function sendText(text) {
      connection.socket.send(Buffer.from(text), (err) => {
        if (err == null) return;
        instance.log.error({ err }, "Error sending message to client");
      });
    }

    /**
     * @param {object} json
     */
    function sendJson(json) {
      sendText(JSON.stringify(json));
    }

    /**
     * @param {Buffer} buffer
     * @returns {[number, string[], Buffer]}
     */
    function deconstructMessage(buffer) {
      const langDecoder = new TextDecoder();

      const stateCode = buffer[0] ?? -1;

      const langs = langDecoder
        .decode(buffer.subarray(1, 21))
        .replace(/\*/g, "")
        .split(":");

      const audioContent = buffer.subarray(22);

      return [stateCode, langs, audioContent];
    }

    // populated when a new audio file starts to arrive
    /** @type {import('node:stream').Duplex | null} */
    let transcription = null;
    connection.socket.on("message", (rawData) => {
      const [stateCode, langs, recording] = deconstructMessage(rawData);
      console.log("stateCode:", stateCode);
      switch (stateCode) {
        case 0:
          {
            instance.log.info(
              { text: recording.toString("utf-8") },
              "Got text message from client"
            );
            sendJson({ type: "msg", msg: "hey good-lookin" });
          }
          break;
        case 1:
          {
            instance.log.info(
              { length: recording.length },
              "Got continuous binary message from client"
            );
            if (transcription == null) {
              transcription = instance.speechToText.createTranscription();
              transcription.on("data", async (data) => {
                const transcript = data.results[0].alternatives[0].transcript;

                const [translateFrom, translateTo] = langs;

                let translated;
                // if the to & from languages are the same, there's no point
                // in translating them so just return the transcription
                if (translateFrom !== translateTo) {
                  instance.log.info(
                    "Translating transcription into " + translateTo
                  );
                  try {
                    [translated] = await instance.translator.translate(
                      transcript,
                      translateTo
                    );
                  } catch (error) {
                    instance.log.error(
                      error.message,
                      "Failed to generate translation"
                    );
                    translated = "ERROR";
                  }
                }

                const payload = {
                  original: {
                    text: transcript,
                    language: translateFrom,
                  },
                };

                if (translated) {
                  payload.translated = {
                    text: translated,
                    language: translateTo,
                  };
                }

                sendJson({
                  type: "transcription",
                  transcription: payload,
                });
              });
              transcription.on("error", (err) => {
                instance.log.error(
                  { err },
                  "Error from real-time transcription stream"
                );
              });
            }

            if (!transcription.closed && !transcription.destroyed) {
              transcription.write(recording, null, (err) => {
                if (err == null) return;
                instance.log.error(
                  { err },
                  "Error writing audio chunk to transcription stream"
                );
              });
            } else {
              instance.log.warn(
                "Received audio chunk while transcription stream is unavailable - dropping this data"
              );
            }
          }
          break;
        case 2:
          {
            instance.log.info(
              { length: recording.length },
              "Got sequence-ending binary message from client"
            );
            if (transcription == null) {
              instance.log.warn(
                "Received final audio chunk before transcription stream was establishsed, dropping this data"
              );
            }
            if (transcription?.closed || transcription?.destroyed) {
              instance.log.warn(
                "Received audio chunk while transcription stream is unavailable - dropping this data"
              );
            }

            instance.log.info(
              "Writing final audio chunk to transcription stream"
            );
            transcription?.end(recording, null, (err) => {
              if (err == null) return;
              instance.log.error(
                { err },
                "Error writing audio chunk to transcription stream"
              );
            });

            stream.finished(transcription).then(() => {
              instance.log.info("transcription finished");
              transcription = null;
            });
          }
          break;
        default:
          instance.log.warn(
            { raw: rawData.toString("utf-8") },
            "Got unknown message from client"
          );
      }
    });

    connection.socket.on("close", () => {
      if (
        transcription !== null &&
        !transcription.closed &&
        !transcription.destroyed
      ) {
        instance.log.info(
          "Connection closing prior to transcription stream completing"
        );
        transcription.destroy();
        transcription = null;
      }
      instance.log.info("Connection with remote client closed");
    });
  });

  done();
}

export default googleRealtime;
