import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, Check, Copy, Minus, Plus } from 'lucide-react';
import { markets, roles, type RoleId } from '../data';
import { useLocale } from '../locale';
import { Crown, Eyebrow } from './UI';

export function RouteForge({ role, onRole }: { role: RoleId; onRole: (id: RoleId) => void }) {
  const { t } = useLocale();
  const reduced = useReducedMotion();
  const [params] = useSearchParams();
  const [selected, setSelected] = useState(['india']);
  const [region, setRegion] = useState('All');
  const [category, setCategory] = useState('iGaming');
  const [methods, setMethods] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState(false);
  const activeMarkets = markets.filter((m) => selected.includes(m.slug));
  const availableMethods = [...new Set(activeMarkets.flatMap((m) => m.methods))];
  const selectedRole = roles.find((r) => r.id === role)!;
  const query = params.toString();
  useEffect(() => {
    const incoming = params
      .get('markets')
      ?.split(',')
      .filter((slug) => markets.some((m) => m.slug === slug));
    if (incoming?.length) {
      const slugs = [...new Set(incoming)].slice(0, 3);
      setSelected(slugs);
      const valid = new Set(
        markets.filter((m) => slugs.includes(m.slug)).flatMap((m) => m.methods),
      );
      setMethods((params.get('methods') || '').split(',').filter((method) => valid.has(method)));
    }
    if (['iGaming', 'e-commerce', 'other'].includes(params.get('category') || ''))
      setCategory(params.get('category')!);
    // Shared routes contain only non-personal, allowlisted business preferences.
  }, [query]);
  const toggleMarket = (slug: string) => {
    let next: string[];
    if (selected.includes(slug)) next = selected.filter((s) => s !== slug);
    else if (selected.length < 3) next = [...selected, slug];
    else return;
    const valid = new Set(markets.filter((m) => next.includes(m.slug)).flatMap((m) => m.methods));
    setSelected(next);
    setMethods((previous) => previous.filter((method) => valid.has(method)));
    setCopied(false);
  };
  const preferences = new URLSearchParams({
    role,
    markets: selected.join(','),
    category,
    methods: methods.join(','),
  });
  const applicationURL = `/apply?${preferences.toString()}&source=forge`;
  const share = async () => {
    setShareError(false);
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/?${preferences.toString()}#forge`,
      );
      setCopied(true);
    } catch {
      setShareError(true);
    }
  };
  return (
    <section id="forge" className="forge section wrap" aria-labelledby="forge-title">
      <div className="forge-heading">
        <div>
          <Eyebrow number="01">PAN / ROUTE BUILDER</Eyebrow>
          <h2 id="forge-title">
            {t('MAKE IT', 'СОБЕРИ')}
            <br />
            <span className="gold-text">{t('YOUR MOVE.', 'СВОЙ МАРШРУТ.')}</span>
          </h2>
        </div>
        <p>
          {t(
            'Pick your side. Find your market. Turn your next introduction into a clear brief.',
            'Выберите свою роль, рынки и методы. Превратите идею партнёрства в конкретный запрос.',
          )}
        </p>
      </div>
      <div className="forge-workbench">
        <div className="forge-roles">
          <span className="workbench-label">01 / {t('YOUR SIDE', 'ВАША РОЛЬ')}</span>
          <div role="group" aria-label={t('Your partnership role', 'Ваша роль в партнёрстве')}>
            {roles.map((r, i) => (
              <button
                key={r.id}
                aria-pressed={role === r.id}
                onClick={() => {
                  onRole(r.id);
                  setCopied(false);
                }}
              >
                <small>0{i + 1}</small>
                <span>{t(r.title, r.ru)}</span>
                {role === r.id ? <Check size={16} /> : <ArrowUpRight size={16} />}
              </button>
            ))}
          </div>
          <p className="forge-role-note">
            {t(selectedRole.description, selectedRole.descriptionRu)}
          </p>
          <label className="forge-category">
            <span>{t('Business category', 'Бизнес-категория')}</span>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCopied(false);
              }}
            >
              <option value="iGaming">iGaming</option>
              <option value="e-commerce">e-commerce</option>
              <option value="other">{t('Other high-risk', 'Другой high-risk')}</option>
            </select>
          </label>
        </div>
        <div className="forge-map">
          <div className="workbench-label">
            <span>02 / {t('YOUR MARKETS', 'ВАШИ РЫНКИ')}</span>
            <span>{selected.length} / 3</span>
          </div>
          <div
            className="forge-regions"
            role="group"
            aria-label={t('Route region', 'Регион маршрута')}
          >
            {['All', 'Africa', 'LATAM', 'Asia'].map((r) => (
              <button key={r} onClick={() => setRegion(r)} aria-pressed={region === r}>
                {r === 'All'
                  ? t('All', 'Все')
                  : r === 'Africa'
                    ? t('Africa', 'Африка')
                    : r === 'Asia'
                      ? t('Asia', 'Азия')
                      : r}
              </button>
            ))}
          </div>
          <div className="forge-selected" aria-label={t('Selected markets', 'Выбранные рынки')}>
            {activeMarkets.map((m) => (
              <button
                key={m.slug}
                onClick={() => toggleMarket(m.slug)}
                aria-label={t(`Remove ${m.name}`, `Убрать: ${m.ru}`)}
              >
                {t(m.name, m.ru)}
                <Minus size={12} />
              </button>
            ))}
            {!activeMarkets.length && (
              <span>{t('Choose up to three markets', 'Выберите до трёх рынков')}</span>
            )}
          </div>
          <div className="forge-countries">
            {markets
              .filter((m) => region === 'All' || m.region === region)
              .map((m) => (
                <button
                  key={m.slug}
                  onClick={() => toggleMarket(m.slug)}
                  aria-pressed={selected.includes(m.slug)}
                  disabled={selected.length === 3 && !selected.includes(m.slug)}
                >
                  <span className="forge-country-code">{m.code}</span>
                  <span className="forge-country-name">
                    {t(m.name, m.ru)}
                    <small>{m.currency}</small>
                  </span>
                  <span className="forge-country-toggle">
                    {selected.includes(m.slug) ? <Minus size={13} /> : <Plus size={13} />}
                  </span>
                </button>
              ))}
          </div>
          <fieldset className="forge-methods">
            <legend>03 / {t('METHODS TO DISCUSS', 'МЕТОДЫ ДЛЯ ОБСУЖДЕНИЯ')}</legend>
            <div>
              {availableMethods.length ? (
                availableMethods.map((method) => (
                  <button
                    key={method}
                    type="button"
                    aria-pressed={methods.includes(method)}
                    onClick={() => {
                      setMethods((previous) =>
                        previous.includes(method)
                          ? previous.filter((m) => m !== method)
                          : [...previous, method],
                      );
                      setCopied(false);
                    }}
                  >
                    {methods.includes(method) && <Check size={12} />}
                    {method}
                  </button>
                ))
              ) : (
                <p>
                  {t(
                    'Select a market to see local methods.',
                    'Выберите рынок, чтобы увидеть локальные методы.',
                  )}
                </p>
              )}
            </div>
          </fieldset>
          <p className="forge-context">
            {t(
              'Local infrastructure references. Availability and commercial terms are discussed with the team.',
              'Сведения о локальной инфраструктуре. Доступность и условия обсуждаются с командой.',
            )}
          </p>
        </div>
        <aside className="route-pass" aria-label={t('Your route brief', 'Бриф вашего маршрута')}>
          <div className="route-pass-head">
            <Crown />
            <span>PAN / YOUR NEXT MOVE</span>
            <span className="route-pass-number">01</span>
          </div>
          <div className="route-pass-art" aria-hidden="true">
            <span>{activeMarkets.map((m) => m.code).join(' / ') || '—'}</span>
            <svg viewBox="0 0 260 100">
              <motion.path
                key={selected.join(',')}
                d="M5 80 48 60 62 72 110 26 130 40 175 12 190 31 255 5"
                initial={reduced ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
              />
              <circle cx="5" cy="80" r="4" />
              <circle cx="130" cy="40" r="4" />
              <circle cx="255" cy="5" r="4" />
            </svg>
          </div>
          <div className="route-pass-details" aria-live="polite" aria-atomic="true">
            <span>{t('YOUR BRIEF', 'ВАШ БРИФ')}</span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.h3
                key={role}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16 }}
              >
                {t(selectedRole.title, selectedRole.ru)}
              </motion.h3>
            </AnimatePresence>
            <p>
              {activeMarkets.map((m) => t(m.name, m.ru)).join(' + ') ||
                t('Choose your markets', 'Выберите рынки')}
            </p>
            <div className="route-pass-chips">
              <span>{category === 'other' ? 'High-risk' : category}</span>
              <span>
                {methods.length ? methods.join(' · ') : t('Methods to discuss', 'Методы обсудим')}
              </span>
            </div>
          </div>
          <div className="route-pass-actions">
            {selected.length ? (
              <Link className="button button-gold" to={applicationURL}>
                {t('Continue with this brief', 'Продолжить с этим брифом')}
                <ArrowUpRight size={17} />
              </Link>
            ) : (
              <button className="button button-gold" disabled>
                {t('Choose a market', 'Выберите рынок')}
              </button>
            )}
            <button className="route-share" onClick={share} disabled={!selected.length}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied
                ? t('Route link copied', 'Ссылка скопирована')
                : t('Copy route link', 'Скопировать маршрут')}
            </button>
            <span className="route-share-status" role={shareError ? 'alert' : undefined}>
              {shareError
                ? t(
                    'Copy unavailable in this browser. Continue with the brief to save it.',
                    'Копирование недоступно. Продолжите с брифом, чтобы его сохранить.',
                  )
                : t(
                    'Your selection carries into the application.',
                    'Ваш выбор переносится в заявку.',
                  )}
            </span>
          </div>
        </aside>
      </div>
    </section>
  );
}
