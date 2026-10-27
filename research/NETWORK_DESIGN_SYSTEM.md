# VlaDDoS Network — editorial design system

## Purpose

The public page must explain three things immediately: independent B2B partner sourcing, geographic focus, and the two equal actions I NEED / I OFFER. The active design is implemented in `src/network.css`; former stacked override styles and old components have been removed.

## Materials and composition

- Ivory paper `#f3eadb`, near-black ink `#211f1b`, fuchsia thread `#d50062`, engraved gold `#ab7836`.
- Retained `public/assets/editorial/exchange.webp` opens the network with the engraved V and a physical thread. A paper fade protects copy contrast. The gambling/character hero no longer defines the network.
- `people.webp` gives the two-sided relationship a physical knot. It also supports About; no fabricated participant portraits or testimonials appear.
- The existing paper texture is retained. Earlier assets remain in `research/legacy-assets`, outside the published asset directory.
- No provider-logo wall, fake map coverage, invented metrics or implied inventory.

## Typography and layout

Bodoni Moda and a self-hosted Cormorant Cyrillic fallback supply editorial headings; Inter supplies controls and body text. Previously unused Manrope/Oswald font declarations were removed. No external font request is needed.

Public sections alternate large editorial statements, contextual copy, typographic country rows, expandable industry rows and direct actions. Region, industry and method never appear as equivalent filter chips in a single taxonomy. Country destinations are explicitly sourcing context.

Desktop content has a 1320px maximum and generous margins. Mobile uses a separate art-first hero, readable text and two parallel primary actions. Full country selection, optional methods, currency selection, form, receipt and private brief remain available on mobile.

## Connection Engine

The connection loom is an open canvas rather than a sequence of locked screens. A fuchsia spine connects intent → industry → geography → capabilities → contact. The private paper brief responds to selected scope; it never depicts an available counterparty. Optional operating detail stays in a disclosure. A visitor can bypass the brief and write directly.

Buttons expose pressed states and fieldsets have legends. Dependent country methods/currencies clear when geography changes. Validation focuses the missing scope; successful receipt receives focus and scrolls into view. Mobile uses native select/input behavior, including 16px field text to avoid automatic zoom.

## Motion and accessibility

Motion is limited to the opening copy, selection feedback, focus-thread response, button feedback and an in-flight saving indicator. Reduced-motion removes animation/transitions and smooth scrolling. Text and calls to action are real HTML; artwork is decorative. Visible keyboard focus, skip navigation, Escape handling for the menu and semantic labels support keyboard use. Status/error messages use status or alert semantics.

The Deal Desk has a quieter reading rhythm, horizontally scrollable data tables, explicit empty states and forms backed by actual records. No seeded metrics or sample deals appear in production.

This document describes implementation choices, not an Awwwards award, accessibility certification or performance score. Browser evidence and limits are recorded separately.
