import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { tmpdir } from 'node:os';
import { createApp, openDatabase } from '../server.mjs';
import { createDesk, validateOpportunity } from '../operations/desk.mjs';
import gateway from '../api/service.mjs';
import { networkMeta, publicRoutes, scopeFromParams } from '../src/network.ts';
import { pageMeta } from '../src/data.ts';
import { scenarios, scenarioLink, briefEntry } from '../src/brief.ts';
import marketContext from '../shared/market-context.json' with { type: 'json' };
import taxonomy from '../shared/taxonomy.json' with { type: 'json' };
const token = 'local-refinement-test-key-32-characters';
const origin = 'https://network.example';
const payload = (extra = {}) => ({
  requestId: crypto.randomUUID(),
  side: 'offer',
  industry: 'payments',
  companyType: 'local-partner',
  countries: ['mozambique'],
  capabilities: ['collections', 'payouts', 'local-methods', 'settlement'],
  methods: ['M-Pesa', 'e-Mola', 'Bank transfers'],
  settlementCurrencies: ['MZN'],
  contact: crypto.randomUUID() + '@example.com',
  consent: true,
  ...extra,
});
async function fixture(t, options = {}) {
  const dir = fs.mkdtempSync(path.join(tmpdir(), 'network-refinement-'));
  const dbPath = path.join(dir, 'test.sqlite');
  const app = createApp({
    dbPath,
    adminToken: token,
    publicSiteUrl: origin,
    allowedOrigin: origin,
    ...options,
  });
  await new Promise((resolve) => app.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    await new Promise((resolve) => app.close(resolve));
    fs.rmSync(dir, { recursive: true, force: true });
  });
  const base = 'http://127.0.0.1:' + app.address().port;
  const request = async (route, method = 'GET', body, privateRequest = true) => {
    const response = await fetch(base + route, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Origin: origin,
        ...(privateRequest ? { Authorization: 'Bearer ' + token } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return { status: response.status, data: await response.json(), headers: response.headers };
  };
  return { base, dbPath, request };
}

test('six role entries carry explicit context; language and attribution do not reset a brief', () => {
  assert.equal(scenarios.length, 6);
  for (const scenario of scenarios) {
    const url = new URL(scenarioLink(scenario.id), origin);
    const scope = scopeFromParams(url.searchParams);
    assert.equal(scope.companyType, scenario.id);
    assert.equal(scope.industry, scenario.industry);
    assert.equal(url.pathname, scenario.side === 'offer' ? '/join' : '/find-a-partner');
    assert.deepEqual(scope.countries, []);
  }
  const a = new URLSearchParams(
    'companyType=local-partner&country=mozambique&industry=payments&capabilities=local-methods',
  );
  const b = new URLSearchParams(a);
  b.set('lang', 'ru');
  b.set('utm_source', 'linkedin');
  assert.equal(briefEntry('/join', a), briefEntry('/join', b));
  assert.equal(scopeFromParams(new URLSearchParams('role=provider')).companyType, 'psp');
  assert.equal(scopeFromParams(new URLSearchParams('companyType=unknown')).companyType, '');
});

test('one metadata source covers every public route and country research is distinct and sourced', () => {
  const descriptions = new Set();
  for (const route of publicRoutes) {
    for (const language of ['en', 'ru']) {
      assert.deepEqual(pageMeta(route, language), networkMeta(route, language));
      assert.equal(networkMeta(route + '/', language).title, networkMeta(route, language).title);
      assert.equal(networkMeta(route, language).noindex, false);
      const html = fs.readFileSync(
        path.join('dist/__pages', language, route, 'index.html'),
        'utf8',
      );
      assert.ok(
        html.includes(
          `<title>${networkMeta(route, language).title.replaceAll('&', '&amp;')}</title>`,
        ),
      );
      assert.ok(
        html.includes(
          `href="https://www.vladdos.com${route}${language === 'ru' ? '?lang=ru' : ''}"`,
        ),
      );
      assert.match(html, /hreflang="x-default"/);
    }
  }
  for (const country of taxonomy.countries) {
    const context = marketContext[country.id];
    assert.ok(
      context.en && context.ru && context.focus && context.focusRu && context.sources.length,
    );
    assert.ok(!descriptions.has(context.en));
    descriptions.add(context.en);
    assert.ok(context.sources.every((s) => new URL(s.url).protocol === 'https:'));
    assert.match(
      fs.readFileSync(path.join('dist/__pages/en/markets', country.id, 'index.html'), 'utf8'),
      /Market research/,
    );
  }
  assert.equal(networkMeta('/admin/').noindex, true);
  assert.equal(networkMeta('/nonexistent').noindex, true);
});

test('operating context and full source attribution persist privately and remain self-declared', async (t) => {
  const f = await fixture(t);
  const body = payload({
    licensingStatus: 'agent',
    licensingContext: 'Test entity, technical partner; evidence to be reviewed.',
    commercialIntent: 'PSP distribution and an agreed success fee.',
    attribution: {
      source: 'linkedin',
      medium: 'social',
      campaign: 'test',
      ref: 'test-introducer',
      landing: '/markets/mozambique',
      referrer: 'linkedin.com',
    },
  });
  const saved = await f.request('/api/opportunities', 'POST', body, false);
  assert.equal(saved.status, 201);
  assert.equal(saved.data.status, 'received');
  const report = (await f.request('/api/admin/desk')).data;
  const item = report.opportunities[0];
  assert.equal(item.profile.licensingStatus, 'agent');
  assert.equal(item.profile.commercialIntent, body.commercialIntent);
  assert.equal(item.verification, 'unverified');
  assert.equal(item.share_consent, 0);
  assert.equal(item.attribution.medium, 'social');
  assert.equal(item.attribution.landing, '/markets/mozambique');
  assert.equal(report.notifications.jobs[0].reference, saved.data.reference);
  const publicData = JSON.stringify(
    (await f.request('/api/content', 'GET', undefined, false)).data,
  );
  assert.ok(!publicData.includes(body.contact));
  assert.ok(!publicData.includes(body.licensingContext));
  assert.equal(
    (await f.request('/api/opportunities', 'POST', { ...body, licensingContext: 'Changed' }, false))
      .status,
    409,
  );
  assert.throws(
    () => validateOpportunity(payload({ licensingStatus: 'verified' })),
    /operating role/,
  );
  assert.throws(() => validateOpportunity(payload({ commercialIntent: 'a'.repeat(601) })), /600/);
});

test('consent revocation or a changed scope blocks an actual introduction after proposal', async (t) => {
  const f = await fixture(t);
  await f.request('/api/opportunities', 'POST', payload(), false);
  await f.request(
    '/api/opportunities',
    'POST',
    payload({ side: 'need', companyType: 'psp' }),
    false,
  );
  const items = (await f.request('/api/admin/desk')).data.opportunities;
  const demand = items.find((i) => i.side === 'need'),
    supply = items.find((i) => i.side === 'offer');
  for (const i of items)
    assert.equal(
      (
        await f.request('/api/admin/desk/opportunities/' + i.id, 'PATCH', {
          status: 'qualified',
          verification: 'verified',
          share_consent: true,
          evidence: 'Entity, scope and separate sharing permission verified in test.',
        })
      ).status,
      200,
    );
  const intro = await f.request('/api/admin/desk/introductions', 'POST', {
    demandId: demand.id,
    supplyId: supply.id,
    evidence: 'Test proposal with bilateral permission.',
  });
  await f.request('/api/admin/desk/opportunities/' + supply.id, 'PATCH', { share_consent: false });
  assert.equal(
    (
      await f.request('/api/admin/desk/introductions/' + intro.data.id, 'PATCH', {
        status: 'introduced',
        evidence: 'An introduction must not proceed after permission is revoked.',
      })
    ).status,
    422,
  );
  await f.request('/api/admin/desk/opportunities/' + supply.id, 'PATCH', { share_consent: true });
  assert.equal(
    (
      await f.request('/api/admin/desk/introductions/' + intro.data.id, 'PATCH', {
        status: 'introduced',
        evidence: 'Test actual introduction after renewed permission.',
      })
    ).status,
    200,
  );
  for (const i of items)
    assert.ok(
      (await f.request('/api/admin/desk/opportunities/' + i.id)).data.events.some(
        (e) => e.kind === 'introduction-status',
      ),
    );
});

test('Telegram alerts bind one private chat through the authenticated desk and deliver reference-only messages', async (t) => {
  const updates = [],
    deliveries = [];
  let botUsername = 'wrong_alert_bot';
  const f = await fixture(t, {
    deskOptions: {
      telegramBotToken: '123456789:abcdefghijklmnopqrstuvwxyz_fixture',
      telegramBotUsername: 'test_alert_bot',
      fetcher: async (url, init) => {
        const endpoint = new URL(url);
        assert.equal(endpoint.origin, 'https://api.telegram.org');
        assert.equal(init.redirect, 'error');
        const method = endpoint.pathname.split('/').at(-1);
        if (method === 'getMe')
          return Response.json({ ok: true, result: { is_bot: true, username: botUsername } });
        if (method === 'getUpdates') return Response.json({ ok: true, result: updates });
        assert.equal(method, 'sendMessage');
        deliveries.push(JSON.parse(init.body));
        return Response.json({ ok: true, result: { message_id: 2 } });
      },
    },
  });
  const telegram = '/api/admin/desk/notifications/telegram/';
  assert.equal((await f.request(telegram + 'start', 'POST', {}, false)).status, 401);
  assert.equal((await f.request(telegram + 'start', 'POST', {})).status, 409);
  botUsername = 'test_alert_bot';
  const link = await f.request(telegram + 'start', 'POST', {});
  assert.equal(link.status, 200);
  assert.equal(link.data.url, 'https://t.me/test_alert_bot?start=' + link.data.code);
  const start = '/start ' + link.data.code;
  updates.push({ message: { chat: { type: 'group', id: -42 }, from: { id: 42 }, text: start } });
  updates.push({
    message: { chat: { type: 'private', id: 11 }, from: { id: 11 }, text: '/start' },
  });
  const confirm = () => f.request(telegram + 'confirm', 'POST', { code: link.data.code });
  assert.equal((await confirm()).status, 409);
  assert.equal((await f.request('/health')).data.notifications, 'unconfigured');
  updates.push({ message: { chat: { type: 'private', id: 42 }, from: { id: 42 }, text: start } });
  assert.equal((await confirm()).status, 200);
  assert.equal((await confirm()).status, 409);
  assert.equal((await f.request('/health')).data.notifications, 'configured');
  assert.equal((await f.request(telegram + 'test', 'POST', {})).status, 200);
  const brief = payload();
  const saved = await f.request('/api/opportunities', 'POST', brief, false);
  assert.equal(saved.status, 201);
  const outbox = '/api/admin/desk/notifications/retry';
  const result = await f.request(outbox, 'POST', {});
  assert.equal(result.data.pending, 0);
  assert.ok(result.data.jobs[0].delivered_at);
  await f.request(outbox, 'POST', {});
  assert.equal(deliveries.length, 2);
  assert.deepEqual(deliveries[1], {
    chat_id: '42',
    text: 'Новая заявка ' + saved.data.reference,
    reply_markup: { inline_keyboard: [[{ text: 'Открыть Deal Desk', url: origin + '/admin' }]] },
  });
});

test('a real local notification receiver gets one durable event after failure and restart', async (t) => {
  const events = [],
    keys = [],
    accepted = new Set();
  let failFirst = true;
  const receiver = http.createServer(async (req, res) => {
    let text = '';
    for await (const c of req) text += c;
    assert.equal(req.headers.authorization, 'Bearer local-receiver-secret');
    const event = JSON.parse(text);
    events.push(event);
    keys.push(req.headers['idempotency-key']);
    if (failFirst) {
      failFirst = false;
      res.writeHead(503);
      return res.end();
    }
    accepted.add(req.headers['idempotency-key']);
    res.writeHead(204);
    res.end();
  });
  await new Promise((resolve) => receiver.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => receiver.close(resolve)));
  const localReceiver = 'http://127.0.0.1:' + receiver.address().port;
  const options = {
    notificationUrl: 'https://test-receiver.invalid/hook',
    notificationSecret: 'local-receiver-secret',
    send: (_url, init) => fetch(localReceiver, init),
  };
  const dir = fs.mkdtempSync(path.join(tmpdir(), 'notification-http-'));
  const db = openDatabase(path.join(dir, 'test.sqlite'));
  t.after(() => {
    db.close();
    fs.rmSync(dir, { recursive: true, force: true });
  });
  let desk = createDesk(db, options);
  const body = payload(),
    saved = desk.submit(body);
  await desk.flush();
  assert.equal(desk.report().notifications.failed, 1);
  await desk.stop();
  db.exec("UPDATE notification_outbox SET next_at='2000-01-01',lease_until=''");
  desk = createDesk(db, options);
  await desk.flush();
  await desk.flush();
  assert.equal(desk.report().notifications.pending, 0);
  assert.equal(events.length, 2);
  assert.equal(accepted.size, 1);
  assert.equal(keys[0], keys[1]);
  assert.equal(events[1].reference, saved.reference);
  assert.ok(!JSON.stringify(events).includes(body.contact));
  assert.deepEqual(Object.keys(events[1]).sort(), ['deskPath', 'event', 'id', 'reference']);
  await desk.stop();
});

test('gateway rejects weak setup, ambiguous routes, oversized buffers and upstream redirects without caching', async (t) => {
  const oldOrigin = process.env.INTAKE_SERVICE_ORIGIN,
    oldToken = process.env.INTAKE_GATEWAY_TOKEN,
    oldFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = oldFetch;
    if (oldOrigin === undefined) delete process.env.INTAKE_SERVICE_ORIGIN;
    else process.env.INTAKE_SERVICE_ORIGIN = oldOrigin;
    if (oldToken === undefined) delete process.env.INTAKE_GATEWAY_TOKEN;
    else process.env.INTAKE_GATEWAY_TOKEN = oldToken;
  });
  const run = async (url, body, method = 'POST') => {
    const r = { statusCode: 200, headers: {}, body: '' };
    await gateway(
      { url, method, body, headers: {} },
      {
        set statusCode(v) {
          r.statusCode = v;
        },
        setHeader(k, v) {
          r.headers[k] = v;
        },
        end(b) {
          r.body = b?.toString() || '';
        },
      },
    );
    assert.equal(r.headers['Cache-Control'], 'no-store');
    return r;
  };
  process.env.INTAKE_SERVICE_ORIGIN = 'https://backend.example';
  process.env.INTAKE_GATEWAY_TOKEN = 'weak';
  assert.equal((await run('/api/service?_route=/api/opportunities', {})).statusCode, 503);
  process.env.INTAKE_GATEWAY_TOKEN = token;
  assert.equal(
    (await run('/api/service?_route=/api/opportunities&_route=/api/admin/desk', {})).statusCode,
    404,
  );
  assert.equal(
    (await run('/api/service?_route=/api/opportunities', Buffer.alloc(12001))).statusCode,
    413,
  );
  globalThis.fetch = async (_url, init) => {
    assert.equal(init.body.toString(), '{"consent":true}');
    return new Response(null, { status: 302, headers: { Location: 'https://login.example' } });
  };
  const response = await run(
    '/api/service?_route=/api/opportunities',
    Buffer.from('{"consent":true}'),
  );
  assert.equal(response.statusCode, 503);
  assert.match(response.body, /Receipt is not confirmed/);
  assert.equal(response.headers.Location, undefined);
  globalThis.fetch = async () =>
    new Response('<h1>Login</h1>', { status: 200, headers: { 'Content-Type': 'text/html' } });
  assert.equal((await run('/api/service?_route=/api/opportunities', {})).statusCode, 503);
});

test('private SSR artifacts are inaccessible; unknown routes stay noindex and legacy links retain context', async (t) => {
  const f = await fixture(t);
  for (const route of [
    '/shell.html',
    '/__pages/en/admin/index.html',
    '/__pages/ru/markets/mozambique/index.html',
  ])
    assert.equal((await fetch(f.base + route)).status, 404);
  const unknown = await fetch(f.base + '/not-a-real-page');
  assert.equal(unknown.status, 404);
  assert.match(await unknown.text(), /noindex, nofollow/);
  assert.equal((await f.request('/api/admin/desk', 'GET', undefined, false)).status, 401);
  const health = await f.request('/health', 'GET', undefined, false);
  assert.equal(health.data.intake, 'durable');
  assert.equal(health.data.notifications, 'unconfigured');
  const bad = await fetch(f.base + '/api/admin/growth', {
    method: 'PATCH',
    headers: {
      Origin: 'https://untrusted.example',
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: '{"paused":true}',
  });
  assert.equal(bad.status, 403);
  for (const role of ['provider', 'affiliate', 'merchant', 'invalid']) {
    const result = await fetch(f.base + '/apply?role=' + role + '&country=mozambique&lang=ru', {
      redirect: 'manual',
    });
    assert.equal(result.status, 308);
    assert.ok(
      result.headers
        .get('location')
        .startsWith(role === 'provider' || role === 'affiliate' ? '/join?' : '/find-a-partner?'),
    );
    assert.ok(result.headers.get('location').includes('country=mozambique&lang=ru'));
  }
});

test('production refuses placeholder credentials before opening a database', () => {
  const old = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try {
    assert.throws(
      () =>
        createApp({
          adminToken: 'replace-with-a-long-placeholder-secret',
          publicSiteUrl: origin,
          allowedOrigin: origin,
        }),
      /ADMIN_TOKEN/,
    );
  } finally {
    if (old === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = old;
  }
});

test('an already saved request can recover its receipt even after the new-intake rate limit', async (t) => {
  const f = await fixture(t);
  const body = payload();
  const first = await f.request('/api/opportunities', 'POST', body, false);
  for (let i = 0; i < 13; i++) {
    const replay = await f.request('/api/opportunities', 'POST', body, false);
    assert.equal(replay.status, 200);
    assert.equal(replay.data.reference, first.data.reference);
  }
  assert.equal((await f.request('/api/opportunities', 'POST', payload(), false)).status, 429);
  assert.equal((await f.request('/api/admin/desk')).data.opportunities.length, 1);
});

test('explicitly incompatible method declarations cannot become matching candidates', async (t) => {
  const f = await fixture(t);
  await f.request('/api/opportunities', 'POST', payload({ methods: ['e-Mola'] }), false);
  await f.request(
    '/api/opportunities',
    'POST',
    payload({ side: 'need', companyType: 'psp', methods: ['M-Pesa'] }),
    false,
  );
  const items = (await f.request('/api/admin/desk')).data.opportunities;
  for (const i of items)
    await f.request('/api/admin/desk/opportunities/' + i.id, 'PATCH', {
      status: 'qualified',
      verification: 'verified',
      evidence: 'Entity and operating scope checked for the test.',
    });
  const demand = items.find((i) => i.side === 'need');
  assert.equal(
    (await f.request('/api/admin/desk/opportunities/' + demand.id)).data.candidates.length,
    0,
  );
});
