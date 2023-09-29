import fastifyStatic from '@fastify/static'
import fastifyWebsocket from '@fastify/websocket'
import { join } from 'desm'
import fastify from 'fastify'

import { RealtimeDatabaseClient } from './lib/rtdb.js'
import { TranscriptionClient } from './lib/transcribe.js'
import { TranslationClient } from './lib/translate.js'

import room from './lib/room.js'
import socket from './lib/socket.js'

function buildServer(config) {
  const opts = {
    ...config,
    logger: {
      level: config.LOG_LEVEL,
      ...(config.PRETTY_PRINT && {
        transport: {
          target: 'pino-pretty'
        }
      })
    }
  }

  const app = fastify(opts)

  app.register(fastifyStatic, {
    root: join(import.meta.url, '../web/dist'),
    // etag and lastModified rely on mtime which is incorrect in GCP
    lastModified: false,
    etag: false
  })

  app.setNotFoundHandler((req, reply) => {
    if (req.headers.accept.includes('text/html')) {
      return reply.sendFile('index.html')
    }
    reply.status(404).send()
  })

  app.register(fastifyWebsocket)

  app.get('/is-alive', async () => {
    const now = new Date().toISOString()
    return { msg: 'Is Alive!', now }
  })

  const rtdbInstance = RealtimeDatabaseClient.init()

  app.register(socket, {
    rtdb: rtdbInstance,
    transcriber: TranscriptionClient.init(),
    translator: TranslationClient.init()
  })

  app.register(room, { rtdb: rtdbInstance })

  app.log.info('Server is starting up!')

  return app
}

export default buildServer
