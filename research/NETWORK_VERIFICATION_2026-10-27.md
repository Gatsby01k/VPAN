# VlaDDoS Network — verification, 27 October 2026

## Verified implementation

- `npm test`: **38 passed, 0 failed**, after the production TypeScript/client/SSR build and EN/RU prerendering.
- `npm run format:check`: passed. `git diff --check`: passed.
- The build emits 28 routes in each language, including the administrative and 404 pages. Public routes exclude old affiliate-role landing pages; Node and Vercel redirect those entry points to the appropriate new flow.
- Public asset directory: approximately 2.9 MB; build output approximately 4.8 MB. With the original design restored, the client bundle is approximately 119 KB gzip and CSS 34 KB gzip. These are build sizes, not measured Core Web Vitals.

## Automated evidence

The integration suite opens local HTTP servers against disposable SQLite files. It verifies:

- Intake → stored opportunity → returned reference; idempotent retry and changed-payload conflict.
- Mozambique supply classification, separate local methods/MZN settlement/desired PSP type, taxonomy validation and privacy consent.
- Contact deduplication without assuming that shared names/domains identify the same company.
- Protected operations endpoints and absence of private applications in public content.
- Actual-record candidate selection: opposite side, industry, overlapping country/capability, requested participant types, separate company and current qualification/expiry.
- Bilateral sharing-permission requirement for introduction; proposed introduction separated from an actual introduction.
- Agreement terms, attribution, date range, reporting currency and evidence. Statement records separated from received revenue, with immutable statement identity across status changes.
- Transaction rollback when audit history cannot be written.
- Scope changes reset verification and sharing permission before a new qualification.
- Additive/idempotent migration of old applications without changing their original rows or references. Legacy URLs/drafts retain countries, category mapping and relevant methods.
- Durable outbox failure/retry/restart behavior; stable notification event ID and no contact details in the mocked webhook body.
- Gateway fails closed without configured durable service, rejects non-allowlisted targets and preserves private responses as no-store.
- EN/RU server HTML, metadata, alternates, sitemap, administrative noindex, source-safe editorial behavior and permanent legacy redirects.
- Existing editorial/growth lease, publication-limit, connector-validation and private-data-separation tests continue to pass.

No tests call a real notification recipient, payment provider, AI generation service or Search Console property.

## Browser → API → SQLite → Deal Desk

The production Node server was launched locally on port 3100 with a separate QA database in `/private/tmp`, a test-only operations credential and growth disabled.

Through the browser, I OFFER → Payments & Fintech → Africa → Mozambique → local methods + settlement was selected. M-Pesa, e-Mola, bank transfers, MZN, local payment partner and desired PSP were selected as distinct attributes. A designated `example.com` fixture contact and visibly test-only company were submitted.

The UI returned reference `VN-2026-114EB23679`. A direct read of the QA SQLite file showed that exact reference, offer side, payments industry, Mozambique, the selected methods, MZN, local-partner and desired PSP. Status was `new`, verification `unverified`. The authenticated Deal Desk displayed the same company/reference and no eligible candidate. This is a local test result, not a real partner or deal.

The minimal I NEED flow was also submitted with Kenya/Payments preselected, one capability and an example.com contact. Reference `VN-2026-567A76313B` remained visible after reload, and the confirmation received keyboard focus. No company or long introduction was required.

The desk correctly displayed that notification delivery needed configuration, with one queued enquiry. Actual channel delivery was not claimed. The notification recovery test uses a mock HTTPS receiver.

A consistent backup of the QA database was created with `scripts/backup.mjs`; opening the resulting file returned `PRAGMA integrity_check = ok` and the preserved opportunity count. No production database was opened, migrated or replaced during this task.

## Responsive/browser QA

Home, Russian Connection Engine and Russian market index were checked at viewport widths 320, 768, 1024 and 1440. Document widths equalled the viewport widths and the inspected headings, copy, controls and links did not overflow horizontally. The Russian home was also inspected at 390×844, and the mobile menu opened with the translated navigation. The desktop Connection Engine and private record were inspected visually. The tested browser console contained no warnings/errors at the end of the flow.

Earlier screenshots of the superseded visual iteration are saved outside the repository in the workspace's `previews/network/`: `home-desktop.jpg`, `home-mobile-ru.jpg`, `connection-engine.jpg`, `deal-desk.jpg` and `saved-receipt.jpg`. Current restored-design evidence is under `previews/restored/`, including desktop and Russian mobile homepage screenshots. Browser QA is evidence for the tested states, not an accessibility certification or a guarantee for every future content change.

## Deployment boundary

The connected Vercel project inspection identified project `vpan` with vladdos.com/www.vladdos.com domains and a Vite deployment. Initial infrastructure reads returned **403 forbidden**. After a native team-authorisation link was supplied, access became available; the project had no environment variables configured. An existing team-level Neon installation was visible, but no database was provisioned or attached in this task.

The user explicitly authorised pushing `codex/vladdos-network-foundation` to the existing GitHub remote and generating its Vercel preview. The branch was pushed and a preview reached READY. Protected HTTP checks confirmed EN pages, redirects, a real 404 and an honest 503 for the unconfigured backend. A language-routing issue was found: Vercel filesystem precedence could bypass the RU query rewrite. The build now puts static documents behind internal `__pages/en` and `__pages/ru` routes; a regression test covers that structure.

The user then clarified that the original design must be developed, not replaced. The original homepage, character, signature, art scenes, brief layout, header/footer, market cards, country and About compositions, and Contact scene were restored. New business content, taxonomy, two-sided intake and Deal Desk remain. The restored homepage brief was exercised in the browser: I OFFER → Payments & Fintech → Africa → Mozambique → Local payment methods carried into `/join`; the synthetic request received `VN-2026-C38304E531` in a separate QA database. Automated coverage checks original artwork and page structures alongside the new routes.

Preview browser access remains protected by Vercel login. Automatic approval review rejected creating a temporary share URL because it would expand access. No alternate sharing mechanism was used after that rejection. Local browser QA verifies the restored design; deployment READY does not by itself prove authenticated cloud browser behavior.

Production has not been changed. A persistent backend, production volume/backup, strong operations credential and notification receiver must still be connected and verified before live intake. The included gateway fails honestly when that service is absent. No production database was opened or migrated.

The implementation intentionally does not claim verified network coverage, existing provider relationships, revenue, regulatory licences or production delivery of notifications.
