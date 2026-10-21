import type { SVGProps } from 'react';

export const panLogoAsset = '/assets/pan-owner-logo.webp';

/** The owner's untouched transparent artwork, framed by an SVG viewport. */
export function PanLogo({ className = 'pan-logo', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={className}
      viewBox="240 180 722 851"
      width="36"
      height="43"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <image href={panLogoAsset} x="0" y="0" width="1200" height="1200" />
    </svg>
  );
}
