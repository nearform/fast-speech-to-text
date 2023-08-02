import stream from "node:stream/promises";
import { GoogleSpeechToText } from "./speech-to-text.js";

/**
 * @param {import('fastify').FastifyInstance} instance
 * @param {object} opts
 * @param {GoogleSpeechToText} opts.speechToText
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
  instance.get("/google/real-time", { websocket: true }, (connection) => {
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
     * @returns {[number, Buffer]}
     */
    function head(buffer) {
      const head = buffer[0] ?? -1;
      const tail = buffer.subarray(1);
      return [head, tail];
    }

    // populated when a new audio file starts to arrive
    /** @type {import('node:stream').Duplex | null} */
    let transcription = null;
    connection.socket.on("message", (rawData) => {
      const [k, data] = head(rawData);
      switch (k) {
        case 0:
          {
            instance.log.info(
              { text: data.toString("utf-8") },
              "Got text message from client",
            );
            sendJson({ type: "msg", msg: "hey good-lookin" });
          }
          break;
        case 1:
          {
            instance.log.info(
              { length: data.length },
              "Got continuous binary message from client",
            );
            if (transcription == null) {
              transcription = instance.speechToText.createTranscription();
              transcription.on("data", (data) => {
                sendJson({
                  type: "transcription",
                  transcription: data.results[0].alternatives[0].transcript,
                });
              });
              transcription.on("error", (err) => {
                instance.log.error(
                  { err },
                  "Error from real-time transcription stream",
                );
              });
            }

            if (!transcription.closed && !transcription.destroyed) {
              transcription.write(data, null, (err) => {
                if (err == null) return
                instance.log.error(
                  { err },
                  "Error writing audio chunk to transcription stream",
                );
              });
            } else {
              instance.log.warn(
                "Received audio chunk while transcription stream is unavailable - dropping this data",
              );
            }
          }
          break;
        case 2:
          {
            instance.log.info(
              { length: data.length },
              "Got sequence-ending binary message from client",
            );
            if (transcription == null) {
              instance.log.warn(
                "Received final audio chunk before transcription stream was establishsed, dropping this data",
              );
            }
            if (transcription.closed || transcription.destroyed) {
              instance.log.warn(
                "Received audio chunk while transcription stream is unavailable - dropping this data",
              );
            }

            instance.log.info(
              "Writing final audio chunk to transcription stream",
            );
            transcription.end(data, null, (err) => {
              if (err == null) return
              instance.log.error(
                { err },
                "Error writing audio chunk to transcription stream",
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
            "Got unknown message from client",
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
          "Connection closing prior to transcription stream completing",
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
