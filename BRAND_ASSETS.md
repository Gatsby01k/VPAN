# PAN artwork and identity

The current hero is a bespoke render of a low graphite and smoked-glass nexus with pink liquid channels. It replaces the flat isometric server drawing at the owner's request. No crown, server tower or character appears in the illustration. The owner's crown remains part of the shared brand, navigation rail and favicon.

## Current production assets

- `PanLogo.tsx`: the owner's transparent crown artwork, framed by an SVG viewport. Used in the shared brand and navigation rail. `public/assets/pan-owner-logo.webp` preserves its original full canvas; `research/artwork/pan-owner-logo.png` preserves the source.
- `PanWordmark.tsx`: custom PAN vector lettering with shared angular cuts, open counters, a slight forward slant, a silver finish and a fine pink crossbar. The shared brand link supplies its accessible name.
- `public/favicon.svg`: self-contained rendering of the same owner-supplied logo.
- `PanCoreArtwork.tsx`: responsive SVG compositor on the homepage and partner covers. It shares one image between the material render and a static mask selecting its actual pink pixels.
- `public/assets/pan-nexus-render-v1.webp`: 1448 × 1086 transparent production render, 308 KiB.
- `public/assets/pan-nexus-social.webp`: 1200 × 630 social preview.
- `research/artwork/pan-nexus-original.png`: original output of the built-in ImageGen tool.
- `research/artwork/pan-nexus-motion.svg`: portable animated asset export for inspection.

Moving SVG caustics follow the three physical channels and the central liquid well. A colour-derived mask clips them to the existing pink liquid and reflections; the metal and silhouette stay stationary. Production motion starts only after hydration, while the artwork is in view and the document is visible. Reduced-motion preferences retain the complete material render. Observer and media-query listeners are cleaned up on teardown. No animation runs on the whole sculpture.

The current render was generated with the built-in ImageGen tool and a transparent background. Its alpha is preserved; Sharp only encodes production formats and renders the SVG compositor for inspection. The exact prompt, visual intent, motion geometry and checks are recorded in `research/PAN_NEXUS_ART.md`. The supplied owner logo is preserved separately and is not baked onto the sculpture.

## Preserved earlier sources

Earlier imagery is retained for provenance and recovery, not used as the current hero sculpture:

| Asset | Provenance |
| --- | --- |
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
