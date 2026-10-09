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
      'Introduce experienced teams, PSPs and merchants to PAN. Agree referral attribution and commercial terms before making introductions.',
    descriptionRu:
      'Приводите в PAN опытные платёжные команды, PSP и мерчантов. Авторство рекомендаций и коммерческие условия обсуждаем до знакомства.',
    label: 'Bring the right partners to PAN.',
    labelRu: 'Приводите партнёров в PAN.',
    art: 'network-crown.webp',
  },
  {
    id: 'team',
    path: '/teams',
    title: 'Payment teams',
    ru: 'Платёжные команды',
    short: 'Local payment experience. A conversation with PAN.',
    shortRu: 'Локальный платёжный опыт. Партнёрство с PAN.',
    description:
      'Introduce your payment team to PAN: operating markets, payment methods, practical experience and a responsible contact.',
    descriptionRu:
      'Представьте свою платёжную команду PAN: рынки работы, методы, практический опыт и ответственный контакт.',
    label: 'Your team. Your local expertise.',
    labelRu: 'Ваша команда. Ваш локальный опыт.',
    art: 'server-crown.webp',
  },
  {
    id: 'provider',
    path: '/payment-partners',
    title: 'Payment partners',
    ru: 'Платёжные партнёры',
    short: 'Your infrastructure. Partnership with PAN.',
    shortRu: 'Ваша инфраструктура. Партнёрство с PAN.',
    description:
      'Propose your PSP or local payment solution to PAN. Discuss supported markets, business categories and integration requirements.',
    descriptionRu:
      'Предложите PAN свой PSP или локальное платёжное решение. Обсудим поддерживаемые рынки, категории бизнеса и требования к интеграции.',
    label: 'Bring your payment solution.',
    labelRu: 'Предложите платёжное решение.',
    art: 'market-landscape.webp',
  },
  {
    id: 'merchant',
    path: '/merchants',
    title: 'Merchants',
    ru: 'Мерчанты',
    short: 'Your business. A concrete payment brief.',
    shortRu: 'Ваш бизнес. Конкретный платёжный запрос.',
    description:
      'Tell PAN your business category, markets and payment requirements. We review fit and discuss possible cooperation individually.',
    descriptionRu:
      'Расскажите PAN о категории бизнеса, рынках и платёжных требованиях. Совместимость и возможности сотрудничества обсуждаем индивидуально.',
    label: 'Start with your business needs.',
    labelRu: 'Начнём с задач вашего бизнеса.',
    art: 'access-card.webp',
  },
  {
    id: 'regional',
    path: '/apply?role=regional',
    title: 'Regional partners',
    ru: 'Региональные партнёры',
    short: 'Know the people. Know the market.',
    shortRu: 'Знайте людей. Знайте рынок.',
    description: 'Introduce your local relationships and practical market knowledge to PAN.',
    descriptionRu: 'Представьте PAN свои локальные связи и практический опыт работы на рынке.',
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
  attribution: string;
}

export function pageMeta(path: string, language: 'en' | 'ru' = 'en') {
  const market = markets.find((m) => path === `/markets/${m.slug}`);
  const role = roles.find((r) => path === r.path);
  const names: Record<string, string> = {
    '/': 'PAN — Private Affiliate Network',
    '/markets': 'Markets — PAN',
    '/knowledge': 'Payment partner guides and checklists — PAN',
    '/apply': 'Join the network — PAN',
    '/about': 'About PAN',
    '/privacy': 'Privacy — PAN',
    '/terms': 'Terms — PAN',
    '/admin': 'Partner desk — PAN',
  };
  const namesRu: Record<string, string> = {
    '/': 'PAN — Частная партнёрская сеть',
    '/markets': 'Рынки партнёрства — PAN',
    '/knowledge': 'Руководства и чек-листы платёжных партнёров — PAN',
    '/apply': 'Заявка на партнёрство — PAN',
    '/about': 'О PAN',
    '/privacy': 'Конфиденциальность — PAN',
    '/terms': 'Условия — PAN',
    '/admin': 'Партнёрский отдел — PAN',
  };
  const ru = language === 'ru';
  return {
    title: market
      ? ru
        ? `${market.ru}: партнёрство — PAN`
        : `${market.name} partnerships — PAN`
      : role
        ? `${ru ? role.ru : role.title} — PAN`
        : (ru ? namesRu[path] : names[path]) ||
          (ru ? 'Страница не найдена — PAN' : 'Page not found — PAN'),
    description: market
      ? ru
        ? `${market.ru}: знакомства с партнёрами и методы ${market.methods.join(', ')}. ${market.focusRu}. Доступность рассматривается отдельно.`
        : `Explore ${market.name} partner introductions: ${market.methods.join(', ')}. ${market.focus}. Availability is reviewed individually.`
      : role
        ? ru
          ? role.descriptionRu
          : role.description
        : path === '/knowledge'
          ? ru
            ? 'Практические руководства и чек-листы для знакомства, оценки и подключения PSP, платёжных команд и мерчантов. Первоисточники и подготовка к разговору.'
            : 'Practical guides and checklists for introducing, evaluating and connecting PSPs, payment teams and merchants. Primary sources and preparation for a first conversation.'
          : ru
            ? 'PAN объединяет аффилиатов, платёжные команды, PSP и мерчантов через частные бизнес-партнёрства на выбранных рынках.'
            : 'PAN connects affiliates, payment teams, PSPs and merchants through private business partnerships across selected markets.',
  };
}
