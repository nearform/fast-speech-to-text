import { useEffect, useState } from 'react'

import { Database, ref, onValue } from 'firebase/database'

import { ConversationEvent } from '@/lib/types/chatroom'

type UseChatroomArgs = {
  rtdbRef: Database
  roomId: string
}
type UseChatroomData = {
  events: ConversationEvent[]
  error?: string
  loading: boolean
}

export const useMessages = ({
  rtdbRef,
  roomId
}: UseChatroomArgs): UseChatroomData => {
  const [events, setEvents] = useState<ConversationEvent[]>([])
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const unsubscribe = onValue(
      ref(rtdbRef, `events/${roomId}`),
      data => {
        setLoading(false)
        const receivedEvents = Object.values(
          data?.val() || []
        ) as ConversationEvent[]
        setEvents(receivedEvents.sort((a, b) => a.timestamp - b.timestamp))
      },
      error => setError(error.message)
    )

    return unsubscribe
  }, [rtdbRef, roomId])

  return {
    events,
    error,
    loading
  }
}
