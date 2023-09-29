import { FC, useState } from 'react';

import { FiVolume2 as Play, FiVolumeX as Stop } from 'react-icons/fi';

import { differenceInDays, format } from 'date-fns';

type MessageEventProps = {
  message: string;
  timestamp: number;
};

export const MessageEvent: FC<MessageEventProps> = ({ message, timestamp }) => {
  const [playing, setPlaying] = useState<boolean>(false);
  const formatToUse = differenceInDays(timestamp, Date.now()) ? 'dd/MM/yyyy HH:mm' : 'HH:mm';

  const handleReplay = () => {
    setPlaying(!playing);

    if (!playing) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = window.navigator.language;
      utterance.addEventListener('end', () => {
        setPlaying(false);
      });

      speechSynthesis.speak(utterance);
    } else {
      speechSynthesis.cancel();
    }
  };

  return (
    <div className="message-event">
      <div className="message-event-content">
        <p className="message-event-content-text">{message}</p>
        <button className="message-event-content-replay" onClick={handleReplay}>
          {playing ? <Stop /> : <Play />}
        </button>
      </div>
      <p className="message-event-timestamp">{format(new Date(timestamp), formatToUse)}</p>
    </div>
  );
};
