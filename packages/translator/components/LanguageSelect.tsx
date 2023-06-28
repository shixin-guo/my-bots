import type { FC } from 'react';

export const languages = {
  'en-US': { name: 'English', lang: 'English', shortKey: 'en-US' },
  'es-ES': { name: 'Español', lang: 'Spanish', shortKey: 'es-ES' },
  'de-DE': { name: 'Deutsch', lang: 'German', shortKey: 'de-DE' },
  'zh-CN': { name: '简体中文', lang: 'Simplified Chinese', shortKey: 'zh-CN' },
  'zh-TW': { name: '繁體中文', lang: 'Traditional Chinese', shortKey: 'zh-TW' },
  'fr-FR': { name: 'Français', lang: 'French', shortKey: 'fr-FR' },
  'pt-PT': { name: 'Português', lang: 'Portuguese', shortKey: 'pt-PT' },
  'jp-JP': { name: '日本語', lang: 'Japanese', shortKey: 'jp-JP' },
  'ru-RU': { name: 'Русский', lang: 'Russian', shortKey: 'ru-RU' },
  'ko-KO': { name: '한국어', lang: 'Korean', shortKey: 'ko-KO' },
  'it-IT': { name: 'Italiano', lang: 'Italian', shortKey: 'it-IT' },
  'vi-VN': { name: 'Tiếng Việt', lang: 'Vietnamese', shortKey: 'vi-VN' },
  'pl-PL': { name: 'Polski', lang: 'Polish', shortKey: 'pl-PL' },
  'tr-TR': { name: 'Türkçe', lang: 'Turkish', shortKey: 'tr-TR' },
  'id-ID': { name: 'Bahasa Indonesia', lang: 'Indonesian', shortKey: 'id-ID' },
  'nl-NL': { name: 'Nederlands', lang: 'Dutch', shortKey: 'nl-NL' },
};

export type LanguageShortKey = keyof typeof languages;
interface Props {
  language: string;
  disabled?: boolean;
  onChange: (language: LanguageShortKey) => void;
}

export const LanguageSelect: FC<Props> = ({ language, onChange, disabled }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    onChange(e.target.value as LanguageShortKey);
  };

  return (
    <select
      className="w-full rounded-md border-[1px] border-slate-400 bg-slate-50 px-4 py-2"
      value={language}
      onChange={handleChange}
      disabled={disabled}
    >
      {Object.values(languages)
        .sort((a, b) => a.shortKey.localeCompare(b.shortKey))
        .map((language) => {
          return (
            <option key={language.shortKey} value={language.shortKey}>
              {language.name +
                ' (' +
                language.lang +
                ')' +
                ' - ' +
                language.shortKey}
            </option>
          );
        })}
    </select>
  );
};
