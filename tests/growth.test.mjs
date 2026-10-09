import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createApp, openDatabase } from '../server.mjs';
import { createGrowth, validateGuide, cleanAttribution, scriptJson } from '../growth/engine.mjs';
import { catalog, sources } from '../growth/catalog.mjs';
import { checkSource, generateGuide, searchConsoleConnector } from '../growth/connectors.mjs';

const token = 'growth-integration-fixture-secret';
const auth = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };
const sourceCheck = async (source) => ({ hash: 'reviewed-' + source.id, excerpt: source.facts });
async function app(t, options = {}) {
  const dir = mkdtempSync(path.join(tmpdir(), 'pan-growth-http-'));
  const dbPath = path.join(dir, 'app.sqlite');
  const server = createApp({
    dbPath,
    adminToken: token,
    publicSiteUrl: 'https://pan.example',
    allowedOrigin: 'https://pan.example',
    growthOptions: { check: sourceCheck, ...options },
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    rmSync(dir, { recursive: true, force: true });
  });
  return { base: `http://127.0.0.1:${server.address().port}`, dbPath };
}
function engine(t, options = {}) {
  const dir = mkdtempSync(path.join(tmpdir(), 'pan-growth-worker-'));
  const db = openDatabase(path.join(dir, 'app.sqlite'));
  const growth = createGrowth(db, {
    publicSiteUrl: 'https://pan.example',
    enabled: true,
    check: sourceCheck,
    ...options,
  });
  t.after(async () => {
    await growth.stop();
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });
  return { growth, db };
}

test('public research is SSR in both languages; canonical, schema, RSS and sitemap follow publication state', async (t) => {
  const { base } = await app(t);
  const slug = catalog[0].slug;
  const response = await fetch(base + '/knowledge/' + slug + '?utm_source=example', {
    headers: { Host: 'spoofed.example' },
  });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Evaluating a payment partner/);
  assert.match(
    html,
    /<link rel="canonical" href="https:\/\/pan.example\/knowledge\/payment-partner-evaluation"/,
  );
  assert.doesNotMatch(html, /spoofed.example|utm_source=example/);
  assert.match(html, /"@type":"Article"/);
  assert.match(html, /"datePublished":/);
  assert.match(html, /NPCI|Safaricom/);
  const ru = await fetch(base + '/knowledge/' + slug + '?lang=ru');
  assert.equal(ru.headers.get('content-language'), 'ru');
  const russian = await ru.text();
  assert.match(russian, /<html lang="ru"/);
  assert.match(russian, /Как оценить платёжного партнёра/);
  assert.match(
    russian,
    /href="https:\/\/pan.example\/knowledge\/payment-partner-evaluation\?lang=ru"/,
  );
  let sitemap = await (await fetch(base + '/sitemap.xml')).text();
  assert.match(sitemap, /payment-partner-evaluation/);
  assert.doesNotMatch(sitemap, /upi-partner-onboarding-brief|\/admin/);
  assert.match(sitemap, /hreflang="ru"/);
  assert.match(
    await (await fetch(base + '/robots.txt')).text(),
    /Sitemap: https:\/\/pan.example\/sitemap.xml/,
  );
  assert.match(await (await fetch(base + '/feed.xml')).text(), /<rss version="2.0"/);
  assert.equal((await fetch(base + '/shell.html')).status, 404);
  const action = await fetch(base + '/api/admin/growth/articles/' + slug, {
    method: 'PATCH',
    headers: auth,
    body: JSON.stringify({ status: 'archived' }),
  });
  assert.equal(action.status, 200);
  assert.equal((await fetch(base + '/knowledge/' + slug)).status, 404);
  sitemap = await (await fetch(base + '/sitemap.xml')).text();
  assert.doesNotMatch(sitemap, /payment-partner-evaluation/);
  assert.equal((await fetch(base + '/knowledge/' + catalog[3].slug)).status, 404);
});

test('scheduled publishing is capped, durable, respects pause, and leaves existing content intact on source errors', async (t) => {
  let date = new Date('2026-10-09T12:00:00Z');
  let checks = 0;
  const { growth, db } = engine(t, {
    now: () => date,
    check: async (source) => {
      checks++;
      return sourceCheck(source);
    },
  });
  const first = await growth.run();
  assert.equal(first.published.length, 1);
  assert.equal(checks, 3);
  assert.equal(growth.articles().length, 4);
  assert.equal((await growth.run()).skipped, 'not_due_or_paused');
  assert.deepEqual((await growth.run(true)).published, []);
  assert.equal(growth.articles().length, 4);
  const restarted = createGrowth(db, {
    publicSiteUrl: 'https://pan.example',
    now: () => date,
    check: sourceCheck,
  });
  assert.equal((await restarted.run()).skipped, 'not_due_or_paused');
  date = new Date('2026-10-10T12:00:01Z');
  growth.pause(true);
  assert.equal((await growth.run()).skipped, 'not_due_or_paused');
  growth.pause(false);
  assert.equal((await growth.run()).published.length, 1);
  date = new Date('2026-10-11T12:00:02Z');
  const failing = createGrowth(db, {
    publicSiteUrl: 'https://pan.example',
    now: () => date,
    check: async () => {
      throw new Error('temporary upstream outage');
    },
  });
  const failedSources = await failing.run();
  assert.equal(failedSources.sourceErrors.length, 3);
  assert.deepEqual(failedSources.published, []);
  assert.equal(growth.articles().length, 5);
  assert.equal(growth.report().runs[0].status, 'partial');
  await restarted.stop();
  await failing.stop();
});

test('database lease prevents two workers publishing concurrently', async (t) => {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const { growth, db } = engine(t, {
    check: async (source) => {
      await gate;
      return sourceCheck(source);
    },
  });
  const second = createGrowth(db, { enabled: true, check: sourceCheck });
  const work = growth.run(true);
  assert.equal((await second.run(true)).skipped, 'running');
  release();
  assert.equal((await work).published.length, 1);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM growth_revisions').get().n, 1);
  await second.stop();
});

test('an expired interrupted run recovers before the normal schedule delay', async (t) => {
  const { growth, db } = engine(t, { now: () => new Date('2026-10-09T12:30:00Z') });
  db.prepare('INSERT INTO growth_state(key,value) VALUES (?,?)').run(
    'last_run',
    '2026-10-09T12:00:00Z',
  );
  db.prepare('INSERT INTO growth_state(key,value) VALUES (?,?)').run(
    'lease_until',
    Date.parse('2026-10-09T12:15:00Z').toString(),
  );
  db.prepare('INSERT INTO growth_runs(id,started_at,status) VALUES (?,?,?)').run(
    'interrupted-fixture',
    '2026-10-09T12:00:00Z',
    'running',
  );
  assert.equal((await growth.run()).published.length, 1);
  const prior = db
    .prepare('SELECT status,summary FROM growth_runs WHERE id=?')
    .get('interrupted-fixture');
  assert.equal(prior.status, 'failed');
  assert.match(prior.summary, /recovered/);
});

test('invalid AI content is not published and a retry cannot bypass the daily generation limit', async (t) => {
  let attempts = 0;
  const { growth, db } = engine(t, {
    aiKey: 'fixture-only-key',
    aiModel: 'provider/fixture-model',
    aiAutoPublish: true,
    check: async (source) => {
      if (source.id !== 'daraja') throw new Error('Upstream source unavailable');
      return sourceCheck(source);
    },
    readSearch: async () => ({
      rows: [
        {
          keys: ['mpesa callback retry lifecycle', 'https://pan.example/knowledge'],
          clicks: 0,
          impressions: 45,
          position: 14,
        },
      ],
    }),
    generate: async () => {
      attempts++;
      return {
        ...structuredClone(catalog[0]),
        title: 'PAN guarantees approval and a 99% payment success rate',
        sections: [],
      };
    },
  });
  db.prepare(
    "UPDATE growth_articles SET status='archived' WHERE slug='mpesa-daraja-integration-brief'",
  ).run();
  const first = await growth.run(true);
  assert.equal(attempts, 1);
  assert.equal(first.published.length, 0);
  assert.equal(first.drafted.length, 0);
  assert.match(first.notes.join(' '), /rejected/);
  assert.match(first.notes.join(' '), /waiting for successful source checks/);
  assert.equal(growth.articles().length, 3);
  const second = await growth.run(true);
  assert.equal(attempts, 1);
  assert.match(second.notes.join(' '), /Daily AI generation limit/);
  assert.equal(growth.report().queries[0].impressions, 45);
});

test('a scheduled publication becomes a real indexable route without a new build', async (t) => {
  const { base } = await app(t);
  assert.equal((await fetch(base + '/api/admin/growth/run', { method: 'POST' })).status, 401);
  assert.equal(
    (await fetch(base + '/api/admin/growth/run', { method: 'POST', headers: auth })).status,
    202,
  );
  let report;
  for (let attempt = 0; attempt < 10; attempt++) {
    report = await (await fetch(base + '/api/admin/growth', { headers: auth })).json();
    if (!report.running) break;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  assert.equal(report.running, false);
  const published = report.articles.find(
    (guide) =>
      guide.status === 'published' && !catalog.find((seed) => seed.slug === guide.slug).initial,
  );
  assert.ok(published);
  const response = await fetch(base + '/knowledge/' + published.slug);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, new RegExp(published.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.doesNotMatch(html, /Loading guide/);
  assert.match(await (await fetch(base + '/sitemap.xml')).text(), new RegExp(published.slug));
  assert.match(await (await fetch(base + '/knowledge')).text(), new RegExp(published.slug));
});

test('source attribution reaches SQLite and qualified results without leaking contacts to public endpoints', async (t) => {
  const { base, dbPath } = await app(t);
  const payload = {
    requestId: crypto.randomUUID(),
    role: 'provider',
    markets: ['Kenya'],
    name: 'Synthetic Growth Partner',
    email: 'private-growth-fixture@example.com',
    attribution: {
      source: 'partner-newsletter',
      medium: 'referral',
      campaign: 'kenya-introductions',
      ref: 'partner-17',
      landing: '/knowledge/mpesa-daraja-integration-brief',
      email: 'should-not-be-attributed@example.com',
      referrer: 'https://bad.example/private',
    },
  };
  assert.equal(
    (
      await fetch(base + '/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: 'https://pan.example' },
        body: JSON.stringify(payload),
      })
    ).status,
    201,
  );
  const rows = (await (await fetch(base + '/api/admin/applications', { headers: auth })).json())
    .items;
  const attribution = JSON.parse(rows[0].attribution);
  assert.equal(attribution.ref, 'partner-17');
  assert.equal(attribution.source, 'partner-newsletter');
  assert.equal(attribution.email, undefined);
  assert.equal(attribution.referrer, undefined);
  await fetch(base + '/api/admin/applications/' + rows[0].id, {
    method: 'PATCH',
    headers: auth,
    body: JSON.stringify({ status: 'agreed' }),
  });
  for (const path of ['/api/content', '/knowledge', '/sitemap.xml', '/feed.xml'])
    assert.doesNotMatch(
      await (await fetch(base + path)).text(),
      /private-growth-fixture|Synthetic Growth Partner/,
    );
  const event = (headers = {}) =>
    fetch(base + '/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ path: '/knowledge', attribution: { source: 'partner-newsletter' } }),
    });
  await event();
  await event({ DNT: '1' });
  await event({ 'User-Agent': 'Googlebot' });
  await event({ Origin: 'https://other.example' });
  const report = await (await fetch(base + '/api/admin/growth', { headers: auth })).json();
  assert.deepEqual(report.acquisition[0], {
    source: 'partner-newsletter',
    applications: 1,
    qualified: 1,
    agreed: 1,
  });
  assert.equal(report.pages[0].views, 1);
  assert.equal((await fetch(base + '/api/admin/growth')).status, 401);
  const db = openDatabase(dbPath);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM applications').get().n, 1);
  db.close();
});

test('quality gates reject duplicate intent, unsafe markup, unknown sources, commercial promises and malformed model results', () => {
  const guide = structuredClone(catalog[0]);
  assert.deepEqual(validateGuide(guide), []);
  assert.ok(
    validateGuide({ ...guide, slug: 'different-slug' }, [guide]).includes(
      'Duplicate intent or content',
    ),
  );
  assert.ok(
    validateGuide({ ...guide, title: '<script>alert(1)</script>' }).includes('Invalid title'),
  );
  assert.ok(
    validateGuide({ ...guide, sourceIds: ['invented-source'] }).includes('Unapproved source'),
  );
  assert.ok(
    validateGuide({
      ...guide,
      generated: true,
      summary: 'PAN guarantees approval and a 99% success rate for all partners.',
    }).includes('Unverified commercial or numeric claim'),
  );
  assert.ok(validateGuide(null).length);
  assert.ok(validateGuide({ ...guide, sections: [null] }).length);
  assert.deepEqual(
    cleanAttribution({ source: '<script>', landing: '/apply?email=x', ref: 'valid-partner' }),
    { ref: 'valid-partner' },
  );
  assert.doesNotMatch(scriptJson({ title: '</script><script>' }), /</);
});

test('source fetches are bounded and reject redirects and challenge pages', async () => {
  const source = sources[1];
  const valid = await checkSource(source, async (url, options) => {
    assert.equal(url, source.url);
    assert.equal(options.redirect, 'manual');
    return new Response('Daraja API payment documentation. '.repeat(20));
  });
  assert.equal(valid.hash.length, 64);
  await assert.rejects(
    checkSource(source, async () => new Response('Access denied captcha Daraja API')),
    /could not be verified/,
  );
  await assert.rejects(
    checkSource(
      source,
      async () =>
        new Response('', { status: 302, headers: { Location: 'http://127.0.0.1/private' } }),
    ),
    /HTTP 302/,
  );
  await assert.rejects(
    checkSource(source, async () => new Response('x'.repeat(300001))),
    /size limit/,
  );
});

test('Search Console connector signs a read-only service-account request and reuses its token', async (t) => {
  const dir = mkdtempSync(path.join(tmpdir(), 'pan-gsc-fixture-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const file = path.join(dir, 'account.json');
  writeFileSync(
    file,
    JSON.stringify({
      client_email: 'fixture@fixture.invalid',
      private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }),
    }),
  );
  let oauth = 0,
    queries = 0;
  const read = searchConsoleConnector({
    file,
    property: 'sc-domain:pan.example',
    fetcher: async (url, options) => {
      if (url === 'https://oauth2.googleapis.com/token') {
        oauth++;
        const jwt = options.body.get('assertion').split('.');
        const claim = JSON.parse(Buffer.from(jwt[1], 'base64url'));
        assert.equal(claim.scope, 'https://www.googleapis.com/auth/webmasters.readonly');
        assert.equal(claim.aud, url);
        assert.equal(claim.exp - claim.iat, 3600);
        return Response.json({ access_token: 'fixture-only-token', expires_in: 3600 });
      }
      assert.match(url, /sc-domain%3Apan.example\/searchAnalytics\/query$/);
      const body = JSON.parse(options.body);
      assert.deepEqual(body.dimensions, ['query', 'page']);
      assert.equal(body.type, 'web');
      queries++;
      return Response.json({
        rows: [
          {
            keys: ['mpesa callback reconciliation', 'https://pan.example/knowledge'],
            impressions: 24,
            clicks: 2,
            position: 12,
          },
        ],
      });
    },
  });
  assert.equal((await read()).rows.length, 1);
  await read();
  assert.equal(oauth, 1);
  assert.equal(queries, 2);
});

test('AI connector uses the configured gateway, registered evidence and structured output', async () => {
  const result = await generateGuide({
    key: 'fixture-only-key',
    model: 'provider/fixture-model',
    topic: 'M-Pesa callback retries',
    evidence: sources.map((s) => ({ ...s, excerpt: 'Retrieved public context' })),
    existing: ['Existing preparation guide'],
    fetcher: async (url, options) => {
      assert.equal(url, 'https://ai-gateway.vercel.sh/v1/chat/completions');
      const body = JSON.parse(options.body);
      assert.equal(body.model, 'provider/fixture-model');
      assert.equal(body.response_format.type, 'json_schema');
      assert.match(body.messages[0].content, /untrusted data/);
      assert.doesNotMatch(options.body, /private-growth-fixture|fixture-only-key/);
      return Response.json({
        choices: [
          { message: { content: JSON.stringify({ title: 'Generated fixture', sections: [] }) } },
        ],
      });
    },
  });
  assert.equal(result.title, 'Generated fixture');
});
