import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { createGrowth, cleanAttribution } from './growth/engine.mjs';
import { staticRoutes } from './growth/catalog.mjs';
import { renderHead } from './growth/seo.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.resolve(HERE, 'dist');
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};
const STATUSES = new Set(['new', 'review', 'qualified', 'discussion', 'agreed', 'closed']);
const ROLES = new Set(['affiliate', 'team', 'provider', 'merchant', 'regional']);
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const safeText = (value, max = 180) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';
const fail = (message, status) => Object.assign(new Error(message), { status });
function reply(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(body));
}
function secureCompare(a, b) {
  if (!a || !b) return false;
  return crypto.timingSafeEqual(
    crypto.createHash('sha256').update(a).digest(),
    crypto.createHash('sha256').update(b).digest(),
  );
}
async function jsonBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 12000) throw fail('Request is too large', 413);
    chunks.push(chunk);
  }
  let body;
  try {
    body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw fail('Invalid JSON', 400);
  }
  if (!body || typeof body !== 'object' || Array.isArray(body))
    throw fail('Expected a JSON object', 400);
  return body;
}
export function openDatabase(dbPath) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY, request_key TEXT UNIQUE NOT NULL, reference TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL, role TEXT NOT NULL, markets TEXT NOT NULL,
      name TEXT NOT NULL, company TEXT, email TEXT NOT NULL, telegram TEXT,
      size TEXT, methods TEXT, volume TEXT, experience TEXT, message TEXT,
      category TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'new'
    );
    CREATE INDEX IF NOT EXISTS idx_applications_created ON applications(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT, application_id TEXT NOT NULL,
      at TEXT NOT NULL, from_status TEXT, to_status TEXT NOT NULL
    );`);
  // Keep applications created by the previous version when upgrading a persistent volume.
  if (
    !db
      .prepare('PRAGMA table_info(applications)')
      .all()
      .some((column) => column.name === 'category')
  ) {
    db.exec("ALTER TABLE applications ADD COLUMN category TEXT NOT NULL DEFAULT ''");
  }
  if (
    !db
      .prepare('PRAGMA table_info(applications)')
      .all()
      .some((column) => column.name === 'attribution')
  )
    db.exec("ALTER TABLE applications ADD COLUMN attribution TEXT NOT NULL DEFAULT '{}'");
  return db;
}
function serveFile(req, res, urlPath) {
  let filename;
  try {
    filename = decodeURIComponent(urlPath);
  } catch {
    return reply(res, 400, { error: 'Bad path' });
  }
  if (filename.includes('\0') || filename.includes('\\'))
    return reply(res, 400, { error: 'Bad path' });
  let candidate = path.resolve(PUBLIC, '.' + filename);
  if (!(candidate === PUBLIC || candidate.startsWith(PUBLIC + path.sep)))
    return reply(res, 403, { error: 'Forbidden' });
  if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory())
    candidate = path.join(candidate, 'index.html');
  let status = 200;
  if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) {
    if (path.extname(filename) || filename.startsWith('/assets/'))
      return reply(res, 404, { error: 'Not found' });
    candidate = path.join(PUBLIC, '404', 'index.html');
    status = 404;
    if (!fs.existsSync(candidate))
      return reply(res, 503, { error: 'Build the website with npm run build first.' });
  }
  const ext = path.extname(candidate);
  if (!TYPES[ext]) return reply(res, 404, { error: 'Not found' });
  // Only content-hashed bundles are immutable; original artwork can change between releases.
  const immutable =
    filename.startsWith('/assets/') && /-[\w-]{8,}\.(?:js|mjs|css|woff2?)$/.test(filename);
  res.writeHead(status, {
    'Content-Type': TYPES[ext],
    'Cache-Control': immutable
      ? 'public, max-age=31536000, immutable'
      : ext === '.html'
        ? 'no-cache'
        : 'public, max-age=3600',
  });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(candidate)
    .on('error', () => res.destroy())
    .pipe(res);
}
export function createApp({
  dbPath = path.resolve(HERE, process.env.DB_PATH || './data/partners.sqlite'),
  adminToken = process.env.ADMIN_TOKEN || '',
  allowedOrigin = process.env.ALLOWED_ORIGIN || '',
  trustProxy = process.env.TRUST_PROXY === '1',
  publicSiteUrl = process.env.PUBLIC_SITE_URL || '',
  growthEnabled = false,
  growthOptions = {},
} = {}) {
  const db = openDatabase(dbPath);
  const growth = createGrowth(db, {
    publicSiteUrl,
    enabled: growthEnabled,
    aiKey: process.env.AI_GATEWAY_API_KEY || '',
    aiModel: process.env.AI_GATEWAY_MODEL || '',
    aiAutoPublish: process.env.GROWTH_AI_AUTOPUBLISH === '1',
    gscFile: process.env.GSC_SERVICE_ACCOUNT_FILE || '',
    gscProperty: process.env.GSC_PROPERTY || '',
    ...growthOptions,
  });
  const attempts = new Map();
  const eventAttempts = new Map();
  let renderer;
  async function publicPage(req, res, url) {
    const pathname = url.pathname.replace(/\/$/, '') || '/';
    const data = growth.publicData(
      pathname.startsWith('/knowledge/') ? pathname.slice('/knowledge/'.length) : '',
    );
    const article = data.articles.find((g) => '/knowledge/' + g.slug === pathname);
    if (!staticRoutes.includes(pathname) && !article && pathname !== '/admin')
      return serveFile(req, res, url.pathname);
    const shellPath = path.join(PUBLIC, 'shell.html');
    if (!fs.existsSync(shellPath)) return serveFile(req, res, url.pathname);
    // Reload an updated SSR bundle when the local preview is rebuilt.
    const entry = path.join(HERE, 'dist-server/entry-server.mjs');
    const revision = fs.statSync(entry).mtimeMs;
    if (!renderer || renderer.revision !== revision)
      renderer = {
        revision,
        module: await import('./dist-server/entry-server.mjs?rev=' + revision),
      };
    const language = url.searchParams.get('lang') === 'ru' ? 'ru' : 'en';
    let html = fs
      .readFileSync(shellPath, 'utf8')
      .replace(
        '<!--app-html-->',
        renderer.module.renderPage(url.pathname + url.search, { ...data, language }),
      );
    const metadata = renderer.module.pageMeta(pathname, language);
    html = renderHead(html, {
      origin: growth.origin,
      pathname,
      language,
      metadata,
      article,
      bootstrap: data,
      noindex: pathname === '/admin',
    });
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Language': language,
      'Cache-Control': 'no-cache',
    });
    res.end(req.method === 'HEAD' ? undefined : html);
  }
  const handler = async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    const url = new URL(req.url || '/', 'http://localhost');
    const pathname = url.pathname;
    if (req.method === 'GET' && pathname === '/health') return reply(res, 200, { status: 'ok' });
    if ((req.method === 'GET' || req.method === 'HEAD') && pathname === '/sitemap.xml') {
      const xml = growth.sitemap();
      if (!xml)
        return reply(res, 503, {
          error: 'Configure PUBLIC_SITE_URL to serve the production sitemap.',
        });
      res.writeHead(200, {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      });
      return res.end(req.method === 'HEAD' ? undefined : xml);
    }
    if ((req.method === 'GET' || req.method === 'HEAD') && pathname === '/robots.txt') {
      res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      });
      return res.end(
        req.method === 'HEAD'
          ? undefined
          : 'User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /shell.html\n' +
              (growth.origin ? 'Sitemap: ' + growth.origin + '/sitemap.xml\n' : ''),
      );
    }
    if ((req.method === 'GET' || req.method === 'HEAD') && pathname === '/feed.xml') {
      if (!growth.origin)
        return reply(res, 503, {
          error: 'Configure PUBLIC_SITE_URL to serve the production feed.',
        });
      const { escapeHtml } = await import('./growth/engine.mjs');
      const items = growth
        .articles()
        .slice(0, 30)
        .map(
          (g) =>
            `<item><title>${escapeHtml(g.title)}</title><link>${growth.origin}/knowledge/${g.slug}</link><guid isPermaLink="true">${growth.origin}/knowledge/${g.slug}</guid><description>${escapeHtml(g.summary)}</description><pubDate>${new Date(g.publishedAt).toUTCString()}</pubDate></item>`,
        )
        .join('');
      res.writeHead(200, {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      });
      return res.end(
        req.method === 'HEAD'
          ? undefined
          : `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>PAN — Partner field notes</title><link>${growth.origin}/knowledge</link><description>Payment partner preparation guides and checklists.</description>${items}</channel></rss>`,
      );
    }
    // The build shell is an internal rendering artifact, not a public duplicate homepage.
    if (pathname === '/shell.html') return reply(res, 404, { error: 'Not found' });
    if (pathname.startsWith('/api/')) {
      if (req.method === 'GET' && pathname === '/api/content')
        return reply(res, 200, growth.publicData(safeText(url.searchParams.get('article'), 100)));
      if (req.method === 'POST' && pathname === '/api/events') {
        if (req.headers.dnt === '1' || req.headers['sec-gpc'] === '1')
          return reply(res, 200, { ok: true });
        if (
          (allowedOrigin && req.headers.origin && req.headers.origin !== allowedOrigin) ||
          /bot|crawler|spider/i.test(String(req.headers['user-agent'] || ''))
        )
          return reply(res, 200, { ok: true });
        const ip = req.socket.remoteAddress || 'unknown';
        const record = eventAttempts.get(ip) || { count: 0, until: Date.now() + 60000 };
        if (Date.now() > record.until) {
          record.count = 0;
          record.until = Date.now() + 60000;
        }
        record.count++;
        eventAttempts.set(ip, record);
        if (eventAttempts.size > 5000)
          for (const [key, value] of eventAttempts)
            if (value.until < Date.now()) eventAttempts.delete(key);
        if (record.count > 90) return reply(res, 429, { error: 'Too many events' });
        const body = await jsonBody(req);
        growth.view(safeText(body.path, 180), cleanAttribution(body.attribution));
        return reply(res, 200, { ok: true });
      }
      if (req.method === 'POST' && pathname === '/api/apply') {
        if (allowedOrigin && req.headers.origin && req.headers.origin !== allowedOrigin)
          return reply(res, 403, { error: 'This request origin is not allowed.' });
        const body = await jsonBody(req);
        if (safeText(body.site, 80)) return reply(res, 200, { reference: 'PAN-RECEIVED' });
        const requestKey = safeText(body.requestId, 75);
        if (!UUID.test(requestKey)) return reply(res, 400, { error: 'Invalid request ID.' });
        const existing = db
          .prepare('SELECT reference FROM applications WHERE request_key = ?')
          .get(requestKey);
        if (existing) return reply(res, 200, { reference: existing.reference });
        const forwarded = req.headers['x-forwarded-for'];
        const addr =
          (trustProxy && typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : '') ||
          req.socket.remoteAddress ||
          'unknown';
        let record = attempts.get(addr) || { count: 0, until: Date.now() + 3600000 };
        if (Date.now() > record.until) record = { count: 0, until: Date.now() + 3600000 };
        record.count++;
        attempts.set(addr, record);
        if (attempts.size > 5000)
          for (const [ip, value] of attempts) if (Date.now() > value.until) attempts.delete(ip);
        if (record.count > 8)
          return reply(res, 429, { error: 'Too many applications. Please try later.' });
        const role = safeText(body.role, 40),
          name = safeText(body.name),
          email = safeText(body.email).toLowerCase();
        const rawMarkets = Array.isArray(body.markets) ? body.markets : [];
        const markets = [
          ...new Set(rawMarkets.map((value) => safeText(value, 60)).filter(Boolean)),
        ];
        if (
          !ROLES.has(role) ||
          name.length < 2 ||
          !markets.length ||
          rawMarkets.length > 10 ||
          markets.join('').length > 250 ||
          !/^\S+@\S+\.\S+$/.test(email)
        ) {
          return reply(res, 422, {
            error: 'Please complete the required fields with valid information.',
          });
        }
        const now = new Date().toISOString(),
          id = crypto.randomUUID();
        const reference =
          'PAN-' +
          new Date().getUTCFullYear() +
          '-' +
          crypto.randomBytes(4).toString('hex').toUpperCase();
        db.prepare(
          `INSERT INTO applications (id, request_key, reference, created_at, updated_at, role, markets, name, company, email, telegram, size, methods, volume, experience, message, category, status, attribution)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        ).run(
          id,
          requestKey,
          reference,
          now,
          now,
          role,
          markets.join(', '),
          name,
          safeText(body.company),
          email,
          safeText(body.telegram),
          safeText(body.size),
          safeText(body.methods),
          safeText(body.volume),
          safeText(body.experience),
          safeText(body.message, 1500),
          safeText(body.category, 80),
          'new',
          JSON.stringify(cleanAttribution(body.attribution)),
        );
        return reply(res, 201, { reference });
      }
      if (pathname.startsWith('/api/admin/')) {
        if (
          !secureCompare(
            String(req.headers.authorization || '').replace(/^Bearer\s+/i, ''),
            adminToken,
          )
        )
          return reply(res, 401, { error: 'Unauthorized' });
        if (req.method === 'GET' && pathname === '/api/admin/applications') {
          const items = db
            .prepare(
              'SELECT id, reference, created_at, role, markets, name, company, email, telegram, size, methods, volume, experience, message, category, status, attribution FROM applications ORDER BY created_at DESC LIMIT 500',
            )
            .all();
          return reply(res, 200, { items });
        }
        if (req.method === 'GET' && pathname === '/api/admin/growth')
          return reply(res, 200, growth.report());
        if (req.method === 'POST' && pathname === '/api/admin/growth/run') {
          // Return immediately; the durable run and its outcome appear in the operations report.
          void growth.run(true);
          return reply(res, 202, { accepted: true });
        }
        if (req.method === 'PATCH' && pathname === '/api/admin/growth') {
          const body = await jsonBody(req);
          if (typeof body.paused !== 'boolean')
            return reply(res, 422, { error: 'Expected a pause setting' });
          growth.pause(body.paused);
          return reply(res, 200, { ok: true });
        }
        const contentMatch = pathname.match(/^\/api\/admin\/growth\/articles\/([a-z0-9-]{1,100})$/);
        if (req.method === 'PATCH' && contentMatch) {
          const body = await jsonBody(req);
          const row = db
            .prepare('SELECT status FROM growth_articles WHERE slug=?')
            .get(contentMatch[1]);
          if (!row) return reply(res, 404, { error: 'Article not found' });
          if (body.status === 'published') {
            try {
              growth.publish(contentMatch[1], 'operator');
            } catch (error) {
              return reply(res, 422, { error: error.message });
            }
          } else if (body.status === 'archived')
            db.prepare('UPDATE growth_articles SET status=? WHERE slug=?').run(
              'archived',
              contentMatch[1],
            );
          else return reply(res, 422, { error: 'Unknown publication state' });
          return reply(res, 200, { ok: true });
        }
        const match = pathname.match(/^\/api\/admin\/applications\/([a-f0-9-]{36})$/i);
        if (req.method === 'PATCH' && match) {
          const body = await jsonBody(req),
            next = safeText(body.status, 40);
          if (!STATUSES.has(next)) return reply(res, 422, { error: 'Unknown status' });
          const current = db.prepare('SELECT status FROM applications WHERE id = ?').get(match[1]);
          if (!current) return reply(res, 404, { error: 'Application not found' });
          db.exec('BEGIN IMMEDIATE');
          try {
            const now = new Date().toISOString();
            db.prepare('UPDATE applications SET status = ?, updated_at = ? WHERE id = ?').run(
              next,
              now,
              match[1],
            );
            db.prepare(
              'INSERT INTO audit_log(application_id, at, from_status, to_status) VALUES (?,?,?,?)',
            ).run(match[1], now, current.status, next);
            db.exec('COMMIT');
          } catch (error) {
            db.exec('ROLLBACK');
            throw error;
          }
          return reply(res, 200, { ok: true });
        }
      }
      return reply(res, 404, { error: 'Not found' });
    }
    if (req.method === 'GET' || req.method === 'HEAD') return publicPage(req, res, url);
    return reply(res, 405, { error: 'Method not allowed' });
  };
  const server = http.createServer((req, res) => {
    Promise.resolve(handler(req, res)).catch((error) => {
      if (!res.headersSent)
        reply(res, error.status || 500, { error: error.status ? error.message : 'Server error' });
      else res.destroy();
    });
  });
  growth.start();
  server.on('close', () => void growth.stop().finally(() => db.close()));
  return server;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const envFile = path.join(HERE, '.env');
  if (fs.existsSync(envFile)) process.loadEnvFile(envFile);
  const port = Number(process.env.PORT || 3000),
    host = process.env.HOST || '0.0.0.0';
  const server = createApp({ growthEnabled: process.env.GROWTH_ENABLED !== '0' });
  server.listen(port, host, () => process.stdout.write(`PAN running on http://${host}:${port}\n`));
  ['SIGTERM', 'SIGINT'].forEach((signal) => process.on(signal, () => server.close()));
}
