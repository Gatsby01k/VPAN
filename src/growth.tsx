import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

export interface GuideSection {
  id: string;
  heading: string;
  headingRu: string;
  body: string;
  bodyRu: string;
  bullets: string[];
  bulletsRu: string[];
}
export interface Guide {
  slug: string;
  title: string;
  titleRu: string;
  summary: string;
  summaryRu: string;
  role: string;
  market: string;
  sourceIds: string[];
  sections: GuideSection[];
  checklist: string[];
  checklistRu: string[];
  author: string;
  generated: boolean;
  publishedAt: string;
  updatedAt: string;
  status: string;
}
export interface ResearchSource {
  id: string;
  name: string;
  url: string;
  editorialChecked: string;
  checked_at: string | null;
  status: string;
}
export interface GrowthData {
  articles: Guide[];
  sources: ResearchSource[];
  origin: string;
  language?: 'en' | 'ru';
}
export const emptyGrowth: GrowthData = { articles: [], sources: [], origin: '' };
const GrowthContext = createContext({ data: emptyGrowth, loaded: false });
export function GrowthProvider({
  initial = emptyGrowth,
  children,
}: {
  initial?: GrowthData;
  children: ReactNode;
}) {
  const [data, setData] = useState(initial);
  const [loaded, setLoaded] = useState(Boolean(initial.articles.length));
  const location = useLocation();
  useEffect(() => {
    const controller = new AbortController();
    const article = location.pathname.startsWith('/knowledge/')
      ? location.pathname.slice('/knowledge/'.length)
      : '';
    fetch('/api/content' + (article ? '?article=' + encodeURIComponent(article) : ''), {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Content unavailable');
        const next = await response.json();
        if (Array.isArray(next.articles) && Array.isArray(next.sources)) setData(next);
      })
      .catch(() => {
        /* Existing server-rendered content remains available. */
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoaded(true);
      });
    return () => controller.abort();
  }, [location.pathname]);
  return <GrowthContext value={{ data, loaded }}>{children}</GrowthContext>;
}
export const useGrowth = () => useContext(GrowthContext);
