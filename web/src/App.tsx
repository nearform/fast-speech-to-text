import { useEffect, useState } from 'react';

import { ErrorBoundary } from 'react-error-boundary';

import useLocalStorageState from 'use-local-storage-state';

import {
	ChunkSize,
	Header,
	History,
	LanguageSelectors,
	RecordingToggle,
	TranscriptionOutput
} from '@/components';

import { LanguageCode } from '@/lib/types/language';
import { TranscriptionData, TranslationResult } from '@/lib/types/transcription';

import { readBackAndStore, sentenceDiff } from '@/lib/utils';

import './App.css';

const App = () => {
	const [previousTranslations, setPreviousTranslations] = useLocalStorageState<TranslationResult[]>(
		'previousTranslations',
		{ defaultValue: [] }
	);
	const [chunkDuration, setChunkDuration] = useState<number>(1200);

	const [languages, setLanguages] = useState<{ from: LanguageCode; to: LanguageCode }>({
		from: 'en',
		to: 'en'
	});

	const [lastSpokenWords, setLastSpokenWords] = useState<string>('');

	const [transcriptionResult, setTranscriptionResult] = useState<{
		transcribed: string;
		translated?: string;
	}>({ transcribed: '' });

	const handleTranscriptionOutput = (transcription: TranscriptionData): void => {
		const {
			transcription: { original, translated }
		} = transcription;

		setTranscriptionResult({
			transcribed: original.text,
			translated: translated?.text
		});
	};

	const handleChunkChange = (size: number | number[]) => {
		if (Array.isArray(size)) {
			setChunkDuration(size[0]);
		} else {
			setChunkDuration(size);
		}
	};

	const handleSwitchLanguages = () => {
		setLanguages({
			from: languages.to,
			to: languages.from
		});
	};

	useEffect(() => {
		setTranscriptionResult({ transcribed: '' });
	}, [languages.from, languages.to]);

	useEffect(() => {
		console.log('Should speak');
		const sentence = transcriptionResult.translated || transcriptionResult.transcribed;
		// const wordsToSay = sentenceDiff(lastSpokenWords, sentence);
		readBackAndStore(sentence, languages.to, () => {
			setPreviousTranslations([
				{
					phrase: transcriptionResult.transcribed,
					languages,
					timestamp: Date.now(),
					translated: transcriptionResult.translated
				},
				...previousTranslations.slice(0, 9) // only allow up to 10 in the history
			]);
		});
		setLastSpokenWords(sentence);
	}, [transcriptionResult.transcribed, transcriptionResult.translated, languages.to]);

	return (
		<>
			<Header onToggleMenu={() => {}} />
			<div className="container">
				<LanguageSelectors
					inputLang={languages.from}
					outputLang={languages.to}
					onInputChange={(from: LanguageCode) => setLanguages({ ...languages, from })}
					onOutputChange={(to: LanguageCode) => setLanguages({ ...languages, to })}
					onSwitchClick={handleSwitchLanguages}
				/>
				<ChunkSize chunkSize={chunkDuration} onChange={handleChunkChange} />

				<ErrorBoundary fallback={<p>error in RecordingToggle</p>}>
					<RecordingToggle
						chunkDuration={chunkDuration}
						langFrom={languages.from}
						langTo={languages.to}
						onTranscriptionChange={handleTranscriptionOutput}
					/>
				</ErrorBoundary>

				<TranscriptionOutput
					langFrom={languages.from}
					langTo={languages.to}
					transcribed={transcriptionResult.transcribed}
					translated={transcriptionResult.translated}
				/>

				<History />
			</div>
		</>
	);
};

App.displayName = 'App';

export default App;
