import { FC } from 'react';

import { TranslationResult } from '@/lib/types/transcription';

import { HistoryItem } from './HistoryItem';

type HistoryProps = {
  phrases: TranslationResult[];
};

import './styles.css';

export const History: FC<HistoryProps> = ({ phrases }) => {
  return phrases.length ? (
    <div className="history-container">
      {phrases.map((item, idx) => (
        <HistoryItem
          key={`history-${idx}`}
          languages={item.languages}
          phrase={item.phrase}
          timestamp={item.timestamp}
          translated={item.translated}
        />
      ))}
    </div>
  ) : null;
};

History.displayName = 'History';
