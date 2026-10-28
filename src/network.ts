import taxonomy from '../shared/taxonomy.json' with { type: 'json' };
export const { regions, industries, capabilities, companyTypes, countries } = taxonomy;
export type Language = 'en' | 'ru';
export const label = (item: { en: string; ru: string } | undefined, language: Language) =>
  item?.[language] || '';
export const publicRoutes = [
  '/',
  '/network',
  '/industries',
  '/markets',
  '/find-a-partner',
  '/join',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/knowledge',
  ...countries.map((c) => '/markets/' + c.id),
];
export function networkMeta(path: string, language: Language = 'en') {
  path = path.replace(/\/+$/, '') || '/';
  const ru = language === 'ru';
  const titles: Record<string, [string, string]> = {
    '/': ['Partnerships beyond borders', 'Партнёрства без границ'],
    '/network': ['How the network works', 'Как работает сеть'],
    '/industries': ['Industries', 'Индустрии'],
    '/markets': ['Asia · Latin America · Africa', 'Азия · Латинская Америка · Африка'],
    '/find-a-partner': ['Find a partner', 'Найти партнёра'],
    '/join': ['Join the network', 'Стать партнёром'],
    '/contact': ['Start a conversation', 'Начать разговор'],
    '/about': ['Independent by design', 'Независимость как принцип'],
    '/privacy': ['Privacy', 'Конфиденциальность'],
    '/terms': ['Terms of introduction', 'Условия знакомства'],
    '/knowledge': ['Partner field notes', 'Заметки о партнёрствах'],
    '/admin': ['Deal Desk', 'Deal Desk'],
  };
  const country = countries.find((c) => path === '/markets/' + c.id);
  return {
    title: `${country ? label(country, language) + (ru ? ': партнёрства' : ' partnerships') : titles[path]?.[ru ? 1 : 0] || (ru ? 'Страница не найдена' : 'Page not found')} — VlaDDoS Network`,
    description: country
      ? ru
        ? `${country.ru}: ${country.currency}, ${country.methods.join(', ')} и поиск B2B-партнёров. Сведения об инфраструктуре; возможности провайдеров проверяются отдельно.`
        : `${country.en}: ${country.currency}, ${country.methods.join(', ')} and B2B partner sourcing. Infrastructure research; provider capabilities require individual verification.`
      : {
          '/': ru
            ? 'Соединяем международный бизнес с платёжными провайдерами, локальными операторами и коммерческими партнёрами в Азии, LATAM и Африке.'
            : 'Connecting international businesses with payment providers, local operators and commercial partners across Asia, LATAM and Africa.',
          '/find-a-partner': ru
            ? 'I NEED: опишите задачу, страну и нужные возможности. Конфиденциальный бриф для проверки и знакомства с подходящим B2B-партнёром.'
            : 'I NEED: define your business task, country and required capabilities. One private brief for qualification and a relevant B2B introduction.',
          '/join': ru
            ? 'I OFFER: представьте компанию, рынки и возможности. Deal Desk проверяет предложения до передачи потенциальным партнёрам.'
            : 'I OFFER: introduce your company, markets and capabilities. The Deal Desk qualifies every offer before sharing it with prospective partners.',
          '/network': ru
            ? 'От задачи или предложения к проверке, согласованному знакомству и подтверждённому коммерческому результату. Понятные условия до знакомства.'
            : 'From demand or supply to qualification, consented introductions and evidenced commercial outcomes. Commercial terms agreed before an introduction.',
          '/industries': ru
            ? 'Payments и Fintech, iGaming и беттинг, обмен и OTC, цифровая коммерция и другие B2B-задачи. Выберите контекст партнёрства.'
            : 'Payments & Fintech, iGaming & Betting, Exchange & OTC, Digital Commerce and other B2B opportunities. Choose the context for your partnership.',
          '/markets': ru
            ? 'Азия, Латинская Америка и Африка: страны, валюты, локальная платёжная инфраструктура и прозрачный статус исследования.'
            : 'Asia, Latin America and Africa: countries, currencies, local payment infrastructure and transparent research status.',
          '/about': ru
            ? 'VlaDDoS Network: независимая практика B2B-партнёрств и формирования сделок. Локальная экспертиза, проверка и конфиденциальность.'
            : 'VlaDDoS Network: an independent B2B partnership and deal origination practice built on local expertise, qualification and discretion.',
          '/contact': ru
            ? 'Обсудите B2B-задачу или предложение с VlaDDoS Network. Конфиденциальный бриф, прямой email и публичное Telegram-сообщество.'
            : 'Discuss a B2B need or offer with VlaDDoS Network. Private briefs, direct business email and the public Telegram community.',
        }[path] ||
        (ru
          ? 'Независимая международная B2B-сеть: поиск партнёров, локальная экспертиза и квалифицированные знакомства в Азии, Латинской Америке и Африке.'
          : 'Independent international B2B partner sourcing, local expertise and qualified introductions across Asia, Latin America and Africa.'),
    noindex: !publicRoutes.includes(path) && !/^\/knowledge\/[a-z0-9-]+$/.test(path),
  };
}

const legacyIndustries: Record<string, string> = {
  iGaming: 'igaming',
  Exchange: 'exchange',
  'e-commerce': 'commerce',
  other: 'other',
};
export function scopeFromParams(params: URLSearchParams) {
  const requested = [
    ...new Set(
      ['country', 'market', 'markets']
        .flatMap((k) => (params.get(k) || '').split(','))
        .filter(Boolean),
    ),
  ];
  const selected = requested
    .flatMap((id) => {
      const c = countries.find((c) => c.id === id);
      return c ? [c] : [];
    })
    .slice(0, 15);
  const industry = industries.some((i) => i.id === params.get('industry'))
    ? params.get('industry')!
    : legacyIndustries[params.get('category') || ''] || '';
  return {
    industry,
    companyType:
      companyTypes.find((c) => c.id === params.get('companyType'))?.id ||
      {
        provider: 'psp',
        regional: 'local-partner',
        affiliate: 'affiliate',
        team: 'strategic',
        merchant: 'merchant',
      }[params.get('role') || ''] ||
      '',
    targetType: companyTypes.find((c) => c.id === params.get('targetType'))?.id || '',
    region: selected[0]?.region || regions.find((r) => r.id === params.get('region'))?.id || '',
    countries: selected.map((c) => c.id),
    capabilities: [
      ...new Set(
        (params.get('capabilities') || '')
          .split(',')
          .filter((id) => capabilities.some((c) => c.id === id)),
      ),
    ],
    methods: (params.get('methods') || '').split(',').flatMap((raw) => {
      const method = selected
        .flatMap((c) => c.methods)
        .find((m) => m.toLowerCase() === raw.trim().toLowerCase());
      return method ? [method] : [];
    }),
  };
}
export function scopeFromLegacy(draft: Record<string, unknown>) {
  const params = new URLSearchParams();
  const names = Array.isArray(draft.markets) ? draft.markets : [];
  params.set(
    'markets',
    names
      .flatMap((name) => {
        const c = countries.find((c) => c.en === name || c.id === name);
        return c ? [c.id] : [];
      })
      .join(','),
  );
  for (const key of ['category', 'methods', 'region'])
    if (typeof draft[key] === 'string') params.set(key, draft[key]);
  return scopeFromParams(params);
}
