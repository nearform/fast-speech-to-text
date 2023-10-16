import S from 'fluent-json-schema'
import { v4 as uuid } from 'uuid'

const eventSchema = {
  body: S.object()
    .prop(
      'message',
      S.object()
        .prop('langFrom', S.string().required())
        .prop('langTo', S.string())
        .prop('original', S.string().required())
        .prop('translated', S.string())
    )
    .prop(
      'user',
      S.object()
        .prop('name', S.string().required())
        .prop('language', S.string().required())
    )
}
const roomSchema = {
  body: S.object()
    .prop(
      'guest',
      S.object()
        .prop('name', S.string().required())
        .prop('language', S.string().required())
    )
    .prop(
      'host',
      S.object()
        .prop('name', S.string().required())
        .prop('language', S.string().required())
    )
    .prop('id', S.string())
    .prop('name', S.string().required())
}

/**
 * @param {import('fastify').FastifyInstance} instance
 * @param {{ rtdb: RealtimeDatabaseClient }} opts
 * @param {Function} done
 */
export default (instance, opts, done) => {
  instance.decorate('rtdb', opts.rtdb)

  instance.post('/api/room', { schema: roomSchema }, async ({ body }) => {
    const id = uuid()
    body.id = id
    return instance.rtdb.insert(`rooms/${id}`, body)
  })
  instance.put(
    '/api/room/:id/join',
    {
      schema: S.object()
        .prop('name', S.string().required())
        .prop('language', S.string().required())
    },
    async ({ body: { name, language }, params }) => {
      try {
        instance.rtdb.update(`rooms/${params.id}/guest`, { name, language })

        // push event to room for guest joining
        instance.rtdb.push(`events/${params.id}`, {
          event: 'joined',
          type: 'entryExit',
          user: {
            name,
            language
          },
          timestamp: Date.now()
        })
      } catch (error) {
        instance.logger.error('Failed to join room')
      }
    }
  )
  instance.put(
    '/api/room/:id/leave',
    {
      schema: S.object()
        .prop('role', S.string().enum(['host', 'guest']).required())
        .prop(
          'user',
          S.object()
            .prop('name', S.string().required())
            .prop('language', S.string().required())
        )
    },
    async ({ body: { role, user }, params }) => {
      // if host leaves, nuke the room & any events
      if (role === 'host') {
        instance.rtdb.delete(`rooms`, params.id)
        instance.rtdb.delete('events', params.id)
      } else {
        // clear the guest info
        instance.rtdb.update(`rooms/${params.id}/guest`, {})
        // push event to room for guest exit
        instance.rtdb.push(`events/${params.id}`, {
          event: 'left',
          type: 'entryExit',
          user,
          timestamp: Date.now()
        })
      }
    }
  )
  instance.post(
    '/api/room/:roomId/event',
    { schema: eventSchema },
    async ({ body: { message, user }, params }) => {
      const event = {
        message,
        timestamp: Date.now(),
        type: 'message',
        user
      }
      return instance.rtdb.push(`events/${params.roomId}`, event)
    }
  )

  done()
}
