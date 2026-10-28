import { useState } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { useLocale } from '../locale';
import { NLink as Link } from '../components/NetworkLayout';
import { ConnectionStudio } from '../components/ConnectionStudio';
import { SceneArt, SceneFoot, ThreadLink, ExchangeScene } from '../components/Editorial';
import { KnowledgeTeaser } from '../components/KnowledgeTeaser';
import { regions } from '../network';
import { scenarioLink } from '../brief';

export default function Home() {
  const { t } = useLocale();
  const [side, setSide] = useState<'need' | 'offer'>('need');
  const [intentExplicit, setIntentExplicit] = useState(false);
  const chooseSide = (next: 'need' | 'offer', explicit = true) => {
    setSide(next);
    if (explicit) setIntentExplicit(true);
  };
  const entries = [
    {
      id: 'need' as const,
      title: 'I NEED',
      text: t(
        'Find a partner for a specific business need.',
        'Найдите партнёра под конкретную задачу.',
      ),
    },
    {
      id: 'offer' as const,
      title: 'I OFFER',
      text: t('Introduce your company and capabilities.', 'Представьте компанию и её возможности.'),
    },
  ];
  const participants = [
    {
      id: 'psp',
      title: t('PSPs & aggregators', 'PSP и агрегаторы'),
      path: scenarioLink('psp', 'offer'),
    },
    {
      id: 'merchant',
      title: t('Merchants & operators', 'Мерчанты и операторы'),
      path: scenarioLink('merchant', 'need'),
    },
    {
      id: 'local-partner',
      title: t('Local payment partners', 'Локальные партнёры'),
      path: scenarioLink('local-partner', 'offer'),
    },
  ];
  return (
    <div className="editorial-home">
      <section className="editorial-scene hero-scene" aria-labelledby="hero-title">
        <SceneArt name="hero" priority />
        <div className="scene-copy hero-copy">
          <h1 className="editorial-title" id="hero-title">
            <span>{t('The other', 'Другая')}</span>
            <em>{t('side.', 'сторона.')}</em>
          </h1>
          <p className="hero-subtitle">
            {t('Independent B2B partnership network.', 'Независимая B2B-партнёрская сеть.')}
          </p>
          <p className="hero-network-context">
            {t(
              'Connecting international businesses with payment providers, local operators and commercial partners across Asia, LATAM and Africa.',
              'Соединяем международный бизнес с платёжными провайдерами, локальными операторами и коммерческими партнёрами в Азии, LATAM и Африке.',
            )}
            <span>ASIA / LATAM / AFRICA</span>
          </p>
          <ThreadLink to="/#connection">{t('Meet the network', 'Знакомьтесь с сетью')}</ThreadLink>
          <div className="hero-network-actions">
            <Link to="/find-a-partner">
              I NEED <ArrowUpRight size={15} />
            </Link>
            <Link to="/join">
              I OFFER <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
        <div className="hero-follow">
          <span className="folio">VlaDDoS Network</span>
          <i>/</i>
          <Link to="/#connection">
            {t('How it works', 'Как это работает')}
            <ArrowDown size={16} />
          </Link>
        </div>
      </section>
      <section
        className="editorial-scene connection-scene"
        id="connection"
        aria-labelledby="connection-title"
      >
        <SceneArt name="connection" />
        <div className="scene-copy connection-copy">
          <h2 className="editorial-title" id="connection-title">
            {t('A clear brief.', 'Понятная задача.')}
            <span>
              <em>{t('A relevant partner.', 'Подходящий партнёр.')}</em>
            </span>
          </h2>
          <p className="scene-subtitle">{t('What brings you here?', 'С чем вы приходите?')}</p>
          <div
            className="connection-roles"
            role="group"
            aria-label={t('Your place in the network', 'Ваше место в сети')}
          >
            {entries.map((entry, i) => (
              <div key={entry.id} className={side === entry.id ? 'is-selected' : ''}>
                <button aria-pressed={side === entry.id} onClick={() => chooseSide(entry.id)}>
                  <small>0{i + 1}</small>
                  {entry.title}
                  <ArrowUpRight size={17} />
                </button>
                <p>{entry.text}</p>
                {side === entry.id && (
                  <Link to={side === 'need' ? '/find-a-partner' : '/join'}>
                    {t('Continue', 'Продолжить')}
                    <ArrowUpRight size={16} />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
        <span className="connection-you folio" aria-hidden="true">
          {t('YOU', 'ВЫ')}
        </span>
        <SceneFoot number="02" label={t('THE CONNECTION', 'СВЯЗЬ')}>
          <nav className="scene-regions" aria-label={t('Regions', 'Регионы')}>
            {regions.map((region) => (
              <Link key={region.id} to={`/markets?region=${region.id}`}>
                {t(region.en, region.ru)}
              </Link>
            ))}
          </nav>
          <Link to="/markets">
            {t('Explore markets', 'Изучить рынки')}
            <ArrowUpRight size={17} />
          </Link>
          <a href="mailto:hello@vladdos.com">hello@vladdos.com</a>
        </SceneFoot>
      </section>
      <section
        className="editorial-scene people-scene"
        id="partners"
        aria-labelledby="people-title"
      >
        <SceneArt name="people" />
        <div className="scene-copy people-copy">
          <h2 className="editorial-title" id="people-title">
            <span>{t('Your place', 'Ваше место')}</span>
            <em>{t('in the network.', 'в сети.')}</em>
          </h2>
          <p className="scene-subtitle">
            {t(
              'Bring a connection, a payment solution or local expertise.',
              'Привносите связи, платёжные решения или локальный опыт.',
            )}
          </p>
          <div className="people-links">
            {participants.map((entry, i) => (
              <Link to={entry.path} key={entry.id}>
                <small>0{i + 1}</small>
                <span>{entry.title}</span>
                <ArrowUpRight />
              </Link>
            ))}
          </div>
          <Link className="people-industries" to="/industries">
            {t('Explore industries', 'Все индустрии')}
            <ArrowUpRight size={17} />
          </Link>
        </div>
        <svg className="people-thread" viewBox="0 0 1586 992" fill="none" aria-hidden="true">
          <path
            d="M101 532C254 533 367 522 467 526C620 524 710 562 865 612"
            stroke="#ff006d"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M104 530C270 533 371 520 476 525C627 527 716 562 862 609"
            stroke="#ffafce"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <circle cx="101" cy="532" r="13" fill="#f6eddf" stroke="#252017" strokeWidth="1.5" />
          <circle cx="101" cy="530" r="8" fill="#fff9e9" />
        </svg>
        <aside className="people-aside">
          <h3>{t('Before we introduce.', 'До знакомства.')}</h3>
          <p>
            {t(
              'We clarify the company, the market and what each side can provide. We introduce people when there is a credible fit.',
              'Уточняем компанию, рынок и возможности каждой стороны. Знакомим людей при обоснованном соответствии.',
            )}
          </p>
          <ol>
            <li>{t('Qualify the opportunity', 'Проверяем возможность')}</li>
            <li>{t('Agree the terms and permission', 'Согласуем условия и разрешение')}</li>
            <li>{t('Arrange the introduction', 'Организуем знакомство')}</li>
          </ol>
          <ThreadLink to="/#forge">{t('Build my brief', 'Собрать бриф')}</ThreadLink>
          <small>{t('Terms come before introductions.', 'Условия согласуем до знакомства.')}</small>
        </aside>
        <SceneFoot number="03" label={t('THE PEOPLE', 'ЛЮДИ')}>
          <Link to="/markets">
            {t('Explore markets', 'Изучить рынки')}
            <ArrowUpRight size={17} />
          </Link>
          <a href="mailto:hello@vladdos.com">hello@vladdos.com</a>
        </SceneFoot>
      </section>
      <div id="forge" className="editorial-brief">
        <ConnectionStudio side={side} onSide={chooseSide} intentExplicit={intentExplicit} />
      </div>
      <ExchangeScene />
      <div className="editorial-guides">
        <KnowledgeTeaser />
      </div>
      <section className="editorial-invitation wrap">
        <span className="folio">06 / {t('YOUR NEXT CONNECTION', 'ВАША СЛЕДУЮЩАЯ СВЯЗЬ')}</span>
        <h2>
          {t('Take the', 'Возьмите')} <em>{t('other end.', 'другой конец.')}</em>
        </h2>
        <ThreadLink to={side === 'need' ? '/find-a-partner' : '/join'}>
          {t('Start a conversation', 'Начать разговор')}
        </ThreadLink>
      </section>
    </div>
  );
}
