import { FC } from 'react'

type EntryExitProps = {
  user: string
  event: 'joined' | 'left'
}

export const EntryExitEvent: FC<EntryExitProps> = ({ event, user }) => {
  return (
    <div className="entry-exit-event">
      <p>
        {user} {event} the conversation
      </p>
    </div>
  )
}

EntryExitEvent.displayName = 'EntryExitEvent'
