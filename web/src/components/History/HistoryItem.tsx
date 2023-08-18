import { FC } from 'react';

import { TranslationResult } from '@/lib/types/transcription';

import languagesLookup from '@/lib/data/languages.json';
import { say } from '@/lib/utils';

type HistoryItemProps = TranslationResult;

export const HistoryItem: FC<HistoryItemProps> = ({ languages, phrase, translated, timestamp }) => {
  const timestampAsString = new Date(timestamp).toLocaleString();

  const sourceLanguage = languagesLookup[languages.from];
  const targetLanguage = languagesLookup[languages.to];
  return (
    <div
      className="history-item"
      onClick={() => say(translated || phrase, languages.to)}
      title="Click to hear it again"
    >
      <h1 className="phrase">
        {phrase}{' '}
        {translated && (
          <span className="languages">
            ({sourceLanguage.flag}
            {languages.from !== languages.to && ` → ${targetLanguage.flag}`})
          </span>
        )}
      </h1>
      {translated && <p className="translated">{translated}</p>}
      <p className="timestamp">{timestampAsString}</p>
    </div>
  );
};

HistoryItem.displayName = 'HistoryItem';
