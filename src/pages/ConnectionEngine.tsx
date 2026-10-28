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
import { briefEntry, scenarios, scenarioFor } from '../brief';
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
  licensingStatus: string;
  licensingContext: string;
  commercialIntent: string;
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
  const entry = briefEntry(location.pathname, params);
  const legacyEntry =
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
      .map((key) => key + '=' + params.get(key))
      .join('&');
  const initial: Brief = {
    side: location.pathname === '/join' ? 'offer' : 'need',
    ...scope,
    settlementCurrencies: [],
    company: '',
    contact: '',
    message: '',
    licensingStatus: '',
    licensingContext: '',
    commercialIntent: '',
    consent: false,
    site: '',
  };
  const [brief, setBrief] = useState(initial);
  const [readyEntry, setReadyEntry] = useState('');
  const ready = readyEntry === entry;
  const [step, setStep] = useState<'scope' | 'contact'>('scope');
  const [receipt, setReceipt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [offline, setOffline] = useState(false);
  const [copied, setCopied] = useState(false);
  const retry = useRef({ signature: '', id: '' });
  const complete = (b: Brief) =>
    !!(b.companyType && b.industry && b.countries.length && b.capabilities.length);
  useEffect(() => {
    let next = initial;
    let nextStep: 'scope' | 'contact' = complete(initial) ? 'contact' : 'scope';
    retry.current = { signature: '', id: '' };
    setReceipt('');
    setError('');
    setOffline(false);
    try {
      const saved = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (saved?.version === 1 && saved.brief) {
        if (saved.entry === entry || saved.entry === legacyEntry) {
          const b = { ...initial, ...saved.brief };
          for (const [key, catalogue] of [
            ['countries', countries],
            ['capabilities', capabilities],
          ] as const)
            b[key] = Array.isArray(b[key])
              ? b[key].filter((id: string) => catalogue.some((c) => c.id === id))
              : [];
          if (!['need', 'offer'].includes(b.side)) b.side = initial.side;
          if (!regions.some((r) => r.id === b.region)) b.region = initial.region;
          for (const key of [
            'company',
            'contact',
            'message',
            'licensingStatus',
            'licensingContext',
            'commercialIntent',
            'targetType',
            'site',
          ])
            if (typeof b[key] !== 'string') b[key] = '';
          b.consent = b.consent === true;
          const chosen = countries.filter((c) => b.countries.includes(c.id));
          b.methods = Array.isArray(b.methods)
            ? b.methods.filter((m: string) => chosen.some((c) => c.methods.includes(m)))
            : [];
          b.settlementCurrencies = Array.isArray(b.settlementCurrencies)
            ? b.settlementCurrencies.filter((v: string) => chosen.some((c) => c.currency === v))
            : [];
          if (!companyTypes.some((c) => c.id === b.companyType)) b.companyType = '';
          if (!industries.some((i) => i.id === b.industry)) b.industry = '';
          next = b;
          nextStep = saved.step === 'contact' && complete(b) ? 'contact' : 'scope';
          if (typeof saved.retry?.id === 'string' && typeof saved.retry?.signature === 'string')
            retry.current = saved.retry;
        } else {
          next = {
            ...initial,
            contact: typeof saved.brief.contact === 'string' ? saved.brief.contact : '',
            company: typeof saved.brief.company === 'string' ? saved.brief.company : '',
          };
        }
      } else {
        const legacy = JSON.parse(sessionStorage.getItem('pan-application-v2') || 'null');
        if (legacy?.draft) {
          const d = legacy.draft,
            old = scopeFromLegacy(d);
          next = {
            ...initial,
            ...(scope.countries.length
              ? {}
              : { countries: old.countries, region: old.region, methods: old.methods }),
            industry: scope.industry || old.industry,
            companyType: scope.companyType || old.companyType,
            contact: d.contact || d.email || d.telegram || '',
            company: d.company || '',
            message: d.message || '',
          };
        }
      }
      const r = JSON.parse(sessionStorage.getItem(RECEIPT) || 'null');
      if (r?.entry === entry && /^VN-\d{4}-[A-F0-9]{10}$/.test(r.reference))
        setReceipt(r.reference);
    } catch {
      /* Storage is optional; explicit entry parameters remain authoritative. */
    }
    setBrief(next);
    setStep(nextStep);
    setReadyEntry(entry);
  }, [entry]);
  useEffect(() => {
    if (ready && !receipt)
      try {
        sessionStorage.setItem(
          KEY,
          JSON.stringify({ version: 1, entry, brief, step, retry: retry.current }),
        );
      } catch {
        /* In-memory completion still works. */
      }
  }, [brief, step, ready, entry, receipt]);
  useEffect(() => {
    if (receipt) document.getElementById('engine-result')?.focus();
  }, [receipt]);
  const update = (next: Partial<Brief>) => {
    if (busy) return;
    setBrief((b) => ({ ...b, ...next }));
    setError('');
    setOffline(false);
  };
  const chosen = countries.filter((c) => brief.countries.includes(c.id));
  const availableMethods = [...new Set(chosen.flatMap((c) => c.methods))];
  const currencies = [...new Set(chosen.map((c) => c.currency))];
  const scenario = scenarioFor(brief.companyType);
  const paymentScope = brief.capabilities.some((c) =>
    ['collections', 'payouts', 'local-methods', 'psp', 'liquidity', 'settlement'].includes(c),
  );
  const licensingRelevant =
    brief.side === 'offer' &&
    ['local-partner', 'psp', 'otc', 'liquidity'].includes(brief.companyType) &&
    paymentScope;
  const changeCountry = (id: string) => {
    const next = toggle(brief.countries, id),
      selected = countries.filter((c) => next.includes(c.id));
    update({
      countries: next,
      methods: brief.methods.filter((m) => selected.some((c) => c.methods.includes(m))),
      settlementCurrencies: brief.settlementCurrencies.filter((v) =>
        selected.some((c) => c.currency === v),
      ),
    });
  };
  const validateScope = () => {
    const field = !brief.companyType
      ? 'engine-role'
      : !brief.industry
        ? 'engine-industry'
        : !brief.countries.length
          ? 'engine-country'
          : !brief.capabilities.length
            ? 'engine-capability'
            : '';
    if (!field) return true;
    setStep('scope');
    setError(
      t(
        'Choose your role, industry, at least one country and a capability.',
        'Выберите роль, индустрию, хотя бы одну страну и возможность.',
      ),
    );
    requestAnimationFrame(() => document.getElementById(field)?.focus());
    return false;
  };
  const scopeSummary = [
    label(
      industries.find((i) => i.id === brief.industry),
      language,
    ),
    chosen.map((c) => label(c, language)).join(' / '),
    capabilities
      .filter((c) => brief.capabilities.includes(c.id))
      .map((c) => label(c, language))
      .join(' / '),
  ].filter(Boolean);
  const summary = [
    `VlaDDoS Network / I ${brief.side.toUpperCase()}`,
    `${t('Company type', 'Тип компании')}: ${label(
      companyTypes.find((c) => c.id === brief.companyType),
      language,
    )}`,
    ...scopeSummary,
    `${t('Methods', 'Методы')}: ${brief.methods.join(', ')}`,
    `${t('Settlement', 'Расчёты')}: ${brief.settlementCurrencies.join(', ')}`,
    `${t('Company', 'Компания')}: ${brief.company}`,
    `${t('Contact', 'Контакт')}: ${brief.contact}`,
    `${t('Seeking', 'Ищет')}: ${label(
      companyTypes.find((c) => c.id === brief.targetType),
      language,
    )}`,
    `${t('Operating role · self-declared', 'Операционная роль · со слов заявителя')}: ${brief.licensingStatus} ${brief.licensingContext}`,
    `${t('Commercial interest', 'Коммерческий интерес')}: ${brief.commercialIntent}`,
    brief.message,
  ].join('\n');
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy || !ready || !validateScope()) return;
    if (step === 'scope') {
      setStep('contact');
      setError('');
      requestAnimationFrame(() => {
        document.getElementById('engine-contact')?.focus();
        document.getElementById('engine-contact-step')?.scrollIntoView({ block: 'start' });
      });
      return;
    }
    setError('');
    setOffline(false);
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(brief.contact.trim()) &&
      !/^@[a-z][a-z0-9_]{4,31}$/i.test(brief.contact.trim())
    ) {
      setError(
        t(
          'Enter a valid business email or Telegram username, for example @yourname.',
          'Укажите корректный рабочий email или Telegram, например @yourname.',
        ),
      );
      document.getElementById('engine-contact')?.focus();
      return;
    }
    const body = { ...brief, language, attribution: { source: 'website', ...acquisition() } };
    const signature = JSON.stringify(body);
    if (retry.current.signature !== signature)
      retry.current = { signature, id: crypto.randomUUID() };
    try {
      sessionStorage.setItem(
        KEY,
        JSON.stringify({ version: 1, entry, brief, step, retry: retry.current }),
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
        throw new Error(
          response.status === 429
            ? t(
                'Too many requests. Please retry later.',
                'Слишком много запросов. Повторите позже.',
              )
            : response.status === 409
              ? t(
                  'These details differ from an earlier submission. Review the brief before trying again.',
                  'Данные отличаются от предыдущей отправки. Проверьте бриф перед повтором.',
                )
              : t(
                  'Please check the brief and your contact details.',
                  'Проверьте бриф и контактные данные.',
                ),
        );
      }
      if (result.status !== 'received' || !/^VN-\d{4}-[A-F0-9]{10}$/.test(result.reference || ''))
        throw new Error('unavailable');
      setReceipt(result.reference);
      try {
        sessionStorage.removeItem(KEY);
        sessionStorage.removeItem('pan-application-v2');
        sessionStorage.setItem(RECEIPT, JSON.stringify({ entry, reference: result.reference }));
      } catch {}
      setBrief((b) => ({
        ...b,
        contact: '',
        company: '',
        message: '',
        licensingContext: '',
        commercialIntent: '',
        consent: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message === 'unavailable' || /fetch|timeout|abort|network/i.test(message)) {
        setOffline(true);
        setError(
          t(
            'Receipt is not confirmed. Your brief is still here. Retry safely, or prepare a direct email.',
            'Получение не подтверждено. Бриф остаётся здесь. Повторите отправку или подготовьте email.',
          ),
        );
      } else
        setError(
          message ||
            t('Unable to save. Please retry.', 'Не удалось сохранить. Повторите отправку.'),
        );
    } finally {
      setBusy(false);
    }
  };
  const reset = () => {
    setReceipt('');
    setBrief(initial);
    setStep('scope');
    retry.current = { signature: '', id: '' };
    try {
      sessionStorage.removeItem(RECEIPT);
      sessionStorage.removeItem(KEY);
    } catch {}
  };
  const capabilityButton = (c: (typeof capabilities)[number]) => (
    <button
      type="button"
      key={c.id}
      aria-pressed={brief.capabilities.includes(c.id)}
      onClick={() => update({ capabilities: toggle(brief.capabilities, c.id) })}
    >
      {label(c, language)}
    </button>
  );
  const relevant = capabilities.filter(
    (c) =>
      !scenario ||
      (scenario.capabilities as readonly string[]).includes(c.id) ||
      brief.capabilities.includes(c.id),
  );
  const more = capabilities.filter((c) => !relevant.includes(c));
  return (
    <section className="connection-engine wrap">
      <div className="engine-title">
        <div>
          <Eyebrow>CONNECTION ENGINE</Eyebrow>
          <h1>
            {brief.side === 'need' ? t('Find the', 'Найдите') : t('Bring your', 'Предложите')}{' '}
            <em>
              {brief.side === 'need'
                ? t('right partner.', 'нужного партнёра.')
                : t('local advantage.', 'ваши возможности.')}
            </em>
          </h1>
          <p>
            {t(
              'One private brief for a specific business opportunity. A person reviews the fit before any introduction.',
              'Один конфиденциальный бриф под конкретную B2B-задачу. До знакомства соответствие проверяет человек.',
            )}
          </p>
        </div>
        <NLink className="text-link" to="/contact">
          {t('General enquiry', 'Общий вопрос')}
          <Arrow />
        </NLink>
      </div>
      {receipt ? (
        <div className="receipt" id="engine-result" tabIndex={-1}>
          <span className="receipt-mark">
            <Check size={34} />
          </span>
          <Eyebrow>{t('SAVED TO THE DEAL DESK', 'СОХРАНЕНО В DEAL DESK')}</Eyebrow>
          <h2>{t('Your brief is received.', 'Ваш бриф получен.')}</h2>
          <p>
            {t(
              'This reference confirms that your enquiry is saved for review. Partner availability, verification and permission to share are the next steps.',
              'Номер подтверждает сохранение обращения для рассмотрения. Далее — проверка доступности, возможностей и разрешения на передачу.',
            )}
          </p>
          <strong className="receipt-reference">{receipt}</strong>
          <button className="action" onClick={reset}>
            {t('Start another brief', 'Создать новое обращение')}
            <RotateCcw size={18} />
          </button>
        </div>
      ) : (
        <>
          <nav className="engine-progress" aria-label={t('Brief progress', 'Этапы брифа')}>
            <button
              type="button"
              aria-current={step === 'scope' ? 'step' : undefined}
              disabled={busy}
              onClick={() => {
                setStep('scope');
                setError('');
              }}
            >
              01 / {t('Business scope', 'Задача бизнеса')}
            </button>
            <span aria-hidden="true">→</span>
            <button
              type="button"
              aria-current={step === 'contact' ? 'step' : undefined}
              disabled={busy}
              onClick={() => {
                if (validateScope()) {
                  setStep('contact');
                  setError('');
                }
              }}
            >
              02 / {t('Context & contact', 'Контекст и контакт')}
            </button>
          </nav>
          <form onSubmit={submit} className="engine-form" aria-busy={busy}>
            <div className="engine-main">
              {step === 'scope' ? (
                <>
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
                            : t('Offer capabilities', 'Предложить возможности')}
                        </strong>
                        {brief.side === side ? <Check aria-hidden="true" /> : <Arrow />}
                      </button>
                    ))}
                  </fieldset>
                  <div className="loom-section" id="engine-role" tabIndex={-1}>
                    <div className="loom-label">
                      <span>01</span>
                      <h2>{t('Your role', 'Ваша роль')}</h2>
                    </div>
                    <label>
                      {t('Which describes your business?', 'Что описывает ваш бизнес?')}
                      <select
                        value={brief.companyType}
                        onChange={(e) => {
                          const s = scenarioFor(e.target.value);
                          update({
                            companyType: e.target.value,
                            industry: brief.industry || s?.industry || '',
                          });
                        }}
                      >
                        <option value="">{t('Choose your role', 'Выберите роль')}</option>
                        {scenarios.map((s) => (
                          <option key={s.id} value={s.id}>
                            {t(s.en, s.ru)}
                          </option>
                        ))}
                        {brief.companyType === 'liquidity' && (
                          <option value="liquidity">
                            {t('Liquidity provider', 'Поставщик ликвидности')}
                          </option>
                        )}
                      </select>
                    </label>
                    {scenario && (
                      <p className="scenario-hint">
                        {brief.side === 'need'
                          ? t(scenario.need, scenario.needRu)
                          : t(scenario.offer, scenario.offerRu)}
                      </p>
                    )}
                  </div>
                  <div className="loom-section" id="engine-industry" tabIndex={-1}>
                    <div className="loom-label">
                      <span>02</span>
                      <h2>{t('Your industry', 'Ваша индустрия')}</h2>
                    </div>
                    <fieldset className="choice-set">
                      <legend className="sr-only">
                        {t('Choose your industry', 'Выберите индустрию')}
                      </legend>
                      {industries.map((i) => (
                        <button
                          type="button"
                          key={i.id}
                          aria-pressed={brief.industry === i.id}
                          onClick={() => update({ industry: i.id })}
                        >
                          {label(i, language)}
                        </button>
                      ))}
                    </fieldset>
                  </div>
                  <div className="loom-section" id="engine-country" tabIndex={-1}>
                    <div className="loom-label">
                      <span>03</span>
                      <h2>{t('Your market', 'Ваш рынок')}</h2>
                    </div>
                    <fieldset className="region-selector">
                      <legend className="sr-only">{t('Choose a region', 'Выберите регион')}</legend>
                      {regions.map((r) => (
                        <button
                          type="button"
                          key={r.id}
                          aria-pressed={brief.region === r.id}
                          onClick={() => update({ region: r.id })}
                        >
                          {label(r, language)}
                          <ArrowRight size={16} />
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
                              type="button"
                              key={c.id}
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
                    {chosen.length > 0 && (
                      <p className="selected-markets">
                        {t('Selected', 'Выбрано')}:{' '}
                        {chosen.map((c) => (
                          <button
                            type="button"
                            key={c.id}
                            aria-label={t('Remove ', 'Убрать ') + label(c, language)}
                            onClick={() => changeCountry(c.id)}
                          >
                            {label(c, language)} ×
                          </button>
                        ))}
                      </p>
                    )}
                  </div>
                  <div className="loom-section" id="engine-capability" tabIndex={-1}>
                    <div className="loom-label">
                      <span>04</span>
                      <h2>
                        {brief.side === 'need'
                          ? t('What do you need?', 'Что вам нужно?')
                          : t('What can you offer?', 'Что вы предлагаете?')}
                      </h2>
                    </div>
                    <fieldset className="choice-set">
                      <legend className="sr-only">{t('Capabilities', 'Возможности')}</legend>
                      {relevant.map(capabilityButton)}
                    </fieldset>
                    {more.length > 0 && (
                      <details className="engine-details">
                        <summary>
                          {t('Other capabilities', 'Другие возможности')}
                          <span aria-hidden="true">+</span>
                        </summary>
                        <div className="choice-set">{more.map(capabilityButton)}</div>
                      </details>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="scope-confirmation">
                    <span className="folio">
                      I {brief.side.toUpperCase()} /{' '}
                      {label(
                        companyTypes.find((c) => c.id === brief.companyType),
                        language,
                      )}
                    </span>
                    <p>{scopeSummary.join(' · ')}</p>
                    <button type="button" className="text-link" onClick={() => setStep('scope')}>
                      {t('Edit scope', 'Изменить задачу')}
                      <Arrow />
                    </button>
                  </div>
                  <div className="loom-section contact-section" id="engine-contact-step">
                    <div className="loom-label">
                      <span>02</span>
                      <h2>{t('Where can we reach you?', 'Как с вами связаться?')}</h2>
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
                      {t('Business context · optional', 'Контекст задачи · необязательно')}
                      <textarea
                        value={brief.message}
                        maxLength={1500}
                        rows={3}
                        placeholder={
                          scenario
                            ? brief.side === 'need'
                              ? t(scenario.need, scenario.needRu)
                              : t(scenario.offer, scenario.offerRu)
                            : t('Describe your business opportunity.', 'Опишите вашу B2B-задачу.')
                        }
                        onChange={(e) => update({ message: e.target.value })}
                      />
                    </label>
                    <details className="engine-details">
                      <summary>
                        {paymentScope
                          ? t(
                              'Methods, settlement & operating context · optional',
                              'Методы, расчёты и операционный контекст · необязательно',
                            )
                          : t(
                              'Partner & commercial context · optional',
                              'Партнёр и коммерческий контекст · необязательно',
                            )}
                        <span aria-hidden="true">+</span>
                      </summary>
                      {paymentScope && (
                        <>
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
                                  update({
                                    settlementCurrencies: toggle(brief.settlementCurrencies, c),
                                  })
                                }
                              >
                                {c}
                              </button>
                            ))}
                          </fieldset>
                        </>
                      )}
                      {licensingRelevant && (
                        <>
                          <label>
                            {t(
                              'Operating / licensing role · self-declared',
                              'Операционная / лицензионная роль · со слов заявителя',
                            )}
                            <select
                              value={brief.licensingStatus}
                              onChange={(e) => update({ licensingStatus: e.target.value })}
                            >
                              <option value="">
                                {t('Discuss during qualification', 'Уточнить при проверке')}
                              </option>
                              <option value="licensed">
                                {t('Licensed entity', 'Лицензированное юрлицо')}
                              </option>
                              <option value="agent">
                                {t(
                                  'Agent / technical partner of an authorised entity',
                                  'Агент / технический партнёр уполномоченного юрлица',
                                )}
                              </option>
                              <option value="not-required">
                                {t(
                                  'No licence required for our stated role',
                                  'Для заявленной роли лицензия не требуется',
                                )}
                              </option>
                              <option value="unsure">
                                {t('Requires clarification', 'Требует уточнения')}
                              </option>
                            </select>
                          </label>
                          <label>
                            {t(
                              'Entity, operating responsibility & evidence reference',
                              'Юрлицо, ответственность и ссылка на подтверждение',
                            )}
                            <textarea
                              rows={2}
                              maxLength={600}
                              value={brief.licensingContext}
                              onChange={(e) => update({ licensingContext: e.target.value })}
                            />
                          </label>
                          <p className="field-hint">
                            {t(
                              'This is a declaration for review. Do not upload identity documents or account credentials.',
                              'Это заявление для проверки. Не передавайте документы личности и данные доступа к счетам.',
                            )}
                          </p>
                        </>
                      )}
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
                      <label>
                        {t(
                          'Commercial interest · no terms agreed yet',
                          'Коммерческий интерес · условия ещё не согласованы',
                        )}
                        <textarea
                          rows={2}
                          maxLength={600}
                          placeholder={
                            brief.companyType === 'affiliate'
                              ? t(
                                  'Referral basis and the kind of introduction you can arrange.',
                                  'Основание рекомендации и тип знакомства, которое можете организовать.',
                                )
                              : t(
                                  'Desired partnership model and useful commercial outcome.',
                                  'Желаемая модель партнёрства и полезный коммерческий результат.',
                                )
                          }
                          value={brief.commercialIntent}
                          onChange={(e) => update({ commercialIntent: e.target.value })}
                        />
                      </label>
                    </details>
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
                        <NLink to="/privacy">
                          {t('privacy notice', 'условия обработки данных')}
                        </NLink>
                        {t(
                          ' and may be contacted about this enquiry.',
                          ' и согласен на связь по этому обращению.',
                        )}
                      </span>
                    </label>
                    <p className="field-hint">
                      {t(
                        'Private review by the Deal Desk. Sharing with a prospective partner requires separate permission. Submitting a brief creates no fee obligation.',
                        'Конфиденциальное рассмотрение в Deal Desk. Для передачи партнёру нужно отдельное разрешение. Отправка не создаёт обязательств по оплате.',
                      )}
                    </p>
                  </div>
                </>
              )}
              {error && (
                <div className="form-error" role="alert">
                  {error}
                </div>
              )}
              <button type="submit" className="action submit-action" disabled={busy || !ready}>
                {busy ? (
                  <LoaderCircle className="spin" size={18} />
                ) : step === 'contact' ? (
                  <Send size={18} />
                ) : (
                  <ArrowRight size={18} />
                )}
                <span>
                  {busy
                    ? t('Saving your brief…', 'Сохраняем бриф…')
                    : step === 'scope'
                      ? t('Continue to contact', 'Перейти к контакту')
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
                          t('Select and copy the brief below.', 'Выделите и скопируйте бриф ниже.'),
                        );
                      }
                    }}
                  >
                    {copied ? t('Copied', 'Скопировано') : t('Copy the brief', 'Скопировать бриф')}
                    <Copy size={17} />
                  </button>
                  <details>
                    <summary>{t('View complete brief', 'Посмотреть полный бриф')}</summary>
                    <pre className="brief-copy">{summary}</pre>
                  </details>
                  <p>
                    {t(
                      'Email is not sent automatically. No server receipt has been issued.',
                      'Email не отправляется автоматически. Серверное подтверждение не выдано.',
                    )}
                  </p>
                </div>
              )}
            </div>
            <aside
              className="live-brief"
              aria-label={t('Your opportunity profile', 'Ваш профиль возможности')}
            >
              <Eyebrow>PRIVATE BRIEF / {brief.side.toUpperCase()}</Eyebrow>
              <h2>
                {t('Your business.', 'Ваш бизнес.')}
                <em>{t('In context.', 'В контексте.')}</em>
              </h2>
              <dl>
                <dt>{t('Role', 'Роль')}</dt>
                <dd>
                  {label(
                    companyTypes.find((c) => c.id === brief.companyType),
                    language,
                  ) || t('Your place in the partnership', 'Ваша роль в партнёрстве')}
                </dd>
                <dt>{t('Industry', 'Индустрия')}</dt>
                <dd>{scopeSummary[0] || t('Choose your industry', 'Выберите индустрию')}</dd>
                <dt>{t('Countries', 'Страны')}</dt>
                <dd>
                  {chosen.map((c) => label(c, language)).join(' / ') ||
                    t('Choose a country', 'Выберите страну')}
                </dd>
                <dt>{t('Capabilities', 'Возможности')}</dt>
                <dd>
                  {capabilities
                    .filter((c) => brief.capabilities.includes(c.id))
                    .map((c) => label(c, language))
                    .join(' / ') ||
                    t('Define what you need or offer', 'Укажите задачу или предложение')}
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
                {t('Draft · not submitted', 'Черновик · не отправлен')}
              </div>
              <p>
                {t(
                  'Your selections describe a request, not a confirmed match. Qualification → relevant introduction → evidenced commercial outcome.',
                  'Ваш выбор описывает запрос, а не подтверждённое совпадение. Проверка → подходящее знакомство → подтверждённый коммерческий результат.',
                )}
              </p>
            </aside>
          </form>
        </>
      )}
    </section>
  );
}
