import { FC } from "react";

import { LanguageSelect } from "./LanguageSelect";
import { LanguageCode } from "@/lib/types/language";

import "./styles.css";

type LanguageSelectorsProps = {
  inputLang: LanguageCode;
  outputLang: LanguageCode;
  onInputChange: (code: LanguageCode) => void;
  onOutputChange: (code: LanguageCode) => void;
};

const DEFAULT_LANG: LanguageCode = "en";

export const LanguageSelectors: FC<LanguageSelectorsProps> = ({
  inputLang = DEFAULT_LANG,
  outputLang = DEFAULT_LANG,
  onInputChange,
  onOutputChange,
}) => {
  return (
    <p>
      I am speaking in
      <LanguageSelect
        keyPrefix="in"
        onChange={onInputChange}
        value={inputLang}
      />
      , and would like to hear the response in
      <LanguageSelect
        keyPrefix="out"
        onChange={onOutputChange}
        value={outputLang}
      />
    </p>
  );
};
