import { FC } from 'react';
import useLocalStorageState from 'use-local-storage-state';

import { TranslationResult } from '@/lib/types/transcription';

import { HistoryItem } from './HistoryItem';

import './styles.css';

export const History: FC = () => {
	const [phrases] = useLocalStorageState<TranslationResult[]>('previousTranslations', {
		defaultValue: []
	});

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
