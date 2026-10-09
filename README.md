# PAN — Private Affiliate Network

The PAN website for affiliates, payment teams, PSPs, merchants and regional partners working across high-risk commerce, iGaming and e-commerce.

## Interface

React 19 + TypeScript, Vite 8, React Router 7 and Motion 14. PAN’s crowned mascot, cracked black stone, liquid gold and magenta define the identity. Self-hosted Oswald, Manrope and Inter cover English and Russian. The mascot responds to mouse movement; the route trace draws when markets change, with reduced-motion support.

All 22 pages are prerendered, with route-specific metadata and an actual 404 response. Public navigation works with direct URLs. The interactive interface adds:

- A PAN route builder: select a role, up to three markets, local payment methods and a business category; preview a brief, copy a shareable route link, and carry the choices into the application.
- Animated route transitions, scroll reveals, a responsive mascot and magnetic buttons.
- Searchable quick navigation with Cmd/Ctrl+K, a native mobile dialog and EN/RU switching.
- Search and regional filters for ten country pages.
- Role and market preselection in the application flow, a session draft, stable retry IDs and a saved application reference.
- A private partner desk with actual counts, full application details, search, status filters and CSV export.
- Responsive layouts, keyboard focus states and reduced-motion support. The mascot and material backgrounds render without WebGL.

## Run locally

Node.js >=22.13 is required; Node 24 is recommended.

```bash
npm ci
cp .env.example .env
# Set a real ADMIN_TOKEN in .env to use /admin.
npm run dev
# Website: http://127.0.0.1:5173; API: http://127.0.0.1:3000
```

Leave `ALLOWED_ORIGIN` empty during local development, or set it to the frontend's exact origin. The server loads `.env` automatically without overriding existing environment variables.

For a complete production build and local preview:

```bash
npm run build
npm start
# http://localhost:3000
```

## Routes

| Route | Content |
| --- | --- |
| `/` | Main network website |
| `/affiliates`, `/teams`, `/payment-partners`, `/merchants` | Partner propositions |
| `/markets`, `/markets/:slug` | Country explorer and ten market pages |
| `/apply?role=merchant&market=ghana` | Application with optional preselection |
| `/about`, `/privacy`, `/terms` | Network principles and notices |
| `/admin` | Partner desk, protected API, noindex |
| Other URLs | Designed 404 with HTTP 404 status |

## Persistence and deployment

`server.mjs` uses Node's HTTP and SQLite APIs. It validates applications, limits submissions, enforces a configured origin, preserves retry idempotency, authenticates admin requests and changes application status together with its audit record in one transaction. Existing databases are upgraded automatically to include the business category. Missing assets return 404 instead of HTML.

Deploy as a persistent Node service or with `docker compose up --build -d`. The multi-stage image builds the frontend and runs as the `node` user. Mount and back up the SQLite volume. Configure `ADMIN_TOKEN`, `DB_PATH` and the production `ALLOWED_ORIGIN`. Enable `TRUST_PROXY=1` only behind a trusted reverse proxy.

The partner desk uses one operations key, held only in browser memory. Applications and audit history are stored on the server; the session draft contains application fields and is cleared on successful submission. Language preference is stored locally. For a larger operations team, the next system work is individual staff identity and permissions.

This release implements the website and partner intake. Referral tracking, commissions, a partner portal and payment processing are separate product work. Market methods describe local infrastructure; availability and commercial terms are reviewed individually. Confirm operator details, contact destinations and commercial notices before launch.

## Checks

```bash
npm run check
npm test
```

`npm test` builds both client and prerendered pages, then checks every public route, missing assets, 404/HEAD behavior, validation, merchant fields, origin restrictions, retries, multibyte names across HTTP chunks, admin access, audit rollback and migration from the previous database schema.

Original artwork remains in `public/assets`. See `BRAND_ASSETS.md` for the supplied references and the transparent mascot preparation. Fonts are distributed under OFL-1.1 by Fontsource. No external font service is required.
