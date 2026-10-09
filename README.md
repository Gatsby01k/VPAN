# PAN — Private Affiliate Network

Independent public-facing website and private partner intake for PAN. **No other internal platform is referenced publicly.** Built around the PAN original black/gold/magenta artwork.

## Start locally

Requires Node.js >=22.13.0. No `npm install` needed.

```bash
cp .env.example .env
# Edit ADMIN_TOKEN (strong random value), ALLOWED_ORIGIN, and DB_PATH for deployment.
npm start
# Open http://localhost:3000
npm test
```

The app uses Node.js built-ins and `node:sqlite` (experimental on Node 22). No external runtime dependencies. `server.mjs` serves assets and the SPA, stores every successful partner application in SQLite, rate-limits submissions, validates server-side inputs, prevents duplicate submissions by request ID, provides a restricted admin inbox, and audits status changes. A successful application response means a database insert actually completed. **Persistence requires a writable disk; do not deploy it as an ephemeral serverless function.**

### Site map
- `/` — branded main website
- `/affiliates`, `/teams`, `/payment-partners` — tailored partner propositions
- `/markets`, `/markets/:slug` — local GEO pages and filters
- `/apply` — three-step partner application
- `/about`, `/privacy`, `/terms` — informational and legal pages
- `/admin` — token-protected partner review page (configure `ADMIN_TOKEN`)

### Production prerequisites

1. Deploy as a persistent Node.js service (VPS/container) with HTTPS reverse proxy. Set `DB_PATH` to a persistent mounted volume. Back up the SQLite database, restrict volume permissions and set a secure `ADMIN_TOKEN` (at least 32 random characters).
2. Set `ALLOWED_ORIGIN` to the production origin (for example `https://vladdos.com`), set `TRUST_PROXY=1` only behind a trusted reverse proxy, and secure the `/admin` page separately at the edge if feasible.
3. Confirm the real contact inbox / Telegram account and review actual operator identification, privacy policy and service terms before commercial launch.
4. Disallow unsupported business categories and verify permitted payment partnerships per market. The site **does not claim live processing** or list fake operators, volumes or testimonials.
5. Use PostgreSQL + external audit/backup strategy if multiple server replicas or heavy concurrent write traffic become necessary; SQLite is an intentional single-node launch solution.

### Brand assets
`public/assets/*.webp` were derived and optimized **from the PAN original reference archive supplied by the owner**, not from stock or generated images. High-resolution masters should remain outside the production repo. Art is for marketing pages; administrative pages remain quiet and readable.

### Privacy and security notes
Application information is stored in a local database, not logged as a fallback. Requests must pass server-side validation and same-origin checks for configured production origins. Admin credentials are held only in browser memory and sent over HTTPS using the Authorization header. Add a hosted IAM solution / SSO and monitoring before scaling to a staff team.

### Tests

```bash
npm test
```

The test suite checks asset delivery, route rendering, application validation, duplicate request idempotency, origin checks, admin access and status changes.