import fs from 'node:fs';
import path from 'node:path';
import { renderPage, pageMeta } from '../dist-server/entry-server.mjs';
import { staticRoutes } from '../growth/catalog.mjs';
import { renderHead } from '../growth/seo.mjs';
const root = path.resolve('dist');
const template = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
fs.writeFileSync(path.join(root, 'shell.html'), template);
const origin = process.env.PUBLIC_SITE_URL || 'https://www.vladdos.com';
const bootstrap = { articles: [], sources: [], origin };
for (const route of [...staticRoutes, '/admin', '/404']) {
  for (const language of ['en', 'ru']) {
    const url = route + (language === 'ru' ? '?lang=ru' : '');
    const html = renderHead(
      template.replace('<!--app-html-->', renderPage(url, { ...bootstrap, language })),
      {
        origin,
        pathname: route,
        language,
        metadata: pageMeta(route, language),
        bootstrap,
        noindex: route === '/admin' || route === '/404',
      },
    );
    // Keep public route paths absent from the filesystem so Vercel can evaluate
    // the language rewrite before serving a static file. Node uses shell.html for SSR.
    const directory = path.join(root, '__pages', language, route);
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, 'index.html'), html);
  }
}
// The Vite entry is now a rendering input; a root index would shadow language rewrites.
fs.unlinkSync(path.join(root, 'index.html'));
fs.mkdirSync(path.join(root, '404'), { recursive: true });
fs.copyFileSync(path.join(root, '__pages/en/404/index.html'), path.join(root, '404/index.html'));
fs.copyFileSync(path.join(root, '__pages/en/404/index.html'), path.join(root, '404.html'));
fs.writeFileSync(
  path.join(root, 'robots.txt'),
  'User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /shell.html\nDisallow: /__pages/\nSitemap: ' +
    origin +
    '/sitemap.xml\n',
);
const esc = (s) => s.replaceAll('&', '&amp;');
fs.writeFileSync(
  path.join(root, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' +
    staticRoutes
      .map((r) =>
        ['en', 'ru']
          .map(
            (lang) =>
              '<url><loc>' +
              esc(origin + r + (lang === 'ru' ? '?lang=ru' : '')) +
              '</loc><xhtml:link rel="alternate" hreflang="en" href="' +
              origin +
              r +
              '"/><xhtml:link rel="alternate" hreflang="ru" href="' +
              esc(origin + r + '?lang=ru') +
              '"/><xhtml:link rel="alternate" hreflang="x-default" href="' +
              origin +
              r +
              '"/></url>',
          )
          .join(''),
      )
      .join('') +
    '</urlset>',
);
console.log(`Prerendered ${staticRoutes.length + 2} routes in EN and RU.`);
