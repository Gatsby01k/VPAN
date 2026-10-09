import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Language = 'en' | 'ru';
const LocaleContext = createContext({
  language: 'en' as Language,
  setLanguage: (_: Language) => {},
  t: (en: string, _ru: string) => en,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  useEffect(() => {
    try {
      if (localStorage.getItem('pan-language') === 'ru') setLanguage('ru');
    } catch {
      /* Browser storage can be unavailable. */
    }
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  const update = (next: Language) => {
    setLanguage(next);
    try {
      localStorage.setItem('pan-language', next);
    } catch {
      /* The interface still works without storage. */
    }
  };
  return (
    <LocaleContext
      value={{ language, setLanguage: update, t: (en, ru) => (language === 'ru' ? ru : en) }}
    >
      {children}
    </LocaleContext>
  );
}
export const useLocale = () => useContext(LocaleContext);
