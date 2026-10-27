import test from 'node:test';
import assert from 'node:assert/strict';
import { countryGroups, findRegion, regionForCountry } from '../src/geography.ts';
import {
  initialApplication,
  restoreApplication,
  validateApplication,
  applicationEntry,
  applicationEmail,
} from '../src/application.ts';

const uuid = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
test('regions contain countries consistently: Ghana belongs to Africa, India to Asia', () => {
  const groups = countryGroups();
  assert.deepEqual(
    groups.map((group) => group.id),
    ['africa', 'asia', 'latam'],
  );
  assert.equal(regionForCountry('Ghana').id, 'africa');
  assert.equal(regionForCountry('india').id, 'asia');
  assert.equal(findRegion('LATAM').name, 'Latin America');
  assert.ok(
    groups
      .find((group) => group.id === 'africa')
      .countries.some((country) => country.slug === 'ghana'),
  );
  assert.ok(
    !groups
      .find((group) => group.id === 'asia')
      .countries.some((country) => country.slug === 'ghana'),
  );
  const slugs = groups.flatMap((group) => group.countries.map((country) => country.slug));
  assert.equal(new Set(slugs).size, slugs.length);
});
test('a new introduction never silently chooses Ghana, a region or a sector', () => {
  const draft = initialApplication(new URLSearchParams());
  assert.deepEqual(draft.markets, []);
  assert.equal(draft.region, '');
  assert.equal(draft.category, '');
  const regionOnly = initialApplication(new URLSearchParams('region=asia'));
  assert.equal(regionOnly.region, 'asia');
  assert.deepEqual(regionOnly.markets, []);
  assert.deepEqual(initialApplication(new URLSearchParams('market=unknown')).markets, []);
});
test('brief countries preserve selection order and carry only relevant methods into the form', () => {
  const draft = initialApplication(
    new URLSearchParams('markets=ghana,india&methods=Mobile+Money,UPI,M-Pesa&category=Exchange'),
  );
  assert.deepEqual(draft.markets, ['Ghana', 'India']);
  assert.equal(draft.region, 'africa');
  assert.equal(draft.methods, 'Mobile Money, UPI');
  assert.equal(draft.category, 'Exchange');
});
test('draft migration keeps contact details; a new country entry clears stale methods and retry ID', () => {
  const stored = {
    version: 2,
    entry: 'market=ghana',
    draft: {
      requestId: uuid,
      role: 'team',
      markets: ['Ghana'],
      email: 'partner@example.com',
      category: 'Exchange',
      methods: 'Mobile Money',
    },
  };
  const same = restoreApplication(new URLSearchParams('market=ghana'), stored);
  assert.equal(same.contact, 'partner@example.com');
  assert.equal(same.region, 'africa');
  assert.equal(same.requestId, uuid);
  const changed = restoreApplication(new URLSearchParams('market=india'), stored);
  assert.deepEqual(changed.markets, ['India']);
  assert.equal(changed.region, 'asia');
  assert.equal(changed.methods, '');
  assert.equal(changed.requestId, '');
  assert.equal(changed.role, 'team');
  assert.equal(changed.contact, 'partner@example.com');
  assert.equal(
    applicationEntry(new URLSearchParams('market=india&lang=ru')),
    applicationEntry(new URLSearchParams('lang=en&market=india')),
  );
});
test('the form validates region, country and contact as one consistent introduction', () => {
  const valid = {
    ...initialApplication(new URLSearchParams('market=ghana&category=Exchange')),
    contact: '@regional_partner',
  };
  assert.equal(validateApplication(valid), null);
  assert.equal(validateApplication({ ...valid, region: 'asia' }).field, 'contact-market');
  assert.equal(validateApplication({ ...valid, region: '' }).field, 'contact-region');
  assert.equal(validateApplication({ ...valid, category: '' }).field, 'sector-label');
  assert.equal(validateApplication({ ...valid, contact: '@bad' }).field, 'thread-contact');
  assert.equal(validateApplication({ ...valid, contact: 'partner@example.com' }), null);
  assert.equal(validateApplication({ ...valid, name: 'A' }).field, 'contact-name');
});

test('the static-host email carries the full introduction without request IDs or hidden fields', () => {
  const draft = {
    ...initialApplication(
      new URLSearchParams('markets=ghana,india&category=Exchange&role=provider'),
    ),
    contact: '@regional_partner',
    company: 'Test & Co',
    message: 'Условия и знакомство?\nНовая строка.',
    site: 'honeypot',
    requestId: uuid,
  };
  const email = applicationEmail(draft, 'ru');
  assert.match(email.body, /Гана \/ Африка \/ GHS/);
  assert.match(email.body, /Индия \/ Азия \/ INR/);
  assert.match(email.body, /Test & Co/);
  assert.match(email.body, /Условия и знакомство\?/);
  assert.ok(!email.body.includes(uuid));
  assert.ok(!email.body.includes('honeypot'));
  const url = new URL(email.href);
  assert.equal(url.pathname, 'hello@vladdos.com');
  assert.equal(url.searchParams.get('body'), email.body);
});
