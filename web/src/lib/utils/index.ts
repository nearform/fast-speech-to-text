import debounce from 'lodash.debounce';

import { LanguageCode } from '@/lib/types/language';
import { TranscriptionData } from '@/lib/types/transcription';

export const isTranscriptionData = (o: unknown): o is TranscriptionData =>
	o != null && typeof o === 'object' && 'type' in o && o.type === 'transcription';

export const stringToBuffer = (str: string, statusCode?: number): Uint8Array => {
	const encoder = new TextEncoder();
	const encoded = encoder.encode(str);

	const includeStatusCode = statusCode !== undefined;

	const buffer = new Uint8Array(encoded.byteLength + (includeStatusCode ? 1 : 0));

	if (includeStatusCode) {
		buffer[0] = statusCode;
		buffer.set(encoded, 1);
	} else {
		buffer.set(encoded);
	}

	return buffer;
};

export const sentenceDiff = (a: string, b: string): string => {
	const arrA = a.split(' ');
	const arrB = b.split(' ');

	let diff: string[] = [];

	if (b.length < a.length || !a.length) {
		diff = arrB;
	} else {
		const differentIdx = arrB.findIndex((word, idx) => arrA[idx] !== word);

		if (differentIdx < arrA.length - 1 || (arrA.length === 1 && differentIdx === 0)) {
			// change mid-sentence, treat as whole new sentence
			diff = arrB;
		} else if (differentIdx >= arrA.length) {
			diff = arrB.slice(differentIdx);
		}
	}

	return diff.join(' ');
};

export const sayAndStore = (sentence: string, language: LanguageCode, storeInLS: () => void) => {
	if (sentence.length) {
		storeInLS();
		if (window.speechSynthesis) {
			const utterance = new SpeechSynthesisUtterance(sentence);
			utterance.lang = language;
			speechSynthesis.speak(utterance);
		}
	}
};

export const readBackAndStore = debounce(sayAndStore, 500);
