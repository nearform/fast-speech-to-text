import { FC, useState } from 'react'

import { differenceInDays, format } from 'date-fns'
import SoundIcon from '@/icons/SoundIcon'
import languages from '@/lib/data/languages.json'
import { LanguageCode } from '@/lib/types/language'

type MessageEventProps = {
  message: string
  timestamp: number
  language: LanguageCode
  user: string
}

export const MessageEvent: FC<MessageEventProps> = ({
  message,
  timestamp,
  language,
  user
}) => {
  const [playing, setPlaying] = useState<boolean>(false)
  const formatToUse = differenceInDays(timestamp, Date.now())
    ? 'dd/MM/yyyy HH:mm'
    : 'HH:mm'

  const handleReplay = () => {
    setPlaying(!playing)

    if (!playing) {
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.lang = language || window.navigator.language
      utterance.addEventListener('end', () => {
        setPlaying(false)
      })

      speechSynthesis.speak(utterance)
    } else {
      speechSynthesis.cancel()
    }
  }

  return (
    <div className="message-event rounded-lg bg-white border p-3 max-w-[50%]">
      <div className="message-event-content text-left">
        <div className="message-header flex justify-between">
          <p className="text-xs leading-[1.3rem]">
            {languages[language]?.flag} {user}
          </p>
          <button
            className={`message-event-content-replay p-1 border-transparent border-[1px] [&.crossed]:border-black ${
              playing && 'crossed'
            }`}
            onClick={handleReplay}
          >
            <SoundIcon />
          </button>
        </div>
        <p className="message-event-content-text text-base">{message}</p>
      </div>
      <p className="message-event-timestamp text-right text-[10px] text-[#9CA3AF]">
        {format(new Date(timestamp), formatToUse)}
      </p>
    </div>
  )
}
