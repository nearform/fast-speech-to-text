import { FC, RefObject } from 'react'
import clsx from 'clsx'

import { ConversationEvent as IChatEvent } from '@/lib/types/chatroom'
import { EntryExitEvent } from './EntryExit'
import { MessageEvent } from './Message'

type ConversationEventProps = {
  event: IChatEvent
  eventRef?: RefObject<HTMLDivElement>
  sentByUser: boolean
}

export const ConversationEvent: FC<ConversationEventProps> = ({
  event,
  eventRef,
  sentByUser
}) => {
  return (
    <div
      className={clsx('chat-event-wrapper', {
        'entry-exit': event.type === 'entryExit',
        message: event.type === 'message',
        'own-event': sentByUser
      })}
      ref={eventRef}
    >
      {event.type === 'entryExit' ? (
        <EntryExitEvent event={event.event} user={event.user} />
      ) : (
        <MessageEvent
          message={
            sentByUser
              ? event.message?.original
              : event.message?.translated || event.message?.original
          }
          timestamp={event.timestamp}
        />
      )}
    </div>
  )
}

ConversationEvent.displayName = 'ChatEvent'
