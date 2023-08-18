import { FC } from 'react';

import LANGUAGES from '@/lib/data/languages.json';
import { LanguageCode } from '@/lib/types/language';

import './styles.css';

type TranscriptionOutputProps = {
	langFrom: LanguageCode;
	langTo: LanguageCode;
	transcribed: string;
	translated: string;
};

export const TranscriptionOutput: FC<TranscriptionOutputProps> = ({
	langFrom,
	langTo,
	transcribed,
	translated
}) => {
	const sourceLanguage = LANGUAGES[langFrom];
	const outputLanguage = LANGUAGES[langTo];

	return (
		<>
			{transcribed && (
				<div className="output from">
					<p className="output-title">
						{sourceLanguage.flag}
						Heard in:&nbsp;
						<span className="output-language">{sourceLanguage.name}</span>
					</p>
					<p className="output-text">{transcribed}</p>
				</div>
			)}
			{translated && (
				<div className="output to">
					<p className="output-title">
						{outputLanguage.flag}
						Translated to:&nbsp;
						<span className="output-language">{outputLanguage.name}</span>
					</p>
					<p className="output-text">{translated}</p>
				</div>
			)}
		</>
	);
};

TranscriptionOutput.displayName = 'TranscriptionOutput';
