# VlaDDoS Network — reference redesign

The implementation follows the five user-supplied reference screens. It uses live HTML over clean artwork, with responsive mobile layouts and EN/RU text. The original reference font files and layered artwork were not supplied. The shipped Bodoni Moda / Cormorant typography and edited artwork are close reproductions; a claim of 100% pixel identity has not been verified.

## Artwork

Built-in ImageGen was used, one edit per reference, with an opaque background. Each output was inspected, then copied into the project as an optimized WebP. The originals in Downloads and generated PNGs were retained. Sharp performed WebP encoding and extracted a small blank paper texture; it was not used to generate replacement artwork.

| Supplied reference | Project asset |
| --- | --- |
| Другая сторона VlaDDoS Network.png | `public/assets/editorial/hero.webp` |
| Две стороны связи — золото и фуксия.png | `public/assets/editorial/connection.webp` |
| Фуксиевый узел партнёрской сети.png | `public/assets/editorial/people.webp` |
| Реверс обмена с золотой гравировкой.png | `public/assets/editorial/exchange.webp` |
| Возьми другой конец.png | `public/assets/editorial/contact.webp` |
| Blank paper area of the people background | `public/assets/editorial/paper.webp` |

The existing transparent VlaDDoS signature is used as a fuchsia CSS mask. The small thread endpoint favicon is native SVG. The fine introduction thread is native SVG so it remains sharp. Illustration text removed by the background edit is replaced with real HTML, rather than overlaid invisible links or a screenshot used as the interface.

## Exact ImageGen prompt

The same prompt was applied separately to each target reference using `referenced_image_paths`, with `transparent_background: false`:

> Use case: precise-object-edit. Asset type: production website background artwork. Edit the provided target image. Remove ONLY all website typography, navigation, logo in top left, labels, footer text, form fields, UI button shapes, thin UI separator lines, and UI arrows, replacing those locations seamlessly with the same warm ivory textured paper or black fabric underneath. Preserve ALL illustration artwork exactly: composition, scale, character, facial features, gold engraved spool, guilloche patterns, pink ropes, paint splatters, torn fabric, shadows, paper texture. Do not redesign, zoom, move, recolor, or add anything. The result must be the SAME full landscape frame with exactly matching art placement, but without any interface text or controls. Keep the pink rope and its physical circular end attachment (where present), but erase the word YOU. No new text.

## Integration

- `src/components/Editorial.tsx`: decorative backgrounds, thread actions, scene footers and exchange scene.
- `src/pages/Home.tsx`: four reference compositions, working role selector, retained brief and guide entries.
- `src/pages/Apply.tsx`: compact contact intake with draft restoration, optional operational details, validation, retry and confirmation.
- `src/editorial.css`: new shared visual system and responsive compositions.
- `src/editorial-controls.css`: retained brief and accessible control layout without loading legacy identities.
- `src/fonts.css`: self-hosted open fonts. Font packages include their licenses.

## Validation

Production client/SSR builds and prerendering; 17 server/growth integration tests, including a Telegram-only application; browser checks of the reference scenes, mobile EN/RU, navigation, market search, private desk access screen and research routes. A synthetic mobile form submission was persisted in a disposable preview SQLite database and its confirmation reference was verified against the stored record. No production application data was changed.
