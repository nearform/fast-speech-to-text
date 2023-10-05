import debounce from 'lodash.debounce'

import { LanguageCode } from '@/lib/types/language'
import { TranscriptionData } from '@/lib/types/transcription'

export const isTranscriptionData = (o: unknown): o is TranscriptionData =>
  o != null &&
  typeof o === 'object' &&
  'type' in o &&
  o.type === 'transcription'

export const stringToBuffer = (
  str: string,
  statusCode?: number
): Uint8Array => {
  const encoder = new TextEncoder()
  const encoded = encoder.encode(str)

  const includeStatusCode = statusCode !== undefined

  const buffer = new Uint8Array(
    encoded.byteLength + (includeStatusCode ? 1 : 0)
  )

  if (includeStatusCode) {
    buffer[0] = statusCode
    buffer.set(encoded, 1)
  } else {
    buffer.set(encoded)
  }

  return buffer
}

export const sentenceDiff = (a: string, b: string): string => {
  const arrA = a.split(' ')
  const arrB = b.split(' ')

  let diff: string[] = []

  if (b.length < a.length || !a.length) {
    diff = arrB
  } else {
    const differentIdx = arrB.findIndex((word, idx) => arrA[idx] !== word)

    if (
      differentIdx < arrA.length - 1 ||
      (arrA.length === 1 && differentIdx === 0)
    ) {
      // change mid-sentence, treat as whole new sentence
      diff = arrB
    } else if (differentIdx >= arrA.length) {
      diff = arrB.slice(differentIdx)
    }
  }

  return diff.join(' ')
}

export const say = (sentence: string, language: LanguageCode) => {
  if (window.speechSynthesis) {
    const utterance = new SpeechSynthesisUtterance(sentence)
    utterance.lang = language
    utterance.rate = 0.8
    // clear any previous utterances that have yet to be spoken
    speechSynthesis.cancel()
    speechSynthesis.speak(utterance)
  }
}

export const sayAndStore = (
  sentence: string,
  language: LanguageCode,
  storeInLS: () => void
) => {
  if (sentence.length) {
    say(sentence, language)
    storeInLS()
  }
}

export const readBackAndStore = debounce(sayAndStore, 500)

export const isProtocolSecure = (protocol: string) =>
  protocol && protocol.startsWith('https')

export const convertTranscriptionMessageToBinaryMessage = (
  langFrom: string,
  langTo: string,
  roomId: string,
  userName: string,
  text: string
): ArrayBuffer => {
  // add the languages used, padding to a fixed length so that
  // we can reliably receive & parse them on the back end
  // N.B - if this padding changes or is removed, the back end
  //       will need updating to match
  const languagesBuffer = stringToBuffer(
    `${langFrom.padEnd(10, '*')}:${langTo.padEnd(10, '*')}`
  )
  const languagesOffset = 1

  // add the room ID & user name so that we can store the
  // message after translating
  const roomIdBuffer = stringToBuffer(roomId)
  const roomIdOffset = 1 + languagesBuffer.byteLength

  const userBuffer = stringToBuffer(userName.padEnd(25, '*'))
  const userOffset = roomIdOffset + roomIdBuffer.length

  const transcribedTextBuffer = stringToBuffer(text)
  const transcribedTextOffset = userOffset + userBuffer.length

  const totalMessageSize = transcribedTextOffset + transcribedTextBuffer.length

  const outgoingMessage = new Uint8Array(totalMessageSize)

  outgoingMessage.set(languagesBuffer, languagesOffset)
  outgoingMessage.set(roomIdBuffer, roomIdOffset)
  outgoingMessage.set(userBuffer, userOffset)
  outgoingMessage.set(transcribedTextBuffer, transcribedTextOffset)

  // convert to ArrayBuffer prior to sending
  const binaryMsg: ArrayBuffer =
    typeof outgoingMessage === 'string'
      ? stringToBuffer(outgoingMessage)
      : outgoingMessage

  return binaryMsg
}
