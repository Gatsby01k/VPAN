import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowDown, ArrowUpRight, Check, ChevronDown, Globe2, Search, X } from 'lucide-react';
import { Action, Eyebrow, PageHeading, Reveal, Spotlight } from '../components/UI';
import { markets, roles, type RoleId } from '../data';
import { useLocale } from '../locale';

export function MarketsPage() {
  const { t } = useLocale();
  const [region, setRegion] = useState('All');
  const [query, setQuery] = useState('');
  const filtered = useMemo(
    () =>
      markets.filter(
        (m) =>
          (region === 'All' || m.region === region) &&
          `${m.name} ${m.ru} ${m.currency} ${m.methods.join(' ')}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
      ),
    [region, query],
  );
  return (
    <>
      <PageHeading
        eyebrow={t('Market explorer / PAN', 'Рынки / PAN')}
        title={t('LOCAL KNOW-HOW.', 'ЛОКАЛЬНЫЕ ЗНАНИЯ.')}
        accent={t('Global possibilities.', 'Широкие возможности.')}
        description={t(
          'Africa, Asia, Latin America. We are building relationships with people who understand local payments. Find the market you know.',
          'Африка, Азия, Латинская Америка. Развиваем связи с людьми, которые понимают местные платежи. Найдите свой рынок.',
        )}
      />
      <section className="markets-section wrap">
        <div className="market-toolbar">
          <div
            className="filters"
            role="group"
            aria-label={t('Filter by region', 'Фильтр по региону')}
          >
            {['All', 'Africa', 'LATAM', 'Asia'].map((r) => (
              <button key={r} aria-pressed={r === region} onClick={() => setRegion(r)}>
                {r === region && (
                  <motion.span
                    className="filter-active"
                    layoutId="market-region"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span>
                  {r === 'All'
                    ? t('All markets', 'Все рынки')
                    : r === 'Africa'
                      ? t('Africa', 'Африка')
                      : r === 'Asia'
                        ? t('Asia', 'Азия')
                        : 'LATAM'}
                </span>
              </button>
            ))}
          </div>
          <div className="search-field">
            <Search size={17} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('Country, currency or method', 'Страна, валюта или метод')}
              aria-label={t('Search markets', 'Поиск рынков')}
            />
            {query && (
              <button
                className="icon-button"
                onClick={() => setQuery('')}
                aria-label={t('Clear search', 'Очистить поиск')}
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
        <div className="market-count" aria-live="polite">
          <span>
            {filtered.length.toString().padStart(2, '0')} {t('markets in view', 'рынков найдено')}
          </span>
          <span>
            <span className="signal-dot" />
            {t('Exploring partnerships', 'Развиваем партнёрства')}
          </span>
        </div>
        <motion.div className="market-grid" layout>
          <AnimatePresence mode="popLayout">
            {filtered.map((m) => (
              <motion.article
                key={m.slug}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
              >
                <Spotlight className="market-card">
                  <Link to={`/markets/${m.slug}`}>
                    <div className="market-card-meta">
                      <span>
                        {m.region} / {m.currency}
                      </span>
                      <ArrowUpRight size={20} />
                    </div>
                    <div className="market-card-name">
                      <span className="market-country-code" aria-hidden="true">
                        {m.code}
                      </span>
                      <h2>{t(m.name, m.ru)}</h2>
                    </div>
                    <div className="market-methods">
                      {m.methods.map((method) => (
                        <span key={method}>{method}</span>
                      ))}
                    </div>
                    <div className="market-card-footer">
                      <span>{t('Explore market', 'Посмотреть рынок')}</span>
                      <span className="small-dot" />
                    </div>
                  </Link>
                </Spotlight>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
        {!filtered.length && (
          <div className="empty-state">
            <Globe2 size={38} strokeWidth={1} />
            <h2>{t('A different search?', 'Попробуем другой запрос?')}</h2>
            <p>
              {t(
                'Try another country, payment method or region.',
                'Попробуйте другую страну, платёжный метод или регион.',
              )}
            </p>
            <button
              className="button button-gold"
              onClick={() => {
                setQuery('');
                setRegion('All');
              }}
            >
              {t('Reset filters', 'Сбросить фильтры')}
            </button>
          </div>
        )}
        <p className="market-disclaimer">
          {t(
            'Payment methods are references to local market infrastructure. A listing does not imply that PAN currently processes payments or guarantees availability. Each business category and partnership is reviewed individually.',
            'Платёжные методы указаны как сведения о местной инфраструктуре. Наличие рынка в списке не означает, что PAN обрабатывает платежи или гарантирует доступность. Категории бизнеса и партнёрства рассматриваются отдельно.',
          )}
        </p>
      </section>
    </>
  );
}

export function CountryPage() {
  const { slug } = useParams();
  const { t } = useLocale();
  const market = markets.find((m) => m.slug === slug);
  if (!market) return <NotFoundPage />;
  return (
    <>
      <div className="breadcrumbs wrap">
        <Link to="/markets">{t('Markets', 'Рынки')}</Link>
        <span>/</span>
        <span>{t(market.name, market.ru)}</span>
      </div>
      <section className="country-hero wrap">
        <div>
          <Eyebrow>
            {market.region} / {market.currency}
          </Eyebrow>
          <h1 className="display">
            <span>{t(market.name, market.ru).toUpperCase()}.</span>
            <span className="display-accent accent">{t('Next connections.', 'Новые связи.')}</span>
          </h1>
          <p className="country-intro">
            {t(market.focus, market.focusRu)}.{' '}
            {t(
              'Tell us who you know, what you operate and where a partnership could make sense.',
              'Расскажите, кого вы знаете, с чем работаете и какое партнёрство вам интересно.',
            )}
          </p>
          <Action to={`/apply?market=${market.slug}`}>
            {t(`Connect in ${market.name}`, 'Обсудить партнёрство')}
          </Action>
        </div>
        <div className="country-art" aria-hidden="true">
          <span className="country-art-code">{market.code}</span>
          <span className="country-art-orbit" />
          <span className="country-art-currency">{market.currency}</span>
          <div className="country-art-label">PAN / LOCAL KNOWLEDGE</div>
        </div>
      </section>
      <section className="country-details section">
        <div className="wrap country-details-grid">
          <Reveal>
            <Eyebrow number="01">{t('Market context', 'Контекст рынка')}</Eyebrow>
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
                {t('Exploring partnerships', 'Развиваем партнёрства')}
              </strong>
              <p>
                {t(
                  'Availability and business categories are discussed individually. No live processing capacity is implied.',
                  'Доступность и бизнес-категории обсуждаются отдельно. Наличие действующей процессинговой мощности не подразумевается.',
                )}
              </p>
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
          <Action to={`/apply?market=${market.slug}`}>
            {t('Introduce yourself', 'Расскажите о себе')}
          </Action>
        </div>
        <div className="country-partners">
          {roles.slice(0, 4).map((r, i) => (
            <Reveal key={r.id} delay={i * 0.04}>
              <Link to={`/apply?role=${r.id}&market=${market.slug}`}>
                <span>0{i + 1}</span>
                <h3>{t(r.title, r.ru)}</h3>
                <p>{t(r.short, r.shortRu)}</p>
                <ArrowUpRight size={23} />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

const qualifications: Record<RoleId, [string, string][]> = {
  affiliate: [
    [
      'Direct relationships with relevant decision-makers',
      'Прямые связи с подходящими лицами, принимающими решения',
    ],
    ['A clear understanding of the market and methods', 'Понимание рынка и платёжных методов'],
    [
      'Introductions with agreed attribution and terms',
      'Рекомендации с согласованным авторством и условиями',
    ],
  ],
  team: [
    ['An experienced team and a responsible contact', 'Опытная команда и ответственный контакт'],
    [
      'Practical experience with local payment methods',
      'Практический опыт с местными платёжными методами',
    ],
    [
      'Ability to explain operating responsibilities',
      'Возможность объяснить схему работы и ответственность',
    ],
  ],
  provider: [
    [
      'Clear supported markets, methods and categories',
      'Понятные рынки, методы и бизнес-категории',
    ],
    ['Appropriate permissions where required', 'Необходимые разрешения там, где они требуются'],
    ['A business contact and integration expertise', 'Деловой контакт и техническая экспертиза'],
  ],
  merchant: [
    [
      'A clear business category and operating markets',
      'Понятная категория бизнеса и рынки работы',
    ],
    [
      'Specific payment and integration requirements',
      'Конкретные платёжные и интеграционные требования',
    ],
    ['An accountable commercial representative', 'Ответственный представитель компании'],
  ],
  regional: [
    ['Relevant local relationships', 'Подходящие местные связи'],
    ['Practical market knowledge', 'Практическое знание рынка'],
    ['A direct business contact', 'Прямой деловой контакт'],
  ],
};

export function PartnerPage({ roleId }: { roleId: RoleId }) {
  const { t } = useLocale();
  const role = roles.find((r) => r.id === roleId)!;
  const headlines: Record<RoleId, [string, string, string, string]> = {
    affiliate: ['YOUR PEOPLE.', 'Your next advantage.', 'ВАШИ ЛЮДИ.', 'Ваш следующий плюс.'],
    team: ['LOCAL EXPERTISE.', 'A wider network.', 'ЛОКАЛЬНЫЙ ОПЫТ.', 'Больше нужных связей.'],
    provider: ['YOUR SOLUTION.', 'The right connection.', 'ВАШЕ РЕШЕНИЕ.', 'Нужный партнёр.'],
    merchant: [
      'YOUR NEXT MARKET.',
      'The right partners.',
      'ВАШ СЛЕДУЮЩИЙ РЫНОК.',
      'Подходящие партнёры.',
    ],
    regional: ['KNOW THE MARKET.', 'Meet the network.', 'ЗНАЙТЕ РЫНОК.', 'Знакомьтесь с сетью.'],
  };
  const h = headlines[roleId];
  return (
    <>
      <PageHeading
        eyebrow={`${t('For', 'Для')} / ${t(role.title, role.ru)}`}
        title={t(h[0], h[2])}
        accent={t(h[1], h[3])}
        description={t(role.description, role.descriptionRu)}
      />
      <section className="partner-detail wrap">
        <Reveal className="partner-detail-visual">
          <img
            src={`/assets/${role.art}`}
            alt={t('Original PAN brand artwork', 'Оригинальная графика PAN')}
          />
          <div className="partner-art-overlay">
            <span>PAN / BLACK LABEL</span>
            <span>{t(role.title, role.ru)}</span>
          </div>
        </Reveal>
        <div className="partner-detail-copy">
          <Eyebrow number="01">{t('Experience matters', 'Опыт имеет значение')}</Eyebrow>
          <h2 className="section-title">{t(role.label, role.labelRu)}</h2>
          <p>
            {t(
              'We start with a useful conversation. Tell us what you bring and what a good partnership looks like for you.',
              'Начинаем с полезного разговора. Расскажите, что вы предлагаете и какое партнёрство считаете подходящим.',
            )}
          </p>
          <div className="qualification-list">
            {qualifications[roleId].map(([en, ru], i) => (
              <Reveal key={en} delay={i * 0.06}>
                <span className="qualification-check">
                  <Check size={14} />
                </span>
                <span>{t(en, ru)}</span>
              </Reveal>
            ))}
          </div>
          <Action to={`/apply?role=${roleId}`}>
            {t('Discuss a partnership', 'Обсудить партнёрство')}
          </Action>
          <span className="partner-detail-note">
            {t(
              'No banking credentials or financial documents are needed in the first form.',
              'Для первой анкеты не нужны банковские пароли или финансовые документы.',
            )}
          </span>
        </div>
      </section>
      <section className="partner-promises section">
        <div className="wrap">
          <Eyebrow number="02">{t('Our approach', 'Наш подход')}</Eyebrow>
          <div className="promise-grid">
            {[
              [
                t('Clear scope.', 'Понятная сфера работы.'),
                t(
                  'Markets, methods and responsibilities discussed up front.',
                  'Рынки, методы и ответственность обсуждаются заранее.',
                ),
              ],
              [
                t('Individual terms.', 'Индивидуальные условия.'),
                t(
                  'Commercial arrangements agreed for the specific relationship.',
                  'Коммерческие условия согласовываются для конкретного партнёрства.',
                ),
              ],
              [
                t('Useful introductions.', 'Полезные знакомства.'),
                t(
                  'Relevant experience and direct decision-makers come first.',
                  'В приоритете подходящий опыт и прямые контакты.',
                ),
              ],
            ].map(([title, text], i) => (
              <Reveal key={title} delay={i * 0.06}>
                <span>0{i + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function AboutPage() {
  const { t } = useLocale();
  const [open, setOpen] = useState(0);
  const principles = [
    [
      t('People before promises.', 'Люди важнее обещаний.'),
      t(
        'We value relevant experience, accountable contacts and a practical understanding of local markets. Each introduction deserves a real conversation.',
        'Ценим подходящий опыт, ответственные контакты и понимание местных рынков. Каждая рекомендация заслуживает предметного разговора.',
      ),
    ],
    [
      t('Clarity before commitment.', 'Ясность до обязательств.'),
      t(
        'Attribution, commercial scope and responsibilities are discussed before progressing. Individual agreements define the relationship.',
        'Авторство рекомендаций, сфера работы и ответственность обсуждаются до следующих шагов. Отношения определяются отдельными соглашениями.',
      ),
    ],
    [
      t('Context before expansion.', 'Контекст до расширения.'),
      t(
        'A country on our website is a place we are exploring, not a claim of live processing. We discuss actual fit and availability individually.',
        'Страна на сайте — рынок, в котором мы изучаем партнёрства. Это не заявление о действующем процессинге. Подходящие условия и доступность обсуждаем отдельно.',
      ),
    ],
  ];
  return (
    <>
      <PageHeading
        eyebrow={t('Independent by design / PAN', 'Независимость как принцип / PAN')}
        title={t('THE POWER', 'СИЛА')}
        accent={t('is in the people.', 'в нужных людях.')}
        description={t(
          'PAN is a private business network for people with real relationships in local payment markets. We connect experience with opportunity.',
          'PAN — закрытая бизнес-сеть для людей с реальными связями в местных платёжных рынках. Соединяем опыт и возможности.',
        )}
      />
      <section className="about-statement wrap">
        <Reveal>
          <span className="about-asterisk" aria-hidden="true">
            ✳
          </span>
          <p>
            {t('Good connections are built.', 'Хорошие связи создают.')}
            <br />
            <span className="display-accent">
              {t('Great ones are earned.', 'Лучшие — заслуживают.')}
            </span>
          </p>
        </Reveal>
        <Reveal className="about-statement-note">
          <p>
            {t(
              'Affiliates. Teams. Payment providers. Merchants. Different perspectives, one meaningful conversation.',
              'Аффилиаты. Команды. Платёжные провайдеры. Мерчанты. Разный опыт — один полезный разговор.',
            )}
          </p>
          <Action to="/apply">{t('Be part of the conversation', 'Начать разговор')}</Action>
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
                    aria-expanded={open === i}
                    aria-controls={`principle-${i}`}
                    onClick={() => setOpen(open === i ? -1 : i)}
                  >
                    <span>
                      <small>0{i + 1}</small>
                      {title}
                    </span>
                    <ChevronDown size={22} />
                  </button>
                </h3>
                <div id={`principle-${i}`} hidden={open !== i}>
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
              <ArrowUpRight size={15} />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

export function LegalPage({ type }: { type: 'privacy' | 'terms' }) {
  const { t } = useLocale();
  const privacy = type === 'privacy';
  const content = privacy
    ? [
        [
          t('Information you share', 'Информация, которую вы передаёте'),
          t(
            'When you apply, PAN receives the details you submit: your role, markets, name, work contacts, company and description of your business. Technical connection information may be used to prevent abuse.',
            'При отправке заявки PAN получает указанную вами роль, рынки, имя, рабочие контакты, компанию и описание деятельности. Технические данные соединения могут использоваться для защиты от злоупотреблений.',
          ),
        ],
        [
          t('How it is used', 'Как используется информация'),
          t(
            'We use application information to review potential partnerships, communicate with applicants and record relevant introductions. An application does not create an account or guarantee acceptance.',
            'Информация используется для рассмотрения возможных партнёрств, связи с заявителями и учёта подходящих знакомств. Заявка не создаёт аккаунт и не гарантирует принятие.',
          ),
        ],
        [
          t('Browser preferences and drafts', 'Настройки и черновики в браузере'),
          t(
            'Your language preference is saved locally. The application draft and its request identifier are stored for the current browser session so you can return to an unfinished application. No admin credentials are stored in browser storage.',
            'Выбор языка сохраняется локально. Черновик анкеты и идентификатор запроса хранятся в текущей сессии браузера, чтобы вы могли вернуться к незавершённой заявке. Административные пароли в хранилище браузера не сохраняются.',
          ),
        ],
        [
          t('Retention and requests', 'Хранение и обращения'),
          t(
            'Submitted applications are held in the site database and restricted to authorized operators. We retain information for legitimate partnership purposes and applicable obligations. Contact us to request review or deletion, subject to applicable requirements.',
            'Отправленные заявки хранятся в базе сайта и доступны уполномоченным операторам. Информация сохраняется для законных целей партнёрства и применимых обязательств. Для запроса просмотра или удаления свяжитесь с нами; могут действовать соответствующие требования.',
          ),
        ],
      ]
    : [
        [
          t('An informational business network', 'Информационная бизнес-сеть'),
          t(
            'The PAN website describes potential business partnerships. It is not an offer to process payments, provide regulated financial services or guarantee revenue in a territory.',
            'Сайт PAN описывает потенциальные бизнес-партнёрства. Он не является предложением процессинга, регулируемых финансовых услуг или гарантией дохода в какой-либо стране.',
          ),
        ],
        [
          t('Individual agreements', 'Индивидуальные соглашения'),
          t(
            'Submitting an application does not create a contract or guarantee a business opportunity. Commercial terms, commissions and responsibilities exist only under separate agreements between relevant parties.',
            'Отправка заявки не создаёт договор и не гарантирует коммерческую возможность. Условия, комиссии и ответственность возникают только в рамках отдельных соглашений соответствующих сторон.',
          ),
        ],
        [
          t('Markets and methods', 'Рынки и методы'),
          t(
            'Listed countries and payment methods are market references. They do not imply that PAN has live processing capacity or permission to support every business category. Fit and availability are reviewed individually.',
            'Указанные страны и методы — сведения о рынках. Они не означают, что у PAN есть действующая процессинговая мощность или разрешение поддерживать любую бизнес-категорию. Подходящие условия и доступность рассматриваются отдельно.',
          ),
        ],
        [
          t('Permitted conduct', 'Допустимое использование'),
          t(
            'Do not submit fraudulent information, attempt unauthorized access or use this site for prohibited activity. Applicants are responsible for describing their business and operating arrangements accurately.',
            'Не отправляйте ложные сведения, не пытайтесь получить несанкционированный доступ и не используйте сайт для запрещённой деятельности. Заявитель отвечает за точность описания деятельности и схемы работы.',
          ),
        ],
      ];
  return (
    <>
      <PageHeading
        eyebrow={t('PAN / Legal', 'PAN / Документы')}
        title={privacy ? t('PRIVACY.', 'КОНФИДЕНЦИАЛЬНОСТЬ.') : t('TERMS.', 'УСЛОВИЯ.')}
        accent={t('Clear by design.', 'Понятные принципы.')}
        description={t(
          'Effective October 2026. Information about using the PAN website and sharing an application.',
          'Действуют с октября 2026 года. Информация об использовании сайта PAN и передаче заявки.',
        )}
      />
      <section className="legal-content wrap">
        <aside>
          <span>
            {privacy
              ? t('Privacy notice', 'Уведомление о конфиденциальности')
              : t('Website terms', 'Условия сайта')}
          </span>
          {content.map(([title], i) => (
            <a href={`#legal-${i}`} key={title}>
              {title}
              <ArrowDown size={12} />
            </a>
          ))}
        </aside>
        <div>
          {content.map(([title, text], i) => (
            <article id={`legal-${i}`} key={title}>
              <span>0{i + 1}</span>
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
          <article>
            <h2>{t('Questions or requests', 'Вопросы и обращения')}</h2>
            <p>
              {t('Contact', 'Напишите на')} <a href="mailto:hello@vladdos.com">hello@vladdos.com</a>
              .
            </p>
          </article>
        </div>
      </section>
    </>
  );
}

export function NotFoundPage() {
  const { t } = useLocale();
  return (
    <section className="not-found wrap">
      <Eyebrow>{t('A different direction / 404', 'Другой маршрут / 404')}</Eyebrow>
      <div className="not-found-number" aria-hidden="true">
        4<span>✳</span>4
      </div>
      <h1>{t('This connection isn’t here.', 'Здесь пока нет связи.')}</h1>
      <p>{t('Let’s find you a useful next step.', 'Найдём полезный следующий шаг.')}</p>
      <Action to="/">{t('Back to the network', 'Вернуться в сеть')}</Action>
    </section>
  );
}
