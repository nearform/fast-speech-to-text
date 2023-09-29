import config from './config.js'
import buildServer from './index.js'

const fastify = buildServer(config)

const start = async function () {
  try {
    await fastify.listen({ host: config.HOST, port: config.PORT })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
