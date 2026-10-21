import { useEffect, useId, useRef, useState } from 'react';

export const panNexusAsset = '/assets/pan-nexus-render-v1.webp';

// These caustic paths follow the three physical channels in the render.
const channels = [
  {
    path: 'M650 525C580 598 480 661 358 703',
    x: 650,
    y: 525,
    dx: -120,
    dy: 64,
    duration: '3.2s',
    delay: '-1.8s',
  },
  {
    path: 'M905 538C978 612 1072 671 1175 708',
    x: 905,
    y: 538,
    dx: 120,
    dy: 70,
    duration: '3.2s',
    delay: '-3s',
  },
  {
    path: 'M927 300C1017 284 1090 239 1188 201',
    x: 927,
    y: 300,
    dx: 120,
    dy: -48,
    duration: '6.4s',
    delay: '-.9s',
  },
] as const;

/** Rendered materials, with moving caustics confined to the actual pink liquid. */
export function PanCoreArtwork({
  label,
  motion = 'auto',
}: {
  label: string;
  motion?: 'auto' | 'on' | 'off';
}) {
  const id = useId();
  const root = useRef<SVGSVGElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (motion !== 'auto') return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const sync = () => setActive(visible && !document.hidden && !preference.matches);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    if (root.current) observer.observe(root.current);
    preference.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect();
      preference.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [motion]);
  const animated = motion === 'on' || (motion === 'auto' && active);
  const ref = (name: string) => `url(#${id}-${name})`;

  return (
    <svg
      ref={root}
      className="pan-core-artwork"
      viewBox="0 75 1448 930"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={label}
      data-motion={animated ? 'on' : 'off'}
    >
      <defs>
        <image id={`${id}-render`} href={panNexusAsset} width="1448" height="1086" />
        <radialGradient id={`${id}-ground`}>
          <stop stopColor="#ff0077" stopOpacity=".09" />
          <stop offset="1" stopColor="#ff0077" stopOpacity="0" />
        </radialGradient>
        {animated ? (
          <>
            <filter
              id={`${id}-liquid-pixels`}
              x="0"
              y="0"
              width="100%"
              height="100%"
              colorInterpolationFilters="sRGB"
            >
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  2.8 -3.2 .7 0 -.55"
                result="pink"
              />
              <feComposite in="pink" in2="SourceGraphic" operator="in" />
            </filter>
            <mask
              id={`${id}-liquid`}
              maskUnits="userSpaceOnUse"
              x="0"
              y="75"
              width="1448"
              height="930"
            >
              <use href={`#${id}-render`} filter={ref('liquid-pixels')} />
            </mask>
            <filter
              id={`${id}-liquid-current`}
              filterUnits="userSpaceOnUse"
              x="-260"
              y="-260"
              width="1968"
              height="1606"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency=".018 .032"
                numOctaves="2"
                seed="8"
                result="water"
              />
              <feOffset in="water" result="current">
                <animate
                  attributeName="dx"
                  values="-120;120;-120"
                  keyTimes="0;.5;1"
                  calcMode="spline"
                  keySplines=".45 0 .55 1;.45 0 .55 1"
                  dur="6.4s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="dy"
                  values="-64;64;-64"
                  keyTimes="0;.5;1"
                  calcMode="spline"
                  keySplines=".45 0 .55 1;.45 0 .55 1"
                  dur="6.4s"
                  repeatCount="indefinite"
                />
              </feOffset>
              <feDisplacementMap
                in="SourceGraphic"
                in2="current"
                scale="36"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
            <filter
              id={`${id}-caustic`}
              x="-20%"
              y="-35%"
              width="140%"
              height="170%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency=".025 .055"
                numOctaves="2"
                seed="12"
                result="texture"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="texture"
                scale="22"
                xChannelSelector="R"
                yChannelSelector="G"
              />
              <feGaussianBlur stdDeviation="2.5" />
            </filter>
            <linearGradient
              id={`${id}-swirl`}
              x1="-210"
              y1="-130"
              x2="210"
              y2="130"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#ff6aad" stopOpacity="0" />
              <stop offset=".36" stopColor="#ff81bc" stopOpacity="0" />
              <stop offset=".5" stopColor="#fff4fa" stopOpacity=".9" />
              <stop offset=".65" stopColor="#ff75b6" stopOpacity=".12" />
              <stop offset="1" stopColor="#ff75b6" stopOpacity="0" />
            </linearGradient>
            {channels.map((channel, index) => (
              <linearGradient
                key={channel.path}
                id={`${id}-flow-${index}`}
                x1={channel.x}
                y1={channel.y}
                x2={channel.x + channel.dx}
                y2={channel.y + channel.dy}
                gradientUnits="userSpaceOnUse"
                spreadMethod="repeat"
              >
                <stop stopColor="#ff75b6" stopOpacity="0" />
                <stop offset=".23" stopColor="#ff75b6" stopOpacity="0" />
                <stop offset=".42" stopColor="#ffe3f2" stopOpacity=".6" />
                <stop offset=".5" stopColor="#fff5fa" stopOpacity=".1" />
                <stop offset=".64" stopColor="#fff5fa" stopOpacity=".75" />
                <stop offset=".83" stopColor="#ff75b6" stopOpacity="0" />
                <stop offset="1" stopColor="#ff75b6" stopOpacity="0" />
                <animateTransform
                  attributeName="gradientTransform"
                  type="translate"
                  from="0 0"
                  to={`${channel.dx} ${channel.dy}`}
                  dur={channel.duration}
                  begin={channel.delay}
                  repeatCount="indefinite"
                />
              </linearGradient>
            ))}
          </>
        ) : null}
      </defs>
      <ellipse cx="760" cy="818" rx="625" ry="180" fill={ref('ground')} />
      <use href={`#${id}-render`} />
      {animated ? (
        <g mask={ref('liquid')} className="pan-nexus-caustics">
          <use href={`#${id}-render`} filter={ref('liquid-current')} opacity=".96" />
          {channels.map((channel, index) => (
            <path
              key={channel.path}
              d={channel.path}
              stroke={ref(`flow-${index}`)}
              strokeWidth="112"
              strokeLinecap="round"
              opacity=".8"
              filter={ref('caustic')}
            />
          ))}
          <g transform="translate(776 395) scale(1 .47)">
            <g>
              <path
                d="M-173-72a187 187 0 0 1 337 165"
                stroke={ref('swirl')}
                strokeWidth="64"
                opacity=".72"
              />
              <path
                d="M-112 74a135 135 0 0 1 225-148"
                stroke={ref('swirl')}
                strokeWidth="40"
                opacity=".6"
              />
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0"
                to="360"
                dur="6.4s"
                repeatCount="indefinite"
              />
            </g>
          </g>
        </g>
      ) : null}
    </svg>
  );
}
