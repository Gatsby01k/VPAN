import { markets, roles, type RoleId } from '../data';

export interface PartnerProfile {
  role: RoleId;
  markets: string[];
  category: string;
  methods: string[];
}
const key = 'pan.partner-profile.v1';
const categories = ['iGaming', 'e-commerce', 'other'];
const list = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((v): v is string => typeof v === 'string')
    : typeof value === 'string'
      ? value.split(',')
      : [];

// Read after mount so the server and the first hydration render stay identical.
// A shared URL overrides only the fields it contains; contact data is never saved here.
export function restorePartnerProfile(params: URLSearchParams): PartnerProfile {
  let saved: Partial<PartnerProfile> = {};
  try {
    const parsed: unknown = JSON.parse(sessionStorage.getItem(key) || '{}');
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) saved = parsed;
  } catch {
    /* Storage can be blocked; the URL still works. */
  }
  const rawRole = params.get('role') || saved.role;
  const role = roles.some((r) => r.id === rawRole) ? (rawRole as RoleId) : 'affiliate';
  const rawMarkets = params.has('markets') ? params.get('markets') : saved.markets;
  const selected = [
    ...new Set(list(rawMarkets).filter((v) => markets.some((m) => m.slug === v))),
  ].slice(0, 3);
  const rawCategory = params.get('category') || saved.category;
  const category = categories.includes(rawCategory || '') ? rawCategory! : 'iGaming';
  const allowed = new Set(
    markets.filter((m) => selected.includes(m.slug)).flatMap((m) => m.methods),
  );
  const rawMethods = params.has('methods') ? params.get('methods') : saved.methods;
  const methods = [...new Set(list(rawMethods).filter((m) => allowed.has(m)))];
  return { role, markets: selected, category, methods };
}

export function savePartnerProfile(profile: PartnerProfile) {
  try {
    sessionStorage.setItem(key, JSON.stringify(profile));
  } catch {
    /* Keep the current selection in memory. */
  }
}
