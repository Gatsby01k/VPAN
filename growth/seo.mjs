import { escapeHtml, scriptJson } from './engine.mjs';

export function renderHead(
  html,
  { origin, pathname, language, metadata, article, bootstrap, noindex = false },
) {
  const title = article
    ? (language === 'ru' ? article.titleRu : article.title) + ' — PAN'
    : metadata.title;
  const description = article
    ? language === 'ru'
      ? article.summaryRu
      : article.summary
    : metadata.description;
  html = html
    .replace(/<html lang="[^"]*"/, `<html lang="${language}"`)
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /(<meta (?:name="description"|property="og:description") content=")[^"]*("\s*\/?>)/g,
      `$1${escapeHtml(description).replaceAll('$', '$$$$')}$2`,
    )
    .replace(
      /(<meta property="og:title" content=")[^"]*("\s*\/?>)/,
      `$1${escapeHtml(title).replaceAll('$', '$$$$')}$2`,
    );
  let tags = noindex ? '<meta name="robots" content="noindex, follow" />' : '';
  if (origin) {
    const canonical = origin + pathname + (language === 'ru' ? '?lang=ru' : '');
    tags += `<link rel="canonical" href="${escapeHtml(canonical)}"/><link rel="alternate" hreflang="en" href="${escapeHtml(origin + pathname)}"/><link rel="alternate" hreflang="ru" href="${escapeHtml(origin + pathname + '?lang=ru')}"/><link rel="alternate" hreflang="x-default" href="${escapeHtml(origin + pathname)}"/><meta property="og:url" content="${escapeHtml(canonical)}"/><meta property="og:image" content="${escapeHtml(origin + '/assets/pan-mascot.webp')}"/>`;
    const graph = [
      {
        '@type': 'Organization',
        '@id': origin + '/#organization',
        name: 'PAN — Private Affiliate Network',
        url: origin,
        logo: origin + '/favicon.svg',
      },
      {
        '@type': 'WebSite',
        '@id': origin + '/#website',
        url: origin,
        name: 'PAN',
        inLanguage: ['en', 'ru'],
        publisher: { '@id': origin + '/#organization' },
      },
    ];
    if (article) {
      graph.push({
        '@type': 'Article',
        headline: title.replace(/ — PAN$/, ''),
        description,
        mainEntityOfPage: canonical,
        inLanguage: language,
        datePublished: article.publishedAt,
        dateModified: article.updatedAt,
        author: { '@type': 'Organization', name: article.author },
        publisher: { '@id': origin + '/#organization' },
        citation: bootstrap.sources
          .filter((s) => article.sourceIds.includes(s.id))
          .map((s) => s.url),
      });
      graph.push({
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'PAN', item: origin },
          {
            '@type': 'ListItem',
            position: 2,
            name: language === 'ru' ? 'База знаний' : 'Knowledge',
            item: origin + '/knowledge',
          },
          { '@type': 'ListItem', position: 3, name: title.replace(/ — PAN$/, ''), item: canonical },
        ],
      });
    }
    tags += `<script type="application/ld+json">${scriptJson({ '@context': 'https://schema.org', '@graph': graph })}</script>`;
  }
  tags += `<script id="pan-bootstrap" type="application/json">${scriptJson({ ...bootstrap, language })}</script>`;
  return html.replace('</head>', tags + '</head>');
}
