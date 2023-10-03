import { atom, selector } from 'recoil'

import { LanguageCode } from '@/lib/types/language'

import { activeRoom } from './chatroom'

export const user = atom<{ name: string; language: LanguageCode }>({
  key: 'userAtom',
  default: { name: '', language: 'en' }
})

export const userIsHost = selector<boolean>({
  key: 'userIsHostAtom',
  get: ({ get }) => {
    const room = get(activeRoom)
    const { name: userName } = get(user)

    return room?.host?.name === userName
  }
})
