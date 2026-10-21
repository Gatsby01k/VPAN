import { useId, type SVGProps } from 'react';

/** Crown and A share a single silhouette, drawn to match the PAN lettering. */
export function PanLogo({ className = 'pan-logo', ...props }: SVGProps<SVGSVGElement>) {
  const id = useId();
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      width="36"
      height="36"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient
          id={`${id}-metal`}
          x1="16"
          y1="7"
          x2="45"
          y2="54"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#faf7ef" />
          <stop offset=".3" stopColor="#e1e3e8" />
          <stop offset=".52" stopColor="#939ead" />
          <stop offset=".7" stopColor="#c9d0db" />
          <stop offset="1" stopColor="#647086" />
        </linearGradient>
        <linearGradient
          id={`${id}-edge`}
          x1="9"
          y1="17"
          x2="53"
          y2="49"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff9ec" />
          <stop offset=".5" stopColor="#c8b998" />
          <stop offset="1" stopColor="#647086" />
        </linearGradient>
        <linearGradient
          id={`${id}-rose`}
          x1="22"
          y1="47"
          x2="42"
          y2="47"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ff1686" />
          <stop offset=".55" stopColor="#ff65ab" />
          <stop offset="1" stopColor="#ed006b" />
        </linearGradient>
      </defs>
      <path
        d="m5 15 17 12L32 7l10 20 17-12-6 30-21 12-21-12Z"
        fill="#080b12"
        stroke="#8790a2"
        strokeOpacity=".2"
      />
      <path
        d="M5 13 22 25 32 5l10 20 17-12-6 30-21 12-21-12Zm18 29h7l2-7 2 7h7L32 23Zm6.5-8.5h5L32 28Z"
        fill={`url(#${id}-metal)`}
        fillRule="evenodd"
      />
      <path
        d="M5 13 22 25 32 5l10 20 17-12-6 30-21 12-21-12Z"
        stroke={`url(#${id}-edge)`}
        strokeWidth=".8"
        strokeLinejoin="round"
      />
      <path d="M5 13 15 39l10-10-3-4Z" fill="#fffaf0" opacity=".2" />
      <path d="m59 13-6 30-21 12v-7l15-9Z" fill="#172235" opacity=".22" />
      <path d="m13 42 19 10 19-10" stroke="#fff3d9" strokeOpacity=".45" strokeWidth=".8" />
      <path d="M23 46h18l-9 5Z" fill={`url(#${id}-rose)`} />
    </svg>
  );
}
