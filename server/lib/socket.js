import { RealtimeDatabaseClient } from './rtdb.js'
import { TranslationClient } from './translate.js'

/**
 * @param {import('fastify').FastifyInstance} instance
 * @param {object} opts
 * @param {Function} done
 */
function socket(instance, opts, done) {
  if (!opts.translator || !(opts.translator instanceof TranslationClient)) {
    throw new Error('translator must be provided')
  }
  if (!opts.rtdb || !(opts.rtdb instanceof RealtimeDatabaseClient)) {
    throw new Error('rtdb must be provided')
  }
  instance.decorate('translator', opts.translator)
  instance.decorate('rtdb', opts.rtdb)

  instance.get('/translate', { websocket: true }, connection => {
    connection.socket.on('connect', () => {
      instance.log.info('Connection opened with a remote client')
    })

    /**
     * @param {string} text
     */
    function sendText(text) {
      connection.socket.send(Buffer.from(text), err => {
        if (err == null) return
        instance.log.error({ err }, 'Error sending message to client')
      })
    }

    /**
     * @param {object} json
     */
    function sendJson(json) {
      sendText(JSON.stringify(json))
    }

    /**
     * @param {Buffer} buffer
     * @returns {[number, string, string, string, Buffer]}
     */
    function deconstructMessage(buffer) {
      const decoder = new TextDecoder()

      const languages = decoder
        .decode(buffer.subarray(1, 21))
        .replace(/\*/g, '')
        .split(':')

      const roomId = decoder.decode(buffer.subarray(22, 58))

      let sender = decoder.decode(buffer.subarray(58, 83))
      sender = sender.replaceAll('*', '')

      const transcribedText = decoder.decode(buffer.subarray(83))

      return [languages[0], languages[1], roomId, sender, transcribedText]
    }

    async function translateText(text, targetLang) {
      let translated
      try {
        ;[translated] = await instance.translator.translate(text, targetLang)
      } catch (error) {
        instance.log.error(error.message, 'Failed to generate translation')
        translated = `An error occured during translation. The original message was: ${text}`
      }

      return translated
    }

    let message

    connection.socket.on('message', async rawData => {
      const [translateFrom, translateTo, roomId, user, transcribedText] =
        deconstructMessage(rawData)

      instance.log.info(`Transcribed text: ${transcribedText}`)

      if (transcribedText) {
        let translated = await translateText(transcribedText, translateTo)

        instance.log.info(`Translated text: ${translated}`)

        // if the to & from languages are the same there's no point
        // in translating them so just return the transcription
        if (translateFrom !== translateTo) {
          instance.log.info('Translating transcription into ' + translateTo)
        }

        const payload = {
          original: {
            text: transcribedText,
            language: translateFrom
          }
        }

        if (translated) {
          payload.translated = {
            text: translated,
            language: translateTo
          }
        }

        message = {
          message: {
            langFrom: translateFrom,
            langTo: translateTo,
            original: transcribedText,
            translated
          },
          timestamp: Date.now(),
          type: 'message',
          user
        }

        instance.log.info('Translation finished')
        instance.log.info(message, 'message')

        instance.rtdb.push(`events/${roomId}`, message)

        sendJson({
          type: 'transcription',
          transcription: payload
        })
      }
    })

    connection.socket.on('close', () => {
      instance.log.info('Connection with remote client closed')
    })
  })

  done()
}

export default socket
