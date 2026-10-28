import { companyTypes, scopeFromParams } from './network.ts';

// A scenario supplies context, never evidence of a participant's capabilities.
export const scenarios = [
  {
    id: 'merchant',
    en: 'International Merchant',
    ru: 'Международный мерчант',
    industry: 'commerce',
    side: 'need',
    capabilities: ['collections', 'payouts', 'local-methods', 'market-entry'],
    need: 'Describe your business category, customer market and payment flow.',
    needRu: 'Опишите категорию бизнеса, рынок клиентов и платёжный поток.',
    offer: 'Describe the distribution, customers or commercial opportunity you can bring.',
    offerRu: 'Опишите дистрибуцию, клиентов или коммерческую возможность, которую предлагаете.',
  },
  {
    id: 'psp',
    en: 'PSP / Payment Aggregator',
    ru: 'PSP / платёжный агрегатор',
    industry: 'payments',
    side: 'need',
    capabilities: ['local-methods', 'collections', 'payouts', 'psp', 'settlement'],
    need: 'Which local rails, countries and operating responsibilities are missing from your coverage?',
    needRu:
      'Каких локальных методов, стран и операционных возможностей не хватает вашему покрытию?',
    offer:
      'Describe your infrastructure, supported business categories and the partner you want to meet.',
    offerRu: 'Опишите инфраструктуру, допустимые категории бизнеса и нужного партнёра.',
  },
  {
    id: 'local-partner',
    en: 'Local Payment Partner',
    ru: 'Локальный платёжный партнёр',
    industry: 'payments',
    side: 'offer',
    capabilities: ['collections', 'payouts', 'local-methods', 'settlement', 'merchant-access'],
    need: 'What distribution, technology or international PSP relationship do you need?',
    needRu: 'Какие каналы продаж, технологии или отношения с международным PSP вам нужны?',
    offer: 'Describe collection, payouts, settlement and your operating role in this country.',
    offerRu: 'Опишите приём, выплаты, расчёты и вашу операционную роль в этой стране.',
  },
  {
    id: 'otc',
    en: 'Exchange / OTC Business',
    ru: 'Обменный / OTC-бизнес',
    industry: 'exchange',
    side: 'need',
    capabilities: ['liquidity', 'settlement', 'local-methods', 'strategic'],
    need: 'Describe the corridor, assets and counterparty role you need. Keep account details private.',
    needRu:
      'Опишите направление, активы и роль нужного контрагента. Не указывайте реквизиты счетов.',
    offer: 'Describe the corridors, assets and services your business can support.',
    offerRu: 'Опишите направления, активы и услуги, которые поддерживает ваш бизнес.',
  },
  {
    id: 'affiliate',
    en: 'Affiliate / B2B Introducer',
    ru: 'Аффилиат / B2B-рекомендатель',
    industry: '',
    side: 'offer',
    capabilities: ['merchant-access', 'market-entry', 'strategic'],
    need: 'Describe the kind of business relationship you want to originate.',
    needRu: 'Опишите деловые отношения, которые хотите организовать.',
    offer:
      'Describe your access and commercial interest. Share third-party contacts only after permission.',
    offerRu:
      'Опишите свои связи и коммерческий интерес. Передавайте чужие контакты только с разрешения.',
  },
  {
    id: 'strategic',
    en: 'Strategic Partner',
    ru: 'Стратегический партнёр',
    industry: '',
    side: 'offer',
    capabilities: ['strategic', 'market-entry', 'psp'],
    need: 'What joint project or market expansion would a relevant partner make possible?',
    needRu: 'Какой совместный проект или выход на рынок станет возможен с подходящим партнёром?',
    offer:
      'Describe your expertise, distribution or technology and the proposed commercial outcome.',
    offerRu: 'Опишите экспертизу, дистрибуцию или технологии и ожидаемый коммерческий результат.',
  },
] as const;
export const scenarioFor = (id: string) =>
  scenarios.find((s) => s.id === (id === 'liquidity' ? 'otc' : id));
export function briefEntry(path: string, params: URLSearchParams) {
  const scope = scopeFromParams(params);
  return JSON.stringify({ path, ...scope });
}
export function scenarioLink(id: string, side?: 'need' | 'offer') {
  const scenario = scenarioFor(id);
  const params = new URLSearchParams({ companyType: id });
  if (scenario?.industry) params.set('industry', scenario.industry);
  return ((side || scenario?.side) === 'offer' ? '/join' : '/find-a-partner') + '?' + params;
}
export function validCompanyType(id: string | null) {
  return companyTypes.some((c) => c.id === id) ? id! : '';
}
