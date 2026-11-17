import { useId } from 'react';
import { countries } from '../network';
import geography from './atlas-geography.json';
import landFile from './atlas-land.svg';

const shapes = new Map(Object.entries(geography));
const views: Record<string, string> = {
  asia: '755 131 238 160',
  latam: '212 148 257 174',
  africa: '488 151 246 190',
};

export function RegionImpression({ region }: { region: string }) {
  return (
    <svg className="region-impression" viewBox={views[region]} aria-hidden="true" focusable="false">
      <image href={landFile} width="1120" height="425" />
      {countries
        .filter((country) => country.region === region)
        .map(({ code }) => {
          const geography = shapes.get(code);
          return (
            geography && (
              <g key={code}>
                <path d={geography.shape} fillRule="evenodd" />
                <circle cx={geography.point[0]} cy={geography.point[1]} r="2.2" />
              </g>
            )
          );
        })}
    </svg>
  );
}

export function CountryImpression({ code }: { code: string }) {
  const hatch = useId();
  const shape = shapes.get(code);
  if (!shape) return null;
  const coordinates = [...shape.shape.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)];
  const xs = coordinates.map((point) => Number(point[1]));
  const ys = coordinates.map((point) => Number(point[2]));
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const scale = 151 / Math.max(maxX - minX, maxY - minY);
  const x = 166 - ((minX + maxX) * scale) / 2;
  const y = 151 - ((minY + maxY) * scale) / 2;
  const startX = x + shape.point[0] * scale;
  const startY = y + shape.point[1] * scale;
  const thread = `M${startX} ${startY}C${startX} ${startY + 45} 228 218 248 240s27 18 49 18`;
  const outline = shape.shape.replace(
    /(-?[\d.]+),(-?[\d.]+)/g,
    (_, px: string, py: string) =>
      `${(x + Number(px) * scale).toFixed(1)},${(y + Number(py) * scale).toFixed(1)}`,
  );
  return (
    <svg className="country-impression" viewBox="0 0 340 310" aria-hidden="true" focusable="false">
      <defs>
        <pattern
          id={hatch}
          width="5"
          height="5"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(37)"
        >
          <rect width="5" height="5" fill="#e1c598" />
          <path d="M1 0V5" stroke="#96734e" strokeWidth=".7" />
        </pattern>
      </defs>
      <g className="country-impression-rules" fill="none">
        <circle cx="166" cy="151" r="115" />
        <circle cx="166" cy="151" r="104" />
        <path d="M166 36v230M51 151h230" strokeDasharray="2 4" />
        <path d="M166 42v12m0 195v12M57 151h12m195 0h11" />
      </g>
      <path
        className="country-impression-land"
        d={outline}
        fill={`url(#${hatch})`}
        fillRule="evenodd"
      />
      <path className="country-impression-thread" d={thread} />
      <path className="country-impression-trace" d={thread} pathLength="1" />
      <circle className="country-impression-pin" cx={startX} cy={startY} r="4" />
      <circle className="country-impression-pin" cx="297" cy="258" r="4" />
    </svg>
  );
}
