import { FC } from 'react';

import { FiRepeat as Switch } from 'react-icons/fi';

import { LanguageCode } from '@/lib/types/language';

import { LanguageSelect } from './LanguageSelect';

import './styles.css';

type LanguageSelectorsProps = {
  inputLang: LanguageCode;
  outputLang: LanguageCode;
  onInputChange: (code: LanguageCode) => void;
  onOutputChange: (code: LanguageCode) => void;
  onSwitchClick: () => void;
};

const DEFAULT_LANG: LanguageCode = 'en';

export const LanguageSelectors: FC<LanguageSelectorsProps> = ({
  inputLang = DEFAULT_LANG,
  outputLang = DEFAULT_LANG,
  onInputChange,
  onOutputChange,
  onSwitchClick
}) => {
  return (
    <div className="languages-container">
      <LanguageSelect
        keyPrefix="in"
        label="I am speaking in"
        onChange={onInputChange}
        value={inputLang}
      />
      <button className="language-switcher" onClick={onSwitchClick}>
        <Switch />
      </button>
      <LanguageSelect
        keyPrefix="out"
        label="Translate to"
        onChange={onOutputChange}
        value={outputLang}
      />
    </div>
  );
};
