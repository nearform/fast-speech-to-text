import "dotenv/config";
import fastify from "fastify";
import cors from "@fastify/cors";
import fastifyWebsocket from "@fastify/websocket";
import { OpenAISpeechToText } from "./lib/speech-to-text.js";
import openAiFull from "./lib/openai-full.js"
import openAiChunked from "./lib/openai-chunked.js"

const app = fastify({ logger: true });
app.register(cors, {
  origin: process.env["WEB_HOST"],
});
app.register(fastifyWebsocket);

app.get("/is-alive", async () => {
  const now = new Date().toISOString();
  return { msg: "Is Alive!", now };
});

const speechToText = OpenAISpeechToText.create();

app.register(
  openAiFull,
  { speechToText },
);

app.register(
  openAiChunked,
  { speechToText },
);

try {
  await app.listen({ port: 1234 });
} catch (err) {
  app.log.error(err);
  process.exit(-127);
}
