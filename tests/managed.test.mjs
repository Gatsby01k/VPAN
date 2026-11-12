import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import Database from 'libsql';
import { createManagedService } from '../operations/managed.mjs';
import { createDesk } from '../operations/desk.mjs';
import { openDatabase } from '../server.mjs';

test('Vercel request bodies use the same libSQL-backed CRM, reject unauthorised operations and retain work after response', async (t) => {
  const old = process.env.ADMIN_TOKEN;
  process.env.ADMIN_TOKEN = 'managed-fixture-private-operations-key';
  const background = [];
  const dir = fs.mkdtempSync(path.join(tmpdir(), 'vpan-managed-'));
  let connections = 0;
  const service = createManagedService({
    connect: () => {
      connections++;
      return new Database(path.join(dir, 'test.sqlite'));
    },
    keepAlive: (job) => background.push(job),
  });
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (req.method === 'POST') {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      req.body = JSON.parse(Buffer.concat(chunks).toString());
    }
    try {
      await service(req, res, url.pathname, url.searchParams);
    } catch (error) {
      if (!res.headersSent) {
        res.writeHead(500);
        res.end(error.message);
      }
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await Promise.all(background);
    await service.close();
    fs.rmSync(dir, { recursive: true, force: true });
    if (old === undefined) delete process.env.ADMIN_TOKEN;
    else process.env.ADMIN_TOKEN = old;
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  assert.equal((await (await fetch(base + '/health')).json()).intake, 'durable');
  const payload = {
    requestId: crypto.randomUUID(),
    side: 'need',
    industry: 'commerce',
    companyType: 'merchant',
    countries: ['brazil'],
    capabilities: ['collections'],
    contact: 'managed-qa@example.test',
    company: 'Managed QA fixture',
    consent: true,
  };
  const headers = { 'Content-Type': 'application/json', Origin: 'https://www.vladdos.com' };
  const receipt = await fetch(base + '/api/opportunities', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  assert.equal(receipt.status, 201);
  const saved = await receipt.json();
  assert.match(saved.reference, /^VN-/);
  assert.equal((await fetch(base + '/api/admin/desk')).status, 401);
  const report = await (
    await fetch(base + '/api/admin/desk', {
      headers: { Authorization: 'Bearer ' + process.env.ADMIN_TOKEN },
    })
  ).json();
  assert.equal(report.opportunities[0].reference, saved.reference);
  assert.equal(report.commercial.funnel.received, 1);
  assert.ok(background.length > 0);
  assert.equal((await fetch(base + '/api/operations-tick')).status, 401);
  const repeat = await (
    await fetch(base + '/api/opportunities', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
  ).json();
  assert.equal(repeat.reference, saved.reference);
  assert.ok(connections >= 6, 'Each invocation needs a fresh remote connection.');
});

test('libSQL compatibility preserves transaction rollback and immutable commercial attribution', async () => {
  const db = openDatabase(':managed:', { database: new Database(':memory:') }),
    desk = createDesk(db, { background: false });
  try {
    desk.commercial.affiliate({
      code: 'cloud-claim',
      name: 'Cloud referral fixture',
      contact: 'cloud-referrer@example.test',
      evidence: 'Fixture signed relationship evidence',
    });
    db.exec(
      "CREATE TRIGGER fail_cloud_claim BEFORE INSERT ON referral_claims BEGIN SELECT RAISE(ABORT,'cloud rollback fixture'); END",
    );
    assert.throws(
      () =>
        desk.submit({
          requestId: crypto.randomUUID(),
          side: 'need',
          industry: 'commerce',
          companyType: 'merchant',
          countries: ['brazil'],
          capabilities: ['collections'],
          contact: 'cloud-merchant@example.test',
          consent: true,
          attribution: { ref: 'cloud-claim' },
        }),
      /cloud rollback/,
    );
    assert.equal(desk.report().opportunities.length, 0);
    assert.equal(db.prepare('PRAGMA foreign_key_check').all().length, 0);
  } finally {
    await desk.stop();
    db.close();
  }
});
