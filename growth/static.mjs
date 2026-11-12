import { catalog, sources } from './catalog.mjs';

// The same reviewed catalogue powers a useful static fallback; private operations never use it.
export const staticGuides = catalog.filter((guide) => guide.initial);
export function staticContent(slug = '', origin = 'https://www.vladdos.com') {
  return {
    origin,
    articles: staticGuides.map((guide) => ({
      ...guide,
      status: 'published',
      publishedAt: '',
      updatedAt: '',
      ...(guide.slug === slug ? {} : { sections: [], checklist: [], checklistRu: [] }),
    })),
    sources: sources.map((source) => ({
      id: source.id,
      name: source.name,
      url: source.url,
      editorialChecked: source.checked,
      checked_at: null,
      status: 'editorial-only',
    })),
  };
}
