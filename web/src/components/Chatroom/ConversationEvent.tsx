import { FC, RefObject } from 'react'
import clsx from 'clsx'

import { ConversationEvent as IChatEvent } from '@/lib/types/chatroom'
import { EntryExitEvent } from './EntryExit'
import { MessageEvent } from './Message'

type ConversationEventProps = {
  event: IChatEvent
  eventRef?: RefObject<HTMLDivElement>
  isSentByUser: boolean
}

export const ConversationEvent: FC<ConversationEventProps> = ({
  event,
  eventRef,
  isSentByUser
}) => {
  const isEventEntryExit = event.type === 'entryExit'
  const isEventMessage = event.type === 'message'
  const message = isSentByUser
    ? event.message?.original
    : event.message?.translated || event.message?.original

  const language = isSentByUser
    ? event.message?.langFrom
    : event.message?.langTo || event.message?.langFrom

  return (
    <div
      className={clsx('chat-event-wrapper', {
        'entry-exit': isEventEntryExit,
        message: isEventMessage,
        'own-event': isSentByUser
      })}
      ref={eventRef}
    >
      {event.type === 'entryExit' ? (
        <EntryExitEvent event={event.event} user={event.user} />
      ) : (
        <MessageEvent
          message={message}
          timestamp={event.timestamp}
          language={language}
        />
      )}
    </div>
  )
}

ConversationEvent.displayName = 'ChatEvent'
