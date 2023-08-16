import { useEffect, useState } from 'react';

import { ErrorBoundary } from 'react-error-boundary';

import {
	ChunkSize,
	LanguageSelectors,
	RecordingToggle,
	Summary,
	TranscriptionOutput
} from '@/components';

import { LanguageCode } from '@/lib/types/language';
import { TranscriptionData } from '@/lib/types/transcription';

import { readBack, sentenceDiff } from '@/lib/utils';

import './App.css';

const App = () => {
	const [chunkDuration, setChunkDuration] = useState<number>(500);

	const [inputLang, setInputLang] = useState<LanguageCode>('en');
	const [outputLang, setOutputLang] = useState<LanguageCode>(inputLang);

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

	useEffect(() => {
		setTranscriptionResult({ transcribed: '' });
	}, [inputLang, outputLang]);

	useEffect(() => {
		const sentence = transcriptionResult.translated || transcriptionResult.transcribed;
		const wordsToSay = sentenceDiff(lastSpokenWords, sentence);
		readBack(wordsToSay, outputLang);
		setLastSpokenWords(sentence);
	}, [transcriptionResult.transcribed, transcriptionResult.translated, outputLang]);

	return (
		<div className="container">
			<Summary />
			<ChunkSize chunkSize={chunkDuration} onChange={setChunkDuration} />
			<LanguageSelectors
				inputLang={inputLang}
				outputLang={outputLang}
				onInputChange={setInputLang}
				onOutputChange={setOutputLang}
			/>

			<ErrorBoundary fallback={<p>error in RecordingToggle</p>}>
				<RecordingToggle
					chunkDuration={chunkDuration}
					langFrom={inputLang}
					langTo={outputLang}
					onTranscriptionChange={handleTranscriptionOutput}
				/>
			</ErrorBoundary>

			<TranscriptionOutput
				langFrom={inputLang}
				langTo={outputLang}
				transcribed={transcriptionResult.transcribed}
				translated={transcriptionResult.translated}
			/>
		</div>
	);
};

App.displayName = 'App';

export default App;
