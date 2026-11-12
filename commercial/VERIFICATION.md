# Release verification

Verified 10–12 November 2026 on `Gatsby01k/VPAN` and the Vercel `vpan` project. [Public site](https://www.vladdos.com).

| Check | Observed result |
| --- | --- |
| Build and regression suite | `npm test` built and prerendered 31 routes in English and Russian. All 75 tests passed. |
| Persistent production intake | The approved Turso Starter database `vpan-commercial` is bound to production. `/health` returned HTTP 200 with `intake: durable` through the production Vercel function. |
| Production write and replay | Synthetic enquiry `VN-2026-C961F9F089` returned the same reference on replay. An authenticated Deal Desk read found the row. It was marked `deployment-verification`, closed and excluded from founder metrics. |
| Desktop and mobile | Checked the home page, six role entries and both brief flows at 1440 × 900 and 390 × 844. Disposable local browser submissions returned receipts for I NEED and I OFFER. The I OFFER test persisted a pending referral claim. |
| Direct links | The public I NEED link preserved the merchant role, Brazil and payment collection at 390px. The Russian I OFFER link preserved the PSP role, Ghana and settlement at 1440px. The Asia/Thailand filter displayed one result. The browser reported zero console errors on these checks. |
| Private access and indexing | The unauthenticated Deal Desk API returned 401 with `Cache-Control: no-store`. The admin page and real 404 were excluded from indexing. Seven key routes passed English and Russian SSR checks. Legacy redirect preserved context. |
| Commercial ledger and approval | Automated tests exercised mandate and introduction agreements, idempotency, duplicate attribution, sub-partner splits, dispute and collection holds, partial payouts and recoveries, period reminders, conversion, approval and suppression using fixtures. |
| Notifications and restore | A local test receiver acknowledged a retried durable notification. A disposable SQLite backup reopened with `PRAGMA integrity_check` returning `ok`. Production health reports `notifications: unconfigured`, the sole failure in the read-only release check. A Turso recovery drill requires a separate recovery database and Turso access. |

## Operator handoff

- Open `/admin` with the production `ADMIN_TOKEN`. The deployment used a generated Secret variable. For operator access, set a key you control in the Vercel production environment and redeploy. [Vercel environment settings](https://vercel.com/vbms-projects-f484b1c6/vpan/settings/environment-variables).
- For external notifications, configure the chosen authenticated HTTPS receiver and its secret in Vercel. Verify a fresh designated enquiry through to an acknowledged delivery. Pending submissions are already accessible in Deal Desk.
- AI drafting requires the configured AI Gateway credentials and a tested model. Evidence-based drafts work without credentials. An operator reviews each outreach and sends it through an approved channel.
- The commercial ledger starts with actual counterparties, signed schedules and documented collections. The cloud database is newly provisioned. Historical Telegram messages and any historical volume require an identified source and a deliberate import.
- The 10 November Turso-backed release `dpl_Guk966xFJqmJgT4qnkGakdC8NC52` is a code rollback point. Confirm the recovery window for this Marketplace plan before restoring cloud data to a separate database. [Turso point-in-time recovery](https://docs.turso.tech/features/point-in-time-recovery).
