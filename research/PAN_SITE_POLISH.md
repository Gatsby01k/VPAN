# PAN — site polish audit

This pass addresses concrete UI and state defects across the home page, navigation, partner brief, application, market pages, guides and administrative screens. The approved identity, artwork and desktop composition are retained.

## Corrections

- Query-only language changes preserve scroll position. Navigating to another page or selecting an anchor still scrolls to the destination.
- Home/profile restoration depends on actual profile parameters rather than language or attribution queries. Changing EN/RU no longer restores over current choices when storage is unavailable. Shared profile/application links include the selected language.
- The partner brief uses consistent formal Russian. The brand's accessible home-link name is localized.
- The disabled brief action keeps its gray appearance; disabled export controls do not change color on hover.
- Mobile rail navigation clears the fixed header. Mobile summary tracks grow with their content, statistics headings wrap, and the primary module reserves separate rows for its heading, instrument and controls.
- Application entry restoration ignores language and campaign changes. A genuine new entry cancels the old request and clears its feedback. Sending locks the editable step and exposes a busy state; errors receive focus and appropriate scrolling.
- Final application submission rechecks markets and field limits, including restored drafts. Invalid/non-JSON server replies, rate limiting and clipboard failures have useful localized feedback. Confirmation shows completed progress and localized country names.
- Market search includes country codes and regions. Russian region labels, result counts, breadcrumbs and accordion semantics are consistent.
- Guide search includes market names, methods and roles. Empty, loading, temporarily unavailable and not-found states are distinguished. Request status belongs to the current path, preventing a transient false 404 during navigation. Existing full server-rendered guides survive background request failures.
- Copied/downloaded guide URLs preserve language. Clipboard failure is visible, successful copy state expires/resets, country names are localized and empty related-guide sections are omitted.
- Admin logout cancels pending list/status requests and clears busy flags. Refresh and status writes are serialized, and late responses cannot restore a signed-out session.
- Administrative publishing actions wait for loaded state. Polling resumes after individual request failures, requests do not overlap, cleanup cancels pending work, and publication previews derive from fresh report data.

## Verification

- Production TypeScript/client/SSR build passed; 23 pages prerendered.
- Full repository formatting and whitespace checks passed.
- All 16 existing integration tests passed, covering public routes, stored applications, validation, idempotency, admin access, source attribution and publishing behavior.
- A separate HTTP audit used a temporary SQLite database: 50 EN/RU page variants returned 200 with one main heading, correct document language and unique IDs. Same-page anchors resolved, 134 internal destinations and 10 referenced HTTP assets returned 200. Missing pages returned 404; the unauthenticated inbox returned 401.
- Ten font/background resources referenced by the built CSS exist in the production output. Embedded SVG filter fragments were treated as data, not file URLs.
- Shared state, request cancellation, keyboard semantics, narrow layouts and reduced-motion handling were reviewed independently in source.

Full browser viewport and interaction testing is unavailable under the existing browser URL-policy restriction. Source layout calculations, SSR/HTTP checks and tests do not claim browser screenshots or certify every viewport visually.
