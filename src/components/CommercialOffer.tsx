import { SignatureArrow } from './ConnectionProtocol';
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
            <SignatureArrow />
          </summary>
          <div>
            <p>{t(copy, copyRu)}</p>
            <nav aria-label={t(`${en} next steps`, `${ru}: следующие шаги`)}>
              <NLink to={scenarioLink(id, 'need')}>
                I NEED / {t('Find a partner', 'Найти партнёра')}
                <SignatureArrow />
              </NLink>
              <NLink to={scenarioLink(id, 'offer')}>
                I OFFER / {t('Discuss a partnership', 'Предложить партнёрство')}
                <SignatureArrow />
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
