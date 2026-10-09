import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, LoaderCircle, Pause, Play, RefreshCw, X } from 'lucide-react';
import { Dialog, Eyebrow } from './UI';
import { useLocale } from '../locale';
import type { Guide, ResearchSource } from '../growth';

interface GrowthReport {
  enabled: boolean;
  paused: boolean;
  running: boolean;
  origin: string;
  lastRun: string | null;
  nextRun: string | null;
  connectors: { ai: boolean; aiAutoPublish: boolean; searchConsole: boolean; model: string | null };
  articles: Guide[];
  sources: (ResearchSource & { error?: string })[];
  runs: {
    id: string;
    started_at: string;
    status: string;
    summary: {
      published?: string[];
      drafted?: string[];
      notes?: string[];
      sourceErrors?: string[];
    };
  }[];
  acquisition: { source: string; applications: number; qualified: number; agreed: number }[];
  pages: { path: string; views: number }[];
  queries: { query: string; page: string; clicks: number; impressions: number; position: number }[];
}
export default function GrowthConsole({ token }: { token: string }) {
  const { t, language } = useLocale();
  const [data, setData] = useState<GrowthReport | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<Guide | null>(null);
  const request = useRef<AbortController | null>(null);
  const load = async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    try {
      const response = await fetch('/api/admin/growth', {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      if (!response.ok)
        throw new Error(
          t('Could not load acquisition data.', 'Не удалось загрузить данные привлечения.'),
        );
      setData(await response.json());
      setError('');
    } catch (cause) {
      if (!controller.signal.aborted)
        setError(
          cause instanceof Error ? cause.message : t('Connection failed.', 'Ошибка соединения.'),
        );
    }
  };
  useEffect(() => {
    void load();
    return () => request.current?.abort();
  }, [token]);
  useEffect(() => {
    if (!data?.running) return;
    const timer = window.setTimeout(() => void load(), 6000);
    return () => clearTimeout(timer);
  }, [data]);
  const mutate = async (path: string, method: string, body?: object) => {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/admin/growth' + path, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || t('Action failed.', 'Действие не выполнено.'));
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : t('Action failed.', 'Действие не выполнено.'),
      );
    } finally {
      setBusy(false);
    }
  };
  const date = (value: string) =>
    new Intl.DateTimeFormat(language === 'ru' ? 'ru-RU' : 'en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  const status = (value: string) =>
    ({
      published: t('Published', 'Опубликован'),
      ready: t('Prepared', 'Подготовлен'),
      draft: t('Draft', 'Черновик'),
      archived: t('Archived', 'Архив'),
      complete: t('Completed', 'Завершён'),
      partial: t('Partial', 'Частично'),
      failed: t('Failed', 'Ошибка'),
      running: t('Running', 'В работе'),
      ok: t('Available', 'Доступен'),
      pending: t('Not checked', 'Не проверен'),
      unavailable: t('Unavailable', 'Недоступен'),
    })[value] || value;
  return (
    <details className="growth-console">
      <summary>
        <div>
          <Eyebrow>PAN / {t('Acquisition', 'Привлечение')}</Eyebrow>
          <strong>{t('Content & acquisition engine', 'Публикации и привлечение')}</strong>
        </div>
        <span>
          {data?.running
            ? t('Running', 'В работе')
            : data?.paused
              ? t('Paused', 'Приостановлен')
              : data?.enabled
                ? t('Schedule enabled', 'Расписание включено')
                : t('Manual mode', 'Ручной режим')}{' '}
          <ArrowUpRight size={18} />
        </span>
      </summary>
      <div className="growth-console-body">
        <div className="growth-actions">
          <p>
            {data?.lastRun
              ? `${t('Last run', 'Последний запуск')}: ${date(data.lastRun)}`
              : t('The first run has not started yet.', 'Первого запуска ещё не было.')}
          </p>
          <div>
            <button
              className="button button-outline"
              disabled={busy || data?.running}
              onClick={() => void mutate('/run', 'POST')}
            >
              {busy || data?.running ? (
                <LoaderCircle size={15} className="spin" />
              ) : (
                <Play size={15} />
              )}
              {t('Run cycle', 'Запустить цикл')}
            </button>
            <button
              className="button button-outline"
              disabled={busy}
              onClick={() => void mutate('', 'PATCH', { paused: !data?.paused })}
            >
              {data?.paused ? <Play size={15} /> : <Pause size={15} />}
              {data?.paused ? t('Resume', 'Продолжить') : t('Pause schedule', 'Приостановить')}
            </button>
            <button
              className="icon-button"
              aria-label={t('Refresh acquisition data', 'Обновить данные привлечения')}
              onClick={() => void load()}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
        <p className="form-error" hidden={!error} role="alert">
          {error}
        </p>
        {data && (
          <>
            <div className="growth-connection-grid">
              {[
                [
                  t('Public domain', 'Публичный домен'),
                  Boolean(data.origin),
                  data.origin || t('Set PUBLIC_SITE_URL', 'Укажите PUBLIC_SITE_URL'),
                ],
                [
                  'Search Console',
                  data.connectors.searchConsole,
                  t('Search queries and impressions', 'Запросы и показы поиска'),
                ],
                [
                  'AI Gateway',
                  data.connectors.ai,
                  data.connectors.model || t('Key and model required', 'Нужны ключ и модель'),
                ],
                [
                  t('AI publication', 'AI-публикация'),
                  data.connectors.aiAutoPublish,
                  data.connectors.aiAutoPublish
                    ? t('Automatic after quality checks', 'Автоматически после проверок')
                    : t('Drafts for editorial review', 'Черновики для проверки'),
                ],
              ].map(([label, connected, note]) => (
                <div key={String(label)}>
                  <span className={connected ? 'growth-connected' : 'growth-disconnected'}>
                    {connected ? <Check size={14} /> : <X size={14} />}
                    {label}
                  </span>
                  <small>{note}</small>
                </div>
              ))}
            </div>
            <div className="growth-section-heading">
              <h3>{t('Publication queue', 'Очередь публикаций')}</h3>
              <span>
                {data.articles.filter((g) => g.status === 'published').length} /{' '}
                {data.articles.length} {t('published', 'опубликовано')}
              </span>
            </div>
            <div className="growth-content-list">
              {data.articles.map((guide) => (
                <div key={guide.slug}>
                  <button onClick={() => setSelected(guide)}>
                    <strong>{t(guide.title, guide.titleRu)}</strong>
                    <small>
                      {status(guide.status)} ·{' '}
                      {guide.generated ? 'AI' : t('Editorial material', 'Редакционный материал')}
                    </small>
                  </button>
                  <div>
                    {guide.status === 'published' ? (
                      <>
                        <Link className="text-link" to={'/knowledge/' + guide.slug}>
                          {t('Open', 'Открыть')} <ArrowUpRight size={14} />
                        </Link>
                        <button
                          className="growth-text-button"
                          disabled={busy}
                          onClick={() =>
                            void mutate('/articles/' + guide.slug, 'PATCH', { status: 'archived' })
                          }
                        >
                          {t('Archive', 'В архив')}
                        </button>
                      </>
                    ) : guide.status !== 'archived' ? (
                      <button
                        className="button button-outline"
                        disabled={busy}
                        onClick={() =>
                          void mutate('/articles/' + guide.slug, 'PATCH', { status: 'published' })
                        }
                      >
                        {t('Publish', 'Опубликовать')}
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            <div className="growth-report-grid">
              <section>
                <h3>{t('Sources → results · 30 days', 'Источники → результат · 30 дней')}</h3>
                {data.acquisition.length ? (
                  <div className="growth-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>{t('Source', 'Источник')}</th>
                          <th>{t('Applied', 'Заявки')}</th>
                          <th>{t('Qualified', 'Подходят')}</th>
                          <th>{t('Agreed', 'Согласованы')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.acquisition.map((row) => (
                          <tr key={row.source}>
                            <td>{row.source}</td>
                            <td>{row.applications}</td>
                            <td>{row.qualified}</td>
                            <td>{row.agreed}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>
                    {t(
                      'Source attribution appears with new applications.',
                      'Источники появятся вместе с новыми заявками.',
                    )}
                  </p>
                )}
              </section>
              <section>
                <h3>{t('Page views · 30 days', 'Просмотры страниц · 30 дней')}</h3>
                {data.pages.length ? (
                  <ul className="growth-metric-list">
                    {data.pages.map((row) => (
                      <li key={row.path}>
                        <Link to={row.path}>{row.path}</Link>
                        <strong>{row.views}</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    {t(
                      'Anonymous page counts appear after visits.',
                      'Счётчики появятся после просмотров.',
                    )}
                  </p>
                )}
                <small>
                  {t(
                    'Counts are views, not unique visitors. Bot filtering is basic.',
                    'Считаются просмотры, не уникальные посетители. Фильтрация ботов базовая.',
                  )}
                </small>
              </section>
            </div>
            {!!data.queries.length && (
              <section>
                <h3>
                  {t(
                    'Search demand · latest 28-day snapshot',
                    'Спрос поиска · последний срез за 28 дней',
                  )}
                </h3>
                <div className="growth-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>{t('Query', 'Запрос')}</th>
                        <th>{t('Impressions', 'Показы')}</th>
                        <th>{t('Clicks', 'Клики')}</th>
                        <th>{t('Position', 'Позиция')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.queries.map((q) => (
                        <tr key={q.query + q.page}>
                          <td>{q.query}</td>
                          <td>{q.impressions}</td>
                          <td>{q.clicks}</td>
                          <td>{q.position.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
            <div className="growth-report-grid">
              <section>
                <h3>{t('Primary sources', 'Первоисточники')}</h3>
                <ul className="growth-source-list">
                  {data.sources.map((source) => (
                    <li key={source.id}>
                      <a href={source.url} target="_blank" rel="noopener noreferrer">
                        {source.name} <ArrowUpRight size={13} />
                      </a>
                      <small>
                        {status(source.status)}
                        {source.checked_at ? ' · ' + date(source.checked_at) : ''}
                      </small>
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h3>{t('Run history', 'Журнал запусков')}</h3>
                {data.runs.length ? (
                  <div className="growth-run-list">
                    {data.runs.map((run) => (
                      <details key={run.id}>
                        <summary>
                          <span>{date(run.started_at)}</span>
                          <span>{status(run.status)}</span>
                        </summary>
                        <p>
                          {t('Published', 'Опубликовано')}:{' '}
                          {run.summary.published?.join(', ') || '—'}
                        </p>
                        <p>
                          {t('Drafts', 'Черновики')}: {run.summary.drafted?.join(', ') || '—'}
                        </p>
                        {run.summary.notes?.map((note, i) => (
                          <p key={i}>{note}</p>
                        ))}
                        {!!run.summary.sourceErrors?.length && (
                          <p>
                            {t('Unavailable sources', 'Недоступные источники')}:{' '}
                            {run.summary.sourceErrors.join(', ')}
                          </p>
                        )}
                      </details>
                    ))}
                  </div>
                ) : (
                  <p>{t('Runs will appear here.', 'Здесь появятся запуски.')}</p>
                )}
              </section>
            </div>
            <p className="growth-admin-note">
              {t(
                'One publication per day. One AI attempt per day. New AI topics need supported search demand and accessible registered sources. Quality gates check structure, citations and duplication; an expert may still need to correct factual interpretation.',
                'Одна публикация и одна AI-попытка в сутки. Новым AI-темам нужны подходящий поисковый спрос и доступные зарегистрированные источники. Проверяются структура, ссылки и повторы; интерпретацию фактов при необходимости корректирует эксперт.',
              )}
            </p>
          </>
        )}
      </div>
      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={t('Publication preview', 'Предпросмотр материала')}
        className="application-dialog"
      >
        {selected && (
          <>
            <Eyebrow>{status(selected.status)}</Eyebrow>
            <h2>{t(selected.title, selected.titleRu)}</h2>
            <p>{t(selected.summary, selected.summaryRu)}</p>
            {selected.sections.map((section) => (
              <section className="growth-preview-section" key={section.id}>
                <h3>{t(section.heading, section.headingRu)}</h3>
                <p>{t(section.body, section.bodyRu)}</p>
              </section>
            ))}
            <ol>
              {(language === 'ru' ? selected.checklistRu : selected.checklist).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </>
        )}
      </Dialog>
    </details>
  );
}
