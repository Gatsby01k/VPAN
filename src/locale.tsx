import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

type Language = 'en' | 'ru';
const LocaleContext = createContext({
  language: 'en' as Language,
  setLanguage: (_: Language) => {},
  t: (en: string, _ru: string) => en,
});

export function LocaleProvider({
  children,
  initialLanguage: _initialLanguage = 'en',
}: {
  children: ReactNode;
  initialLanguage?: Language;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  // The URL is authoritative on the server and client. Stored preferences must not
  // silently replace EN content with RU under an EN canonical URL.
  const language: Language =
    new URLSearchParams(location.search).get('lang') === 'ru' ? 'ru' : 'en';
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  const update = (next: Language) => {
    const params = new URLSearchParams(location.search);
    if (next === 'ru') params.set('lang', 'ru');
    else params.set('lang', 'en');
    navigate(
      { pathname: location.pathname, search: params.toString(), hash: location.hash },
      { replace: true },
    );
    try {
      localStorage.setItem('vladdos-language', next);
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
