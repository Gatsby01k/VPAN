import fs from 'node:fs';
import path from 'node:path';
import { renderPage, pageMeta } from '../dist-server/entry-server.mjs';

const root = path.resolve('dist');
const template = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
fs.writeFileSync(path.join(root, 'shell.html'), template);
const routes = [
  '/',
  '/affiliates',
  '/teams',
  '/payment-partners',
  '/merchants',
  '/markets',
  '/knowledge',
  '/apply',
  '/about',
  '/privacy',
  '/terms',
  '/admin',
  '/404',
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
  ].map((slug) => `/markets/${slug}`),
];
const escape = (text) =>
  text.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
for (const route of routes) {
  const { title, description } = pageMeta(route);
  let html = template.replace('<!--app-html-->', renderPage(route));
  html = html
    .replace(/<title>.*?<\/title>/, `<title>${escape(title)}</title>`)
    .replace(/(<meta property="og:title" content=")[^"]*("\s*\/?>)/, `$1${escape(title)}$2`);
  html = html.replace(
    /(<meta (?:name="description"|property="og:description") content=")[^"]*("\s*\/?>)/g,
    `$1${escape(description)}$2`,
  );
  if (route === '/admin' || route === '/404')
    html = html.replace('</head>', '<meta name="robots" content="noindex, nofollow" /></head>');
  const directory = route === '/' ? root : path.join(root, route.slice(1));
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'index.html'), html);
}
fs.writeFileSync(
  path.join(root, 'robots.txt'),
  'User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n',
);
console.log(`Prerendered ${routes.length} pages.`);
