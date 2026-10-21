# PAN — material nexus

The owner rejected the flat server diagram and the crown appearing as a sticker on it. The replacement is a connected low sculpture of graphite, smoked glass and hot-pink liquid. It retains the dark dashboard and brand palette while eliminating towers, crown stickers and wireframe decoration. The supplied crown logo remains in the shared brand, rail and favicon.

## Files and provenance

- `research/artwork/pan-nexus-original.png`: unchanged 1448 × 1086 RGBA output of the built-in ImageGen tool. Generated as a new asset, without editing an owner-supplied image.
- `public/assets/pan-nexus-render-v1.webp`: full original canvas encoded at quality 93, alpha quality 100. Genuine transparency is preserved. No background extraction or raster reconstruction was performed outside ImageGen.
- `src/components/PanCoreArtwork.tsx`: SVG compositor framing the canvas with viewBox `0 75 1448 930`. One shared image definition supplies the artwork and its liquid mask.
- `public/assets/pan-nexus-social.webp`: 1200 × 630 stationary social rendering.
- `research/artwork/pan-nexus-motion.svg`: standalone animated export from the same React component.
- `../PAN-nexus-art-preview.png` and `../PAN-nexus-motion.gif`: standalone asset inspections. These are not website screenshots.

## Motion

Three caustic paths follow the physical left, right and rear liquid channels. Moving repeated gradients are softened with a fixed noise displacement and blur. Two elliptical caustics follow the central well. A static image-colour mask selects pink pixels, so highlights are confined to existing liquid and adjacent pink reflections. No part of the metal housing moves, and no unrelated lines, moving particles or floating animation are added.

The three flow cycles are 4.2, 4.8 and 5.4 seconds; the well caustic cycles in 13 seconds. Motion is enabled only after hydration, intersection, document visibility and reduced-motion checks. The stationary render is complete without those enhancements. Component-local IDs prevent mask and gradient collisions across instances; listeners and observers are cleaned up.

## Exact generation prompt

Built-in `image_gen.imagegen`, `transparent_background: true`; no CLI or API-key fallback.

```text
Use case: stylized-concept. Asset type: bespoke transparent hero sculpture for PAN, a high-end private affiliate and payment network website with smoked graphite glass panels and hot pink accents. Create a stunning photoreal CGI product render, NOT a UI mockup, NOT a flat diagram. One coherent engineered physical sculpture representing a network: a broad low black titanium circular nexus with a deep smoked-glass central well, three substantial branching graphite channels leading outward to smaller low satellite terminals. The channels contain vivid hot-pink translucent liquid glass, physically continuous, sculpted flowing curves and subtle internal striations, with true reflections and caustics on the adjacent metal. A few layered sweeping arcs of machined black titanium frame the luminous central liquid well; these have real substantial rounded bevels, satin microtexture, smoked optical glass inserts and precise seams. The design is sculptural, refined, expensive industrial design, strong bold forms and extraordinary material realism like a flagship product launch campaign. Main visual hierarchy is the central glass liquid nucleus and two broad forward-sweeping pink channels, with a third restrained channel receding behind. Keep satellites low and integrated into one connected base, not towers or cubes. Entire isolated object sits in one perspective, three-quarter camera looking slightly downward at about 25 degrees, wide horizontal 4:3 composition, fully visible with a little breathing room and minimal transparent margins, not a distant tiny object. Lighting: large soft cool-white studio strip reflections reveal the black metal, controlled hot-pink light from the liquid softly reflects on adjacent graphite, no oversaturated bloom; deep dark metal stays legible against a #10131d website. Palette almost entirely black titanium, graphite and hot pink #ff0077, silver highlights only. No crown, no gold, no characters, no text, no PAN letters, no labels, no server racks, no sci-fi toy, no wireframe, no dotted-grid background, no pedestal floating away from its parts, no unrelated ornaments, no detached objects, no bright white background. Genuine transparent background, preserve natural soft contact shadow only. Visually polished physically based 3D rendering with raytraced reflections, continuous surfaces, very high detail, ready to integrate directly into an editorial luxury dark dashboard.
```

## Verification scope

Inspect the static render, evaluated animation frames, pixel differences and transparency. Build and prerender checks cover route and asset integration; the existing integration suite covers site behavior. Local browser preview access remains unavailable under the browser URL policy, so standalone artwork inspection does not establish full-page browser visual QA.

The standalone 80-frame, 20 fps preview uses the component's own animation transforms. Comparing its 0 s and 1 s frames at 800 × 514 gives 10,071 pixels changing by more than 12/255, a maximum channel difference of 140 and zero changed neutral-metal pixels at that threshold. The encoded WebP preserves every source alpha value: 869,655 fully transparent pixels and 580,377 pixels above 245/255 opacity. The reduced-motion export contains no animation elements. The client/SSR build and 23 prerendered pages passed, as did all 16 existing integration tests.
