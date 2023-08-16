import { FC } from 'react';

import { TranslationResult } from '@/lib/types/transcription';

type HistoryItemProps = TranslationResult & {
	key: string;
};

export const HistoryItem: FC<HistoryItemProps> = ({ key, phrase, translated, timestamp }) => {
	const timestampAsString = new Date(timestamp).toLocaleString();
	return (
		<div className="history-item" key={key}>
			<h1 className="phrase">{phrase}</h1>
			{translated && <p className="translated">{translated}</p>}
			<p className="timestamp">{timestampAsString}</p>
		</div>
	);
};

HistoryItem.displayName = 'HistoryItem';
