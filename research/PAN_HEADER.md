# PAN — compact glass header

The owner identified the floating header as misaligned and visually weak. The inherited `.header-inner` minimum height was 84 px while the scrolled homepage panel was only 62 px; the brand's signature and tiny caption extended below its frame.

## Composition

`header.css` owns the shared header after the existing visual layers. It uses three columns: the PAN/VlaDDoS identity, centered text links and tools with a single partnership action. The old minimum-height constraints were also removed in `styles.css` so the inner row fits its enclosing panel.

The same 72 px geometry applies before and after scrolling, on home and inner pages. Scrolling changes the border/shadow treatment without moving or resizing content. The panel is limited to 1320 px with an 18 px corner radius. Text navigation replaces four repeated outlined capsules; the current page or partnership anchor receives a pink underline. The existing application link is now a visible magenta action on desktop and tablet.

The header-specific brand keeps a 32 px crown/A mark, an 80 × 28 PAN wordmark and a 96 × 44 VlaDDoS signature. The tiny caption is hidden only inside the header. A subtle divider separates PAN from its endorser. Existing logo assets are preserved.

At 1024 px and below, the existing mobile-menu trigger replaces the desktop links. Tablet controls use 44 px targets. At 720 px and below the panel is 64 px tall and branding becomes more compact; at 440 px it is 60 px tall. At 600 px and below the application and search controls move to their existing menu entries, leaving the identity, language toggle and menu trigger. The 320 px treatment retains both PAN and VlaDDoS.

## Behavior and checks

The existing navigation routes, EN/RU toggle, search dialog and Cmd/Ctrl+K shortcut remain functional. The partnership anchor now exposes `aria-current="location"` when selected; NavLink continues to expose the active page. Keyboard focus remains visible, and reduced-motion preferences remove header transitions.

Validation passed: production build with 23 prerendered pages, all 16 existing integration tests, formatting and whitespace checks. EN/RU SSR checks also confirmed the header routes, application action, active partnership anchor, active country/market navigation, signature asset and keyboard-shortcut metadata. Full browser visual inspection remains unavailable under the previously encountered browser URL policy; source and SSR checks do not claim viewport screenshots.
