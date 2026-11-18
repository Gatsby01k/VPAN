import { useState } from 'react';
import { useLocale } from '../locale';
import { NLink as Link } from '../components/NetworkLayout';
import { ConnectionStudio } from '../components/ConnectionStudio';
import { ThreadLink } from '../components/Editorial';
import { SignatureArrow } from '../components/ConnectionProtocol';
import { CounterSeal, Engraving, HeroImpression, StitchMark } from '../components/CounterpartArt';
import { KnowledgeTeaser } from '../components/KnowledgeTeaser';
import { ConnectionThread } from '../components/ConnectionThread';
import { PaymentAtlas } from '../components/PaymentAtlas';
import { scenarioLink } from '../brief';
import '../counterpart-home.css';

type Side = 'need' | 'offer';

const intents = [
  ['need', 'I NEED', 'Find a partner', 'Найти партнёра'],
  ['offer', 'I OFFER', 'Join the network', 'Стать партнёром'],
] as const;

const participants = [
  [
    'psp',
    'offer',
    'PSPs & aggregators',
    'PSP и агрегаторы',
    'Local infrastructure and relevant merchant demand.',
    'Локальная инфраструктура и спрос мерчантов.',
    'clasps',
    'Infrastructure',
    'Инфраструктура',
  ],
  [
    'merchant',
    'need',
    'Merchants & operators',
    'Мерчанты и операторы',
    'Acceptance, payouts and local operating partners.',
    'Приём, выплаты и локальные операционные партнёры.',
    'doorway',
    'Market access',
    'Выход на рынок',
  ],
  [
    'local-partner',
    'offer',
    'Local payment partners',
    'Локальные платёжные партнёры',
    'Local methods, operating scope and market knowledge.',
    'Локальные методы, операционные возможности и знание рынка.',
    'map',
    'Local knowledge',
    'Знание рынка',
  ],
] as const;

const milestones = [
  [
    'Qualification',
    'Квалификация',
    'We clarify the company, the market, the need and the capabilities on offer.',
    'Уточняем компанию, рынок, задачу и предлагаемые возможности.',
  ],
  [
    'Permission & terms',
    'Разрешение и условия',
    'We agree what can be shared, who is responsible and how the work is paid.',
    'Согласуем, что можно раскрыть, кто за что отвечает и как оплачивается работа.',
  ],
  [
    'Introduction',
    'Знакомство',
    'When there is a credible fit and permission on both sides, we connect the people involved.',
    'При обоснованном соответствии и согласии обеих сторон знакомим участников.',
  ],
  [
    'Follow-through',
    'Развитие сделки',
    'We follow the discussion and track agreed milestones and outcomes.',
    'Следим за обсуждением, согласованными этапами и результатами.',
  ],
] as const;

export default function Home() {
  const { t } = useLocale();
  const [side, setSide] = useState<Side>('need');
  const [intentExplicit, setIntentExplicit] = useState(false);
  const chooseSide = (next: Side, explicit = true) => {
    setSide(next);
    if (explicit) setIntentExplicit(true);
  };
  const activePath = side === 'need' ? '/find-a-partner' : '/join';
  const activeLabel =
    side === 'need'
      ? t('Find a partner', 'Найти партнёра')
      : t('Join the network', 'Стать партнёром');

  return (
    <div className="counterpart-home">
      <section className="world-cover" aria-labelledby="hero-title">
        <Engraving className="cover-engraving" />
        <HeroImpression />
        <div className="world-cover-inner">
          <div className="world-cover-title">
            <p className="world-label">{t('Independent B2B network', 'Независимая B2B-сеть')}</p>
            <h1 id="hero-title">
              <span>{t('The other', 'Другая')} </span>
              <em>{t('side.', 'сторона.')}</em>
            </h1>
          </div>
          <div className="world-cover-invitation">
            <p>
              {t(
                'We source payment partners and make qualified commercial introductions.',
                'Находим платёжных партнёров и организуем деловые знакомства после проверки.',
              )}
            </p>
            <div className="world-cover-choices">
              {intents.map(([id, code, en, ru]) => (
                <Link
                  to={id === 'need' ? '/find-a-partner' : '/join'}
                  key={id}
                  className="thread-ticket"
                  data-intent={id}
                >
                  <span>
                    <small>{code}</small>
                    <strong>{t(en, ru)}</strong>
                  </span>
                  <SignatureArrow />
                </Link>
              ))}
            </div>
            <ThreadLink
              to="/#connection"
              direction="down"
              variant="utility"
              className="cover-follow"
            >
              {t('Follow the thread', 'Следуйте за нитью')}
            </ThreadLink>
          </div>
          <p className="cover-territories">
            {t('Asia / Latin America / Africa', 'Азия / Латинская Америка / Африка')}
          </p>
          <p className="cover-colophon">
            <span aria-hidden="true" />
            {t('Two sides. One connection.', 'Две стороны. Одна связь.')}
          </p>
        </div>
      </section>

      <section className="world-connection" id="connection" aria-labelledby="object-title">
        <div className="connection-station">
          <div className="connection-intro">
            <p className="world-label">{t('The physical thread', 'Физическая нить')}</p>
            <h2 id="object-title">
              {t('Take the', 'Возьмите')} <em>{t('other end.', 'другой конец.')}</em>
            </h2>
            <p className="station-instruction">
              {t(
                'Pull the ring toward an eyelet, or choose an intent below.',
                'Потяните кольцо к одному из ушек или выберите намерение ниже.',
              )}
            </p>
          </div>
          <ConnectionThread side={side} explicit={intentExplicit} onSide={chooseSide} />
          <div className="station-controls" id="two-sides">
            <fieldset className="station-choices">
              <legend className="sr-only">
                {t('Choose your intention', 'Выберите намерение')}
              </legend>
              {intents.map(([id, code, en, ru]) => (
                <label key={id} className="station-choice">
                  <input
                    type="radio"
                    name="home-intention"
                    value={id}
                    checked={side === id}
                    onChange={() => chooseSide(id)}
                  />
                  <i aria-hidden="true" />
                  <span>
                    <strong>{code}</strong>
                    <small>{t(en, ru)}</small>
                  </span>
                </label>
              ))}
            </fieldset>
            <div className="station-outcome">
              <p role="status">
                {side === 'need'
                  ? t(
                      'Describe the capability or local partner you need.',
                      'Опишите, какие возможности или какой местный партнёр вам нужны.',
                    )
                  : t(
                      'Share your company’s capabilities or commercial opportunity.',
                      'Расскажите о возможностях компании или деловом предложении.',
                    )}
              </p>
              <ThreadLink to={activePath}>{activeLabel}</ThreadLink>
            </div>
          </div>
        </div>
      </section>

      <section className="world-network" id="partners" aria-labelledby="people-title">
        <div className="network-impression" aria-hidden="true">
          <img
            src="/assets/editorial/people.webp"
            alt=""
            width="1586"
            height="992"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="world-network-inner">
          <div className="world-network-title">
            <p className="world-label">{t('The network', 'Сеть')}</p>
            <h2 id="people-title">
              {t('Who’s on the', 'Кто на')} <em>{t('other end?', 'другом конце?')}</em>
            </h2>
          </div>
          <ol className="world-network-roles">
            {participants.map(
              ([id, target, en, ru, description, descriptionRu, art, note, noteRu]) => (
                <li key={id}>
                  <Link to={scenarioLink(id, target)} className="partner-folio">
                    <span className="partner-folio-art" aria-hidden="true">
                      <img
                        src={`/assets/editorial/counterpart-${art}-v1.jpg`}
                        srcSet={`/assets/editorial/counterpart-${art}-v1-600.jpg 600w, /assets/editorial/counterpart-${art}-v1.jpg 1200w`}
                        sizes="(max-width: 740px) 35vw, (max-width: 1440px) 29vw, 440px"
                        alt=""
                        width="1200"
                        height="800"
                        loading="lazy"
                        decoding="async"
                      />
                      <i className="folio-eyelet" />
                      <span className="folio-art-note">{t(note, noteRu)}</span>
                    </span>
                    <span className="partner-folio-copy">
                      <i className="nav-eyelet" aria-hidden="true" />
                      <strong>{t(en, ru)}</strong>
                      <small>{t(description, descriptionRu)}</small>
                    </span>
                  </Link>
                </li>
              ),
            )}
          </ol>
          <ThreadLink to="/network" variant="utility">
            {t('See all network roles', 'Все роли в сети')}
          </ThreadLink>
        </div>
      </section>

      <PaymentAtlas />

      <section className="world-procedure" id="how-it-works" aria-labelledby="process-title">
        <div className="procedure-title">
          <p className="world-label">{t('The procedure', 'Процедура')}</p>
          <h2 id="process-title">{t('Before we introduce.', 'До знакомства.')}</h2>
          <ThreadLink to="/network#commercial-model" variant="utility">
            {t('Read the commercial terms', 'Как устроена оплата')}
          </ThreadLink>
          <CounterSeal className="procedure-seal" />
        </div>
        <ol className="procedure-stitches">
          {milestones.map(([en, ru, description, descriptionRu], i) => (
            <li key={en}>
              <span aria-hidden="true">
                <StitchMark stage={i} />
              </span>
              <h3>{t(en, ru)}</h3>
              <p>{t(description, descriptionRu)}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="world-exchange" id="exchange">
        <div className="exchange-impression" aria-hidden="true">
          <img
            src="/assets/editorial/exchange.webp"
            alt=""
            width="1586"
            height="992"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="counter-forge" id="forge">
          <ConnectionStudio side={side} onSide={chooseSide} intentExplicit={intentExplicit} />
        </div>
      </div>
      <KnowledgeTeaser />
    </div>
  );
}
