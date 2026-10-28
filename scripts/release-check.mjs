// Read-only smoke checks. Passing these is not evidence of a completed intake E2E.
const raw = process.argv[2];
if (!raw) throw new Error('Usage: npm run release:check -- https://candidate-host');
const origin = new URL(raw).origin;
if (!['https:', 'http:'].includes(new URL(origin).protocol))
  throw new Error('Use an HTTP(S) origin.');
let failed = false;
async function check(name, task) {
  try {
    await task();
    console.log('PASS ' + name);
  } catch (e) {
    failed = true;
    console.error('FAIL ' + name + ': ' + e.message);
  }
}
const get = (route, options) =>
  fetch(origin + route, { redirect: 'manual', signal: AbortSignal.timeout(15000), ...options });
for (const lang of ['en', 'ru'])
  for (const route of [
    '/',
    '/network',
    '/industries',
    '/markets/mozambique',
    '/join',
    '/find-a-partner',
    '/contact',
  ]) {
    await check(`${route} ${lang} SSR`, async () => {
      const r = await get(route + '?lang=' + lang),
        html = await r.text();
      if (
        r.headers.get('x-robots-tag')?.includes('noindex') ||
        /<meta name="robots" content="[^"]*noindex/.test(html) ||
        r.status !== 200 ||
        !html.includes(`<html lang="${lang}"`) ||
        !html.includes('rel="canonical"') ||
        !html.includes('hreflang="x-default"')
      )
        throw new Error(`HTTP ${r.status} or incomplete language/metadata`);
    });
  }
await check('intake service health', async () => {
  const r = await get('/health');
  const data = await r.json();
  if (!r.ok || data.intake !== 'durable')
    throw new Error('Persistent intake is unavailable; no production receipt can be verified.');
  if (data.notifications !== 'configured')
    throw new Error('Notification receiver is not configured.');
});
await check('private API rejects unauthenticated access', async () => {
  const r = await get('/api/admin/desk');
  if (r.status !== 401) throw new Error(`Expected 401, got ${r.status}`);
  if (r.headers.get('cache-control') !== 'no-store')
    throw new Error('Private response must be no-store.');
});
await check('legacy URL retains its context', async () => {
  const r = await get('/apply?role=provider&country=mozambique&lang=ru');
  if (
    ![301, 308].includes(r.status) ||
    !r.headers.get('location')?.includes('/join') ||
    !r.headers.get('location')?.includes('country=mozambique')
  )
    throw new Error('Legacy redirect lost context.');
});
await check('admin and unknown routes stay non-indexable', async () => {
  for (const route of ['/admin', '/not-a-real-page']) {
    const r = await get(route),
      html = await r.text();
    if (!(html.includes('noindex') || r.headers.get('x-robots-tag')?.includes('noindex')))
      throw new Error(route + ' lacks noindex');
    if (route !== '/admin' && r.status !== 404) throw new Error('Unknown page must return 404.');
  }
});
console.log(
  'Release still requires a designated test enquiry → reference → authenticated Deal Desk row → acknowledged notification, plus backup/rollback verification. No write was made by this check.',
);
process.exitCode = failed ? 1 : 0;
