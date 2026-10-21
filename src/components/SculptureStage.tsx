import { useId } from 'react';
import { useLocale } from '../locale';
import { LiquidSculpture } from './LiquidSculpture';

/** The owner's cutout is grounded by a shared floor, reflections and native light paths. */
export function SculptureStage() {
  const { t } = useLocale();
  const id = useId();
  return (
    <div className="sculpture-stage">
      <div className="sculpture-aura" aria-hidden="true" />
      <svg className="sculpture-floor" viewBox="0 0 600 520" fill="none" aria-hidden="true">
        <defs>
          <linearGradient
            id={`${id}-floor`}
            x1="95"
            y1="410"
            x2="510"
            y2="460"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#a2afc7" stopOpacity="0" />
            <stop offset=".3" stopColor="#e2e9f6" stopOpacity=".25" />
            <stop offset=".58" stopColor="#ff0077" stopOpacity=".7" />
            <stop offset="1" stopColor="#ff0077" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="sculpture-grid">
          <path d="m300 281-239 186m239-186L138 502m162-221L228 520m72-239 72 239m-72-239 162 221m-162-221 239 186" />
          <ellipse cx="300" cy="416" rx="222" ry="63" />
          <ellipse cx="300" cy="416" rx="174" ry="49" />
          <ellipse cx="300" cy="416" rx="115" ry="32" />
        </g>
        <ellipse
          className="sculpture-platform"
          cx="300"
          cy="416"
          rx="192"
          ry="54"
          fill="#080a1059"
          stroke={`url(#${id}-floor)`}
        />
        <path
          className="sculpture-floor-light"
          d="M109 420c12 28 96 49 191 49s179-21 191-49"
          stroke={`url(#${id}-floor)`}
        />
      </svg>
      <div className="sculpture-reflection" aria-hidden="true" />
      <LiquidSculpture
        alt={t(
          'PAN’s crowned network, with pink connections between black stone servers',
          'Сеть PAN с короной и розовыми связями между серверами из чёрного камня',
        )}
      />
    </div>
  );
}
