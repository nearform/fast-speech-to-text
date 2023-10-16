import languages from '@/lib/data/languages.json'
import { User } from '@/lib/types/chatroom'
import { FC } from 'react'

type EntryExitProps = {
  user: User
  event: 'joined' | 'left'
}

export const EntryExitEvent: FC<EntryExitProps> = ({ event, user }) => {
  const flag = languages[user?.language]?.flag

  return (
    <div className="entry-exit-event text-[12px] border rounded-full bg-white px-2 py-1">
      <p>
        {flag} {user.name} {event} the conversation
      </p>
    </div>
  )
}

EntryExitEvent.displayName = 'EntryExitEvent'
