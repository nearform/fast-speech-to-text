import { LanguageCode } from './language'

type TranscribedText = { text: string; language: LanguageCode }

export type TranscriptionData = {
  type: 'transcription'
  transcription: TranscribedText
  isFinal: boolean
}

export type TranslationResult = {
  phrase: string
  languages: { from: LanguageCode; to: LanguageCode }
  translated?: string
  timestamp: number
}
