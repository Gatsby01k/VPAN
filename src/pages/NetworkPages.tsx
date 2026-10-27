import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ArrowDown, Plus, Minus } from 'lucide-react';
import { useLocale } from '../locale';
import { regions, industries, countries, label } from '../network';
import { NLink, Action, Arrow, Eyebrow } from '../components/NetworkLayout';
import { useGrowth } from '../growth';

export function Home() {
  const { t } = useLocale();
  return (
    <>
      <section className="hero">
        <img
          className="hero-art"
          src="/assets/editorial/exchange.webp"
          alt=""
          width="1586"
          height="992"
          fetchPriority="high"
        />
        <div className="hero-index">
          <span>INDEPENDENT CONNECTIONS</span>
          <span>ASIA / LATAM / AFRICA</span>
        </div>
        <div className="hero-copy">
          <Eyebrow>
            {t('International B2B partnership network', 'Международная B2B-сеть партнёрств')}
          </Eyebrow>
          <h1>
            {t('Local knowledge.', 'Локальные связи.')}
            <em>{t('Global opportunity.', 'Глобальные возможности.')}</em>
          </h1>
          <p>
            {t(
              'We connect companies with payment partners, local expertise and commercial opportunities across Asia, Latin America and Africa.',
              'Соединяем компании с платёжными партнёрами, локальной экспертизой и коммерческими возможностями в Азии, Латинской Америке и Африке.',
            )}
          </p>
          <div className="hero-choices">
            <NLink to="/find-a-partner">
              <span>I NEED</span>
              <strong>{t('Find a partner', 'Найти партнёра')}</strong>
              <Arrow />
            </NLink>
            <NLink to="/join">
              <span>I OFFER</span>
              <strong>{t('Join the network', 'Стать партнёром')}</strong>
              <Arrow />
            </NLink>
          </div>
          <small>
            {t(
              'One brief. A human review. A relevant introduction.',
              'Короткий бриф. Личная проверка. Релевантное знакомство.',
            )}
          </small>
        </div>
        <div className="hero-caption">
          <span>01 / THE CONNECTION</span>
          <a href="#opportunity" aria-label={t('Explore the network', 'Узнать о сети')}>
            <ArrowDown size={18} />
          </a>
          <span>{t('Follow the thread.', 'Следуйте за нитью.')}</span>
        </div>
      </section>
      <section id="opportunity" className="intro-section wrap">
        <Eyebrow>02 / {t('Connections with a purpose', 'Связи с целью')}</Eyebrow>
        <div className="intro-grid">
          <h2>
            {t('A new market starts', 'Новый рынок начинается')}{' '}
            <em>{t('with the right people.', 'с нужных людей.')}</em>
          </h2>
          <div>
            <p className="large-copy">
              {t(
                'You know what your business needs. Somewhere, a company knows exactly how to help. We work on the connection between you.',
                'Вы знаете, что нужно вашему бизнесу. Где-то есть компания, которая умеет это делать. Наша работа — найти связь между вами.',
              )}
            </p>
            <p>
              {t(
                'VlaDDoS Network is an independent partner sourcing and deal origination network. We clarify the brief, qualify the opportunity and arrange introductions when there is a credible fit.',
                'VlaDDoS Network — независимая сеть поиска партнёров и формирования сделок. Мы уточняем задачу, проверяем возможность и организуем знакомство при обоснованном соответствии.',
              )}
            </p>
            <NLink className="text-link" to="/network">
              {t('Inside the network', 'Как устроена сеть')}
              <Arrow />
            </NLink>
          </div>
        </div>
      </section>
      <section className="thread-section">
        <img src="/assets/editorial/people.webp" alt="" width="1586" height="992" loading="lazy" />
        <div className="thread-copy">
          <Eyebrow>03 / THE CONNECTION ENGINE</Eyebrow>
          <h2>
            {t('Two sides.', 'Две стороны.')}
            <em>{t('One good reason to connect.', 'Одна причина для знакомства.')}</em>
          </h2>
          <div className="two-paths">
            <div>
              <span>I NEED</span>
              <h3>{t('Bring your ambition.', 'Расскажите о задаче.')}</h3>
              <p>
                {t(
                  'Find a PSP, local payment partner, liquidity relationship or the expertise to enter a market.',
                  'Найдите PSP, локального платёжного партнёра, поставщика ликвидности или экспертизу для выхода на рынок.',
                )}
              </p>
              <Action to="/find-a-partner">{t('Define your need', 'Опишите задачу')}</Action>
            </div>
            <div>
              <span>I OFFER</span>
              <h3>{t('Bring your edge.', 'Предложите свой опыт.')}</h3>
              <p>
                {t(
                  'Offer infrastructure, local methods, merchant relationships or first-hand market knowledge.',
                  'Предложите инфраструктуру, локальные методы, знакомства с мерчантами или знание рынка.',
                )}
              </p>
              <Action to="/join">{t('Introduce your offer', 'Представьте предложение')}</Action>
            </div>
          </div>
        </div>
      </section>
      <MarketIndex home />
      <section className="industries-preview wrap">
        <div className="section-heading">
          <div>
            <Eyebrow>05 / {t('Business context matters', 'Контекст имеет значение')}</Eyebrow>
            <h2>
              {t('Different industries.', 'Разные индустрии.')}
              <em>{t('Specific conversations.', 'Конкретный разговор.')}</em>
            </h2>
          </div>
          <NLink className="text-link" to="/industries">
            {t('Explore industries', 'Все направления')}
            <Arrow />
          </NLink>
        </div>
        <IndustryList />
      </section>
      <Invitation />
    </>
  );
}
export function Invitation() {
  const { t } = useLocale();
  return (
    <section className="invitation wrap">
      <Eyebrow>{t('The next connection', 'Следующее знакомство')}</Eyebrow>
      <h2>
        {t('What could we', 'Что мы можем')}
        <em>{t('build between us?', 'построить вместе?')}</em>
      </h2>
      <Action to="/contact">{t('Start a conversation', 'Начать разговор')}</Action>
    </section>
  );
}
export function PageIntro({
  index,
  title,
  italic,
  description,
}: {
  index: string;
  title: string;
  italic?: string;
  description: string;
}) {
  return (
    <div className="page-intro wrap">
      <Eyebrow>{index}</Eyebrow>
      <h1>
        {title}
        {italic && <em>{italic}</em>}
      </h1>
      <p>{description}</p>
    </div>
  );
}
const industryCopy: Record<string, [string, string]> = {
  payments: [
    'PSPs, aggregators and fintech companies looking for local infrastructure, distribution and payment relationships.',
    'PSP, агрегаторы и fintech-компании: локальная инфраструктура, дистрибуция и платёжные партнёрства.',
  ],
  igaming: [
    'Operators and suppliers exploring payment collection, payouts and market expertise. Business category acceptance is checked with each provider.',
    'Операторы и поставщики: приём платежей, выплаты и экспертиза рынков. Допустимость категории проверяется у каждого провайдера.',
  ],
  exchange: [
    'Exchanges and OTC businesses seeking liquidity and settlement counterparties. Entities, assets and corridors are reviewed before any introduction.',
    'Обменные и OTC-компании: контрагенты по ликвидности и расчётам. Юрлица, активы и направления проверяются до знакомства.',
  ],
  commerce: [
    'Digital merchants connecting with local acceptance, payout and expansion partners.',
    'Цифровые мерчанты: локальный приём платежей, выплаты и партнёры для расширения.',
  ],
  other: [
    'A specific B2B opportunity with a clear commercial use case. Tell us what the partnership would make possible.',
    'Конкретная B2B-возможность с понятной коммерческой целью. Расскажите, что даст партнёрство.',
  ],
};
export function IndustryList() {
  const { language, t } = useLocale();
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <div className="industry-list">
      {industries.map((item, i) => (
        <div key={item.id} className="industry-row">
          <button
            onClick={() => setExpanded(expanded === item.id ? null : item.id)}
            aria-expanded={expanded === item.id}
            aria-controls={'industry-' + item.id}
          >
            <span>0{i + 1}</span>
            <h3>{label(item, language)}</h3>
            {expanded === item.id ? <Minus aria-hidden="true" /> : <Plus aria-hidden="true" />}
          </button>
          <div id={'industry-' + item.id} hidden={expanded !== item.id}>
            <p>{industryCopy[item.id][language === 'ru' ? 1 : 0]}</p>
            <NLink className="text-link" to={'/find-a-partner?industry=' + item.id}>
              {t('Find a partner in this industry', 'Найти партнёра в этой индустрии')}
              <Arrow />
            </NLink>
            <NLink className="text-link" to={'/join?industry=' + item.id}>
              {t('Offer your capabilities', 'Предложить возможности')}
              <Arrow />
            </NLink>
          </div>
        </div>
      ))}
    </div>
  );
}
export function Industries() {
  const { t } = useLocale();
  return (
    <>
      <PageIntro
        index="THE INDUSTRIES"
        title={t('Context comes first.', 'Сначала — контекст.')}
        italic={t('Connections follow.', 'Затем — связи.')}
        description={t(
          'Industry defines the conversation. Geography defines the requirements. Capabilities define who should be at the table.',
          'Индустрия задаёт контекст. География определяет требования. Возможности определяют участников разговора.',
        )}
      />
      <div className="wrap page-section">
        <IndustryList />
      </div>
      <Invitation />
    </>
  );
}
export function MarketIndex({ home = false }: { home?: boolean }) {
  const { language, t } = useLocale();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const active = home ? '' : params.get('region') || '';
  return (
    <section className={'market-index wrap' + (home ? ' home-markets' : '')}>
      <div className="section-heading">
        <div>
          <Eyebrow>
            {home ? '04 / ' : ''}
            {t('Our geographic focus', 'География интересов')}
          </Eyebrow>
          <h2>
            {t('Think beyond', 'Думайте шире')}
            <em>{t('your borders.', 'своих границ.')}</em>
          </h2>
        </div>
        <p>
          {t(
            'Three regions. Distinct markets. Every country starts with its own brief. These are sourcing destinations, not a claim of available coverage.',
            'Три региона. Разные рынки. Для каждой страны — своя задача. Это направления поиска, а не заявление о доступном покрытии.',
          )}
        </p>
      </div>
      {!home && (
        <div className="market-tools">
          <label>
            {t('Search countries or methods', 'Поиск стран и методов')}
            <input
              type="search"
              value={query}
              placeholder={t(
                'Country, currency, payment method…',
                'Страна, валюта, платёжный метод…',
              )}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label>
            {t('Region', 'Регион')}
            <select
              value={active}
              onChange={(e) => {
                const p = new URLSearchParams(params);
                if (e.target.value) p.set('region', e.target.value);
                else p.delete('region');
                setParams(p);
              }}
            >
              <option value="">{t('All regions', 'Все регионы')}</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {label(r, language)}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      <div className="region-list">
        {regions
          .filter((r) => !active || active === r.id)
          .map((region, i) => {
            const items = countries.filter(
              (c) =>
                c.region === region.id &&
                [c.en, c.ru, c.currency, ...c.methods]
                  .join(' ')
                  .toLowerCase()
                  .includes(query.toLowerCase().trim()),
            );
            return (
              <div key={region.id} className="region-row">
                <div className="region-title">
                  <span>0{i + 1}</span>
                  <NLink to={'/markets?region=' + region.id}>
                    {label(region, language)}
                    <Arrow />
                  </NLink>
                  <small>{language === 'ru' ? region.noteRu : region.note}</small>
                </div>
                <div className="country-links">
                  {items.map((c) => (
                    <NLink key={c.id} to={'/markets/' + c.id}>
                      <span>{label(c, language)}</span>
                      <small>{c.currency}</small>
                      <Arrow />
                    </NLink>
                  ))}
                  {!items.length && (
                    <p role="status">
                      {t('No countries match this search.', 'По этому запросу стран не найдено.')}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
      </div>
      {!home && (
        <p className="catalogue-note">
          {t(
            'Your country isn’t listed? Start a conversation. We will assess the scope before agreeing a search.',
            'Вашей страны нет в списке? Напишите нам. Оценим задачу до согласования поиска.',
          )}{' '}
          <NLink to="/contact">{t('Contact the network', 'Связаться')}</NLink>
        </p>
      )}
    </section>
  );
}
export function Markets() {
  const { t } = useLocale();
  return (
    <>
      <PageIntro
        index="THE MARKETS"
        title={t('Local is the', 'Локальные знания —')}
        italic={t('starting point.', 'точка отсчёта.')}
        description={t(
          'Explore countries by region. Local infrastructure is context for a partner search; availability, eligibility and commercial terms need separate confirmation.',
          'Изучайте страны по регионам. Локальная инфраструктура — контекст для поиска; доступность, допустимость и коммерческие условия подтверждаются отдельно.',
        )}
      />
      <MarketIndex />
    </>
  );
}
export function Country() {
  const { id, slug } = useParams();
  const { t, language } = useLocale();
  const c = countries.find((c) => c.id === (id || slug));
  if (!c) return <NotFound />;
  const r = regions.find((r) => r.id === c.region);
  return (
    <>
      <div className="wrap breadcrumb">
        <NLink to="/markets">{t('Markets', 'Рынки')}</NLink>
        <span>/</span>
        <NLink to={'/markets?region=' + c.region}>{label(r, language)}</NLink>
      </div>
      <PageIntro
        index={c.code + ' / ' + c.currency}
        title={label(c, language) + '.'}
        italic={t('Start with local context.', 'Начните с локального контекста.')}
        description={t(
          'Build a specific brief for this market. We review partner fit, operating scope and commercial intent before arranging an introduction.',
          'Сформируйте конкретный бриф для этого рынка. До знакомства мы проверяем совместимость, границы работы и коммерческую задачу.',
        )}
      />
      <section className="country-detail wrap">
        <div>
          <Eyebrow>
            {t('Local infrastructure reference', 'Справка о локальной инфраструктуре')}
          </Eyebrow>
          <h2>{c.methods.join(' / ')}</h2>
          <p>
            {t(
              'These methods describe the market, not verified capabilities of VlaDDoS or a network member. Industry acceptance, access and settlement must be confirmed directly with the provider.',
              'Методы описывают рынок, а не проверенные возможности VlaDDoS или участника сети. Допустимость индустрии, доступ и расчёты необходимо подтвердить у провайдера.',
            )}
          </p>
          <a className="text-link" href={c.source} target="_blank" rel="noreferrer">
            {t('Infrastructure source', 'Источник об инфраструктуре')}
            <Arrow />
          </a>
        </div>
        <div className="country-actions">
          <Action to={'/find-a-partner?country=' + c.id}>
            {t('Find a partner here', 'Найти партнёра здесь')}
          </Action>
          <Action to={'/join?country=' + c.id}>
            {t('Offer local capabilities', 'Предложить локальные возможности')}
          </Action>
        </div>
      </section>
      <Invitation />
    </>
  );
}
const process = [
  [
    'The brief',
    'Задача',
    'What you need or offer. Industry, country and a specific capability.',
    'Что нужно или что предлагаете. Индустрия, страна и конкретная возможность.',
  ],
  [
    'The qualification',
    'Проверка',
    'We clarify the company, operating responsibility, evidence and commercial intent.',
    'Уточняем компанию, ответственность, подтверждения и коммерческую задачу.',
  ],
  [
    'The introduction',
    'Знакомство',
    'When a credible fit exists, we agree what can be shared and connect the relevant people.',
    'При обоснованном соответствии согласуем раскрытие информации и знакомим нужных людей.',
  ],
  [
    'The follow-through',
    'Развитие сделки',
    'We track the discussion, attribution, agreed terms and evidenced outcomes.',
    'Отслеживаем обсуждение, авторство рекомендации, условия и подтверждённые результаты.',
  ],
];
export function Network() {
  const { t } = useLocale();
  return (
    <>
      <PageIntro
        index="THE NETWORK"
        title={t('A connection is', 'Знакомство —')}
        italic={t('only the beginning.', 'только начало.')}
        description={t(
          'An independent, human-led network for companies seeking specific partners and companies with something valuable to offer.',
          'Независимая сеть с личным участием для компаний, которые ищут конкретных партнёров или предлагают полезные возможности.',
        )}
      />
      <section className="process-section wrap">
        {process.map(([en, ru, copy, copyRu], i) => (
          <div className="process-row" key={en}>
            <span>0{i + 1}</span>
            <h2>{t(en, ru)}</h2>
            <p>{t(copy, copyRu)}</p>
          </div>
        ))}
      </section>
      <section className="commercial-section wrap">
        <Eyebrow>{t('How our work is funded', 'Как оплачивается наша работа')}</Eyebrow>
        <h2>
          {t('Clear terms.', 'Понятные условия.')}
          <em>{t('Before the introduction.', 'До знакомства.')}</em>
        </h2>
        <div className="commercial-columns">
          {[
            [
              'Partner sourcing',
              'Поиск партнёров',
              'A scoped research and sourcing project, with agreed deliverables and a fee.',
              'Исследование и поиск с согласованными результатами и стоимостью.',
            ],
            [
              'Deal origination',
              'Формирование сделки',
              'A success fee tied to an agreed and evidenced commercial milestone.',
              'Вознаграждение за согласованный и подтверждённый коммерческий результат.',
            ],
            [
              'Recurring revenue share',
              'Регулярный revenue share',
              'A contractual share of eligible partner revenue, with attribution, reporting and duration agreed in writing.',
              'Договорная доля от согласованной базы дохода партнёра: авторство, отчётность и срок фиксируются письменно.',
            ],
          ].map(([en, ru, desc, descRu]) => (
            <div key={en}>
              <h3>{t(en, ru)}</h3>
              <p>{t(desc, descRu)}</p>
            </div>
          ))}
        </div>
        <p>
          {t(
            'Commercial interests and the responsible payer are disclosed before proceeding. Submitting a brief creates no fee obligation, partnership entitlement or promise of a match.',
            'Коммерческая заинтересованность и плательщик раскрываются заранее. Отправка брифа не создаёт обязательства по оплате, права на партнёрство или обещания подбора.',
          )}
        </p>
      </section>
      <Invitation />
    </>
  );
}
export function About() {
  const { t } = useLocale();
  return (
    <>
      <PageIntro
        index="ABOUT VLADDOS"
        title={t('Independent', 'Независимая сеть.')}
        italic={t('by design.', 'Осознанный выбор.')}
        description={t(
          'VlaDDoS Network brings professional relationships and local expertise into one focused B2B practice: finding the right commercial counterparties.',
          'VlaDDoS Network объединяет профессиональные связи и локальную экспертизу для одной B2B-задачи: поиска подходящих коммерческих контрагентов.',
        )}
      />
      <div className="about-art">
        <img src="/assets/editorial/people.webp" alt="" width="1586" height="992" loading="lazy" />
      </div>
      <section className="wrap principles">
        {[
          [
            'Specific over broad',
            'Конкретика',
            'We start with a defined business need and assess markets one country at a time.',
            'Начинаем с конкретной задачи и оцениваем рынки по отдельным странам.',
          ],
          [
            'Evidence before introduction',
            'Подтверждения',
            'Self-declared capabilities stay unverified until the supporting information is reviewed.',
            'Заявленные возможности остаются непроверенными до изучения подтверждающих данных.',
          ],
          [
            'Permission and discretion',
            'Согласие и конфиденциальность',
            'Contacts and commercial details are shared only within a permissioned introduction.',
            'Контакты и коммерческие сведения передаются только в рамках согласованного знакомства.',
          ],
          [
            'Clarity of responsibility',
            'Понятная ответственность',
            'We facilitate business relationships. Counterparties contract for and deliver their own financial services.',
            'Мы организуем деловое взаимодействие. Контрагенты самостоятельно заключают договоры и оказывают финансовые услуги.',
          ],
        ].map(([en, ru, copy, copyRu], i) => (
          <div key={en}>
            <Eyebrow>0{i + 1}</Eyebrow>
            <h2>{t(en, ru)}</h2>
            <p>{t(copy, copyRu)}</p>
          </div>
        ))}
      </section>
      <Invitation />
    </>
  );
}
export function Contact() {
  const { t } = useLocale();
  return (
    <>
      <PageIntro
        index="THE FIRST CONVERSATION"
        title={t('Good business', 'Хороший бизнес')}
        italic={t('starts with a hello.', 'начинается с разговора.')}
        description={t(
          'A clear need. A local capability. A relationship worth exploring. Tell us where you would like to begin.',
          'Конкретная задача. Локальная возможность. Перспективное партнёрство. Расскажите, с чего хотите начать.',
        )}
      />
      <section className="contact-options wrap">
        <NLink to="/find-a-partner">
          <span>I NEED</span>
          <h2>{t('Find a partner', 'Найти партнёра')}</h2>
          <p>
            {t(
              'Create a short brief for a specific business need.',
              'Сформируйте короткий бриф по задаче бизнеса.',
            )}
          </p>
          <Arrow />
        </NLink>
        <NLink to="/join">
          <span>I OFFER</span>
          <h2>{t('Join the network', 'Стать партнёром')}</h2>
          <p>
            {t(
              'Introduce your company and what you can offer.',
              'Представьте компанию и её возможности.',
            )}
          </p>
          <Arrow />
        </NLink>
        <div>
          <Eyebrow>
            {t('Prefer a direct conversation?', 'Предпочитаете написать напрямую?')}
          </Eyebrow>
          <a className="contact-email" href="mailto:hello@vladdos.com">
            hello@vladdos.com
            <Arrow />
          </a>
          <p>
            {t(
              'Please share only the context needed for a first conversation. Keep credentials, account details and identity documents out of your introduction.',
              'Для первого разговора достаточно контекста. Не отправляйте пароли, реквизиты счетов и документы, удостоверяющие личность.',
            )}
          </p>
        </div>
      </section>
    </>
  );
}
export function Legal({ type }: { type: 'privacy' | 'terms' }) {
  const { t } = useLocale();
  const privacy = type === 'privacy';
  return (
    <>
      <PageIntro
        index="VLADDOS NETWORK / 27 OCT 2026"
        title={
          privacy
            ? t('Your information.', 'Ваша информация.')
            : t('A clear starting point.', 'Понятная точка отсчёта.')
        }
        italic={privacy ? t('Handled with purpose.', 'С понятной целью.') : undefined}
        description={
          privacy
            ? t(
                'This notice explains how the network handles partnership enquiries.',
                'Как сеть обрабатывает обращения о партнёрстве.',
              )
            : t(
                'Terms for enquiries and facilitated introductions.',
                'Условия обращений и организации знакомств.',
              )
        }
      />
      <article className="prose wrap">
        {(privacy
          ? [
              [
                'What we collect',
                'Какие данные собираем',
                'We store the contact you supply, optional company name and introduction, selected industry, countries, capabilities and methods, consent version and submission reference. Campaign or referral identifiers may be stored for attribution.',
                'Сохраняем указанный контакт, необязательные название компании и сообщение, индустрию, страны, возможности и методы, версию согласия и номер обращения. Можем сохранять идентификаторы кампании и рекомендации для учёта источника.',
              ],
              [
                'Why we use it',
                'Для чего используем',
                'To assess your enquiry, contact you, qualify potential partners, maintain commercial records and arrange an introduction with permission. A website enquiry is not permission to publish your profile or share your contact with every member.',
                'Для оценки обращения, связи с вами, проверки потенциальных партнёров, коммерческого учёта и согласованного знакомства. Обращение не означает разрешения на публикацию профиля или передачу контакта всем участникам.',
              ],
              [
                'Storage and access',
                'Хранение и доступ',
                'Enquiries and the notification queue are stored in the service database. The private Deal Desk requires an operations credential. Notifications contain a reference rather than contact details. Your browser session may retain an unfinished draft; successful submission clears it. Language preference is stored locally.',
                'Обращения и очередь уведомлений хранятся в базе сервиса. Доступ в Deal Desk требует операционного ключа. Уведомления содержат номер обращения без контактов. В сессии браузера может храниться черновик; после отправки он удаляется. Язык сохраняется локально.',
              ],
              [
                'Your choices',
                'Ваш выбор',
                'Ask hello@vladdos.com to access, correct or delete your enquiry or withdraw permission for future introductions. Records are retained while needed for the enquiry and applicable commercial obligations. Do not submit sensitive financial or identity documents through this form.',
                'Напишите на hello@vladdos.com для доступа, исправления, удаления обращения или отзыва разрешения на будущие знакомства. Записи хранятся, пока нужны для обращения и применимых коммерческих обязательств. Не отправляйте чувствительные финансовые данные и документы через эту форму.',
              ],
            ]
          : [
              [
                'Scope',
                'Предмет',
                'VlaDDoS Network is a B2B partner sourcing and introduction service. It does not accept deposits, hold client funds, execute trades or provide payment processing through this website.',
                'VlaDDoS Network оказывает B2B-услуги поиска партнёров и организации знакомств. Сайт не принимает депозиты, не хранит клиентские средства, не исполняет сделки и не проводит платежи.',
              ],
              [
                'Review and eligibility',
                'Рассмотрение и допустимость',
                'Submitting an enquiry does not guarantee a response deadline, available provider, introduction, onboarding or commercial outcome. Each company remains responsible for its own due diligence and legal eligibility.',
                'Отправка обращения не гарантирует срок ответа, наличие провайдера, знакомство, подключение или коммерческий результат. Каждая компания отвечает за собственную проверку и допустимость деятельности.',
              ],
              [
                'Commercial terms',
                'Коммерческие условия',
                'Fees, referral attribution, reporting bases, exclusions and durations require a separate written agreement. No commission entitlement arises from a referral code alone. We disclose relevant commercial interests before an introduction.',
                'Оплата, авторство рекомендации, база отчётности, исключения и сроки требуют отдельного письменного соглашения. Код рекомендации сам по себе не создаёт права на комиссию. Коммерческая заинтересованность раскрывается до знакомства.',
              ],
              [
                'Confidentiality',
                'Конфиденциальность',
                'Share accurate information that you have authority to disclose. Contact and opportunity details are shared with counterparties only after permission is recorded. For questions or corrections, contact hello@vladdos.com.',
                'Передавайте достоверные сведения, которые вправе раскрывать. Контакты и детали возможности передаются контрагентам после фиксации разрешения. Вопросы и исправления: hello@vladdos.com.',
              ],
            ]
        ).map(([en, ru, copy, copyRu]) => (
          <section key={en}>
            <h2>{t(en, ru)}</h2>
            <p>{t(copy, copyRu)}</p>
          </section>
        ))}
      </article>
    </>
  );
}
export function NotFound() {
  const { t } = useLocale();
  return (
    <>
      <PageIntro
        index="404 / END OF THIS THREAD"
        title={t('A missing connection.', 'Связь потерялась.')}
        description={t(
          'This page could not be found. Let’s pick up the thread.',
          'Страница не найдена. Вернёмся к началу.',
        )}
      />
      <div className="wrap page-section">
        <Action to="/">{t('Back to the network', 'Вернуться к сети')}</Action>
      </div>
    </>
  );
}
export function Knowledge() {
  const { t } = useLocale();
  const { slug } = useParams();
  const { data, loaded } = useGrowth();
  const article = data.articles.find((a) => a.slug === slug);
  if (slug && !article)
    return loaded ? (
      <NotFound />
    ) : (
      <div className="wrap page-section" role="status">
        {t('Loading field note…', 'Загрузка материала…')}
      </div>
    );
  return (
    <>
      <PageIntro
        index="THE FIELD NOTES"
        title={
          article ? t(article.title, article.titleRu) : t('Better questions.', 'Точные вопросы.')
        }
        italic={article ? undefined : t('Better partnerships.', 'Сильные партнёрства.')}
        description={
          article
            ? t(article.summary, article.summaryRu)
            : t(
                'Practical preparation for evaluating and introducing payment partners.',
                'Практическая подготовка к оценке и знакомству с платёжными партнёрами.',
              )
        }
      />
      {article ? (
        <article className="prose wrap">
          {article.sections.map((s) => (
            <section key={s.id}>
              <h2>{t(s.heading, s.headingRu)}</h2>
              <p>{t(s.body, s.bodyRu).replaceAll('PAN', 'VlaDDoS Network')}</p>
              <ul>
                {t(s.bullets.join('\n'), s.bulletsRu.join('\n'))
                  .split('\n')
                  .filter(Boolean)
                  .map((x) => (
                    <li key={x}>{x}</li>
                  ))}
              </ul>
            </section>
          ))}
          <h2>{t('Primary sources', 'Первоисточники')}</h2>
          {data.sources
            .filter((s) => article.sourceIds.includes(s.id))
            .map((s) => (
              <p key={s.id}>
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.name}
                </a>
              </p>
            ))}
        </article>
      ) : (
        <div className="wrap page-section field-notes">
          {data.articles.map((a) => (
            <NLink key={a.slug} to={'/knowledge/' + a.slug}>
              <h2>{t(a.title, a.titleRu)}</h2>
              <p>{t(a.summary, a.summaryRu)}</p>
              <Arrow />
            </NLink>
          ))}
          {!data.articles.length && (
            <p role="status">
              {t(
                loaded ? 'No field notes are available right now.' : 'Loading field notes…',
                loaded ? 'Сейчас нет доступных материалов.' : 'Загрузка материалов…',
              )}
            </p>
          )}
        </div>
      )}
    </>
  );
}
