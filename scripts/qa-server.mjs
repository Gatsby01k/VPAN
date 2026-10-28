// Disposable browser QA environment. Never opens the project's configured DB_PATH.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { tmpdir } from 'node:os';
import { createApp } from '../server.mjs';
const dir = fs.mkdtempSync(path.join(tmpdir(), 'vladdos-browser-qa-'));
const token = crypto.randomBytes(32).toString('hex');
const secret = crypto.randomBytes(32).toString('hex');
const events = new Set();
const receiver = http.createServer(async (req, res) => {
  if (req.headers.authorization !== 'Bearer ' + secret) {
    res.writeHead(401);
    return res.end();
  }
  let body = '';
  for await (const chunk of req) body += chunk;
  const event = JSON.parse(body);
  if (!events.has(event.id)) {
    events.add(event.id);
    fs.appendFileSync(path.join(dir, 'notifications.jsonl'), JSON.stringify(event) + '\n', {
      mode: 0o600,
    });
  }
  res.writeHead(204);
  res.end();
});
await new Promise((resolve) => receiver.listen(0, '127.0.0.1', resolve));
const port = Number(process.env.QA_PORT || 3100);
const base = 'http://127.0.0.1:' + port;
const app = createApp({
  dbPath: path.join(dir, 'qa.sqlite'),
  adminToken: token,
  allowedOrigin: base,
  publicSiteUrl: 'https://www.vladdos.com',
  gatewayToken: '',
  trustProxy: false,
  growthEnabled: false,
  deskOptions: {
    notificationUrl: 'https://qa-receiver.invalid/private-events',
    notificationSecret: secret,
    // Test transport maps the private HTTPS receiver contract to the local HTTP sink.
    // This exercises real delivery without contacting Telegram, email or production.
    send: (_url, init) => fetch('http://127.0.0.1:' + receiver.address().port, init),
  },
});
const listener =
  process.env.QA_INTAKE_DISABLED === '1'
    ? http.createServer((req, res) => {
        if (req.url?.split('?')[0] === '/api/opportunities') {
          res.writeHead(503, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
          return res.end(
            JSON.stringify({ error: 'QA: intake backend unavailable. No enquiry saved.' }),
          );
        }
        app.emit('request', req, res);
      })
    : app;
await new Promise((resolve) => listener.listen(port, '127.0.0.1', resolve));
const statePath = path.join(dir, 'session.json');
fs.writeFileSync(
  statePath,
  JSON.stringify({
    base,
    token,
    dbPath: path.join(dir, 'qa.sqlite'),
    notifications: path.join(dir, 'notifications.jsonl'),
  }),
  { mode: 0o600 },
);
console.log(`Disposable QA running at ${base}. Private session: ${statePath}`);
function stop() {
  listener.close(() => {
    if (listener !== app) app.close();
    receiver.close(() => process.exit(0));
  });
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
