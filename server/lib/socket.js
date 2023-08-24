import stream from "node:stream/promises";

import { TranscriptionClient } from "./transcribe.js";
import { TranslationClient } from "./translate.js";
import { RealtimeDatabaseClient } from "./rtdb.js";
/**
 * @param {import('fastify').FastifyInstance} instance
 * @param {object} opts
 * @param {Function} done
 */
function socket(instance, opts, done) {
  if (!opts.transcriber || !(opts.transcriber instanceof TranscriptionClient)) {
    throw new Error("transcriber must be provided");
  }
  if (!opts.translator || !(opts.translator instanceof TranslationClient)) {
    throw new Error("translator must be provided");
  }
  if (!opts.rtdb || !(opts.rtdb instanceof RealtimeDatabaseClient)) {
    throw new Error("rtdb must be provided");
  }
  instance.decorate("transcriber", opts.transcriber);
  instance.decorate("translator", opts.translator);
  instance.decorate("rtdb", opts.rtdb);

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
     * @returns {[number, string, string, string, Buffer]}
     */
    function deconstructMessage(buffer) {
      const decoder = new TextDecoder();

      const stateCode = buffer[0] ?? -1;

      const langs = decoder
        .decode(buffer.subarray(1, 21))
        .replace(/\*/g, "")
        .split(":");

      const roomId = decoder.decode(buffer.subarray(22, 58));

      let sender = decoder.decode(buffer.subarray(58, 83));
      sender = sender.replaceAll("*", "");

      const audioContent = buffer.subarray(83);

      return [stateCode, langs[0], langs[1], roomId, sender, audioContent];
    }

    // populated when a new audio file starts to arrive
    /** @type {import('node:stream').Duplex | null} */
    let transcription = null;
    let message;

    connection.socket.on("message", (rawData) => {
      const [stateCode, translateFrom, translateTo, roomId, user, recording] =
        deconstructMessage(rawData);

      switch (stateCode) {
        case 0:
          {
            instance.log.info(
              { text: recording.toString("utf-8") },
              "Got text message from client"
            );
            sendJson({ type: "msg", msg: "Connection established" });
          }
          break;
        case 1:
          {
            instance.log.info(
              { length: recording.length },
              "Got continuous binary message from client"
            );
            if (transcription == null) {
              transcription =
                instance.transcriber.createTranscription(translateFrom);
              transcription.on("data", async (data) => {
                const transcript = data.results[0].alternatives[0].transcript;

                let translated;
                // if the to & from languages are the same there's no point
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

                message = {
                  message: {
                    langFrom: translateFrom,
                    langTo: translateTo,
                    original: transcript,
                    translated,
                  },
                  type: "message",
                  user,
                };

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
              instance.log.info(
                {},
                "Writing recording to transcription stream"
              );
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
            if (!transcription) {
              instance.log.warn(
                "Received final audio chunk before transcription stream was establishsed, dropping this data"
              );
              break;
            }
            if (transcription.closed || transcription.destroyed) {
              instance.log.warn(
                "Received audio chunk while transcription stream is unavailable - dropping this data"
              );
            }

            instance.log.info(
              "Writing final audio chunk to transcription stream"
            );
            transcription.end(recording, null, (err) => {
              if (err == null) return;
              instance.log.error(
                { err },
                "Error writing audio chunk to transcription stream"
              );
            });

            stream.finished(transcription).then(() => {
              instance.log.info("transcription finished");
              transcription = null;

              instance.log.info(message, "message");

              instance.rtdb.push(`events/${roomId}`, message);
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

export default socket;
