import { ChangeEvent, FC } from 'react';

import languagesLookup from '@/lib/data/languages.json';

import { LanguageCode } from '@/lib/types/language';

const AVAILABLE_COUNTRIES: [string, { name: string; flag: string }][] = Object.entries<{
  name: string;
  flag: string;
}>(languagesLookup);

import './styles.css';

type LanguageSelectProps = {
  keyPrefix: string;
  label?: string;
  onChange: (lang: LanguageCode) => void;
  value: LanguageCode;
};

export const LanguageSelect: FC<LanguageSelectProps> = ({ keyPrefix, label, onChange, value }) => {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) =>
    onChange(event.target.value as LanguageCode);

  return (
    <div className="language-container">
      <label htmlFor={`${keyPrefix}-select`}>
        {label}:
        <select
          value={value}
          onChange={handleChange}
          id={`${keyPrefix}-select`}
          name={`${keyPrefix}-select`}
        >
          {AVAILABLE_COUNTRIES.map(([code, { flag, name }]) => (
            <option key={`${keyPrefix}-${code}`} value={code}>
              {name} {flag}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};
