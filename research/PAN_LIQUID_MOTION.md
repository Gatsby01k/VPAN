# PAN — liquid channels and copy refinement

## Current motion

Removed cursor parallax, artwork entrance, sweeping specular highlight, floating labels, oversized background monogram, animated vector dashes, calibration rotation and logo reveal/sheen. The sculpture is stationary and its crown is no longer clipped by negative top positioning.

`LiquidSculpture.tsx` keeps the original accessible image as the default rendering. `liquid-flow.ts` adds a WebGL effect only when available and motion is allowed. The shader detects the original pink hue, follows the four actual conduit directions, advects two scales of fluid noise, refracts the existing channel texture and adds restrained local emission/reflection. It preserves the original alpha and does not move the silhouette. No asset was regenerated or edited.

The effect is capped at 30 fps, with bounded resolution. Intersection and document visibility pause it when unnecessary. Reduced motion, initialization failure and context loss retain the original image. Program, texture, buffer, observers and listeners are cleaned up on teardown.

## Copy

Updated the bilingual hero, descriptive lead, all five short role descriptions, role-specific calls to action, partnership directions, regional section, process, brief prompt, navigation label and footer invitation. Copy describes connections, payment methods, market experience and the next step; it introduces no fees, conversion rates, guaranteed availability or unsupported performance claims.

## Validation

- TypeScript and production build passed; 23 routes prerendered.
- All 16 existing integration tests passed.
- Equivalent GLSL 1.20 vertex/fragment shaders compiled and linked in an offline macOS OpenGL context. This checks shader syntax and numerical behavior, not browser compatibility or layout.
- Numerical fixtures at t=0 and t=1.7 seconds: gold `(220,161,43,255)` and stone `(25,28,31,255)` remained identical; pink changed `(248,11,115,255)` → `(255,16,132,255)`; alpha 127 remained 127; transparent pixels remained transparent.
- Fresh browser visual QA remains unavailable because local preview access was blocked by browser URL policy. No new screenshot or full WebGL browser-compatibility claim is made.
