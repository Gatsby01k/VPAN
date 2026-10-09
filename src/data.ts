export type RoleId = 'affiliate' | 'team' | 'provider' | 'merchant' | 'regional';
export type Region = 'Africa' | 'LATAM' | 'Asia';
export interface Market {
  slug: string;
  name: string;
  ru: string;
  code: string;
  region: Region;
  currency: string;
  methods: string[];
  focus: string;
  focusRu: string;
}

export const markets: Market[] = [
  {
    slug: 'india',
    name: 'India',
    ru: 'Индия',
    code: 'IN',
    region: 'Asia',
    currency: 'INR',
    methods: ['UPI', 'IMPS', 'NEFT'],
    focus: 'Bank and instant payment relationships',
    focusRu: 'Банковские и мгновенные платежи',
  },
  {
    slug: 'ghana',
    name: 'Ghana',
    ru: 'Гана',
    code: 'GH',
    region: 'Africa',
    currency: 'GHS',
    methods: ['Mobile Money', 'Bank Transfers'],
    focus: 'Mobile Money and local payment expertise',
    focusRu: 'Mobile Money и экспертиза местных команд',
  },
  {
    slug: 'kenya',
    name: 'Kenya',
    ru: 'Кения',
    code: 'KE',
    region: 'Africa',
    currency: 'KES',
    methods: ['M-Pesa', 'Airtel Money', 'Bank Transfers'],
    focus: 'Experienced mobile money operators',
    focusRu: 'Опытные операторы мобильных платежей',
  },
  {
    slug: 'peru',
    name: 'Peru',
    ru: 'Перу',
    code: 'PE',
    region: 'LATAM',
    currency: 'PEN',
    methods: ['Yape', 'Plin', 'Bank Transfers'],
    focus: 'Local wallets and payment integrations',
    focusRu: 'Локальные кошельки и платёжные интеграции',
  },
  {
    slug: 'colombia',
    name: 'Colombia',
    ru: 'Колумбия',
    code: 'CO',
    region: 'LATAM',
    currency: 'COP',
    methods: ['PSE', 'Bre-B', 'Bank Transfers'],
    focus: 'Instant payment and banking relationships',
    focusRu: 'Мгновенные платежи и банковские партнёрства',
  },
  {
    slug: 'uganda',
    name: 'Uganda',
    ru: 'Уганда',
    code: 'UG',
    region: 'Africa',
    currency: 'UGX',
    methods: ['MTN MoMo', 'Airtel Money'],
    focus: 'Established local Mobile Money partners',
    focusRu: 'Локальные партнёры Mobile Money',
  },
  {
    slug: 'tanzania',
    name: 'Tanzania',
    ru: 'Танзания',
    code: 'TZ',
    region: 'Africa',
    currency: 'TZS',
    methods: ['M-Pesa', 'Mobile Money'],
    focus: 'Mobile Money network operators',
    focusRu: 'Операторы сети мобильных платежей',
  },
  {
    slug: 'nigeria',
    name: 'Nigeria',
    ru: 'Нигерия',
    code: 'NG',
    region: 'Africa',
    currency: 'NGN',
    methods: ['Bank Transfers', 'Local PSPs'],
    focus: 'Bank transfer and provider introductions',
    focusRu: 'Банковские переводы и знакомства с PSP',
  },
  {
    slug: 'mexico',
    name: 'Mexico',
    ru: 'Мексика',
    code: 'MX',
    region: 'LATAM',
    currency: 'MXN',
    methods: ['SPEI', 'Bank Transfers'],
    focus: 'Local bank payment integrations',
    focusRu: 'Интеграции местных банковских платежей',
  },
  {
    slug: 'south-africa',
    name: 'South Africa',
    ru: 'ЮАР',
    code: 'ZA',
    region: 'Africa',
    currency: 'ZAR',
    methods: ['Bank Transfers', 'Local PSPs'],
    focus: 'Established PSPs and commercial introductions',
    focusRu: 'PSP и коммерческие знакомства',
  },
];

export const roles = [
  {
    id: 'affiliate',
    path: '/affiliates',
    title: 'Affiliates',
    ru: 'Аффилиаты',
    short: 'Your connections. New possibilities.',
    shortRu: 'Ваши связи. Новые возможности.',
    description:
      'Introduce experienced teams, PSPs and merchants. Discuss attribution and commercial terms before making introductions.',
    descriptionRu:
      'Знакомьте PAN с опытными командами, PSP и мерчантами. Согласовывайте авторство рекомендации и условия до знакомства.',
    label: 'Connect the right people.',
    labelRu: 'Соединяйте нужных людей.',
    art: 'network-crown.webp',
  },
  {
    id: 'team',
    path: '/teams',
    title: 'Payment teams',
    ru: 'Платёжные команды',
    short: 'Local expertise. A bigger network.',
    shortRu: 'Локальная экспертиза. Больше связей.',
    description:
      'Tell us where your team operates, which methods you understand and the opportunities you are looking for.',
    descriptionRu:
      'Расскажите, где работает ваша команда, какие методы вы знаете и какие партнёрства вам интересны.',
    label: 'Bring your local edge.',
    labelRu: 'Используйте свою экспертизу.',
    art: 'server-crown.webp',
  },
  {
    id: 'provider',
    path: '/payment-partners',
    title: 'Payment partners',
    ru: 'Платёжные партнёры',
    short: 'Your solution. The right counterpart.',
    shortRu: 'Ваше решение. Нужный партнёр.',
    description:
      'Connect your local payment expertise with relevant commercial relationships in the markets you actually support.',
    descriptionRu:
      'Находите подходящие коммерческие связи в рынках, которые действительно поддерживает ваше платёжное решение.',
    label: 'Open the next market.',
    labelRu: 'Откройте следующий рынок.',
    art: 'market-landscape.webp',
  },
  {
    id: 'merchant',
    path: '/merchants',
    title: 'Merchants',
    ru: 'Мерчанты',
    short: 'A clear brief. Relevant introductions.',
    shortRu: 'Понятный запрос. Подходящие связи.',
    description:
      'Share your business category, target markets and payment requirements. Start a focused conversation about suitable partners.',
    descriptionRu:
      'Опишите бизнес-категорию, рынки и платёжные требования. Начните предметный разговор о подходящих партнёрах.',
    label: 'Find your next fit.',
    labelRu: 'Найдите подходящее решение.',
    art: 'access-card.webp',
  },
  {
    id: 'regional',
    path: '/apply?role=regional',
    title: 'Regional partners',
    ru: 'Региональные партнёры',
    short: 'Know the people. Know the market.',
    shortRu: 'Знайте людей. Знайте рынок.',
    description:
      'Bring direct local relationships and practical market knowledge to a private business network.',
    descriptionRu:
      'Привносите прямые местные связи и практическое знание рынка в закрытую бизнес-сеть.',
    label: 'Make local knowledge count.',
    labelRu: 'Превратите знания в возможности.',
    art: 'pan-gold.webp',
  },
] as const;

export const statuses = ['new', 'review', 'qualified', 'discussion', 'agreed', 'closed'] as const;
export type ApplicationStatus = (typeof statuses)[number];
export interface Application {
  id: string;
  reference: string;
  created_at: string;
  role: RoleId;
  markets: string;
  name: string;
  company: string;
  email: string;
  telegram: string;
  size: string;
  category: string;
  methods: string;
  volume: string;
  experience: string;
  message: string;
  status: ApplicationStatus;
}

export function pageMeta(path: string) {
  const market = markets.find((m) => path === `/markets/${m.slug}`);
  const role = roles.find((r) => path === r.path);
  const names: Record<string, string> = {
    '/': 'PAN — Private Affiliate Network',
    '/markets': 'Markets — PAN',
    '/apply': 'Join the network — PAN',
    '/about': 'About PAN',
    '/privacy': 'Privacy — PAN',
    '/terms': 'Terms — PAN',
    '/admin': 'Partner desk — PAN',
  };
  return {
    title: market
      ? `${market.name} partnerships — PAN`
      : role
        ? `${role.title} — PAN`
        : names[path] || 'Page not found — PAN',
    description: market
      ? `Explore ${market.name} partner introductions: ${market.methods.join(', ')}. ${market.focus}. Availability is reviewed individually.`
      : role
        ? role.description
        : 'PAN connects affiliates, payment teams, PSPs and merchants through private business partnerships across selected markets.',
  };
}
