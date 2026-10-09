import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { ArrowDown, ArrowUpRight, Check, Plus } from 'lucide-react';
import { Action, Crown, Eyebrow, Reveal } from '../components/UI';
import { RouteForge } from '../components/RouteForge';
import { useLocale } from '../locale';
import { markets, roles, type RoleId } from '../data';

function Hero({ role, onRole }: { role: RoleId; onRole: (id: RoleId) => void }) {
  const { t } = useLocale();
  const reduced = useReducedMotion();
  const x = useMotionValue(0),
    y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 80, damping: 22 });
  const sy = useSpring(y, { stiffness: 80, damping: 22 });
  return (
    <section className="pan-hero">
      <div className="pan-hero-floor" aria-hidden="true" />
      <div className="wrap pan-hero-inner">
        <div className="pan-hero-top">
          <Eyebrow>PRIVATE AFFILIATE NETWORK</Eyebrow>
          <span>PEOPLE. PAYMENTS. POSSIBILITIES.</span>
        </div>
        <div className="pan-hero-grid">
          <div className="pan-hero-copy">
            <span className="hero-stamp">HIGH-RISK / HIGH STANDARDS</span>
            <h1>
              <span>{t('CONNECTIONS', 'СВЯЗИ')}</span>
              <span className="hero-impact gold-text">{t('MAKE MOVES.', 'РЕШАЮТ.')}</span>
            </h1>
            <div className="hero-handwritten" aria-hidden="true">
              {t('It starts with your people.', 'Всё начинается с людей.')}
              <svg viewBox="0 0 180 24">
                <path d="m2 16 42-5 41 5 40-8 52 6M163 3l14 11-18 8" />
              </svg>
            </div>
            <p>
              {t(
                'Affiliates, PSPs and merchants. A private network for the people behind iGaming, e-commerce and high-risk payments.',
                'Аффилиаты, PSP и мерчанты. Закрытая сеть для тех, кто стоит за iGaming, e-commerce и high-risk платежами.',
              )}
            </p>
            <div className="pan-hero-actions">
              <Action to="/#forge">{t('Build my route', 'Собрать мой маршрут')}</Action>
              <Link to="/#partners" className="text-link">
                {t('Find my side', 'Найти свою роль')}
                <ArrowDown size={16} />
              </Link>
            </div>
          </div>
          <div
            className="mascot-stage"
            onPointerMove={(e) => {
              if (reduced || e.pointerType !== 'mouse') return;
              const r = e.currentTarget.getBoundingClientRect();
              x.set((e.clientX - r.left - r.width / 2) * 0.025);
              y.set((e.clientY - r.top - r.height / 2) * 0.025);
            }}
            onPointerLeave={() => {
              x.set(0);
              y.set(0);
            }}
          >
            <div className="mascot-watermark" aria-hidden="true">
              PAN
            </div>
            <div className="mascot-halo" aria-hidden="true" />
            <motion.img
              className="pan-mascot"
              src="/assets/pan-mascot.webp"
              width="1024"
              height="1024"
              fetchPriority="high"
              alt={t(
                'PAN mascot: a crowned figure with gold PAN rings and magenta paint',
                'Маскот PAN: корона, золотые кольца PAN и брызги magenta',
              )}
              style={reduced ? undefined : { x: sx, y: sy }}
            />
            <span className="mascot-tag">
              <Crown />
              {t('THE PAN CHARACTER', 'ХАРАКТЕР PAN')}
            </span>
            <span className="mascot-signature" aria-hidden="true">
              PRIVATE
              <br />
              <b>BY DESIGN.</b>
            </span>
          </div>
        </div>
        <div className="hero-role-rail">
          <span>
            {t('WHERE DO YOU FIT?', 'НА ЧЬЕЙ ВЫ СТОРОНЕ?')}
            <ArrowUpRight size={15} />
          </span>
          <div role="group" aria-label={t('Choose your side', 'Выберите свою роль')}>
            {roles.slice(0, 4).map((r) => (
              <button key={r.id} aria-pressed={role === r.id} onClick={() => onRole(r.id)}>
                {role === r.id && <Check size={13} />}
                {r.id === 'provider' ? 'PSP' : t(r.title, r.ru)}
              </button>
            ))}
          </div>
          <Link to="/#forge">
            {t('Let’s make a move', 'К вашему маршруту')}
            <ArrowDown size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Network() {
  const { t } = useLocale();
  const [active, setActive] = useState<RoleId>('affiliate');
  const current = roles.find((r) => r.id === active)!;
  const propositions = {
    affiliate: [
      t('Introduce the right people', 'Знакомьте нужных людей'),
      t('Agree referral attribution', 'Согласуйте авторство рекомендации'),
      t('Discuss individual commercial terms', 'Обсудите индивидуальные условия'),
    ],
    team: [
      t('Bring local payment experience', 'Привносите местный платёжный опыт'),
      t('Define markets and methods', 'Обозначьте рынки и методы'),
      t('Meet relevant commercial partners', 'Знакомьтесь с подходящими партнёрами'),
    ],
    provider: [
      t('Share your payment capabilities', 'Расскажите о платёжных возможностях'),
      t('Define business categories you support', 'Укажите поддерживаемые категории бизнеса'),
      t('Build focused merchant relationships', 'Развивайте связи с мерчантами'),
    ],
    merchant: [
      t('Describe your business and GEOs', 'Опишите бизнес и географию'),
      t('Outline your payment requirements', 'Обозначьте платёжные требования'),
      t('Discuss suitable PSP introductions', 'Обсудите знакомства с PSP'),
    ],
    regional: [],
  };
  return (
    <section id="partners" className="network-scene section">
      <div className="wrap network-layout">
        <div className="network-intro">
          <Eyebrow number="02">
            {t('THE PEOPLE BEHIND THE NETWORK', 'ЛЮДИ, КОТОРЫЕ СОЗДАЮТ СЕТЬ')}
          </Eyebrow>
          <h2>
            {t('DIFFERENT SIDES.', 'РАЗНЫЕ СТОРОНЫ.')}
            <br />
            <span className="gold-text">{t('ONE PAN.', 'ОДИН PAN.')}</span>
          </h2>
          <p>
            {t(
              'The network works when everyone brings something real: relationships, local knowledge, infrastructure or a business that needs it.',
              'Сеть работает, когда каждый привносит что-то своё: связи, местные знания, инфраструктуру или бизнес, которому всё это нужно.',
            )}
          </p>
          <div className="network-seal" aria-hidden="true">
            <Crown />
            <span>PRIVATE AFFILIATE NETWORK</span>
            <strong>PAN</strong>
          </div>
        </div>
        <div className="network-deck">
          <div
            className="network-role-list"
            role="group"
            aria-label={t('Explore partner roles', 'Посмотреть роли партнёров')}
          >
            {roles.slice(0, 4).map((r, i) => (
              <button aria-pressed={r.id === active} key={r.id} onClick={() => setActive(r.id)}>
                <span>0{i + 1}</span>
                <strong>{t(r.title, r.ru)}</strong>
                {r.id === active ? <MinusMark /> : <Plus size={23} />}
              </button>
            ))}
          </div>
          <div className="network-role-detail" key={active}>
            <span className="workbench-label">PAN / {current.id.toUpperCase()}</span>
            <h3>{t(current.label, current.labelRu)}</h3>
            <p>{t(current.description, current.descriptionRu)}</p>
            <ul>
              {propositions[active].map((line) => (
                <li key={line}>
                  <Check size={13} />
                  {line}
                </li>
              ))}
            </ul>
            <Link to={current.path} className="text-link">
              {t('Inside this partnership', 'Подробнее о партнёрстве')}
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
function MinusMark() {
  return <span className="network-minus" aria-hidden="true" />;
}

function MarketStrip() {
  const { t } = useLocale();
  return (
    <section className="market-strip section wrap">
      <Reveal>
        <div className="forge-heading">
          <div>
            <Eyebrow number="03">
              {t('LOCAL KNOWLEDGE / GLOBAL AMBITION', 'ЛОКАЛЬНЫЕ ЗНАНИЯ / ГЛОБАЛЬНЫЕ АМБИЦИИ')}
            </Eyebrow>
            <h2>
              {t('KNOW THE GROUND.', 'ЗНАТЬ СВОЙ РЫНОК.')}
              <br />
              <span className="gold-text">{t('CHANGE THE GAME.', 'МЕНЯТЬ ПРАВИЛА ИГРЫ.')}</span>
            </h2>
          </div>
          <Link to="/markets" className="text-link">
            {t('Open market explorer', 'Открыть все рынки')}
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </Reveal>
      <div className="market-rail">
        {markets.map((m, i) => (
          <Link key={m.slug} to={`/markets/${m.slug}`} className="market-ticket">
            <span className="market-ticket-top">
              {m.region}
              <ArrowUpRight size={17} />
            </span>
            <span className="market-ticket-code">{m.code}</span>
            <h3>{t(m.name, m.ru)}</h3>
            <p>{m.methods.join(' / ')}</p>
            <span className="market-ticket-bottom">
              {m.currency}
              <small>PAN / {String(i + 1).padStart(2, '0')}</small>
            </span>
          </Link>
        ))}
      </div>
      <span className="market-rail-hint">
        <ArrowUpRight size={14} />
        {t('Explore a market, or build a route above.', 'Изучите рынок или соберите маршрут выше.')}
      </span>
    </section>
  );
}
function Process() {
  const { t } = useLocale();
  const steps = [
    [
      t('MAKE YOUR INTRODUCTION.', 'РАССКАЖИТЕ О СЕБЕ.'),
      t(
        'Your role, markets and ambition. A specific brief gives the conversation direction.',
        'Ваша роль, рынки и цель. Конкретный бриф задаёт направление разговора.',
      ),
    ],
    [
      t('FIND THE COMMON GROUND.', 'НАЙДИТЕ ТОЧКУ СОПРИКОСНОВЕНИЯ.'),
      t(
        'We review fit, experience and the relationships that could be relevant to your business.',
        'Рассматриваем ваш опыт и связи, которые могут быть полезны вашему бизнесу.',
      ),
    ],
    [
      t('AGREE THE NEXT MOVE.', 'СОГЛАСУЙТЕ СЛЕДУЮЩИЙ ШАГ.'),
      t(
        'Responsibilities, attribution and commercial terms. Agreed directly, before collaboration.',
        'Роли, авторство рекомендаций и коммерческие условия. Договариваемся до начала работы.',
      ),
    ],
  ];
  return (
    <section id="process" className="pan-process section">
      <div className="wrap">
        <Eyebrow number="04">{t('THE WAY IN', 'КАК ПОПАСТЬ В СЕТЬ')}</Eyebrow>
        <div className="pan-process-heading">
          <h2>
            {t('NO SECRET HANDSHAKE.', 'БЕЗ ТАЙНЫХ РИТУАЛОВ.')}
            <br />
            <span className="gold-text">{t('A REAL CONVERSATION.', 'ПРЕДМЕТНЫЙ РАЗГОВОР.')}</span>
          </h2>
          <Action to="/apply">{t('Start mine', 'Начать разговор')}</Action>
        </div>
        <div className="pan-process-steps">
          {steps.map(([title, description], i) => (
            <Reveal key={title} delay={i * 0.06}>
              <span className="pan-step-index">
                0{i + 1}
                <Crown />
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
export default function Home() {
  const [role, setRole] = useState<RoleId>('affiliate');
  const [params] = useSearchParams();
  const query = params.get('role');
  useEffect(() => {
    if (roles.some((r) => r.id === query)) setRole(query as RoleId);
  }, [query]);
  return (
    <>
      <Hero role={role} onRole={setRole} />
      <RouteForge role={role} onRole={setRole} />
      <Network />
      <MarketStrip />
      <Process />
    </>
  );
}
