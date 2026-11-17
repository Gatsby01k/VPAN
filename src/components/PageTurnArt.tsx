import { useId } from 'react';
import { Engraving } from './CounterpartArt';
import './page-turn.css';

const leaf = 'M5 35C22 22 55 4 83 8c25 3 49 14 49 32s-24 29-49 32C55 76 22 58 5 45c-4-3-4-7 0-10Z';

export function PageTurnArt() {
  const stamp = useId();

  return (
    <div className="page-turn" aria-hidden="true" inert>
      {['left', 'right'].map((side) => {
        const metal = stamp + side;
        const pattern = metal + '-pattern';
        return (
          <div className={`page-turn-panel page-turn-${side}`} key={side}>
            <div className="page-turn-impression">
              <Engraving />
            </div>
            <svg className="page-turn-clasp" viewBox="0 0 160 80" focusable="false">
              <defs>
                <linearGradient id={metal} x1="8%" y1="0%" x2="80%" y2="100%">
                  <stop offset="0" stopColor="#ffdf92" />
                  <stop offset=".22" stopColor="#ac7235" />
                  <stop offset=".43" stopColor="#e8b764" />
                  <stop offset=".67" stopColor="#6c421e" />
                  <stop offset=".88" stopColor="#d4a45d" />
                  <stop offset="1" stopColor="#593318" />
                </linearGradient>
                <clipPath id={pattern}>
                  <path d={leaf} />
                </clipPath>
              </defs>
              <g clipPath={`url(#${pattern})`}>
                <path d={leaf} fill={`url(#${metal})`} />
                <path d={leaf} fill="none" stroke="#ffe4a9" strokeWidth="3" />
                <g transform="translate(8 4) scale(.87 .9)">
                  <path d={leaf} fill="#2c2014" stroke="#d7a75e" strokeWidth="1.8" />
                  <g transform="translate(11 -20) scale(.42)">
                    <Engraving />
                  </g>
                  <path
                    d="M16 35C47 18 79 11 113 34M16 45c31 17 63 24 97 1"
                    fill="none"
                    stroke="#c2914b"
                    strokeWidth=".7"
                  />
                  {side === 'left' && (
                    <path
                      d="m60 26 12 30 12-30M55 26h12m11 0h12"
                      fill="none"
                      stroke="#efd099"
                      strokeWidth="2"
                    />
                  )}
                </g>
                <circle
                  cx="115"
                  cy="40"
                  r="10.4"
                  fill={`url(#${metal})`}
                  stroke="#f6d193"
                  strokeWidth="1"
                />
                <circle
                  cx="115"
                  cy="40"
                  r="6.4"
                  fill="#170f0c"
                  stroke="#744218"
                  strokeWidth="1.8"
                />
                <path d="M9 36C38 17 61 9 83 12" fill="none" stroke="#ffdf9f" strokeWidth=".7" />
              </g>
              <path className="page-turn-thread-under" d="M115 40c10 0 18 0 29 0" pathLength="1" />
              <path className="page-turn-thread" d="M115 40c10 0 18 0 29 0" pathLength="1" />
              <path className="page-turn-thread-light" d="M115 39c10 0 18 0 29 0" pathLength="1" />
            </svg>
            <span className="page-turn-seam" />
          </div>
        );
      })}
    </div>
  );
}
