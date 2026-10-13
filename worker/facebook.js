// Facebook lead ads -> the same CRM drop box as website leads.
//
// Every 2 minutes (cron in wrangler.jsonc) this checks the Jay Home Buyers page's lead forms
// for new leads. Each new lead is saved to the CRM drop box (source "facebook").
//
// Polling instead of a Meta webhook means no Meta app review is needed: a Page token with
// the leads_retrieval permission is enough for your own page.
//
// Settings (Cloudflare -> jayniche -> Settings -> Variables and Secrets):
//   FB_PAGE_TOKEN  (secret)  a never-expiring System User token from Business Settings (or a
//                            Page token). A System User token is swapped for the Page's token here.
// Missing token = this does nothing.

const PAGE_ID = '1347840598405260'; // Jay Home Buyers Facebook page
const GRAPH = 'https://graph.facebook.com/v23.0';
const OVERLAP = 600; // seconds re-checked each run; duplicates are skipped

async function graph(env, path, params = {}, token = env.FB_PAGE_TOKEN) {
  const url = new URL(`${GRAPH}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set('access_token', token);
  const res = await fetch(url);
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.error) {
    const err = new Error(`Graph ${path}: ${body.error?.message || res.status}`);
    err.code = body.error?.code;
    throw err;
  }
  return body;
}

const getSetting = async (env, key) => (await env.DB.prepare('SELECT value FROM settings WHERE key = ?').bind(key).first())?.value;
const setSetting = (env, key, value) =>
  env.DB.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').bind(key, String(value)).run();

// Turns Facebook's field_data list into the same shape as a website lead.
export function mapLead(fbLead) {
  const fields = {};
  for (const f of fbLead.field_data || []) fields[String(f.name).toLowerCase()] = (f.values || []).join(', ');
  const pick = (...keys) => keys.map((k) => fields[k]).find((v) => v && v.trim()) || '';
  const findKey = (re) => Object.keys(fields).find((k) => re.test(k));

  const name = pick('full_name') || [pick('first_name'), pick('last_name')].filter(Boolean).join(' ');
  const phone = pick('phone_number', 'phone');
  const addressKey = findKey(/address|property/);
  const address = [pick('street_address') || (addressKey ? fields[addressKey] : ''), pick('city'), pick('province', 'state')]
    .filter(Boolean)
    .join(', ');

  // Everything else (custom questions) goes into the notes field for the CRM.
  const used = new Set(['full_name', 'first_name', 'last_name', 'phone_number', 'phone', 'street_address', 'city', 'province', 'state', 'email', addressKey]);
  const extra = Object.entries(fields)
    .filter(([k]) => !used.has(k))
    .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
    .join(' | ');

  return {
    source: 'facebook',
    name: name.slice(0, 120),
    phone: phone.slice(0, 40),
    email: pick('email').slice(0, 200),
    address: address.slice(0, 300),
    motivation: extra.slice(0, 1000),
  };
}

export async function pollFacebookLeads(env) {
  if (!env.FB_PAGE_TOKEN) return;
  const now = Math.floor(Date.now() / 1000);
  const last = Number((await getSetting(env, 'fb_last_poll')) || 0);

  // First run: start from now so old leads don't all get texted at once.
  if (!last) {
    await setSetting(env, 'fb_last_poll', now);
    return;
  }

  try {
    const since = last - OVERLAP;
    // Lead endpoints want the Page's own token. If FB_PAGE_TOKEN is a System User or user token,
    // ask for the Page token with it; if it's already a Page token this just fails and we use it as is.
    const pageToken = await graph(env, PAGE_ID, { fields: 'access_token' })
      .then((r) => r.access_token || env.FB_PAGE_TOKEN)
      .catch(() => env.FB_PAGE_TOKEN);
    const forms = await graph(env, `${PAGE_ID}/leadgen_forms`, { fields: 'id,status', limit: '100' }, pageToken);
    for (const form of forms.data || []) {
      const leads = await graph(
        env,
        `${form.id}/leads`,
        {
          fields: 'id,created_time,field_data',
          limit: '100',
          filtering: JSON.stringify([{ field: 'time_created', operator: 'GREATER_THAN', value: since }]),
        },
        pageToken,
      );
      for (const fbLead of leads.data || []) {
        const seenKey = `fb_lead:${fbLead.id}`;
        if (await getSetting(env, seenKey)) continue;
        await setSetting(env, seenKey, now);

        const lead = mapLead(fbLead);
        await env.DB.prepare(
          "INSERT INTO leads (source, source_page, name, phone, email, address, motivation, priority) VALUES ('facebook', ?, ?, ?, ?, ?, ?, 'Warm')",
        )
          .bind(`facebook form ${form.id}`, lead.name, lead.phone, lead.email, lead.address, lead.motivation)
          .run();
      }
    }
    await setSetting(env, 'fb_last_poll', now);
    // Forget dedupe keys older than a week.
    await env.DB.prepare("DELETE FROM settings WHERE key LIKE 'fb_lead:%' AND CAST(value AS INTEGER) < ?").bind(now - 7 * 86400).run();
  } catch (err) {
    console.error('facebook poll failed', err);
  }
}
