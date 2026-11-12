# VlaDDoS Network

Independent international B2B partner sourcing and deal origination across Asia, Latin America and Africa. The public product serves two equal paths: **I NEED → Find a Partner** and **I OFFER → Join the Network**. Countries describe sourcing destinations, not verified network coverage.

The Counterpart is the public editorial system: two business intentions, one physical thread and a clear next step. It reframes the original character artwork, signature, paper, engraved gold and fuchsia cord in new compositions. See [The Counterpart](research/COUNTERPART.md) for the design system and review notes.

## Run and verify

The public brief uses **automatic delivery selection**. A successful `/health` response declaring durable intake enables the existing persistent API. Without that verification, visitors review the full message and send it themselves in a private Telegram chat with `@V1aDDoS`. A manual handoff never creates a database receipt. Long drafts have a complete-text copy fallback.

`VITE_BRIEF_DELIVERY=auto` is the default. Explicit `telegram` and `desk` modes remain available. The Telegram route requires neither a bot token nor a backend; it does not enable the private Deal Desk, analytics or growth worker. The three reviewed initial field notes now also have bilingual static pages and a public catalogue fallback; new dynamic publications still require the persistent service.

To review the built site and both intake states without loading production credentials, start the disposable QA server:

```bash
npm run build
npm run qa:serve
# http://127.0.0.1:3100
```

The QA server uses a temporary SQLite database and a local notification receiver. Set `QA_INTAKE_DISABLED=1` before starting it to exercise the durable submission error. Stop it with Ctrl+C.

Node 24 is recommended. Local and Docker installations use Node's SQLite API. Vercel uses the SQLite-compatible `libsql` driver to connect directly to the approved Turso database; the schema and commercial engine are shared.

```bash
npm ci
cp .env.example .env
# Configure ADMIN_TOKEN with a strong random value (at least 32 characters).
npm run dev
```

The frontend at `http://127.0.0.1:5173` proxies the API at port 3000. For a production build served by the actual intake service:

```bash
npm run build
npm start
# http://127.0.0.1:3000
npm test
```

`npm test` builds first, then tests HTTP → SQLite → response, legacy migrations, privacy boundaries, retries, qualification, matching, bilateral permission, signed schedules, sourcing mandates, attribution conflicts, parent/sub-partner splits, exact commission arithmetic, collection/activation holds, payouts/recoveries, acquisition approval/suppression, research security, outbox recovery and editorial behavior. Tests and browser QA use disposable databases; fixture companies are never production seed data.

## Commercial operations

The private `/admin` desk includes Founder view, Opportunities, Introductions, Agreements, Revenue, Affiliates, Acquisition, Companies and Notifications. [Operating model](commercial/OPERATING_MODEL.md), [agreement preparation schedule](commercial/AGREEMENT_SCHEDULE.md) and [verification evidence](commercial/VERIFICATION.md) explain the implemented flow and launch boundaries.

Paid sourcing mandates can be signed against a verified client before an introduction. Other agreement models require an actual introduction. Record structured signed obligations and every beneficiary split before the first fee statement. Founder view separates gross fees, collections, affiliate liabilities, payout reserves, paid costs, retained cash and collected net contribution. Payouts are evidence records for external payments, not transfers performed by this service.

Acquisition stores source-backed company research, manual contact permission, draft approval, suppression and follow-up dates. Replied enquiries convert into the existing CRM without becoming verified automatically. LinkedIn positioning, four post drafts, discovery questions and four clearly labelled prospect research starting points are included. Optional AI drafting reuses the existing AI Gateway variables and caps attempts at ten per UTC day; template drafts work without an AI key. No outreach is sent automatically.

## Product architecture

- `shared/taxonomy.json`: one active catalogue of regions, countries, industries, company types and capabilities. Methods and settlement currencies belong to their country context.
- `src/network.ts`: shared frontend labels and route metadata.
- `src/pages/Home.tsx`, `src/components/Editorial.tsx`, `src/components/Layout.tsx`: original artwork, compositions, signature, navigation and footer with the updated positioning.
- `src/pages/RetainedExplore.tsx`: original market cards, country compositions and About layout, populated from the shared catalogue and new business copy.
- `src/components/ConnectionStudio.tsx`: a compact six-role entry to the single brief; explicit intent is retained and scenario context carries into the form.
- `src/pages/NetworkPages.tsx`: network, industries, contact, legal and field-note content.
- `src/pages/ConnectionEngine.tsx`: one two-step private brief (scope → context/contact), role-specific guidance and progressive operational details. Company, message and operating context are optional.
- `operations/desk.mjs`: validation, additive migration, CRM, qualifications, matching candidates, introductions, agreements, revenue records and notification outbox.
- `operations/commercial.mjs`: signed schedules, sourcing deliveries, affiliates, claims, allocations, payout/recovery evidence, acquisition and founder reports referencing the existing desk records.
- `operations/research.mjs`: a bounded, requested official-source page reader with public-address validation, DNS pinning, redirect rejection and social-platform exclusions.
- `operations/managed.mjs`: Vercel entry to the same application using remote Turso, request-scoped notification delivery through `waitUntil`, and authenticated daily maintenance.
- `server.mjs`: persistent Node HTTP service, SQLite, authenticated operations endpoints and bilingual SSR.
- `api/service.mjs`: optional Vercel same-origin gateway to that persistent service.

Routes: `/`, `/network`, `/industries`, `/markets`, `/markets/:country`, `/find-a-partner`, `/join`, `/about`, `/contact`, `/knowledge`, `/knowledge/:slug`, `/privacy`, `/terms`, `/admin`. EN is default; `?lang=ru` is Russian. Internal links retain the selected language.

`/affiliates`, `/teams`, `/payment-partners`, `/merchants` and `/apply` permanently redirect to the appropriate new flow with query parameters preserved. `/api/apply` remains compatible with existing integrations and databases. Old application records and references are preserved. New submissions use VN references.

## Intake and privacy

`POST /api/opportunities` validates against the shared taxonomy, stores an opportunity and its notification in one SQLite transaction, then returns a reference. A repeated request ID with the same normalized payload returns the same reference; changed details under that ID return 409. Client retry IDs survive retries. A browser receipt contains only the reference and entry route; the contact-bearing draft is cleared after success. No available offer or matching result is fabricated.

The contact can be a business email or valid Telegram handle. Capabilities remain self-declared and unverified at receipt. A referral code records a claimed source; it does not establish entitlement to remuneration. No credentials, financial accounts or identity documents should be submitted through this form.

Database, WAL and shared-memory files are set to owner-only permissions. Admin API responses are no-store and require a Bearer operations key. The key stays in browser memory, not local/session storage. `/admin` is noindex. Public APIs and editorial bootstrap never expose applicant records. The Foundation access model is one authorised operator; individual identities and role permissions are required before expanding the operations team.

The form reports success only after a valid durable API response. On an unavailable service it retains the brief and offers a reviewable email or copy action. That email requires the visitor to send it; it is never shown as a saved enquiry.

## Deal Desk

Open `/admin` with the server's `ADMIN_TOKEN`.

1. Review real received opportunities and preserved legacy applications. Old briefs enter as `unclassified / unverified`; manually classify their scope before matching.
2. Record entity, operating-scope and source evidence, owner, next follow-up and expiry. Qualify after verification. Record evidence of permission to share separately from enquiry consent.
3. Review candidates derived only from eligible saved opposite-side records with overlapping industry, country and capability, requested company types and different company records. Closed, unsuitable, unverified and expired records are excluded.
4. Propose an introduction only when both sides have sharing permission. Mark an actual introduction with evidence; current scope, verification and bilateral permission are rechecked before proceeding. No message is sent automatically to either party.
5. Record the signed commercial model, payer/fee basis/exclusions in terms, attribution, currency, share if agreed, start/end dates and agreement reference.
6. Record statement-backed amounts in their agreement currency. Due, invoiced, received and void are separate states. Reporting does not convert currencies or invent revenue from transaction volumes. Immutable statement references prevent retries from creating a second amount after a status change.
7. Add interaction notes and review the event history. Exact contacts deduplicate automatically; merging company records requires identity evidence. A shared company name or email domain is not sufficient evidence.

Legacy status updates and Deal Desk updates remain synchronized with the original application and audit tables. Application records and references are preserved. Commercial tables are additive. Upgrading the original introduction-only agreement schema requires a checked transactional SQLite table reconstruction to support sourcing mandates; agreement IDs, fees, child references, custom indexes and triggers are preserved. Back up a live database before upgrading.

## Reliable notifications

For Telegram, set `TELEGRAM_BOT_TOKEN` as a server secret and optionally `TELEGRAM_BOT_USERNAME` to check the bot's identity. Use a dedicated bot. In **Deal Desk → Notifications**, create a connection link, open it in the intended private chat, press Start and confirm within ten minutes. Send a test from the same screen. A paired chat receives the enquiry reference and a link to the authenticated Deal Desk. [Telegram bot setup](https://core.telegram.org/bots).

For an HTTPS receiver, set `NOTIFICATION_WEBHOOK_URL` and `NOTIFICATION_WEBHOOK_SECRET`. When a Telegram chat is paired, it becomes the delivery destination. The same outbox tracks both transports. Deployment verification records are omitted from notification delivery.

The HTTPS receiver gets JSON `{ event, id, reference, deskPath }` and a stable `Idempotency-Key`. A 2xx response acknowledges the webhook. The Telegram Bot API acknowledges `sendMessage` with `ok: true`. Failed requests retry with exponential backoff up to a six-hour interval, and pending jobs survive restarts. Delivery is at least once. Deduplicate webhook events by their IDs. A Telegram message may repeat if its acknowledgement is lost. A lease coordinates concurrent delivery, and the desk shows the state and next retry for each reference.

## Production deployment and migration

**Vercel now has a managed persistence path.** On 10 November 2026 the original production `/health` returned HTTP 503 with no configured backend. With the owner's explicit approval, Turso Starter ($0/month at provisioning) was created as `vpan-commercial` in the existing Vercel team and connected to `vpan` production. Its Marketplace-managed `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` stay in the hosting environment. No production credentials are downloaded into local files.

When these two Turso variables are present, `api/service.mjs` routes the existing API to `operations/managed.mjs`. This runs the same CRM, migrations, attribution and fee logic against remote libSQL. It does not open a local database on Vercel. Configure `ADMIN_TOKEN`, `CRON_SECRET` and `PUBLIC_SITE_URL` as hosting variables. Intake rate limits persist in the database across function instances; private endpoints still require the operations key. The `ADMIN_TOKEN` and `CRON_SECRET` created during setup are Secret variables.

New-enquiry notifications are committed to the same outbox as the enquiry. `waitUntil` retains the first delivery attempt after the confirmed receipt; the authenticated Vercel daily cron at `07:00 UTC` retries pending delivery and runs editorial maintenance. The configured webhook receiver is still required for actual notification delivery. Vercel functions do not rely on background interval timers. AI publication is disabled by default in the example configuration.

The legacy persistent-service gateway remains available when Turso is not configured. This retains compatibility with an existing Node host and SQLite volume. A backup and deliberate migration are required before importing any existing operational database; the newly provisioned database does not imply that past Telegram conversations or an unidentified historical volume have been imported.

For Vercel application rollback, promote the last known good deployment that already uses Turso. For database recovery, confirm the Marketplace plan's recovery window, then restore to a separate private database and reconcile enquiries received after the restore point before updating the production binding. [Turso point-in-time recovery](https://docs.turso.tech/features/point-in-time-recovery).

The optional Node/Docker topology uses a mounted SQLite volume and HTTPS reverse proxy and can serve the complete website and API. The following volume procedure applies to that topology; it is not needed for the Vercel-managed Turso connection.

Before touching a live volume:

1. Identify the actual existing service and database. If there is an existing persistent volume, retain it. The Compose volume identity `pan-data` is deliberately preserved for data compatibility; the service name is `network`.
2. Make a consistent private backup and verify it can be opened:

```bash
DB_PATH=/path/to/current/partners.sqlite npm run backup -- /private/backup/before-network.sqlite
```

3. Run the candidate service against a copy, inspect preserved counts/references and run the tests. Never use a production copy as a public preview database.
4. Configure `PUBLIC_SITE_URL=https://www.vladdos.com`, `ALLOWED_ORIGIN=https://www.vladdos.com`, a strong `ADMIN_TOKEN`, persistent `DB_PATH`, and the notification receiver. Keep secrets outside Git and mount them read-only where possible.
5. `docker compose up --build -d` preserves the mounted database. Use one persistent service initially; do not spread SQLite writes over ephemeral serverless instances or independent hosts.
6. Verify a designated synthetic enquiry → reference → desk row → notification acknowledgement. Remove or clearly mark the synthetic record. Verify auth rejection, EN/RU source, canonical/hreflang, 404, redirect and a backup restore before routing public traffic.

For the split Vercel topology, set `INTAKE_SERVICE_ORIGIN` to the exact HTTPS origin of the persistent backend and the same strong `INTAKE_GATEWAY_TOKEN` on Vercel and the backend. The backend then requires that gateway key for API access and trusts forwarded client IPs only on authenticated gateway requests. `TRUST_PROXY=0` remains the default; enable it separately only behind a trusted reverse proxy. The gateway requires a token of at least 32 characters and carries no database or admin key into the public client. Production Node startup rejects placeholder admin credentials and mismatched public/allowed origins.

`vercel.json` preserves legacy redirects, serves prebuilt RU HTML for `?lang=ru`, and forwards `/api/*`, `/health`, RSS and dynamic guide pages to the persistent service. An unset/unreachable service returns 503 and cannot produce a false receipt. Preview API routing has been checked for an honest 503 when the persistent service is absent. End-to-end cloud intake still requires that service and its configuration.

Rollback: restore the previous application image first. The original application tables remain compatible. Restore a backup only with the service stopped and after reconciling enquiries received since it was taken; blindly replacing a live database would lose newer records. Retain the newer database as a private recovery artifact.

## SEO and editorial continuity

Node SSR returns the correct EN/RU HTML and reciprocal alternates using the explicitly configured public HTTPS origin. A build generates both languages for all public static routes, a sitemap and robots rules. Administrative and internal shell pages are not indexed. Dynamic knowledge content is available from the persistent service; existing drafts, publication state and histories are retained. The old brand is normalized when legacy editorial content is read, without changing applicant data.

The retained growth worker can be disabled with `GROWTH_ENABLED=0`. Its optional AI/Search Console integrations require separate credentials; they are not needed for partner intake. No live AI publication or Search Console access was tested by mocked connector tests.

Read [the strategy and market sources](research/NETWORK_STRATEGY_2026-10-27_RU.md), [release verification](research/NETWORK_VERIFICATION_2026-10-27.md) and [design decisions](research/NETWORK_DESIGN_SYSTEM.md). Commercial, operator and legal particulars must reflect the real operating entity before public launch. The repository supplies no fabricated clients, licences, metrics or partnerships.

## Refinement verification (28 October 2026)

See [the audit and release plan](research/NETWORK_REFINEMENT_2026-10-28_RU.md) and [evidence](research/verification-2026-10-28/).

```bash
npm test                 # production build, typecheck, 48 tests with disposable databases
npm run format:check
npm run qa:serve         # loopback-only disposable SQLite + local notification receiver
npm run release:check -- https://candidate-host
```

The QA server prints the path of its private session file, containing a temporary Deal Desk key. It never opens the configured production database. `QA_PORT=3101 QA_INTAKE_DISABLED=1 npm run qa:serve` runs the unavailable-backend scenario. These test keys and databases stay outside the repository. The notification transport uses a real local HTTP sink, not Telegram or a production notification service.

The read-only release check cannot establish production readiness on its own. A designated end-to-end request, authenticated desk inspection, real notification acknowledgement and a recoverable database backup remain release gates.

## UI/UX evolution (5 November 2026)

The interface now has a stable floating header, direct need/offer entry points, keyboard-operated search with ranked results, an expanded footer, clearer market filters and a quieter brief workspace. The brief has distinct role icons, scope completion, section shortcuts and an expandable mobile summary. The original illustrations, animated connection thread and two-language routes remain in use.

`src/evolution.css` defines the current surface, border, control-radius and motion tokens and is imported after the retained styles. Extend the appropriate section there for new controls instead of introducing a page-specific visual system. Keep transactional behavior in the existing components and service.

See [the design and verification record](research/UI_UX_EVOLUTION_2026-11-05_RU.md) for scope, responsive checks and the disposable browser-to-database test. This UI candidate is prepared on `codex/ui-ux-evolution`.
