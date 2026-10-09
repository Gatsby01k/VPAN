import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  ArrowUpRight,
  Check,
  Download,
  Inbox,
  KeyRound,
  LoaderCircle,
  LogOut,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { Dialog, Eyebrow } from '../components/UI';
import { SelectControl } from '../components/FormControls';
import { roles, statuses, type Application, type ApplicationStatus } from '../data';
import { useLocale } from '../locale';

export default function AdminPage() {
  const { language, t } = useLocale();
  const [key, setKey] = useState('');
  const [token, setToken] = useState('');
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState('');
  const [savingId, setSavingId] = useState('');
  const [notification, setNotification] = useState('');
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);
  const selected = items.find((i) => i.id === selectedId);
  const labels: Record<ApplicationStatus, string> = {
    new: t('New', 'Новая'),
    review: t('In review', 'На рассмотрении'),
    qualified: t('Qualified', 'Подходит'),
    discussion: t('In discussion', 'Обсуждение'),
    agreed: t('Agreed', 'Согласовано'),
    closed: t('Closed', 'Закрыто'),
  };
  const filtered = useMemo(
    () =>
      items.filter(
        (i) =>
          (filter === 'all' || i.status === filter) &&
          `${i.name} ${i.email} ${i.company} ${i.reference} ${i.markets} ${i.role}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
      ),
    [items, query, filter],
  );
  const date = (value: string) =>
    new Intl.DateTimeFormat(language === 'ru' ? 'ru-RU' : 'en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  const roleName = (id: string) => {
    const role = roles.find((r) => r.id === id);
    return role ? t(role.title, role.ru) : id;
  };

  const load = async (access = token) => {
    active.current?.abort();
    const request = new AbortController();
    active.current = request;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/applications', {
        headers: { Authorization: `Bearer ${access}` },
        signal: request.signal,
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          setToken('');
          setItems([]);
          setSelectedId('');
        }
        throw new Error(
          response.status === 401
            ? t('Access key not accepted.', 'Ключ доступа не принят.')
            : t('Could not load applications.', 'Не удалось загрузить заявки.'),
        );
      }
      setToken(access);
      setKey('');
      setItems(data.items);
    } catch (cause) {
      if (!request.signal.aborted)
        setError(
          cause instanceof Error ? cause.message : t('Connection failed.', 'Ошибка соединения.'),
        );
    } finally {
      if (!request.signal.aborted) setLoading(false);
    }
  };
  const login = (e: FormEvent) => {
    e.preventDefault();
    if (key.trim()) void load(key.trim());
  };
  const updateStatus = async (id: string, status: ApplicationStatus) => {
    setSavingId(id);
    setError('');
    setNotification('');
    try {
      const response = await fetch(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok)
        throw new Error(
          t(
            'The status could not be saved. Try again.',
            'Не удалось сохранить статус. Попробуйте снова.',
          ),
        );
      setItems((previous) => previous.map((item) => (item.id === id ? { ...item, status } : item)));
      setNotification(t('Status saved.', 'Статус сохранён.'));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : t('Could not update the application.', 'Не удалось обновить заявку.'),
      );
    } finally {
      setSavingId('');
    }
  };
  const exportCsv = () => {
    const fields: (keyof Application)[] = [
      'reference',
      'created_at',
      'role',
      'markets',
      'name',
      'company',
      'email',
      'telegram',
      'category',
      'size',
      'methods',
      'volume',
      'experience',
      'message',
      'status',
    ];
    const cell = (value: unknown) => {
      let text = String(value ?? '');
      if (/^[=+@-]/.test(text)) text = `'${text}`;
      return `"${text.replaceAll('"', '""')}"`;
    };
    const csv =
      '\uFEFF' +
      [
        fields.join(','),
        ...filtered.map((row) => fields.map((field) => cell(row[field])).join(',')),
      ].join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `pan-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <section className="admin-page wrap">
      <div className="admin-heading">
        <div>
          <Eyebrow>{t('PAN / Operations', 'PAN / Операционная панель')}</Eyebrow>
          <h1>
            {t('Partner', 'Партнёрский')}{' '}
            <span className="display-accent">{t('desk.', 'отдел.')}</span>
          </h1>
          <p>{t('A clear view of every introduction.', 'Понятный обзор каждого обращения.')}</p>
        </div>
        {token && (
          <button
            className="button button-outline"
            onClick={() => {
              active.current?.abort();
              setToken('');
              setKey('');
              setItems([]);
              setSelectedId('');
              setError('');
              setNotification('');
            }}
          >
            <LogOut size={16} />
            {t('Sign out', 'Выйти')}
          </button>
        )}
      </div>
      {!token ? (
        <div className="admin-access-grid">
          <form className="admin-access" onSubmit={login}>
            <div className="access-icon">
              <KeyRound size={27} strokeWidth={1.2} />
            </div>
            <h2>{t('Private access.', 'Закрытый доступ.')}</h2>
            <p>
              {t(
                'Enter your operations access key to review partner applications.',
                'Введите ключ операционного доступа для просмотра партнёрских заявок.',
              )}
            </p>
            <label className="field">
              <span>{t('Access key', 'Ключ доступа')}</span>
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                autoComplete="off"
                required
                placeholder={t('Your access key', 'Ваш ключ доступа')}
              />
            </label>
            <button className="button button-gold" disabled={loading}>
              {loading ? <LoaderCircle className="spin" size={17} /> : <ArrowUpRight size={17} />}
              {loading
                ? t('Connecting…', 'Подключаемся…')
                : t('Open partner desk', 'Открыть панель')}
            </button>
            <p role="alert" className="form-error" hidden={!error}>
              {error}
            </p>
          </form>
          <div className="admin-access-note">
            <span>PAN / RESTRICTED WORKSPACE</span>
            <Inbox size={60} strokeWidth={0.7} />
            <h3>
              {t('Every introduction.', 'Каждая заявка.')}
              <br />
              <span className="display-accent">
                {t('A useful next step.', 'Понятный следующий шаг.')}
              </span>
            </h3>
            <p>
              {t(
                'Review experience, discuss fit and keep partner information in one focused workspace.',
                'Рассматривайте опыт, обсуждайте интересы и работайте с информацией партнёров в одном пространстве.',
              )}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="admin-stats">
            {[
              [t('Applications', 'Заявки'), items.length],
              [
                t('New introductions', 'Новые обращения'),
                items.filter((i) => i.status === 'new').length,
              ],
              [
                t('Active discussions', 'Активные обсуждения'),
                items.filter((i) => ['review', 'qualified', 'discussion'].includes(i.status))
                  .length,
              ],
            ].map(([label, count]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{Number(count).toString().padStart(2, '0')}</strong>
              </div>
            ))}
          </div>
          <div className="admin-toolbar">
            <div className="search-field">
              <Search size={17} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('Search name, company, reference…', 'Имя, компания, номер заявки…')}
                aria-label={t('Search applications', 'Поиск заявок')}
              />
            </div>
            <div className="admin-filter">
              <SlidersHorizontal size={15} />
              <SelectControl
                label={t('Filter by status', 'Фильтр по статусу')}
                value={filter}
                onChange={setFilter}
                options={[
                  { value: 'all', label: t('All statuses', 'Все статусы') },
                  ...statuses.map((status) => ({ value: status, label: labels[status] })),
                ]}
              />
            </div>
            <button
              className="icon-button"
              onClick={() => void load()}
              disabled={loading}
              aria-label={t('Refresh applications', 'Обновить заявки')}
            >
              <RefreshCw size={17} className={loading ? 'spin' : ''} />
            </button>
            <button
              className="button button-outline export-button"
              disabled={!filtered.length}
              onClick={exportCsv}
            >
              <Download size={15} />
              CSV
            </button>
          </div>
          <div className="admin-feedback">
            <p className="form-error" role="alert" hidden={!error}>
              {error}
            </p>
            <p className="status-notification" aria-live="polite">
              {notification && (
                <>
                  <Check size={14} />
                  {notification}
                </>
              )}
            </p>
          </div>
          <div className="inbox-list">
            <div className="inbox-list-header">
              <span>{t('Introduction / contact', 'Заявка / контакт')}</span>
              <span>{t('Role / markets', 'Роль / рынки')}</span>
              <span>{t('Status', 'Статус')}</span>
              <span>{t('Received', 'Получена')}</span>
            </div>
            {filtered.map((item) => (
              <div className="inbox-row" key={item.id}>
                <button className="inbox-contact" onClick={() => setSelectedId(item.id)}>
                  <small>{item.reference}</small>
                  <strong>
                    {item.name}
                    <ArrowUpRight size={15} />
                  </strong>
                  <span>{item.company || item.email}</span>
                </button>
                <div className="inbox-market">
                  <strong>{roleName(item.role)}</strong>
                  <span>{item.markets}</span>
                </div>
                <div className="inbox-status">
                  <span className={`status-dot status-${item.status}`} />
                  <SelectControl
                    value={item.status}
                    disabled={savingId === item.id}
                    label={`${t('Status for', 'Статус заявки')} ${item.reference}`}
                    onChange={(value) => void updateStatus(item.id, value as ApplicationStatus)}
                    options={statuses.map((status) => ({ value: status, label: labels[status] }))}
                  />
                </div>
                <span className="inbox-date">{date(item.created_at)}</span>
              </div>
            ))}
          </div>
          {!filtered.length && (
            <div className="empty-state">
              <Inbox size={38} strokeWidth={1} />
              <h2>
                {items.length
                  ? t('No matching introductions.', 'Нет подходящих заявок.')
                  : t('Ready for the first introduction.', 'Готовы к первой заявке.')}
              </h2>
              <p>
                {items.length
                  ? t(
                      'Change the search or status filter.',
                      'Измените поиск или фильтр по статусу.',
                    )
                  : t('Saved applications will appear here.', 'Сохранённые заявки появятся здесь.')}
              </p>
            </div>
          )}
          <p className="admin-list-note">
            {t(
              'Showing the most recent 500 applications. Export respects the current filters.',
              'Показаны последние 500 заявок. Экспорт учитывает текущие фильтры.',
            )}
          </p>
        </>
      )}
      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelectedId('')}
        title={t('Application details', 'Подробности заявки')}
        className="application-dialog"
      >
        {selected && (
          <>
            <Eyebrow>{selected.reference}</Eyebrow>
            <h2>{selected.name}</h2>
            <p className="application-detail-subtitle">
              {roleName(selected.role)} / {date(selected.created_at)}
            </p>
            <dl className="application-detail-fields">
              {[
                [t('Company / team', 'Компания / команда'), selected.company],
                [t('Email', 'Почта'), selected.email],
                ['Telegram', selected.telegram],
                [t('Markets', 'Рынки'), selected.markets],
                [t('Category', 'Категория'), selected.category],
                [t('Payment methods', 'Платёжные методы'), selected.methods],
                [t('Team / network size', 'Размер команды / сети'), selected.size],
                [t('Monthly volume', 'Месячный объём'), selected.volume],
                [t('Experience', 'Опыт'), selected.experience],
                [t('Introduction', 'Сообщение'), selected.message],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value || '—'}</dd>
                </div>
              ))}
            </dl>
            <div className="field">
              <span>{t('Application status', 'Статус заявки')}</span>
              <SelectControl
                value={selected.status}
                disabled={savingId === selected.id}
                label={t('Application status', 'Статус заявки')}
                onChange={(value) => void updateStatus(selected.id, value as ApplicationStatus)}
                options={statuses.map((status) => ({ value: status, label: labels[status] }))}
              />
            </div>
            <p className="form-error" role="alert" hidden={!error}>
              {error}
            </p>
            <p className="status-notification" aria-live="polite">
              {notification}
            </p>
          </>
        )}
      </Dialog>
    </section>
  );
}
