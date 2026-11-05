import test from 'node:test';
import assert from 'node:assert/strict';
import { telegramDraft, telegramUrl } from '../src/telegram.ts';

test('Telegram handoff preserves multilingual business text without changing the recipient or adding URL parameters', () => {
  const text =
    'VlaDDoS / I OFFER\nКомпания: Тест & Partners 👋\nСтраны: Mozambique / Kenya\nКонтакт: @example_test\nКонтекст: A+B?profile&start=payload#section\nhttps://example.test/?next=https://other.test';
  const draft = telegramDraft(text);
  const url = new URL(draft.href);
  assert.equal(draft.prefilled, true);
  assert.equal(url.origin + url.pathname, 'https://t.me/V1aDDoS');
  assert.deepEqual([...url.searchParams.keys()], ['text']);
  assert.equal(url.searchParams.get('text'), text);
  assert.equal(url.hash, '');
});

test('long messages fall back to the private chat without a silently truncated or oversized draft URL', () => {
  const maximum = telegramDraft('a'.repeat(4096));
  assert.equal(maximum.prefilled, true);
  assert.equal(new URL(maximum.href).searchParams.get('text').length, 4096);
  for (const text of ['a'.repeat(4097), 'Д'.repeat(1500), '🧵'.repeat(700)]) {
    const draft = telegramDraft(text);
    assert.equal(draft.prefilled, false);
    assert.equal(draft.href, telegramUrl);
    assert.equal(new URL(draft.href).search, '');
  }
});
