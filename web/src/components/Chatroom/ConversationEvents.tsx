import { FC, useEffect, useRef } from 'react'
import { useRecoilValue } from 'recoil'

import { Database } from 'firebase/database'

import { useMessages } from '@/hooks/useMessages'

import { activeRoom, user } from '@/state'

import { ConversationEvent } from './ConversationEvent'

type ChatEventsProps = {
  rtdbRef: Database
}

export const ChatEvents: FC<ChatEventsProps> = ({ rtdbRef }) => {
  const room = useRecoilValue(activeRoom)
  const { name: userName, language } = useRecoilValue(user)
  const { events, loading } = useMessages({ rtdbRef, roomId: room?.id })

  const eventRef = useRef<HTMLDivElement>()

  useEffect(() => {
    const lastEvent = events[events.length - 1]

    if (
      lastEvent &&
      lastEvent.type === 'message' &&
      lastEvent.user !== userName
    ) {
      const utterance = new SpeechSynthesisUtterance(
        lastEvent.message?.translated
      )
      utterance.lang = language

      speechSynthesis.speak(utterance)
    }

    eventRef.current?.scrollIntoView()
  }, [userName, events])

  return (
    <div className="chat-events">
      {!loading && events.length
        ? events.map((event, idx) => (
            <ConversationEvent
              event={event}
              key={`event-${idx + 1}`}
              isSentByUser={event.user === userName}
              eventRef={idx === events.length - 1 ? eventRef : undefined}
            />
          ))
        : null}
    </div>
  )
}
