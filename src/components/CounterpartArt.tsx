import { useEffect, useId, useRef } from 'react';
import { preload } from 'react-dom';

const engravingAngles = Array.from({ length: 24 }, (_, index) => index * 7.5);

// Native details borrow the engraved brass and cord from the original plates.
export function CounterSeal({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="60" cy="60" r="55" stroke="currentColor" strokeWidth=".7" />
      <circle cx="60" cy="60" r="51" stroke="currentColor" strokeWidth="2" strokeDasharray=".6 3" />
      <g transform="translate(18 18) scale(.28)">
        <Engraving />
      </g>
      <circle
        cx="60"
        cy="60"
        r="27"
        fill="var(--counter-paper)"
        stroke="currentColor"
        strokeWidth=".7"
      />
      <path
        d="m44 44 16 34 16-34M40 44h15m10 0h15m-33 2 13 28 13-28"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M2 72c15 0 13 20 31 16 13-3 9-13 19-13"
        stroke="var(--counter-mark)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="53" cy="75" r="2.5" fill="var(--counter-paper)" stroke="var(--counter-mark)" />
    </svg>
  );
}

const stitchPaths = [
  'M7 18h7m8 0h7M18 7v7m0 8v7',
  'M6 18h8m8 0h8M14 15l4 4 9-10',
  'M6 18h7m10 0h7M13 18c0-10 10-10 10 0s-10 10-10 0Z',
  'M5 18h26M12 13l5 5-5 5m9-10 5 5-5 5',
];

export function StitchMark({ stage }: { stage: number }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" aria-hidden="true" focusable="false">
      <circle cx="18" cy="18" r="16" stroke="currentColor" strokeWidth=".65" />
      {stage === 0 && <circle cx="18" cy="18" r="4" stroke="currentColor" strokeWidth="1.1" />}
      <path
        d={stitchPaths[stage]}
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
  const artwork = '/assets/editorial/hero.webp';
  preload(artwork, { as: 'image', fetchPriority: 'high' });

  return (
    <svg
      className="hero-impression"
      viewBox="0 0 575 452"
      aria-hidden="true"
      fill="none"
      data-page-art={artwork}
    >
      <defs>
        <clipPath id={edge}>
          <path d="M0 12H495l-2 8 3 3-6 7 3 8-11 14 3 12-6 12 4 10-5 11 4 12-3 14 7 12-1 9 8 12-2 9 10 12 1 10 8 9-3 8 12 12 2 11 11 8-1 10 14 12 3 12 10 9-1 10 12 13 3 11 10 8v140H0Z" />
        </clipPath>
      </defs>
      <image href={artwork} y="12" width="700" height="438" clipPath={`url(#${edge})`} />
      <path
        className="hero-thread-shadow"
        d="M449 82c25 2 36 15 33 39-4 29-21 33-20 16 1-21 39-26 54-3 10 16 20 19 46 15"
      />
      <path
        className="hero-thread-path"
        pathLength="1"
        d="M449 82c25 2 36 15 33 39-4 29-21 33-20 16 1-21 39-26 54-3 10 16 20 19 46 15"
      />
      <circle className="hero-thread-eye" cx="562" cy="149" r="4" />
    </svg>
  );
}

// The eyelet lives inside the illustration, while the perforations follow the live text layout.
export function CoverTicketThreads() {
  const overlay = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = overlay.current;
    const spread = svg?.parentElement;
    const eyelet = spread?.querySelector('.hero-thread-eye');
    const tickets = spread?.querySelectorAll<HTMLElement>('.thread-ticket');
    if (!svg || !spread || !eyelet || !tickets?.length || typeof ResizeObserver === 'undefined')
      return;

    const draw = () => {
      const frame = svg.getBoundingClientRect();
      if (!frame.width) return;
      const eye = eyelet.getBoundingClientRect();
      const x = eye.left + eye.width / 2 - frame.left;
      const y = eye.top + eye.height / 2 - frame.top;
      const seam = (x + tickets[0].getBoundingClientRect().left - frame.left) / 2;
      tickets.forEach((link) => {
        const rect = link.getBoundingClientRect();
        const left = rect.left - frame.left;
        const right = rect.right - frame.left;
        const mid = rect.top - frame.top + rect.height / 2;
        const top = rect.top - frame.top - 9;
        const curve =
          link.dataset.intent === 'need'
            ? `M${x} ${y} C${seam + 18} ${y},${seam - 28} ${mid},${left + 2} ${mid}`
            : `M${x} ${y} C${seam + 18} ${y},${seam - 18} ${top},${seam + 34} ${top} H${right - 15} Q${right + 10} ${top},${right + 10} ${top + 19} V${mid - 11} Q${right + 10} ${mid},${right - 2} ${mid}`;
        svg.querySelector(`[data-thread="${link.dataset.intent}"]`)?.setAttribute('d', curve);
      });
    };
    const observer = new ResizeObserver(draw);
    observer.observe(spread);
    spread
      .querySelectorAll('.world-cover-title, .world-cover-invitation, .thread-ticket')
      .forEach((element) => observer.observe(element));
    draw();
    return () => observer.disconnect();
  }, []);
  return (
    <svg ref={overlay} className="cover-ticket-threads" aria-hidden="true" focusable="false">
      <path data-thread="need" pathLength="1" />
      <path data-thread="offer" pathLength="1" />
    </svg>
  );
}
