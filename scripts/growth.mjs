import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDatabase } from '../server.mjs';
import { createGrowth } from '../growth/engine.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (fs.existsSync(path.join(root, '.env'))) process.loadEnvFile(path.join(root, '.env'));
const db = openDatabase(path.resolve(root, process.env.DB_PATH || 'data/partners.sqlite'));
const engine = createGrowth(db, {
  publicSiteUrl: process.env.PUBLIC_SITE_URL || '',
  enabled: false,
  aiKey: process.env.AI_GATEWAY_API_KEY || '',
  aiModel: process.env.AI_GATEWAY_MODEL || '',
  aiAutoPublish: process.env.GROWTH_AI_AUTOPUBLISH === '1',
  gscFile: process.env.GSC_SERVICE_ACCOUNT_FILE || '',
  gscProperty: process.env.GSC_PROPERTY || '',
});
try {
  if (process.argv.includes('--status')) {
    const report = engine.report();
    process.stdout.write(
      JSON.stringify(
        {
          domain: report.origin || 'not configured',
          connectors: report.connectors,
          articles: report.articles.map(({ slug, status }) => ({ slug, status })),
          lastRun: report.lastRun,
          paused: report.paused,
        },
        null,
        2,
      ) + '\n',
    );
  } else process.stdout.write(JSON.stringify(await engine.run(true), null, 2) + '\n');
} finally {
  await engine.stop();
  db.close();
}
