import { FC } from 'react'
import languages from '@/lib/data/languages.json'
import { activeRoom } from '@/state'
import { useRecoilValue } from 'recoil'

type EntryExitProps = {
  user: string
  event: 'joined' | 'left'
}

export const EntryExitEvent: FC<EntryExitProps> = ({ event, user }) => {
  const room = useRecoilValue(activeRoom)
  const language =
    room.guest.name === user ? room.guest.language : room.host.language

  return (
    <div className="entry-exit-event text-[12px] border rounded-full bg-white px-2 py-1">
      <p>
        {languages[language]?.flag} {user} {event} the conversation
      </p>
    </div>
  )
}

EntryExitEvent.displayName = 'EntryExitEvent'
