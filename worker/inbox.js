// Lead drop box for the laptop CRM (crm/jaycrm.py).
//
// Website leads wait in the D1 database until the laptop CRM pulls them:
//   GET  /api/inbox          -> new leads (needs the secret key)
//   POST /api/inbox/ack      -> delete leads the laptop has saved
// There is no web page here. Requests need "Authorization: Bearer <key>"; only a SHA-256 hash
// of the key is stored (settings.inbox_key_hash), so the database never holds the key itself.
import { clientIp, isLimited, json, rateLimit, sha256 } from './lib.js';

async function authorized(request, env) {
  const header = request.headers.get('Authorization') || '';
  const key = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  const stored = (await env.DB.prepare("SELECT value FROM settings WHERE key = 'inbox_key_hash'").first())?.value;
  if (!key || !stored) return false;
  const actual = await sha256(key);
  let diff = actual.length ^ stored.length;
  for (let i = 0; i < Math.min(actual.length, stored.length); i++) diff |= actual.charCodeAt(i) ^ stored.charCodeAt(i);
  return diff === 0;
}

export async function handleInbox(request, env, url) {
  // After 10 wrong keys in an hour, that connection is shut out for the rest of the hour.
  const failKey = `inbox-fail:${clientIp(request)}`;
  if (await isLimited(env.DB, failKey, 10, 3600)) return json({ error: 'Not found' }, 404);
  if (!(await authorized(request, env))) {
    await rateLimit(env.DB, failKey, 10, 3600);
    return json({ error: 'Not found' }, 404);
  }

  if (url.pathname === '/api/inbox' && request.method === 'GET') {
    const { results } = await env.DB.prepare(
      `SELECT id, created_at, source, source_page, name, phone, address, province, condition, listed,
              occupancy, timeline, score, priority
       FROM leads ORDER BY id LIMIT 200`,
    ).all();
    return json({ leads: results });
  }

  if (url.pathname === '/api/inbox/ack' && request.method === 'POST') {
    let ids = [];
    try {
      ids = ((await request.json()).ids || []).map(Number).filter(Number.isInteger).slice(0, 200);
    } catch {
      return json({ error: 'Bad request' }, 400);
    }
    if (ids.length) {
      const marks = ids.map(() => '?').join(',');
      await env.DB.batch([
        env.DB.prepare(`DELETE FROM notes WHERE lead_id IN (${marks})`).bind(...ids),
        env.DB.prepare(`DELETE FROM leads WHERE id IN (${marks})`).bind(...ids),
      ]);
    }
    return json({ deleted: ids.length });
  }

  return json({ error: 'Not found' }, 404);
}
