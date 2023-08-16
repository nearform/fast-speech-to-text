import { ChangeEvent, FC } from "react";

import languagesLookup from "@/lib/data/languages.json";

import { LanguageCode } from "@/lib/types/language";

const AVAILABLE_COUNTRIES: [string, string][] =
  Object.entries<string>(languagesLookup);

type LanguageSelectProps = {
  keyPrefix: string;
  onChange: (lang: LanguageCode) => void;
  value: LanguageCode;
};

export const LanguageSelect: FC<LanguageSelectProps> = ({
  keyPrefix,
  onChange,
  value,
}) => {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) =>
    onChange(event.target.value as LanguageCode);

  return (
    <select defaultValue={value} onChange={handleChange}>
      {AVAILABLE_COUNTRIES.map(([code, name]) => (
        <option key={`${keyPrefix}-${code}`} value={code}>
          {name}
        </option>
      ))}
    </select>
  );
};
