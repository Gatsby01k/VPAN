import { EditorialRule, NavigationGlyph, SignatureArrow } from './ConnectionProtocol';
import { useEffect, useId, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NLink as Link } from './NetworkLayout';
import { Command, CornerDownLeft, Search } from 'lucide-react';
import { Brand, Dialog } from './UI';
import { useLocale } from '../locale';
import { countries, regions, networkMeta } from '../network';
import { useGrowth } from '../growth';
import { recordPage } from './acquisition';
import { telegramUsername, telegramUrl } from '../telegram';

function CommandMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { language, t } = useLocale();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const resultsId = useId();
  const items = [
    {
      title: t('How the network works', 'Как работает сеть'),
      subtitle: t('Qualification and introductions', 'Проверка и знакомства'),
      path: '/network',
    },
    { title: t('Find a partner', 'Найти партнёра'), subtitle: 'I NEED', path: '/find-a-partner' },
    { title: t('Join the network', 'Стать партнёром'), subtitle: 'I OFFER', path: '/join' },
    {
      title: t('Industries', 'Индустрии'),
      subtitle: t('Your business context', 'Контекст бизнеса'),
      path: '/industries',
    },
    { title: t('Markets', 'Рынки'), subtitle: 'Asia / LATAM / Africa', path: '/markets' },
    {
      title: t('Field notes', 'Практика'),
      subtitle: t('Preparation for partnerships', 'Подготовка к партнёрству'),
      path: '/knowledge',
    },
    {
      title: t('About VlaDDoS Network', 'О VlaDDoS Network'),
      subtitle: t('Our principles', 'Наши принципы'),
      path: '/about',
    },
    {
      title: t('Start a conversation', 'Начать разговор'),
      subtitle: t('Direct contact', 'Прямой контакт'),
      path: '/contact',
    },
    ...regions.map((r) => ({
      title: t(r.en, r.ru),
      subtitle: t('Region / browse countries', 'Регион / страны'),
      path: '/markets?region=' + r.id,
    })),
    ...countries.map((c) => ({
      title: t(c.en, c.ru),
      subtitle:
        c.currency +
        ' / ' +
        t(regions.find((r) => r.id === c.region)!.en, regions.find((r) => r.id === c.region)!.ru),
      path: '/markets/' + c.id,
    })),
  ];
  const search = query.trim().toLocaleLowerCase();
  const filtered = items.filter((i) =>
    `${i.title} ${i.subtitle}`.toLocaleLowerCase().includes(search),
  );
  if (search) {
    const score = (item: (typeof items)[number]) => {
      const title = item.title.toLocaleLowerCase();
      return title === search ? 3 : title.startsWith(search) ? 2 : title.includes(search) ? 1 : 0;
    };
    filtered.sort((a, b) => score(b) - score(a));
  }
  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
    }
  }, [open]);
  useEffect(() => {
    if (open)
      document.getElementById(`${resultsId}-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, query, open, resultsId]);
  const go = (path: string) => {
    onClose();
    navigate(path + (language === 'ru' ? (path.includes('?') ? '&' : '?') + 'lang=ru' : ''));
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t('Quick navigation', 'Быстрая навигация')}
      className="command-dialog counter-command"
    >
      <p className="command-eyebrow">
        {t('THE NETWORK, AT YOUR FINGERTIPS', 'ВСЯ СЕТЬ — ПОД РУКОЙ')}
      </p>
      <div className="command-search">
        <Search size={20} />
        <input
          autoFocus
          data-autofocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((index) =>
                filtered.length
                  ? (index + (e.key === 'ArrowDown' ? 1 : -1) + filtered.length) % filtered.length
                  : 0,
              );
            }
            if (e.key === 'Enter' && filtered[active]) {
              e.preventDefault();
              go(filtered[active].path);
            }
          }}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={resultsId}
          aria-activedescendant={filtered[active] ? `${resultsId}-${active}` : undefined}
          placeholder={t('Where would you like to go?', 'Куда хотите перейти?')}
          aria-label={t('Search pages, regions and countries', 'Поиск страниц, регионов и стран')}
        />
        <kbd>ESC</kbd>
      </div>
      <div
        className="command-results"
        id={resultsId}
        role="listbox"
        aria-label={t('Destinations', 'Разделы')}
      >
        {filtered.length ? (
          filtered.map((i, index) => (
            <button
              key={i.path}
              id={`${resultsId}-${index}`}
              role="option"
              aria-selected={active === index}
              tabIndex={-1}
              onMouseEnter={() => setActive(index)}
              onClick={() => go(i.path)}
            >
              <span>
                <strong>{i.title}</strong>
                <small>{i.subtitle}</small>
              </span>
              <SignatureArrow />
            </button>
          ))
        ) : (
          <p className="empty-inline">
            {t(
              'No matches. Try a country or partner type.',
              'Нет совпадений. Попробуйте страну или тип партнёра.',
            )}
          </p>
        )}
      </div>
      <div className="command-footer">
        <span>
          <kbd>↑</kbd>
          <kbd>↓</kbd> {t('Navigate', 'Выбрать')}
        </span>
        <span>
          <CornerDownLeft size={13} /> {t('Open', 'Открыть')}
        </span>
        <span className="command-count" role="status">
          {t('Results:', 'Найдено:')} {filtered.length}
        </span>
      </div>
    </Dialog>
  );
}

export function Header() {
  const { language, setLanguage, t } = useLocale();
  const location = useLocation();
  const [menu, setMenu] = useState(false);
  const [command, setCommand] = useState(false);
  useEffect(() => {
    setMenu(false);
  }, [location.pathname, location.hash, location.search]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setMenu(false);
        setCommand((v) => !v);
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);
  const links = [
    ['/network', t('Network', 'Сеть')],
    ['/industries', t('Industries', 'Индустрии')],
    ['/markets', t('Markets', 'Рынки')],
    ['/about', t('About', 'О нас')],
    ['/contact', t('Contact', 'Обсудим')],
  ];
  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={() => document.getElementById('main')?.focus({ preventScroll: true })}
      >
        {t('Skip to content', 'Перейти к содержимому')}
      </a>
      <header className="counter-header">
        <div className="counter-header-inner">
          <Brand />
          <nav className="counter-nav" aria-label={t('Main navigation', 'Основная навигация')}>
            {links.map(([path, label]) => (
              <Link
                key={path}
                to={path}
                aria-current={
                  location.pathname === path || location.pathname.startsWith(path + '/')
                    ? 'page'
                    : undefined
                }
              >
                <i className="nav-eyelet" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="counter-header-tools">
            <Link className="counter-header-brief" to="/find-a-partner">
              {t('Start a brief', 'Составить бриф')}
              <SignatureArrow />
            </Link>
            <button
              className="counter-language"
              onClick={() => setLanguage(language === 'en' ? 'ru' : 'en')}
              aria-label={t('Switch to Russian', 'Переключить на английский')}
            >
              {language.toUpperCase()}
            </button>
            <button
              className="counter-quick"
              onClick={() => setCommand(true)}
              aria-label={t('Open quick navigation', 'Открыть быструю навигацию')}
              aria-keyshortcuts="Meta+K Control+K"
            >
              <NavigationGlyph search />
              <kbd>
                <Command size={11} /> K
              </kbd>
            </button>
            <button
              className="counter-menu-toggle"
              onClick={() => setMenu(true)}
              aria-label={t('Open menu', 'Открыть меню')}
              aria-expanded={menu}
              aria-controls="mobile-navigation"
            >
              <NavigationGlyph />
            </button>
          </div>
        </div>
      </header>
      <Dialog
        open={menu}
        onClose={() => setMenu(false)}
        title={t('Navigation', 'Навигация')}
        className="mobile-menu counter-menu"
      >
        <Brand />
        <div className="mobile-intents">
          <Link to="/find-a-partner" onClick={() => setMenu(false)}>
            <small>I NEED</small>
            <span>{t('Find a partner', 'Найти партнёра')}</span>
            <SignatureArrow />
          </Link>
          <Link to="/join" onClick={() => setMenu(false)}>
            <small>I OFFER</small>
            <span>{t('Join the network', 'Стать партнёром')}</span>
            <SignatureArrow />
          </Link>
        </div>
        <nav
          className="mobile-menu-links"
          id="mobile-navigation"
          aria-label={t('Mobile navigation', 'Мобильная навигация')}
        >
          {links.map(([path, label]) => (
            <div key={path}>
              <Link
                to={path}
                aria-current={location.pathname === path ? 'page' : undefined}
                onClick={() => setMenu(false)}
              >
                <i className="nav-eyelet" aria-hidden="true" />
                {label}
                <SignatureArrow />
              </Link>
            </div>
          ))}
        </nav>
        <button
          className="mobile-search"
          onClick={() => {
            setMenu(false);
            setCommand(true);
          }}
        >
          <Search size={18} />
          {t('Search the network', 'Поиск по сети')}
        </button>
      </Dialog>
      <CommandMenu open={command} onClose={() => setCommand(false)} />
    </>
  );
}

export function Footer() {
  const { t } = useLocale();
  return (
    <footer className="counter-footer counter-dark">
      <div className="counter-footer-inner">
        <div className="counter-footer-main">
          <div className="counter-footer-statement">
            <Brand />
            <p>
              {t('Good business starts', 'Хороший бизнес начинается')}
              <em>{t('with the right people.', 'с нужных людей.')}</em>
            </p>
            <a href="mailto:hello@vladdos.com">
              hello@vladdos.com
              <SignatureArrow />
            </a>
          </div>
          <nav aria-label={t('Footer navigation', 'Навигация в подвале')}>
            <div>
              <span className="folio">{t('EXPLORE', 'ИЗУЧИТЬ')}</span>
              <Link to="/network">{t('The network', 'Как работает сеть')}</Link>
              <Link to="/industries">{t('Industries', 'Индустрии')}</Link>
              <Link to="/markets">{t('Markets', 'Рынки')}</Link>
              <Link to="/about">{t('About us', 'О нас')}</Link>
            </div>
            <div>
              <span className="folio">{t('CONNECT', 'СВЯЗАТЬСЯ')}</span>
              <Link to="/find-a-partner">
                {t('Find a partner', 'Найти партнёра')}
                <SignatureArrow />
              </Link>
              <Link to="/join">
                {t('Join the network', 'Стать партнёром')}
                <SignatureArrow />
              </Link>
              <Link to="/contact">{t('Contact', 'Контакты')}</Link>
              <a
                className="counter-footer-telegram"
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Telegram · @{telegramUsername}</span>
                <SignatureArrow />
              </a>
              <Link to="/knowledge">{t('Field notes', 'Материалы')}</Link>
            </div>
          </nav>
        </div>
        <EditorialRule />
        <div className="counter-footer-baseline">
          <span>© {new Date().getUTCFullYear()} VlaDDoS Network</span>
          <span className="counter-footer-geography">
            ASIA <i /> LATAM <i /> AFRICA
          </span>
          <div>
            <Link to="/privacy">{t('Privacy', 'Конфиденциальность')}</Link>
            <Link to="/terms">{t('Terms', 'Условия')}</Link>
            <button
              aria-label={t('Back to top', 'Вернуться наверх')}
              onClick={() => {
                window.scrollTo({
                  top: 0,
                  behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                    ? 'instant'
                    : 'smooth',
                });
                document.getElementById('main')?.focus({ preventScroll: true });
              }}
            >
              <SignatureArrow direction="up" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function RouteEffects() {
  const location = useLocation();
  const { language } = useLocale();
  const { data } = useGrowth();
  const previousScrollLocation = useRef<typeof location | null>(null);
  useEffect(() => {
    const path = location.pathname.replace(/\/+$/, '') || '/';
    const metadata = networkMeta(path, language);
    const article = data.articles.find((g) => '/knowledge/' + g.slug === location.pathname);
    if (article) {
      metadata.title = (language === 'ru' ? article.titleRu : article.title) + ' — VlaDDoS Network';
      metadata.description = language === 'ru' ? article.summaryRu : article.summary;
    }
    document.title = metadata.title;
    for (const selector of ['meta[name="description"]', 'meta[property="og:description"]'])
      document.querySelector(selector)?.setAttribute('content', metadata.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', metadata.title);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', metadata.title);
    document
      .querySelector('meta[name="twitter:description"]')
      ?.setAttribute('content', metadata.description);
    document
      .querySelector('meta[property="og:locale"]')
      ?.setAttribute('content', language === 'ru' ? 'ru_RU' : 'en_US');
    document
      .querySelector('meta[property="og:type"]')
      ?.setAttribute('content', article ? 'article' : 'website');
    if (data.origin) {
      const url = data.origin + path + (language === 'ru' ? '?lang=ru' : '');
      document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
      document.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
      for (const alternate of document.querySelectorAll<HTMLLinkElement>(
        'link[rel="alternate"][hreflang]',
      ))
        alternate.href = data.origin + path + (alternate.hreflang === 'ru' ? '?lang=ru' : '');
      // Server JSON-LD belongs to the full document and must not describe a previous SPA route.
      const structured = document.querySelector('script[type="application/ld+json"]');
      if (structured)
        structured.textContent = JSON.stringify({
          '@context': 'https://schema.org',
          '@type': article ? 'Article' : 'WebPage',
          name: metadata.title,
          description: metadata.description,
          url,
          inLanguage: language,
          ...(article
            ? {
                headline: language === 'ru' ? article.titleRu : article.title,
                datePublished: article.publishedAt,
                dateModified: article.updatedAt,
                author: { '@type': 'Organization', name: article.author },
              }
            : {}),
        });
    }
    document.querySelector('meta[name="robots"]')?.remove();
    if (metadata.noindex && !article) {
      const meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = 'noindex, nofollow';
      document.head.appendChild(meta);
    }
  }, [location.pathname, language, data]);
  useEffect(() => {
    const timer = window.setTimeout(() => recordPage(location.pathname), 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);
  useEffect(() => {
    const previous = previousScrollLocation.current;
    previousScrollLocation.current = location;
    if (
      previous &&
      previous.pathname === location.pathname &&
      previous.hash === location.hash &&
      previous.search !== location.search
    )
      return;
    const scroll = () => {
      if (previous && previous.pathname !== location.pathname)
        document.getElementById('main')?.focus({ preventScroll: true });
      if (location.hash)
        document.getElementById(location.hash.slice(1))?.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'instant'
            : 'smooth',
        });
      else window.scrollTo({ top: 0, behavior: 'instant' });
    };
    const frame = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(frame);
  }, [location.pathname, location.hash, location.search, location.key]);
  return null;
}
