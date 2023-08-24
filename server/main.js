import "dotenv/config";
import fastify from "fastify";
import cors from "@fastify/cors";
import fastifyWebsocket from "@fastify/websocket";

import { RealtimeDatabaseClient } from "./lib/rtdb.js";
import { TranscriptionClient } from "./lib/transcribe.js";
import { TranslationClient } from "./lib/translate.js";

import socket from "./lib/socket.js";
import room from "./lib/room.js";

const app = fastify({ logger: true });
app.register(cors, {
  origin: process.env["WEB_HOST"],
});
app.register(fastifyWebsocket);

app.get("/is-alive", async () => {
  const now = new Date().toISOString();
  return { msg: "Is Alive!", now };
});

const rtdbInstance = RealtimeDatabaseClient.init();

app.register(socket, {
  rtdb: rtdbInstance,
  transcriber: TranscriptionClient.init(),
  translator: TranslationClient.init(),
});
app.register(room, { rtdb: rtdbInstance });

try {
  await app.listen({ port: 1234 });
} catch (err) {
  app.log.error(err);
  process.exit(-127);
}
