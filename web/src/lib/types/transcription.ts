import { LanguageCode } from './language';

type TranscribedText = { text: string; language: LanguageCode };

export type TranscriptionData = {
	type: 'transcription';
	transcription: { original: TranscribedText; translated?: TranscribedText };
};

export type TranslationResult = {
	phrase: string;
	translated?: string;
	timestamp: number;
};
