import { NLink as Link } from './NetworkLayout';
import { useGrowth } from '../growth';
import { useLocale } from '../locale';
import { FieldNotebook } from './FieldNotebook';

export function KnowledgeTeaser({ market = '' }: { market?: string }) {
  const { data } = useGrowth();
  const { t } = useLocale();
  const guides = data.articles
    .filter((g) => !market || g.market === market || !g.market)
    .slice(0, 3);
  if (!guides.length) return null;
  return (
    <section className="field-shelf" aria-labelledby="field-shelf-title">
      <FieldNotebook />
      <div className="field-shelf-copy">
        <p className="world-label">{t('Field notes', 'Полевые заметки')}</p>
        <h2 id="field-shelf-title">
          {t('Before the first', 'До первого')} <em>{t('conversation.', 'разговора.')}</em>
        </h2>
        <ul className="field-shelf-index">
          {guides.map((guide) => (
            <li key={guide.slug}>
              <Link to={'/knowledge/' + guide.slug}>{t(guide.title, guide.titleRu)}</Link>
            </li>
          ))}
        </ul>
        <Link className="field-library-link" to="/knowledge">
          {t('All field notes', 'Все материалы')}
        </Link>
      </div>
    </section>
  );
}
