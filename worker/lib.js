// Small helpers shared by the lead endpoint and the lead drop box.

const enc = new TextEncoder();

export async function sha256(text) {
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// True if `key` has already hit `limit` within the current window (doesn't count this request).
export async function isLimited(db, key, limit, windowSeconds) {
  const row = await db.prepare('SELECT window_start, count FROM rate_limits WHERE key = ?').bind(await sha256(key)).first();
  return !!row && Math.floor(Date.now() / 1000) - row.window_start < windowSeconds && row.count >= limit;
}

// Fixed-window rate limit. Returns true if the action is allowed.
export async function rateLimit(db, key, limit, windowSeconds) {
  const now = Math.floor(Date.now() / 1000);
  const hashed = await sha256(key);
  const row = await db.prepare('SELECT window_start, count FROM rate_limits WHERE key = ?').bind(hashed).first();
  if (!row || now - row.window_start >= windowSeconds) {
    await db
      .prepare('INSERT INTO rate_limits (key, window_start, count) VALUES (?, ?, 1) ON CONFLICT(key) DO UPDATE SET window_start = excluded.window_start, count = 1')
      .bind(hashed, now)
      .run();
    return true;
  }
  if (row.count >= limit) return false;
  await db.prepare('UPDATE rate_limits SET count = count + 1 WHERE key = ?').bind(hashed).run();
  return true;
}

export const clientIp = (request) => request.headers.get('CF-Connecting-IP') || 'unknown';

// Only accept form posts that come from this site's own pages.
export function sameOrigin(request) {
  const origin = request.headers.get('Origin');
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

export const clip = (v, max) => (v == null ? '' : String(v).trim().slice(0, max));

