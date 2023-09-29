import { useEffect, useState } from 'react'

import { Database, onValue, ref } from 'firebase/database'

import { Chatroom } from '@/lib/types/chatroom'

type UseChatroomArgs = {
  rtdbRef: Database
}
type UseChatroomData = {
  chatrooms?: Chatroom[]
  error?: string
  loading: boolean
}

export const useChatrooms = ({ rtdbRef }: UseChatroomArgs): UseChatroomData => {
  const [chatrooms, setChatrooms] = useState<Chatroom[]>([])
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const unsubscribe = onValue(
      ref(rtdbRef, 'rooms'),
      data => {
        setLoading(false)
        setChatrooms(
          data.val() ? (Object.values(data.val()) as Chatroom[]) : []
        )
      },
      error => {
        setLoading(false)
        setError(error.message)
      }
    )

    return unsubscribe
  }, [rtdbRef])

  return {
    chatrooms,
    error,
    loading
  }
}
