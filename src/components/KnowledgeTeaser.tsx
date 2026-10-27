import { NLink as Link } from './NetworkLayout';
import { ArrowUpRight } from 'lucide-react';
import { useGrowth } from '../growth';
import { useLocale } from '../locale';
import { Eyebrow } from './UI';

export function KnowledgeTeaser({ market = '' }: { market?: string }) {
  const { data } = useGrowth();
  const { t } = useLocale();
  const guides = data.articles
    .filter((g) => !market || g.market === market || !g.market)
    .slice(0, 3);
  if (!guides.length) return null;
  return (
    <section className="knowledge-teaser wrap">
      <div>
        <Eyebrow>
          {t(
            'VlaDDoS Network / Practical preparation',
            'VlaDDoS Network / Практическая подготовка',
          )}
        </Eyebrow>
        <h2>{t('Before the first conversation.', 'До первого разговора.')}</h2>
        <Link className="text-link" to="/knowledge">
          {t('All partner guides', 'Все материалы')} <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </div>
      <div>
        {guides.map((guide) => (
          <Link to={'/knowledge/' + guide.slug} key={guide.slug}>
            <span>{t(guide.title, guide.titleRu)}</span>
            <ArrowUpRight size={20} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}
