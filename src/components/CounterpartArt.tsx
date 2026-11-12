import { useId } from 'react';
import { preload } from 'react-dom';

const engravingAngles = Array.from({ length: 24 }, (_, index) => index * 7.5);

export function Engraving({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 300 300" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth=".45">
        {engravingAngles.map((angle) => (
          <ellipse
            key={angle}
            cx="150"
            cy="150"
            rx="138"
            ry="87"
            transform={`rotate(${angle} 150 150)`}
          />
        ))}
        <circle cx="150" cy="150" r="142" />
        <circle cx="150" cy="150" r="148" strokeDasharray=".9 3.4" />
      </g>
    </svg>
  );
}

export function HeroImpression() {
  const edge = useId();
  preload('/assets/editorial/hero.webp', { as: 'image', fetchPriority: 'high' });

  return (
    <svg className="hero-impression" viewBox="0 0 900 480" aria-hidden="true" fill="none">
      <defs>
        <clipPath id={edge}>
          <path d="M0 49l13-5 6 2 11-8 13 1 14-13 8 2 17-11 16-5 15 8 12-2 11 4 15-10h130l13 6 13-1 8 7 10-3 14 11 21 5 11-4 13 6 18-6 13 2 19-11 19 3 19-12 22-2l-2 12 7 2-3 10 5 8-12 18 4 13-7 13 6 10-6 14 9 12 5 18-4 14 12 10 1 13 16 10-3 9 13 12 6 14 9 5 4 18 19 15 5 12 13 8-3 14 16 18 5 18 15 11-1 12 14 18-4 14 10 17-6 9 11 20-2 13H0Z" />
        </clipPath>
      </defs>
      <image
        href="/assets/editorial/hero.webp"
        y="12"
        width="700"
        height="438"
        clipPath={`url(#${edge})`}
      />
      <path
        className="hero-thread-shadow"
        d="M449 82c34 10 12 55 45 79 27 20 3 47 29 63 52 32 161 27 302 25"
      />
      <path
        className="hero-thread-path"
        pathLength="1"
        d="M449 82c34 10 12 55 45 79 27 20 3 47 29 63 52 32 161 27 302 25"
      />
      <circle className="hero-thread-eye" cx="825" cy="249" r="4" />
    </svg>
  );
}
