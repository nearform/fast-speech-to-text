import { FC } from 'react';

import { TranslationResult } from '@/lib/types/transcription';

type HistoryItemProps = TranslationResult;

export const HistoryItem: FC<HistoryItemProps> = ({ languages, phrase, translated, timestamp }) => {
	const timestampAsString = new Date(timestamp).toLocaleString();
	return (
		<div className="history-item">
			<h1 className="phrase">
				{phrase}{' '}
				{translated && (
					<span className="languages">
						({languages.from} - {languages.to})
					</span>
				)}
			</h1>
			{translated && <p className="translated">{translated}</p>}
			<p className="timestamp">{timestampAsString}</p>
		</div>
	);
};

HistoryItem.displayName = 'HistoryItem';
