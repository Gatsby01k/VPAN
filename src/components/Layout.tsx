import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Command, Menu, Search } from 'lucide-react';
import { Brand, Dialog } from './UI';
import { useLocale } from '../locale';
import { markets, pageMeta } from '../data';
import { useGrowth } from '../growth';
import { recordPage } from './acquisition';
import { regions, regionName } from '../geography';

function CommandMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { language, t } = useLocale();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const items = [
    {
      title: t('Partner guides', 'Практика партнёрства'),
      subtitle: t('Research and working checklists', 'Материалы и рабочие чек-листы'),
      path: '/knowledge',
    },
    {
      title: t('Build your partner profile', 'Собрать партнёрский профиль'),
      subtitle: t('Role, countries and payment methods', 'Роль, страны и методы'),
      path: '/#forge',
    },
    {
      title: t('Partnership directions', 'Направления сотрудничества'),
      subtitle: t('Find your place', 'Найдите своё направление'),
      path: '/#partners',
    },
    {
      title: t('Markets', 'Рынки'),
      subtitle: t('Regions, countries and local methods', 'Регионы, страны и локальные методы'),
      path: '/markets',
    },
    {
      title: t('Affiliates', 'Аффилиаты'),
      subtitle: t('Bring your connections', 'Приводите партнёров'),
      path: '/affiliates',
    },
    {
      title: t('Payment teams', 'Платёжные команды'),
      subtitle: t('Local experience', 'Локальная экспертиза'),
      path: '/teams',
    },
    {
      title: t('Payment partners', 'Платёжные партнёры'),
      subtitle: 'PSP / Local solutions',
      path: '/payment-partners',
    },
    {
      title: t('Merchants', 'Мерчанты'),
      subtitle: t('Discuss your requirements', 'Обсудите требования'),
      path: '/merchants',
    },
    {
      title: t('Apply for partnership', 'Подать заявку'),
      subtitle: t('Start a conversation', 'Начните разговор'),
      path: '/apply',
    },
    {
      title: t('About PAN', 'О PAN'),
      subtitle: t('Our principles', 'Наши принципы'),
      path: '/about',
    },
    ...regions.map((region) => ({
      title: t(region.name, region.ru),
      subtitle: t('Region / browse countries', 'Регион / страны'),
      path: `/markets?region=${region.id}`,
    })),
    ...markets.map((m) => ({
      title: t(m.name, m.ru),
      subtitle: `${t('Country', 'Страна')} / ${regionName(m.region, language)} / ${m.currency}`,
      path: `/markets/${m.slug}`,
    })),
  ];
  const filtered = items.filter((i) =>
    `${i.title} ${i.subtitle}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );
  useEffect(() => {
    if (open) setQuery('');
  }, [open]);
  const go = (path: string) => {
    onClose();
    navigate(path);
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t('Quick navigation', 'Быстрая навигация')}
      className="command-dialog"
    >
      <div className="command-search">
        <Search size={20} />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && filtered[0]) go(filtered[0].path);
          }}
          placeholder={t('Where would you like to go?', 'Куда хотите перейти?')}
          aria-label={t('Search pages, regions and countries', 'Поиск страниц, регионов и стран')}
        />
        <kbd>ESC</kbd>
      </div>
      <div className="command-results">
        {filtered.length ? (
          filtered.map((i) => (
            <button key={i.path} onClick={() => go(i.path)}>
              <span>
                <strong>{i.title}</strong>
                <small>{i.subtitle}</small>
              </span>
              <ArrowUpRight size={18} />
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
        <Command size={12} /> K <span>{t('to open anywhere', 'из любого раздела')}</span>
      </div>
    </Dialog>
  );
}

export function Header() {
  const { language, setLanguage, t } = useLocale();
  const location = useLocation();
  const [menu, setMenu] = useState(false);
  const [command, setCommand] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [onArtwork, setOnArtwork] = useState(false);
  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 24);
      setOnArtwork(
        [...document.querySelectorAll('.scene-art')].some((scene) => {
          const box = scene.getBoundingClientRect();
          return box.top <= 84 && box.bottom > 84;
        }),
      );
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [location.pathname]);
  useEffect(() => {
    setMenu(false);
  }, [location.pathname, location.hash]);
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
    ['/#connection', t('Network', 'Сеть')],
    ['/markets', t('Markets', 'Рынки')],
    ['/about', t('Our story', 'О нас')],
    ['/apply', t('Let’s talk', 'Обсудим')],
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
      <header
        className={`site-header ${location.pathname === '/' ? 'is-deck-home' : ''} ${scrolled ? 'is-scrolled' : ''} ${onArtwork ? 'on-artwork' : ''}`}
      >
        <div className="header-inner wrap">
          <Brand />
          <nav className="desktop-nav" aria-label={t('Main navigation', 'Основная навигация')}>
            {links.map(([path, label]) =>
              path.includes('#') ? (
                <Link
                  key={path}
                  to={path}
                  aria-current={
                    location.pathname === '/' && location.hash === '#connection'
                      ? 'location'
                      : undefined
                  }
                >
                  {label}
                  {path === '/apply' && <ArrowUpRight size={17} aria-hidden="true" />}
                </Link>
              ) : (
                <NavLink key={path} to={path}>
                  {label}
                  {path === '/apply' && <ArrowUpRight size={17} aria-hidden="true" />}
                </NavLink>
              ),
            )}
          </nav>
          <div className="header-tools">
            <button
              className="language-button"
              onClick={() => setLanguage(language === 'en' ? 'ru' : 'en')}
              aria-label={t('Switch to Russian', 'Переключить на английский')}
            >
              {language.toUpperCase()}
            </button>
            <button
              className="icon-button command-trigger"
              onClick={() => setCommand(true)}
              aria-label={t('Open quick navigation', 'Открыть быструю навигацию')}
              aria-keyshortcuts="Meta+K Control+K"
            >
              <Search size={20} strokeWidth={1.6} />
            </button>
            <button
              className="icon-button mobile-toggle"
              onClick={() => setMenu(true)}
              aria-label={t('Open menu', 'Открыть меню')}
              aria-expanded={menu}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>
      <Dialog
        open={menu}
        onClose={() => setMenu(false)}
        title={t('Navigation', 'Навигация')}
        className="mobile-menu"
      >
        <Brand />
        <div className="mobile-menu-links">
          {links.map(([path, label], index) => (
            <div key={path}>
              <Link to={path} onClick={() => setMenu(false)}>
                <small>0{index + 1}</small>
                {label}
                <ArrowUpRight size={27} />
              </Link>
            </div>
          ))}
          <Link to="/apply" onClick={() => setMenu(false)} className="mobile-menu-apply">
            {t('Take the other end', 'Возьмите другой конец')}
            <ArrowUpRight size={28} />
          </Link>
        </div>
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
    <footer className="editorial-footer wrap">
      <Link to="/" className="folio">
        VlaDDoS Network / PAN
      </Link>
      <nav aria-label={t('Footer navigation', 'Навигация в подвале')}>
        <Link to="/knowledge">{t('Field notes', 'Материалы')}</Link>
        <Link to="/privacy">{t('Privacy', 'Конфиденциальность')}</Link>
        <Link to="/terms">{t('Terms', 'Условия')}</Link>
        <a href="mailto:hello@vladdos.com">hello@vladdos.com</a>
      </nav>
      <span>© {new Date().getUTCFullYear()}</span>
    </footer>
  );
}

export function RouteEffects() {
  const location = useLocation();
  const { language } = useLocale();
  const { data } = useGrowth();
  const previousScrollLocation = useRef<typeof location | null>(null);
  useEffect(() => {
    const metadata = pageMeta(location.pathname.replace(/\/$/, '') || '/', language);
    const article = data.articles.find((g) => '/knowledge/' + g.slug === location.pathname);
    if (article) {
      metadata.title = (language === 'ru' ? article.titleRu : article.title) + ' — PAN';
      metadata.description = language === 'ru' ? article.summaryRu : article.summary;
    }
    document.title = metadata.title;
    for (const selector of ['meta[name="description"]', 'meta[property="og:description"]'])
      document.querySelector(selector)?.setAttribute('content', metadata.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', metadata.title);
    if (data.origin) {
      const url = data.origin + location.pathname + (language === 'ru' ? '?lang=ru' : '');
      document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
      document.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
      for (const alternate of document.querySelectorAll<HTMLLinkElement>(
        'link[rel="alternate"][hreflang]',
      ))
        alternate.href =
          data.origin + location.pathname + (alternate.hreflang === 'ru' ? '?lang=ru' : '');
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
    if (location.pathname === '/admin') {
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
