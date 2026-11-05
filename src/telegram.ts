// Public contact details only. No bot token belongs in the browser bundle.
export const telegramUsername = 'V1aDDoS';
export const telegramUrl = `https://t.me/${telegramUsername}`;
export const telegramBriefEnabled = import.meta.env?.VITE_BRIEF_DELIVERY !== 'desk';

/** Keep the whole brief available for copying when a draft is too long for a link. */
export function telegramDraft(text: string) {
  const url = new URL(telegramUrl);
  url.searchParams.set('text', text);
  // A conservative handoff policy, not a promise about every Telegram client.
  const prefilled = Array.from(text).length <= 4096 && url.href.length <= 8000;
  return { href: prefilled ? url.href : telegramUrl, prefilled };
}
