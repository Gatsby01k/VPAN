# PAN artwork and identity

The current hero is a bespoke render of a low graphite and smoked-glass nexus with pink liquid channels. It replaces the flat isometric server drawing at the owner's request. No crown, server tower or character appears in the illustration. A custom crown/A monogram appears in the shared brand, navigation rail and favicon.

## Current production assets

- `PanLogo.tsx`: code-authored crown/A monogram. A bold three-point silhouette, an A cutout, graphite lower edge, platinum faces, a restrained champagne rim and a pink keystone match the custom PAN lettering. No raster image, dripping paint, cracks, orb tips or animation are used.
- `public/assets/pan-emblem.svg` and `pan-emblem.png`: standalone 64-unit vector master and transparent 512 × 512 PNG.
- `public/assets/pan-emblem-mono.svg`: single-colour white mark for dark backgrounds.
- `public/assets/pan-lockup.svg` and `pan-lockup.png`: emblem and PAN wordmark as a transparent reusable logo.
- `PanWordmark.tsx`: custom PAN vector lettering with shared angular cuts, open counters, a slight forward slant, a silver finish and a fine pink crossbar. The shared brand link supplies its accessible name.
- `public/favicon.svg`: the vector emblem on a rounded graphite tile, with no embedded raster data or external dependency.
- `public/icons/pan-v2.*`, `pan-v2-32.png`, `pan-v2-192.png`, `pan-v2-apple-180.png`: versioned SVG, multi-size ICO, PNG browser fallback and mobile bookmark icons linked from every page. Distinct URLs replace the browser's cached old favicon. `public/favicon.ico` supplies the conventional fallback URL; the mobile PNGs have an opaque graphite background.
- `PanCoreArtwork.tsx`: responsive SVG compositor on the homepage and partner covers. It shares one image between the material render and a static mask selecting its actual pink pixels.
- `public/assets/pan-nexus-render-v1.webp`: 1448 × 1086 transparent production render, 308 KiB.
- `public/assets/pan-nexus-social.webp`: 1200 × 630 social preview.
- `research/artwork/pan-nexus-original.png`: original output of the built-in ImageGen tool.
- `research/artwork/pan-nexus-motion.svg`: portable animated asset export for inspection.

Moving SVG displacement changes the liquid's texture, and caustics follow the three physical channels and the central liquid well. A colour-derived mask clips both to the existing pink liquid and reflections; the metal and silhouette stay stationary. A continuous noise field avoids tile seams. Motion shares a 6.4-second cycle. Production motion starts only after hydration, while the artwork is in view and the document is visible. Reduced-motion preferences retain the complete material render. Observer and media-query listeners are cleaned up on teardown. No animation runs on the whole sculpture.

`console.css` keeps the heading, illustration and entry card in three separate grid rows. The illustration has its own minimum height and contained SVG viewport; the card participates in normal flow. Manrope is self-hosted for English and Russian headings, with Inter for body copy and controls. The first-screen copy uses a two-line headline, a readable explanation and a compact role entry.

The current hero render was generated with the built-in ImageGen tool and a transparent background. Its alpha is preserved; Sharp only encodes production formats and renders the SVG compositor for inspection. The exact prompt, visual intent, motion geometry and checks are recorded in `research/PAN_NEXUS_ART.md`. The crown/A mark is native vector artwork, redrawn after the owner rejected the earlier photographic crown in the header; see `research/PAN_EMBLEM.md`. The supplied owner logo remains preserved separately and is not baked onto the sculpture.

## Preserved earlier sources

Earlier imagery is retained for provenance and recovery, not used as the current hero sculpture:

| Asset | Provenance |
| --- | --- |
| `pan-owner-logo.webp`, `research/artwork/pan-owner-logo.png` | Original supplied gold crown and its optimized version, superseded in the brand by the crown/A monogram at the owner's request. |
| `pan-native-core.svg`, `pan-native-core.webp` | Superseded code-authored server diagram. See historical `research/PAN_NATIVE_ART.md`. |
| `pan-core-cutout-v2.webp` | Earlier ImageGen extraction of supplied `king traffic.PNG`. |
| `pan-atmosphere-v2.webp` | Earlier ImageGen composition from supplied `pan background #4.PNG` and `pan background #5.PNG`. |
| `pan-network-core.webp` | Prepared version of supplied `king traffic.PNG`. |
| `pan-monolith.webp` | Prepared version of supplied `pan background #4.PNG`. |
| `pan-faultline.webp` | Prepared version of supplied `pan background #5.PNG`. |
| `pan-foundation.webp` | Prepared version of supplied `pan background #1.PNG`. |
| `dark-plate.webp` | Existing optimized artwork matching supplied `pan background #3.PNG`. |
| `hero-landscape.webp` | Existing optimized artwork matching supplied `pan background #5.PNG`. |

Full-resolution earlier outputs and prompts remain in `research/artwork` and `research/PAN_IMAGE_PROCESSING.md`. The previous WebGL enhancement was removed; its validation notes remain historical in `research/PAN_LIQUID_MOTION.md`.

`pan-mascot.webp` is an unused historical adaptation of the owner's `logo.PNG`. The owner requested removal of that character. Do not reintroduce it into the interface or social previews.

## Interaction and identity

Role selection updates the proposition, application action and adjacent vector instrument. Numerical modules reflect the real market and role catalogue. Brief and application behavior remains unchanged. The VlaDDoS signature is the owner's extracted lettering beside PAN, with static pink treatment and hover/focus lighting; its entrance and repeating sheen were removed at the owner's request.
