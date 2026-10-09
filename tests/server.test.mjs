import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import crypto from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createApp } from '../server.mjs';

const authorization = { Authorization: 'Bearer unit-test-secret-long-enough' };
async function setup(t, prepare) {
  const dir = mkdtempSync(path.join(tmpdir(), 'vpan-test-'));
  const dbPath = path.join(dir, 'app.sqlite');
  if (prepare) {
    const db = new DatabaseSync(dbPath);
    prepare(db);
    db.close();
  }
  const server = createApp({
    dbPath,
    adminToken: 'unit-test-secret-long-enough',
    allowedOrigin: 'http://localhost:1234',
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    rmSync(dir, { recursive: true, force: true });
  });
  return { base: `http://127.0.0.1:${server.address().port}`, dbPath };
}
const payload = () => ({
  requestId: crypto.randomUUID(),
  role: 'affiliate',
  markets: ['Ghana'],
  name: 'Test Partner',
  email: 'test@example.com',
  company: 'Example',
  telegram: '@test',
  message: 'Partner introduction',
});
const submit = (base, body) =>
  fetch(base + '/api/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:1234' },
    body: JSON.stringify(body),
  });
const inbox = async (base) =>
  (await (await fetch(base + '/api/admin/applications', { headers: authorization })).json()).items;

test('all public routes have prerendered content, assets and a real 404', async (t) => {
  const { base } = await setup(t);
  const routes = [
    '/',
    '/affiliates',
    '/teams',
    '/payment-partners',
    '/merchants',
    '/markets',
    '/apply',
    '/about',
    '/privacy',
    '/terms',
    '/admin',
    ...[
      'india',
      'ghana',
      'kenya',
      'peru',
      'colombia',
      'uganda',
      'tanzania',
      'nigeria',
      'mexico',
      'south-africa',
    ].map((slug) => '/markets/' + slug),
  ];
  for (const route of routes) {
    const response = await fetch(base + route);
    assert.equal(response.status, 200, route);
    const html = await response.text();
    assert.match(html, /<h1/);
    assert.match(html, /<title>[^<]*PAN/);
    assert.doesNotMatch(html, /<!--app-html-->/);
  }
  const image = await fetch(base + '/assets/hero-king.webp');
  assert.equal(image.status, 200);
  assert.equal(image.headers.get('content-type'), 'image/webp');
  const missing = await fetch(base + '/assets/missing.webp');
  assert.equal(missing.status, 404);
  assert.equal(missing.headers.get('content-type'), 'application/json; charset=utf-8');
  const unknown = await fetch(base + '/does-not-exist');
  assert.equal(unknown.status, 404);
  assert.match(await unknown.text(), /Page not found/);
  const head = await fetch(base + '/markets/ghana', { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
});

test('applications save all merchant fields, are idempotent, and validate input/origin', async (t) => {
  const { base } = await setup(t);
  const body = {
    ...payload(),
    role: 'merchant',
    category: 'iGaming',
    size: '12',
    volume: '200k',
    experience: '3 years',
    methods: 'Mobile Money',
  };
  let response = await submit(base, body);
  assert.equal(response.status, 201);
  const { reference } = await response.json();
  assert.match(reference, /^PAN-\d{4}-[A-F0-9]{8}$/);
  response = await submit(base, body);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).reference, reference);
  const rows = await inbox(base);
  assert.equal(rows.length, 1);
  for (const field of ['role', 'category', 'size', 'volume', 'experience', 'methods'])
    assert.equal(rows[0][field], body[field]);
  assert.equal((await submit(base, { ...payload(), email: 'nope' })).status, 422);
  assert.equal(
    (await submit(base, { ...payload(), markets: Array(11).fill('Ghana') })).status,
    422,
  );
  assert.equal((await submit(base, null)).status, 400);
  assert.equal((await submit(base, [])).status, 400);
  response = await fetch(base + '/api/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://evil.example' },
    body: JSON.stringify(payload()),
  });
  assert.equal(response.status, 403);
});

test('multibyte names survive UTF-8 split across HTTP chunks', async (t) => {
  const { base } = await setup(t);
  const name = 'Ірина 张伟 أحمد';
  const bytes = Buffer.from(JSON.stringify({ ...payload(), name }));
  const split = bytes.indexOf(Buffer.from('І')) + 1;
  const status = await new Promise((resolve, reject) => {
    const request = http.request(
      base + '/api/apply',
      { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      (response) => {
        response.resume();
        response.on('end', () => resolve(response.statusCode));
      },
    );
    request.on('error', reject);
    request.write(bytes.subarray(0, split));
    setTimeout(() => request.end(bytes.subarray(split)), 15);
  });
  assert.equal(status, 201);
  assert.equal((await inbox(base))[0].name, name);
});

test('admin access and status history remain consistent if an audit write fails', async (t) => {
  const { base, dbPath } = await setup(t);
  await submit(base, payload());
  assert.equal((await fetch(base + '/api/admin/applications')).status, 401);
  const [item] = await inbox(base);
  const update = (status) =>
    fetch(base + '/api/admin/applications/' + item.id, {
      method: 'PATCH',
      headers: { ...authorization, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  assert.equal((await update('qualified')).status, 200);
  assert.equal((await inbox(base))[0].status, 'qualified');
  const db = new DatabaseSync(dbPath);
  t.after(() => db.close());
  assert.equal(db.prepare('SELECT to_status FROM audit_log').get().to_status, 'qualified');
  db.exec(
    "CREATE TRIGGER force_audit_failure BEFORE INSERT ON audit_log BEGIN SELECT RAISE(ABORT, 'fixture failure'); END",
  );
  assert.equal((await update('closed')).status, 500);
  assert.equal((await inbox(base))[0].status, 'qualified');
  assert.equal(db.prepare('SELECT count(*) AS n FROM audit_log').get().n, 1);
});

test('old persistent databases upgrade without losing applications', async (t) => {
  const { base } = await setup(t, (db) =>
    db.exec(`CREATE TABLE applications (
    id TEXT PRIMARY KEY, request_key TEXT UNIQUE NOT NULL, reference TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL, role TEXT NOT NULL, markets TEXT NOT NULL,
    name TEXT NOT NULL, company TEXT, email TEXT NOT NULL, telegram TEXT, size TEXT, methods TEXT,
    volume TEXT, experience TEXT, message TEXT, status TEXT NOT NULL DEFAULT 'new');
    INSERT INTO applications(id,request_key,reference,created_at,updated_at,role,markets,name,email)
    VALUES ('legacy','legacy-key','PAN-LEGACY','2026-01-01','2026-01-01','affiliate','Ghana','Existing Partner','existing@example.com');`),
  );
  assert.equal((await inbox(base))[0].reference, 'PAN-LEGACY');
  assert.equal((await inbox(base))[0].category, '');
  assert.equal(
    (await submit(base, { ...payload(), role: 'merchant', category: 'e-commerce' })).status,
    201,
  );
  assert.equal((await inbox(base)).length, 2);
});
