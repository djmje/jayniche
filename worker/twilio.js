// Business phone line (289) 672-1952, run through Twilio.
//
// What it does:
// - New website lead  -> texts the lead right away, and texts Jay an alert.
// - Someone calls     -> rings Jay's cell. Jay presses any key to take it.
//                        If he doesn't (no answer, busy, or his voicemail picks up),
//                        the caller gets a "sorry I missed you" text and Jay gets an alert.
// - Someone texts     -> forwarded to Jay's cell.
// - Jay texts the line "9055551234 your message" -> sent to that person from the business number.
// - Jay calls the line from his cell -> enter a number + # to call out showing the business number.
// - Twilio balance under $3 -> texts Jay a warning (at most once a day).
//
// Settings (Cloudflare -> Workers & Pages -> jayniche -> Settings -> Variables and Secrets):
//   TWILIO_ACCOUNT_SID  (secret)  starts with AC...
//   TWILIO_AUTH_TOKEN   (secret)  from the Twilio console home page
//   OWNER_CELL          (secret)  Jay's cell, e.g. +14375550123
// If any are missing, texting is skipped and the website keeps working normally.
//
// Twilio number settings (Phone Numbers -> Active numbers -> (289) 672-1952):
//   A call comes in:      Webhook  https://jayniche.ca/api/twilio/voice  HTTP POST
//   A message comes in:   Webhook  https://jayniche.ca/api/twilio/sms    HTTP POST

export const BUSINESS_NUMBER = '+12896721952';
const BASE = 'https://jayniche.ca';
const LOW_BALANCE = 3; // USD
const SIGN_OFF = 'Reply STOP to opt out.';

const enc = new TextEncoder();

export const twilioReady = (env) => Boolean(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.OWNER_CELL);

// "(905) 555-1234", "905-555-1234", "+1 905 555 1234" -> "+19055551234". Null if not a North American number.
export function toE164(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 10 && /^[2-9]/.test(digits)) return `+1${digits}`;
  if (digits.length === 11 && digits[0] === '1' && /^[2-9]/.test(digits[1])) return `+${digits}`;
  return null;
}

const pretty = (e164) => {
  const d = String(e164 || '').replace(/\D/g, '').slice(-10);
  return d.length === 10 ? `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}` : String(e164 || 'unknown');
};

// Keep texts plain ASCII so they stay cheap single-segment SMS where possible.
const ascii = (s) =>
  String(s || '')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/[^\x20-\x7E\n]/g, '')
    .trim();

const firstName = (name) => ascii(name).split(/\s+/)[0]?.slice(0, 20) || 'there';
const shortAddress = (address) => {
  const a = ascii(address).split(',')[0].trim();
  return a.length > 40 ? `${a.slice(0, 37)}...` : a;
};

async function twilioApi(env, path, params) {
  const auth = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}${path}`, {
    method: params ? 'POST' : 'GET',
    headers: { Authorization: `Basic ${auth}`, ...(params ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}) },
    body: params ? new URLSearchParams(params) : undefined,
  });
  if (!res.ok) throw new Error(`Twilio ${path} ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

export async function sendSms(env, to, body) {
  return twilioApi(env, '/Messages.json', { To: to, From: BUSINESS_NUMBER, Body: body });
}

// Texts Jay once a day at most when the Twilio balance runs low, so the line never goes quiet unnoticed.
async function checkBalance(env) {
  try {
    const { balance, currency } = await twilioApi(env, '/Balance.json');
    if (Number(balance) >= LOW_BALANCE) return;
    const now = Math.floor(Date.now() / 1000);
    const last = Number((await env.DB.prepare("SELECT value FROM settings WHERE key = 'low_balance_warned'").first())?.value || 0);
    if (now - last < 86400) return;
    await env.DB.prepare("INSERT INTO settings (key, value) VALUES ('low_balance_warned', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
      .bind(String(now))
      .run();
    await sendSms(env, env.OWNER_CELL, `Twilio balance is low: ${Number(balance).toFixed(2)} ${currency}. Top up at console.twilio.com so lead texts keep sending.`);
  } catch (err) {
    console.error('balance check failed', err);
  }
}

// Called after a website lead is saved. Runs in the background so the form answers instantly.
export async function onNewLead(env, lead, priority) {
  if (!twilioReady(env)) return;
  const to = toE164(lead.phone);
  const jobs = [];
  if (to) {
    jobs.push(
      sendSms(
        env,
        to,
        `Hi ${firstName(lead.name)}, it's Jay from Jay Home Buyers. Got your info on ${shortAddress(lead.address)}. When's a good time for a quick 5 min call? ${SIGN_OFF}`,
      ),
    );
  }
  jobs.push(
    sendSms(
      env,
      env.OWNER_CELL,
      `New lead (${priority}): ${ascii(lead.name).slice(0, 40)}, ${to ? pretty(to) : ascii(lead.phone)}, ${shortAddress(lead.address)}. ${to ? 'Auto-text sent.' : 'Phone looks wrong, no auto-text.'}`,
    ),
  );
  const results = await Promise.allSettled(jobs);
  results.filter((r) => r.status === 'rejected').forEach((r) => console.error('lead text failed', r.reason));
  await checkBalance(env);
}

// --- Twilio webhooks -------------------------------------------------------

// Checks X-Twilio-Signature so nobody else can trigger texts or calls through these URLs.
async function verifiedParams(request, env) {
  const form = await request.formData();
  const params = {};
  for (const [k, v] of form.entries()) params[k] = String(v);
  const signature = request.headers.get('X-Twilio-Signature') || '';
  const payload = new URL(request.url).toString() + Object.keys(params).sort().map((k) => k + params[k]).join('');
  const key = await crypto.subtle.importKey('raw', enc.encode(env.TWILIO_AUTH_TOKEN), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(payload)));
  const expected = btoa(String.fromCharCode(...mac));
  let diff = expected.length ^ signature.length;
  for (let i = 0; i < Math.min(expected.length, signature.length); i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0 ? params : null;
}

const xmlEscape = (s) => String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]);
const twiml = (inner = '') =>
  new Response(`<?xml version="1.0" encoding="UTF-8"?><Response>${inner}</Response>`, { headers: { 'Content-Type': 'text/xml; charset=utf-8' } });
const VOICE = 'voice="Polly.Joanna"';

// Remembers which calls Jay actually accepted (pressed a key), so voicemail pickups count as missed.
const acceptedKey = (callSid) => `call_accepted:${callSid}`;

async function voice(params, env) {
  const from = params.From || '';
  // Jay calling his own business line: let him dial out showing the business number.
  if (toE164(from) === toE164(env.OWNER_CELL)) {
    return twiml(
      `<Gather input="dtmf" finishOnKey="#" timeout="10" action="${BASE}/api/twilio/dialout"><Say ${VOICE}>Enter the number to call, then press pound.</Say></Gather><Say ${VOICE}>No number entered. Goodbye.</Say>`,
    );
  }
  return twiml(
    `<Dial answerOnBridge="true" timeout="25" action="${BASE}/api/twilio/after-call"><Number url="${BASE}/api/twilio/screen">${xmlEscape(env.OWNER_CELL)}</Number></Dial>`,
  );
}

// Plays to Jay when he picks up. The caller keeps hearing ringing.
function screen() {
  return twiml(
    `<Gather input="dtmf" numDigits="1" timeout="6" action="${BASE}/api/twilio/screen-ok"><Say ${VOICE}>Jay Home Buyers call. Press any key to answer.</Say></Gather><Hangup/>`,
  );
}

async function screenOk(params, env) {
  const parent = params.ParentCallSid || params.CallSid;
  await env.DB.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
    .bind(acceptedKey(parent), String(Math.floor(Date.now() / 1000)))
    .run();
  return twiml(); // empty response = connect the call
}

async function afterCall(params, env, ctx) {
  const key = acceptedKey(params.CallSid);
  const accepted = await env.DB.prepare('SELECT value FROM settings WHERE key = ?').bind(key).first();
  await env.DB.prepare("DELETE FROM settings WHERE key LIKE 'call_accepted:%' AND CAST(value AS INTEGER) < ?")
    .bind(Math.floor(Date.now() / 1000) - 86400)
    .run();
  if (accepted) {
    await env.DB.prepare('DELETE FROM settings WHERE key = ?').bind(key).run();
    return twiml();
  }

  const caller = toE164(params.From);
  ctx.waitUntil(
    (async () => {
      const jobs = [sendSms(env, env.OWNER_CELL, `Missed call from ${caller ? pretty(caller) : 'a blocked number'}.${caller ? ' Missed-call text sent.' : ''}`)];
      if (caller) {
        jobs.push(
          sendSms(env, caller, `Hi, it's Jay from Jay Home Buyers. Sorry I missed your call! What's the property address? I'll call you back shortly. ${SIGN_OFF}`),
        );
        // Drop it in the CRM inbox too, so it shows up with the website leads.
        jobs.push(
          env.DB.prepare("INSERT INTO leads (source, name, phone, address, priority) VALUES ('phone', 'Missed call', ?, '', 'Warm')").bind(pretty(caller)).run(),
        );
      }
      const results = await Promise.allSettled(jobs);
      results.filter((r) => r.status === 'rejected').forEach((r) => console.error('missed call follow-up failed', r.reason));
      await checkBalance(env);
    })(),
  );
  return twiml(`<Say ${VOICE}>Sorry we missed you. We'll text you right away. Goodbye.</Say>`);
}

function dialout(params) {
  const to = toE164(params.Digits);
  if (!to) return twiml(`<Say ${VOICE}>That number didn't work. Goodbye.</Say>`);
  return twiml(`<Dial callerId="${BUSINESS_NUMBER}" timeout="30"><Number>${to}</Number></Dial>`);
}

async function sms(params, env, ctx) {
  const from = toE164(params.From);
  const body = ascii(params.Body).slice(0, 1200);

  if (from && from === toE164(env.OWNER_CELL)) {
    // Jay replying as the business: "9055551234 message" (dashes, spaces, brackets, +1 all fine).
    const m = body.match(/^\s*([+(\d][\d\s().-]{8,18}\d)[\s:,-]+([\s\S]+)$/);
    const to = m && toE164(m[1]);
    ctx.waitUntil(
      (to
        ? sendSms(env, to, m[2].trim())
        : sendSms(env, env.OWNER_CELL, 'To text someone from the business line, start with their number, e.g. "905-555-1234 Hey, is now a good time?"')
      ).catch((err) => console.error('owner relay failed', err)),
    );
    return twiml();
  }

  // STOP/START/HELP are handled by Twilio itself; don't forward those.
  if (/^(stop|stopall|unsubscribe|cancel|end|quit|start|unstop|yes|help|info)$/i.test(body.trim())) return twiml();

  const who = from ? pretty(from) : ascii(params.From);
  const media = Number(params.NumMedia || 0) > 0 ? ' [sent a photo]' : '';
  ctx.waitUntil(
    sendSms(env, env.OWNER_CELL, `Text from ${who}: ${body}${media}\n(Reply: ${who} your message)`.slice(0, 600)).catch((err) =>
      console.error('forward failed', err),
    ),
  );
  return twiml();
}

export async function handleTwilio(request, env, ctx, url) {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  if (!twilioReady(env)) return twiml(`<Say ${VOICE}>This line isn't set up yet. Please try again later.</Say>`);
  const params = await verifiedParams(request, env);
  if (!params) return new Response('Forbidden', { status: 403 });

  switch (url.pathname) {
    case '/api/twilio/voice':
      return voice(params, env);
    case '/api/twilio/screen':
      return screen();
    case '/api/twilio/screen-ok':
      return screenOk(params, env);
    case '/api/twilio/after-call':
      return afterCall(params, env, ctx);
    case '/api/twilio/dialout':
      return dialout(params);
    case '/api/twilio/sms':
      return sms(params, env, ctx);
    default:
      return new Response('Not found', { status: 404 });
  }
}
