# PAN artwork and identity

The supplied PAN references define this implementation: the crowned mascot with gold PAN rings, black fractured stone, molten gold, magenta paint and smoke. Interactions use these materials alongside actual role, market and method selections.

| Website asset | Source / preparation |
| --- | --- |
| `public/assets/pan-mascot.webp` | Transparent adaptation of the supplied `logo.PNG`, prepared with the built-in imagegen tool; encoded as WebP with alpha retained. |
| `public/assets/pan-foundation.webp` | Supplied `pan background #1.PNG`, encoded as WebP. |
| `public/assets/dark-plate.webp` | Existing optimized artwork matching supplied `pan background #3.PNG`. |
| `public/assets/hero-landscape.webp` | Existing optimized artwork matching supplied `pan background #5.PNG`. |

The source files are preserved. WebP encoding is asset preparation; no extra external imagery or stock art is used. The character and material backgrounds render without WebGL. The crown in the interface is a small custom vector mark derived from the crown motif, with PAN text kept legible at navigation size.

## Mascot preparation prompt

Mode: built-in imagegen edit, supplied `logo.PNG` as the reference, transparent background enabled.

Task: background removal / faithful cutout, not a redesign. Use the attached PAN mascot logo as the exact source. Remove ONLY the white paper background and white gaps around the outer paint splashes, preserving all original foreground pixels and composition as closely as possible: same gold cracked crown, black crown emblem, magenta mouth grille, black fur hood, fist with readable exact 'PAN' gold rings, gold watch and chain, black shattered stone, magenta splashes and drips, gold fissures and steel rods. Preserve original illustration style, pose, colors, proportions, and every detail; do not add or change typography, do not regenerate a different character, do not add a shadow or scene. All foreground islands remain with clean anti-aliased edges. Transparent RGBA background. Square full composition without cropping, nothing cut off.

## Behavior

The mascot responds to mouse movement; touch input leaves the composition stable. The fracture trace redraws on market selection. Reduced-motion settings stop decorative movement. A route contains no personal data: role, up to three market slugs, allowlisted local methods, and category. Its URL restores those choices and prepopulates the application. Application edits and the current step survive a reload within the session.

