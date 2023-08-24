import S from "fluent-json-schema";
import { v4 as uuid } from "uuid";

// import { RealtimeDatabaseClient } from "./rtdb";

const eventSchema = {
  body: S.object()
    // .prop("index", S.number().required())
    .prop(
      "message",
      S.object()
        .prop("langFrom", S.string().required())
        .prop("langTo", S.string())
        .prop("original", S.string().required())
        .prop("translated", S.string())
    )
    .prop("user", S.string().required()),
};
const roomSchema = {
  body: S.object()
    .prop(
      "guest",
      S.object()
        .prop("name", S.string().required())
        .prop("language", S.string().required())
    )
    .prop(
      "host",
      S.object()
        .prop("name", S.string().required())
        .prop("language", S.string().required())
    )
    .prop("id", S.string())
    .prop("name", S.string().required()),
};

/**
 * @param {import('fastify').FastifyInstance} instance
 * @param {{ rtdb: RealtimeDatabaseClient }} opts
 * @param {Function} done
 */
export default (instance, opts, done) => {
  // if (!opts.rtdb || !(opts.rtdb instanceof RealtimeDatabaseClient)) {
  //   throw new Error("rtdb must be provided");
  // }

  instance.decorate("rtdb", opts.rtdb);

  instance.post("/room", { schema: roomSchema }, async ({ body }) => {
    const id = uuid();
    body.id = id;
    return instance.rtdb.insert(`rooms/${id}`, body);
  });
  instance.put(
    "/room/:id/join",
    {
      schema: S.object()
        .prop("name", S.string().required())
        .prop("language", S.string().required()),
    },
    async ({ body, params }) => {
      try {
        instance.rtdb.update(`rooms/${params.id}/guest`, body);

        // push event to room for guest joining
        instance.rtdb.push(`events/${params.id}`, {
          event: "joined",
          type: "entryExit",
          user: body.name,
          timestamp: Date.now(),
        });
      } catch (error) {
        instance.logger.error("Failed to join room");
      }
    }
  );
  instance.put(
    "/room/:id/leave",
    {
      schema: S.object()
        .prop("role", S.string().enum(["host", "guest"]).required())
        .prop("name", S.string().required()),
    },
    async ({ body, params }) => {
      // if host leaves, nuke the room & any events
      if (body.role === "host") {
        instance.rtdb.delete(`rooms`, params.id);
        instance.rtdb.delete('events', params.id)
      } else {
        // clear the guest info
        instance.rtdb.update(`rooms/${params.id}/guest`, {});
        // push event to room for guest exit
        instance.rtdb.push(`events/${params.id}`, {
          event: "left",
          type: "entryExit",
          user: body.name,
          timestamp: Date.now(),
        });
      }
    }
  );
  instance.post(
    "/room/:roomId/event",
    { schema: eventSchema },
    async ({ body: { message, user }, params }) => {
      const event = {
        message,
        timestamp: Date.now(),
        type: "message",
        user,
      };
      return instance.rtdb.push(`events/${params.roomId}`, event);
    }
  );

  done();
};
