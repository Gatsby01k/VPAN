# Site audit — 27 October 2026

## Resolved

- Shared region → country hierarchy across the catalogue, brief, quick navigation and application. Region URLs use `africa`, `asia`, `latam`; countries are grouped and sorted within their regions. Search supports country names, currencies and methods.
- Country breadcrumbs return to the matching region. Region names on the home page are real links. Chapter order is 02 connection, 03 people, 04 brief, 05 exchange, 06 contact invitation.
- New applications have no implicit Ghana or business sector. Region changes clear stale country/method choices. Brief country order is preserved; additional countries show their own region and currency. Removing a country removes its irrelevant methods.
- All five application roles remain available. Drafts survive navigation and language changes. Fresh payload edits get fresh retry IDs; identical retries retain their ID. The API rejects an already-used ID with different details.
- Successful intake keeps a contact-free session receipt across reload. A new introduction clears that receipt. Timeout, unavailable API, invalid contact, sector and optional-name states give actionable feedback. Invalid optional fields are revealed and focused.
- Frontend and API use the same 1500-character introduction limit; longer API messages are rejected rather than truncated.
- A static publication prepares a reviewable email and copyable introduction when `/health` is unavailable. No server receipt is shown in this mode, and the visitor must send the email themselves.
- Normalized icon strokes and spacing, replaced text arrows in action controls, removed a decorative control-shaped arrow, corrected header menu breakpoints, strengthened label contrast and font sizes, added real Cyrillic font weights, fixed exchange heading clipping and footer/button collisions.

## Verification performed

- Production build with TypeScript validation; 23 routes prerendered.
- 24 automated tests passed, including geography, application defaults, draft migration, validation, email construction, SQLite intake, retry conflicts and existing growth/admin behavior.
- Browser checks at widths 320, 390, 768, 1024, 1366 and 1586. Main page templates checked for text/control overflow; EN/RU home headings and exchange footer spacing checked on desktop widths. Offscreen honeypot input is intentional.
- Browser flow: region filter → currency search → country breadcrumb → application; brief selections in two regions → preserved application choices; region change → dependent country options; mobile menu → quick navigation → trimmed country search.
- Browser → API → disposable SQLite: a Telegram-only regional partner introduction for India saved with the exact reference shown by the UI. Receipt survived reload; new-introduction reset worked.
- Static local server without API: application prepared an email with the correct country/region/contact/message and clearly showed that it had not been sent. No real email was sent.
- Invalid name inside collapsed optional details reopened the details and focused the field. Final contact-page console contained no warnings or errors.

## Hosting boundary

The repository's public homepage, `https://vpan-five.vercel.app`, served the static frontend and returned a Vercel 404 for `/health` during this audit. Vercel project-management access returned 403, so no infrastructure or database settings were changed. The email path makes the static contact flow usable; automatic SQLite intake and the content worker still require the documented persistent Node deployment. This audit does not claim those services are running on Vercel.

Browser screenshots were saved outside the repository in the workspace `previews` directory. This verification covers the tested browsers, dimensions and flows; it is not a guarantee against every future content or platform change.
