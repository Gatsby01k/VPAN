import { useEffect, useId, useRef, useState } from 'react';

const channels = [
  {
    d: 'M284 264C252 244 218 215 180 193',
    x: 284,
    y: 264,
    dx: -52,
    dy: -35.5,
    duration: '2.8s',
    delay: '-0.7s',
  },
  {
    d: 'M356 264C388 244 422 215 460 193',
    x: 356,
    y: 264,
    dx: 52,
    dy: -35.5,
    duration: '3.2s',
    delay: '-1.9s',
  },
  {
    d: 'M284 304C251 322 212 340 172 357',
    x: 284,
    y: 304,
    dx: -56,
    dy: 26.5,
    duration: '2.5s',
    delay: '-1.1s',
  },
  {
    d: 'M356 304C389 322 428 340 468 357',
    x: 356,
    y: 304,
    dx: 56,
    dy: 26.5,
    duration: '3s',
    delay: '-2.2s',
  },
];

/** Authored SVG architecture and liquid channels share one geometry. */
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
      viewBox="0 0 640 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={label}
      data-motion={animated ? 'on' : 'off'}
    >
      <defs>
        <linearGradient
          id={`${id}-top`}
          x1="290"
          y1="80"
          x2="355"
          y2="155"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#545c6b" />
          <stop offset=".4" stopColor="#252b38" />
          <stop offset="1" stopColor="#11141e" />
        </linearGradient>
        <linearGradient
          id={`${id}-left`}
          x1="260"
          y1="115"
          x2="332"
          y2="240"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#262c3a" />
          <stop offset=".45" stopColor="#10141f" />
          <stop offset="1" stopColor="#080b13" />
        </linearGradient>
        <linearGradient
          id={`${id}-right`}
          x1="320"
          y1="140"
          x2="383"
          y2="233"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#151a27" />
          <stop offset=".6" stopColor="#080b13" />
          <stop offset="1" stopColor="#27101f" />
        </linearGradient>
        <linearGradient
          id={`${id}-edge`}
          x1="268"
          y1="90"
          x2="380"
          y2="256"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#e5e9f1" stopOpacity=".85" />
          <stop offset=".28" stopColor="#7c869d" stopOpacity=".35" />
          <stop offset=".58" stopColor="#171c2b" />
          <stop offset="1" stopColor="#d34f8e" stopOpacity=".8" />
        </linearGradient>
        <linearGradient id={`${id}-rail`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#7f8295" />
          <stop offset=".25" stopColor="#313746" />
          <stop offset=".55" stopColor="#11151e" />
          <stop offset="1" stopColor="#080b13" />
        </linearGradient>
        <linearGradient
          id={`${id}-pod-top`}
          x1="-30"
          y1="-30"
          x2="25"
          y2="20"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#424a5a" />
          <stop offset=".6" stopColor="#212736" />
          <stop offset="1" stopColor="#121723" />
        </linearGradient>
        <linearGradient
          id={`${id}-pod-left`}
          x1="-34"
          y1="0"
          x2="2"
          y2="55"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#222a3b" />
          <stop offset="1" stopColor="#0b0f19" />
        </linearGradient>
        <linearGradient
          id={`${id}-pod-right`}
          x1="32"
          y1="0"
          x2="0"
          y2="50"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#151b2b" />
          <stop offset="1" stopColor="#0b0d17" />
        </linearGradient>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#f9e9bf" />
          <stop offset=".4" stopColor="#c5a56c" />
          <stop offset=".7" stopColor="#8b714c" />
          <stop offset="1" stopColor="#e5c390" />
        </linearGradient>
        <radialGradient id={`${id}-ambient`}>
          <stop stopColor="#ff0077" stopOpacity=".16" />
          <stop offset=".55" stopColor="#a72770" stopOpacity=".05" />
          <stop offset="1" stopColor="#ff0077" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-well`}>
          <stop stopColor="#ffe6f4" />
          <stop offset=".23" stopColor="#ff82bb" />
          <stop offset=".6" stopColor="#f50076" />
          <stop offset="1" stopColor="#4d0637" />
        </radialGradient>
        <filter
          id={`${id}-glow`}
          x="-60%"
          y="-80%"
          width="220%"
          height="260%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter
          id={`${id}-filament`}
          x="-15%"
          y="-25%"
          width="130%"
          height="150%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".045 .13"
            numOctaves="2"
            seed="8"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="3.8"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter id={`${id}-shadow`} x="-50%" y="-100%" width="200%" height="300%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <g id={`${id}-pod`}>
          <ellipse
            cx="0"
            cy="58"
            rx="42"
            ry="15"
            fill="#000"
            opacity=".35"
            filter={ref('shadow')}
          />
          <path
            d="M-34-15 0 3v49l-34-18Z"
            fill={ref('pod-left')}
            stroke="#727d9838"
            strokeWidth=".7"
          />
          <path
            d="M0 3 34-15v49L0 52Z"
            fill={ref('pod-right')}
            stroke="#727d9838"
            strokeWidth=".7"
          />
          <path
            d="M0-33 34-15 0 3-34-15Z"
            fill={ref('pod-top')}
            stroke="#b9c8e17a"
            strokeWidth=".7"
          />
          <path d="M0-26 22-15 0-4-22-15Z" fill="#0c101c" stroke="#8994ac44" strokeWidth=".7" />
          <path d="M0-22 15-15 0-8-15-15Z" fill="#3d1539" />
          <path
            d="m-26 1 18 9m-18 0 18 9m-18 0 18 9"
            stroke="#53617a"
            strokeOpacity=".5"
            strokeWidth="1"
          />
          <path d="m8 11 18-10v27L8 38Z" fill="#080c16" stroke="#8f4b7759" strokeWidth=".8" />
          <path
            d="m12 14 10-6m-10 13 10-6m-10 13 10-6"
            stroke="#ff288b"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path d="m-31 33 31 16 31-16" stroke="#ff4b9e" strokeOpacity=".5" strokeWidth=".9" />
          <path d="M0-32v7" stroke={ref('gold')} strokeWidth="1.5" />
          <circle cx="0" cy="-15" r="2.3" fill="#ffa5d1" />
        </g>
        {channels.map((channel, index) => (
          <linearGradient
            key={index}
            id={`${id}-flow-${index}`}
            x1={channel.x}
            y1={channel.y}
            x2={channel.x + channel.dx}
            y2={channel.y + channel.dy}
            gradientUnits="userSpaceOnUse"
            spreadMethod="repeat"
          >
            <stop stopColor="#94034f" />
            <stop offset=".18" stopColor="#ff0784" />
            <stop offset=".35" stopColor="#ffabd1" />
            <stop offset=".42" stopColor="#ff349d" />
            <stop offset=".68" stopColor="#dd0066" />
            <stop offset=".83" stopColor="#ff69b3" />
            <stop offset="1" stopColor="#94034f" />
            {animated ? (
              <animateTransform
                attributeName="gradientTransform"
                type="translate"
                from="0 0"
                to={`${channel.dx} ${channel.dy}`}
                dur={channel.duration}
                begin={channel.delay}
                repeatCount="indefinite"
              />
            ) : null}
          </linearGradient>
        ))}
      </defs>
      <ellipse cx="320" cy="301" rx="293" ry="169" fill={ref('ambient')} />
      <path d="m320 154 248 128-248 137L72 282Z" fill="#0f142180" stroke="#73819c12" />
      <path d="m320 183 194 100-194 107L126 283Z" stroke="#9ba7c516" />
      <path d="m320 213 143 72-143 79-143-79Z" stroke="#9ba7c512" />
      <path d="M72 282h496M320 154v265" stroke="#9ba7c50c" />
      <use href={`#${id}-pod`} transform="translate(150 157)" />
      <use href={`#${id}-pod`} transform="translate(490 157)" />
      {channels.map((channel, index) => (
        <g key={index}>
          <path
            d={channel.d}
            transform="translate(0 5)"
            stroke="#000"
            strokeOpacity=".55"
            strokeWidth="29"
            strokeLinecap="round"
          />
          <path d={channel.d} stroke={ref('rail')} strokeWidth="26" strokeLinecap="round" />
          <path d={channel.d} stroke="#330b25" strokeWidth="18" strokeLinecap="round" />
          <path
            d={channel.d}
            stroke="#ff0077"
            strokeWidth="21"
            opacity=".38"
            filter={ref('glow')}
          />
          <path
            d={channel.d}
            stroke={ref(`flow-${index}`)}
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d={channel.d}
            transform="translate(0 -5)"
            stroke="#ffb2d4"
            strokeOpacity=".42"
            strokeWidth=".8"
          />
          <path
            d={channel.d}
            pathLength="100"
            stroke="#fff0f8"
            strokeWidth="2.2"
            strokeDasharray="9 24 3 64"
            strokeDashoffset="0"
            strokeLinecap="round"
            opacity=".85"
            filter={ref('filament')}
          >
            {animated ? (
              <animate
                attributeName="stroke-dashoffset"
                from="100"
                to="0"
                dur={channel.duration}
                begin={channel.delay}
                repeatCount="indefinite"
              />
            ) : null}
          </path>
          <path
            d={channel.d}
            transform="translate(0 2)"
            pathLength="100"
            stroke="#ffd0e5"
            strokeWidth="1"
            strokeDasharray="4 18 8 70"
            strokeDashoffset="42"
            strokeLinecap="round"
            opacity=".6"
          >
            {animated ? (
              <animate
                attributeName="stroke-dashoffset"
                from="142"
                to="42"
                dur={`${3.4 + index * 0.3}s`}
                begin={channel.delay}
                repeatCount="indefinite"
              />
            ) : null}
          </path>
        </g>
      ))}
      <ellipse cx="320" cy="318" rx="105" ry="33" fill="#000" opacity=".5" filter={ref('shadow')} />
      <path d="m320 224 100 51v24l-100 56-100-56v-24Z" fill="#0c101b" stroke="#78839e2e" />
      <path d="m320 224 100 51-100 56-100-56Z" fill={ref('top')} stroke="#a6b0c54d" />
      <path
        d="m229 281 91 49 91-49v8l-91 51-91-51Z"
        fill="#d70067"
        opacity=".65"
        filter={ref('glow')}
      />
      <path d="m229 281 91 49 91-49" stroke="#ff69ae" strokeWidth="1.6" />
      <path d="m320 239 70 36-70 39-70-39Z" fill="#0c101c" stroke="#9ba8c54d" />
      <g transform="translate(0 24)">
        <path
          d="m261 108 59 29v114l-59-29Z"
          fill={ref('left')}
          stroke={ref('edge')}
          strokeWidth="1.1"
        />
        <path
          d="m320 137 59-29v114l-59 29Z"
          fill={ref('right')}
          stroke={ref('edge')}
          strokeWidth="1.1"
        />
        <path
          d="m320 80 59 28-59 29-59-29Z"
          fill={ref('top')}
          stroke={ref('edge')}
          strokeWidth="1.1"
        />
        <path d="m320 89 40 19-40 20-40-20Z" fill="#0b0f1b" stroke="#c2b7cd55" />
        <ellipse cx="320" cy="109" rx="21" ry="10" fill={ref('well')} />
        <ellipse
          cx="320"
          cy="109"
          rx="27"
          ry="13"
          fill="#ff0077"
          opacity=".25"
          filter={ref('glow')}
        >
          {animated ? (
            <animate
              attributeName="opacity"
              values=".2;.4;.2"
              dur="3.6s"
              repeatCount="indefinite"
            />
          ) : null}
        </ellipse>
        <path d="m267 114 47 24v105m13-103 45-23v100" stroke="#c3cbdd" strokeOpacity=".16" />
        <path
          d="m273 139 30 15m-30-2 30 15m-30-2 30 15m-30 8 30 15m-30-2 30 15"
          stroke="#717f9f"
          strokeOpacity=".45"
          strokeWidth="1.4"
        />
        <path d="m273 178 30 15" stroke="#ff4d9d" strokeWidth="2.3" strokeLinecap="round" />
        <path
          d="m273 178 30 15"
          stroke="#ff0077"
          strokeWidth="6"
          opacity=".45"
          filter={ref('glow')}
        />
        <g
          transform="matrix(.78 -.38 0 .78 334 161)"
          stroke={ref('gold')}
          strokeWidth="2"
          strokeLinejoin="round"
        >
          <path d="m5 13 8 7 8-16 8 16 10-7-5 18H10L5 13Z" />
          <path d="M11 35h22" />
          <circle cx="4" cy="10" r="1.5" fill={ref('gold')} stroke="none" />
          <circle cx="21" cy="3" r="1.5" fill={ref('gold')} stroke="none" />
          <circle cx="40" cy="10" r="1.5" fill={ref('gold')} stroke="none" />
        </g>
        <path d="m338 210 25-12" stroke="#818ca8" strokeOpacity=".4" />
        <path d="m338 216 15-7" stroke="#ff54a3" strokeWidth="2" strokeLinecap="round" />
        <path d="m269 224 51 26 51-26" stroke="#ff579f" strokeWidth="1.3" />
        <path d="M320 139v108" stroke="#d2c8d3" strokeOpacity=".12" />
      </g>
      <use href={`#${id}-pod`} transform="translate(140 324) scale(1.06)" />
      <use href={`#${id}-pod`} transform="translate(500 324) scale(1.06)" />
      <path d="M91 420h25m408 0h25" stroke="#8f9cba" strokeOpacity=".25" />
      <circle cx="320" cy="407" r="2" fill="#ff559f" opacity=".7" />
    </svg>
  );
}
