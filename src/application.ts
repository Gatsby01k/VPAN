import { markets, roles, type RoleId } from './data.ts';
import { findRegion, regionForCountry } from './geography.ts';

export const applicationCategories = ['iGaming', 'Exchange', 'e-commerce', 'other'];
export const applicationEntry = (params: URLSearchParams) => {
  const entry = new URLSearchParams();
  for (const key of ['role', 'region', 'market', 'markets', 'methods', 'category', 'source']) {
    const value = params.get(key);
    if (value !== null) entry.set(key, value);
  }
  return entry.toString();
};
export interface ApplicationDraft {
  requestId: string;
  role: RoleId;
  region: string;
  markets: string[];
  category: string;
  contact: string;
  name: string;
  company: string;
  email: string;
  telegram: string;
  size: string;
  methods: string;
  volume: string;
  experience: string;
  message: string;
  site: string;
}
const list = (raw: string | null) =>
  (raw || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
export const cleanMethods = (value: string, countries: string[]) => {
  const allowed = new Set(
    markets
      .filter((country) => countries.includes(country.name))
      .flatMap((country) => country.methods),
  );
  return [...new Set(list(value).filter((method) => allowed.has(method)))].join(', ');
};
export function initialApplication(params: URLSearchParams): ApplicationDraft {
  const slugs = [...new Set([...list(params.get('markets')), ...list(params.get('market'))])];
  const chosen = slugs
    .flatMap((slug) => {
      const country = markets.find((item) => item.slug === slug);
      return country ? [country.name] : [];
    })
    .slice(0, 10);
  return {
    requestId: '',
    role: roles.find((role) => role.id === params.get('role'))?.id || 'affiliate',
    region:
      (chosen.length ? regionForCountry(chosen[0]) : findRegion(params.get('region')))?.id || '',
    markets: chosen,
    category: applicationCategories.includes(params.get('category') || '')
      ? params.get('category')!
      : '',
    contact: '',
    name: '',
    company: '',
    email: '',
    telegram: '',
    size: '',
    methods: cleanMethods(params.get('methods') || '', chosen),
    volume: '',
    experience: '',
    message: '',
    site: '',
  };
}
export function restoreApplication(params: URLSearchParams, stored: unknown): ApplicationDraft {
  let next = initialApplication(params);
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return next;
  const record = stored as Record<string, unknown>;
  const draft = record.draft;
  if (record.version !== 2 || !draft || typeof draft !== 'object' || Array.isArray(draft))
    return next;
  const saved = draft as Record<string, unknown>;
  for (const key of Object.keys(next) as (keyof ApplicationDraft)[]) {
    if (key !== 'markets' && typeof saved[key] === 'string')
      Object.assign(next, {
        [key]: (saved[key] as string).slice(0, key === 'message' ? 1500 : 180),
      });
  }
  next.role = roles.find((role) => role.id === next.role)?.id || 'affiliate';
  const legacy = typeof record.otherMarkets === 'string' ? list(record.otherMarkets) : [];
  next.markets = [
    ...new Set(
      [...(Array.isArray(saved.markets) ? saved.markets : []), ...legacy]
        .filter(
          (value): value is string =>
            typeof value === 'string' && value.trim().length > 0 && value.length <= 60,
        )
        .map((value) => value.trim()),
    ),
  ].slice(0, 10);
  next.category = applicationCategories.includes(next.category) ? next.category : '';
  next.contact = next.contact || next.email || next.telegram;
  next.region =
    (next.markets.length ? regionForCountry(next.markets[0]) : findRegion(next.region))?.id || '';
  if (record.entry !== applicationEntry(params)) {
    const incoming = initialApplication(params);
    if (params.has('role')) next.role = incoming.role;
    if (params.has('market') || params.has('markets')) {
      next.markets = incoming.markets;
      next.region = incoming.region;
      next.methods = incoming.methods;
    } else if (params.has('region') && incoming.region !== next.region) {
      next.region = incoming.region;
      next.markets = [];
      next.methods = '';
    }
    if (params.has('category')) next.category = incoming.category;
    if (params.has('methods'))
      next.methods = cleanMethods(params.get('methods') || '', next.markets);
    next.requestId = '';
  }
  return next;
}
export function validateApplication(
  draft: ApplicationDraft,
): { field: string; en: string; ru: string } | null {
  if (!findRegion(draft.region))
    return { field: 'contact-region', en: 'Choose a region.', ru: 'Выберите регион.' };
  const primary = markets.find((country) => country.name === draft.markets[0]);
  if (!primary || regionForCountry(primary.name)?.id !== draft.region)
    return {
      field: 'contact-market',
      en: 'Choose a country in the selected region.',
      ru: 'Выберите страну в выбранном регионе.',
    };
  if (!draft.markets.length || draft.markets.length > 10 || draft.markets.join('').length > 250)
    return {
      field: 'contact-market',
      en: 'Check the selected countries.',
      ru: 'Проверьте выбранные страны.',
    };
  if (!applicationCategories.includes(draft.category))
    return {
      field: 'sector-label',
      en: 'Choose your business sector.',
      ru: 'Выберите сферу бизнеса.',
    };
  const contact = draft.contact.trim();
  if (!/^\S+@\S+\.\S+$/.test(contact) && !/^@[A-Za-z][A-Za-z0-9_]{4,31}$/.test(contact))
    return {
      field: 'thread-contact',
      en: 'Enter a valid email or Telegram username, such as @yourname.',
      ru: 'Укажите корректный email или имя в Telegram, например @yourname.',
    };
  if (draft.name.trim() && draft.name.trim().length < 2)
    return {
      field: 'contact-name',
      en: 'Use at least two characters for your name, or leave it empty.',
      ru: 'Укажите имя минимум из двух символов или оставьте поле пустым.',
    };
  return null;
}

// A static preview has no intake API. Keep the full introduction available to send by email.
export function applicationEmail(draft: ApplicationDraft, language: 'en' | 'ru') {
  const ru = language === 'ru';
  const role = roles.find((item) => item.id === draft.role);
  const label = (en: string, russian: string) => (ru ? russian : en);
  const countries = draft.markets.map((name) => {
    const country = markets.find((item) => item.name === name);
    const region = regionForCountry(name);
    return country
      ? `${ru ? country.ru : country.name} / ${region ? (ru ? region.ru : region.name) : ''} / ${country.currency}`
      : name;
  });
  const lines = [
    'PAN / VlaDDoS Network',
    `${label('Role', 'Роль')}: ${role ? (ru ? role.ru : role.title) : draft.role}`,
    `${label('Countries', 'Страны')}: ${countries.join('; ')}`,
    `${label('Sector', 'Сфера')}: ${draft.category === 'other' ? label('Other', 'Другая') : draft.category}`,
    `${label('Contact', 'Контакт')}: ${draft.contact.trim()}`,
    ...(
      [
        ['name', 'Name', 'Имя'],
        ['company', 'Company', 'Компания'],
        ['methods', 'Payment methods', 'Платёжные методы'],
        ['size', 'Team size', 'Размер команды'],
        ['volume', 'Volume', 'Объём'],
        ['experience', 'Experience', 'Опыт'],
        ['message', 'Introduction', 'Предложение'],
      ] as const
    ).flatMap(([key, en, russian]) =>
      draft[key].trim() ? [`${label(en, russian)}: ${draft[key].trim()}`] : [],
    ),
  ];
  const subject = label('Partnership introduction', 'Заявка на партнёрство');
  const body = lines.join('\n');
  return {
    body,
    href: `mailto:hello@vladdos.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  };
}
