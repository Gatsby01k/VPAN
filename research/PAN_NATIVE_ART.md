# PAN — historical native artwork redraw

Superseded by the rendered nexus described in `PAN_NEXUS_ART.md`. This records the former server drawing, preserved in Git and in the exported `pan-native-core` assets; it no longer describes `PanCoreArtwork.tsx` in production.

The owner asked for a new original graphic that belongs to the interface, with clearly visible pink flow. `PanCoreArtwork.tsx` is an authored SVG drawing, not a generated bitmap or a filter on the previous photograph.

## Design and behavior

- One isometric plane, a graphite hub with an engraved PAN crown, four partner nodes, inset pink channels, metal edges and local reflected glow.
- Broad 12-unit pink channels in a 640 × 480 viewBox. Four animated repeating gradients and two irregular filament layers per channel; cycles run between 2.5 and 3.2 seconds.
- SVG motion is enabled after hydration and only while visible, in an active document, with motion preferences allowing it. The drawing remains intact with motion disabled.
- The same source renders the homepage and partner covers. The previous WebGL implementation was removed.

## Deliverables

- `src/components/PanCoreArtwork.tsx` — production source.
- `public/assets/pan-native-core.svg` and `research/artwork/pan-native-core.svg` — standalone animated export for inspection, explicitly rendered in motion-on mode.
- `public/assets/pan-native-core.webp` — static 1200 × 630 social preview rendered from the vector source.
- `../PAN-native-core-preview.png` — rendered standalone art preview.
- `../PAN-native-core-motion.gif` — 80-frame, 20 fps standalone motion preview. Frames evaluate the same SVG animation attributes; this is not a website screenshot.

No ImageGen or edits to the owner's raster files were used in this revision. Sharp rendered the authored vectors and packaged the preview.

## Verification

SVG gradient and use references resolve; the motion export contains all 13 animation elements. The standalone drawing was rendered and visually inspected, including conduit endpoints and hub contact with its plinth. The motion preview was checked for visible frame differences. Production build prerendered 23 routes and the 16 existing tests passed. Full-page browser QA remains unavailable because local preview access was previously blocked by browser URL policy.
