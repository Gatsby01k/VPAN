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
    description: ru
      ? 'Независимая международная B2B-сеть: поиск партнёров, локальная экспертиза и квалифицированные знакомства в Азии, Латинской Америке и Африке. Доступность проверяется по каждому запросу.'
      : 'An independent international B2B network for partner sourcing, local expertise and qualified introductions across Asia, Latin America and Africa. Every opportunity is reviewed individually.',
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
    region: selected[0]?.region || regions.find((r) => r.id === params.get('region'))?.id || '',
    countries: selected.map((c) => c.id),
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
