import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  CheckCheck,
  Copy,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Plus,
} from 'lucide-react';
import { Action, Eyebrow } from '../components/UI';
import { CategoryPicker } from '../components/FormControls';
import { markets, roles, type RoleId } from '../data';
import { useLocale } from '../locale';
import { acquisition } from '../components/acquisition';

const DRAFT_KEY = 'pan-application-v2';
interface Draft {
  requestId: string;
  role: RoleId;
  markets: string[];
  category: string;
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
const freshDraft = (role: RoleId = 'affiliate'): Draft => ({
  requestId: '',
  role,
  markets: [],
  category: '',
  name: '',
  company: '',
  email: '',
  telegram: '',
  size: '',
  methods: '',
  volume: '',
  experience: '',
  message: '',
  site: '',
});

export default function ApplyPage() {
  const { t } = useLocale();
  const [params] = useSearchParams();
  const roleQuery = params.get('role');
  const initialRole = roles.find((r) => r.id === roleQuery)?.id || 'affiliate';
  const [draft, setDraft] = useState<Draft>(() => freshDraft());
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const [otherMarkets, setOtherMarkets] = useState('');
  const [copied, setCopied] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const lastView = useRef('0');
  const query = params.toString();

  useEffect(() => {
    let next = freshDraft(initialRole),
      savedStep = 0,
      other = '',
      sameEntry = false;
    try {
      const stored = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || 'null');
      if (
        stored &&
        stored.version === 2 &&
        typeof stored.draft === 'object' &&
        stored.draft &&
        roles.some((r) => r.id === stored.draft.role) &&
        Array.isArray(stored.draft.markets)
      ) {
        for (const key of Object.keys(next) as (keyof Draft)[]) {
          if (key === 'markets')
            next.markets = stored.draft.markets
              .filter((v: unknown) => typeof v === 'string')
              .slice(0, 10);
          else if (typeof stored.draft[key] === 'string')
            Object.assign(next, { [key]: stored.draft[key] });
        }
        sameEntry = stored.entry === query;
        savedStep = Math.max(0, Math.min(2, Number(stored.step) || 0));
        other = typeof stored.otherMarkets === 'string' ? stored.otherMarkets : '';
      }
    } catch {
      /* Continue with a clean draft if browser storage is unavailable. */
    }
    if (!sameEntry && roleQuery && roles.some((r) => r.id === roleQuery)) {
      if (next.role !== initialRole) savedStep = 0;
      next.role = initialRole;
    }
    const market = markets.find((m) => m.slug === params.get('market'));
    if (!sameEntry && market && !next.markets.includes(market.name))
      next.markets = [...next.markets, market.name].slice(0, 10);
    if (params.get('source') === 'forge' && !sameEntry) {
      const selected = markets
        .filter((m) => (params.get('markets') || '').split(',').includes(m.slug))
        .slice(0, 3);
      if (selected.length) {
        next.markets = selected.map((m) => m.name).slice(0, 3);
        other = '';
        const allowedMethods = new Set(selected.flatMap((m) => m.methods));
        next.methods = [
          ...new Set(
            (params.get('methods') || '').split(',').filter((method) => allowedMethods.has(method)),
          ),
        ].join(', ');
        if (['iGaming', 'e-commerce', 'other'].includes(params.get('category') || ''))
          next.category = params.get('category')!;
        savedStep = 1;
      }
    }
    if (!/^[a-f0-9-]{36}$/i.test(next.requestId)) next.requestId = crypto.randomUUID();
    setDraft(next);
    setStep(savedStep);
    setOtherMarkets(other);
    setReady(true);
    // The URL is an intentional entry point; a new entry can preselect role or market.
  }, [query]);

  useEffect(() => {
    if (!ready || reference) return;
    try {
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ version: 2, draft, step, otherMarkets, entry: query }),
      );
    } catch {
      /* Form submission does not depend on storage. */
    }
  }, [draft, step, otherMarkets, ready, reference, query]);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    const view = reference || String(step);
    if (lastView.current === view) return;
    lastView.current = view;
    const timer = window.setTimeout(() => {
      panel.current?.scrollIntoView({
        block: 'start',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
      });
      const heading = panel.current?.querySelector('h2');
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [step, reference]);

  const update = (key: keyof Omit<Draft, 'markets'>, value: string) => {
    setDraft((previous) => ({ ...previous, [key]: value }));
    setError('');
  };
  const selectedMarkets = [
    ...new Set([
      ...draft.markets,
      ...otherMarkets
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    ]),
  ];
  const toggleMarket = (name: string) => {
    setDraft((previous) => ({
      ...previous,
      markets: previous.markets.includes(name)
        ? previous.markets.filter((m) => m !== name)
        : [...previous.markets, name],
    }));
    setError('');
  };
  const advance = async (e: FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setError('');
    if (!form.current?.reportValidity()) return;
    if (step === 1 && (!selectedMarkets.length || selectedMarkets.length > 10)) {
      setError(t('Choose between one and ten markets.', 'Выберите от одного до десяти рынков.'));
      return;
    }
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    if (draft.name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(draft.email.trim())) {
      setError(
        t('Enter your name and a valid work email.', 'Укажите имя и корректную рабочую почту.'),
      );
      return;
    }
    setSending(true);
    const active = new AbortController();
    controller.current = active;
    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: active.signal,
        body: JSON.stringify({
          ...draft,
          name: draft.name.trim(),
          email: draft.email.trim(),
          markets: selectedMarkets,
          attribution: acquisition(),
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          response.status === 429
            ? t(
                'Too many attempts. Please try again later.',
                'Слишком много попыток. Попробуйте позже.',
              )
            : result.error ||
                t(
                  'We could not save the application. Try again.',
                  'Не удалось сохранить заявку. Попробуйте снова.',
                ),
        );
      if (typeof result.reference !== 'string')
        throw new Error(
          t(
            'The server did not confirm the application. Try again.',
            'Сервер не подтвердил заявку. Попробуйте снова.',
          ),
        );
      setReference(result.reference);
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        /* A saved server reference remains authoritative. */
      }
    } catch (cause) {
      if (active.signal.aborted) return;
      setError(
        cause instanceof TypeError
          ? t(
              'Connection interrupted. Your draft is kept. Retry to confirm the same application.',
              'Соединение прервано. Черновик сохранён. Повторите отправку для подтверждения той же заявки.',
            )
          : cause instanceof Error
            ? cause.message
            : t('Something went wrong. Please try again.', 'Возникла ошибка. Попробуйте снова.'),
      );
    } finally {
      if (!active.signal.aborted) setSending(false);
    }
  };

  const field = (
    key: keyof Omit<Draft, 'markets' | 'role'>,
    label: string,
    placeholder: string,
    required = false,
    type = 'text',
  ) => (
    <label className="field">
      <span>
        {label}
        {required && <i> *</i>}
      </span>
      <input
        type={type}
        name={key}
        value={draft[key]}
        onChange={(e) => update(key, e.target.value)}
        required={required}
        minLength={key === 'name' ? 2 : undefined}
        maxLength={180}
        autoComplete={
          key === 'email'
            ? 'email'
            : key === 'name'
              ? 'name'
              : key === 'company'
                ? 'organization'
                : 'off'
        }
        placeholder={placeholder}
      />
    </label>
  );
  const stepNames = [
    t('Your role', 'Ваша роль'),
    t('Your network', 'Ваши рынки'),
    t('Your introduction', 'Знакомство'),
  ];

  return (
    <section className="apply-page wrap">
      <div className="apply-intro">
        <Eyebrow>{t('A good connection starts here', 'Хорошие связи начинаются здесь')}</Eyebrow>
        <h1>
          {t('LET’S', 'ДАВАЙТЕ')}
          <br />
          <span className="display-accent accent">{t('connect.', 'знакомиться.')}</span>
        </h1>
        <p>
          {t(
            'A few useful details. A real conversation. A potential new partnership.',
            'Несколько полезных деталей. Предметный разговор. Возможность нового партнёрства.',
          )}
        </p>
        <ol className="apply-progress">
          {stepNames.map((name, i) => (
            <li key={name} className={i === step ? 'is-current' : i < step ? 'is-done' : ''}>
              <button
                type="button"
                disabled={sending || reference !== '' || i >= step}
                onClick={() => {
                  setStep(i);
                  setError('');
                }}
                aria-current={i === step ? 'step' : undefined}
              >
                <span>{i < step || reference ? <Check size={14} /> : `0${i + 1}`}</span>
                {name}
              </button>
            </li>
          ))}
        </ol>
        <div className="apply-private">
          <LockKeyhole size={17} strokeWidth={1.4} />
          <p>
            {t(
              'A private introduction. We never ask for passwords, OTPs or personal banking credentials.',
              'Приватное знакомство. Не запрашиваем пароли, OTP или личные банковские данные.',
            )}
          </p>
        </div>
        <a href="mailto:hello@vladdos.com" className="apply-direct">
          <Mail size={15} />
          {t('Prefer a direct conversation?', 'Предпочитаете написать напрямую?')}
          <ArrowUpRight size={15} />
        </a>
      </div>
      <div ref={panel} className="apply-panel">
        <>
          {reference ? (
            <div className="application-success">
              <div className="success-mark">
                <CheckCheck size={35} strokeWidth={1.2} />
              </div>
              <Eyebrow>{t('Application saved', 'Заявка сохранена')}</Eyebrow>
              <h2>
                {t('A GOOD', 'ХОРОШЕЕ')}
                <br />
                <span className="display-accent">{t('first move.', 'начало.')}</span>
              </h2>
              <p>
                {t(
                  'Your introduction is recorded. We will review the information and contact you if there is a suitable opportunity.',
                  'Ваша заявка записана. Рассмотрим информацию и свяжемся с вами, если найдём подходящую возможность.',
                )}
              </p>
              <div className="reference-box">
                <div>
                  <span>{t('Your reference', 'Номер заявки')}</span>
                  <strong>{reference}</strong>
                </div>
                <button
                  className="icon-button"
                  aria-label={t('Copy reference', 'Скопировать номер')}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(reference);
                      setCopied(true);
                    } catch {
                      setCopied(false);
                    }
                  }}
                >
                  {copied ? <Check size={19} /> : <Copy size={19} />}
                </button>
              </div>
              <span className="copy-status" aria-live="polite">
                {copied
                  ? t('Reference copied.', 'Номер скопирован.')
                  : t('Keep this reference for your records.', 'Сохраните номер заявки.')}
              </span>
              <Action to="/markets" secondary>
                {t('Explore the network', 'Посмотреть рынки')}
              </Action>
            </div>
          ) : (
            <form ref={form} onSubmit={advance} key="form" className="application-form">
              {ready && params.get('source') === 'forge' && (
                <div className="forge-arrival">
                  <Check size={15} />
                  <span>
                    {t(
                      'Your PAN profile is here. Review it and add your contact.',
                      'Профиль PAN перенесён. Проверьте его и добавьте контакт.',
                    )}
                  </span>
                </div>
              )}
              <div className="form-topline">
                <span>PAN / PARTNER INTRODUCTION</span>
                <span>{(step + 1).toString().padStart(2, '0')} — 03</span>
              </div>
              <>
                <div key={step}>
                  {step === 0 && (
                    <>
                      <h2>
                        {t('What do you', 'Что вы')}
                        <br />
                        <span className="display-accent">{t('bring?', 'предлагаете?')}</span>
                      </h2>
                      <p className="form-description">
                        {t(
                          'Choose the role that best describes your work.',
                          'Выберите роль, которая лучше описывает вашу работу.',
                        )}
                      </p>
                      <div className="role-options">
                        {roles.map((role, i) => (
                          <button
                            type="button"
                            key={role.id}
                            className={`role-option ${draft.role === role.id ? 'is-selected' : ''}`}
                            aria-pressed={draft.role === role.id}
                            onClick={() => update('role', role.id)}
                          >
                            <span className="role-option-index">0{i + 1}</span>
                            <span>
                              <strong>{t(role.title, role.ru)}</strong>
                              <small>{t(role.short, role.shortRu)}</small>
                            </span>
                            <span className="role-option-select">
                              {draft.role === role.id ? (
                                <Check size={14} />
                              ) : (
                                <ArrowUpRight size={15} />
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  {step === 1 && (
                    <>
                      <h2>
                        {draft.role === 'merchant'
                          ? t('Your business', 'Задачи вашего')
                          : t('Your markets', 'Ваши рынки')}
                        <br />
                        <span className="display-accent">
                          {draft.role === 'merchant'
                            ? t('requirements.', 'бизнеса.')
                            : t('and experience.', 'и опыт.')}
                        </span>
                      </h2>
                      <p className="form-description">
                        {t(
                          'Select your markets and share the essentials.',
                          'Выберите рынки и укажите главное.',
                        )}
                      </p>
                      <fieldset className="market-choice-fieldset">
                        <legend>
                          {t('Partnership markets', 'Рынки для сотрудничества')} *
                          <span>{selectedMarkets.length} / 10</span>
                        </legend>
                        <div className="market-choices">
                          {markets.map((m) => (
                            <label
                              key={m.slug}
                              className={draft.markets.includes(m.name) ? 'is-selected' : ''}
                            >
                              <input
                                type="checkbox"
                                checked={draft.markets.includes(m.name)}
                                onChange={() => toggleMarket(m.name)}
                              />
                              <b>{m.code}</b>
                              <span>{t(m.name, m.ru)}</span>
                              <span className="market-choice-mark">
                                {draft.markets.includes(m.name) ? (
                                  <Check size={14} />
                                ) : (
                                  <Plus size={14} />
                                )}
                              </span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                      <label className="field">
                        <span>{t('Other markets', 'Другие рынки')}</span>
                        <input
                          value={otherMarkets}
                          onChange={(e) => {
                            setOtherMarkets(e.target.value);
                            setError('');
                          }}
                          placeholder={t('e.g. Canada, Brazil', 'Например, Канада, Бразилия')}
                          maxLength={140}
                        />
                      </label>
                      <CategoryPicker
                        value={draft.category}
                        onChange={(value) => update('category', value)}
                        label={t('Business category', 'Бизнес-категория')}
                        optional
                      />
                      <div className="field-grid">
                        {field(
                          'methods',
                          t('Payment methods', 'Платёжные методы'),
                          'UPI, Mobile Money…',
                        )}
                        {field(
                          'size',
                          draft.role === 'team'
                            ? t('Team size', 'Размер команды')
                            : t('Company / network size', 'Размер компании / сети'),
                          t('Optional', 'Необязательно'),
                        )}
                      </div>
                      <div className="field-grid">
                        {field(
                          'experience',
                          t('Experience', 'Опыт'),
                          t('e.g. 3 years', 'Например, 3 года'),
                        )}
                        {field(
                          'volume',
                          t('Monthly volume, if relevant', 'Месячный объём, если применимо'),
                          t('Optional', 'Необязательно'),
                        )}
                      </div>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <h2>
                        {t('Make an', 'Начните')}
                        <br />
                        <span className="display-accent">{t('introduction.', 'знакомство.')}</span>
                      </h2>
                      <p className="form-description">
                        {t(
                          'Share a work contact and what you have in mind.',
                          'Оставьте рабочий контакт и расскажите о своём запросе.',
                        )}
                      </p>
                      <div className="field-grid">
                        {field(
                          'name',
                          t('Your name', 'Ваше имя'),
                          t('Full name', 'Имя и фамилия'),
                          true,
                        )}
                        {field(
                          'company',
                          t('Company / team', 'Компания / команда'),
                          t('Optional', 'Необязательно'),
                        )}
                      </div>
                      <div className="field-grid">
                        {field(
                          'email',
                          t('Work email', 'Рабочая почта'),
                          'you@company.com',
                          true,
                          'email',
                        )}
                        {field('telegram', 'Telegram', '@handle')}
                      </div>
                      <label className="field">
                        <span>
                          {t('What would make this useful?', 'Какое партнёрство вам интересно?')}
                        </span>
                        <textarea
                          value={draft.message}
                          onChange={(e) => update('message', e.target.value)}
                          maxLength={1500}
                          placeholder={t(
                            'Your experience, your needs, your next move…',
                            'Ваш опыт, потребности, следующий шаг…',
                          )}
                        />
                      </label>
                      <label className="honeypot" aria-hidden="true">
                        Leave blank
                        <input
                          name="site"
                          value={draft.site}
                          onChange={(e) => update('site', e.target.value)}
                          tabIndex={-1}
                          autoComplete="off"
                        />
                      </label>
                      <div className="application-summary">
                        <span>
                          {t(
                            roles.find((r) => r.id === draft.role)!.title,
                            roles.find((r) => r.id === draft.role)!.ru,
                          )}
                        </span>
                        <span>{selectedMarkets.join(' · ')}</span>
                        <button type="button" onClick={() => setStep(1)}>
                          {t('Edit', 'Изменить')}
                        </button>
                      </div>
                      <p className="form-privacy">
                        {t(
                          'By submitting, you acknowledge our',
                          'Отправляя заявку, вы подтверждаете ознакомление с',
                        )}{' '}
                        <Link to="/privacy">
                          {t('Privacy Notice', 'уведомлением о конфиденциальности')}
                        </Link>
                        .{' '}
                        {t(
                          'Commercial terms are agreed separately.',
                          'Коммерческие условия согласуются отдельно.',
                        )}
                      </p>
                    </>
                  )}
                </div>
              </>
              <div
                className="form-error"
                role={error ? 'alert' : undefined}
                aria-live="polite"
                hidden={!error}
              >
                {error}
              </div>
              <div className="form-actions">
                {step > 0 ? (
                  <button
                    className="form-back"
                    type="button"
                    disabled={sending}
                    onClick={() => {
                      setStep(step - 1);
                      setError('');
                    }}
                  >
                    <ArrowLeft size={16} />
                    {t('Back', 'Назад')}
                  </button>
                ) : (
                  <span className="form-autosave">
                    <span className="small-dot" />
                    {t('Session draft', 'Черновик сессии')}
                  </span>
                )}
                <button className="button button-gold" type="submit" disabled={sending || !ready}>
                  {sending ? (
                    <>
                      <LoaderCircle className="spin" size={17} />
                      {t('Saving…', 'Сохраняем…')}
                    </>
                  ) : (
                    <>
                      {step === 2
                        ? t('Send introduction', 'Отправить заявку')
                        : t('Continue', 'Продолжить')}
                      <ArrowUpRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </>
      </div>
    </section>
  );
}
