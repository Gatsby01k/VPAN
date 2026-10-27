# VlaDDoS Network — verification, 27 October 2026

## Verified implementation

- `npm test`: **36 passed, 0 failed**, after the production TypeScript/client/SSR build and EN/RU prerendering.
- `npm run format:check`: passed. `git diff --check`: passed.
- The build emits 28 routes in each language, including the administrative and 404 pages. Public routes exclude old affiliate-role landing pages; Node and Vercel redirect those entry points to the appropriate new flow.
- Public asset directory: approximately 2.8 MB; build output approximately 4.2 MB. The client bundle is approximately 112 KB gzip and CSS 8.4 KB gzip. These are build sizes, not measured Core Web Vitals.

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

Screenshots are saved outside the repository in the workspace's `previews/network/`: `home-desktop.jpg`, `home-mobile-ru.jpg`, `connection-engine.jpg`, `deal-desk.jpg` and `saved-receipt.jpg`. Browser QA is evidence for the tested states, not an accessibility certification or a guarantee for every future content change.

## Deployment boundary

The connected Vercel project inspection identified project `vpan` with vladdos.com/www.vladdos.com domains and a Vite deployment. Infrastructure/integration/environment reads for its owning team returned **403 forbidden** and requested an explicit team-access grant. A native authorisation link was generated for the user; it expires and is not saved in source.

The release is implemented and tested locally. It has **not been published to the production domain** in this task. A persistent backend, production volume/backup, strong operations credential, notification receiver and cloud routing must be connected and verified. The included Vercel gateway is tested locally with a mock; its actual deployed rewrites have not been verified. A static deployment cannot substitute for the durable backend.

The implementation intentionally does not claim verified network coverage, existing provider relationships, revenue, regulatory licences or production delivery of notifications.
