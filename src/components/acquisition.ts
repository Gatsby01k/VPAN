const KEY = 'vladdos-acquisition-v1';
export interface Attribution {
  source?: string;
  medium?: string;
  campaign?: string;
  ref?: string;
  landing?: string;
  referrer?: string;
}
let attribution: Attribution | undefined;
export function acquisition(): Attribution {
  if (typeof window === 'undefined') return {};
  if (
    navigator.doNotTrack === '1' ||
    (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl
  )
    return {};
  if (attribution) return attribution;
  const params = new URLSearchParams(window.location.search);
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    if (
      saved &&
      saved.version === 1 &&
      saved.value &&
      typeof saved.value === 'object' &&
      !Array.isArray(saved.value)
    ) {
      // First touch is immutable within this browser session, including across explicit campaign links.
      const clean: Attribution = {};
      for (const key of ['source', 'medium', 'campaign', 'ref'] as const)
        if (
          typeof saved.value[key] === 'string' &&
          /^[\p{L}\p{N} ._-]{1,100}$/u.test(saved.value[key])
        )
          clean[key] = saved.value[key];
      if (
        typeof saved.value.landing === 'string' &&
        /^\/(?:[a-z0-9-]+\/?)*$/.test(saved.value.landing)
      )
        clean.landing = saved.value.landing.slice(0, 180);
      if (
        typeof saved.value.referrer === 'string' &&
        /^[a-z0-9.-]{1,120}$/i.test(saved.value.referrer)
      )
        clean.referrer = saved.value.referrer;
      return (attribution = clean);
    }
  } catch {
    /* Attribution is optional. */
  }
  const value: Attribution = {};
  for (const [key, query] of [
    ['source', 'utm_source'],
    ['medium', 'utm_medium'],
    ['campaign', 'utm_campaign'],
    ['ref', 'ref'],
  ] as const) {
    const entry = params.get(query) || '';
    if (/^[\p{L}\p{N} ._-]{1,100}$/u.test(entry)) value[key] = entry;
  }
  if (/^\/(?:[a-z0-9-]+\/?)*$/.test(window.location.pathname))
    value.landing = window.location.pathname.slice(0, 180);
  try {
    const referrer = new URL(document.referrer);
    if (referrer.origin !== window.location.origin)
      value.referrer = referrer.hostname.slice(0, 120);
  } catch {
    /* Direct entry. */
  }
  attribution = value;
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ version: 1, value }));
  } catch {
    /* An in-memory source still reaches the application. */
  }
  return value;
}
export function recordPage(path: string) {
  if (
    navigator.doNotTrack === '1' ||
    (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl
  )
    return;
  void fetch('/api/events', {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, attribution: acquisition() }),
  }).catch(() => {});
}
