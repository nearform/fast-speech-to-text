import { LanguageCode } from './language'

export type User = {
  name: string
  language: LanguageCode
}

export type Chatroom = {
  guest?: User
  host: User
  name: string
  id: string // UUID generated server-side
}

export type ConversationEvent = {
  type: 'message' | 'entryExit'
  user: User
  message?: {
    langFrom?: LanguageCode
    langTo?: LanguageCode
    original: string
    translated?: string
  }
  event: 'joined' | 'left'
  timestamp: number
}
