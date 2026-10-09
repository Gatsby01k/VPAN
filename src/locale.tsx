import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

type Language = 'en' | 'ru';
const LocaleContext = createContext({
  language: 'en' as Language,
  setLanguage: (_: Language) => {},
  t: (en: string, _ru: string) => en,
});

export function LocaleProvider({
  children,
  initialLanguage = 'en',
}: {
  children: ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const explicit = new URLSearchParams(location.search).get('lang');
    if (explicit === 'ru' || explicit === 'en') {
      setLanguage(explicit);
      return;
    }
    try {
      if (localStorage.getItem('pan-language') === 'ru') setLanguage('ru');
    } catch {
      /* Browser storage can be unavailable. */
    }
  }, [location.search]);
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  const update = (next: Language) => {
    setLanguage(next);
    const params = new URLSearchParams(location.search);
    if (next === 'ru') params.set('lang', 'ru');
    else params.set('lang', 'en');
    navigate(
      { pathname: location.pathname, search: params.toString(), hash: location.hash },
      { replace: true },
    );
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
