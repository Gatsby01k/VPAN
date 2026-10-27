import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, Check, Copy, LoaderCircle } from 'lucide-react';
import { markets, roles, type RoleId } from '../data';
import { useLocale } from '../locale';
import { acquisition } from '../components/acquisition';
import { SceneArt } from '../components/Editorial';

const DRAFT_KEY = 'pan-application-v2';
const categories = ['iGaming', 'Exchange', 'e-commerce', 'other'];
const emailPattern = /^\S+@\S+\.\S+$/;
const telegramPattern = /^@[A-Za-z][A-Za-z0-9_]{4,31}$/;
interface Draft {
  requestId: string;
  role: RoleId;
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
function initialDraft(params: URLSearchParams): Draft {
  const role = roles.find((r) => r.id === params.get('role'))?.id || 'affiliate';
  const chosen = markets.filter((m) =>
    [...(params.get('markets') || '').split(','), params.get('market')].includes(m.slug),
  );
  return {
    requestId: '',
    role,
    markets: chosen.length ? chosen.map((m) => m.name) : ['Ghana'],
    category: categories.includes(params.get('category') || '')
      ? params.get('category')!
      : 'Exchange',
    contact: '',
    name: '',
    company: '',
    email: '',
    telegram: '',
    size: '',
    methods: params.get('methods') || '',
    volume: '',
    experience: '',
    message: '',
    site: '',
  };
}

export default function ApplyPage() {
  const { t } = useLocale();
  const [params] = useSearchParams();
  const entry = new URLSearchParams();
  for (const key of ['role', 'market', 'markets', 'methods', 'category', 'source']) {
    const value = params.get(key);
    if (value !== null) entry.set(key, value);
  }
  const query = entry.toString();
  const [draft, setDraft] = useState(() => initialDraft(params));
  const [ready, setReady] = useState(false);
  const [sending, setSending] = useState(false);
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    controller.current?.abort();
    setSending(false);
    setReference('');
    setError('');
    setCopied(false);
    const current = new URLSearchParams(query);
    let next = initialDraft(current);
    try {
      const stored = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || 'null');
      if (stored?.version === 2 && stored.draft && typeof stored.draft === 'object') {
        const saved = stored.draft;
        for (const key of Object.keys(next) as (keyof Draft)[]) {
          if (key !== 'markets' && typeof saved[key] === 'string')
            Object.assign(next, { [key]: saved[key] });
        }
        if (!roles.some((r) => r.id === next.role)) next.role = 'affiliate';
        if (Array.isArray(saved.markets)) {
          const valid = saved.markets.filter(
            (v: unknown): v is string =>
              typeof v === 'string' && v.trim().length > 0 && v.length <= 60,
          );
          if (valid.length) next.markets = valid.slice(0, 10);
        }
        if (typeof stored.otherMarkets === 'string') {
          next.markets = [
            ...new Set([
              ...next.markets,
              ...stored.otherMarkets
                .split(',')
                .map((v: string) => v.trim())
                .filter((v: string) => v.length > 0 && v.length <= 60),
            ]),
          ].slice(0, 10);
        }
        if (!categories.includes(next.category)) next.category = 'Exchange';
        next.contact = next.contact || next.email || next.telegram;
        if (stored.entry !== query) {
          const incoming = initialDraft(current);
          if (current.has('role')) next.role = incoming.role;
          if (current.has('market') || current.has('markets')) next.markets = incoming.markets;
          if (current.has('category')) next.category = incoming.category;
          if (current.has('methods')) next.methods = incoming.methods;
        }
      }
    } catch {
      /* The form also works without browser storage. */
    }
    if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(next.requestId))
      next.requestId = crypto.randomUUID();
    setDraft(next);
    setReady(true);
  }, [query]);
  useEffect(() => {
    if (!ready || reference) return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ version: 2, draft, entry: query }));
    } catch {
      /* Submission does not depend on storage. */
    }
  }, [draft, query, ready, reference]);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);
  useEffect(() => {
    if (reference) successRef.current?.focus();
  }, [reference]);
  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setError('');
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!ready || sending) return;
    const contact = draft.contact.trim();
    const isEmail = emailPattern.test(contact);
    if (!isEmail && !telegramPattern.test(contact)) {
      setError(
        t(
          'Enter a valid email or Telegram username, such as @yourname.',
          'Укажите корректный email или имя в Telegram, например @yourname.',
        ),
      );
      return;
    }
    const active = new AbortController();
    controller.current = active;
    setSending(true);
    setError('');
    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: active.signal,
        body: JSON.stringify({
          ...draft,
          contact: undefined,
          name: draft.name.trim() || contact,
          email: isEmail ? contact : '',
          telegram: isEmail ? '' : contact,
          attribution: acquisition(),
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          response.status === 429
            ? t(
                'Too many attempts. Please try again later.',
                'Слишком много попыток. Попробуйте позже.',
              )
            : t(
                'We could not save your details. Please check them and try again.',
                'Не удалось сохранить заявку. Проверьте данные и повторите отправку.',
              ),
        );
      if (!result || typeof result.reference !== 'string' || !result.reference.trim())
        throw new Error(
          t(
            'No confirmation received. Please retry.',
            'Подтверждение не получено. Повторите отправку.',
          ),
        );
      setReference(result.reference);
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        /* The server reference confirms the application. */
      }
    } catch (cause) {
      if (active.signal.aborted) return;
      setError(
        cause instanceof TypeError
          ? t(
              'Connection interrupted. Your draft is saved; retry to confirm the same request.',
              'Соединение прервано. Черновик сохранён; повторите отправку той же заявки.',
            )
          : cause instanceof Error
            ? cause.message
            : t('Please try again.', 'Повторите отправку.'),
      );
    } finally {
      if (controller.current === active) controller.current = null;
      if (!active.signal.aborted) setSending(false);
    }
  };
  const knownMarket = markets.find((m) => m.name === draft.markets[0]);
  const currentMarket = knownMarket || {
    ...markets[1],
    name: draft.markets[0] || 'Ghana',
    ru: draft.markets[0] || 'Гана',
    currency: '—',
  };
  const roleOptions: { id: RoleId; label: string }[] = [
    { id: 'affiliate', label: t('Affiliate', 'Аффилиат') },
    { id: 'provider', label: t('Payment partner', 'Платёжный партнёр') },
    { id: 'merchant', label: t('Business', 'Бизнес') },
  ];
  if (draft.role === 'team' || draft.role === 'regional')
    roleOptions.push({
      id: draft.role,
      label: t(
        roles.find((r) => r.id === draft.role)!.title,
        roles.find((r) => r.id === draft.role)!.ru,
      ),
    });
  return (
    <section className="editorial-scene contact-scene" aria-labelledby="contact-title">
      <SceneArt name="contact" priority />
      <div className="scene-copy contact-copy">
        <h1 className="editorial-title" id="contact-title">
          {t('Take the', 'Возьмите')}
          <em>{t('other end.', 'другой конец.')}</em>
        </h1>
        <p className="scene-subtitle">
          {t(
            'A few details to start the right conversation.',
            'Несколько деталей для нужного разговора.',
          )}
        </p>
        {reference ? (
          <div className="contact-success" role="status">
            <span className="thread-eye">
              <Check size={22} aria-hidden="true" />
            </span>
            <h2 ref={successRef} tabIndex={-1}>
              {t('The thread is yours.', 'Связь установлена.')}
            </h2>
            <p>
              {t(
                'Your application is saved. We’ll use your contact details to continue the conversation.',
                'Заявка сохранена. Мы свяжемся с вами по указанному контакту.',
              )}
            </p>
            <span className="folio">{reference}</span>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(reference);
                  setCopied(true);
                } catch {
                  setError(
                    t('Select and copy the reference above.', 'Выделите и скопируйте номер выше.'),
                  );
                }
              }}
            >
              <Copy size={16} />
              {copied ? t('Copied', 'Скопировано') : t('Copy reference', 'Скопировать номер')}
            </button>
            <Link to="/markets">
              {t('Explore markets', 'Изучить рынки')} <ArrowUpRight size={17} />
            </Link>
          </div>
        ) : (
          <form className="thread-form" onSubmit={submit} aria-busy={sending}>
            <fieldset disabled={sending} className="thread-form-fields">
              <div className="thread-form-row">
                <span className="form-number">01</span>
                <span className="form-prompt" id="role-label">
                  {t('Your role', 'Ваша роль')}
                </span>
                <div className="inline-options" role="group" aria-labelledby="role-label">
                  {roleOptions.map((option) => (
                    <button
                      type="button"
                      key={option.id}
                      aria-pressed={draft.role === option.id}
                      onClick={() => update('role', option.id)}
                    >
                      {option.label}
                      {draft.role === option.id && <Check size={15} />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="thread-form-row market-form-row">
                <span className="form-number">02</span>
                <label className="form-prompt" htmlFor="contact-market">
                  {t('Your market', 'Ваш рынок')}
                </label>
                <div className="thread-market">
                  <select
                    id="contact-market"
                    value={currentMarket.name}
                    onChange={(e) =>
                      update('markets', [
                        e.target.value,
                        ...draft.markets.slice(1).filter((m) => m !== e.target.value),
                      ])
                    }
                  >
                    {!knownMarket && (
                      <option value={currentMarket.name}>{currentMarket.name}</option>
                    )}
                    {markets.map((m) => (
                      <option value={m.name} key={m.slug}>
                        {t(m.name, m.ru)} / {m.currency}
                      </option>
                    ))}
                  </select>
                  <ArrowDown size={17} aria-hidden="true" />
                </div>
                <span className="form-prompt sector-prompt" id="sector-label">
                  {t('Your sector', 'Ваша сфера')}
                </span>
                <div
                  className="inline-options sector-options"
                  role="group"
                  aria-labelledby="sector-label"
                >
                  {categories.map((category) => (
                    <button
                      type="button"
                      key={category}
                      aria-pressed={draft.category === category}
                      onClick={() => update('category', category)}
                    >
                      {category === 'other' ? t('Other', 'Другая') : category}
                      {draft.category === category && <Check size={15} />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="thread-contact-fields">
                <span className="form-number">03</span>
                <p>{t('How can we reach you?', 'Как с вами связаться?')}</p>
                <label htmlFor="thread-contact">
                  {t('Telegram or email', 'Telegram или email')}
                </label>
                <input
                  id="thread-contact"
                  name="contact"
                  value={draft.contact}
                  onChange={(e) => update('contact', e.target.value)}
                  required
                  maxLength={180}
                  autoCapitalize="none"
                  spellCheck={false}
                  autoComplete="email"
                  placeholder="@yourname or you@company.com"
                  aria-describedby={error ? 'contact-error' : undefined}
                />
                <label htmlFor="thread-message">
                  {t(
                    'A few words about your connection (optional)',
                    'Несколько слов о вашем предложении (необязательно)',
                  )}
                </label>
                <textarea
                  id="thread-message"
                  name="message"
                  value={draft.message}
                  onChange={(e) => update('message', e.target.value)}
                  maxLength={2500}
                  placeholder={t(
                    'Tell us what you’re building...',
                    'Расскажите, над чем работаете...',
                  )}
                  rows={3}
                />
                <details className="contact-more">
                  <summary>
                    {t('Add company or operational details', 'Добавить компанию или детали работы')}
                  </summary>
                  <div className="contact-extra-grid">
                    {(
                      [
                        ['name', t('Your name', 'Ваше имя')],
                        ['company', t('Company', 'Компания')],
                        ['methods', t('Payment methods', 'Платёжные методы')],
                        ['volume', t('Monthly volume', 'Месячный объём')],
                        ['experience', t('Experience', 'Опыт')],
                        ['size', t('Team size', 'Размер команды')],
                      ] as const
                    ).map(([key, label]) => (
                      <label key={key}>
                        {label}
                        <input
                          name={key}
                          value={draft[key]}
                          onChange={(e) => update(key, e.target.value)}
                          minLength={key === 'name' ? 2 : undefined}
                          maxLength={180}
                        />
                      </label>
                    ))}
                  </div>
                  {draft.markets.length > 1 && (
                    <p>
                      {t('Selected markets', 'Выбранные рынки')}: {draft.markets.join(', ')}
                    </p>
                  )}
                </details>
              </div>
              <label className="honeypot" aria-hidden="true">
                Website
                <input
                  name="site"
                  value={draft.site}
                  onChange={(e) => update('site', e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </label>
              <button className="thread-submit" type="submit" disabled={!ready || sending}>
                {sending ? (
                  <LoaderCircle className="spin" size={20} />
                ) : (
                  <>
                    {t('Start a conversation', 'Начать разговор')}
                    <ArrowUpRight size={24} />
                  </>
                )}
              </button>
              <p className="contact-terms">
                {t(
                  'We’ll discuss fit and terms before introductions.',
                  'Совместимость и условия обсудим до знакомства.',
                )}
              </p>
            </fieldset>
          </form>
        )}
        <p
          id="contact-error"
          ref={errorRef}
          className="form-error"
          role="alert"
          tabIndex={-1}
          hidden={!error}
        >
          {error}
        </p>
        <div className="contact-foot">
          <span>
            {roleOptions.find((r) => r.id === draft.role)?.label || draft.role} <i>/</i>{' '}
            {t(currentMarket.name, currentMarket.ru)} <i>/</i>{' '}
            {draft.category === 'other' ? t('Other', 'Другая') : draft.category}
          </span>
          <Link to="/privacy">{t('Privacy', 'Конфиденциальность')}</Link>
          <a href="mailto:hello@vladdos.com">hello@vladdos.com</a>
        </div>
      </div>
      <span className="contact-you folio" aria-hidden="true">
        {t('YOU', 'ВЫ')}
      </span>
    </section>
  );
}
