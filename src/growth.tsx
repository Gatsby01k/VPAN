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
const GrowthContext = createContext({ data: emptyGrowth, loaded: false, failed: false });
export function GrowthProvider({
  initial = emptyGrowth,
  children,
}: {
  initial?: GrowthData;
  children: ReactNode;
}) {
  const [data, setData] = useState(initial);
  const location = useLocation();
  const [request, setRequest] = useState({
    pathname: location.pathname,
    phase: initial.articles.length ? 'ready' : 'loading',
  });
  useEffect(() => {
    const controller = new AbortController();
    const pathname = location.pathname;
    setRequest({ pathname, phase: 'loading' });
    const article = location.pathname.startsWith('/knowledge/')
      ? location.pathname.slice('/knowledge/'.length)
      : '';
    fetch('/api/content' + (article ? '?article=' + encodeURIComponent(article) : ''), {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Content unavailable');
        const next = await response.json();
        if (!next || !Array.isArray(next.articles) || !Array.isArray(next.sources))
          throw new Error('Content unavailable');
        if (controller.signal.aborted) return;
        setData(next);
        setRequest({ pathname, phase: 'ready' });
      })
      .catch(() => {
        /* Existing server-rendered content remains available. */
        if (!controller.signal.aborted) setRequest({ pathname, phase: 'failed' });
      });
    return () => controller.abort();
  }, [location.pathname]);
  const current = request.pathname === location.pathname;
  return (
    <GrowthContext
      value={{
        data,
        loaded: current && request.phase !== 'loading',
        failed: current && request.phase === 'failed',
      }}
    >
      {children}
    </GrowthContext>
  );
}
export const useGrowth = () => useContext(GrowthContext);
