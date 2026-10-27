import { useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { NLink as Link } from '../components/NetworkLayout';
import { ArrowRight, ArrowUpRight, ChevronDown, Globe2, Search, X } from 'lucide-react';
import { Action, Eyebrow, PageHeading, Reveal } from '../components/UI';
import { useLocale } from '../locale';
import { KnowledgeTeaser } from '../components/KnowledgeTeaser';
import { countries, regions } from '../network';
import type { Language } from '../network';

// Preserve the original page structures; derive every market from the shared catalogue.
const markets = countries.map((c) => ({ ...c, slug: c.id, name: c.en }));
const regionList = regions.map((r) => ({ ...r, name: r.en, value: r.id }));
const findRegion = (id: string | null) =>
  regionList.find((r) => r.id === id || r.en === id || r.ru === id);
const regionName = (id: string, language: Language) => {
  const r = findRegion(id);
  return r ? (language === 'ru' ? r.ru : r.en) : id;
};
const countryGroups = (items: typeof markets, _language: Language) =>
  regionList.map((r) => ({ ...r, countries: items.filter((c) => c.region === r.id) }));
const participants = [
  {
    id: 'psp',
    title: 'PSPs & aggregators',
    ru: 'PSP и агрегаторы',
    short: 'Infrastructure, distribution and payment relationships.',
    shortRu: 'Инфраструктура, дистрибуция и платёжные партнёрства.',
    path: '/join',
  },
  {
    id: 'merchant',
    title: 'Merchants & operators',
    ru: 'Мерчанты и операторы',
    short: 'A specific need for acceptance, payouts or local expertise.',
    shortRu: 'Конкретная задача по приёму платежей, выплатам или локальной экспертизе.',
    path: '/find-a-partner',
  },
  {
    id: 'local-partner',
    title: 'Local payment partners',
    ru: 'Локальные партнёры',
    short: 'Accountable local contacts and useful market knowledge.',
    shortRu: 'Ответственные контакты и практические знания рынка.',
    path: '/join',
  },
];

export function Markets() {
  const { language, t } = useLocale();
  const [params, setParams] = useSearchParams();
  const region = findRegion(params.get('region'));
  const query = params.get('q') || '';
  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: key === 'q', preventScrollReset: true });
  };
  const filtered = useMemo(
    () =>
      markets.filter(
        (country) =>
          (!region || country.region === region.value) &&
          `${country.name} ${country.ru} ${country.code} ${country.currency} ${country.methods.join(' ')}`
            .toLocaleLowerCase()
            .includes(query.trim().toLocaleLowerCase()),
      ),
    [region, query],
  );
  const groups = countryGroups(filtered, language).filter((group) => group.countries.length);
  const reset = () => {
    const next = new URLSearchParams(params);
    next.delete('q');
    next.delete('region');
    setParams(next, { preventScrollReset: true });
  };
  return (
    <>
      <PageHeading
        eyebrow={t('Markets / regions & countries', 'Рынки / регионы и страны')}
        title={t('Choose a region.', 'Выберите регион.')}
        accent={t('Find your country.', 'Найдите свою страну.')}
        description={t(
          'Africa, Asia and Latin America are our regional directions. Choose a region to see its countries, currencies and local payment methods.',
          'Африка, Азия и Латинская Америка — региональные направления. Выберите регион, затем страну: её валюту и локальные платёжные методы.',
        )}
      />
      <section
        className="markets-section wrap"
        aria-label={t('Regions and countries', 'Регионы и страны')}
      >
        <div
          className="region-picker"
          role="group"
          aria-label={t('Choose a region', 'Выберите регион')}
        >
          {countryGroups(markets, language).map((group, index) => (
            <button
              key={group.id}
              aria-pressed={region?.id === group.id}
              onClick={() => updateFilter('region', region?.id === group.id ? '' : group.id)}
            >
              <span className="folio">
                0{index + 1} / {t('REGION', 'РЕГИОН')}
              </span>
              <strong>{t(group.name, group.ru)}</strong>
              <span>
                {t('Countries', 'Страны')}: {group.countries.length}
              </span>
              <ArrowUpRight size={22} aria-hidden="true" />
            </button>
          ))}
        </div>
        <div className="market-toolbar">
          <button
            className="region-reset"
            onClick={() => updateFilter('region', '')}
            aria-pressed={!region}
          >
            {t('All regions', 'Все регионы')}
          </button>
          <label className="search-field country-search">
            <Search size={18} aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => updateFilter('q', e.target.value)}
              placeholder={t('Country, currency or method', 'Страна, валюта или метод')}
              aria-label={t('Search countries', 'Поиск стран')}
            />
            {query && (
              <button
                className="icon-button"
                onClick={() => updateFilter('q', '')}
                aria-label={t('Clear search', 'Очистить поиск')}
              >
                <X size={18} aria-hidden="true" />
              </button>
            )}
          </label>
        </div>
        <p className="country-result-count" role="status">
          {region ? t(region.name, region.ru) : t('All regions', 'Все регионы')} <span>/</span>{' '}
          {t('Countries found', 'Найдено стран')}: {filtered.length}
        </p>
        {groups.map((group) => (
          <section className="country-group" key={group.id} aria-labelledby={`region-${group.id}`}>
            <div className="country-group-heading">
              <div>
                <span className="folio">{t('REGION', 'РЕГИОН')}</span>
                <h2 id={`region-${group.id}`}>{t(group.name, group.ru)}</h2>
              </div>
              <span>
                {t('Countries', 'Страны')}: {group.countries.length}
              </span>
            </div>
            <div className="market-grid">
              {group.countries.map((country) => (
                <article key={country.slug}>
                  <Link to={`/markets/${country.slug}`} className="country-card">
                    <div className="country-card-meta">
                      <span>
                        {country.code} / {country.currency}
                      </span>
                      <ArrowUpRight size={20} aria-hidden="true" />
                    </div>
                    <h3>{t(country.name, country.ru)}</h3>
                    <div className="market-methods">
                      {country.methods.map((method) => (
                        <span key={method}>{method}</span>
                      ))}
                    </div>
                    <span className="country-card-action">
                      {t('View country', 'Подробнее о стране')}{' '}
                      <ArrowRight size={19} aria-hidden="true" />
                    </span>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ))}
        {!filtered.length && (
          <div className="empty-state">
            <Globe2 size={36} strokeWidth={1.5} aria-hidden="true" />
            <h2>{t('No countries found.', 'Страны не найдены.')}</h2>
            <p>
              {t(
                'Change the search or choose another region.',
                'Измените запрос или выберите другой регион.',
              )}
            </p>
            <button className="button" onClick={reset}>
              {t('Reset filters', 'Сбросить фильтры')}
            </button>
          </div>
        )}
        <p className="market-disclaimer">
          {t(
            'Countries describe the local context for a potential partnership. Payment methods are infrastructure references; availability and commercial terms are discussed individually.',
            'Страны показывают локальный контекст для возможного партнёрства. Платёжные методы — сведения об инфраструктуре; доступность и коммерческие условия обсуждаются индивидуально.',
          )}
        </p>
      </section>
    </>
  );
}

export function Country() {
  const { slug } = useParams();
  const { language, t } = useLocale();
  const market = markets.find((m) => m.slug === slug);
  if (!market)
    return (
      <PageHeading
        eyebrow="404"
        title={t('Country not found.', 'Страна не найдена.')}
        accent=""
        description={t(
          'Return to the market index to choose a country.',
          'Выберите страну в списке рынков.',
        )}
      />
    );
  return (
    <>
      <nav className="breadcrumbs wrap" aria-label={t('Breadcrumb', 'Навигационная цепочка')}>
        <Link to="/markets">{t('Markets', 'Рынки')}</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/markets?region=${findRegion(market.region)!.id}`}>
          {regionName(market.region, language)}
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{t(market.name, market.ru)}</span>
      </nav>
      <section className="country-hero wrap">
        <div>
          <Eyebrow>
            {regionName(market.region, language)} / {market.currency}
          </Eyebrow>
          <h1 className="display">
            <span>{t(market.name, market.ru)}.</span>
            <span className="display-accent accent">
              {t('Local connections.', 'Локальные связи.')}
            </span>
          </h1>
          <p className="country-intro">
            {t(
              'Build a specific brief for this market. We review the company, operating scope and commercial intent before arranging an introduction.',
              'Сформируйте конкретный бриф для этого рынка. До знакомства уточняем компанию, границы работы и коммерческую задачу.',
            )}
          </p>
          <div className="retained-country-actions">
            <Action to={`/find-a-partner?country=${market.slug}`}>
              {t('Find a partner here', 'Найти партнёра здесь')}
            </Action>
            <Action to={`/join?country=${market.slug}`}>
              {t('Offer local capabilities', 'Предложить возможности')}
            </Action>
          </div>
        </div>
        <div className="country-art" aria-hidden="true">
          <span className="country-art-code">{market.code}</span>
          <span className="country-art-orbit" />
          <span className="country-art-currency">{market.currency}</span>
          <div className="country-art-label">VLADDOS NETWORK / LOCAL KNOWLEDGE</div>
        </div>
      </section>
      <section className="country-details section">
        <div className="wrap country-details-grid">
          <Reveal>
            <Eyebrow number="01">{t('Country context', 'Контекст страны')}</Eyebrow>
            <h2 className="section-title">
              {t('Understand the', 'Понимайте')}
              <br />
              <span className="display-accent">{t('local edge.', 'местные особенности.')}</span>
            </h2>
            <p className="section-description">
              {t(
                'The right payment relationship starts with practical local experience, clear responsibilities and a relevant business category.',
                'Подходящее платёжное партнёрство начинается с практического опыта, понятной ответственности и подходящей категории бизнеса.',
              )}
            </p>
          </Reveal>
          <div>
            <Reveal className="country-fact">
              <span>{t('Local currency', 'Местная валюта')}</span>
              <strong>{market.currency}</strong>
            </Reveal>
            <Reveal className="country-fact">
              <span>{t('Payment method references', 'Платёжные методы')}</span>
              <div className="chips">
                {market.methods.map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </Reveal>
            <Reveal className="country-fact">
              <span>{t('Partnership status', 'Статус партнёрств')}</span>
              <strong className="country-status">
                <span className="signal-dot" />
                {t('Reviewed per enquiry', 'Проверяем по обращению')}
              </strong>
              <p>
                {t(
                  'Methods describe local infrastructure, not verified network capabilities. Availability, eligibility and settlement are confirmed with the provider.',
                  'Методы описывают инфраструктуру, а не проверенные возможности сети. Доступность, допустимость и расчёты подтверждаются у провайдера.',
                )}
              </p>
              <a className="text-link" href={market.source} target="_blank" rel="noreferrer">
                {t('Infrastructure source', 'Источник об инфраструктуре')}{' '}
                <ArrowUpRight size={16} />
              </a>
            </Reveal>
          </div>
        </div>
      </section>
      <section className="section wrap">
        <div className="section-title-row">
          <div>
            <Eyebrow number="02">{t('Who we want to meet', 'С кем хотим познакомиться')}</Eyebrow>
            <h2 className="section-title">
              {t('Local people.', 'Местные эксперты.')}
              <br />
              <span className="display-accent">
                {t('Relevant experience.', 'Подходящий опыт.')}
              </span>
            </h2>
          </div>
          <Action to={`/join?country=${market.slug}`}>
            {t('Offer local capabilities', 'Предложить локальные возможности')}
          </Action>
        </div>
        <div className="country-partners">
          {participants.map((r, i) => (
            <Reveal key={r.id} delay={i * 0.04}>
              <Link to={`${r.path}?country=${market.slug}`}>
                <span>0{i + 1}</span>
                <h3>{t(r.title, r.ru)}</h3>
                <p>{t(r.short, r.shortRu)}</p>
                <ArrowUpRight size={23} aria-hidden="true" />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
      <KnowledgeTeaser market={market.slug} />
    </>
  );
}

export function About() {
  const { t } = useLocale();
  const [open, setOpen] = useState(0);
  const principles = [
    [
      t('Specific over broad.', 'Конкретика.'),
      t(
        'We start with a defined business need and assess markets one country at a time.',
        'Начинаем с конкретной задачи и оцениваем рынки по отдельным странам.',
      ),
    ],
    [
      t('Evidence before introduction.', 'Подтверждения до знакомства.'),
      t(
        'Self-declared capabilities stay unverified until supporting information is reviewed.',
        'Заявленные возможности остаются непроверенными до изучения подтверждающих данных.',
      ),
    ],
    [
      t('Permission and discretion.', 'Согласие и конфиденциальность.'),
      t(
        'Contacts and commercial details are shared only within a permissioned introduction.',
        'Контакты и коммерческие сведения передаются только в рамках согласованного знакомства.',
      ),
    ],
    [
      t('Clarity of responsibility.', 'Понятная ответственность.'),
      t(
        'We facilitate business relationships. Counterparties contract for and deliver their own financial services.',
        'Мы организуем деловое взаимодействие. Контрагенты самостоятельно заключают договоры и оказывают финансовые услуги.',
      ),
    ],
  ];
  return (
    <>
      <PageHeading
        eyebrow={t(
          'Independent by design / VlaDDoS Network',
          'Независимость как принцип / VlaDDoS Network',
        )}
        title={t('The power', 'Сила')}
        accent={t('is in the people.', 'в нужных людях.')}
        description={t(
          'VlaDDoS Network brings professional relationships and local expertise into one focused B2B practice: finding the right commercial counterparties.',
          'VlaDDoS Network объединяет профессиональные связи и локальную экспертизу для одной B2B-задачи: поиска подходящих коммерческих контрагентов.',
        )}
      />
      <section className="about-statement wrap">
        <Reveal>
          <img
            className="about-brand-art"
            src="/assets/editorial/connection.webp"
            width="900"
            height="900"
            loading="lazy"
            alt=""
          />
          <p>
            {t('Your expertise matters.', 'Ваш опыт важен.')}
            <br />
            <span className="display-accent">
              {t('Let’s put it into context.', 'Обсудим, где он полезен.')}
            </span>
          </p>
        </Reveal>
        <Reveal className="about-statement-note">
          <p>
            {t(
              'Companies seeking specific partners. Companies with useful capabilities. We qualify the opportunity and agree terms before an introduction.',
              'Компании с конкретной задачей. Компании с полезными возможностями. Проверяем задачу и согласуем условия до знакомства.',
            )}
          </p>
          <Action to="/contact">{t('Be part of the conversation', 'Начать разговор')}</Action>
        </Reveal>
      </section>
      <section className="about-principles section">
        <div className="wrap about-principles-grid">
          <div>
            <Eyebrow number="01">{t('What guides us', 'Наши ориентиры')}</Eyebrow>
            <h2 className="section-title">
              {t('A few things', 'То, во что')}
              <br />
              <span className="display-accent">{t('we believe.', 'мы верим.')}</span>
            </h2>
          </div>
          <div className="accordion">
            {principles.map(([title, content], i) => (
              <div key={i} className={`accordion-item ${open === i ? 'is-open' : ''}`}>
                <h3>
                  <button
                    id={`principle-trigger-${i}`}
                    aria-expanded={open === i}
                    aria-controls={`principle-${i}`}
                    onClick={() => setOpen(open === i ? -1 : i)}
                  >
                    <span>
                      <small>0{i + 1}</small>
                      {title}
                    </span>
                    <ChevronDown size={22} aria-hidden="true" />
                  </button>
                </h3>
                <div
                  id={`principle-${i}`}
                  role="region"
                  aria-labelledby={`principle-trigger-${i}`}
                  hidden={open !== i}
                >
                  <p>{content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section wrap about-markets">
        <Eyebrow number="02">{t('Our outlook', 'Наш взгляд')}</Eyebrow>
        <h2 className="section-title">
          {t('Local roots.', 'Локальные знания.')}{' '}
          <span className="display-accent">{t('Open horizons.', 'Открытые горизонты.')}</span>
        </h2>
        <div className="about-market-links">
          {markets.map((m) => (
            <Link to={`/markets/${m.slug}`} key={m.slug}>
              <span>{m.code}</span>
              {t(m.name, m.ru)}
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
