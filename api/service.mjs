// Same-origin gateway to a persistent service. SQLite never runs in this function.
export const config = { maxDuration: 30 };
const unavailable =
  'The intake service is temporarily unavailable. Receipt is not confirmed; retry with the same request ID.';
export default async function service(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const fail = (status, error) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    if (status === 503) res.setHeader('Retry-After', '30');
    return res.end(JSON.stringify({ error }));
  };
  const origin = process.env.INTAKE_SERVICE_ORIGIN || '';
  const token = process.env.INTAKE_GATEWAY_TOKEN || '';
  let backend;
  try {
    backend = new URL(origin);
    if (
      backend.protocol !== 'https:' ||
      backend.origin !== origin ||
      token.length < 32 ||
      backend.host === req.headers.host
    )
      throw new Error();
  } catch {
    return fail(503, 'The intake service is not configured. No enquiry has been saved.');
  }
  const input = new URL(req.url, 'https://local.invalid');
  const routes = input.searchParams.getAll('_route');
  const route = routes[0] || '';
  if (
    routes.length !== 1 ||
    !/^\/(?:api\/(?:opportunities|apply|content|events|admin\/[a-z0-9\/-]+)|health|feed\.xml|knowledge\/[a-z0-9-]{1,100})$/.test(
      route,
    )
  )
    return fail(404, 'Not found.');
  if (!['GET', 'HEAD', 'POST', 'PATCH'].includes(req.method))
    return fail(405, 'Method not allowed.');
  input.searchParams.delete('_route');
  const target = new URL(route, backend);
  target.search = input.searchParams.toString();
  const headers = {
    Accept: req.headers.accept || 'application/json',
    'x-intake-gateway-key': token,
  };
  for (const name of ['authorization', 'origin', 'content-type', 'dnt', 'sec-gpc', 'user-agent'])
    if (typeof req.headers[name] === 'string') headers[name] = req.headers[name];
  // Vercel overwrites this header. The backend accepts it only after gateway authentication.
  if (typeof req.headers['x-vercel-forwarded-for'] === 'string')
    headers['x-forwarded-for'] = req.headers['x-vercel-forwarded-for'];
  try {
    let body;
    if (!['GET', 'HEAD'].includes(req.method)) {
      if (Number(req.headers['content-length']) > 12000) return fail(413, 'Request is too large.');
      if (req.body !== undefined)
        body = Buffer.isBuffer(req.body)
          ? req.body
          : Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
      else {
        const chunks = [];
        let size = 0;
        for await (const chunk of req) {
          const data = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          size += data.length;
          if (size > 12000) return fail(413, 'Request is too large.');
          chunks.push(data);
        }
        body = Buffer.concat(chunks);
      }
      if (body.length > 12000) return fail(413, 'Request is too large.');
    }
    const response = await fetch(target, {
      method: req.method,
      headers,
      body,
      redirect: 'manual',
      signal: AbortSignal.timeout(25000),
    });
    // A redirected or HTML login response must never masquerade as intake receipt.
    if (response.status >= 300 && response.status < 400) return fail(503, unavailable);
    if (
      (route.startsWith('/api/') || route === '/health') &&
      !response.headers.get('content-type')?.includes('application/json')
    ) {
      await response.body?.cancel();
      return fail(503, unavailable);
    }
    res.statusCode = response.status;
    for (const name of [
      'content-type',
      'content-language',
      'content-security-policy',
      'x-content-type-options',
      'referrer-policy',
      'retry-after',
    ]) {
      const value = response.headers.get(name);
      if (value) res.setHeader(name, value);
    }
    if (req.method === 'HEAD') return res.end();
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    return fail(503, unavailable);
  }
}
