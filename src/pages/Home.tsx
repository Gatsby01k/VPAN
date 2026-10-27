import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { useLocale } from '../locale';
import { type RoleId } from '../data';
import { BriefStudio } from '../components/BriefStudio';
import { partnerProfileQuery, restorePartnerProfile } from '../components/partner-profile';
import { SceneArt, SceneFoot, ThreadLink, ExchangeScene } from '../components/Editorial';
import { KnowledgeTeaser } from '../components/KnowledgeTeaser';

export default function Home() {
  const { t } = useLocale();
  const [params] = useSearchParams();
  const query = partnerProfileQuery(params);
  const [role, setRole] = useState<RoleId>('provider');
  useEffect(() => {
    setRole(restorePartnerProfile(new URLSearchParams(query)).role);
  }, [query]);
  const entries = [
    {
      id: 'affiliate' as const,
      title: t('Affiliates', 'Аффилиаты'),
      text: t('Introduce the right people.', 'Знакомьте с нужными людьми.'),
    },
    {
      id: 'provider' as const,
      title: t('Payment partners', 'Платёжные партнёры'),
      text: t('Bring your payment expertise.', 'Привносите платёжный опыт.'),
    },
    {
      id: 'merchant' as const,
      title: t('Businesses', 'Бизнес'),
      text: t('Find the right connection.', 'Находите подходящие связи.'),
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
            iGaming <span>·</span> Exchange <span>·</span> {t('Connections.', 'Связи.')}
          </p>
          <ThreadLink to="/#connection">{t('Meet the network', 'Знакомьтесь с сетью')}</ThreadLink>
        </div>
        <div className="hero-follow">
          <span className="folio">VlaDDoS Network</span>
          <i>/</i>
          <Link to="/#connection">
            {t('Follow the thread', 'Следуйте за нитью')}
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
            {t('Every connection', 'У каждой связи')}
            <span>
              {t('has ', 'есть ')}
              <em>{t('another end.', 'другой конец.')}</em>
            </span>
          </h2>
          <p className="scene-subtitle">{t('Where do you fit in?', 'Где ваше место?')}</p>
          <div
            className="connection-roles"
            role="group"
            aria-label={t('Your place in the network', 'Ваше место в сети')}
          >
            {entries.map((entry, i) => (
              <div key={entry.id} className={role === entry.id ? 'is-selected' : ''}>
                <button aria-pressed={role === entry.id} onClick={() => setRole(entry.id)}>
                  <small>0{i + 1}</small>
                  {entry.title}
                  <ArrowUpRight size={17} />
                </button>
                <p>{entry.text}</p>
                {role === entry.id && (
                  <Link to={`/apply?role=${role}`}>
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
        <SceneFoot number="02" label="THE CONNECTION">
          <span className="folio">AFRICA / LATAM / ASIA</span>
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
            {entries.map((entry, i) => (
              <Link
                to={
                  entry.id === 'affiliate'
                    ? '/affiliates'
                    : entry.id === 'provider'
                      ? '/payment-partners'
                      : '/merchants'
                }
                key={entry.id}
              >
                <small>0{i + 1}</small>
                <span>{entry.title}</span>
                <ArrowUpRight />
              </Link>
            ))}
          </div>
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
          <h3>{t('Know the right people?', 'Знаете нужных людей?')}</h3>
          <p>
            {t(
              'Tell us who you can connect, where they work and what they bring.',
              'Расскажите, кого можете представить, где они работают и что предлагают.',
            )}
          </p>
          <ol>
            <li>{t('Outline the opportunity', 'Обозначьте возможность')}</li>
            <li>{t('Agree the terms', 'Согласуйте условия')}</li>
            <li>{t('Make the introduction', 'Организуйте знакомство')}</li>
          </ol>
          <ThreadLink to="/#forge">{t('Build my brief', 'Собрать бриф')}</ThreadLink>
          <small>{t('Terms come before introductions.', 'Условия согласуем до знакомства.')}</small>
        </aside>
        <SceneFoot number="03" label="THE PEOPLE">
          <Link to="/markets">
            {t('Explore markets', 'Изучить рынки')}
            <ArrowUpRight size={17} />
          </Link>
          <a href="mailto:hello@vladdos.com">hello@vladdos.com</a>
        </SceneFoot>
      </section>
      <ExchangeScene />
      <div id="forge" className="editorial-brief">
        <BriefStudio role={role} onRole={setRole} />
      </div>
      <div className="editorial-guides">
        <KnowledgeTeaser />
      </div>
      <section className="editorial-invitation wrap">
        <span className="folio">06 / YOUR NEXT CONNECTION</span>
        <h2>
          {t('Take the', 'Возьмите')} <em>{t('other end.', 'другой конец.')}</em>
        </h2>
        <ThreadLink to={`/apply?role=${role}`}>
          {t('Start a conversation', 'Начать разговор')}
        </ThreadLink>
      </section>
    </div>
  );
}
