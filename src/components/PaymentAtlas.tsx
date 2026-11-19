import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import marketContext from '../../shared/market-context.json';
import { countries, paymentMethodLabel, regions } from '../network';
import { useLocale } from '../locale';
import { SignatureArrow } from './ConnectionProtocol';
import { Engraving } from './CounterpartArt';
import { NLink } from './NetworkLayout';
import geography from './atlas-geography.json';
import landFile from './atlas-land.svg';
import './payment-atlas.css';

type Country = (typeof countries)[number];
type Point = [number, number];
type Reading = { code: string; method: string };

// The painted eyelet sits on this same point as the end of the live SVG thread.
const outletX = 0.58;
const outletPosition = { '--atlas-outlet': `${outletX * 100}%` } as CSSProperties;

const shapes = new Map(Object.entries(geography));
const atlasRegions = regions.map((region) => {
  const markets = countries.filter(
    (country) => country.region === region.id && shapes.has(country.code),
  );
  const methodCounts = new Map<string, number>();
  for (const country of markets) {
    for (const method of country.methods) {
      methodCounts.set(method, (methodCounts.get(method) ?? 0) + 1);
    }
  }
  return {
    ...region,
    markets,
    methods: [...methodCounts].sort(([a, n], [b, m]) => m - n || a.localeCompare(b)),
  };
});

const windows: Record<string, { center: Point; scale: number }> = {
  asia: { center: [855, 207], scale: 2.6 },
  latam: { center: [342, 235], scale: 2.3 },
  africa: { center: [611, 261], scale: 2.54 },
};

const parallels = [
  [124.35, '45° N'],
  [162.9, '30° N'],
  [201.45, '15° N'],
  [240, '0°'],
  [278.55, '15° S'],
  [317.1, '30° S'],
  [355.65, '45° S'],
] as const;

const meridians = Array.from({ length: 23 }, (_, index) => 15 * (index - 11));
const latitudeSteps = Array.from({ length: 19 }, (_, index) => index * 10 - 90);

function Compass({ x, y }: { x: number; y: number }) {
  return (
    <g className="atlas-compass" transform={`translate(${x} ${y})`}>
      <circle r="28" strokeDasharray="1 4" />
      <circle r="23" />
      <path d="M0 -22 5 -5 16 0 5 5 0 22 -5 5 -16 0 -5 -5Z" />
      <path d="M0 -22 5 -5 0 0Z" className="atlas-compass-needle" />
      <path d="M-32 0h5m54 0h5M0 28v4" />
      <text y="-34" textAnchor="middle">
        N
      </text>
    </g>
  );
}

function AtlasChart({
  selected,
  markets,
  matches,
  filtered,
  previewCode,
  onSelect,
  compact = false,
}: {
  selected: Country;
  markets: Country[];
  matches: Country[];
  filtered: boolean;
  previewCode: string | null;
  onSelect: (code: string) => void;
  compact?: boolean;
}) {
  const { t } = useLocale();
  const hatch = useId();
  const width = compact ? 440 : 720;
  const height = compact ? 362 : 456;
  const { center, scale: regionScale } = windows[selected.region];
  const scale = regionScale * (compact ? 0.74 : 1);
  const origin: Point = [
    (compact ? 220 : 327) - center[0] * scale,
    height * 0.51 - center[1] * scale,
  ];
  const at = ([x, y]: number[]): Point => [x * scale + origin[0], y * scale + origin[1]];
  const entry = width * outletX;
  const junction: Point = [entry + (compact ? 37 : 58), height - (compact ? 42 : 55)];
  const trunk = `M${entry} ${height} Q${entry + 1} ${height - 28} ${junction.join(' ')}`;
  const connections = filtered ? matches : [selected];
  const branch = ([x, y]: Point) =>
    `M${junction.join(' ')} C${junction[0] - 12} ${junction[1] - 46} ${x + 33} ${y + 24} ${x} ${y}`;

  return (
    <div className="atlas-chart" data-compact={compact}>
      <svg className="atlas-chart-art" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        <defs>
          <pattern
            id={hatch}
            width="3"
            height="3"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(40)"
          >
            <rect width="3" height="3" fill="#a72a56" fillOpacity=".14" />
            <path d="M0 0V3" stroke="#a72a56" strokeOpacity=".45" strokeWidth=".48" />
          </pattern>
        </defs>
        <g className="atlas-graticule">
          {parallels.map(([latitude, caption]) => {
            const y = at([0, latitude])[1];
            return (
              <g key={caption}>
                <path d={`M0 ${y}H${width}`} data-equator={latitude === 240} />
                {y > 21 && y < height - 58 && (
                  <text x="12" y={y - 5}>
                    {caption}
                  </text>
                )}
              </g>
            );
          })}
          {meridians.map((longitude) => {
            const points = latitudeSteps.map((latitude) =>
              at([
                560 + longitude * 2.98 * (0.88 + 0.12 * Math.cos((latitude * Math.PI) / 180)),
                240 - latitude * 2.57,
              ])
                .map(Math.round)
                .join(','),
            );
            return <polyline key={longitude} points={points.join(' ')} />;
          })}
        </g>
        <g transform={`translate(${origin.join(' ')}) scale(${scale})`}>
          <image href={landFile} width="1120" height="425" />
          {markets.map((country) => (
            <path
              className="atlas-territory"
              key={country.code}
              data-connected={connections.includes(country)}
              data-current={country.code === selected.code}
              data-preview={country.code === previewCode}
              data-available={matches.includes(country)}
              fill={connections.includes(country) ? `url(#${hatch})` : '#a99056'}
              fillRule="evenodd"
              d={shapes.get(country.code)!.shape}
              onClick={matches.includes(country) ? () => onSelect(country.code) : undefined}
            />
          ))}
        </g>
        <Compass x={compact ? width - 49 : width - 63} y={compact ? 61 : 68} />
        <g className="atlas-threads" key={connections.map((country) => country.code).join()}>
          <path className="atlas-trunk" d={trunk} pathLength="1" />
          {connections.map((country, index) => (
            <path
              className="atlas-branch"
              key={country.code}
              data-current={country.code === selected.code}
              style={{ '--atlas-branch-delay': `${index * 30}ms` } as CSSProperties}
              d={branch(at(shapes.get(country.code)!.point))}
              pathLength="1"
            />
          ))}
          {connections.length > 1 && (
            <path
              className="atlas-junction"
              d="M0 -5 5 0 0 5 -5 0Z"
              transform={`translate(${junction.join(' ')})`}
            />
          )}
        </g>
        {markets.map((country) => {
          const { point, label } = shapes.get(country.code)!;
          const [x, y] = at(point);
          return (
            <g
              key={country.code}
              className="atlas-marker"
              data-connected={connections.includes(country)}
              data-current={selected.code === country.code}
              data-available={matches.includes(country)}
              data-preview={country.code === previewCode}
            >
              <path d={`M${x} ${y}L${at(label).join(' ')}`} />
              <circle cx={x} cy={y} r="3.7" />
              {selected.code === country.code && (
                <circle className="atlas-arrival" cx={x} cy={y} r="7.5" />
              )}
            </g>
          );
        })}
      </svg>
      {matches.map((country) => {
        const [x, y] = at(shapes.get(country.code)!.label);
        return (
          <button
            type="button"
            key={country.code}
            className="atlas-pin"
            aria-label={t(country.en, country.ru)}
            title={t(country.en, country.ru)}
            aria-pressed={country.code === selected.code}
            data-preview={country.code === previewCode}
            aria-controls="atlas-market-details"
            tabIndex={-1}
            style={{ left: `${(x / width) * 100}%`, top: `${(y / height) * 100}%` }}
            onClick={() => onSelect(country.code)}
          >
            <span>{country.code}</span>
          </button>
        );
      })}
    </div>
  );
}

function RailEye() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 14" fill="none">
      <circle cx="6" cy="7" r="3.5" />
      <path d="M9.5 7H21m-4-3 4 3-4 3" />
    </svg>
  );
}

export function PaymentAtlas() {
  const { language, t } = useLocale();
  const { search, hash } = useLocation();
  const navigate = useNavigate();
  const methodSelect = useRef<HTMLSelectElement>(null);
  const marketDetails = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [previousReadings, setPreviousReadings] = useState<Record<string, Reading>>({});
  // The static home page hydrates with its default view before applying a shared atlas link.
  useEffect(() => setReady(true), []);
  const query = new URLSearchParams(ready ? search : '');
  const region = atlasRegions.find((item) => item.id === query.get('atlas')) ?? atlasRegions[0];
  const requestedMethod = query.get('rail');
  const method = region.methods.find(([value]) => value === requestedMethod)?.[0] ?? '';
  const matches = method
    ? region.markets.filter((country) => country.methods.includes(method))
    : region.markets;
  const selected = matches.find((country) => country.code === query.get('market')) ?? matches[0];
  const updateReading = (nextRegion: string, nextMethod: string, nextCode: string) => {
    setPreviewCode(null);
    const next = new URLSearchParams(search);
    next.set('atlas', nextRegion);
    if (nextMethod) next.set('rail', nextMethod);
    else next.delete('rail');
    if (nextCode) next.set('market', nextCode);
    else next.delete('market');
    if (next.toString() !== new URLSearchParams(search).toString() || hash !== '#atlas')
      navigate({ search: next.toString(), hash: '#atlas' }, { replace: true });
  };
  const selectRegion = (nextRegion: string) => {
    setPreviousReadings((previous) => ({
      ...previous,
      [region.id]: { code: selected.code, method },
    }));
    const stored = previousReadings[nextRegion];
    updateReading(nextRegion, stored?.method ?? '', stored?.code ?? '');
  };
  const selectCountry = (nextCode: string) => updateReading(region.id, method, nextCode);
  const selectMethod = (nextMethod: string) => {
    const nextCountry =
      nextMethod && !selected.methods.includes(nextMethod)
        ? (region.markets.find((country) => country.methods.includes(nextMethod)) ?? selected)
        : selected;
    updateReading(region.id, nextMethod, nextCountry.code);
  };
  const methodName = (value: string) => paymentMethodLabel(value, language);
  const name = t(selected.en, selected.ru);
  const context = marketContext[selected.id as keyof typeof marketContext];
  const focus = t(context.focus, context.focusRu).split('. ')[0].replace(/\.?$/, '.');
  const directory = new URLSearchParams({ region: region.id });
  if (method) directory.set('q', method);
  const brief = new URLSearchParams({ country: selected.id, entry: 'payment-atlas' });
  if (method) {
    brief.set('methods', method);
    brief.set('capabilities', 'local-methods');
  }
  const countWord = matches.length === 1 ? 'страна' : matches.length < 5 ? 'страны' : 'стран';
  const count = t(
    `${matches.length} ${matches.length === 1 ? 'market' : 'markets'}`,
    `${matches.length} ${countWord}`,
  );
  const coverage = t(
    `${matches.length} of ${region.markets.length} markets`,
    `${matches.length} из ${region.markets.length} стран`,
  );

  return (
    <section className="payment-atlas counter-dark" id="atlas" aria-labelledby="atlas-title">
      <div className="atlas-sheet">
        <header className="atlas-heading">
          <h2 id="atlas-title">
            {t('Payment', 'Платёжный')} <em>{t('atlas.', 'атлас.')}</em>
          </h2>
          <p>
            {t(
              'Choose a payment method to see where it’s used. Follow the thread to a market.',
              'Выберите способ оплаты и проследите по нити, в каких странах он используется.',
            )}
          </p>
        </header>

        <div className="atlas-instrument">
          <fieldset className="atlas-regions">
            <legend className="sr-only">{t('Choose a region', 'Выберите регион')}</legend>
            {atlasRegions.map((item) => (
              <label key={item.id}>
                <input
                  type="radio"
                  name="atlas-region"
                  checked={item.id === region.id}
                  onChange={() => selectRegion(item.id)}
                />
                <span className="atlas-region-key" aria-hidden="true">
                  <RailEye />
                </span>
                <span>{t(item.en, item.ru)}</span>
                <small aria-hidden="true">{String(item.markets.length).padStart(2, '0')}</small>
              </label>
            ))}
          </fieldset>

          <div className="atlas-field">
            <div className="atlas-filter">
              <label className="atlas-select-slot atlas-method-slot">
                <span>{t('Payment method', 'Способ оплаты')}</span>
                <select
                  ref={methodSelect}
                  value={method}
                  onChange={(event) => selectMethod(event.target.value)}
                >
                  <option value="">{t('All methods', 'Все способы')}</option>
                  {region.methods.map(([value, total]) => (
                    <option value={value} key={value}>
                      {methodName(value)} ({total})
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <fieldset className="atlas-stations">
              <legend className="sr-only">{t('Choose a country', 'Выберите страну')}</legend>
              {matches.map((country) => (
                <label
                  key={country.code}
                  onPointerEnter={(event) => {
                    if (event.pointerType === 'mouse') setPreviewCode(country.code);
                  }}
                  onPointerLeave={() => setPreviewCode(null)}
                >
                  <input
                    type="radio"
                    name="atlas-station"
                    checked={country.code === selected.code}
                    onChange={() => selectCountry(country.code)}
                    onFocus={() => setPreviewCode(country.code)}
                    onBlur={() => setPreviewCode(null)}
                    aria-controls="atlas-market-details"
                  />
                  <span className="atlas-station-code" aria-hidden="true">
                    {country.code}
                  </span>
                  <span>{t(country.en, country.ru)}</span>
                </label>
              ))}
              <button
                type="button"
                className="atlas-details-jump"
                aria-controls="atlas-market-details"
                aria-label={t(`Country details: ${name}`, `К карточке страны: ${name}`)}
                onClick={() => {
                  marketDetails.current?.focus({ preventScroll: true });
                  marketDetails.current?.scrollIntoView({
                    block: 'start',
                    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                      ? 'instant'
                      : 'smooth',
                  });
                }}
              >
                {t('Country details', 'К карточке')} <SignatureArrow direction="down" />
              </button>
            </fieldset>
            <div className="atlas-plot" style={outletPosition}>
              <Engraving className="atlas-paper-engraving" />
              <AtlasChart
                selected={selected}
                markets={region.markets}
                matches={matches}
                filtered={Boolean(method)}
                previewCode={previewCode}
                onSelect={selectCountry}
              />
              <AtlasChart
                selected={selected}
                markets={region.markets}
                matches={matches}
                filtered={Boolean(method)}
                previewCode={previewCode}
                onSelect={selectCountry}
                compact
              />
              <div className="atlas-shuttle" data-traced={Boolean(method)}>
                <img
                  src="/assets/editorial/atlas-shuttle.png"
                  width="780"
                  height="600"
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
                {method && (
                  <button
                    type="button"
                    className="atlas-rewind"
                    onClick={() => {
                      selectMethod('');
                      methodSelect.current?.focus({ preventScroll: true });
                    }}
                    aria-label={t(
                      'Rewind thread and show all methods',
                      'Смотать нить и показать все способы',
                    )}
                  >
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 6.1a5.4 5.4 0 1 1 0 4.3M3 2.6v3.9h3.8" />
                    </svg>
                    <span>{t('Rewind', 'Смотать')}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="atlas-map-key" aria-hidden="true">
              <span>{t('Markets shown', 'Страны на карте')}</span>
              <p>
                <strong>{matches.length}</strong> <small>/ {region.markets.length}</small>
              </p>
            </div>

            <div className="atlas-console">
              <article
                ref={marketDetails}
                className="atlas-entry"
                id="atlas-market-details"
                tabIndex={-1}
                aria-labelledby="atlas-market-name"
              >
                <div className="atlas-entry-head">
                  <div className="atlas-currency">
                    <span>{selected.code}</span>
                    {selected.currency}
                  </div>
                  <h3 id="atlas-market-name">{name}</h3>
                </div>
                <div className="atlas-rails-heading">
                  <span id="atlas-methods-heading">
                    {t('Local payment methods', 'Способы оплаты в стране')}
                  </span>
                  <span aria-hidden="true">{t('Markets', 'Стран')}</span>
                </div>
                <ul className="atlas-rails" aria-labelledby="atlas-methods-heading">
                  {selected.methods.map((value) => (
                    <li key={value}>
                      <button
                        type="button"
                        aria-pressed={value === method}
                        onClick={() => selectMethod(value === method ? '' : value)}
                      >
                        <RailEye />
                        <span>{methodName(value)}</span>
                        <small aria-hidden="true">
                          {region.methods.find(([entry]) => entry === value)?.[1]}
                        </small>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="atlas-ticket">
                  <p>
                    <strong>
                      {t('What to discuss with a partner', 'Что обсудить с партнёром')}
                    </strong>{' '}
                    {focus}
                  </p>
                  <div className="atlas-ticket-links">
                    <NLink className="atlas-brief-link" to={`/find-a-partner?${brief}`}>
                      {method
                        ? t(
                            `Find a partner for ${methodName(method)}`,
                            `Найти партнёра для ${methodName(method)}`,
                          )
                        : t('Find a partner here', 'Найти партнёра здесь')}
                      <SignatureArrow />
                    </NLink>
                    <NLink
                      className="atlas-market-link"
                      to={`/markets/${selected.id}`}
                      state={{ fromAtlas: true }}
                      aria-label={t(`Country profile: ${name}`, `Профиль страны: ${name}`)}
                    >
                      {t('Country profile', 'Профиль страны')} <SignatureArrow />
                    </NLink>
                    <NLink
                      className="atlas-directory"
                      to={`/markets?${directory}`}
                      state={{ fromAtlas: true }}
                    >
                      {t('Region directory', 'Каталог региона')}
                    </NLink>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
        <p className="sr-only" role="status">
          {method ? `${methodName(method)} · ${coverage}` : count} · {name} · {selected.currency}
        </p>
      </div>
    </section>
  );
}
