import crypto from 'node:crypto';
import { catalog, sources, staticRoutes } from './catalog.mjs';
import { checkSource, generateGuide, searchConsoleConnector } from './connectors.mjs';

export const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
export const scriptJson = (value) =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
export function siteOrigin(value) {
  if (!value) return '';
  const url = new URL(value);
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== '/'
  )
    throw new Error('PUBLIC_SITE_URL must be an HTTPS origin, without a path or credentials');
  return url.origin;
}
const hash = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const plain = (value, max) =>
  typeof value === 'string' && value.length <= max && !/[<>\u0000-\u0008]/.test(value);
const words = (text) =>
  String(text || '')
    .toLowerCase()
    .match(/[\p{L}\p{N}]{3,}/gu) || [];
const topicSources = (query) =>
  sources
    .filter((source) =>
      source.id === 'npci'
        ? /upi/i.test(query)
        : source.id === 'daraja'
          ? /m.?pesa|daraja/i.test(query)
          : /spei/i.test(query),
    )
    .map((s) => s.id);
function similarity(a, b) {
  const left = new Set(words(a)),
    right = new Set(words(b));
  if (!left.size || !right.size) return 0;
  return [...left].filter((word) => right.has(word)).length / Math.min(left.size, right.size);
}
export function validateGuide(guide, existing = []) {
  if (!guide || typeof guide !== 'object') return ['Invalid guide'];
  const issues = [];
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(guide.slug || '') || guide.slug.length > 100)
    issues.push('Invalid slug');
  for (const key of ['title', 'titleRu', 'summary', 'summaryRu'])
    if (!plain(guide[key], key.startsWith('title') ? 180 : 400) || guide[key].trim().length < 20)
      issues.push(`Invalid ${key}`);
  if (!Array.isArray(guide.sections) || guide.sections.length < 3 || guide.sections.length > 6)
    issues.push('Expected 3–6 sections');
  const ids = new Set();
  for (const section of Array.isArray(guide.sections) ? guide.sections : []) {
    if (!section || typeof section !== 'object') {
      issues.push('Invalid section');
      continue;
    }
    if (!/^[a-z0-9-]{1,60}$/.test(section.id || '') || ids.has(section.id))
      issues.push('Invalid or duplicate section ID');
    ids.add(section.id);
    for (const key of ['heading', 'headingRu', 'body', 'bodyRu'])
      if (
        !plain(section[key], key.startsWith('heading') ? 180 : 5000) ||
        section[key].trim().length < (key.startsWith('heading') ? 5 : 120)
      )
        issues.push(`Invalid section ${key}`);
    for (const key of ['bullets', 'bulletsRu'])
      if (
        !Array.isArray(section[key]) ||
        section[key].length > 10 ||
        !section[key].every((s) => plain(s, 400))
      )
        issues.push('Invalid section checklist');
  }
  for (const key of ['checklist', 'checklistRu'])
    if (
      !Array.isArray(guide[key]) ||
      guide[key].length < 5 ||
      guide[key].length > 10 ||
      !guide[key].every((s) => plain(s, 400) && s.length > 10)
    )
      issues.push('Expected actionable checklist');
  if (
    !Array.isArray(guide.sourceIds) ||
    guide.sourceIds.some((id) => !sources.some((s) => s.id === id))
  )
    issues.push('Unapproved source');
  for (const key of ['body', 'bodyRu'])
    if (
      words(
        (Array.isArray(guide.sections) ? guide.sections : []).map((s) => s?.[key] || '').join(' '),
      ).length < (guide.generated ? 170 : 100)
    )
      issues.push('Insufficient substantive content');
  const text = JSON.stringify(guide);
  if (
    guide.generated &&
    /(?:guaranteed (?:approval|revenue|returns)|PAN (?:guarantees|is licensed|processes)|PAN (?:гарантирует|лицензирован)|\b\d+(?:\.\d+)?\s*%)/i.test(
      text,
    )
  )
    issues.push('Unverified commercial or numeric claim');
  if (
    existing.some(
      (g) =>
        g.slug !== guide.slug &&
        (similarity(guide.title, g.title) > 0.8 ||
          similarity(
            (Array.isArray(guide.sections) ? guide.sections : [])
              .map((s) => s?.body || '')
              .join(' '),
            g.sections.map((s) => s.body).join(' '),
          ) > 0.88),
    )
  )
    issues.push('Duplicate intent or content');
  return [...new Set(issues)];
}
export function cleanAttribution(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result = {};
  for (const key of ['source', 'medium', 'campaign', 'ref']) {
    const entry = value[key];
    if (typeof entry === 'string' && /^[\p{L}\p{N} ._-]{1,100}$/u.test(entry)) result[key] = entry;
  }
  if (
    typeof value.landing === 'string' &&
    /^\/(?:[a-z0-9-]+\/?)*$/.test(value.landing) &&
    value.landing.length < 180
  )
    result.landing = value.landing;
  if (typeof value.referrer === 'string' && /^[a-z0-9.-]{1,120}$/i.test(value.referrer))
    result.referrer = value.referrer;
  return result;
}

export function createGrowth(
  db,
  {
    publicSiteUrl = '',
    enabled = true,
    intervalMs = 6 * 3600000,
    publicationGapMs = 24 * 3600000,
    aiKey = '',
    aiModel = '',
    aiAutoPublish = false,
    gscFile = '',
    gscProperty = '',
    fetcher = fetch,
    now = () => new Date(),
    check = checkSource,
    generate = generateGuide,
    readSearch,
  } = {},
) {
  const origin = siteOrigin(publicSiteUrl);
  const lifetime = new AbortController();
  db.exec(`CREATE TABLE IF NOT EXISTS growth_articles (slug TEXT PRIMARY KEY, status TEXT NOT NULL, body TEXT NOT NULL, content_hash TEXT NOT NULL, created_at TEXT NOT NULL, published_at TEXT, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS growth_state (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS growth_runs (id TEXT PRIMARY KEY, started_at TEXT NOT NULL, finished_at TEXT, status TEXT NOT NULL, summary TEXT NOT NULL DEFAULT '{}');
    CREATE TABLE IF NOT EXISTS growth_sources (id TEXT PRIMARY KEY, checked_at TEXT, status TEXT NOT NULL DEFAULT 'pending', content_hash TEXT, excerpt TEXT, error TEXT);
    CREATE TABLE IF NOT EXISTS growth_views (day TEXT NOT NULL, path TEXT NOT NULL, source TEXT NOT NULL, views INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(day,path,source));
    CREATE TABLE IF NOT EXISTS growth_search (query TEXT NOT NULL, page TEXT NOT NULL, clicks REAL NOT NULL, impressions REAL NOT NULL, position REAL NOT NULL, observed_at TEXT NOT NULL, PRIMARY KEY(query,page));
    CREATE TABLE IF NOT EXISTS growth_revisions (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL, body TEXT NOT NULL, at TEXT NOT NULL, reason TEXT NOT NULL);`);
  const stamp = () => now().toISOString();
  const state = (key) => db.prepare('SELECT value FROM growth_state WHERE key = ?').get(key)?.value;
  const setState = (key, value) =>
    db
      .prepare(
        'INSERT INTO growth_state(key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
      )
      .run(key, String(value));
  for (const source of sources)
    db.prepare('INSERT OR IGNORE INTO growth_sources(id) VALUES (?)').run(source.id);
  for (const article of catalog) {
    const issues = validateGuide(article);
    if (issues.length) throw new Error(`Editorial input ${article.slug}: ${issues.join(', ')}`);
    db.prepare(
      'INSERT OR IGNORE INTO growth_articles(slug,status,body,content_hash,created_at,published_at,updated_at) VALUES (?,?,?,?,?,?,?)',
    ).run(
      article.slug,
      article.initial ? 'published' : 'ready',
      JSON.stringify(article),
      hash(article),
      stamp(),
      article.initial ? stamp() : null,
      stamp(),
    );
  }
  const articles = (all = false) =>
    db
      .prepare(
        `SELECT * FROM growth_articles ${all ? '' : "WHERE status = 'published'"} ORDER BY published_at DESC,created_at DESC,slug`,
      )
      .all()
      .map((row) => ({
        ...JSON.parse(row.body),
        status: row.status,
        publishedAt: row.published_at,
        updatedAt: row.updated_at,
        createdAt: row.created_at,
      }));
  const sourceState = () =>
    sources.map((s) => {
      const record = db
        .prepare('SELECT checked_at,status,error FROM growth_sources WHERE id = ?')
        .get(s.id);
      return { id: s.id, name: s.name, url: s.url, editorialChecked: s.checked, ...record };
    });
  const publicData = (slug = '') => ({
    articles: articles().map((guide) =>
      guide.slug === slug ? guide : { ...guide, sections: [], checklist: [], checklistRu: [] },
    ),
    sources: sourceState().map(({ error, ...s }) => s),
    origin,
  });
  const publish = (slug, reason = 'scheduled') => {
    const row = db.prepare('SELECT * FROM growth_articles WHERE slug = ?').get(slug);
    if (!row) throw new Error('Article not found');
    if (row.status === 'published') return false;
    const guide = JSON.parse(row.body);
    const issues = validateGuide(guide, articles());
    if (issues.length) throw new Error(issues.join(', '));
    db.exec('BEGIN IMMEDIATE');
    try {
      db.prepare(
        'UPDATE growth_articles SET status=?, published_at=COALESCE(published_at,?), updated_at=? WHERE slug=?',
      ).run('published', stamp(), stamp(), slug);
      db.prepare('INSERT INTO growth_revisions(slug,body,at,reason) VALUES (?,?,?,?)').run(
        slug,
        row.body,
        stamp(),
        reason,
      );
      setState('last_publication', stamp());
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
    return true;
  };
  const read =
    readSearch || searchConsoleConnector({ file: gscFile, property: gscProperty, fetcher });
  let running = null,
    timer;
  async function execute(force) {
    const time = now().getTime();
    const interrupted =
      Number(state('lease_until') || 0) <= time &&
      Boolean(db.prepare("SELECT 1 FROM growth_runs WHERE status='running' LIMIT 1").get());
    if (
      !force &&
      (!enabled ||
        state('paused') === '1' ||
        (!interrupted && time - Date.parse(state('last_run') || '1970-01-01') < intervalMs))
    )
      return { skipped: 'not_due_or_paused' };
    // A durable lease protects a shared SQLite volume across processes and restarts.
    db.exec('BEGIN IMMEDIATE');
    const lease = Number(state('lease_until') || 0);
    if (lease > time) {
      db.exec('ROLLBACK');
      return { skipped: 'running' };
    }
    setState('lease_until', time + 15 * 60000);
    db.prepare(
      "UPDATE growth_runs SET status='failed',finished_at=?,summary=? WHERE status='running'",
    ).run(
      stamp(),
      JSON.stringify({
        notes: [
          'Previous process stopped before completion; the lease expired and a new cycle recovered it.',
        ],
      }),
    );
    setState('last_run', stamp());
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO growth_runs(id,started_at,status) VALUES (?,?,?)').run(
      id,
      stamp(),
      'running',
    );
    db.exec('COMMIT');
    const summary = {
      checkedSources: 0,
      sourceErrors: [],
      published: [],
      drafted: [],
      searchRows: 0,
      notes: [],
    };
    try {
      // Failures in research must not stop intake or replace a working article.
      for (const source of sources) {
        const prior = db.prepare('SELECT * FROM growth_sources WHERE id = ?').get(source.id);
        if (!force && prior.checked_at && time - Date.parse(prior.checked_at) < 86400000) continue;
        try {
          const checked = await check(source, fetcher, lifetime.signal);
          db.prepare(
            'UPDATE growth_sources SET status=?,checked_at=?,content_hash=?,excerpt=?,error=NULL WHERE id=?',
          ).run('ok', stamp(), checked.hash, checked.excerpt, source.id);
          summary.checkedSources++;
          if (prior.content_hash && prior.content_hash !== checked.hash)
            summary.notes.push(
              `${source.id}: source changed; factual changes require an editorial check`,
            );
        } catch {
          db.prepare('UPDATE growth_sources SET status=?,checked_at=?,error=? WHERE id=?').run(
            'unavailable',
            stamp(),
            'Source check failed; retaining last reviewed editorial facts.',
            source.id,
          );
          summary.sourceErrors.push(source.id);
        }
      }
      if ((gscFile && gscProperty) || readSearch) {
        try {
          const data = await read(lifetime.signal);
          for (const row of data.rows || []) {
            const [query, page] = row.keys || [];
            if (!plain(query, 180) || !query.trim() || /@|https?:|\b\d{6,}\b/.test(query)) continue;
            let pageUrl;
            try {
              pageUrl = new URL(page);
            } catch {
              continue;
            }
            if (
              !origin ||
              pageUrl.origin !== origin ||
              (!staticRoutes.includes(pageUrl.pathname) &&
                !/^\/knowledge\/[a-z0-9-]+$/.test(pageUrl.pathname))
            )
              continue;
            if (
              ![row.clicks, row.impressions, row.position].every(
                (n) => Number.isFinite(n) && n >= 0,
              )
            )
              continue;
            db.prepare(
              'INSERT INTO growth_search(query,page,clicks,impressions,position,observed_at) VALUES (?,?,?,?,?,?) ON CONFLICT(query,page) DO UPDATE SET clicks=excluded.clicks,impressions=excluded.impressions,position=excluded.position,observed_at=excluded.observed_at',
            ).run(
              query,
              pageUrl.origin + pageUrl.pathname,
              row.clicks,
              row.impressions,
              row.position,
              stamp(),
            );
            summary.searchRows++;
          }
          db.prepare('DELETE FROM growth_search WHERE observed_at < ?').run(
            new Date(time - 35 * 86400000).toISOString(),
          );
        } catch {
          summary.notes.push('Search Console sync failed; retained previous metrics.');
        }
      }
      const last = Date.parse(state('last_publication') || '1970-01-01');
      if (time - last >= publicationGapMs) {
        const ready = articles(true).filter((g) => g.status === 'ready');
        // Prefer markets with actual incoming demand, without exposing any applicant data.
        const demand = db
          .prepare('SELECT markets FROM applications WHERE created_at >= ?')
          .all(new Date(time - 30 * 86400000).toISOString());
        const marketNames = { india: 'India', kenya: 'Kenya', mexico: 'Mexico' };
        ready.sort(
          (a, b) =>
            demand.filter((r) => r.markets.includes(marketNames[b.market] || '\0')).length -
            demand.filter((r) => r.markets.includes(marketNames[a.market] || '\0')).length,
        );
        const next = ready.find((g) =>
          g.sourceIds.every(
            (sourceId) =>
              db.prepare('SELECT status FROM growth_sources WHERE id=?').get(sourceId)?.status ===
              'ok',
          ),
        );
        if (next && publish(next.slug)) summary.published.push(next.slug);
        else {
          if (ready.length)
            summary.notes.push('Prepared guides are waiting for successful source checks.');
          if (aiKey && aiModel) {
            const candidates = db
              .prepare(
                'SELECT query,SUM(impressions) AS impressions FROM growth_search GROUP BY query ORDER BY impressions DESC LIMIT 60',
              )
              .all();
            const existing = articles(true);
            const topic = candidates.find(
              (item) =>
                item.impressions >= 10 &&
                /upi|m.?pesa|daraja|spei|payment.*(?:onboard|reconcil|integrat)|плат[её]ж.*(?:подключ|сверк)/i.test(
                  item.query,
                ) &&
                topicSources(item.query).every(
                  (id) =>
                    db.prepare('SELECT status FROM growth_sources WHERE id=?').get(id)?.status ===
                    'ok',
                ) &&
                !existing.some(
                  (g) => g.topic === item.query || similarity(g.title, item.query) > 0.65,
                ),
            );
            if (topic) {
              const requiredSources = topicSources(topic.query);
              const evidence = sources
                .filter(
                  (s) =>
                    (!requiredSources.length || requiredSources.includes(s.id)) &&
                    db.prepare('SELECT status FROM growth_sources WHERE id=?').get(s.id)?.status ===
                      'ok',
                )
                .map((s) => ({
                  ...s,
                  excerpt: db.prepare('SELECT excerpt FROM growth_sources WHERE id=?').get(s.id)
                    ?.excerpt,
                }));
              if (evidence.length) {
                // One generation attempt per day, including failed attempts. Manual run cannot bypass it.
                if (time - Date.parse(state('last_ai_attempt') || '1970-01-01') >= 86400000) {
                  setState('last_ai_attempt', stamp());
                  const draft = await generate({
                    key: aiKey,
                    model: aiModel,
                    topic: topic.query,
                    evidence,
                    existing: existing.map((g) => g.title),
                    fetcher,
                    signal: lifetime.signal,
                  });
                  const guide = {
                    ...draft,
                    slug:
                      (typeof draft?.title === 'string'
                        ? draft.title
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/^-|-$/g, '')
                            .slice(0, 70)
                            .replace(/-$/, '')
                        : 'guide') +
                      '-' +
                      hash(topic.query).slice(0, 8),
                    topic: topic.query,
                    role: requiredSources.includes('daraja') ? 'team' : 'provider',
                    market:
                      requiredSources.length === 1
                        ? { npci: 'india', daraja: 'kenya', spei: 'mexico' }[requiredSources[0]] ||
                          ''
                        : '',
                    kind: 'guide',
                    author: 'PAN Research',
                    generated: true,
                  };
                  const issues = validateGuide(guide, existing);
                  const selectedSourceIds = Array.isArray(guide.sourceIds) ? guide.sourceIds : [];
                  if (!selectedSourceIds.length)
                    issues.push('Sources required for generated guides');
                  if (
                    selectedSourceIds.some((sourceId) => !evidence.some((s) => s.id === sourceId))
                  )
                    issues.push('Source was not available for this generation');
                  if (issues.length)
                    summary.notes.push(
                      'Generated guide rejected: ' + [...new Set(issues)].join('; '),
                    );
                  else {
                    db.prepare(
                      'INSERT OR IGNORE INTO growth_articles(slug,status,body,content_hash,created_at,updated_at) VALUES (?,?,?,?,?,?)',
                    ).run(
                      guide.slug,
                      'draft',
                      JSON.stringify(guide),
                      hash(guide),
                      stamp(),
                      stamp(),
                    );
                    summary.drafted.push(guide.slug);
                    if (aiAutoPublish && publish(guide.slug, 'autonomous-ai'))
                      summary.published.push(guide.slug);
                  }
                } else summary.notes.push('Daily AI generation limit reached.');
              } else summary.notes.push('No currently verified sources for generation.');
            } else summary.notes.push('No distinct supported search demand yet.');
          } else
            summary.notes.push(
              'Connect Search Console and AI Gateway for new topic generation; unavailable-source materials remain queued.',
            );
        }
      } else summary.notes.push('Daily publication limit reached.');
      // Aggregated analytics have a finite retention window; applications retain their source.
      db.prepare('DELETE FROM growth_views WHERE day < ?').run(
        new Date(time - 90 * 86400000).toISOString().slice(0, 10),
      );
      db.prepare('DELETE FROM growth_runs WHERE started_at < ? AND status != ?').run(
        new Date(time - 90 * 86400000).toISOString(),
        'running',
      );
      db.prepare('UPDATE growth_runs SET status=?,finished_at=?,summary=? WHERE id=?').run(
        summary.sourceErrors.length ? 'partial' : 'complete',
        stamp(),
        JSON.stringify(summary),
        id,
      );
    } catch {
      summary.notes.push('Run interrupted or connector failed. Published content was preserved.');
      db.prepare('UPDATE growth_runs SET status=?,finished_at=?,summary=? WHERE id=?').run(
        'failed',
        stamp(),
        JSON.stringify(summary),
        id,
      );
    } finally {
      setState('lease_until', 0);
    }
    return { id, ...summary };
  }
  const run = (force = false) =>
    running ||
    (running = execute(force)
      .catch(() => ({ error: 'Could not acquire or record the publication run.' }))
      .finally(() => {
        running = null;
      }));
  const view = (pathname, attribution) => {
    if (
      !staticRoutes.includes(pathname) &&
      !articles().some((g) => '/knowledge/' + g.slug === pathname)
    )
      return;
    const source = attribution.source || attribution.referrer || 'direct';
    db.prepare(
      'INSERT INTO growth_views(day,path,source,views) VALUES (?,?,?,1) ON CONFLICT(day,path,source) DO UPDATE SET views=views+1',
    ).run(stamp().slice(0, 10), pathname, source);
  };
  const report = () => {
    const cutoff = new Date(now().getTime() - 30 * 86400000).toISOString();
    const applications = db
      .prepare('SELECT status,attribution FROM applications WHERE created_at >= ?')
      .all(cutoff);
    const acquisition = new Map();
    for (const row of applications) {
      let a = {};
      try {
        a = JSON.parse(row.attribution);
      } catch {
        /* Legacy records. */
      }
      const key = a.source || a.referrer || 'direct';
      const value = acquisition.get(key) || {
        source: key,
        applications: 0,
        qualified: 0,
        agreed: 0,
      };
      value.applications++;
      if (['qualified', 'discussion', 'agreed'].includes(row.status)) value.qualified++;
      if (row.status === 'agreed') value.agreed++;
      acquisition.set(key, value);
    }
    return {
      enabled,
      paused: state('paused') === '1',
      running: Boolean(running),
      origin,
      connectors: {
        ai: Boolean(aiKey && aiModel),
        aiAutoPublish,
        searchConsole: Boolean(gscFile && gscProperty),
        model: aiModel || null,
      },
      lastRun: state('last_run') || null,
      nextRun: state('last_run')
        ? new Date(Date.parse(state('last_run')) + intervalMs).toISOString()
        : null,
      articles: articles(true),
      sources: sourceState(),
      runs: db
        .prepare('SELECT * FROM growth_runs ORDER BY started_at DESC LIMIT 12')
        .all()
        .map((r) => ({ ...r, summary: JSON.parse(r.summary) })),
      acquisition: [...acquisition.values()].sort((a, b) => b.applications - a.applications),
      pages: db
        .prepare(
          'SELECT path,SUM(views) AS views FROM growth_views WHERE day>=? GROUP BY path ORDER BY views DESC LIMIT 15',
        )
        .all(cutoff.slice(0, 10)),
      queries: db
        .prepare(
          'SELECT query,page,clicks,impressions,position FROM growth_search ORDER BY impressions DESC LIMIT 20',
        )
        .all(),
    };
  };
  const sitemap = () => {
    if (!origin) return null;
    const entries = [
      ...staticRoutes.map((route) => ({ route })),
      ...articles().map((g) => ({ route: '/knowledge/' + g.slug, modified: g.updatedAt })),
    ];
    return (
      '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' +
      entries
        .flatMap(({ route, modified }) =>
          ['en', 'ru'].map(
            (lang) =>
              `<url><loc>${escapeHtml(origin + route + (lang === 'ru' ? '?lang=ru' : ''))}</loc>${modified ? '<lastmod>' + escapeHtml(modified) + '</lastmod>' : ''}<xhtml:link rel="alternate" hreflang="en" href="${escapeHtml(origin + route)}"/><xhtml:link rel="alternate" hreflang="ru" href="${escapeHtml(origin + route + '?lang=ru')}"/><xhtml:link rel="alternate" hreflang="x-default" href="${escapeHtml(origin + route)}"/></url>`,
          ),
        )
        .join('') +
      '</urlset>'
    );
  };
  return {
    origin,
    publicData,
    articles,
    run,
    publish,
    report,
    view,
    sitemap,
    pause: (value) => setState('paused', value ? 1 : 0),
    start: () => {
      if (!enabled || timer) return;
      timer = setInterval(() => void run(), 60000);
      timer.unref();
      void run();
    },
    stop: async () => {
      clearInterval(timer);
      lifetime.abort();
      if (running) await running;
    },
  };
}
