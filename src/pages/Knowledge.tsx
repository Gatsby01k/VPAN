import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight, Check, Copy, Download, Search } from 'lucide-react';
import { Action, Eyebrow } from '../components/UI';
import { useGrowth, type Guide } from '../growth';
import { markets, roles } from '../data';
import { useLocale } from '../locale';
import { NotFoundPage } from './Explore';

function GuideCard({ guide, index }: { guide: Guide; index: number }) {
  const { t } = useLocale();
  const market = markets.find((m) => m.slug === guide.market);
  const role = roles.find((r) => r.id === guide.role);
  return (
    <Link to={'/knowledge/' + guide.slug} className="knowledge-card">
      <div className="knowledge-card-meta">
        <span>{String(index + 1).padStart(2, '0')}</span>
        <span>
          {market ? t(market.name, market.ru) : t('Partner operations', 'Работа с партнёрами')}
        </span>
        <ArrowUpRight size={20} />
      </div>
      <h2>{t(guide.title, guide.titleRu)}</h2>
      <p>{t(guide.summary, guide.summaryRu)}</p>
      <div className="knowledge-card-foot">
        <span>{role && t(role.title, role.ru)}</span>
        <span>{t('Guide + checklist', 'Руководство + чек-лист')}</span>
      </div>
    </Link>
  );
}
export function KnowledgePage() {
  const { t } = useLocale();
  const { data, loaded } = useGrowth();
  const [query, setQuery] = useState('');
  const guides = data.articles.filter((g) =>
    `${g.title} ${g.titleRu} ${g.summary} ${g.summaryRu}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  return (
    <section className="knowledge-page wrap">
      <div className="knowledge-heading">
        <div>
          <Eyebrow>PAN / {t('Field notes', 'Практика')}</Eyebrow>
          <h1>
            {t('Better questions.', 'Точные вопросы.')}
            <br />
            <span>{t('Stronger partnerships.', 'Сильные партнёрства.')}</span>
          </h1>
        </div>
        <div className="knowledge-intro">
          <ArrowDownRight size={38} strokeWidth={1} />
          <p>
            {t(
              'Working guides for people who introduce, evaluate and connect payment partners. Practical preparation, primary sources and a clear next step.',
              'Руководства для тех, кто рекомендует, оценивает и подключает платёжных партнёров. Практическая подготовка, первоисточники и понятный следующий шаг.',
            )}
          </p>
          {data.origin && (
            <a className="text-link" href="/feed.xml">
              RSS <ArrowUpRight size={14} />
            </a>
          )}
        </div>
      </div>
      <div className="knowledge-tools">
        <span>
          {t('Working guides', 'Практических материалов')}: {data.articles.length}
        </span>
        <label className="knowledge-search">
          <Search size={17} />
          <input
            type="search"
            aria-label={t('Search guides', 'Поиск материалов')}
            placeholder={t('Find a question or payment method', 'Вопрос или платёжный метод')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <div className="knowledge-grid">
        {guides.map((g, i) => (
          <GuideCard guide={g} index={i} key={g.slug} />
        ))}
      </div>
      {!guides.length && (
        <p className="knowledge-empty" role="status">
          {loaded
            ? t(
                'No matching guides. Try a broader search.',
                'Материалов по запросу нет. Попробуйте другой поиск.',
              )
            : t('Loading the library…', 'Загружаем библиотеку…')}
        </p>
      )}
      <div className="knowledge-next">
        <div>
          <Eyebrow>{t('From preparation to a conversation', 'От подготовки к разговору')}</Eyebrow>
          <h2>{t('Bring your actual brief.', 'Принесите свой бриф.')}</h2>
          <p>
            {t(
              'Describe your role, markets and experience. We review fit and commercial terms individually.',
              'Опишите роль, рынки и опыт. Соответствие задачам и коммерческие условия рассматриваем отдельно.',
            )}
          </p>
        </div>
        <Action to="/#forge">{t('Build my profile', 'Собрать профиль')}</Action>
      </div>
    </section>
  );
}

export function KnowledgeArticle() {
  const { slug } = useParams();
  const { data, loaded } = useGrowth();
  const { language, t } = useLocale();
  const [copied, setCopied] = useState(false);
  const guide = data.articles.find((g) => g.slug === slug);
  if (!guide)
    return loaded ? (
      <NotFoundPage />
    ) : (
      <section className="knowledge-page wrap">
        <p role="status">{t('Loading guide…', 'Загружаем материал…')}</p>
      </section>
    );
  if (!guide.sections.length)
    return (
      <section className="knowledge-page wrap">
        <p role="status">{t('Loading guide…', 'Загружаем материал…')}</p>
      </section>
    );
  const title = t(guide.title, guide.titleRu),
    summary = t(guide.summary, guide.summaryRu);
  const checklist = language === 'ru' ? guide.checklistRu : guide.checklist;
  const selectedSources = data.sources.filter((s) => guide.sourceIds.includes(s.id));
  const related = data.articles
    .filter((g) => g.slug !== slug)
    .sort((a, b) => Number(b.role === guide.role) - Number(a.role === guide.role))
    .slice(0, 2);
  const date = (value: string) =>
    new Intl.DateTimeFormat(language === 'ru' ? 'ru-RU' : 'en-GB', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(value));
  const profile = '/apply?role=' + guide.role + (guide.market ? '&market=' + guide.market : '');
  const exportBrief = () => {
    const text = `${title}\n\n${summary}\n\n${checklist.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n${selectedSources.map((s) => `${s.name}: ${s.url}`).join('\n')}\n\n${data.origin || window.location.origin}/knowledge/${guide.slug}`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `pan-${guide.slug}-${language}.txt`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <article className="knowledge-article wrap">
      <nav className="knowledge-breadcrumb" aria-label={t('Breadcrumb', 'Навигационная цепочка')}>
        <Link to="/">PAN</Link>
        <span>/</span>
        <Link to="/knowledge">{t('Field notes', 'Практика')}</Link>
      </nav>
      <header className="knowledge-article-heading">
        <Eyebrow>
          {guide.market
            ? guide.market.toUpperCase()
            : t('Partner preparation', 'Подготовка партнёрства')}
        </Eyebrow>
        <h1>{title}</h1>
        <p>{summary}</p>
        <div className="knowledge-byline">
          <span>{guide.author}</span>
          <span>
            {t('Published', 'Опубликовано')} {date(guide.publishedAt)}
          </span>
          {guide.generated && (
            <span>{t('Prepared with AI assistance', 'Подготовлено с помощью AI')}</span>
          )}
        </div>
      </header>
      <div className="knowledge-article-layout">
        <div className="knowledge-body">
          {guide.sections.map((section) => (
            <section key={section.id} id={section.id}>
              <h2>{t(section.heading, section.headingRu)}</h2>
              <p>{t(section.body, section.bodyRu)}</p>
              {section.bullets.length > 0 && (
                <ul>
                  {(language === 'ru' ? section.bulletsRu : section.bullets).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          <section className="knowledge-sources">
            <Eyebrow>{t('Sources & method', 'Источники и подход')}</Eyebrow>
            <h2>{t('What this guide is based on', 'На чём основан материал')}</h2>
            <p>
              {t(
                'Infrastructure facts reference the primary sources below. Checklists are PAN’s suggested questions for a partner discussion. Availability and commercial terms require individual confirmation.',
                'Сведения об инфраструктуре основаны на первоисточниках ниже. Чек-листы — рекомендуемые PAN вопросы для обсуждения. Доступность и коммерческие условия подтверждаются отдельно.',
              )}
            </p>
            {selectedSources.length ? (
              <ul>
                {selectedSources.map((source) => (
                  <li key={source.id}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      {source.name} <ArrowUpRight size={14} />
                    </a>
                    <small>
                      {t('Editorial source review', 'Проверка источника редакцией')}:{' '}
                      {date(source.editorialChecked)}
                    </small>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                {t(
                  'Based on the PAN introduction process and original preparation guidance.',
                  'Основано на процессе знакомства через PAN и собственных рекомендациях по подготовке.',
                )}
              </p>
            )}
          </section>
        </div>
        <aside className="knowledge-sidebar">
          <div className="knowledge-checklist">
            <Eyebrow>{t('Take it into the conversation', 'Возьмите на разговор')}</Eyebrow>
            <h2>{t('Your checklist.', 'Ваш чек-лист.')}</h2>
            <ol>
              {checklist.map((item) => (
                <li key={item}>
                  <Check size={15} />
                  <span>{item}</span>
                </li>
              ))}
            </ol>
            <button className="button button-outline" onClick={exportBrief}>
              <Download size={16} />
              {t('Save checklist', 'Сохранить чек-лист')}
            </button>
            <button
              className="knowledge-share"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    window.location.origin +
                      '/knowledge/' +
                      guide.slug +
                      (language === 'ru' ? '?lang=ru' : ''),
                  );
                  setCopied(true);
                } catch {
                  setCopied(false);
                }
              }}
            >
              <Copy size={14} />
              {copied
                ? t('Link copied', 'Ссылка скопирована')
                : t('Copy guide link', 'Скопировать ссылку')}
            </button>
            <span role="status" className="sr-only">
              {copied ? t('Link copied', 'Ссылка скопирована') : ''}
            </span>
          </div>
          <div className="knowledge-apply">
            <h3>{t('Ready to introduce your business?', 'Готовы представить свой бизнес?')}</h3>
            <p>
              {t(
                'Bring your role, market and actual experience into a PAN application.',
                'Укажите роль, рынок и реальный опыт в заявке PAN.',
              )}
            </p>
            <Action to={profile}>{t('Prepare introduction', 'Подготовить знакомство')}</Action>
          </div>
        </aside>
      </div>
      <section className="knowledge-related">
        <Eyebrow>{t('Keep preparing', 'Продолжить подготовку')}</Eyebrow>
        <div className="knowledge-grid">
          {related.map((g, i) => (
            <GuideCard key={g.slug} guide={g} index={i} />
          ))}
        </div>
      </section>
    </article>
  );
}
