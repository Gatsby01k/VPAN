# PAN artwork and identity

The current main artwork is an original, code-authored SVG in `src/components/PanCoreArtwork.tsx`. It shares the graphite, smoked glass, owner's gold-and-pink crown logo and hot pink (#ff0077) of the interface. Its isometric hub, four partner nodes, plinth and conduits use one perspective. No humanoid character appears.

## Current production assets

- `PanLogo.tsx`: the owner's exact transparent crown artwork, framed by an SVG viewport. Used in the shared brand, navigation rail, network instrument and core artwork. `public/assets/pan-owner-logo.webp` preserves its original full canvas; `research/artwork/pan-owner-logo.png` preserves the source. No generated substitute or outline crown is used.
- `PanWordmark.tsx`: custom PAN vector lettering with shared angular cuts, open counters, a slight forward slant, a silver finish and a fine pink crossbar. The shared brand link supplies its accessible name.
- `public/favicon.svg`: self-contained rendering of the same owner-supplied logo.
- `PanCoreArtwork.tsx`: inline responsive SVG on the homepage and partner covers. The geometry itself contains the channels; no raster extraction or WebGL is used.
- `public/assets/pan-native-core.svg`: standalone animated export for inspection.
- `public/assets/pan-native-core.webp`: static 1200 × 630 rendering for social previews.
- `research/artwork/pan-native-core.svg`: preserved source export.

Native SVG gradients and two filament layers per channel create visible pink flow. Production motion starts only after hydration, while the artwork is in view and the document is visible. Reduced-motion preferences retain the stationary drawing. Observer and media-query listeners are cleaned up on teardown. Artwork geometry remains stationary.

The original user artwork suggested the palette and crowned-network theme. At the owner's explicit request, the current graphic was redrawn to belong to the interface. No ImageGen or raster editing was used for this redraw. The subsequently supplied official logo replaces the former generic crown glyph, retaining its cracks, black emblem and pink drips. Sharp rendered the standalone vector previews; see `research/PAN_NATIVE_ART.md` and `research/PAN_BRAND_IDENTITY.md`.

## Preserved earlier sources

Earlier imagery is retained for provenance and recovery, not used as the current hero sculpture:

| Asset | Provenance |
| --- | --- |
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
