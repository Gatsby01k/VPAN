# VlaDDoS signature beside PAN

Source: `/Users/mac/Downloads/logo VlaDDoS.png`. The owner's lettering, drips, underline and detached dot remain the reference. Built-in ImageGen prepared a transparent white wordmark in two passes; CSS supplies its pink colour. The original entrance, moving highlight and hover rotation have since been removed at the owner's request.

## Saved assets

- `research/artwork/vladdos-signature-v2.png` — selected ImageGen output, 1846 × 852, RGBA, alpha range 0–255.
- `public/assets/vladdos-signature-v2.webp` — optimized web version, alpha preserved.
- `src/brand-motion.css` — static pink mask overlay, responsive sizing and hover/focus lighting.

The original source is unchanged. Python/Pillow was used only to inspect metadata and encode WebP.

## Prompts

### First extraction

```text
Use case: background-extraction. Asset type: exact supplied graffiti wordmark cutout for a website header. Image 1 is the EDIT TARGET: the user's existing black VlaDDoS graffiti logo on a gray photographic background. Extract the existing lettering, underline swoosh, long paint drips and detached dot above the final S faithfully. Preserve the exact shapes, stroke thickness, relative positions, handwritten character, spelling and proportions of the original mark; do not reinterpret, typeset or redesign it. Remove all gray background, photographic lighting, noise and shadow. Change the ink only to solid clean warm white #fff4fa so it reads on a dark website. Smooth clean anti-aliased edges, solid opaque interior, genuine fully transparent alpha outside the strokes. Keep the full dot, underline and drips uncropped, use a tight wide horizontal canvas around the entire silhouette with about 4% breathing space. No added border, box, backdrop, glow, pink aura, extra icon, new lettering or mockup. Output only the isolated white original logo on real transparency; motion and pink highlights will be added in CSS.
```

### Selected cleanup

```text
Use case: precise-object-edit. Image 1 is the EDIT TARGET, a previously extracted white VlaDDoS logo. Clean the extraction: ERASE EVERY speckled white fragment, noisy halo, random white patch, splatter and residue outside the actual thick letter strokes. All that residue BETWEEN and AROUND the letters must become fully transparent. Keep only the smooth connected solid white letter strokes spelling VlaDDoS, the underline swoosh, the intentional narrow paint drips attached to letters, and the single detached round dot above the final S. Use Image 2 (the original black-on-gray logo) as the exact silhouette reference to identify which parts are the intentional logo. Preserve the original letterforms and their positions; do not redesign or change the wording. Solid white strokes with smooth anti-aliased edges, completely clear transparent space around and between them. No texture, no dust, no grain, no spray speckles, no extra white patches, no outlines, no background, no glow. Genuine RGBA transparency. Full dot, underline and drips visible, 4% clear margin, tightly composed wide horizontal canvas. This is a clean readable production logo mask, not a distressed paint texture.
```
