# VlaDDoS Network

Independent international B2B partner sourcing and deal origination across Asia, Latin America and Africa. The public product serves two equal paths: **I NEED → Find a Partner** and **I OFFER → Join the Network**. Countries describe sourcing destinations, not verified network coverage.

The website uses the retained ivory paper, torn black fabric, engraved gold and fuchsia thread artwork. Public copy, navigation, metadata, forms and active components use VlaDDoS Network. Earlier brand assets and research are retained under `research/` for provenance, outside the public build.

## Run and verify

Node 24 is recommended. The runtime uses Node's SQLite API; no database npm dependency is required.

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

`npm test` builds first, then tests HTTP → SQLite → response, legacy database migration, privacy boundaries, retry conflicts, qualification, matching, bilateral permission, commercial terms, statement accounting, outbox recovery and existing editorial behavior. The current suite has 36 passing tests and uses disposable databases. Browser QA also uses a separate database; fixture companies are never production seed data.

## Product architecture

- `shared/taxonomy.json`: one active catalogue of regions, countries, industries, company types and capabilities. Methods and settlement currencies belong to their country context.
- `src/network.ts`: shared frontend labels and route metadata.
- `src/pages/NetworkPages.tsx`: public network, industries, market/country, contact, about, legal and field-note pages.
- `src/pages/ConnectionEngine.tsx`: open connection loom and live private brief. Contact plus scope is sufficient; company, message and operational context are optional.
- `operations/desk.mjs`: validation, additive migration, CRM, qualifications, matching candidates, introductions, agreements, revenue records and notification outbox.
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
4. Propose an introduction only when both sides have sharing permission. Mark an actual introduction with evidence; no message is sent automatically to either party.
5. Record the signed commercial model, payer/fee basis/exclusions in terms, attribution, currency, share if agreed, start/end dates and agreement reference.
6. Record statement-backed amounts in their agreement currency. Due, invoiced, received and void are separate states. Reporting does not convert currencies or invent revenue from transaction volumes. Immutable statement references prevent retries from creating a second amount after a status change.
7. Add interaction notes and review the event history. Exact contacts deduplicate automatically; merging company records requires identity evidence. A shared company name or email domain is not sufficient evidence.

Legacy status updates and Deal Desk updates remain synchronized with the original application and audit tables. The SQLite migration is additive and idempotent; it does not drop the original tables or rewrite existing application references.

## Reliable notifications

Set `NOTIFICATION_WEBHOOK_URL` to an authenticated HTTPS receiver and `NOTIFICATION_WEBHOOK_SECRET` to its Bearer secret. The receiver should forward the reference to the operator's chosen channel. The implementation does not assume or invent an email, Telegram bot or Slack destination.

The outbox sends JSON `{ event, id, reference, deskPath }`, without applicant contact details. `Idempotency-Key` is stable across retries. A 2xx response acknowledges delivery. Failed requests retry with exponential backoff up to a six-hour interval; pending jobs survive restarts. Delivery is at least once: the receiver must deduplicate event IDs. A lease prevents concurrent workers from delivering the same job at the same time. The desk reports unconfigured, pending and retrying states. A stopped service cannot deliver jobs.

## Production deployment and migration

**A static deployment alone does not run SQLite, notifications or dynamic editorial SSR.** The existing `vpan` Vercel project serves vladdos.com. Its infrastructure access requires the owning team's grant; the implementation does not claim that the new backend is already deployed.

Preferred Foundation topology: one persistent Node/Docker service with a mounted SQLite volume and HTTPS reverse proxy. It can serve the complete website and API. Alternatively, keep Vercel for the frontend and use the included gateway to the persistent service.

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

For the split Vercel topology, set `INTAKE_SERVICE_ORIGIN` to the exact HTTPS origin of the persistent backend and the same strong `INTAKE_GATEWAY_TOKEN` on Vercel and the backend. The backend then requires that gateway key for API access and trusts forwarded client IPs only on authenticated gateway requests. `TRUST_PROXY=0` remains the default; enable it separately only behind a trusted reverse proxy. The gateway carries no database or admin key into the public client.

`vercel.json` preserves legacy redirects, serves prebuilt RU HTML for `?lang=ru`, and forwards `/api/*`, `/health`, RSS and dynamic guide pages to the persistent service. An unset/unreachable service returns 503 and cannot produce a false receipt. The gateway's cloud routing still needs verification in an authorised Vercel deployment; local tests do not establish that live routing works.

Rollback: restore the previous application image first. The original application tables remain compatible. Restore a backup only with the service stopped and after reconciling enquiries received since it was taken; blindly replacing a live database would lose newer records. Retain the newer database as a private recovery artifact.

## SEO and editorial continuity

Node SSR returns the correct EN/RU HTML and reciprocal alternates using the explicitly configured public HTTPS origin. A build generates both languages for all public static routes, a sitemap and robots rules. Administrative and internal shell pages are not indexed. Dynamic knowledge content is available from the persistent service; existing drafts, publication state and histories are retained. The old brand is normalized when legacy editorial content is read, without changing applicant data.

The retained growth worker can be disabled with `GROWTH_ENABLED=0`. Its optional AI/Search Console integrations require separate credentials; they are not needed for partner intake. No live AI publication or Search Console access was tested by mocked connector tests.

Read [the strategy and market sources](research/NETWORK_STRATEGY_2026-10-27_RU.md), [release verification](research/NETWORK_VERIFICATION_2026-10-27.md) and [design decisions](research/NETWORK_DESIGN_SYSTEM.md). Commercial, operator and legal particulars must reflect the real operating entity before public launch. The repository supplies no fabricated clients, licences, metrics or partnerships.
