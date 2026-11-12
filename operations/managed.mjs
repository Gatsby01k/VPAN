import crypto from 'node:crypto';
import Database from 'libsql';
import { waitUntil } from '@vercel/functions';
import { createApp } from '../server.mjs';

// The local Node service and Vercel use the same schema and commercial engine.
// Vercel connects directly to Turso; it never uses an ephemeral SQLite file.
export function createManagedService({
  connect = () =>
    new Database(process.env.TURSO_DATABASE_URL, {
      authToken: process.env.TURSO_AUTH_TOKEN,
      timeout: 15,
    }),
  keepAlive = waitUntil,
} = {}) {
  let initialized = false;
  const active = new Set();
  const ensure = () => {
    const database = connect();
    const origin = process.env.PUBLIC_SITE_URL || 'https://www.vladdos.com';
    try {
      database.exec('PRAGMA foreign_keys=ON');
      const app = createApp({
        database,
        initialize: !initialized,
        managed: true,
        dbPath: ':managed:',
        adminToken: process.env.ADMIN_TOKEN || '',
        allowedOrigin: origin,
        publicSiteUrl: origin,
        gatewayToken: '',
        trustProxy: true,
        growthEnabled: false,
        additionalOrigins: process.env.VERCEL_URL ? ['https://' + process.env.VERCEL_URL] : [],
      });
      initialized = true;
      active.add(app);
      return app;
    } catch (error) {
      database.close();
      throw error;
    }
  };
  const service = async (req, res, route, query) => {
    // Hrana streams are stateful and expire. Never cache a remote connection
    // across frozen serverless invocations or share it between concurrent requests.
    const server = ensure();
    let retained = false;
    try {
      if (route === '/api/operations-tick') {
        const key = process.env.CRON_SECRET || '';
        const hash = (s) => crypto.createHash('sha256').update(s).digest();
        if (
          req.method !== 'GET' ||
          key.length < 32 ||
          !crypto.timingSafeEqual(
            hash(String(req.headers.authorization || '')),
            hash('Bearer ' + key),
          )
        ) {
          res.writeHead(401, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
          return res.end(JSON.stringify({ error: 'Unauthorized' }));
        }
        await server.runOperations();
        res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
        return res.end(JSON.stringify({ ok: true }));
      }
      const forwarded = req.headers['x-vercel-forwarded-for'];
      if (typeof forwarded === 'string') req.headers['x-forwarded-for'] = forwarded;
      else delete req.headers['x-forwarded-for'];
      req.url = route + (query.toString() ? '?' + query.toString() : '');
      await new Promise((resolve, reject) => {
        res.once('finish', resolve);
        res.once('error', reject);
        server.emit('request', req, res);
      });
      // The outbox is committed with the opportunity. Vercel keeps the first delivery
      // attempt alive after the receipt; its daily cron retries persisted failures.
      const background = server
        .flushNotifications()
        .finally(() => server.shutdown())
        .finally(() => active.delete(server));
      keepAlive(background);
      retained = true;
    } finally {
      if (!retained) {
        await server.shutdown();
        active.delete(server);
      }
    }
  };
  service.close = async () => {
    await Promise.all([...active].map((app) => app.shutdown()));
    active.clear();
  };
  return service;
}
