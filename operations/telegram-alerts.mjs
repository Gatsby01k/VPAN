import crypto from 'node:crypto';

const digest = (value) => crypto.createHash('sha256').update(value).digest('hex');
const error = (message, status = 422) => Object.assign(new Error(message), { status });

export function createTelegramAlerts(db, { token, username, publicSiteUrl, fetcher = fetch }) {
  const available = /^\d{1,20}:[A-Za-z0-9_-]{20,100}$/.test(token);
  const tokenDigest = digest(token);
  const read = () =>
    available
      ? db.prepare('SELECT * FROM telegram_alerts WHERE id=1 AND token_digest=?').get(tokenDigest)
      : undefined;
  const chat = () => read()?.chat_id || '';

  async function call(method, body) {
    if (!available) throw error('Set TELEGRAM_BOT_TOKEN in the hosting environment.', 409);
    let response, data;
    try {
      response = await fetcher(`https://api.telegram.org/bot${token}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(8000),
        redirect: 'error',
      });
      data = await response.json();
    } catch {
      throw error('Telegram is temporarily unavailable. Try again shortly.', 502);
    }
    if (!response.ok || data?.ok !== true) {
      if (method === 'getUpdates' && response.status === 409)
        throw error(
          'Use a dedicated Telegram bot without an incoming webhook or another poller.',
          409,
        );
      if (response.status === 401 || response.status === 404)
        throw error('Telegram rejected the bot token. Check the Production variable.', 409);
      throw error('Telegram did not accept the request. Check the bot chat and try again.', 502);
    }
    return data.result;
  }

  return {
    status: () => ({ available, connected: !!chat(), username }),
    chat,
    async start() {
      const bot = await call('getMe', {});
      if (!bot?.is_bot || !/^[A-Za-z0-9_]{5,32}$/.test(bot.username))
        throw error('Telegram did not identify the configured bot.', 502);
      if (username && bot.username.toLowerCase() !== username.toLowerCase())
        throw error('The configured token belongs to a different Telegram bot.', 409);
      const code = crypto.randomBytes(24).toString('base64url');
      const expires = Date.now() + 10 * 60_000;
      db.prepare(
        `INSERT INTO telegram_alerts(id,token_digest,pairing_digest,pairing_expires) VALUES(1,?,?,?)
         ON CONFLICT(id) DO UPDATE SET
           chat_id=CASE WHEN token_digest=excluded.token_digest THEN chat_id ELSE '' END,
           token_digest=excluded.token_digest, pairing_digest=excluded.pairing_digest,
           pairing_expires=excluded.pairing_expires`,
      ).run(tokenDigest, digest(code), expires);
      return { code, url: `https://t.me/${bot.username}?start=${code}` };
    },
    async confirm(code) {
      const pairing = read();
      if (
        typeof code !== 'string' ||
        !/^[A-Za-z0-9_-]{32}$/.test(code) ||
        pairing?.pairing_digest !== digest(code) ||
        pairing.pairing_expires <= Date.now()
      )
        throw error('This connection link expired. Create a new one.', 409);
      const updates = await call('getUpdates', {
        timeout: 0,
        limit: 100,
        allowed_updates: ['message'],
      });
      if (!Array.isArray(updates)) throw error('Telegram returned an invalid update list.', 502);
      const chats = new Set();
      for (const { message } of updates) {
        const id = message?.chat?.id;
        if (
          message?.chat?.type === 'private' &&
          Number.isSafeInteger(id) &&
          id > 0 &&
          message.from?.id === id &&
          message.text === '/start ' + code
        )
          chats.add(String(id));
      }
      if (!chats.size)
        throw error('Open the connection link and press Start in Telegram, then retry.', 409);
      if (chats.size > 1) throw error('Multiple chats used this link. Create a new one.', 409);
      const [chatId] = chats;
      const updated = db
        .prepare(
          `UPDATE telegram_alerts SET chat_id=?, pairing_digest='', pairing_expires=0
         WHERE id=1 AND token_digest=? AND pairing_digest=? AND pairing_expires>?`,
        )
        .run(chatId, tokenDigest, digest(code), Date.now());
      if (!updated.changes) throw error('This connection link expired. Create a new one.', 409);
      return { connected: true };
    },
    async send(chatId, reference) {
      if (!chatId) throw error('Connect your private Telegram chat in Deal Desk first.', 409);
      await call('sendMessage', {
        chat_id: chatId,
        text: reference ? `Новая заявка ${reference}` : 'Тестовое уведомление Deal Desk',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Открыть Deal Desk', url: new URL('/admin', publicSiteUrl).href }],
          ],
        },
      });
      return { delivered: true };
    },
  };
}
