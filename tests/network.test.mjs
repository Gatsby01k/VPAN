import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { DatabaseSync } from 'node:sqlite';
import { createApp, openDatabase } from '../server.mjs';
import { createDesk, validateOpportunity } from '../operations/desk.mjs';
import taxonomy from '../shared/taxonomy.json' with { type: 'json' };
const token = 'network-test-operator-key-2026';
const headers = { 'Content-Type': 'application/json', Origin: 'https://network.example' };
const auth = { ...headers, Authorization: 'Bearer ' + token };
const body = (side = 'offer', more = {}) => ({
  requestId: crypto.randomUUID(),
  side,
  industry: 'payments',
  countries: ['mozambique'],
  capabilities: ['local-methods', 'settlement'],
  methods: ['M-Pesa', 'e-Mola', 'Bank transfers'],
  settlementCurrencies: ['MZN'],
  companyType: 'local-partner',
  targetType: 'psp',
  company: 'Local partner',
  contact: crypto.randomUUID() + '@example.com',
  message: 'Mozambique local payment methods. Seeking international PSP relationships.',
  consent: true,
  ...more,
});
async function fixture(t, options = {}) {
  const dir = fs.mkdtempSync(path.join(tmpdir(), 'vladdos-network-'));
  const dbPath = path.join(dir, 'partners.sqlite');
  const server = createApp({
    dbPath,
    adminToken: token,
    allowedOrigin: 'https://network.example',
    publicSiteUrl: 'https://network.example',
    ...options,
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(dir, { recursive: true, force: true });
  });
  const base = 'http://127.0.0.1:' + server.address().port;
  const request = async (url, method = 'GET', payload, priv = true) => {
    const response = await fetch(base + url, {
      method,
      headers: priv ? auth : headers,
      body: payload ? JSON.stringify(payload) : undefined,
    });
    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }
    return { status: response.status, data };
  };
  return { base, dbPath, request };
}
const send = (f, payload) => f.request('/api/opportunities', 'POST', payload, false);
const report = async (f) => (await f.request('/api/admin/desk')).data;
const qualify = (f, id, extra = {}) =>
  f.request('/api/admin/desk/opportunities/' + id, 'PATCH', {
    status: 'qualified',
    verification: 'verified',
    evidence: 'Entity documents and operating responsibility reviewed; sharing permission on file.',
    share_consent: true,
    ...extra,
  });
test('one taxonomy keeps industries, participant types, countries, capabilities and local methods distinct', () => {
  assert.equal(new Set(taxonomy.countries.map((c) => c.id)).size, taxonomy.countries.length);
  for (const c of taxonomy.countries) assert.ok(taxonomy.regions.some((r) => r.id === c.region));
  const p = validateOpportunity(body('offer', { companyType: '' }));
  assert.equal(p.companyType, 'local-partner');
  assert.deepEqual(p.settlementCurrencies, ['MZN']);
  assert.equal(p.targetType, 'psp');
  assert.throws(() => validateOpportunity(body('offer', { countries: ['M-Pesa'] })), /catalogue/);
  assert.throws(() => validateOpportunity(body('offer', { methods: ['UPI'] })), /catalogue/);
  assert.throws(() => validateOpportunity(body('offer', { consent: false })), /privacy/);
});
test('Mozambique supply persists, retries are idempotent, contact deduplication is conservative, and the public API stays private', async (t) => {
  const f = await fixture(t);
  const payload = body();
  const first = await send(f, payload);
  assert.equal(first.status, 201);
  assert.match(first.data.reference, /^VN-\d{4}-[A-F0-9]{10}$/);
  assert.equal((await send(f, payload)).data.reference, first.data.reference);
  assert.equal((await send(f, { ...payload, message: 'Changed' })).status, 409);
  await send(f, { ...payload, requestId: crypto.randomUUID(), message: 'A second scoped offer' });
  let data = await report(f);
  assert.equal(data.opportunities.length, 2);
  assert.equal(data.companies.length, 1);
  assert.equal(data.opportunities[0].verification, 'unverified');
  assert.deepEqual(data.opportunities[0].profile.methods, ['Bank transfers', 'M-Pesa', 'e-Mola']);
  assert.equal((await f.request('/api/admin/desk', 'GET', undefined, false)).status, 401);
  const pub = await (await fetch(f.base + '/api/content')).text();
  assert.ok(!pub.includes(payload.contact));
  assert.ok(!pub.includes(first.data.reference));
  const bad = await fetch(f.base + '/api/opportunities', {
    method: 'POST',
    headers: { ...headers, Origin: 'https://other.example' },
    body: JSON.stringify(body()),
  });
  assert.equal(bad.status, 403);
  const db = new DatabaseSync(f.dbPath);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM notification_outbox').get().n, 2);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM opportunities').get().n, 2);
  db.close();
});
test('matching uses actual qualified opposite sides and requires bilateral permission; expiry and closed records are excluded', async (t) => {
  const f = await fixture(t);
  await send(f, body());
  await send(f, body('need', { companyType: 'psp', targetType: 'local-partner' }));
  let r = await report(f);
  const supply = r.opportunities.find((o) => o.side === 'offer'),
    demand = r.opportunities.find((o) => o.side === 'need');
  let d = (await f.request('/api/admin/desk/opportunities/' + demand.id)).data;
  assert.equal(d.candidates.length, 0);
  assert.equal((await qualify(f, supply.id)).status, 200);
  assert.equal((await qualify(f, demand.id, { share_consent: false })).status, 200);
  d = (await f.request('/api/admin/desk/opportunities/' + demand.id)).data;
  assert.equal(d.candidates.length, 1);
  const intro = {
    demandId: demand.id,
    supplyId: supply.id,
    evidence: 'Scope and bilateral permissions confirmed in the correspondence.',
  };
  assert.equal((await f.request('/api/admin/desk/introductions', 'POST', intro)).status, 422);
  await qualify(f, demand.id);
  const result = await f.request('/api/admin/desk/introductions', 'POST', intro);
  assert.equal(result.status, 201);
  assert.equal(
    (await f.request('/api/admin/desk/introductions', 'POST', intro)).data.id,
    result.data.id,
  );
  await qualify(f, supply.id, { expires_at: '2020-01-01' });
  assert.equal(
    (await f.request('/api/admin/desk/opportunities/' + demand.id)).data.candidates.length,
    0,
  );
  await qualify(f, supply.id, { expires_at: '', status: 'closed' });
  assert.equal(
    (await f.request('/api/admin/desk/opportunities/' + demand.id)).data.candidates.length,
    0,
  );
});
test('agreement attribution, dates and evidenced revenue remain separate from proposed introductions and forecasts', async (t) => {
  const f = await fixture(t);
  await send(f, body());
  await send(f, body('need', { companyType: 'psp', targetType: 'local-partner' }));
  const r = await report(f),
    s = r.opportunities.find((o) => o.side === 'offer'),
    d = r.opportunities.find((o) => o.side === 'need');
  await qualify(f, s.id);
  await qualify(f, d.id);
  const intro = (
    await f.request('/api/admin/desk/introductions', 'POST', {
      demandId: d.id,
      supplyId: s.id,
      evidence: 'Permissions confirmed by both parties before introduction.',
    })
  ).data;
  const agreement = {
    introductionId: intro.id,
    model: 'revenue-share',
    terms: 'Contracted eligible net fees; payer PSP; monthly statements; exclusions as signed.',
    attribution: 'Introducer and new account accepted by PSP in signed schedule.',
    currency: 'USD',
    rateBps: 100,
    startsOn: '2026-01-01',
    endsOn: '2026-12-31',
    evidence: 'Signed agreement REF-TEST-2026 (fixture only)',
  };
  assert.equal((await f.request('/api/admin/desk/agreements', 'POST', agreement)).status, 422);
  await f.request('/api/admin/desk/introductions/' + intro.id, 'PATCH', {
    status: 'introduced',
    evidence: 'Bilateral introduction completed and acknowledged, fixture only.',
  });
  const a = await f.request('/api/admin/desk/agreements', 'POST', agreement);
  assert.equal(a.status, 201);
  const amount = {
    agreementId: a.data.id,
    period: '2026-10',
    amountMinor: 12345,
    currency: 'USD',
    status: 'due',
    evidence: 'Statement fixture 2026-10-001',
  };
  const entry = await f.request('/api/admin/desk/revenue', 'POST', amount);
  assert.equal(entry.status, 201);
  assert.equal((await f.request('/api/admin/desk/revenue', 'POST', amount)).data.id, entry.data.id);
  assert.equal(
    (await f.request('/api/admin/desk/revenue', 'POST', { ...amount, currency: 'EUR' })).status,
    422,
  );
  assert.equal(
    (await f.request('/api/admin/desk/revenue', 'POST', { ...amount, period: '2027-01' })).status,
    422,
  );
  assert.equal(
    (await f.request('/api/admin/desk/revenue', 'POST', { ...amount, amountMinor: 1.5 })).status,
    422,
  );
  await f.request('/api/admin/desk/revenue/' + entry.data.id, 'PATCH', {
    status: 'received',
    evidence: 'Bank receipt fixture 2026-10-001',
  });
  assert.equal((await f.request('/api/admin/desk/revenue', 'POST', amount)).data.id, entry.data.id);
  assert.equal(
    (await f.request('/api/admin/desk/revenue', 'POST', { ...amount, amountMinor: 100 })).status,
    409,
  );
  const totals = (await report(f)).totals;
  assert.deepEqual(totals, [{ currency: 'USD', status: 'received', amount_minor: 12345 }]);
});
test('qualification and history commit atomically; failed audit leaves verification unchanged', async (t) => {
  const f = await fixture(t);
  await send(f, body());
  const item = (await report(f)).opportunities[0];
  const db = new DatabaseSync(f.dbPath);
  db.exec(
    "CREATE TRIGGER fail_desk_event BEFORE INSERT ON desk_events BEGIN SELECT RAISE(FAIL,'test audit failure'); END;",
  );
  assert.equal((await qualify(f, item.id)).status, 500);
  const after = (await report(f)).opportunities[0];
  assert.equal(after.verification, 'unverified');
  assert.equal(after.status, 'new');
  db.close();
});
test('additive migration preserves original applications and imports them as unclassified, unverified records', async (t) => {
  const dir = fs.mkdtempSync(path.join(tmpdir(), 'vladdos-migrate-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const dbPath = path.join(dir, 'data.sqlite');
  let db = openDatabase(dbPath);
  db.prepare(
    'INSERT INTO applications(id,request_key,reference,created_at,updated_at,role,markets,name,email) VALUES(?,?,?,?,?,?,?,?,?)',
  ).run(
    'legacy-id',
    'legacy-key',
    'PAN-LEGACY-42',
    '2026-01-01',
    '2026-01-01',
    'provider',
    'Ghana',
    'Existing contact',
    'old@example.com',
  );
  const before = db.prepare('SELECT * FROM applications').all();
  let desk = createDesk(db);
  assert.equal(desk.report().opportunities[0].side, 'unclassified');
  assert.equal(desk.report().opportunities[0].verification, 'unverified');
  await desk.stop();
  db.close();
  db = openDatabase(dbPath);
  desk = createDesk(db);
  assert.equal(desk.report().opportunities.length, 1);
  assert.deepEqual(db.prepare('SELECT * FROM applications').all(), before);
  await desk.stop();
  db.close();
});
test('notification failures persist and recover with no contact data in webhook payloads', async (t) => {
  const dir = fs.mkdtempSync(path.join(tmpdir(), 'vladdos-outbox-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const db = openDatabase(path.join(dir, 'data.sqlite'));
  let calls = [];
  let fail = true;
  const options = {
    notificationUrl: 'https://receiver.example/hook',
    notificationSecret: 'fixture-secret',
    send: async (url, init) => {
      calls.push(init);
      if (fail) throw new Error('Temporary failure');
      return { ok: true };
    },
  };
  let desk = createDesk(db, options);
  const p = body();
  desk.submit(p);
  await new Promise((resolve) => setTimeout(resolve, 30));
  assert.equal(desk.report().notifications.failed, 1);
  await desk.stop();
  fail = false;
  db.exec("UPDATE notification_outbox SET next_at='2000-01-01',lease_until=''");
  desk = createDesk(db, options);
  await desk.flush();
  await new Promise((resolve) => setTimeout(resolve, 30));
  assert.equal(desk.report().notifications.pending, 0);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].headers['Idempotency-Key'], calls[1].headers['Idempotency-Key']);
  assert.ok(!calls[0].body.includes(p.contact));
  await desk.stop();
  db.close();
});
test('bilingual SSR, market deep links, permanent legacy redirects and privacy controls are indexable and coherent', async (t) => {
  const f = await fixture(t);
  for (const route of [
    '/',
    '/network',
    '/industries',
    '/markets/mozambique',
    '/find-a-partner',
    '/join',
  ]) {
    const r = await fetch(f.base + route + '?lang=ru');
    const html = await r.text();
    assert.equal(r.status, 200);
    assert.match(html, /<html lang="ru"/);
    assert.match(html, /hreflang="en"/);
    assert.match(html, /VlaDDoS Network/);
    assert.doesNotMatch(html, /Private Affiliate Network|PAN —/);
  }
  const legacy = await fetch(f.base + '/apply?role=provider&market=ghana&lang=ru', {
    redirect: 'manual',
  });
  assert.equal(legacy.status, 308);
  assert.equal(legacy.headers.get('location'), '/join?role=provider&market=ghana&lang=ru');
  const admin = await fetch(f.base + '/admin');
  assert.match(await admin.text(), /noindex/);
  assert.match(admin.headers.get('content-security-policy'), /frame-ancestors 'none'/);
});
test('Vercel gateway fails closed without a durable service and only forwards allowlisted paths', async () => {
  const { default: gateway } = await import('../api/service.mjs');
  const oldOrigin = process.env.INTAKE_SERVICE_ORIGIN,
    oldToken = process.env.INTAKE_GATEWAY_TOKEN,
    originalFetch = globalThis.fetch;
  const run = async (req) => {
    const result = { statusCode: 200, headers: {}, body: '' };
    await gateway(req, {
      set statusCode(v) {
        result.statusCode = v;
      },
      setHeader(k, v) {
        result.headers[k] = v;
      },
      end(b = '') {
        result.body = String(b);
      },
    });
    return result;
  };
  try {
    delete process.env.INTAKE_SERVICE_ORIGIN;
    let r = await run({
      url: '/api/service?_route=/api/opportunities',
      method: 'POST',
      headers: {},
      body: {},
    });
    assert.equal(r.statusCode, 503);
    assert.match(r.body, /No enquiry has been saved/);
    process.env.INTAKE_SERVICE_ORIGIN = 'https://backend.example';
    process.env.INTAKE_GATEWAY_TOKEN = 'gateway-test-secret';
    r = await run({
      url: '/api/service?_route=https://attacker.example',
      method: 'GET',
      headers: {},
    });
    assert.equal(r.statusCode, 404);
    let sent;
    globalThis.fetch = async (url, init) => {
      sent = { url: String(url), ...init };
      return new Response(JSON.stringify({ reference: 'VN-2026-AAAAAAAAAA' }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    };
    r = await run({
      url: '/api/service?_route=/api/opportunities',
      method: 'POST',
      headers: { origin: 'https://network.example', 'x-vercel-forwarded-for': '192.0.2.1' },
      body: { side: 'offer' },
    });
    assert.equal(r.statusCode, 201);
    assert.equal(r.headers['Cache-Control'], 'no-store');
    assert.equal(sent.url, 'https://backend.example/api/opportunities');
    assert.equal(sent.headers['x-intake-gateway-key'], 'gateway-test-secret');
    assert.equal(sent.headers['x-forwarded-for'], '192.0.2.1');
    globalThis.fetch = async () => {
      throw new Error('Unreachable');
    };
    r = await run({ url: '/api/service?_route=/health', method: 'GET', headers: {} });
    assert.equal(r.statusCode, 503);
    assert.match(r.body, /Receipt is not confirmed/);
  } finally {
    globalThis.fetch = originalFetch;
    if (oldOrigin === undefined) delete process.env.INTAKE_SERVICE_ORIGIN;
    else process.env.INTAKE_SERVICE_ORIGIN = oldOrigin;
    if (oldToken === undefined) delete process.env.INTAKE_GATEWAY_TOKEN;
    else process.env.INTAKE_GATEWAY_TOKEN = oldToken;
  }
});
test('scope refinement invalidates verification and sharing permission until the new scope is reviewed', async (t) => {
  const f = await fixture(t);
  await send(f, body());
  const item = (await report(f)).opportunities[0];
  await qualify(f, item.id);
  const result = await f.request('/api/admin/desk/opportunities/' + item.id, 'PATCH', {
    profile: {
      side: 'offer',
      industry: 'payments',
      countries: ['kenya'],
      capabilities: ['local-methods'],
      companyType: 'local-partner',
      targetType: 'psp',
    },
  });
  assert.equal(result.status, 200);
  assert.equal(result.data.status, 'review');
  assert.equal(result.data.verification, 'unverified');
  assert.equal(result.data.share_consent, 0);
  assert.deepEqual(result.data.profile.countries, ['kenya']);
});

test('legacy brief URLs and drafts retain countries, sector and relevant methods during the brand migration', async () => {
  const { scopeFromParams, scopeFromLegacy } = await import('../src/network.ts');
  const scope = scopeFromParams(
    new URLSearchParams('markets=ghana,india&category=Exchange&methods=Mobile+Money,UPI,M-Pesa'),
  );
  assert.deepEqual(scope.countries, ['ghana', 'india']);
  assert.equal(scope.industry, 'exchange');
  assert.deepEqual(scope.methods, ['Mobile Money', 'UPI']);
  assert.deepEqual(
    scopeFromLegacy({
      markets: ['Ghana', 'India'],
      category: 'Exchange',
      methods: 'Mobile Money, UPI',
    }),
    scope,
  );
});
