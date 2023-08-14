import { FC } from "react";

import LANGUAGES from "@/lib/data/languages.json";
import { LanguageCode } from "@/lib/types/language";

import "./styles.css";

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
  translated,
}) => {
  const sourceLanguage = LANGUAGES[langFrom];
  const outputLanguage = LANGUAGES[langTo];

  return (
    <div className="output">
      {transcribed || translated ? (
        <>
          <p className="section-title">Heard (in {sourceLanguage}):</p>
          {transcribed && <p className="section-text">{transcribed}</p>}

          {langFrom !== langTo && (
            <>
              <p className="section-title">Translated (to {outputLanguage}):</p>
              {translated && <p className="section-text">{translated}</p>}
            </>
          )}
        </>
      ) : (
        <p>Hit record &amp; say something to see the output here</p>
      )}
    </div>
  );
};

TranscriptionOutput.displayName = "TranscriptionOutput";
