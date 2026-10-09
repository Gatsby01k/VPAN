import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Check, Copy, Download, Plus } from 'lucide-react';
import { markets, roles, type RoleId } from '../data';
import { useLocale } from '../locale';
import { CategoryPicker } from './FormControls';
import { restorePartnerProfile, savePartnerProfile } from './partner-profile';

const questions: Record<RoleId, [string, string][]> = {
  affiliate: [
    ['Who owns the introduction?', 'За кем закрепляется рекомендация?'],
    ['Which event creates the reward?', 'За какое событие начисляется вознаграждение?'],
    ['How are attribution and payment confirmed?', 'Как подтверждаются атрибуция и выплата?'],
  ],
  team: [
    ['Who is responsible for local operations?', 'Кто отвечает за локальные операции?'],
    [
      'Which methods and working hours are supported?',
      'Какие методы и часы работы поддерживаются?',
    ],
    ['How are incidents and reconciliation handled?', 'Как решаются инциденты и сверка?'],
  ],
  provider: [
    ['Which categories can you support?', 'Какие категории бизнеса вы поддерживаете?'],
    ['What does merchant onboarding require?', 'Что нужно для подключения мерчанта?'],
    ['Which integration and settlement terms apply?', 'Каковы условия интеграции и расчётов?'],
  ],
  merchant: [
    ['Which business categories and GEOs fit?', 'Какие категории бизнеса и GEO подходят?'],
    [
      'What are onboarding and integration requirements?',
      'Что нужно для подключения и интеграции?',
    ],
    [
      'How are settlement, limits and responsibilities agreed?',
      'Как согласуются расчёты, лимиты и ответственность?',
    ],
  ],
  regional: [
    ['Who are the local decision-makers?', 'Кто принимает решения на месте?'],
    ['Which local capabilities can be confirmed?', 'Какие местные возможности можно подтвердить?'],
    ['What is the scope of your introduction?', 'Какова сфера вашей рекомендации?'],
  ],
};

export function BriefStudio({ role, onRole }: { role: RoleId; onRole: (id: RoleId) => void }) {
  const { t } = useLocale();
  const [params] = useSearchParams();
  const [selected, setSelected] = useState<string[]>([]);
  const [category, setCategory] = useState('iGaming');
  const [methods, setMethods] = useState<string[]>([]);
  const [copiedFor, setCopiedFor] = useState('');
  const [notice, setNotice] = useState('');
  const [noticeFor, setNoticeFor] = useState('');
  const [restored, setRestored] = useState(false);
  const current = roles.find((r) => r.id === role)!;
  const chosen = markets.filter((m) => selected.includes(m.slug));
  const available = [...new Set(chosen.flatMap((m) => m.methods))];
  useEffect(() => {
    const saved = restorePartnerProfile(params);
    setSelected(saved.markets);
    setCategory(saved.category);
    setMethods(saved.methods);
    setRestored(true);
  }, [params]);
  useEffect(() => {
    if (restored) savePartnerProfile({ role, markets: selected, category, methods });
  }, [role, selected, category, methods, restored]);
  const toggleMarket = (slug: string) => {
    const next = selected.includes(slug)
      ? selected.filter((s) => s !== slug)
      : selected.length < 3
        ? [...selected, slug]
        : selected;
    setSelected(next);
    const allowed = new Set(markets.filter((m) => next.includes(m.slug)).flatMap((m) => m.methods));
    setMethods((v) => v.filter((m) => allowed.has(m)));
    setCopiedFor('');
    setNotice('');
  };
  const preferences = new URLSearchParams({
    role,
    markets: selected.join(','),
    category,
    methods: methods.join(','),
    source: 'forge',
  });
  const copied = copiedFor === preferences.toString();
  const briefText = () =>
    [
      'PAN / PRIVATE AFFILIATE NETWORK',
      t(
        'PARTNERSHIP BRIEF — prepared for discussion',
        'ПАРТНЁРСКИЙ БРИФ — подготовлен для обсуждения',
      ),
      '',
      `${t('Role', 'Роль')}: ${t(current.title, current.ru)}`,
      `${t('Business category', 'Категория бизнеса')}: ${category === 'other' ? t('Other', 'Другая') : category}`,
      `${t('Markets', 'Рынки')}: ${chosen.map((m) => `${t(m.name, m.ru)} (${m.currency})`).join(', ')}`,
      `${t('Methods to discuss', 'Методы для обсуждения')}: ${methods.length ? methods.join(', ') : t('To be discussed', 'Требуют обсуждения')}`,
      '',
      t('MARKET CONTEXT', 'КОНТЕКСТ РЫНКОВ'),
      ...chosen.map((m) => `${t(m.name, m.ru)} / ${m.currency}: ${m.methods.join(', ')}`),
      '',
      t('BEFORE AN INTRODUCTION', 'ДО ЗНАКОМСТВА'),
      ...questions[role].map(([en, ru], i) => `${i + 1}. ${t(en, ru)}`),
      '',
      t(
        'Methods describe local infrastructure. Availability and commercial terms require individual agreement.',
        'Методы описывают местную инфраструктуру. Доступность и коммерческие условия согласуются отдельно.',
      ),
      '',
      'hello@vladdos.com / https://t.me/PAN_Affiliate',
    ].join('\n');
  const download = () => {
    const url = URL.createObjectURL(new Blob([briefText()], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `PAN-profile-${selected.join('-') || 'draft'}.txt`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNoticeFor(preferences.toString());
    setNotice(t('Your profile has been saved.', 'Профиль сохранён.'));
  };
  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${location.origin}/?${preferences}#forge`);
      setCopiedFor(preferences.toString());
      setNotice('');
    } catch {
      setNoticeFor(preferences.toString());
      setNotice(
        t(
          'Copy is unavailable. Download your brief instead.',
          'Копирование недоступно. Скачайте бриф.',
        ),
      );
    }
  };
  return (
    <section className="partner-studio" id="forge">
      <div className="wrap">
        <div className="chapter-line">
          <span>01 / {t('YOUR PARTNER PROFILE', 'ТВОЙ ПАРТНЁРСКИЙ ПРОФИЛЬ')}</span>
          <span>{t('A CONCRETE STARTING POINT', 'КОНКРЕТНАЯ ОСНОВА ДЛЯ РАЗГОВОРА')}</span>
        </div>
        <div className="profile-heading">
          <h2>
            {t('YOUR EXPERTISE.', 'ТВОЯ ЭКСПЕРТИЗА.')}
            <br />
            <span>{t('YOUR WAY IN.', 'ТВОЙ ВХОД В PAN.')}</span>
          </h2>
          <p>
            {t(
              'Choose your role and markets. Your profile updates as you go. Take it into the application or save it for a conversation.',
              'Выбери роль и рынки. Профиль собирается по ходу выбора. Перенеси его в заявку или сохрани для разговора.',
            )}
          </p>
        </div>
        <div className="profile-workspace">
          <div className="profile-inputs">
            <fieldset>
              <legend>01 / {t('WHAT DO YOU BRING?', 'С ЧЕМ ТЫ ПРИХОДИШЬ?')}</legend>
              <div
                className="profile-role-picker"
                role="group"
                aria-label={t('Your role', 'Ваша роль')}
              >
                {roles.map((r) => (
                  <button
                    key={r.id}
                    aria-pressed={r.id === role}
                    onClick={() => {
                      onRole(r.id);
                      setCopiedFor('');
                    }}
                  >
                    {r.id === 'provider' ? 'PSP' : t(r.title, r.ru)}
                    {r.id === role && <Check size={15} />}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>
                02 / {t('WHICH MARKETS?', 'КАКИЕ РЫНКИ?')} <span>{selected.length} / 3 GEO</span>
              </legend>
              <div
                className="profile-market-picker"
                role="group"
                aria-label={t('Choose up to three markets', 'Выберите до трёх рынков')}
              >
                {markets.map((m) => (
                  <button
                    key={m.slug}
                    onClick={() => toggleMarket(m.slug)}
                    aria-pressed={selected.includes(m.slug)}
                    disabled={!selected.includes(m.slug) && selected.length === 3}
                  >
                    <b>{m.code}</b>
                    <span>{t(m.name, m.ru)}</span>
                    <small>{m.currency}</small>
                    {selected.includes(m.slug) ? <Check size={16} /> : <Plus size={16} />}
                  </button>
                ))}
              </div>
              <p className="profile-help">
                {t(
                  'Choose 1–3 markets where you have experience or a business need.',
                  'Выбери 1–3 рынка, где у тебя есть опыт или бизнес-задача.',
                )}
              </p>
            </fieldset>
            <CategoryPicker
              value={category}
              onChange={(value) => {
                setCategory(value);
                setCopiedFor('');
              }}
              label={`03 / ${t('BUSINESS CATEGORY', 'КАТЕГОРИЯ БИЗНЕСА')}`}
            />
            {available.length > 0 && (
              <fieldset className="profile-methods">
                <legend>04 / {t('METHODS TO DISCUSS', 'МЕТОДЫ ДЛЯ ОБСУЖДЕНИЯ')}</legend>
                <div
                  role="group"
                  aria-label={t('Preferred payment methods', 'Предпочтительные платёжные методы')}
                >
                  {available.map((method) => (
                    <button
                      key={method}
                      aria-pressed={methods.includes(method)}
                      onClick={() => {
                        setMethods((v) =>
                          v.includes(method) ? v.filter((m) => m !== method) : [...v, method],
                        );
                        setCopiedFor('');
                      }}
                    >
                      {methods.includes(method) ? <Check size={13} /> : <Plus size={13} />}
                      {method}
                    </button>
                  ))}
                </div>
                <p className="profile-help">
                  {t(
                    'Local method references; availability and compatibility are discussed individually.',
                    'Справочник локальных методов. Доступность и совместимость обсуждаем отдельно.',
                  )}
                </p>
              </fieldset>
            )}
          </div>
          <div className="profile-output">
            <div className="partner-pass" aria-live="polite">
              <div className="pass-head">
                <span>PAN</span>
                <span>
                  PRIVATE AFFILIATE
                  <br />
                  NETWORK
                </span>
                <ArrowUpRight size={28} />
              </div>
              <div className="pass-status">
                {t('PARTNER PROFILE / FOR DISCUSSION', 'ПРОФИЛЬ ПАРТНЁРА / ДЛЯ ОБСУЖДЕНИЯ')}
              </div>
              <h3>{role === 'provider' ? 'PSP' : t(current.title, current.ru)}</h3>
              <dl>
                <div>
                  <dt>{t('Markets', 'Рынки')}</dt>
                  <dd>
                    {chosen.length
                      ? chosen.map((m) => t(m.name, m.ru)).join(' / ')
                      : t('Choose your GEO', 'Выбери свой GEO')}
                  </dd>
                </div>
                <div>
                  <dt>{t('Category', 'Категория')}</dt>
                  <dd>{category === 'other' ? t('Other', 'Другая') : category}</dd>
                </div>
                <div>
                  <dt>{t('Payment methods', 'Платёжные методы')}</dt>
                  <dd>
                    {methods.length ? methods.join(' / ') : t('To be discussed', 'Обсудим вместе')}
                  </dd>
                </div>
              </dl>
              <div className="pass-context">
                <span>{t('OUR FIRST CONVERSATION', 'В ПЕРВОМ РАЗГОВОРЕ')}</span>
                <ul>
                  {questions[role].map(([en, ru]) => (
                    <li key={en}>{t(en, ru)}</li>
                  ))}
                </ul>
              </div>
              <div className="pass-bottom">
                <span>{chosen.map((m) => m.code).join(' · ') || 'GEO / —'}</span>
                <span>{t('READY TO TALK', 'ГОТОВЫ ОБСУЖДАТЬ')}</span>
              </div>
            </div>
            <Link
              className={`profile-submit ${!chosen.length ? 'is-disabled' : ''}`}
              aria-disabled={!chosen.length}
              to={chosen.length ? `/apply?${preferences}` : '#forge'}
              onClick={(e) => {
                if (!chosen.length) e.preventDefault();
              }}
            >
              {t('Continue to application', 'Перейти к заявке')}
              <ArrowUpRight size={23} />
            </Link>
            <div className="profile-export">
              <button onClick={download} disabled={!chosen.length}>
                <Download size={16} />
                {t('Save profile', 'Сохранить профиль')}
              </button>
              <button onClick={share} disabled={!chosen.length}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {t('Copy link', 'Скопировать ссылку')}
              </button>
            </div>
            <p className="profile-notice" role="status">
              {(noticeFor === preferences.toString() ? notice : '') ||
                (copied
                  ? t(
                      'Link copied. It contains your choices only, no contact data.',
                      'Ссылка скопирована. В ней только выбор, без контактных данных.',
                    )
                  : chosen.length
                    ? t(
                        'Your choices will carry over. Add your contact details in the application.',
                        'Выбор перенесётся в заявку. Контакт добавишь на следующем шаге.',
                      )
                    : t('Choose a market to continue.', 'Выбери рынок, чтобы продолжить.'))}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
