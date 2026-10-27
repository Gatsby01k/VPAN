import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { Check, ArrowRight, RotateCcw, Copy, Send, LoaderCircle } from 'lucide-react';
import { useLocale } from '../locale';
import {
  regions,
  industries,
  capabilities,
  companyTypes,
  countries,
  label,
  scopeFromParams,
  scopeFromLegacy,
} from '../network';
import { NLink, Eyebrow, Arrow } from '../components/NetworkLayout';
import { acquisition } from '../components/acquisition';

interface Brief {
  side: 'need' | 'offer';
  industry: string;
  region: string;
  countries: string[];
  capabilities: string[];
  methods: string[];
  settlementCurrencies: string[];
  companyType: string;
  targetType: string;
  company: string;
  contact: string;
  message: string;
  consent: boolean;
  site: string;
}
const KEY = 'vladdos-brief-v1',
  RECEIPT = 'vladdos-receipt-v1';
const toggle = (items: string[], value: string) =>
  items.includes(value) ? items.filter((i) => i !== value) : [...items, value];
export default function ConnectionEngine() {
  const { t, language } = useLocale();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const scope = scopeFromParams(params);
  const entry =
    location.pathname +
    '?' +
    [
      'country',
      'market',
      'markets',
      'methods',
      'category',
      'industry',
      'capabilities',
      'role',
      'region',
    ]
      .map((k) => k + '=' + params.get(k))
      .join('&');
  const initial: Brief = {
    side: location.pathname === '/join' ? 'offer' : 'need',
    ...scope,
    capabilities: scope.capabilities,
    settlementCurrencies: [],
    companyType: '',
    targetType: '',
    company: '',
    contact: '',
    message: '',
    consent: false,
    site: '',
  };
  const [brief, setBrief] = useState(initial);
  const [ready, setReady] = useState(false);
  const [receipt, setReceipt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [offline, setOffline] = useState(false);
  const [copied, setCopied] = useState(false);
  const retry = useRef({ signature: '', id: '' });
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (saved?.version === 1 && saved.entry === entry && saved.brief) {
        const b = { ...initial, ...saved.brief };
        b.countries = b.countries.filter((id: string) => countries.some((c) => c.id === id));
        b.capabilities = b.capabilities.filter((id: string) =>
          capabilities.some((c) => c.id === id),
        );
        setBrief(b);
        retry.current = saved.retry || retry.current;
      } else {
        const legacy = JSON.parse(sessionStorage.getItem('pan-application-v2') || 'null');
        if (legacy?.draft) {
          const d = legacy.draft;
          const oldScope = scopeFromLegacy(d);
          setBrief({
            ...initial,
            ...(scope.countries.length
              ? {}
              : {
                  countries: oldScope.countries,
                  region: oldScope.region,
                  methods: oldScope.methods,
                }),
            industry: scope.industry || oldScope.industry,
            contact: d.contact || d.email || d.telegram || '',
            company: d.company || '',
            message: d.message || '',
          });
        }
      }
      const r = JSON.parse(sessionStorage.getItem(RECEIPT) || 'null');
      if (r?.entry === entry && typeof r.reference === 'string') setReceipt(r.reference);
    } catch {
      /* An unavailable browser store never blocks an introduction. */
    }
    setReady(true);
  }, [entry]);
  useEffect(() => {
    if (ready && !receipt)
      try {
        sessionStorage.setItem(
          KEY,
          JSON.stringify({ version: 1, entry, brief, retry: retry.current }),
        );
      } catch {
        /* The form works without storage. */
      }
  }, [brief, ready, entry, receipt]);
  useEffect(() => {
    if (receipt) {
      const node = document.getElementById('engine-result');
      node?.focus();
      node?.scrollIntoView({ block: 'center' });
    }
  }, [receipt]);
  const update = (next: Partial<Brief>) => {
    setBrief((b) => ({ ...b, ...next }));
    setError('');
    setOffline(false);
  };
  const chosen = countries.filter((c) => brief.countries.includes(c.id));
  const availableMethods = [...new Set(chosen.flatMap((c) => c.methods))];
  const currencies = [...new Set(chosen.map((c) => c.currency))];
  const changeRegion = (region: string) =>
    update({ region, countries: [], methods: [], settlementCurrencies: [] });
  const changeCountry = (id: string) => {
    const next = toggle(brief.countries, id);
    const selected = countries.filter((c) => next.includes(c.id));
    update({
      countries: next,
      methods: brief.methods.filter((m) => selected.some((c) => c.methods.includes(m))),
      settlementCurrencies: brief.settlementCurrencies.filter((currency) =>
        selected.some((c) => c.currency === currency),
      ),
    });
  };
  const summary = [
    `VlaDDoS Network / I ${brief.side.toUpperCase()}`,
    `${t('Industry', 'Индустрия')}: ${label(
      industries.find((i) => i.id === brief.industry),
      language,
    )}`,
    `${t('Countries', 'Страны')}: ${chosen.map((c) => label(c, language)).join(', ')}`,
    `${t('Capabilities', 'Возможности')}: ${capabilities
      .filter((c) => brief.capabilities.includes(c.id))
      .map((c) => label(c, language))
      .join(', ')}`,
    `${t('Methods', 'Методы')}: ${brief.methods.join(', ')}`,
    `${t('Settlement currencies', 'Валюты расчётов')}: ${brief.settlementCurrencies.join(', ')}`,
    `${t('Company', 'Компания')}: ${brief.company}`,
    `${t('Contact', 'Контакт')}: ${brief.contact}`,
    `${t('Seeking', 'Ищет')}: ${label(
      companyTypes.find((c) => c.id === brief.targetType),
      language,
    )}`,
    brief.message,
  ].join('\n');
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setOffline(false);
    if (!brief.industry || !brief.countries.length || !brief.capabilities.length) {
      setError(
        t(
          'Choose an industry, at least one country and a capability.',
          'Выберите индустрию, хотя бы одну страну и возможность.',
        ),
      );
      document
        .getElementById(
          !brief.industry
            ? 'engine-industry'
            : !brief.countries.length
              ? 'engine-country'
              : 'engine-capability',
        )
        ?.focus();
      return;
    }
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(brief.contact.trim()) &&
      !/^@[a-z][a-z0-9_]{4,31}$/i.test(brief.contact.trim())
    ) {
      setError(
        t(
          'Enter a valid email or Telegram username, for example @yourname.',
          'Укажите корректный email или Telegram, например @yourname.',
        ),
      );
      document.getElementById('engine-contact')?.focus();
      return;
    }
    const body = { ...brief, language, attribution: acquisition() };
    const signature = JSON.stringify(body);
    if (retry.current.signature !== signature)
      retry.current = { signature, id: crypto.randomUUID() };
    try {
      sessionStorage.setItem(
        KEY,
        JSON.stringify({ version: 1, entry, brief, retry: retry.current }),
      );
    } catch {}
    setBusy(true);
    try {
      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, requestId: retry.current.id }),
        signal: AbortSignal.timeout(15000),
      });
      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error('unavailable');
      }
      if (!response.ok) {
        if (response.status >= 500 || response.status === 404) throw new Error('unavailable');
        throw new Error(result.error || 'Request rejected.');
      }
      if (!/^VN-\d{4}-[A-F0-9]{10}$/.test(result.reference || '')) throw new Error('unavailable');
      setReceipt(result.reference);
      try {
        sessionStorage.removeItem(KEY);
        sessionStorage.removeItem('pan-application-v2');
        sessionStorage.setItem(RECEIPT, JSON.stringify({ entry, reference: result.reference }));
      } catch {}
      document.getElementById('engine-result')?.focus();
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message === 'unavailable' || /fetch|timeout|abort|network/i.test(message)) {
        setOffline(true);
        setError(
          t(
            'We could not confirm receipt. Your brief is still here. Retry safely, or send it directly by email.',
            'Получение не подтверждено. Бриф сохранён здесь. Повторите отправку или отправьте его напрямую по email.',
          ),
        );
      } else setError(t('Please check your details. ', 'Проверьте данные. ') + message);
    } finally {
      setBusy(false);
    }
  };
  const reset = () => {
    setReceipt('');
    setBrief(initial);
    retry.current = { signature: '', id: '' };
    try {
      sessionStorage.removeItem(RECEIPT);
      sessionStorage.removeItem(KEY);
    } catch {}
  };
  return (
    <section className="connection-engine wrap">
      <div className="engine-title">
        <div>
          <Eyebrow>THE CONNECTION ENGINE</Eyebrow>
          <h1>
            {t('Pull the', 'Найдите')} <em>{t('right thread.', 'свою нить.')}</em>
          </h1>
          <p>
            {t(
              'A short brief. A considered introduction. Start with what brings you here.',
              'Короткий бриф. Продуманное знакомство. Начните с того, что привело вас сюда.',
            )}
          </p>
        </div>
        <NLink className="text-link" to="/contact">
          {t('Just want to say hello?', 'Просто хотите познакомиться?')}
          <Arrow />
        </NLink>
      </div>
      {receipt ? (
        <div className="receipt" id="engine-result" tabIndex={-1}>
          <span className="receipt-mark">
            <Check size={34} />
          </span>
          <Eyebrow>{t('SAVED TO THE DEAL DESK', 'СОХРАНЕНО В DEAL DESK')}</Eyebrow>
          <h2>{t('The thread starts here.', 'Здесь начинается связь.')}</h2>
          <p>
            {t(
              'Your enquiry has been saved for a human review. This receipt confirms submission; availability and partner fit still need qualification.',
              'Обращение сохранено для личного рассмотрения. Номер подтверждает отправку; доступность и совместимость партнёров ещё предстоит проверить.',
            )}
          </p>
          <strong className="receipt-reference">{receipt}</strong>
          <button className="action" onClick={reset}>
            {t('Start another introduction', 'Создать новое обращение')}
            <RotateCcw size={18} />
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="engine-form">
          <div className="engine-main">
            <fieldset className="intent-selector">
              <legend className="sr-only">{t('Your intention', 'Ваше намерение')}</legend>
              {(['need', 'offer'] as const).map((side) => (
                <button
                  type="button"
                  key={side}
                  aria-pressed={brief.side === side}
                  onClick={() => update({ side })}
                >
                  <span>I {side.toUpperCase()}</span>
                  <strong>
                    {side === 'need'
                      ? t('Find a partner', 'Найти партнёра')
                      : t('Join the network', 'Стать партнёром')}
                  </strong>
                  {brief.side === side ? <Check aria-hidden="true" /> : <Arrow />}
                </button>
              ))}
            </fieldset>
            <div className="loom-section" id="engine-industry" tabIndex={-1}>
              <div className="loom-label">
                <span>01</span>
                <h2>{t('Your industry', 'Ваша индустрия')}</h2>
              </div>
              <fieldset className="choice-set">
                <legend className="sr-only">
                  {t('Choose your industry', 'Выберите индустрию')}
                </legend>
                {industries.map((i) => (
                  <button
                    type="button"
                    aria-pressed={brief.industry === i.id}
                    key={i.id}
                    onClick={() => update({ industry: i.id })}
                  >
                    {label(i, language)}
                  </button>
                ))}
              </fieldset>
            </div>
            <div className="loom-section" id="engine-country" tabIndex={-1}>
              <div className="loom-label">
                <span>02</span>
                <h2>{t('Your market', 'Ваш рынок')}</h2>
              </div>
              <fieldset className="region-selector">
                <legend className="sr-only">{t('Choose a region', 'Выберите регион')}</legend>
                {regions.map((r) => (
                  <button
                    type="button"
                    aria-pressed={brief.region === r.id}
                    key={r.id}
                    onClick={() => changeRegion(r.id)}
                  >
                    {label(r, language)}
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                ))}
              </fieldset>
              <fieldset className="choice-set country-choices">
                <legend>{t('Select countries', 'Выберите страны')}</legend>
                {brief.region ? (
                  countries
                    .filter((c) => c.region === brief.region)
                    .map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        aria-pressed={brief.countries.includes(c.id)}
                        onClick={() => changeCountry(c.id)}
                      >
                        {label(c, language)}
                        <small>{c.currency}</small>
                      </button>
                    ))
                ) : (
                  <p className="field-hint">
                    {t(
                      'Choose a region to see its countries.',
                      'Выберите регион, чтобы увидеть страны.',
                    )}
                  </p>
                )}
              </fieldset>
              <p className="field-hint">
                {t(
                  'For a second region, submit a separate brief so each search stays specific.',
                  'Для второго региона отправьте отдельный бриф — так у каждого поиска будет конкретная задача.',
                )}
              </p>
            </div>
            <div className="loom-section" id="engine-capability" tabIndex={-1}>
              <div className="loom-label">
                <span>03</span>
                <h2>
                  {brief.side === 'need'
                    ? t('What do you need?', 'Что вам нужно?')
                    : t('What can you offer?', 'Что вы предлагаете?')}
                </h2>
              </div>
              <fieldset className="choice-set">
                <legend className="sr-only">
                  {t('Select capabilities', 'Выберите возможности')}
                </legend>
                {capabilities.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    aria-pressed={brief.capabilities.includes(c.id)}
                    onClick={() => update({ capabilities: toggle(brief.capabilities, c.id) })}
                  >
                    {label(c, language)}
                  </button>
                ))}
              </fieldset>
              {availableMethods.length > 0 && (
                <details className="engine-details">
                  <summary>
                    {t(
                      'Add methods, settlement and company context',
                      'Добавить методы, расчёты и контекст компании',
                    )}
                    <PlusIcon />
                  </summary>
                  <fieldset className="choice-set">
                    <legend>{t('Payment methods', 'Платёжные методы')}</legend>
                    {availableMethods.map((m) => (
                      <button
                        key={m}
                        type="button"
                        aria-pressed={brief.methods.includes(m)}
                        onClick={() => update({ methods: toggle(brief.methods, m) })}
                      >
                        {m}
                      </button>
                    ))}
                  </fieldset>
                  <fieldset className="choice-set">
                    <legend>{t('Settlement currencies', 'Валюты расчётов')}</legend>
                    {currencies.map((c) => (
                      <button
                        key={c}
                        type="button"
                        aria-pressed={brief.settlementCurrencies.includes(c)}
                        onClick={() =>
                          update({ settlementCurrencies: toggle(brief.settlementCurrencies, c) })
                        }
                      >
                        {c}
                      </button>
                    ))}
                  </fieldset>
                  <div className="field-pair">
                    <label>
                      {t('Your company type', 'Тип вашей компании')}
                      <select
                        value={brief.companyType}
                        onChange={(e) => update({ companyType: e.target.value })}
                      >
                        <option value="">{t('Review with the network', 'Уточнить с сетью')}</option>
                        {companyTypes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {label(c, language)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      {t('Who do you want to meet?', 'С кем хотите познакомиться?')}
                      <select
                        value={brief.targetType}
                        onChange={(e) => update({ targetType: e.target.value })}
                      >
                        <option value="">
                          {t('Open to a relevant partner', 'С подходящим партнёром')}
                        </option>
                        {companyTypes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {label(c, language)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </details>
              )}
            </div>
            <div className="loom-section contact-section">
              <div className="loom-label">
                <span>04</span>
                <h2>{t('Let’s make contact.', 'Будем на связи.')}</h2>
              </div>
              <div className="field-pair">
                <label htmlFor="engine-contact">
                  {t('Business email or Telegram', 'Рабочий email или Telegram')}
                  <input
                    required
                    id="engine-contact"
                    autoComplete="email"
                    value={brief.contact}
                    maxLength={180}
                    placeholder="you@company.com / @yourname"
                    onChange={(e) => update({ contact: e.target.value })}
                  />
                </label>
                <label>
                  {t('Company · optional', 'Компания · необязательно')}
                  <input
                    autoComplete="organization"
                    value={brief.company}
                    maxLength={180}
                    onChange={(e) => update({ company: e.target.value })}
                  />
                </label>
              </div>
              <label>
                {t('A little context · optional', 'Краткий контекст · необязательно')}
                <textarea
                  value={brief.message}
                  maxLength={1500}
                  rows={3}
                  placeholder={
                    brief.side === 'need'
                      ? t(
                          'What would a useful introduction make possible?',
                          'Что даст полезное знакомство?',
                        )
                      : t(
                          'What can your company provide, and who would you like to meet?',
                          'Что предоставляет ваша компания и с кем хотите познакомиться?',
                        )
                  }
                  onChange={(e) => update({ message: e.target.value })}
                />
              </label>
              <div className="honeypot" aria-hidden="true">
                <label>
                  Website
                  <input
                    value={brief.site}
                    onChange={(e) => update({ site: e.target.value })}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </label>
              </div>
              <label className="consent">
                <input
                  type="checkbox"
                  required
                  checked={brief.consent}
                  onChange={(e) => update({ consent: e.target.checked })}
                />
                <span>
                  {t('I agree to the ', 'Я принимаю ')}
                  <NLink to="/privacy">{t('privacy notice', 'условия обработки данных')}</NLink>
                  {t(
                    ' and may be contacted about this enquiry.',
                    ' и согласен на связь по этому обращению.',
                  )}
                </span>
              </label>
              <p className="field-hint">
                {t(
                  'Your profile is private. Sharing with a prospective partner requires a separate permission.',
                  'Профиль конфиденциален. Для передачи потенциальному партнёру потребуется отдельное разрешение.',
                )}
              </p>
              {error && (
                <div className="form-error" role="alert">
                  {error}
                </div>
              )}
              <button type="submit" className="action submit-action" disabled={busy || !ready}>
                {busy ? <LoaderCircle className="spin" size={18} /> : <Send size={18} />}
                <span>
                  {busy
                    ? t('Saving your brief…', 'Сохраняем бриф…')
                    : t('Send for human review', 'Отправить на рассмотрение')}
                </span>
                <Arrow />
              </button>
              {offline && (
                <div className="offline-actions">
                  <a
                    className="text-link"
                    href={
                      'mailto:hello@vladdos.com?subject=' +
                      encodeURIComponent('VlaDDoS Network — partnership brief') +
                      '&body=' +
                      encodeURIComponent(summary)
                    }
                  >
                    {t('Prepare an email', 'Подготовить email')}
                    <Arrow />
                  </a>
                  <button
                    type="button"
                    className="text-link"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(summary);
                        setCopied(true);
                      } catch {
                        setError(
                          t('Copy the profile from the summary.', 'Скопируйте профиль из сводки.'),
                        );
                      }
                    }}
                  >
                    {copied
                      ? t('Copied', 'Скопировано')
                      : t('Copy the introduction', 'Скопировать обращение')}
                    <Copy size={17} />
                  </button>
                  <p>
                    {t(
                      'The email is not sent automatically. No server receipt has been issued.',
                      'Email не отправляется автоматически. Серверное подтверждение не выдано.',
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
          <aside
            className="live-brief"
            aria-label={t('Your opportunity profile', 'Ваш профиль возможности')}
          >
            <div className="brief-pin" aria-hidden="true" />
            <Eyebrow>YOUR CONNECTION / {brief.side.toUpperCase()}</Eyebrow>
            <h2>
              {t('The shape of', 'Контур')}
              <em>{t('your opportunity.', 'вашей возможности.')}</em>
            </h2>
            <dl>
              <dt>{t('Industry', 'Индустрия')}</dt>
              <dd>
                {label(
                  industries.find((i) => i.id === brief.industry),
                  language,
                ) || t('Your business context', 'Контекст вашего бизнеса')}
              </dd>
              <dt>{t('Geography', 'География')}</dt>
              <dd>
                {chosen.length
                  ? chosen.map((c) => label(c, language)).join(' / ')
                  : t('Where it matters', 'Где это нужно')}
              </dd>
              <dt>{t('Capabilities', 'Возможности')}</dt>
              <dd>
                {brief.capabilities.length
                  ? capabilities
                      .filter((c) => brief.capabilities.includes(c.id))
                      .map((c) => label(c, language))
                      .join(' / ')
                  : t('What connects the two sides', 'Что соединяет две стороны')}
              </dd>
              {brief.methods.length > 0 && (
                <>
                  <dt>{t('Methods', 'Методы')}</dt>
                  <dd>{brief.methods.join(' / ')}</dd>
                </>
              )}
              {brief.settlementCurrencies.length > 0 && (
                <>
                  <dt>{t('Settlement', 'Расчёты')}</dt>
                  <dd>{brief.settlementCurrencies.join(' / ')}</dd>
                </>
              )}
            </dl>
            <div className="brief-status">
              <span />
              {t('Awaiting your introduction', 'Ждёт вашего обращения')}
            </div>
            <p>
              {t(
                'This is your brief, not an available offer or a confirmed match. A person reviews every submission.',
                'Это ваш бриф, а не доступное предложение или подтверждённое совпадение. Каждое обращение рассматривает человек.',
              )}
            </p>
          </aside>
        </form>
      )}
    </section>
  );
}
function PlusIcon() {
  return <span aria-hidden="true">+</span>;
}
