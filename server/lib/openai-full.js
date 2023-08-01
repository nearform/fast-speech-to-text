import { OpenAISpeechToText } from "./speech-to-text.js";

/**
 * @param {import('fastify').FastifyInstance} instance
 * @param {object} opts
 * @param {OpenAISpeechToText} opts.speechToText
 * @param {Function} done
 */
function openAiFull(instance, opts, done) {
  if (
    !opts.speechToText ||
    !(opts.speechToText instanceof OpenAISpeechToText)
  ) {
    throw new Error("speechToText must be provided");
  }

  instance.decorate("speechToText", opts.speechToText);
  instance.addContentTypeParser("audio/webm", function () {
    // return empty promise to allow audio/webm to be accepted and make the data available on the underlying IncomingMessage
    return Promise.resolve();
  });

  instance.post("/transcribe/full", async (request, reply) => {
    try {
      const transcription = await instance.speechToText.transcribe(request.raw);
      return { transcription };
    } catch (err) {
      instance.log.error(err);
      reply.status(500);
      return { msg: "unexpected error" };
    }
  });

  done();
}

export default openAiFull;
