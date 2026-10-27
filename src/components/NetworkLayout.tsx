import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation, type LinkProps } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useLocale } from '../locale';
import { networkMeta } from '../network';
export function NLink({ to, children, ...props }: LinkProps) {
  const { language } = useLocale();
  let target = to;
  if (typeof to === 'string' && to.startsWith('/')) {
    const [path, hash] = to.split('#');
    const [name, query] = path.split('?');
    const params = new URLSearchParams(query);
    if (language === 'ru') params.set('lang', 'ru');
    target = name + (params.size ? '?' + params.toString() : '') + (hash ? '#' + hash : '');
  }
  return (
    <Link to={target} {...props}>
      {children}
    </Link>
  );
}
export function Arrow() {
  return <ArrowUpRight size={20} strokeWidth={1.5} aria-hidden="true" />;
}
export function Action({
  to,
  children,
  light = false,
}: {
  to: string;
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <NLink className={'action' + (light ? ' action-light' : '')} to={to}>
      {children}
      <Arrow />
    </NLink>
  );
}
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}
export function Header() {
  const { t, language, setLanguage } = useLocale();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);
  useEffect(() => {
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [open]);
  return (
    <>
      <a href="#main" className="skip-link">
        {t('Skip to content', 'К содержимому')}
      </a>
      <header className="site-header">
        <NLink to="/" className="wordmark" aria-label="VlaDDoS Network — Home">
          <span className="brand-seal" aria-hidden="true">
            V
          </span>
          <span>
            VlaDDoS<small>NETWORK</small>
          </span>
        </NLink>
        <nav
          id="navigation"
          className={open ? 'primary-nav is-open' : 'primary-nav'}
          aria-label={t('Main navigation', 'Главная навигация')}
        >
          {[
            ['/network', 'The network', 'Сеть'],
            ['/industries', 'Industries', 'Индустрии'],
            ['/markets', 'Markets', 'Рынки'],
            ['/about', 'About', 'О нас'],
          ].map(([path, en, ru]) => (
            <NLink
              key={path}
              to={path}
              aria-current={location.pathname === path ? 'page' : undefined}
            >
              {t(en, ru)}
            </NLink>
          ))}
          <NLink className="mobile-contact" to="/contact">
            {t('Start a conversation', 'Начать разговор')}
            <Arrow />
          </NLink>
        </nav>
        <div className="header-actions">
          <button
            className="language"
            onClick={() => setLanguage(language === 'en' ? 'ru' : 'en')}
            aria-label={t('Switch to Russian', 'Переключить на английский')}
          >
            {language.toUpperCase()}
            <span aria-hidden="true">↔</span>
          </button>
          <NLink to="/contact" className="header-contact">
            {t('Let’s connect', 'Связаться')}
            <Arrow />
          </NLink>
          <button
            ref={toggle}
            className="menu-toggle"
            aria-label={t(
              open ? 'Close menu' : 'Open menu',
              open ? 'Закрыть меню' : 'Открыть меню',
            )}
            aria-expanded={open}
            aria-controls="navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
    </>
  );
}
export function RouteEffects() {
  const location = useLocation();
  const { language } = useLocale();
  const previous = useRef(location.pathname);
  useEffect(() => {
    const meta = networkMeta(location.pathname, language);
    document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description);
    if (previous.current !== location.pathname) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.getElementById('main')?.focus({ preventScroll: true });
      previous.current = location.pathname;
    }
  }, [location.pathname, language]);
  return null;
}
export function Footer() {
  const { t } = useLocale();
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <NLink className="footer-brand" to="/">
          VlaDDoS<span>Network.</span>
        </NLink>
        <div>
          <Eyebrow>{t('An independent B2B network', 'Независимая B2B-сеть')}</Eyebrow>
          <p>
            {t(
              'The right conversation can open a whole new market.',
              'Нужный разговор может открыть целый рынок.',
            )}
          </p>
          <NLink className="text-link" to="/contact">
            {t('Start yours', 'Начните свой')}
            <Arrow />
          </NLink>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} VlaDDoS Network</span>
        <span>ASIA / LATAM / AFRICA</span>
        <div>
          <NLink to="/knowledge">{t('Field notes', 'Практика')}</NLink>
          <NLink to="/privacy">{t('Privacy', 'Конфиденциальность')}</NLink>
          <NLink to="/terms">{t('Terms', 'Условия')}</NLink>
        </div>
      </div>
      <p className="footer-note">
        {t(
          'We source partners and facilitate introductions. Financial services are provided by the respective counterparties, subject to their eligibility and terms.',
          'Мы ищем партнёров и организуем знакомства. Финансовые услуги оказывают соответствующие контрагенты на своих условиях и после проверки допустимости.',
        )}
      </p>
    </footer>
  );
}
