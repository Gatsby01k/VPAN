import https from 'node:https';
import { lookup } from 'node:dns/promises';
import { BlockList, isIP } from 'node:net';

const blocked = new BlockList();
for (const [address, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
])
  blocked.addSubnet(address, prefix, 'ipv4');
for (const [address, prefix] of [
  ['2001::', 23],
  ['2001:db8::', 32],
  ['2002::', 16],
])
  blocked.addSubnet(address, prefix, 'ipv6');
const globalV6 = new BlockList();
globalV6.addSubnet('2000::', 3, 'ipv6');
export function publicAddress(address) {
  const family = isIP(address);
  if (family === 4) return !blocked.check(address, 'ipv4');
  if (family === 6) return globalV6.check(address, 'ipv6') && !blocked.check(address, 'ipv6');
  return false;
}
export function researchUrl(source, website) {
  const url = new URL(source),
    official = new URL(website);
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.port ||
    url.hash ||
    url.search ||
    url.hostname !== official.hostname ||
    isIP(url.hostname.replace(/^\[|\]$/g, '')) ||
    !url.hostname.includes('.') ||
    /(^|\.)(linkedin|facebook|instagram|x|twitter)\.com$/.test(url.hostname)
  )
    throw new Error(
      'Research only a query-free HTTPS page on the official company hostname. Social platforms and IP literals are excluded.',
    );
  return url;
}
export function extractResearch(html) {
  const result = html
    .replace(/<(script|style|nav|footer|header)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(?:nbsp|amp|quot|lt|gt|#\d+);/g, ' ')
    .replace(/\b[^\s@]+@[^\s@]+\.[^\s@]+\b/g, '[contact omitted]')
    .replace(/\s+/g, ' ')
    .trim();
  if (
    result.length < 120 ||
    /captcha|access denied|enable javascript|just a moment/i.test(result.slice(0, 1200))
  )
    throw new Error('Source cannot be verified from readable public content. Review it manually.');
  return result.slice(0, 1800);
}
// One user-requested page, no crawling. Resolve once, reject any private result and pin TLS to that address.
export async function readCompanySource(
  source,
  website,
  { resolve = lookup, transport = https.request } = {},
) {
  const url = researchUrl(source, website),
    addresses = await resolve(url.hostname, { all: true });
  if (!addresses.length || addresses.some((a) => !publicAddress(a.address)))
    throw new Error('Source does not resolve exclusively to public addresses.');
  const chosen = addresses[0];
  return new Promise((resolve, reject) => {
    const req = transport(
      url,
      {
        method: 'GET',
        agent: false,
        headers: {
          Accept: 'text/html,text/plain',
          'User-Agent': 'VlaDDoS-CompanyResearch/1.0 (single-page human-requested review)',
        },
        lookup: (_hostname, options, done) =>
          options.all ? done(null, [chosen]) : done(null, chosen.address, chosen.family),
      },
      (res) => {
        if (
          res.statusCode !== 200 ||
          !/^(text\/html|text\/plain)\b/.test(res.headers['content-type'] || '')
        ) {
          res.destroy();
          reject(new Error('Source returned a redirect, restriction or unsupported content.'));
          return;
        }
        const chunks = [];
        let size = 0;
        res.on('data', (chunk) => {
          size += chunk.length;
          if (size > 200000) {
            res.destroy(new Error('Source exceeded the 200 KB review limit.'));
            return;
          }
          chunks.push(chunk);
        });
        res.on('end', () => {
          try {
            resolve(extractResearch(Buffer.concat(chunks).toString('utf8')));
          } catch (e) {
            reject(e);
          }
        });
        res.on('error', reject);
      },
    );
    const timer = setTimeout(() => req.destroy(new Error('Source review timed out.')), 10000);
    req.on('close', () => clearTimeout(timer));
    req.on('error', reject);
    req.end();
  });
}
