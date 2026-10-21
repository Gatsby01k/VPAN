# PAN artwork and identity

The PAN artwork direction uses the owner's black fractured stone, pink fissures, molten gold and smoke. The v2 treatment separates the subject from its environment so the artwork can be composed with the interface instead of displayed as rectangular source pictures. No humanoid character appears on the site. The folded-screen layout, smoked glass and pink (#ff0077) controls remain.

## Layered treatment

| Production target | Source and integration contract |
| --- | --- |
| `public/assets/pan-core-cutout-v2.webp` | Edit target: supplied `king traffic.PNG`. Isolate and retouch the central crowned server cluster, its connected smaller towers and compact stone base. Require genuine alpha, clean edges, complete crown tips and server corners, cool upper-left rim light and restrained pink underlight. Compose with `contain` sizing so the object remains intact; do not recreate a black rectangular background. |
| `public/assets/pan-atmosphere-v2.webp` | Edit/composite sources: supplied `pan background #4.PNG` and `pan background #5.PNG`. Use a low basalt ledge, a restrained pink fault, thin gold seams and sparse outer smoke. Remove the large monolith, portal, graffiti and lettering. Keep the upper area and right half quiet for text and data, with edges that merge into near-black graphite. |

Both v2 layers were produced with the built-in ImageGen tool. The cutout is 1089 × 1445 RGBA with verified transparent pixels and alpha spanning 0–255; the atmosphere is 1774 × 887 RGB. Full-resolution PNG outputs are preserved in `research/artwork`; optimized WebP files are used by the interface. Exact prompts and processing details are recorded in `research/PAN_IMAGE_PROCESSING.md`. Responsive visual checks are recorded there after browser verification.

The object, atmosphere, HTML glass surfaces and lighting are separate layers. The home cover uses one stationary crowned server object, a quiet floor and reflection. `LiquidSculpture` progressively enhances the original texture with a hue-masked liquid shader: pink currents move inside the four existing conduits while the stone, crown and silhouette remain still. Pointer parallax, sweeping highlights, floating callouts and decorative route animations were removed at the owner's request. The adjacent overview uses `NetworkOrbit`, a native SVG instrument, instead of repeating the same picture. Selecting a role illuminates its matching node and connection. Partner covers reuse the transparent object against the shared environment rather than cropping the source portrait into a card.

## Preserved source versions

| Website asset | Source / preparation |
| --- | --- |
| `public/assets/pan-monolith.webp` | Supplied `pan background #4.PNG`, encoded as WebP; archived prepared source for the stone treatment. |
| `public/assets/pan-faultline.webp` | Supplied `pan background #5.PNG`, encoded as WebP; archived prepared source for the environment. |
| `public/assets/pan-network-core.webp` | Supplied `king traffic.PNG`, encoded as WebP; archived prepared source portrait for the crowned server cutout. |
| `public/assets/pan-foundation.webp` | Supplied `pan background #1.PNG`, encoded as WebP. |
| `public/assets/dark-plate.webp` | Existing optimized artwork matching supplied `pan background #3.PNG`. |
| `public/assets/hero-landscape.webp` | Existing optimized artwork matching supplied `pan background #5.PNG`. |

The owner's source files and these prepared versions are preserved. WebP encoding alone is format preparation; the v2 workflow explicitly calls for subject extraction, retouching, relighting and environmental compositing. No stock imagery is part of this treatment. The original artwork remains visible without WebGL; only the optional liquid enhancement uses it. The navigation crown remains a small vector mark, with PAN text kept legible at navigation size.

## Archived mascot provenance

`public/assets/pan-mascot.webp` is a transparent adaptation of the supplied `logo.PNG`, prepared with the built-in imagegen tool and encoded as WebP with alpha retained. It is retained as an unused historical asset and does not define the current interface or social preview.

The earlier preparation removed the white background while preserving the supplied character, crown, PAN rings, colours and composition. That character has been removed from the visible website at the owner's request.

## Behavior

Role selection updates the proposition, role-specific application action and adjacent vector instrument. Pink identifies the main action and selected connection; gold comes from the supplied artwork and crown motif. Liquid flow is capped at 30 fps and pauses outside the viewport or in a background tab. Reduced-motion preferences retain the original static image. GPU resources and observers are released on teardown. No external animation library is required. Implementation and numerical shader checks are recorded in `research/PAN_LIQUID_MOTION.md`.

The profile contains only a role, up to three market slugs, allowlisted local method references and a category. A shared URL restores those choices and prepopulates the application. Profile choices survive navigation within the session. Application edits and the current step survive a reload and are cleared after successful submission. Reduced-motion settings disable content feedback and smooth scrolling.

The server-and-crown subject comes from the supplied `king traffic.PNG`; it must remain recognizable through extraction and relighting. Earlier generated sculpture and procedural 3D experiments are not part of the current direction. Do not reintroduce the archived humanoid mascot into the interface or social previews.
