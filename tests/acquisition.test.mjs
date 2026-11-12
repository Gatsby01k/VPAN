import test from 'node:test';
import assert from 'node:assert/strict';

test('first-touch referral survives campaign changes and reloads while privacy signals disable attribution', async (t) => {
  const originals = Object.fromEntries(
    ['window', 'document', 'navigator', 'sessionStorage'].map((key) => [
      key,
      Object.getOwnPropertyDescriptor(globalThis, key),
    ]),
  );
  t.after(() => {
    for (const [key, descriptor] of Object.entries(originals)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  const entries = new Map();
  const values = {
    window: { location: new URL('https://network.example/?ref=first-partner&utm_source=linkedin') },
    document: { referrer: '' },
    navigator: { doNotTrack: '0' },
    sessionStorage: {
      getItem: (key) => entries.get(key),
      setItem: (key, value) => entries.set(key, value),
    },
  };
  for (const [key, value] of Object.entries(values))
    Object.defineProperty(globalThis, key, { configurable: true, value });
  const first = await import('../src/components/acquisition.ts?first-touch');
  assert.equal(first.acquisition().ref, 'first-partner');
  values.window.location = new URL(
    'https://network.example/join?ref=competing-partner&utm_source=other',
  );
  const reloaded = await import('../src/components/acquisition.ts?after-reload');
  assert.equal(reloaded.acquisition().ref, 'first-partner');
  assert.equal(reloaded.acquisition().source, 'linkedin');
  values.navigator.doNotTrack = '1';
  assert.deepEqual(reloaded.acquisition(), {});
  values.navigator.doNotTrack = '0';
  values.navigator.globalPrivacyControl = true;
  assert.deepEqual(reloaded.acquisition(), {});
});
