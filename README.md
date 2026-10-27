# PAN — Private Affiliate Network

The PAN website for affiliates, payment teams, PSPs, merchants and regional partners working across high-risk commerce, iGaming and e-commerce.

## Interface

The public site follows the five supplied VlaDDoS Network references: ivory textured paper, black torn fabric, gold engraving, fuchsia rope and large contrasting serif typography. The home page follows the thread through the hero, connection selector, partner network and exchange compositions. The contact page uses the fifth illustration with a compact working form. Market, country, story, guide, legal and private desk pages share the same visual system.

The artwork is separate from the live HTML. Headings, EN/RU copy, navigation, buttons, role selection, market selection and contact fields remain accessible, selectable and responsive. Bodoni Moda and a Cyrillic Cormorant fallback are self-hosted; Inter supplies body copy. Clean background assets are optimized WebP derivatives of built-in ImageGen edits of the supplied references. See `research/VLADDOS_EDITORIAL_DESIGN.md` for provenance, the exact edit prompt, and fidelity limits. Previous artwork and styles remain archived in the repository, but the former console identity styles are no longer loaded.

The partner brief retains role, up to three markets, payment methods, category, session persistence, download and share links. It carries selected details into the contact form. The form accepts a valid email or Telegram username, retains an unsent draft, uses a stable retry ID, and displays the saved server reference. Company, personal name and operational details are optional. If no name is supplied, the submitted contact identifies the introduction. Existing application fields and draft data remain compatible. Private desk search includes Telegram contacts.

All 23 static routes remain prerendered with route metadata. Published guides are rendered from SQLite in EN/RU without rebuilding. Market search/filtering, the knowledge library and downloadable checklists, Cmd/Ctrl+K navigation, mobile dialogs, acquisition tracking, and the protected partner desk remain available. Desktop artwork retains the reference aspect ratio; mobile layouts place readable HTML below the illustrations. Keyboard focus and reduced-motion preferences are supported.

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
| `/knowledge`, `/knowledge/:slug` | Published guides, source references and checklists |
| `/sitemap.xml`, `/feed.xml` | Dynamic bilingual sitemap and RSS; require the public origin |
| `/apply?role=merchant&market=ghana` | Application with optional preselection |
| `/about`, `/privacy`, `/terms` | Network principles and notices |
| `/admin` | Partner desk, protected API, noindex |
| Other URLs | Designed 404 with HTTP 404 status |

## Persistence and deployment

`server.mjs` uses Node's HTTP and SQLite APIs. It validates applications, limits submissions, enforces a configured origin, preserves retry idempotency, authenticates admin requests and changes application status together with its audit record in one transaction. Existing databases are upgraded automatically to include the business category. Missing assets return 404 instead of HTML.

Deploy as a persistent Node service or with `docker compose up --build -d`. The multi-stage image builds the frontend and runs as the `node` user. Mount and back up the SQLite volume. Configure `ADMIN_TOKEN`, `DB_PATH` and the production `ALLOWED_ORIGIN`. Enable `TRUST_PROXY=1` only behind a trusted reverse proxy.

The partner desk uses one operations key, held only in browser memory. Applications and audit history are stored on the server; the session draft contains application fields and is cleared on successful submission. The partner profile is held in session storage without contacts. Language preference is stored locally. Optional campaign/referral identifiers are retained for the browser session and submitted with an application. Cookie-free page counts store page/source/day totals, without visitor IDs or persisted IP addresses, and respect DNT/GPC. For a larger operations team, the next system work is individual staff identity and permissions.

## Autonomous content and acquisition

The persistent service starts a growth cycle on boot and checks every minute whether the six-hour interval has elapsed. SQLite records run state, a cross-process lease, publication history and attribution. Expired interrupted runs recover automatically. Source failures preserve published content and never stop application intake. A process that is asleep or stopped cannot run the worker; use the persistent Docker/Node deployment above.

Three reviewed guides are initially published; three method-specific guides are queued. The queue prioritizes markets present in recent applications without exporting applicant information. At most one prepared guide is published per day after its registered sources can be retrieved. Source checks are availability/content checks, not a substitute for expert factual review. Monitoring does not silently change the reviewed facts or make old articles appear newly updated.

When no prepared guide can be published, a configured Search Console connection supplies a rolling 28-day snapshot. Supported, distinct queries with at least ten impressions can become new topics. A payment-method topic requires its matching primary source to be available; blocked sources do not prevent work on other supported topics. A configured AI Gateway model produces structured EN/RU operational guidance grounded in the approved source registry. Validators reject malformed output, unsupported citations, common invented commercial claims and near-duplicate content. `GROWTH_AI_AUTOPUBLISH=1` publishes passing output automatically; `0` retains it as a draft for review. These gates cannot prove every interpretation correct. The operations panel can preview, publish and archive material. One AI attempt per day, including failures, limits repeated requests; configure an additional hard monetary budget on the Gateway key.

The library deliberately stops when the queue is complete and no supported distinct demand is available. Add researched source facts and useful topics in `growth/catalog.mjs` as PAN's actual operating scope expands. This is not unlimited keyword permutation generation. Ranking, indexing, links, traffic and partner acceptance are not guaranteed.

Set these values in an **uncommitted** `.env` on the production service:

- `PUBLIC_SITE_URL`: the exact HTTPS origin. Canonical URLs, language alternates, structured data, sitemap and RSS use it; request Host headers are never trusted for SEO URLs.
- `GROWTH_ENABLED=1`: enable the durable schedule.
- `AI_GATEWAY_API_KEY` and `AI_GATEWAY_MODEL`: a restricted key and a current structured-output language model ID from the official model catalogue. No key is bundled or supplied by the development session.
- `GROWTH_AI_AUTOPUBLISH=1` for the requested autonomous mode, or `0` for editorial review.
- `GSC_SERVICE_ACCOUNT_FILE`: a private Google service-account JSON file outside Git, accessible to the service. Grant its email read access to the verified Search Console property. For Docker, mount the file read-only and set this variable to the container path.
- `GSC_PROPERTY`: the exact verified property, such as a URL-prefix property or `sc-domain:` property. The connector requests only `webmasters.readonly`; it does not submit URLs or modify Search Console.

Register `/sitemap.xml` in Search Console once; it updates automatically with publications and withdrawals, and is also declared in `robots.txt`. Language-specific `?lang=ru` URLs return Russian server-rendered content, with reciprocal EN/RU alternates. Article modification dates reflect publication changes, not every scheduled source check.

The admin acquisition panel exposes run/pause controls and actual configuration state. CLI equivalents, using the same database and environment:

```bash
npm run growth:status
npm run growth:run
```

CLI/manual runs bypass the interval/pause setting, but do not bypass daily autonomous publication or AI limits. The website only sends aggregate search queries and public registry facts to the AI connector. Application names, contacts and messages stay in the site database.

This release implements the website, partner intake, content scheduling and acquisition attribution. A supplied referral code is recorded with an application; it does not establish verified contact ownership or a commission entitlement. Commission accounting, a partner portal and payment processing remain separate product work. Market methods describe local infrastructure; availability and commercial terms are reviewed individually. Confirm operator details, contact destinations and commercial notices before launch.

## Checks

```bash
npm run check
npm test
```

`npm test` builds the client and prerendered pages, then checks public routes, missing assets, 404/HEAD, forms, migration, admin audit rollback, dynamic bilingual SSR, sitemap/RSS, withdrawals, cross-process publication leases, interrupted-run recovery, daily limits, source failures, acquisition attribution, private-data separation and mocked external connector contracts. Live Search Console and AI generation require the owner's credentials and have not been verified by fixture tests.

The supplied artwork and its prepared source versions remain in `public/assets`. See `BRAND_ASSETS.md` for the layered artwork contracts and archived mascot provenance, and `research/PAN_IMAGE_PROCESSING.md` for the exact image-editing prompts and built-in ImageGen workflow. Those specifications do not replace checking generated files, alpha and browser integration. Fonts are distributed under OFL-1.1 by Fontsource. No external font service is required.
