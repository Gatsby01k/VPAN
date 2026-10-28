import crypto from 'node:crypto';
import taxonomy from '../shared/taxonomy.json' with { type: 'json' };

const error = (message, status = 422) => Object.assign(new Error(message), { status });
const str = (value, max = 180) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
const ids = (key) => new Set(taxonomy[key].map((item) => item.id));
const valid = Object.fromEntries(
  ['industries', 'countries', 'capabilities', 'companyTypes'].map((key) => [key, ids(key)]),
);
const states = new Set([
  'new',
  'review',
  'qualified',
  'discussion',
  'agreed',
  'closed',
  'unsuitable',
]);
const verificationStates = new Set(['unverified', 'in-review', 'verified', 'rejected']);
const digest = (value) => crypto.createHash('sha256').update(value).digest('hex');
const now = () => new Date().toISOString();
const validDate = (value) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value || '') &&
  Number.isFinite(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value;
const asJson = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};
const record = (row) =>
  row ? { ...row, profile: asJson(row.profile), attribution: asJson(row.attribution) } : row;
function list(value, allowed, required = true) {
  if (
    !Array.isArray(value) ||
    value.length > 15 ||
    value.some((item) => typeof item !== 'string' || !allowed.has(item))
  )
    throw error('Select valid options from the current catalogue.');
  const result = [...new Set(value)].sort();
  if (required && !result.length) throw error('Choose at least one option.');
  return result;
}
export function validateOpportunity(body) {
  if (!['need', 'offer'].includes(body.side)) throw error('Choose I NEED or I OFFER.');
  if (!valid.industries.has(body.industry)) throw error('Choose an industry.');
  const countries = list(body.countries, valid.countries);
  const capabilities = list(body.capabilities, valid.capabilities);
  const contact = str(body.contact).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) && !/^@[a-z][a-z0-9_]{4,31}$/.test(contact))
    throw error('Enter a valid business email or Telegram username.');
  if (body.consent !== true) throw error('Please agree to the privacy notice.');
  if (typeof body.message === 'string' && body.message.length > 1500)
    throw error('Keep your introduction within 1500 characters.');
  const methods = list(
    body.methods || [],
    new Set(taxonomy.countries.filter((c) => countries.includes(c.id)).flatMap((c) => c.methods)),
    false,
  );
  const companyType = valid.companyTypes.has(body.companyType)
    ? body.companyType
    : body.side === 'offer' &&
        capabilities.some((c) => ['local-methods', 'collections', 'payouts'].includes(c))
      ? 'local-partner'
      : 'strategic';
  const optional = {};
  for (const key of ['licensingContext', 'commercialIntent']) {
    if (typeof body[key] === 'string' && body[key].length > 600)
      throw error('Keep operating and commercial context within 600 characters.');
    const value = str(body[key], 600);
    if (value) optional[key] = value;
  }
  if (body.licensingStatus) {
    if (!['licensed', 'agent', 'not-required', 'unsure'].includes(body.licensingStatus))
      throw error('Choose a valid operating role.');
    optional.licensingStatus = body.licensingStatus;
  }
  return {
    side: body.side,
    industry: body.industry,
    countries,
    capabilities,
    methods,
    companyType,
    contact,
    company: str(body.company),
    message: str(body.message, 1500),
    targetType: valid.companyTypes.has(body.targetType) ? body.targetType : '',
    settlementCurrencies: [
      ...new Set(taxonomy.countries.filter((c) => countries.includes(c.id)).map((c) => c.currency)),
    ].filter(
      (c) => Array.isArray(body.settlementCurrencies) && body.settlementCurrencies.includes(c),
    ),
    attribution: {
      source: str(body.attribution?.source, 100),
      campaign: str(body.attribution?.campaign, 100),
      ref: str(body.attribution?.ref, 100),
      ...Object.fromEntries(
        ['medium', 'landing', 'referrer'].flatMap((key) => {
          const value = str(body.attribution?.[key], key === 'landing' ? 180 : 120);
          return value ? [[key, value]] : [];
        }),
      ),
    },
    language: body.language === 'ru' ? 'ru' : 'en',
    consentVersion: '2026-10-27',
    ...optional,
  };
}
function transaction(db, fn) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}
export function migrateDesk(db) {
  transaction(db, () => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS network_companies (id TEXT PRIMARY KEY, identity_key TEXT UNIQUE NOT NULL, name TEXT NOT NULL, created_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS network_contacts (id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES network_companies(id), contact TEXT UNIQUE NOT NULL, created_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS opportunities (
        id TEXT PRIMARY KEY, reference TEXT UNIQUE NOT NULL, request_key TEXT UNIQUE NOT NULL, payload_hash TEXT NOT NULL,
        company_id TEXT NOT NULL REFERENCES network_companies(id), side TEXT NOT NULL, industry TEXT NOT NULL,
        profile TEXT NOT NULL, attribution TEXT NOT NULL DEFAULT '{}', status TEXT NOT NULL DEFAULT 'new',
        verification TEXT NOT NULL DEFAULT 'unverified', evidence TEXT NOT NULL DEFAULT '', share_consent INTEGER NOT NULL DEFAULT 0,
        owner TEXT NOT NULL DEFAULT '', follow_up TEXT NOT NULL DEFAULT '', expires_at TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL, updated_at TEXT NOT NULL, legacy_id TEXT UNIQUE
      );
      CREATE INDEX IF NOT EXISTS idx_opportunity_pipeline ON opportunities(status, side, industry);
      CREATE TABLE IF NOT EXISTS desk_events (id INTEGER PRIMARY KEY AUTOINCREMENT, opportunity_id TEXT NOT NULL REFERENCES opportunities(id), at TEXT NOT NULL, kind TEXT NOT NULL, detail TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS introductions (id TEXT PRIMARY KEY, demand_id TEXT NOT NULL REFERENCES opportunities(id), supply_id TEXT NOT NULL REFERENCES opportunities(id), status TEXT NOT NULL DEFAULT 'proposed', evidence TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE(demand_id,supply_id));
      CREATE TABLE IF NOT EXISTS agreements (id TEXT PRIMARY KEY, introduction_id TEXT NOT NULL REFERENCES introductions(id), model TEXT NOT NULL, terms TEXT NOT NULL, attribution TEXT NOT NULL, currency TEXT NOT NULL, rate_bps INTEGER, starts_on TEXT NOT NULL, ends_on TEXT NOT NULL, evidence TEXT NOT NULL, created_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS revenue_entries (id TEXT PRIMARY KEY, agreement_id TEXT NOT NULL REFERENCES agreements(id), period TEXT NOT NULL, amount_minor INTEGER NOT NULL, currency TEXT NOT NULL, status TEXT NOT NULL, evidence TEXT NOT NULL, created_at TEXT NOT NULL, UNIQUE(agreement_id,period,evidence));
      CREATE TABLE IF NOT EXISTS notification_outbox (id TEXT PRIMARY KEY, opportunity_id TEXT NOT NULL UNIQUE REFERENCES opportunities(id), reference TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, next_at TEXT NOT NULL, lease_until TEXT NOT NULL DEFAULT '', delivered_at TEXT NOT NULL DEFAULT '', last_error TEXT NOT NULL DEFAULT '');
    `);
    if (
      !db
        .prepare('PRAGMA table_info(revenue_entries)')
        .all()
        .some((c) => c.name === 'statement_ref')
    ) {
      db.exec(
        "ALTER TABLE revenue_entries ADD COLUMN statement_ref TEXT NOT NULL DEFAULT ''; UPDATE revenue_entries SET statement_ref=evidence;",
      );
    }
    db.exec(
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_revenue_statement ON revenue_entries(agreement_id,period,statement_ref)',
    );
    // Additive import only: the original application rows and references remain untouched.
    const rows = db
      .prepare(
        'SELECT * FROM applications WHERE id NOT IN (SELECT legacy_id FROM opportunities WHERE legacy_id IS NOT NULL)',
      )
      .all();
    for (const row of rows) {
      const contact = (row.email || row.telegram || 'legacy:' + row.id).toLowerCase();
      const companyId = company(db, contact, row.company || row.name, row.created_at);
      db.prepare(
        `INSERT INTO opportunities(id,reference,request_key,payload_hash,company_id,side,industry,profile,attribution,status,created_at,updated_at,legacy_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      ).run(
        row.id,
        row.reference,
        'legacy:' + row.request_key,
        '',
        companyId,
        'unclassified',
        '',
        JSON.stringify({
          legacy: true,
          role: row.role,
          markets: row.markets,
          methods: row.methods,
          message: row.message,
          category: row.category,
          name: row.name,
        }),
        row.attribution || '{}',
        row.status,
        row.created_at,
        row.updated_at,
        row.id,
      );
      for (const history of db
        .prepare('SELECT * FROM audit_log WHERE application_id=? ORDER BY id')
        .all(row.id))
        db.prepare('INSERT INTO desk_events(opportunity_id,at,kind,detail) VALUES(?,?,?,?)').run(
          row.id,
          history.at,
          'legacy-status',
          String(history.from_status || 'new') + ' → ' + history.to_status,
        );
    }
  });
}
function company(db, contact, name, at) {
  const known = db.prepare('SELECT company_id FROM network_contacts WHERE contact=?').get(contact);
  if (known) return known.company_id;
  // A shared email domain or company name is not proof of a shared legal entity.
  const key = digest(contact),
    id = crypto.randomUUID();
  db.prepare('INSERT INTO network_companies(id,identity_key,name,created_at) VALUES(?,?,?,?)').run(
    id,
    key,
    name || 'Company not yet supplied',
    at,
  );
  db.prepare('INSERT INTO network_contacts(id,company_id,contact,created_at) VALUES(?,?,?,?)').run(
    crypto.randomUUID(),
    id,
    contact,
    at,
  );
  return id;
}
export function createDesk(
  db,
  { notificationUrl = '', notificationSecret = '', send = fetch } = {},
) {
  migrateDesk(db);
  let sending = false,
    stopped = false;
  const configured = /^https:\/\//.test(notificationUrl) && !!notificationSecret;
  const event = (id, kind, detail) =>
    db
      .prepare('INSERT INTO desk_events(opportunity_id,at,kind,detail) VALUES(?,?,?,?)')
      .run(id, now(), kind, detail);
  const get = (id) => record(db.prepare('SELECT * FROM opportunities WHERE id=?').get(id));
  function submit(body) {
    if (
      !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(
        body.requestId || '',
      )
    )
      throw error('Invalid request ID.', 400);
    if (str(body.site)) throw error('Unable to accept this request.', 422);
    const profile = validateOpportunity(body),
      hash = digest(JSON.stringify(profile));
    const saved = db
      .prepare('SELECT reference,payload_hash FROM opportunities WHERE request_key=?')
      .get(body.requestId);
    if (saved) {
      if (saved.payload_hash !== hash)
        throw error('This request ID belongs to different details.', 409);
      return { reference: saved.reference, replay: true };
    }
    const result = transaction(db, () => {
      const concurrent = db
        .prepare('SELECT reference,payload_hash FROM opportunities WHERE request_key=?')
        .get(body.requestId);
      if (concurrent) {
        if (concurrent.payload_hash !== hash)
          throw error('This request ID belongs to different details.', 409);
        return { reference: concurrent.reference, replay: true };
      }
      const at = now(),
        id = crypto.randomUUID(),
        reference =
          'VN-' +
          new Date().getUTCFullYear() +
          '-' +
          crypto.randomBytes(5).toString('hex').toUpperCase();
      const companyId = company(db, profile.contact, profile.company, at);
      const { contact: _contact, attribution, ...scope } = profile;
      db.prepare(
        `INSERT INTO opportunities(id,reference,request_key,payload_hash,company_id,side,industry,profile,attribution,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
      ).run(
        id,
        reference,
        body.requestId,
        hash,
        companyId,
        profile.side,
        profile.industry,
        JSON.stringify(scope),
        JSON.stringify(attribution),
        at,
        at,
      );
      event(id, 'received', 'Opportunity received. Capabilities are self-declared and unverified.');
      db.prepare(
        'INSERT INTO notification_outbox(id,opportunity_id,reference,next_at) VALUES(?,?,?,?)',
      ).run(crypto.randomUUID(), id, reference, at);
      return { reference, replay: false };
    });
    queueMicrotask(() => void flush());
    return result;
  }
  function candidates(id) {
    const item = get(id);
    if (!item) throw error('Opportunity not found.', 404);
    if (!eligible(item)) return [];
    return db
      .prepare('SELECT * FROM opportunities WHERE side<>? AND industry=? AND company_id<>?')
      .all(item.side, item.industry, item.company_id)
      .map(record)
      .filter(
        (other) =>
          eligible(other) &&
          other.profile.countries?.some((c) => item.profile.countries?.includes(c)) &&
          other.profile.capabilities?.some((c) => item.profile.capabilities?.includes(c)) &&
          (!item.profile.targetType || item.profile.targetType === other.profile.companyType) &&
          (!other.profile.targetType || other.profile.targetType === item.profile.companyType) &&
          (!item.profile.methods?.length ||
            !other.profile.methods?.length ||
            item.profile.methods.some((m) => other.profile.methods.includes(m))) &&
          (!item.profile.settlementCurrencies?.length ||
            !other.profile.settlementCurrencies?.length ||
            item.profile.settlementCurrencies.some((c) =>
              other.profile.settlementCurrencies.includes(c),
            )),
      )
      .map((other) => ({
        id: other.id,
        reference: other.reference,
        side: other.side,
        industry: other.industry,
        countries: other.profile.countries.filter((c) => item.profile.countries.includes(c)),
        capabilities: other.profile.capabilities.filter((c) =>
          item.profile.capabilities.includes(c),
        ),
        methods: (other.profile.methods || []).filter((m) => item.profile.methods?.includes(m)),
        settlementCurrencies: (other.profile.settlementCurrencies || []).filter((c) =>
          item.profile.settlementCurrencies?.includes(c),
        ),
        notice: 'Candidate for manual review; not a confirmed match.',
      }));
  }
  function eligible(item) {
    return (
      ['need', 'offer'].includes(item.side) &&
      ['qualified', 'discussion', 'agreed'].includes(item.status) &&
      item.verification === 'verified' &&
      (!item.expires_at || item.expires_at >= now().slice(0, 10))
    );
  }
  function patch(id, body) {
    const item = get(id);
    if (!item) throw error('Opportunity not found.', 404);
    const next = {
      status: body.status ?? item.status,
      verification: body.verification ?? item.verification,
      evidence: str(body.evidence ?? item.evidence, 1500),
      owner: str(body.owner ?? item.owner, 100),
      follow_up: str(body.follow_up ?? item.follow_up, 10),
      expires_at: str(body.expires_at ?? item.expires_at, 10),
      share_consent:
        typeof body.share_consent === 'boolean' ? Number(body.share_consent) : item.share_consent,
    };
    if (!states.has(next.status) || !verificationStates.has(next.verification))
      throw error('Unknown qualification state.');
    for (const key of ['follow_up', 'expires_at'])
      if (next[key] && !validDate(next[key])) throw error('Use a valid date.');
    if ((next.verification === 'verified' || next.share_consent) && next.evidence.length < 10)
      throw error('Record verification and sharing-permission evidence before confirming.');
    if (next.status === 'qualified' && next.verification !== 'verified')
      throw error('Verification is required before qualification.');
    let profile = item.profile,
      side = item.side,
      industry = item.industry;
    if (body.profile) {
      const contact = db
        .prepare('SELECT contact FROM network_contacts WHERE company_id=? LIMIT 1')
        .get(item.company_id)?.contact;
      const checked = validateOpportunity({ ...body.profile, contact, consent: true });
      const { contact: _contact, company: _company, attribution: _attribution, ...scope } = checked;
      profile = { ...scope, legacy: !!item.legacy_id };
      side = checked.side;
      industry = checked.industry;
      next.verification = 'unverified';
      next.status = 'review';
      next.share_consent = 0;
      next.evidence = '';
    }
    transaction(db, () => {
      db.prepare('UPDATE opportunities SET profile=?,side=?,industry=? WHERE id=?').run(
        JSON.stringify(profile),
        side,
        industry,
        id,
      );
      db.prepare(
        'UPDATE opportunities SET status=?,verification=?,evidence=?,owner=?,follow_up=?,expires_at=?,share_consent=?,updated_at=? WHERE id=?',
      ).run(
        next.status,
        next.verification,
        next.evidence,
        next.owner,
        next.follow_up,
        next.expires_at,
        next.share_consent,
        now(),
        id,
      );
      if (item.legacy_id) {
        const prior = db.prepare('SELECT status FROM applications WHERE id=?').get(item.legacy_id);
        const compat = next.status === 'unsuitable' ? 'closed' : next.status;
        db.prepare('UPDATE applications SET status=?,updated_at=? WHERE id=?').run(
          compat,
          now(),
          item.legacy_id,
        );
        db.prepare(
          'INSERT INTO audit_log(application_id,at,from_status,to_status) VALUES(?,?,?,?)',
        ).run(item.legacy_id, now(), prior.status, compat);
      }
      event(
        id,
        'qualification',
        JSON.stringify({
          before: {
            status: item.status,
            verification: item.verification,
            share_consent: item.share_consent,
            owner: item.owner,
            follow_up: item.follow_up,
            expires_at: item.expires_at,
            evidence: item.evidence,
            profile: item.profile,
          },
          after: { ...next, profile },
        }),
      );
    });
    return get(id);
  }
  function introduce(body) {
    const demand = get(body.demandId),
      supply = get(body.supplyId);
    if (
      !demand ||
      !supply ||
      demand.side !== 'need' ||
      supply.side !== 'offer' ||
      !candidates(demand.id).some((c) => c.id === supply.id)
    )
      throw error('Select two eligible, compatible, verified opportunities.');
    if (!demand.share_consent || !supply.share_consent)
      throw error('Both parties must permit sharing before an introduction.');
    const evidence = str(body.evidence, 1500);
    if (evidence.length < 10) throw error('Record the scope and permission evidence.');
    const existing = db
      .prepare('SELECT * FROM introductions WHERE demand_id=? AND supply_id=?')
      .get(demand.id, supply.id);
    if (existing) return existing;
    const id = crypto.randomUUID(),
      at = now();
    transaction(db, () => {
      db.prepare(
        'INSERT INTO introductions(id,demand_id,supply_id,evidence,created_at,updated_at) VALUES(?,?,?,?,?,?)',
      ).run(id, demand.id, supply.id, evidence, at, at);
      event(demand.id, 'introduction', 'Proposed introduction ' + id);
      event(supply.id, 'introduction', 'Proposed introduction ' + id);
    });
    return db.prepare('SELECT * FROM introductions WHERE id=?').get(id);
  }
  function agreement(body) {
    const intro = db
      .prepare('SELECT * FROM introductions WHERE id=?')
      .get(str(body.introductionId));
    if (!intro || !['introduced', 'discussion', 'agreed', 'won'].includes(intro.status))
      throw error('An actual introduction must be recorded first.');
    if (!['revenue-share', 'success-fee', 'sourcing-project'].includes(body.model))
      throw error('Choose an agreement model.');
    const terms = str(body.terms, 3000),
      evidence = str(body.evidence, 1000),
      attribution = str(body.attribution, 1000);
    if (terms.length < 10 || evidence.length < 10 || attribution.length < 5)
      throw error('Record signed terms, attribution and agreement evidence.');
    if (!/^[A-Z]{3}$/.test(body.currency || ''))
      throw error('Use a three-letter reporting currency.');
    if (!validDate(body.startsOn) || !validDate(body.endsOn) || body.endsOn < body.startsOn)
      throw error('Record the agreement start and end dates.');
    const rate =
      body.rateBps === undefined || body.rateBps === null || body.rateBps === ''
        ? null
        : Number(body.rateBps);
    if (rate !== null && (!Number.isInteger(rate) || rate < 0 || rate > 10000))
      throw error('Revenue share must be between 0 and 10000 basis points.');
    const prior = db
      .prepare('SELECT * FROM agreements WHERE introduction_id=? AND evidence=?')
      .get(intro.id, evidence);
    if (prior) {
      if (
        prior.terms !== terms ||
        prior.attribution !== attribution ||
        prior.model !== body.model ||
        prior.currency !== body.currency ||
        prior.rate_bps !== rate ||
        prior.starts_on !== body.startsOn ||
        prior.ends_on !== body.endsOn
      )
        throw error('This agreement reference already has different terms.', 409);
      return { id: prior.id };
    }
    const id = crypto.randomUUID();
    transaction(db, () => {
      db.prepare(
        'INSERT INTO agreements(id,introduction_id,model,terms,attribution,currency,rate_bps,starts_on,ends_on,evidence,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)',
      ).run(
        id,
        intro.id,
        body.model,
        terms,
        attribution,
        body.currency,
        rate,
        body.startsOn,
        body.endsOn,
        evidence,
        now(),
      );
      event(
        intro.demand_id,
        'agreement',
        'Agreement ' + id + ' recorded; not a payment confirmation.',
      );
    });
    return { id };
  }
  function revenue(body) {
    const contract = db.prepare('SELECT * FROM agreements WHERE id=?').get(str(body.agreementId));
    if (!contract) throw error('Agreement not found.', 404);
    if (!Number.isSafeInteger(body.amountMinor) || body.amountMinor <= 0)
      throw error('Enter a positive amount in minor currency units.');
    if (body.currency !== contract.currency) throw error('Use the agreement reporting currency.');
    if (!['due', 'invoiced', 'received'].includes(body.status))
      throw error('Choose a revenue state.');
    const evidence = str(body.evidence, 1000);
    if (
      !/^\d{4}-\d{2}$/.test(body.period || '') ||
      Number(body.period.slice(5)) < 1 ||
      Number(body.period.slice(5)) > 12 ||
      evidence.length < 5
    )
      throw error('Record a valid period and supporting statement or receipt.');
    const period = body.period;
    if (period < contract.starts_on.slice(0, 7) || period > contract.ends_on.slice(0, 7))
      throw error('The reporting period is outside the agreement term.');
    const existing = db
      .prepare(
        'SELECT id,amount_minor,currency FROM revenue_entries WHERE agreement_id=? AND period=? AND statement_ref=?',
      )
      .get(contract.id, period, evidence);
    if (existing) {
      if (existing.amount_minor !== body.amountMinor || existing.currency !== body.currency)
        throw error('This statement reference already has a different amount.', 409);
      return { id: existing.id };
    }
    const id = crypto.randomUUID();
    transaction(db, () => {
      db.prepare(
        'INSERT INTO revenue_entries(id,agreement_id,period,amount_minor,currency,status,evidence,statement_ref,created_at) VALUES(?,?,?,?,?,?,?,?,?)',
      ).run(
        id,
        contract.id,
        period,
        body.amountMinor,
        body.currency,
        body.status,
        evidence,
        evidence,
        now(),
      );
      const intro = db
        .prepare('SELECT demand_id FROM introductions WHERE id=?')
        .get(contract.introduction_id);
      event(
        intro.demand_id,
        'revenue-recorded',
        JSON.stringify({
          id,
          agreement: contract.id,
          period,
          amount_minor: body.amountMinor,
          currency: body.currency,
          status: body.status,
          evidence,
        }),
      );
    });
    return { id };
  }
  function merge(body) {
    if (body.sourceId === body.targetId) throw error('Choose two different company records.');
    const source = db.prepare('SELECT * FROM network_companies WHERE id=?').get(str(body.sourceId)),
      target = db.prepare('SELECT * FROM network_companies WHERE id=?').get(str(body.targetId));
    const evidence = str(body.evidence, 1000);
    if (!source || !target || evidence.length < 10)
      throw error('Confirm company identity with evidence before merging.');
    transaction(db, () => {
      const items = db.prepare('SELECT id FROM opportunities WHERE company_id=?').all(source.id);
      db.prepare('UPDATE network_contacts SET company_id=? WHERE company_id=?').run(
        target.id,
        source.id,
      );
      db.prepare('UPDATE opportunities SET company_id=?,updated_at=? WHERE company_id=?').run(
        target.id,
        now(),
        source.id,
      );
      for (const item of items)
        event(item.id, 'company-merge', source.id + ' → ' + target.id + ': ' + evidence);
      db.prepare('DELETE FROM network_companies WHERE id=?').run(source.id);
    });
    return { ok: true };
  }
  async function flush() {
    if (!configured || sending || stopped) return;
    sending = true;
    try {
      for (let n = 0; n < 10 && !stopped; n++) {
        const job = transaction(db, () => {
          const job = db
            .prepare(
              "SELECT * FROM notification_outbox WHERE delivered_at='' AND next_at<=? AND lease_until<? ORDER BY next_at LIMIT 1",
            )
            .get(now(), now());
          if (job)
            db.prepare('UPDATE notification_outbox SET lease_until=? WHERE id=?').run(
              new Date(Date.now() + 60000).toISOString(),
              job.id,
            );
          return job;
        });
        if (!job) break;
        try {
          const response = await send(notificationUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + notificationSecret,
              'Idempotency-Key': job.id,
            },
            body: JSON.stringify({
              event: 'opportunity.received',
              id: job.id,
              reference: job.reference,
              deskPath: '/admin',
            }),
            signal: AbortSignal.timeout(10000),
            redirect: 'error',
          });
          if (!response.ok) throw new Error('HTTP ' + response.status);
          db.prepare(
            "UPDATE notification_outbox SET delivered_at=?,lease_until='',last_error='' WHERE id=?",
          ).run(now(), job.id);
        } catch (e) {
          const delay = Math.min(6 * 3600000, 30000 * 2 ** Math.min(job.attempts, 10));
          db.prepare(
            "UPDATE notification_outbox SET attempts=attempts+1,next_at=?,lease_until='',last_error=? WHERE id=?",
          ).run(
            new Date(Date.now() + delay).toISOString(),
            /^HTTP \d{3}$/.test(e.message) ? e.message : 'Delivery unavailable; retry scheduled.',
            job.id,
          );
        }
      }
    } finally {
      sending = false;
    }
  }
  const timer = setInterval(() => void flush(), 30000);
  timer.unref();
  queueMicrotask(() => void flush());
  return {
    notificationConfigured: configured,
    received: (key) =>
      !!db
        .prepare('SELECT 1 FROM opportunities WHERE request_key=?')
        .get(typeof key === 'string' ? key : ''),
    submit,
    patch,
    candidates,
    introduce,
    agreement,
    revenue,
    merge,
    flush,
    syncLegacyStatus(id, status) {
      const item = get(id);
      if (item) {
        db.prepare('UPDATE opportunities SET status=?,updated_at=? WHERE id=?').run(
          status,
          now(),
          id,
        );
        event(id, 'legacy-status', status);
      }
    },
    legacyReceived(id) {
      migrateDesk(db);
      const item = get(id);
      if (item) {
        db.prepare(
          'INSERT OR IGNORE INTO notification_outbox(id,opportunity_id,reference,next_at) VALUES(?,?,?,?)',
        ).run(crypto.randomUUID(), id, item.reference, now());
        queueMicrotask(() => void flush());
      }
    },
    updateRevenue(id, body) {
      const row = db.prepare('SELECT * FROM revenue_entries WHERE id=?').get(id);
      if (!row) throw error('Revenue entry not found.', 404);
      if (
        !['due', 'invoiced', 'received', 'void'].includes(body.status) ||
        str(body.evidence, 1000).length < 5
      )
        throw error('Record a valid state and supporting evidence.');
      transaction(db, () => {
        db.prepare('UPDATE revenue_entries SET status=?,evidence=? WHERE id=?').run(
          body.status,
          str(body.evidence, 1000),
          id,
        );
        const intro = db
          .prepare(
            'SELECT i.demand_id FROM introductions i JOIN agreements a ON a.introduction_id=i.id WHERE a.id=?',
          )
          .get(row.agreement_id);
        event(
          intro.demand_id,
          'revenue-status',
          id + ': ' + row.status + ' → ' + body.status + ' — ' + str(body.evidence, 1000),
        );
      });
      return { ok: true };
    },
    detail(id) {
      const item = get(id);
      if (!item) throw error('Opportunity not found.', 404);
      return {
        ...item,
        events: db
          .prepare('SELECT * FROM desk_events WHERE opportunity_id=? ORDER BY id DESC')
          .all(id),
        candidates: candidates(id),
      };
    },
    note(id, body) {
      if (!get(id)) throw error('Opportunity not found.', 404);
      const note = str(body.note, 3000);
      if (!note) throw error('Write a note.');
      event(id, 'note', note);
      return { ok: true };
    },
    updateIntroduction(id, body) {
      const row = db.prepare('SELECT * FROM introductions WHERE id=?').get(id);
      if (!row) throw error('Introduction not found.', 404);
      if (!['proposed', 'introduced', 'discussion', 'agreed', 'won', 'lost'].includes(body.status))
        throw error('Unknown introduction state.');
      const evidence = str(body.evidence, 1500);
      if (evidence.length < 10) throw error('Record supporting evidence.');
      if (['introduced', 'discussion', 'agreed', 'won'].includes(body.status)) {
        const demand = get(row.demand_id),
          supply = get(row.supply_id);
        if (
          !demand?.share_consent ||
          !supply?.share_consent ||
          !candidates(row.demand_id).some((c) => c.id === row.supply_id)
        )
          throw error(
            'Reconfirm both parties’ current scope, verification and permission before proceeding.',
          );
      }
      transaction(db, () => {
        db.prepare('UPDATE introductions SET status=?,evidence=?,updated_at=? WHERE id=?').run(
          body.status,
          evidence,
          now(),
          id,
        );
        event(
          row.demand_id,
          'introduction-status',
          id + ': ' + row.status + ' → ' + body.status + ' — ' + evidence,
        );
        event(
          row.supply_id,
          'introduction-status',
          id + ': ' + row.status + ' → ' + body.status + ' — ' + evidence,
        );
      });
      return { ok: true };
    },
    report() {
      return {
        opportunities: db
          .prepare(
            'SELECT o.*,c.name AS company_name,(SELECT group_concat(contact) FROM network_contacts WHERE company_id=o.company_id) AS contacts FROM opportunities o JOIN network_companies c ON c.id=o.company_id ORDER BY o.created_at DESC LIMIT 1000',
          )
          .all()
          .map(record),
        companies: db
          .prepare(
            'SELECT c.*,(SELECT group_concat(contact) FROM network_contacts WHERE company_id=c.id) AS contacts FROM network_companies c ORDER BY c.created_at DESC',
          )
          .all(),
        introductions: db.prepare('SELECT * FROM introductions ORDER BY created_at DESC').all(),
        agreements: db.prepare('SELECT * FROM agreements ORDER BY created_at DESC').all(),
        revenue: db.prepare('SELECT * FROM revenue_entries ORDER BY created_at DESC').all(),
        totals: db
          .prepare(
            "SELECT currency,status,SUM(amount_minor) AS amount_minor FROM revenue_entries WHERE status<>'void' GROUP BY currency,status",
          )
          .all(),
        notifications: {
          configured,
          jobs: db
            .prepare(
              'SELECT reference,attempts,next_at,delivered_at,last_error FROM notification_outbox ORDER BY next_at DESC LIMIT 50',
            )
            .all(),
          pending: db
            .prepare("SELECT COUNT(*) AS count FROM notification_outbox WHERE delivered_at=''")
            .get().count,
          failed: db
            .prepare(
              "SELECT COUNT(*) AS count FROM notification_outbox WHERE delivered_at='' AND attempts>0",
            )
            .get().count,
        },
      };
    },
    async stop() {
      stopped = true;
      clearInterval(timer);
      while (sending) await new Promise((resolve) => setTimeout(resolve, 20));
    },
  };
}
