# Counterpart finishing — 18 November 2026

This pass extends the existing VlaDDoS paper, engraved brass, matte black canvas and fuchsia cord. The original hero, knot, physical thread, atlas and exchange artwork remain the foundation.

## Changes

- Three new illustrated partner folios: engraved connection clasps for infrastructure, a brass doorway for market access, and a folded map with a compass for local knowledge.
- Each folio retains its existing role-specific brief route and language context. Descriptions remain live HTML.
- On desktop the folios form a staggered printed composition. On small screens they become three compact illustrated rows.
- Paper borders, clipped corners, brass eyelets, small printed captions and a light reflection respond to hover and keyboard focus.
- Hero tickets have clearer labels and warmer active surfaces. A short colophon completes the desktop cover.
- Native SVG engravings replace decorative procedure numbers, with a V seal alongside the heading.
- A thin fuchsia reading line uses a native CSS scroll timeline where supported. Reduced-motion mode disables it.
- Images are lazy loaded with explicit dimensions and responsive 600px / 1200px sources.

## Asset provenance

Generated using the built-in ImageGen tool, with the existing `hero.webp` and `exchange.webp` as style references. The output images were inspected and exported with macOS `sips` into JPEGs at 1200px and 600px. No existing artwork was overwritten. The map is a decorative imagined composition, not a geographical claim.

Saved in `public/assets/editorial/`:
- `counterpart-clasps-v1.jpg` and `counterpart-clasps-v1-600.jpg`
- `counterpart-doorway-v1.jpg` and `counterpart-doorway-v1-600.jpg`
- `counterpart-map-v1.jpg` and `counterpart-map-v1-600.jpg`

## Exact generation prompts

### Infrastructure clasps

Use case: stylized-concept. Asset type: bespoke editorial website illustration, landscape 3:2. Reference images are style references only: inherit the exact VlaDDoS visual universe, engraved warm gold, matte black torn canvas, vivid fuchsia braided cord, textured ivory paper, hand-drawn ink and meticulously crosshatched illustration mixed with exquisite tactile product photography. Create a NEW composition: a close-up of two beautifully engraved antique brass connection clasps, one open and one closed, intertwined by a single vivid fuchsia braided cord. The closed clasp has a subtle engraved V on its face. Rest on diagonally torn black canvas across ivory paper, fine gold guilloche loops printed underneath, a few tiny fuchsia ink flecks. Three-quarter overhead view. Strong, sculptural focal object in center, warm natural side-light, realistic brass micro-scratches and cloth fibers, beautifully controlled blacks, editorial luxury print craftsmanship. Entire object visible with breathing room. No text, no letters other than subtle V, no numbers, no symbols of currency, no casino objects, no people, no website interface, no mockup frame, no watermark. Palette matches references closely. This image will be used as a small wide art inset next to PSP and aggregator roles, so bold simple silhouette and exceptional micro-detail.

### Market doorway

Use case: stylized-concept. Asset type: bespoke editorial website illustration, landscape 3:2. Both images are style references, not edit targets. Create a NEW VlaDDoS world composition for merchants and operators. A single small beautifully sculpted antique brass doorway/arch stands upright on torn matte black canvas, with two gold engraved rings resting beside it, and one vivid fuchsia braided cord passing through the arch and across a folded ivory paper card into the foreground. The arch has exquisite guilloche engraving matching the reference gold reel. A subtle small V engraved at top. Three-quarter tabletop still-life composition, simple striking central silhouette, close-up, warm natural raking light, tactile paper fibers, deep matte black fabric, glossy fuchsia cord fibers, gold scratches, tiny ink flecks, fine gold rosette linework subtly printed into paper. Art-directed luxury editorial illustration with ink-hatched shadows and photoreal materials exactly like references. Centered objects and balanced breathing room, fill frame. No typography, no readable text, no numbers, no currency, no generic tech glow, no casino objects, no people, no UI, no watermark. Keep palette ivory, black, antique brass, rich fuchsia. Must feel like another plate from the same brand series.

### Local map

Use case: stylized-concept. Asset type: bespoke editorial website illustration, landscape 3:2. Input images are STYLE references only. Create a new illustration from the VlaDDoS brand universe for local payment partners: an exquisitely folded ivory paper map with fine abstract cartographic contours and coastlines, three ornate small brass eyelets set into the paper, connected by one vivid fuchsia braided cord which curves elegantly across the map. A small antique brass compass with fine guilloche engravings rests on its left folded edge, subtle engraved V at compass center, no legible labels. One corner of map is lifted, revealing torn matte black canvas beneath. Warm engraved brass, bold rich fuchsia, ivory paper, matte black, delicate gold guilloche linework subtly printed in paper, subtle ink flecks. Three-quarter overhead macro still life with clear dimensional folds and tactile paper fibers. Match reference illustration closely: luxurious physical object, ink-hatched shadows, photographic micro-details, carefully art-directed central composition with breathing room. Objects large and legible at thumbnail sizes. No text, no numerals, no labels, no country flags, no currency symbols, no casino objects, no people, no UI, no watermark.

## Verification

- `npm run build`: passed TypeScript, client/SSR builds and prerendering of 31 routes in both EN and RU. Vite reports a client chunk size warning (507 kB); the build completes successfully.
- `node --experimental-strip-types --test --test-name-pattern='bilingual SSR|market filters|public editorial' tests/network.test.mjs`: all three existing checks passed.
- Prettier on changed source files and `git diff --check`: passed.
- Built-site browser review at 320×800, 390×844, 768×1024 and 1440×1000: no horizontal overflow; new images load and the mobile layout selects 600px sources.
- The Russian PSP folio opens `/join?companyType=psp&industry=payments&lang=ru`; the offer intention, PSP role and payments industry are selected in the existing brief.
- Keyboard Tab reaches the folio links. Decorative imagery and SVGs remain outside accessible link names. No new JavaScript state, event listeners, dependencies or API calls were introduced.
- The built page reports no browser errors or warnings. Visual QA used the disposable QA server and did not submit a brief.
- Desktop and mobile screenshots are saved in `../../previews/counterpart-finishing-2026-11-18/` as `partners-desktop-ru.jpg` and `partners-mobile-ru.jpg`.

Changes are local; this pass does not publish a production deployment.
