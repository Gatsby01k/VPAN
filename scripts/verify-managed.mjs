// Writes one explicitly designated QA enquiry, verifies it, then closes it.
// Read a newly generated operations key from stdin; never put it in command arguments or files.
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
const writeTest = process.argv.includes('--write-test');
let input = '';
for await (const chunk of process.stdin) {
  input += chunk;
  if (input.includes('\n')) break;
}
const { deployment, adminToken } = JSON.parse(input);
if (
  !/^https:\/\/vpan-[a-z0-9-]+\.vercel\.app$/.test(deployment) ||
  !adminToken ||
  adminToken.length < 32
)
  throw new Error('Supply a verified vpan deployment URL and operations key through stdin.');
function request(route, { method = 'GET', body, privateRequest = true } = {}) {
  const args = [
    'curl',
    route,
    '--deployment',
    deployment,
    '--',
    '--silent',
    '--show-error',
    '--request',
    method,
  ];
  if (privateRequest) args.push('--header', '@-');
  if (body) args.push('--header', 'Content-Type: application/json', '--data', JSON.stringify(body));
  const result = spawnSync('vercel', args, {
    input: privateRequest ? 'Authorization: Bearer ' + adminToken + '\n' : '',
    encoding: 'utf8',
    maxBuffer: 2000000,
    timeout: 60000,
  });
  if (result.status !== 0)
    throw new Error(
      'Authenticated Vercel request failed; inspect deployment logs without printing credentials.',
    );
  let data;
  try {
    data = JSON.parse(result.stdout);
  } catch {
    throw new Error('Deployment returned an unexpected response.');
  }
  if (data.error) throw new Error(data.error);
  return data;
}
const health = request('/health', { privateRequest: false });
if (health.intake !== 'durable') throw new Error('Durable intake unavailable.');
const before = request('/api/admin/desk');
console.log(
  JSON.stringify({
    check: 'managed-health-and-admin',
    intake: health.intake,
    opportunities: before.opportunities.length,
    notifications: health.notifications,
  }),
);
if (writeTest) {
  const payload = {
    requestId: crypto.randomUUID(),
    side: 'need',
    industry: 'commerce',
    companyType: 'merchant',
    countries: ['brazil'],
    capabilities: ['collections'],
    company: 'VLADDOS QA — deployment verification, not a real lead',
    contact: 'deployment-qa@example.invalid',
    message:
      'Designated synthetic deployment test. Close after verification; no commercial or referral entitlement.',
    consent: true,
    attribution: { source: 'deployment-verification', campaign: '2026-11-10' },
  };
  const receipt = request('/api/opportunities', {
    method: 'POST',
    body: payload,
    privateRequest: false,
  });
  if (receipt.status !== 'received' || !/^VN-\d{4}-[A-F0-9]{10}$/.test(receipt.reference))
    throw new Error('Missing durable receipt.');
  const replay = request('/api/opportunities', {
    method: 'POST',
    body: payload,
    privateRequest: false,
  });
  if (replay.reference !== receipt.reference) throw new Error('Retry did not preserve receipt.');
  const after = request('/api/admin/desk'),
    row = after.opportunities.find((o) => o.reference === receipt.reference);
  if (!row || row.company_name !== payload.company || row.verification !== 'unverified')
    throw new Error('Enquiry did not persist with the expected privacy/verification boundary.');
  request('/api/admin/desk/opportunities/' + row.id, {
    method: 'PATCH',
    body: {
      status: 'closed',
      owner: 'deployment-verification',
      evidence:
        'Designated synthetic deployment verification completed. Not a real lead or commercial agreement.',
    },
  });
  const final = request('/api/admin/desk');
  if (final.opportunities.find((o) => o.id === row.id)?.status !== 'closed')
    throw new Error('QA enquiry was not closed.');
  console.log(
    JSON.stringify({
      check: 'cloud-intake-crm-idempotency',
      reference: receipt.reference,
      saved: true,
      retryStable: true,
      qaRecordClosed: true,
      agreementsCreated: 0,
      revenueCreated: 0,
    }),
  );
}
