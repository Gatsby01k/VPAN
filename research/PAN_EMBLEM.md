# PAN — crown/A monogram

The owner asked to replace the photographic gold crown beside PAN with a refined iGaming-style brand mark. This revision redraws the symbol as native vector geometry, rather than reducing or retouching the old illustration. The supplied original remains preserved in `research/artwork/pan-owner-logo.png` and its optimized WebP.

## Design

- A bold three-point crown with a single connected body replaces the thin ball-tipped crown and its long drips.
- Negative space forms the letter A, including its counter, relating the emblem to PAN's custom lettering rather than placing another small crown inside a crown.
- The graphite lower edge and restrained faceting suggest material depth. Platinum faces share the wordmark's silver palette; a narrow champagne rim retains a trace of the earlier gold identity.
- One pink keystone connects the mark to the pink crossbar in PAN and the interface's liquid channels. No glitter, glow animation, cracks or small paint details are used.
- At desktop size, the 38 × 38 emblem's visible crown is approximately the cap height of the 88 × 31 wordmark. Compact variants are 34, 30 and 26 px square. Rail variants are 32, 25 and 22 px square.

## Files

`src/components/PanLogo.tsx` is the editable master in a 64 × 64 viewBox. Its gradients use component-local React IDs, so header, footer and rail instances cannot collide. The brand link supplies its accessible name and the decorative SVG remains hidden from assistive technology. `brand-identity.css` controls its responsive dimensions.

Exports are rendered from the same component and wordmark:

- `public/assets/pan-emblem.svg`: standalone vector master, about 1.7 KiB.
- `public/assets/pan-emblem.png`: transparent 512 × 512 PNG.
- `public/assets/pan-emblem-mono.svg`: flat white compound silhouette for dark backgrounds.
- `public/assets/pan-lockup.svg`: reusable emblem/PAN lockup.
- `public/assets/pan-lockup.png`: transparent 1104 × 320 lockup.
- `public/favicon.svg`: the same emblem on a rounded graphite tile for tab contrast on light and dark browser themes.
- `public/icons/pan-v2.svg`: the active SVG favicon at a fresh URL, avoiding the earlier cached `/favicon.svg` reference.
- `public/icons/pan-v2.ico`: embedded 16, 32 and 48 px images; also copied to the conventional `/favicon.ico` path.
- `public/icons/pan-v2-32.png`: PNG favicon fallback.
- `public/icons/pan-v2-192.png` and `pan-v2-apple-180.png`: opaque graphite mobile bookmark icons.
- `../PAN-emblem-preview.png`: standalone identity specimen showing the large lockup and smaller marks. This is an asset preview, not a browser screenshot.

No ImageGen or raster editing was used for this logo revision. Sharp renders the authored SVG into PNG. The original image is retained but no longer loaded by the active brand component. The hero sculpture and its animation are unchanged.

## Verification

Inspect the combined lettering, negative A and silhouette at 16, 24 and 32 px, as well as the desktop lockup. Verify that the export is self-contained, PNG transparency is preserved and IDs remain unique in prerendered brand instances. Build and route tests verify integration. Full-page browser visual inspection remains unavailable under the previously encountered browser URL policy.

The standalone size specimen was rendered and visually inspected. The master, lockup and favicon contain no raster images or external references; all gradient references resolve. Prerendered brand instances have distinct gradient IDs, the original photographic asset is absent from active HTML, and both PNG exports have transparent corners and visible artwork. The client/SSR build, 23 prerendered routes, changed-source formatting check and all 16 existing integration tests passed.

The favicon follow-up adds explicit SVG/ICO/PNG/Apple links to the shared HTML template, using new file paths so the browser requests the current mark. All icons are generated directly from the same vector tile. The browser theme colour matches its graphite background. No service worker or installation behavior is added.

The follow-up build passed. HTTP checks verified all six icon URLs return 200 with the expected image MIME types, and that home, inner-page and Russian responses include the new links. PNG dimensions and opaque mobile backgrounds were verified, as were all three embedded ICO sizes and the conventional fallback copy.
