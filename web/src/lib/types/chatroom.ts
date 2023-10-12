import { LanguageCode } from './language'

export type Chatroom = {
  guest?: {
    name: string
    language: LanguageCode
  }
  host: {
    name: string
    language: LanguageCode
  }
  name: string
  id: string // UUID generated server-side
}

export type ConversationEvent = {
  type: 'message' | 'entryExit'
  user: string
  message?: {
    langFrom?: LanguageCode
    langTo?: LanguageCode
    original: string
    translated?: string
  }
  event: 'joined' | 'left'
  timestamp: number
}
