# PAN owner logo and wordmark

Source supplied by the owner: `Дизайн без названия-19.png`, 1200 × 1200 RGBA. Its background was already transparent; the nonzero alpha bounds are `(264, 204, 938, 1007)`. The full source is preserved unchanged in `research/artwork/pan-owner-logo.png`.

`public/assets/pan-owner-logo.webp` encodes the full canvas at quality 95 with alpha quality 100. No background removal, recolouring, generated reconstruction or destructive crop was needed. `PanLogo` uses the viewport `240 180 722 851` to frame the existing transparent margins consistently. The gold crown, cracks, black emblem and pink liquid remain the supplied artwork.

The shared brand, rail, network instrument, hub face and favicon use this mark. Partner pages and social artwork inherit the hub component. The favicon embeds its image data so it does not depend on an external image reference.

`PanWordmark` is original code-authored SVG lettering, rather than a font approximation: three dense forms, matching angular cuts, open counters, a five-degree forward slant and a narrow pink A crossbar. Its silver fill keeps PAN distinct beside the detailed gold logo and pink VlaDDoS signature. It has no repeating shine or movement. Shared brand links retain a readable accessible name.

`brand-identity.css` sets explicit desktop, tablet and compact widths. At compact widths the existing menu retains the application entry while the header application button is hidden to leave room for the complete identity.

Standalone exported art and brand previews are rendered from the same React SVG components using ReactDOMServer and Sharp. They are asset inspections, not browser screenshots. Build and route checks verify integration; the local browser preview was unavailable because of the browser tool's access policy.
