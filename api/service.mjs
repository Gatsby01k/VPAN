// Same-origin gateway for an existing Vercel frontend and a persistent Node intake service.
// Never stores SQLite on a serverless filesystem; no backend origin is bundled into the client.
export const config = { maxDuration: 30 };
export default async function service(req, res) {
  const origin = process.env.INTAKE_SERVICE_ORIGIN || '';
  let backend;
  try {
    backend = new URL(origin);
    if (backend.protocol !== 'https:' || backend.origin !== origin) throw new Error();
  } catch {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    return res.end(
      JSON.stringify({ error: 'The intake service is not configured. No enquiry has been saved.' }),
    );
  }
  const input = new URL(req.url, 'https://local.invalid');
  const route = input.searchParams.get('_route') || '';
  if (
    !/^\/(?:api\/(?:opportunities|apply|content|events|admin\/[a-z0-9\/-]+)|health|feed\.xml|knowledge\/[a-z0-9-]{1,100})$/.test(
      route,
    )
  ) {
    res.statusCode = 404;
    return res.end();
  }
  input.searchParams.delete('_route');
  const target = new URL(route, backend);
  target.search = input.searchParams.toString();
  const headers = { Accept: req.headers.accept || 'application/json' };
  if (process.env.INTAKE_GATEWAY_TOKEN)
    headers['x-intake-gateway-key'] = process.env.INTAKE_GATEWAY_TOKEN;
  for (const name of ['authorization', 'origin', 'content-type', 'dnt', 'sec-gpc', 'user-agent'])
    if (typeof req.headers[name] === 'string') headers[name] = req.headers[name];
  // Only trust Vercel's overwritten client IP when the backend explicitly trusts this gateway.
  if (typeof req.headers['x-vercel-forwarded-for'] === 'string')
    headers['x-forwarded-for'] = req.headers['x-vercel-forwarded-for'];
  let body;
  if (!['GET', 'HEAD'].includes(req.method)) {
    if (req.body !== undefined)
      body = Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
    else {
      const chunks = [];
      let size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 12000) {
          res.statusCode = 413;
          return res.end();
        }
        chunks.push(chunk);
      }
      body = Buffer.concat(chunks);
    }
    if (body.length > 12000) {
      res.statusCode = 413;
      return res.end();
    }
  }
  try {
    const response = await fetch(target, {
      method: req.method,
      headers,
      body,
      redirect: 'manual',
      signal: AbortSignal.timeout(25000),
    });
    res.statusCode = response.status;
    for (const name of [
      'content-type',
      'content-language',
      'content-security-policy',
      'x-content-type-options',
      'referrer-policy',
    ]) {
      const v = response.headers.get(name);
      if (v) res.setHeader(name, v);
    }
    res.setHeader('Cache-Control', 'no-store');
    if (req.method === 'HEAD') return res.end();
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.end(
      JSON.stringify({
        error:
          'The intake service is temporarily unavailable. Receipt is not confirmed; retry with the same request ID.',
      }),
    );
  }
}
