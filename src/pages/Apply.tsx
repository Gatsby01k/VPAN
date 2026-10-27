import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronDown, ArrowUpRight, Check, Copy, LoaderCircle, X } from 'lucide-react';
import { markets, roles, type RoleId } from '../data';
import { useLocale } from '../locale';
import { acquisition } from '../components/acquisition';
import { SceneArt } from '../components/Editorial';
import { countryGroups, findRegion, regionForCountry } from '../geography';
import {
  initialApplication,
  restoreApplication,
  validateApplication,
  applicationEntry,
  applicationCategories,
  applicationEmail,
  cleanMethods,
  type ApplicationDraft as Draft,
} from '../application';

const DRAFT_KEY = 'pan-application-v2';
const categories = applicationCategories;
const emailPattern = /^\S+@\S+\.\S+$/;
const RECEIPT_KEY = 'pan-application-receipt-v1';

export default function ApplyPage() {
  const { language, t } = useLocale();
  const [params] = useSearchParams();
  const query = applicationEntry(params);
  const [draft, setDraft] = useState(() => initialApplication(params));
  const [ready, setReady] = useState(false);
  const [sending, setSending] = useState(false);
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const [errorField, setErrorField] = useState('');
  const [copied, setCopied] = useState(false);
  const [service, setService] = useState<'checking' | 'online' | 'offline'>('checking');
  const [emailReady, setEmailReady] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const health = new AbortController();
    const timeout = window.setTimeout(() => health.abort(), 5000);
    let mounted = true;
    fetch('/health', { signal: health.signal, cache: 'no-store' })
      .then(async (response) => {
        const result = await response.json().catch(() => null);
        if (mounted) setService(response.ok && result?.status === 'ok' ? 'online' : 'offline');
      })
      .catch(() => {
        if (mounted) setService('offline');
      })
      .finally(() => window.clearTimeout(timeout));
    return () => {
      mounted = false;
      health.abort();
      window.clearTimeout(timeout);
    };
  }, []);
  useEffect(() => {
    controller.current?.abort();
    setSending(false);
    setReference('');
    setError('');
    setCopied(false);
    setEmailReady(false);
    setEmailCopied(false);
    const current = new URLSearchParams(query);
    let next = initialApplication(current);
    try {
      next = restoreApplication(current, JSON.parse(sessionStorage.getItem(DRAFT_KEY) || 'null'));
      const receipt = JSON.parse(sessionStorage.getItem(RECEIPT_KEY) || 'null');
      if (receipt?.entry === query && /^PAN-\d{4}-[A-F0-9]{8}$/.test(receipt.reference)) {
        setReference(receipt.reference);
        if (receipt.context)
          next = restoreApplication(current, {
            version: 2,
            draft: { ...next, ...receipt.context },
            entry: query,
          });
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
    if (error) {
      const target = errorField && document.getElementById(errorField);
      (target || errorRef.current)?.focus({ preventScroll: true });
      (target || errorRef.current)?.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
  }, [error, errorField]);
  useEffect(() => {
    if (reference) successRef.current?.focus();
  }, [reference]);
  useEffect(() => {
    if (emailReady) emailRef.current?.focus();
  }, [emailReady]);
  const updateFields = (values: Partial<Draft>) => {
    setDraft((current) => ({ ...current, ...values, requestId: crypto.randomUUID() }));
    setError('');
    setErrorField('');
    setEmailReady(false);
    setEmailCopied(false);
  };
  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => updateFields({ [key]: value });
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!ready || sending) return;
    const invalid = validateApplication(draft);
    if (invalid) {
      setErrorField(invalid.field);
      setError(t(invalid.en, invalid.ru));
      return;
    }
    if (service === 'offline') {
      setEmailReady(true);
      return;
    }
    const contact = draft.contact.trim();
    const isEmail = emailPattern.test(contact);
    const active = new AbortController();
    controller.current = active;
    setSending(true);
    setError('');
    setErrorField('');
    let timedOut = false;
    const timeout = window.setTimeout(() => {
      timedOut = true;
      active.abort();
    }, 20000);
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
      if (active.signal.aborted) return;
      if ([404, 405, 503].includes(response.status)) {
        setService('offline');
        setEmailReady(true);
        throw new Error(
          t(
            'The online form is temporarily unavailable. Your draft is saved. Email hello@vladdos.com to continue.',
            'Онлайн-форма временно недоступна. Черновик сохранён. Напишите на hello@vladdos.com, чтобы продолжить.',
          ),
        );
      }
      if (response.status === 409) {
        setDraft((current) => ({ ...current, requestId: crypto.randomUUID() }));
        throw new Error(
          t(
            'Your details changed after an earlier submission. Please submit the updated introduction again.',
            'Данные изменились после предыдущей отправки. Отправьте обновлённую заявку ещё раз.',
          ),
        );
      }
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
        sessionStorage.setItem(
          RECEIPT_KEY,
          JSON.stringify({
            reference: result.reference,
            entry: query,
            context: {
              role: draft.role,
              region: draft.region,
              markets: draft.markets,
              category: draft.category,
            },
          }),
        );
      } catch {
        /* The server reference confirms the application. */
      }
    } catch (cause) {
      if (active.signal.aborted && !timedOut) return;
      setError(
        timedOut
          ? t(
              'The server took too long. Your draft is saved; please retry.',
              'Сервер не ответил вовремя. Черновик сохранён; повторите отправку.',
            )
          : cause instanceof TypeError
            ? t(
                'Connection interrupted. Your draft is saved; retry to confirm the same request.',
                'Соединение прервано. Черновик сохранён; повторите отправку той же заявки.',
              )
            : cause instanceof Error
              ? cause.message
              : t('Please try again.', 'Повторите отправку.'),
      );
    } finally {
      window.clearTimeout(timeout);
      if (controller.current === active) controller.current = null;
      if (!active.signal.aborted || timedOut) setSending(false);
    }
  };
  const knownMarket = markets.find((country) => country.name === draft.markets[0]);
  const currentRegion = findRegion(draft.region);
  const groups = countryGroups(markets, language);
  const email = applicationEmail(draft, language);
  const roleOptions: { id: RoleId; label: string }[] = [
    { id: 'affiliate', label: t('Affiliate', 'Аффилиат') },
    { id: 'provider', label: t('Payment provider', 'Платёжный провайдер') },
    { id: 'merchant', label: t('Business', 'Бизнес') },
    { id: 'team', label: t('Payment team', 'Платёжная команда') },
    { id: 'regional', label: t('Regional partner', 'Региональный партнёр') },
  ];
  const startAnother = () => {
    try {
      sessionStorage.removeItem(RECEIPT_KEY);
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      /* Local reset also works without storage. */
    }
    setReference('');
    setCopied(false);
    setError('');
    setErrorField('');
    setDraft({ ...initialApplication(new URLSearchParams(query)), requestId: crypto.randomUUID() });
  };
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
            <button className="start-another" onClick={startAnother}>
              {t('Start another introduction', 'Создать новую заявку')}
              <ArrowUpRight size={18} aria-hidden="true" />
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
                <label className="form-prompt" htmlFor="contact-region">
                  {draft.markets.length > 1
                    ? t('Main region', 'Основной регион')
                    : t('Your region', 'Ваш регион')}
                </label>
                <div className="thread-market">
                  <select
                    id="contact-region"
                    value={draft.region}
                    required
                    aria-invalid={errorField === 'contact-region'}
                    onChange={(e) =>
                      updateFields({ region: e.target.value, markets: [], methods: '' })
                    }
                  >
                    <option value="" disabled>
                      {t('Choose a region', 'Выберите регион')}
                    </option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {t(group.name, group.ru)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} aria-hidden="true" />
                </div>
                <label className="form-prompt country-prompt" htmlFor="contact-market">
                  {draft.markets.length > 1
                    ? t('Main country', 'Основная страна')
                    : t('Your country', 'Ваша страна')}
                </label>
                <div className="thread-market country-select">
                  <select
                    id="contact-market"
                    value={knownMarket?.name || ''}
                    disabled={!currentRegion}
                    required
                    aria-invalid={errorField === 'contact-market'}
                    onChange={(e) =>
                      updateFields({
                        markets: [
                          e.target.value,
                          ...draft.markets.slice(1).filter((country) => country !== e.target.value),
                        ],
                        methods: '',
                      })
                    }
                  >
                    <option value="" disabled>
                      {t(
                        currentRegion ? 'Choose a country' : 'Choose a region first',
                        currentRegion ? 'Выберите страну' : 'Сначала выберите регион',
                      )}
                    </option>
                    {groups
                      .find((group) => group.id === currentRegion?.id)
                      ?.countries.map((country) => (
                        <option key={country.slug} value={country.name}>
                          {t(country.name, country.ru)} / {country.currency}
                        </option>
                      ))}
                  </select>
                  <ChevronDown size={18} aria-hidden="true" />
                </div>
                {draft.markets.length > 1 && (
                  <div className="application-countries">
                    <p>
                      {t('Additional countries from your brief', 'Дополнительные страны из брифа')}
                    </p>
                    {draft.markets.slice(1).map((country) => {
                      const area = regionForCountry(country);
                      const local = markets.find((item) => item.name === country);
                      return (
                        <button
                          type="button"
                          key={country}
                          aria-label={t(`Remove ${country}`, `Убрать: ${local?.ru || country}`)}
                          onClick={() => {
                            const countries = draft.markets.filter((value) => value !== country);
                            updateFields({
                              markets: countries,
                              methods: cleanMethods(draft.methods, countries),
                            });
                          }}
                        >
                          <span>
                            {local ? t(local.name, local.ru) : country}
                            <small>
                              {area ? t(area.name, area.ru) : ''}
                              {local ? ` / ${local.currency}` : ''}
                            </small>
                          </span>
                          <X size={16} aria-hidden="true" />
                        </button>
                      );
                    })}
                  </div>
                )}
                {draft.methods && (
                  <p className="application-methods">
                    {t('Methods to discuss', 'Методы для обсуждения')}: {draft.methods}
                  </p>
                )}
                <span className="form-prompt sector-prompt" id="sector-label" tabIndex={-1}>
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
                  aria-invalid={errorField === 'thread-contact'}
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
                  maxLength={1500}
                  placeholder={t(
                    'Tell us what you’re building...',
                    'Расскажите, над чем работаете...',
                  )}
                  rows={3}
                />
                <details className="contact-more" open={errorField === 'contact-name' || undefined}>
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
                          id={`contact-${key}`}
                          name={key}
                          value={draft[key]}
                          onChange={(e) => update(key, e.target.value)}
                          aria-invalid={errorField === `contact-${key}`}
                          maxLength={180}
                        />
                      </label>
                    ))}
                  </div>
                  {draft.markets.length > 1 && (
                    <p>
                      {t('Selected countries', 'Выбранные страны')}: {draft.markets.join(', ')}
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
              {service === 'offline' && (
                <p className="contact-service-note">
                  {t(
                    'Continue by email. Prepare your introduction below, then send it from your mail app.',
                    'Продолжим по email. Подготовьте заявку ниже и отправьте её из своей почты.',
                  )}
                </p>
              )}
              <button
                className="thread-submit"
                type="submit"
                disabled={!ready || sending || service === 'checking'}
              >
                {sending ? (
                  <LoaderCircle className="spin" size={20} />
                ) : (
                  <>
                    {service === 'offline'
                      ? t('Prepare email', 'Подготовить письмо')
                      : t('Start a conversation', 'Начать разговор')}
                    <ArrowUpRight size={24} />
                  </>
                )}
              </button>
              {emailReady && (
                <div className="contact-email-ready" ref={emailRef} tabIndex={-1} role="status">
                  <p>
                    {t(
                      'Your introduction is ready. Send it to hello@vladdos.com to start the conversation. It has not been submitted yet.',
                      'Заявка подготовлена. Отправьте её на hello@vladdos.com, чтобы начать разговор. Пока она ещё не отправлена.',
                    )}
                  </p>
                  <a href={email.href}>
                    {t('Open email app', 'Открыть почту')}{' '}
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </a>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(email.body);
                        setEmailCopied(true);
                      } catch {
                        setError(
                          t(
                            'Copy is unavailable. Use the email link or select the introduction below.',
                            'Копирование недоступно. Откройте почту или выделите текст заявки ниже.',
                          ),
                        );
                      }
                    }}
                  >
                    <Copy size={16} aria-hidden="true" />
                    {emailCopied
                      ? t('Copied', 'Скопировано')
                      : t('Copy introduction', 'Скопировать заявку')}
                  </button>
                  <details>
                    <summary>{t('Review introduction', 'Посмотреть текст заявки')}</summary>
                    <pre>{email.body}</pre>
                  </details>
                </div>
              )}
              <p className="contact-privacy">
                {t(
                  'We use these details to respond. Read our',
                  'Используем эти данные для ответа. Подробнее — в',
                )}{' '}
                <Link to="/privacy">{t('privacy notice', 'политике конфиденциальности')}</Link>.
              </p>
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
            {knownMarket
              ? draft.markets
                  .map((name) => {
                    const country = markets.find((item) => item.name === name);
                    return country ? t(country.name, country.ru) : name;
                  })
                  .join(', ')
              : t('Country not selected', 'Страна не выбрана')}{' '}
            <i>/</i>{' '}
            {draft.category === 'other'
              ? t('Other', 'Другая')
              : draft.category || t('Sector not selected', 'Сфера не выбрана')}
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
