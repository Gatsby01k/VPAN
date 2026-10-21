# PAN — header integrated with the console

The header sits directly on the page background. Its inner row shares the console's 1480 px maximum width and outer gutters; inset branding and right-side controls align with the content inside that console. There is no separate floating frame, rounded header container or filled application button.

## Composition

`header.css` owns the shared header after the existing visual layers. It uses three columns: PAN/VlaDDoS identity, right-aligned text navigation and language/search tools. The identity is slightly larger on desktop: a 36 px crown/A mark, an 88 × 31 PAN wordmark and a 104 × 48 VlaDDoS signature. The tiny caption is hidden only inside the header. Existing approved logo assets are preserved.

Desktop height is 80 px. The console begins at 88 px, instead of leaving the previous 104 px top offset for a floating panel. At 1180 px and below the corresponding heights are 76/84 px; at 720 px they are 68/76 px; at 440 px they are 64/72 px. Scrolling adds a full-width dark backdrop and a fine lower edge while keeping the content's size and position stable. Inner pages use the same backdrop from the outset.

Navigation normally uses 13 px text. On hover or keyboard focus, `MatrixNavLabel` replaces the label with uppercase dot-matrix lettering that appears one character every 30 ms. The five-column, seven-row glyphs use square pixels with the same 0.72 pitch ratio as the console's counters. Latin and Cyrillic letters are drawn as small SVG paths; accented letters keep their marks. There is no hover glow, filled background or underline. The active destination retains a brighter static text color.

A grid reserves the larger of the normal and matrix labels before interaction, so typing does not move the links or alter their hit areas. CSS animates the clipping of the decorative wrapper in character-sized steps, once per hover/focus; leaving restores the plain label immediately. No animation timers or frame-by-frame React updates are used. Accessible names come from the normal text, and the duplicate SVG layer is hidden from assistive technology. With reduced motion enabled, the matrix word appears immediately. Touch-only pointers do not trigger the hover treatment; unsupported future characters fall back to plain text.

Language and search controls have quiet, borderless styling with 44 px targets. The primary partnership action remains beside the selected role in the main content, with another application entry in the mobile menu. The shared header does not repeat that action.

At 1024 px and below, the existing mobile-menu trigger replaces the desktop links. At 600 px and below, search remains available through that menu and Cmd/Ctrl+K. The narrowest layout retains PAN and VlaDDoS beside the language and menu controls. Header content has no inherited minimum height that could exceed its enclosing row.

## Behavior and checks

The existing navigation routes, EN/RU toggle, search dialog and Cmd/Ctrl+K shortcut remain in place. The partnership anchor exposes `aria-current="location"` when selected; NavLink exposes the active page. Keyboard focus remains visible, and reduced-motion preferences remove header transitions.

Validation passed: production build with 23 prerendered pages, all 16 existing integration tests, formatting and whitespace checks. EN/RU SSR checks confirmed all four matrix labels, complete glyph coverage, character timing, accessible text with decorative SVG layers, active partnership anchor and route destinations. The component was reviewed for React rendering, accessibility and SSR consistency. A standalone 3× type specimen was rendered from the actual SSR SVGs and visually inspected. Full browser visual inspection remains unavailable under the previously encountered browser URL policy; the type specimen is not a viewport screenshot or browser interaction test.
