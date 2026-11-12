import { ArrowUpRight } from 'lucide-react';
import { useLocale } from '../locale';
import { NLink, Eyebrow } from './NetworkLayout';
import { scenarioLink } from '../brief';

const relationships = [
  [
    'merchant',
    'International merchants',
    'Международные мерчанты',
    'Local acceptance. A clear route to market.',
    'Локальный приём. Понятный выход на рынок.',
    'Meet PSPs and local operators for a defined country, business category and payment flow. Provider acceptance and onboarding remain subject to their review.',
    'PSP и локальные операторы под страну, категорию бизнеса и платёжный поток. Допустимость и подключение определяет провайдер.',
  ],
  [
    'psp',
    'PSPs & aggregators',
    'PSP и агрегаторы',
    'Local infrastructure. Relevant merchant demand.',
    'Локальная инфраструктура. Целевые мерчанты.',
    'Source country-specific collection and payout relationships, or introduce your infrastructure to eligible merchants. Agree responsibilities before an introduction.',
    'Поиск локального приёма и выплат или предложение инфраструктуры подходящим мерчантам. Ответственность согласуется до знакомства.',
  ],
  [
    'local-partner',
    'Local payment partners',
    'Локальные платёжные партнёры',
    'International relationships for local expertise.',
    'Международные связи для локальной экспертизы.',
    'Present evidenced operating scope to PSPs and merchants with a specific need. Make supported methods, limits, settlement responsibilities and reporting explicit.',
    'Представьте подтверждённые возможности PSP и мерчантам с конкретной задачей. Методы, лимиты, ответственность и отчётность обсуждаются заранее.',
  ],
  [
    'otc',
    'Exchange & OTC businesses',
    'Обменные и OTC-компании',
    'Relevant counterparties. Defined corridors.',
    'Подходящие контрагенты. Определённые направления.',
    'Explore introductions for lawful liquidity, treasury or settlement relationships. Counterparties assess entity eligibility, assets and responsibilities directly.',
    'Знакомства для допустимых отношений по ликвидности и расчётам. Контрагенты самостоятельно проверяют юрлица, активы и ответственность.',
  ],
  [
    'affiliate',
    'Affiliates & B2B introducers',
    'Аффилиаты и B2B-рекомендатели',
    'Turn a relevant introduction into agreed earnings.',
    'Полезная рекомендация с договорным доходом.',
    'Register an opportunity before disclosing contacts. Agree attribution, exclusions, recurring duration and your share in writing. Sub-partner splits are explicit; collected fees support payouts.',
    'Зафиксируйте возможность до передачи контактов. Авторство, исключения, срок и доля — письменно. Доли субпартнёров фиксируются; выплаты опираются на полученные комиссии.',
  ],
  [
    'strategic',
    'Strategic partners',
    'Стратегические партнёры',
    'A joint commercial mandate with clear ownership.',
    'Совместная задача с понятной ответственностью.',
    'Build distribution, technology or market-entry relationships under a scoped commercial agreement: named owners, deliverables, reporting and a responsible payer.',
    'Партнёрства по дистрибуции, технологиям и выходу на рынок: ответственные, результаты, отчётность и плательщик фиксируются договором.',
  ],
];

export function CommercialPromise() {
  const { t } = useLocale();
  return (
    <section className="commercial-promise wrap" aria-labelledby="commercial-promise-title">
      <div>
        <Eyebrow>{t('THE COMMERCIAL CONNECTION', 'КОММЕРЧЕСКАЯ СВЯЗЬ')}</Eyebrow>
        <h2 id="commercial-promise-title">
          {t('The right people.', 'Нужные люди.')}
          <em>{t('A reason to do business.', 'Основа для бизнеса.')}</em>
        </h2>
      </div>
      <div className="commercial-promise-copy">
        <p>
          {t(
            'A merchant needs local payment acceptance. A PSP needs a capable local operator. An introducer knows the right business. VlaDDoS brings the brief, the counterparties and the commercial terms into one conversation.',
            'Мерчанту нужен локальный приём. PSP — компетентный местный оператор. Рекомендатель знает нужную компанию. VlaDDoS объединяет задачу, контрагентов и коммерческие условия в одном разговоре.',
          )}
        </p>
        <NLink className="text-link" to="/network#commercial-model">
          {t('Explore the commercial model', 'Как устроена коммерческая модель')}
          <ArrowUpRight size={18} />
        </NLink>
        <div className="commercial-proof-points">
          <span>{t('01 / Specific scope', '01 / Конкретная задача')}</span>
          <span>{t('02 / Permission to introduce', '02 / Разрешение на знакомство')}</span>
          <span>{t('03 / Written commercial terms', '03 / Письменные условия')}</span>
        </div>
      </div>
    </section>
  );
}

export function ParticipantEconomics() {
  const { t } = useLocale();
  return (
    <section className="participant-economics wrap" aria-labelledby="participant-economics-title">
      <Eyebrow>
        {t('SIX ROLES. SHARED COMMERCIAL VALUE.', 'ШЕСТЬ РОЛЕЙ. ОБЩАЯ КОММЕРЧЕСКАЯ ЦЕННОСТЬ.')}
      </Eyebrow>
      <h2 id="participant-economics-title">
        {t('Your place in', 'Ваше место')}
        <em>{t('the relationship.', 'в партнёрстве.')}</em>
      </h2>
      {relationships.map(([id, en, ru, result, resultRu, copy, copyRu], index) => (
        <details key={id}>
          <summary>
            <span>0{index + 1}</span>
            <h3>{t(en, ru)}</h3>
            <p>{t(result, resultRu)}</p>
            <ArrowUpRight size={20} aria-hidden="true" />
          </summary>
          <div>
            <p>{t(copy, copyRu)}</p>
            <nav aria-label={t(`${en} next steps`, `${ru}: следующие шаги`)}>
              <NLink to={scenarioLink(id, 'need')}>
                I NEED / {t('Find a partner', 'Найти партнёра')}
                <ArrowUpRight size={17} />
              </NLink>
              <NLink to={scenarioLink(id, 'offer')}>
                I OFFER / {t('Discuss a partnership', 'Предложить партнёрство')}
                <ArrowUpRight size={17} />
              </NLink>
            </nav>
          </div>
        </details>
      ))}
      <p className="commercial-public-note">
        {t(
          'VlaDDoS sources and introduces businesses. Contracted providers perform their own onboarding and deliver their services directly. We do not hold client funds, execute payments or claim a financial licence. Regions are sourcing priorities, not claims of available coverage.',
          'VlaDDoS ищет и знакомит компании. Провайдеры самостоятельно проводят подключение и оказывают услуги. Мы не храним клиентские средства, не исполняем платежи и не заявляем финансовую лицензию. Регионы — приоритеты поиска, а не обещание покрытия.',
        )}
      </p>
    </section>
  );
}
