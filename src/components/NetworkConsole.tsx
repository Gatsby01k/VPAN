import {
  ArrowUpRight,
  BookOpen,
  FileText,
  Globe2,
  House,
  Network,
  Send,
  UsersRound,
} from 'lucide-react';
import { Crown } from './UI';
import { Link } from 'react-router-dom';
import { markets, roles, type RoleId } from '../data';
import { useLocale } from '../locale';
import { useEffect, useRef, type PointerEvent } from 'react';
import { NetworkOrbit } from './NetworkOrbit';
import { SculptureStage } from './SculptureStage';

const glyphs: Record<string, string[]> = {
  '0': ['01110', '11011', '11011', '11011', '11011', '11011', '01110'],
  '1': ['00110', '01110', '00110', '00110', '00110', '00110', '01111'],
  '2': ['01110', '11011', '00011', '00110', '01100', '11000', '11111'],
  '3': ['11110', '00011', '00011', '01110', '00011', '00011', '11110'],
  '4': ['00011', '00111', '01111', '11011', '11111', '00011', '00011'],
  '5': ['11111', '11000', '11000', '11110', '00011', '00011', '11110'],
  '6': ['01110', '11000', '11000', '11110', '11011', '11011', '01110'],
  '7': ['11111', '00011', '00110', '00110', '01100', '01100', '01100'],
  '8': ['01110', '11011', '11011', '01110', '11011', '11011', '01110'],
  '9': ['01110', '11011', '11011', '01111', '00011', '00011', '01110'],
};

const regionCount = new Set(markets.map((market) => market.region)).size;

export function DotNumber({ value }: { value: number }) {
  const digits = String(value).padStart(2, '0');
  return (
    <svg
      className="dot-number"
      viewBox={`0 0 ${digits.length * 36 - 6} 42`}
      role="img"
      aria-label={String(value)}
    >
      {digits
        .split('')
        .flatMap((digit, index) =>
          glyphs[digit].flatMap((row, y) =>
            row
              .split('')
              .map((pixel, x) =>
                pixel === '1' ? (
                  <rect
                    key={`${index}-${y}-${x}`}
                    x={index * 36 + x * 6}
                    y={y * 6}
                    width="4.3"
                    height="4.3"
                  />
                ) : null,
              ),
          ),
        )}
    </svg>
  );
}

export function NetworkConsole({ role, onRole }: { role: RoleId; onRole: (role: RoleId) => void }) {
  const { t } = useLocale();
  const workbench = useRef<HTMLDivElement>(null);
  const pointerFrame = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (pointerFrame.current !== null) cancelAnimationFrame(pointerFrame.current);
    },
    [],
  );
  const moveLight = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches)
      return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    if (pointerFrame.current !== null) cancelAnimationFrame(pointerFrame.current);
    pointerFrame.current = requestAnimationFrame(() => {
      workbench.current?.style.setProperty('--scene-x', `${x * 12}px`);
      workbench.current?.style.setProperty('--scene-y', `${y * 8}px`);
      workbench.current?.style.setProperty('--light-x', `${(x + 0.5) * 100}%`);
      workbench.current?.style.setProperty('--light-y', `${(y + 0.5) * 100}%`);
      pointerFrame.current = null;
    });
  };
  const resetLight = () => {
    if (pointerFrame.current !== null) cancelAnimationFrame(pointerFrame.current);
    pointerFrame.current = null;
    workbench.current?.style.setProperty('--scene-x', '0px');
    workbench.current?.style.setProperty('--scene-y', '0px');
  };
  const selected = role === 'team' ? 'provider' : role;
  const currentIndex = roles.findIndex((entry) => entry.id === role);
  const current = roles[currentIndex];
  const entries = [
    { id: 'affiliate', label: t('Affiliates', 'Аффилиаты') },
    { id: 'provider', label: t('Payments', 'Платежи') },
    { id: 'merchant', label: t('Business', 'Бизнес') },
  ] as const;
  return (
    <div
      className="pan-workbench"
      ref={workbench}
      onPointerMove={moveLight}
      onPointerLeave={resetLight}
      data-direction={role}
    >
      <div className="deck-scene">
        <div className="deck-scene-heading">
          <div>
            <span>PRIVATE AFFILIATE NETWORK</span>
            <h1 id="pan-heading">{t('Private Affiliate Network', 'Частная партнёрская сеть')}</h1>
          </div>
          <Link className="deck-round" to="/about" aria-label={t('About PAN', 'О PAN')}>
            <ArrowUpRight size={21} />
          </Link>
        </div>
        <SculptureStage />
        <div className="deck-scene-categories">
          <span>iGaming</span>
          <span>e-commerce</span>
          <span>High-risk</span>
        </div>
        <div className="deck-entry-card" aria-live="polite">
          <div className="deck-entry-heading">
            <span className="deck-entry-icon">
              <UsersRound size={24} strokeWidth={1.3} />
            </span>
            <div>
              <span>{t('Your partnership direction', 'Ваше направление')}</span>
              <h2>{t(current.title, current.ru)}</h2>
            </div>
          </div>
          <p>{t(current.short, current.shortRu)}</p>
          <Link className="deck-entry-action" to={`/apply?role=${role}`}>
            <span>{t('Start a conversation', 'Обсудить партнёрство')}</span>
            <span>
              <ArrowUpRight size={22} />
            </span>
          </Link>
          <small>{t('Terms are agreed individually.', 'Условия согласуем индивидуально.')}</small>
        </div>
        <div className="deck-scene-signature">
          <span>PAN / PARTNER NETWORK</span>
          <span>AFRICA / LATAM / ASIA</span>
        </div>
      </div>
      <div className="deck-instruments">
        <section className="deck-primary" aria-label={t('Network overview', 'Обзор сети')}>
          <div className="deck-widget-heading">
            <div>
              <h2>{t('Your network.', 'Ваша сеть.')}</h2>
              <p>{t('Find your partnership direction', 'Найдите своё направление')}</p>
            </div>
            <Link
              className="deck-round"
              to="/#partners"
              aria-label={t('Explore partnership directions', 'Посмотреть направления партнёрства')}
            >
              <ArrowUpRight size={20} />
            </Link>
          </div>
          <NetworkOrbit role={role} />
          <div className="deck-reading deck-reading-left">
            <DotNumber value={markets.length} />
            <span>{t('Markets', 'Рынков')}</span>
          </div>
          <div className="deck-reading deck-reading-right">
            <DotNumber value={roles.length} />
            <span>{t('Partner roles', 'Форматов')}</span>
          </div>
          <svg className="deck-signal" viewBox="0 0 500 95" fill="none" aria-hidden="true">
            <path
              className="deck-signal-shadow"
              d="M0 70C50 68 75 22 135 22S232 82 289 61 410 15 500 33"
            />
            <path d="M0 58C49 58 60 37 102 37S172 69 224 57 282 16 332 28 389 75 438 52 472 43 500 43" />
            <circle cx="102" cy="37" r="3.6" />
            <circle cx="224" cy="57" r="3.6" />
            <circle cx="332" cy="28" r="3.6" />
            <circle cx="438" cy="52" r="3.6" />
          </svg>
          <div className="deck-scale" aria-hidden="true" />
          <div
            className="deck-segments"
            role="group"
            aria-label={t('Choose your partnership direction', 'Выбрать направление партнёрства')}
          >
            {entries.map(({ id, label }) => (
              <button
                type="button"
                key={id}
                aria-pressed={selected === id}
                onClick={() => onRole(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </section>
        <div className="deck-stat-row">
          <Link className="deck-stat" to="/markets">
            <span className="deck-stat-heading">
              <span className="deck-stat-icon">
                <Globe2 size={24} strokeWidth={1.2} />
              </span>
              <span>
                <strong>{t('Regions', 'Регионы')}</strong>
                <small>{t('Local expertise', 'Локальная экспертиза')}</small>
              </span>
            </span>
            <span className="deck-stat-number">
              <DotNumber value={regionCount} />
              <span>GEO</span>
            </span>
            <span className="deck-stat-label">Africa / LATAM / Asia</span>
          </Link>
          <Link className="deck-stat deck-stat-profile" to="/#forge">
            <span className="deck-stat-heading">
              <span className="deck-stat-icon">
                <FileText size={23} strokeWidth={1.2} />
              </span>
              <span>
                <strong>{t('Your profile', 'Ваш профиль')}</strong>
                <small>{t('Ready for a conversation', 'Основа для знакомства')}</small>
              </span>
            </span>
            <span className="deck-stat-number">
              <DotNumber value={currentIndex + 1} />
              <span>/ 05</span>
            </span>
            <span className="deck-stat-label">
              {t(current.title, current.ru)}
              <ArrowUpRight size={14} />
            </span>
          </Link>
        </div>
        <section
          className="deck-geography"
          aria-label={t('Explore local markets', 'Знакомство с рынками')}
        >
          <div className="deck-geography-heading">
            <span>
              <span className="deck-pink-dot" />
              {t('Connections without borders', 'Связи без границ')}
            </span>
            <Link to="/markets" aria-label={t('All markets', 'Все рынки')}>
              <ArrowUpRight size={17} />
            </Link>
          </div>
          <svg className="deck-route-visual" viewBox="0 0 500 110" fill="none" aria-hidden="true">
            <path d="M58 74 158 27 260 68 353 24 447 69" />
            <path d="M58 74 260 68 447 69M158 27 353 24M158 27 447 69M58 74 353 24" />
            <circle cx="58" cy="74" r="6" />
            <circle cx="158" cy="27" r="5" />
            <circle cx="260" cy="68" r="9" />
            <circle cx="353" cy="24" r="5" />
            <circle cx="447" cy="69" r="6" />
          </svg>
          <div className="deck-market-pills">
            {['ghana', 'kenya', 'india'].map((slug) => {
              const market = markets.find((m) => m.slug === slug)!;
              return (
                <Link key={slug} to={`/markets/${slug}`}>
                  <b>{market.code}</b>
                  {t(market.name, market.ru)}
                  <ArrowUpRight size={12} />
                </Link>
              );
            })}
          </div>
        </section>
      </div>
      <aside className="deck-rail">
        <Link className="deck-rail-brand" to="/about" aria-label={t('About PAN', 'О PAN')}>
          <Crown />
        </Link>
        <nav aria-label={t('Network navigation', 'Навигация по сети')}>
          <Link className="is-active" to="/" aria-label={t('Home', 'Главная')} aria-current="page">
            <House size={23} strokeWidth={1.3} />
          </Link>
          <Link to="/#partners" aria-label={t('Partnerships', 'Сотрудничество')}>
            <Network size={23} strokeWidth={1.3} />
          </Link>
          <Link to="/markets" aria-label={t('Markets', 'Рынки')}>
            <Globe2 size={23} strokeWidth={1.3} />
          </Link>
          <Link
            className="deck-rail-star"
            to={`/apply?role=${role}`}
            aria-label={t('Apply for partnership', 'Подать заявку')}
          >
            <span aria-hidden="true">✦</span>
          </Link>
          <Link to="/knowledge" aria-label={t('Partner guides', 'Материалы для партнёров')}>
            <BookOpen size={22} strokeWidth={1.3} />
          </Link>
          <Link to="/#forge" aria-label={t('Build your brief', 'Собрать бриф')}>
            <FileText size={22} strokeWidth={1.3} />
          </Link>
        </nav>
        <a
          className="deck-rail-contact"
          href="https://t.me/PAN_Affiliate"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('Contact PAN on Telegram', 'Написать PAN в Telegram')}
        >
          <Send size={21} strokeWidth={1.3} />
        </a>
      </aside>
    </div>
  );
}
