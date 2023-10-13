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
  const activeUser = useRecoilValue(user)
  const { events, loading } = useMessages({ rtdbRef, roomId: room?.id })

  const eventRef = useRef<HTMLDivElement>()

  useEffect(() => {
    const lastEvent = events[events.length - 1]

    if (
      lastEvent &&
      lastEvent.type === 'message' &&
      lastEvent.user.name !== activeUser.name
    ) {
      const utterance = new SpeechSynthesisUtterance(
        lastEvent.message?.translated
      )
      utterance.lang = activeUser.language

      speechSynthesis.speak(utterance)
    }

    eventRef.current?.scrollIntoView()
  }, [activeUser.name, events])

  return (
    <div className="chat-events bg-background-accent-subtle">
      {!loading && events.length
        ? events.map((event, idx) => (
            <ConversationEvent
              event={event}
              key={`event-${idx + 1}`}
              isSentByUser={event.user.name === activeUser.name}
              eventRef={idx === events.length - 1 ? eventRef : undefined}
            />
          ))
        : null}
    </div>
  )
}
