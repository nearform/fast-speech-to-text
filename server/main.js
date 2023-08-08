import "dotenv/config";
import fastify from "fastify";
import cors from "@fastify/cors";
import fastifyWebsocket from "@fastify/websocket";
import {
  GoogleSpeechToText,
  OpenAISpeechToText,
} from "./lib/speech-to-text.js";
import openAiFull from "./lib/openai-full.js";
import openAiChunked from "./lib/openai-chunked.js";
import googleRealtime from "./lib/google-realtime.js";

const app = fastify({ logger: true });
app.register(cors, {
  origin: process.env["WEB_HOST"],
});
app.register(fastifyWebsocket);

app.get("/is-alive", async () => {
  const now = new Date().toISOString();
  return { msg: "Is Alive!", now };
});

app.register(openAiFull, { speechToText: OpenAISpeechToText.create() });

app.register(openAiChunked, { speechToText: OpenAISpeechToText.create() });

app.register(googleRealtime, {
  speechToText: await GoogleSpeechToText.create(),
});

try {
  await app.listen({ port: 1234 });
} catch (err) {
  app.log.error(err);
  process.exit(-127);
}
