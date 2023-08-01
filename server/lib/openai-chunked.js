import { OpenAISpeechToText } from "./speech-to-text.js";

/**
 * @param {import('fastify').FastifyInstance} instance
 * @param {object} opts
 * @param {OpenAISpeechToText} opts.speechToText
 * @param {Function} done
 */
function openAiChunked(instance, opts, done) {
    if (
      !opts.speechToText ||
      !(opts.speechToText instanceof OpenAISpeechToText)
    ) {
      throw new Error("speechToText must be provided");
    }

    instance.decorate("speechToText", opts.speechToText);
    instance.get("/real-time", { websocket: true }, (connection) => {
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
          sendText(JSON.stringify(json))
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

      connection.socket.on("message", (rawData) => {
        const [k, data] = head(rawData);
        switch (k) {
          case 0:
            {
              instance.log.info(
                { text: data.toString("utf-8") },
                "Got text message from client",
              );
              sendJson({type: 'msg', msg: 'hey good-lookin'});
            }
            break;
          case 1:
            {
              instance.log.info(
                { length: data.length },
                "Got continuous binary message from client",
              );
              instance.speechToText
                .transcribe(data)
                .then((transcription) => {
                  sendJson({type: 'transcription', transcription});
                })
                .catch((err) => {
                  instance.log.error({ err }, "Error transcribing audio chunk");
                });
            }
            break;
          case 2:
            {
              instance.log.info(
                { length: data.length },
                "Got sequence-ending binary message from client",
              );
              instance.speechToText
                .transcribe(data)
                .then((transcription) => {
                  sendJson({type: 'transcription', transcription});
                })
                .catch((err) => {
                  instance.log.error({ err }, "Error transcribing audio chunk");
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
        instance.log.info("Connection with remote client closed");
      });
    });

    done();
}

export default openAiChunked
