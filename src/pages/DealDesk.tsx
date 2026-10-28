import { useState, type FormEvent } from 'react';
import { LockKeyhole, LogOut, RefreshCw } from 'lucide-react';
import { useLocale } from '../locale';
import { countries, industries, capabilities, companyTypes, label } from '../network';
import { Eyebrow } from '../components/NetworkLayout';

type Row = Record<string, any>;
const statusList = ['new', 'review', 'qualified', 'discussion', 'agreed', 'closed', 'unsuitable'];
const statusRu: Record<string, string> = {
  new: 'Новая',
  review: 'Проверка',
  qualified: 'Квалифицирована',
  discussion: 'Обсуждение',
  agreed: 'Согласована',
  closed: 'Закрыта',
  unsuitable: 'Не подходит',
  unverified: 'Не проверена',
  'in-review': 'На проверке',
  verified: 'Проверена',
  rejected: 'Отклонена',
  proposed: 'Предложено',
  introduced: 'Познакомлены',
  won: 'Успех',
  lost: 'Не состоялось',
  due: 'К начислению',
  invoiced: 'Счёт выставлен',
  received: 'Получено',
  void: 'Аннулировано',
};
const emptyReport = {
  opportunities: [] as Row[],
  companies: [] as Row[],
  introductions: [] as Row[],
  agreements: [] as Row[],
  revenue: [] as Row[],
  totals: [] as Row[],
  notifications: { configured: false, pending: 0, failed: 0, jobs: [] as Row[] },
};
const money = (minor: number, currency: string) => {
  try {
    const f = new Intl.NumberFormat('en', { style: 'currency', currency });
    const digits = f.resolvedOptions().maximumFractionDigits ?? 2;
    return f.format(minor / 10 ** digits);
  } catch {
    return `${minor} ${currency}`;
  }
};
export default function DealDesk() {
  const { t, language } = useLocale();
  const [token, setToken] = useState('');
  const [key, setKey] = useState('');
  const [report, setReport] = useState(emptyReport);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState('opportunities');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [source, setSource] = useState('');
  const [dueOnly, setDueOnly] = useState(false);
  const [selected, setSelected] = useState<Row | null>(null);
  const [detail, setDetail] = useState<Row | null>(null);
  const [note, setNote] = useState('');
  const [notice, setNotice] = useState('');
  const state = (s: string) => (language === 'ru' ? statusRu[s] || s : s.replaceAll('-', ' '));
  const eventText = (event: Row) => {
    if (event.kind !== 'qualification') return event.detail;
    try {
      const { before, after } = JSON.parse(event.detail);
      const fields = [
        ['status', t('Stage', 'Этап')],
        ['verification', t('Verification', 'Проверка')],
        ['share_consent', t('Sharing permission', 'Разрешение на передачу')],
        ['owner', t('Owner', 'Ответственный')],
        ['follow_up', t('Follow-up', 'Следующий контакт')],
        ['expires_at', t('Expiry', 'Актуально до')],
        ['evidence', t('Evidence', 'Подтверждения')],
      ];
      const value = (key: string, v: unknown) =>
        key === 'share_consent' ? (v ? t('yes', 'да') : t('no', 'нет')) : String(v || '—');
      const changes = fields
        .filter(([key]) => key in before && before[key] !== after[key])
        .map(
          ([key, name]) => name + ': ' + value(key, before[key]) + ' → ' + value(key, after[key]),
        );
      if (JSON.stringify(before.profile) !== JSON.stringify(after.profile))
        changes.push(
          t('Scope updated; verification reset.', 'Задача изменена; проверка сброшена.'),
        );
      return changes.join(' · ') || t('Qualification record saved.', 'Запись проверки сохранена.');
    } catch {
      return event.detail;
    }
  };
  const request = async (path = '', method = 'GET', body?: unknown, auth = token) => {
    const r = await fetch('/api/admin/desk' + path, {
      method,
      headers: {
        Authorization: 'Bearer ' + auth,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || t('Request failed', 'Ошибка запроса'));
    return data;
  };
  const load = async (auth = token) => {
    setReport(await request('', 'GET', undefined, auth));
  };
  const perform = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await fn();
      await load();
      setNotice(t('Saved to the Deal Desk.', 'Сохранено в Deal Desk.'));
    } catch (e) {
      setError(e instanceof Error ? e.message : t('Unable to save', 'Не удалось сохранить'));
    } finally {
      setBusy(false);
    }
  };
  const login = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await load(key);
      setToken(key);
      setKey('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unavailable');
    } finally {
      setBusy(false);
    }
  };
  const open = async (item: Row) => {
    setError('');
    try {
      setDetail(await request('/opportunities/' + item.id));
      setSelected({ ...item });
    } catch (e) {
      setError(String(e));
    }
  };
  const form = (e: FormEvent<HTMLFormElement>) => Object.fromEntries(new FormData(e.currentTarget));
  if (!token)
    return (
      <section className="desk-login wrap">
        <LockKeyhole size={28} />
        <Eyebrow>PRIVATE OPERATIONS</Eyebrow>
        <h1>
          VlaDDoS<em>Deal Desk.</em>
        </h1>
        <p>
          {t(
            'For the network’s authorised operator. Use your operations key. It stays in memory for this session.',
            'Для уполномоченного оператора сети. Введите операционный ключ. Он хранится только в памяти этой сессии.',
          )}
        </p>
        <form onSubmit={login}>
          <label>
            {t('Operations key', 'Операционный ключ')}
            <input
              required
              type="password"
              autoComplete="off"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </label>
          <button className="action" disabled={busy}>
            {t('Open the desk', 'Открыть Deal Desk')}
            <LockKeyhole size={16} />
          </button>
        </form>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
      </section>
    );
  return (
    <section className="deal-desk wrap">
      <div className="desk-heading">
        <div>
          <Eyebrow>VLADDOS NETWORK / PRIVATE OPERATIONS</Eyebrow>
          <h1>Deal Desk.</h1>
        </div>
        <div>
          <button
            className="text-link"
            onClick={async () => {
              setBusy(true);
              setError('');
              setNotice('');
              try {
                await load();
              } catch {
                setError(t('Unable to refresh the desk.', 'Не удалось обновить Deal Desk.'));
              } finally {
                setBusy(false);
              }
            }}
            disabled={busy}
          >
            <RefreshCw size={17} />
            {t('Refresh', 'Обновить')}
          </button>
          <button
            className="text-link"
            onClick={() => {
              setToken('');
              setReport(emptyReport);
              setSelected(null);
              setDetail(null);
            }}
          >
            <LogOut size={17} />
            {t('Lock desk', 'Закрыть доступ')}
          </button>
        </div>
      </div>
      <div className="desk-health">
        <span className={report.notifications.configured ? 'healthy' : 'needs-setup'}>
          {report.notifications.configured
            ? t('Notifications configured', 'Уведомления настроены')
            : t(
                'Notification delivery needs configuration',
                'Доставку уведомлений необходимо настроить',
              )}
        </span>
        <span>
          {t('Pending', 'Ожидают')}: {report.notifications.pending} · {t('Retrying', 'Повторяются')}
          : {report.notifications.failed}
        </span>
      </div>
      <div
        className="desk-tabs"
        role="navigation"
        aria-label={t('Desk sections', 'Разделы Deal Desk')}
      >
        {[
          ['opportunities', 'Opportunities', 'Возможности'],
          ['introductions', 'Introductions', 'Знакомства'],
          ['agreements', 'Agreements', 'Соглашения'],
          ['revenue', 'Revenue', 'Доход'],
          ['companies', 'Companies', 'Компании'],
          ['notifications', 'Notifications', 'Уведомления'],
        ].map(([id, en, ru]) => (
          <button
            key={id}
            aria-current={tab === id ? 'page' : undefined}
            onClick={() => {
              setTab(id);
              setSelected(null);
            }}
          >
            {t(en, ru)}
            <span>
              {report[id as keyof typeof report] instanceof Array
                ? (report[id as keyof typeof report] as Row[]).length
                : ''}
            </span>
          </button>
        ))}
      </div>
      {error && (
        <div role="alert" className="form-error">
          {error}
        </div>
      )}
      {notice && <p role="status">{notice}</p>}
      {tab === 'opportunities' && (
        <>
          <div className="desk-tools">
            <label>
              {t('Search company, contact or brief', 'Поиск по компании, контакту и брифу')}
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
            <label>
              {t('Pipeline', 'Этап')}
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="">{t('All states', 'Все статусы')}</option>
                {statusList.map((s) => (
                  <option key={s} value={s}>
                    {state(s)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t('Source', 'Источник')}
              <select value={source} onChange={(e) => setSource(e.target.value)}>
                <option value="">{t('All sources', 'Все источники')}</option>
                {[
                  ...new Set(
                    report.opportunities.map((o) => o.attribution?.source || '').filter(Boolean),
                  ),
                ].map((s: string) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="consent">
              <input
                type="checkbox"
                checked={dueOnly}
                onChange={(e) => setDueOnly(e.target.checked)}
              />
              {t('Follow-up due', 'Пора связаться')}
            </label>
          </div>
          <div className="desk-table-scroll">
            <table>
              <thead>
                <tr>
                  {[
                    'Reference / company',
                    'Side / industry',
                    'Countries',
                    'Qualification',
                    'Follow-up',
                  ].map((h, i) => (
                    <th key={h}>
                      {t(
                        h,
                        [
                          'Номер / компания',
                          'Сторона / индустрия',
                          'Страны',
                          'Проверка',
                          'Следующий контакт',
                        ][i],
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.opportunities
                  .filter(
                    (o) =>
                      (!filter || o.status === filter) &&
                      (!source || o.attribution?.source === source) &&
                      (!dueOnly ||
                        (o.follow_up &&
                          o.follow_up <= new Date().toLocaleDateString('en-CA') &&
                          !['closed', 'unsuitable'].includes(o.status))) &&
                      JSON.stringify(o).toLowerCase().includes(query.toLowerCase()),
                  )
                  .map((o) => (
                    <tr key={o.id}>
                      <td>
                        <button className="desk-record-link" onClick={() => void open(o)}>
                          {o.reference}
                        </button>
                        <strong>{o.company_name}</strong>
                        <small>{o.contacts}</small>
                      </td>
                      <td>
                        <span>
                          {o.side === 'unclassified'
                            ? t('Legacy · classify manually', 'Архив · нужна классификация')
                            : 'I ' + o.side.toUpperCase()}
                        </span>
                        <small>
                          {label(
                            industries.find((i) => i.id === o.industry),
                            language,
                          ) || o.profile.category}
                        </small>
                      </td>
                      <td>
                        {(o.profile.countries || [])
                          .map((id: string) =>
                            label(
                              countries.find((c) => c.id === id),
                              language,
                            ),
                          )
                          .join(', ') || o.profile.markets}
                      </td>
                      <td>
                        <span className={'status-tag ' + o.status}>{state(o.status)}</span>
                        <small>{state(o.verification)}</small>
                      </td>
                      <td>
                        {o.follow_up || '—'}
                        <small>{o.owner || '—'}</small>
                        <small>{o.attribution?.source || t('Unattributed', 'Без источника')}</small>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {!report.opportunities.length && (
            <p className="empty-state">
              {t(
                'No opportunities yet. New enquiries and preserved legacy applications appear here.',
                'Возможностей пока нет. Здесь появятся новые обращения и сохранённые старые заявки.',
              )}
            </p>
          )}
          {selected && detail && (
            <section className="desk-detail">
              <div className="section-heading">
                <div>
                  <Eyebrow>{selected.reference}</Eyebrow>
                  <h2>{selected.company_name}</h2>
                </div>
                <button className="text-link" onClick={() => setSelected(null)}>
                  {t('Close details', 'Закрыть')}
                </button>
              </div>
              <p className="private-note">
                {selected.profile.message ||
                  t('No additional message.', 'Без дополнительного сообщения.')}
              </p>
              <dl className="desk-scope">
                <dt>{t('Capabilities', 'Возможности')}</dt>
                <dd>
                  {(selected.profile.capabilities || [])
                    .map((id: string) =>
                      label(
                        capabilities.find((c) => c.id === id),
                        language,
                      ),
                    )
                    .join(' / ') || '—'}
                </dd>
                <dt>
                  {t('Company type / desired counterparty', 'Тип компании / искомый контрагент')}
                </dt>
                <dd>
                  {label(
                    companyTypes.find((c) => c.id === selected.profile.companyType),
                    language,
                  ) || '—'}{' '}
                  /{' '}
                  {label(
                    companyTypes.find((c) => c.id === selected.profile.targetType),
                    language,
                  ) || t('Open to a relevant partner', 'Подходящий партнёр')}
                </dd>
                <dt>{t('Methods / settlement', 'Методы / расчёты')}</dt>
                <dd>
                  {[
                    ...(selected.profile.methods || []),
                    ...(selected.profile.settlementCurrencies || []),
                  ].join(' / ') || '—'}
                </dd>
                <dt>
                  {t(
                    'Referral attribution · unconfirmed',
                    'Источник рекомендации · не подтверждён',
                  )}
                </dt>
                <dd>
                  {Object.entries(selected.attribution || {})
                    .filter(([, v]) => v)
                    .map(([k, v]) => k + ': ' + v)
                    .join(' / ') || '—'}
                </dd>
                <dt>
                  {t('Operating role · self-declared', 'Операционная роль · со слов заявителя')}
                </dt>
                <dd>
                  {[selected.profile.licensingStatus, selected.profile.licensingContext]
                    .filter(Boolean)
                    .join(' / ') || '—'}
                </dd>
                <dt>
                  {t('Commercial interest · unagreed', 'Коммерческий интерес · не согласован')}
                </dt>
                <dd>{selected.profile.commercialIntent || '—'}</dd>
              </dl>
              <form
                className="desk-edit"
                onSubmit={(e) => {
                  e.preventDefault();
                  void perform(async () => {
                    await request('/opportunities/' + selected.id, 'PATCH', {
                      status: selected.status,
                      verification: selected.verification,
                      evidence: selected.evidence,
                      owner: selected.owner,
                      follow_up: selected.follow_up,
                      expires_at: selected.expires_at,
                      share_consent: !!selected.share_consent,
                    });
                    setDetail(await request('/opportunities/' + selected.id));
                  });
                }}
              >
                <div className="field-pair">
                  <label>
                    {t('Pipeline stage', 'Этап')}
                    <select
                      value={selected.status}
                      onChange={(e) => setSelected({ ...selected, status: e.target.value })}
                    >
                      {statusList.map((s) => (
                        <option key={s} value={s}>
                          {state(s)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    {t('Verification', 'Проверка')}
                    <select
                      value={selected.verification}
                      onChange={(e) => setSelected({ ...selected, verification: e.target.value })}
                    >
                      {['unverified', 'in-review', 'verified', 'rejected'].map((s) => (
                        <option key={s} value={s}>
                          {state(s)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label>
                  {t(
                    'Evidence: entity, operating scope, source and sharing permission',
                    'Подтверждения: юрлицо, границы работы, источник и разрешение на передачу',
                  )}
                  <textarea
                    required={selected.verification === 'verified' || !!selected.share_consent}
                    minLength={
                      selected.verification === 'verified' || selected.share_consent
                        ? 10
                        : undefined
                    }
                    maxLength={1500}
                    rows={3}
                    value={selected.evidence}
                    onChange={(e) => setSelected({ ...selected, evidence: e.target.value })}
                  />
                </label>
                <div className="field-pair">
                  <label>
                    {t('Owner', 'Ответственный')}
                    <input
                      value={selected.owner}
                      onChange={(e) => setSelected({ ...selected, owner: e.target.value })}
                    />
                  </label>
                  <label>
                    {t('Follow-up date', 'Дата следующего контакта')}
                    <input
                      type="date"
                      value={selected.follow_up}
                      onChange={(e) => setSelected({ ...selected, follow_up: e.target.value })}
                    />
                  </label>
                  <label>
                    {t('Scope expires', 'Срок актуальности')}
                    <input
                      type="date"
                      value={selected.expires_at}
                      onChange={(e) => setSelected({ ...selected, expires_at: e.target.value })}
                    />
                  </label>
                  <label className="consent">
                    <input
                      type="checkbox"
                      checked={!!selected.share_consent}
                      onChange={(e) =>
                        setSelected({ ...selected, share_consent: e.target.checked })
                      }
                    />
                    {t('Permission to share is evidenced', 'Разрешение на передачу подтверждено')}
                  </label>
                </div>
                <button className="action" disabled={busy}>
                  {t('Save qualification', 'Сохранить проверку')}
                </button>
              </form>
              <ScopeEditor
                item={selected}
                busy={busy}
                save={(body) =>
                  perform(async () => {
                    await request('/opportunities/' + selected.id, 'PATCH', { profile: body });
                    setSelected(null);
                  })
                }
              />
              <div className="desk-candidates">
                <h3>{t('Candidates for manual review', 'Кандидаты для ручной проверки')}</h3>
                <p>
                  {t(
                    'Only verified, qualified opportunities with overlapping country, industry and capability appear. Sharing permission is checked again before a proposed introduction is recorded.',
                    'Показаны только проверенные квалифицированные возможности с общей страной, индустрией и возможностью. Разрешение на передачу повторно проверяется при создании знакомства.',
                  )}
                </p>
                {detail.candidates.length ? (
                  detail.candidates.map((c: Row) => (
                    <div className="candidate-row" key={c.id}>
                      <strong>{c.reference}</strong>
                      <span>
                        {c.countries.join(' / ')} · {c.capabilities.join(' / ')}
                      </span>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const values = form(e);
                          void perform(() =>
                            request('/introductions', 'POST', {
                              demandId: selected.side === 'need' ? selected.id : c.id,
                              supplyId: selected.side === 'offer' ? selected.id : c.id,
                              evidence: values.evidence,
                            }),
                          );
                        }}
                      >
                        <input
                          required
                          minLength={10}
                          name="evidence"
                          aria-label={t('Introduction evidence', 'Подтверждение знакомства')}
                          placeholder={t(
                            'Evidence and agreed scope',
                            'Подтверждение и согласованный контекст',
                          )}
                        />
                        <button className="action" disabled={busy}>
                          {t('Propose introduction', 'Предложить знакомство')}
                        </button>
                      </form>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">
                    {t(
                      'No eligible candidates in the saved records.',
                      'В сохранённых записях нет подходящих кандидатов.',
                    )}
                  </p>
                )}
              </div>
              <form
                className="desk-note"
                onSubmit={(e) => {
                  e.preventDefault();
                  void perform(async () => {
                    await request('/opportunities/' + selected.id + '/notes', 'POST', { note });
                    setNote('');
                    setDetail(await request('/opportunities/' + selected.id));
                  });
                }}
              >
                <label>
                  {t('Interaction note', 'Заметка о взаимодействии')}
                  <textarea
                    required
                    value={note}
                    maxLength={3000}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </label>
                <button className="action" disabled={busy}>
                  {t('Add to history', 'Добавить в историю')}
                </button>
              </form>
              <h3>{t('Interaction history', 'История взаимодействий')}</h3>
              <ol className="desk-history">
                {detail.events.map((ev: Row) => (
                  <li key={ev.id}>
                    <time>{new Date(ev.at).toLocaleString(language)}</time>
                    <strong>{ev.kind}</strong>
                    <p>{eventText(ev)}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </>
      )}
      {tab === 'introductions' && (
        <div className="desk-records">
          {report.introductions.map((i) => (
            <article key={i.id}>
              <Eyebrow>{i.id}</Eyebrow>
              <h2>
                {report.opportunities.find((o) => o.id === i.demand_id)?.reference} ↔{' '}
                {report.opportunities.find((o) => o.id === i.supply_id)?.reference}
              </h2>
              <p>{i.evidence}</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void perform(() => request('/introductions/' + i.id, 'PATCH', form(e)));
                }}
              >
                <label>
                  {t('State', 'Статус')}
                  <select name="status" defaultValue={i.status}>
                    {['proposed', 'introduced', 'discussion', 'agreed', 'won', 'lost'].map((s) => (
                      <option key={s} value={s}>
                        {state(s)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {t(
                    'Evidence of the actual action or outcome',
                    'Подтверждение действия или результата',
                  )}
                  <input name="evidence" required minLength={10} />
                </label>
                <button className="action" disabled={busy}>
                  {t('Update introduction', 'Обновить знакомство')}
                </button>
              </form>
            </article>
          ))}
          {!report.introductions.length && (
            <p className="empty-state">
              {t(
                'No introductions recorded. Create one from a qualified opportunity.',
                'Знакомств пока нет. Создайте его из квалифицированной возможности.',
              )}
            </p>
          )}
        </div>
      )}
      {tab === 'agreements' && (
        <>
          <div className="desk-records">
            {report.agreements.map((a) => (
              <article key={a.id}>
                <Eyebrow>
                  {a.model} / {a.id}
                </Eyebrow>
                <h2>
                  {a.currency} · {a.starts_on} → {a.ends_on}
                </h2>
                <p>{a.terms}</p>
                <p>
                  {t('Attribution', 'Авторство')}: {a.attribution}
                </p>
                <p>
                  {t('Evidence', 'Подтверждение')}: {a.evidence}
                </p>
              </article>
            ))}
          </div>
          <h2>{t('Record a signed agreement', 'Зафиксировать подписанное соглашение')}</h2>
          <form
            className="desk-entry-form"
            onSubmit={(e) => {
              e.preventDefault();
              const b = form(e);
              void perform(() =>
                request('/agreements', 'POST', {
                  ...b,
                  rateBps: b.ratePercent ? Number(b.ratePercent) * 100 : null,
                }),
              );
            }}
          >
            <label>
              {t('Introduction', 'Знакомство')}
              <select required name="introductionId">
                <option value="">
                  {t('Choose an actual introduction', 'Выберите состоявшееся знакомство')}
                </option>
                {report.introductions
                  .filter((i) => i.status !== 'proposed' && i.status !== 'lost')
                  .map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.id}
                    </option>
                  ))}
              </select>
            </label>
            <div className="field-pair">
              <label>
                {t('Model', 'Модель')}
                <select name="model">
                  <option value="revenue-share">Recurring revenue share</option>
                  <option value="success-fee">Success fee</option>
                  <option value="sourcing-project">Sourcing project</option>
                </select>
              </label>
              <label>
                {t('Reporting currency', 'Валюта отчётности')}
                <input
                  required
                  name="currency"
                  pattern="[A-Z]{3}"
                  placeholder="USD"
                  maxLength={3}
                />
              </label>
              <label>
                {t('Agreed share % · optional', 'Доля по договору % · необязательно')}
                <input type="number" name="ratePercent" step="0.01" min="0" max="100" />
              </label>
              <label>
                {t('Start', 'Начало')}
                <input required type="date" name="startsOn" />
              </label>
              <label>
                {t('End', 'Окончание')}
                <input required type="date" name="endsOn" />
              </label>
            </div>
            <label>
              {t(
                'Terms: payer, fee basis, trigger, exclusions, reporting and payment dates',
                'Условия: плательщик, база, триггер, исключения, отчётность и сроки оплаты',
              )}
              <textarea required minLength={10} maxLength={3000} name="terms" />
            </label>
            <label>
              {t(
                'Attribution and ownership confirmation',
                'Подтверждение авторства и принадлежности рекомендации',
              )}
              <textarea required minLength={5} name="attribution" />
            </label>
            <label>
              {t('Signed agreement reference', 'Ссылка на подписанное соглашение')}
              <input required minLength={10} name="evidence" />
            </label>
            <button className="action" disabled={busy}>
              {t('Record agreement', 'Сохранить соглашение')}
            </button>
          </form>
        </>
      )}
      {tab === 'revenue' && (
        <>
          <div className="revenue-totals">
            {report.totals.map((r) => (
              <div key={r.currency + r.status}>
                <Eyebrow>{state(r.status)}</Eyebrow>
                <strong>{money(r.amount_minor, r.currency)}</strong>
              </div>
            ))}
          </div>
          <p>
            {t(
              'Totals reflect recorded statements, grouped by currency. Received revenue is separate from amounts due. No FX conversions or projected returns are included.',
              'Итоги отражают записанные отчёты по каждой валюте. Полученный доход отделён от начислений. Конвертации и прогнозная доходность не включены.',
            )}
          </p>
          <div className="desk-records">
            {report.revenue.map((r) => (
              <article key={r.id}>
                <Eyebrow>
                  {r.period} / {r.agreement_id}
                </Eyebrow>
                <h2>{money(r.amount_minor, r.currency)}</h2>
                <p>
                  {state(r.status)} · {r.evidence}
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void perform(() => request('/revenue/' + r.id, 'PATCH', form(e)));
                  }}
                >
                  <label>
                    {t('State', 'Статус')}
                    <select name="status" defaultValue={r.status}>
                      {['due', 'invoiced', 'received', 'void'].map((s) => (
                        <option key={s} value={s}>
                          {state(s)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    {t(
                      'Statement, receipt or correction evidence',
                      'Отчёт, подтверждение оплаты или основание исправления',
                    )}
                    <input required minLength={5} name="evidence" />
                  </label>
                  <button className="action" disabled={busy}>
                    {t('Update record', 'Обновить запись')}
                  </button>
                </form>
              </article>
            ))}
          </div>
          <h2>{t('Record an evidenced amount', 'Записать подтверждённую сумму')}</h2>
          <form
            className="desk-entry-form"
            onSubmit={(e) => {
              e.preventDefault();
              const b = form(e);
              const a = report.agreements.find((a) => a.id === b.agreementId);
              if (!a) return;
              let digits = 2;
              try {
                digits =
                  new Intl.NumberFormat('en', {
                    style: 'currency',
                    currency: a.currency,
                  }).resolvedOptions().maximumFractionDigits ?? 2;
              } catch {}
              const value = String(b.amount);
              if (
                !new RegExp('^\\d+(?:\\.\\d{1,' + Math.max(1, digits) + '})?$').test(value) ||
                (digits === 0 && value.includes('.'))
              ) {
                setError(
                  t(
                    'Check the amount and currency precision.',
                    'Проверьте сумму и разрядность валюты.',
                  ),
                );
                return;
              }
              const [whole, fraction = ''] = value.split('.');
              const amountMinor =
                Number(whole) * 10 ** digits + Number(fraction.padEnd(digits, '0'));
              void perform(() =>
                request('/revenue', 'POST', { ...b, amountMinor, currency: a.currency }),
              );
            }}
          >
            <label>
              {t('Agreement', 'Соглашение')}
              <select required name="agreementId">
                <option value="">{t('Choose an agreement', 'Выберите соглашение')}</option>
                {report.agreements.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id} / {a.currency}
                  </option>
                ))}
              </select>
            </label>
            <div className="field-pair">
              <label>
                {t('Reporting month', 'Месяц отчётности')}
                <input required type="month" name="period" />
              </label>
              <label>
                {t('Amount in agreement currency', 'Сумма в валюте соглашения')}
                <input required inputMode="decimal" name="amount" placeholder="0.00" />
              </label>
              <label>
                {t('State', 'Статус')}
                <select name="status">
                  {['due', 'invoiced', 'received'].map((s) => (
                    <option key={s} value={s}>
                      {state(s)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              {t('Unique statement or payment reference', 'Уникальный номер отчёта или оплаты')}
              <input required minLength={5} name="evidence" />
            </label>
            <button className="action" disabled={busy}>
              {t('Record amount', 'Сохранить сумму')}
            </button>
          </form>
        </>
      )}
      {tab === 'notifications' && (
        <section className="desk-notifications">
          <h2>{t('Durable delivery queue', 'Постоянная очередь доставки')}</h2>
          <p>
            {t(
              'Only event IDs and references leave the desk. Delivery is at least once; the receiver must deduplicate Idempotency-Key. Retry processes due jobs and respects backoff.',
              'За пределы Deal Desk передаются только идентификатор события и номер обращения. Доставка — минимум один раз; получатель обязан устранять дубли по Idempotency-Key. Повтор обрабатывает задания, срок которых наступил.',
            )}
          </p>
          <button
            className="action"
            disabled={busy || !report.notifications.configured}
            onClick={() => void perform(() => request('/notifications/retry', 'POST', {}))}
          >
            {t('Process due notifications', 'Обработать ожидающие уведомления')}
          </button>
          <div className="desk-table-scroll">
            <table>
              <thead>
                <tr>
                  {[
                    t('Reference', 'Номер'),
                    t('Delivery', 'Доставка'),
                    t('Failed attempts / next retry', 'Неудачные попытки / следующий повтор'),
                    t('Last error', 'Последняя ошибка'),
                  ].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(report.notifications.jobs || []).map((job: Row) => (
                  <tr key={job.reference}>
                    <td>{job.reference}</td>
                    <td>
                      {job.delivered_at
                        ? t('Delivered', 'Доставлено')
                        : job.attempts
                          ? t('Retry scheduled', 'Повтор запланирован')
                          : t('Pending', 'Ожидает')}
                    </td>
                    <td>
                      {job.attempts}
                      {!job.delivered_at && <small>{job.next_at}</small>}
                    </td>
                    <td>{job.last_error || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!report.notifications.jobs?.length && (
            <p>{t('No notification jobs yet.', 'Заданий пока нет.')}</p>
          )}
        </section>
      )}
      {tab === 'companies' && (
        <>
          <div className="desk-records">
            {report.companies.map((c) => (
              <article key={c.id}>
                <Eyebrow>{c.id}</Eyebrow>
                <h2>{c.name}</h2>
                <p>{c.contacts}</p>
              </article>
            ))}
          </div>
          <h2>{t('Resolve a duplicate company', 'Объединить дубликат компании')}</h2>
          <p>
            {t(
              'An identical contact is deduplicated automatically. Company names and shared email domains require identity evidence before merging.',
              'Одинаковые контакты объединяются автоматически. Для объединения по названию компании или домену нужны подтверждения идентичности.',
            )}
          </p>
          <form
            className="desk-entry-form"
            onSubmit={(e) => {
              e.preventDefault();
              void perform(() => request('/merge', 'POST', form(e)));
            }}
          >
            <div className="field-pair">
              {[
                ['sourceId', 'Merge this record', 'Объединить эту запись'],
                ['targetId', 'Into this company', 'С этой компанией'],
              ].map(([name, en, ru]) => (
                <label key={name}>
                  {t(en, ru)}
                  <select name={name} required>
                    <option value="">{t('Choose a company', 'Выберите компанию')}</option>
                    {report.companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} / {c.contacts}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <label>
              {t('Identity evidence', 'Подтверждение идентичности')}
              <input name="evidence" required minLength={10} />
            </label>
            <button className="action" disabled={busy}>
              {t('Merge with audit record', 'Объединить с записью в журнал')}
            </button>
          </form>
        </>
      )}
    </section>
  );
}
function ScopeEditor({
  item,
  busy,
  save,
}: {
  item: Row;
  busy: boolean;
  save: (body: unknown) => Promise<unknown>;
}) {
  const { t, language } = useLocale();
  return (
    <details className="engine-details">
      <summary>
        {t('Review or refine the opportunity scope', 'Проверить или уточнить профиль возможности')}
      </summary>
      <form
        className="desk-entry-form"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const chosen = f.getAll('countries').map(String);
          const local = countries.filter((c) => chosen.includes(c.id));
          void save({
            side: f.get('side'),
            industry: f.get('industry'),
            countries: chosen,
            companyType: f.get('companyType'),
            targetType: f.get('targetType'),
            methods: (item.profile.methods || []).filter((m: string) =>
              local.some((c) => c.methods.includes(m)),
            ),
            settlementCurrencies: (item.profile.settlementCurrencies || []).filter((v: string) =>
              local.some((c) => c.currency === v),
            ),
            capabilities: f.getAll('capabilities'),
            message: item.profile.message || '',
          });
        }}
      >
        <div className="field-pair">
          <label>
            {t('Side', 'Сторона')}
            <select
              name="side"
              required
              defaultValue={item.side === 'unclassified' ? '' : item.side}
            >
              <option value="">{t('Choose a side', 'Выберите сторону')}</option>
              <option value="need">I NEED</option>
              <option value="offer">I OFFER</option>
            </select>
          </label>
          <label>
            {t('Industry', 'Индустрия')}
            <select name="industry" required defaultValue={item.industry || ''}>
              <option value="">{t('Choose an industry', 'Выберите индустрию')}</option>
              {industries.map((i) => (
                <option key={i.id} value={i.id}>
                  {label(i, language)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="field-hint">
          {t(
            'Changing scope returns this opportunity to review and clears verification and sharing permission.',
            'Изменение профиля возвращает возможность на проверку и сбрасывает подтверждение и разрешение на передачу.',
          )}
        </p>
        <div className="field-pair">
          {[
            ['companyType', 'Company type', 'Тип компании'],
            ['targetType', 'Desired counterparty', 'Искомый контрагент'],
          ].map(([name, en, ru]) => (
            <label key={name}>
              {t(en, ru)}
              <select name={name} defaultValue={item.profile[name] || ''}>
                <option value="">{t('To be clarified', 'Нужно уточнить')}</option>
                {companyTypes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {label(c, language)}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <fieldset className="desk-checkboxes">
          <legend>{t('Countries', 'Страны')}</legend>
          {countries.map((c) => (
            <label key={c.id}>
              <input
                type="checkbox"
                name="countries"
                value={c.id}
                defaultChecked={item.profile.countries?.includes(c.id)}
              />
              {label(c, language)}
            </label>
          ))}
        </fieldset>
        <fieldset className="desk-checkboxes">
          <legend>{t('Capabilities', 'Возможности')}</legend>
          {capabilities.map((c) => (
            <label key={c.id}>
              <input
                type="checkbox"
                name="capabilities"
                value={c.id}
                defaultChecked={item.profile.capabilities?.includes(c.id)}
              />
              {label(c, language)}
            </label>
          ))}
        </fieldset>
        <button className="action" disabled={busy}>
          {t('Save classification', 'Сохранить классификацию')}
        </button>
      </form>
    </details>
  );
}
