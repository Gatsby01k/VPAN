import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
const source = path.resolve(process.env.DB_PATH || 'data/partners.sqlite');
const target = process.argv[2];
if (!target) throw new Error('Usage: npm run backup -- /absolute/path/to/private-backup.sqlite');
if (!path.isAbsolute(target) || fs.existsSync(target))
  throw new Error('Use a new absolute backup path.');
const db = new DatabaseSync(source, { readOnly: true });
db.prepare('VACUUM INTO ?').run(target);
db.close();
fs.chmodSync(target, 0o600);
console.log('Consistent SQLite backup created. Keep it outside public web directories.');
