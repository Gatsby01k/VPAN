import { useId, type SVGProps } from 'react';

/** Custom PAN lettering: dense forms, open counters and a shared chamfer. */
export function PanWordmark({
  className = 'brand-word brand-wordmark',
  ...props
}: SVGProps<SVGSVGElement>) {
  const id = useId();
  return (
    <svg
      className={className}
      viewBox="0 0 168 58"
      width="88"
      height="31"
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient id={`${id}-type`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#ffffff" />
          <stop offset=".52" stopColor="#f1f0f5" />
          <stop offset="1" stopColor="#b7c0d1" />
        </linearGradient>
      </defs>
      <g transform="translate(7 1) skewX(-5)" fill={`url(#${id}-type)`} fillRule="evenodd">
        <path d="M0 56V0h31l15 12v16L34 39H14v17Zm14-44v15h15l3-4v-7l-4-4Z" />
        <path d="M50 56 67 0h18l18 56H87l-3-12H66l-3 12Zm20-25h10l-5-18Z" />
        <path d="M109 56V0h14l22 32V0h14v56h-14l-22-33v33Z" />
        <path d="M67 40h16l.7 2.4H66.3Z" fill="#ff278b" />
      </g>
    </svg>
  );
}
