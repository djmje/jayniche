// Private CRM at /crm. Server-rendered HTML, no JavaScript, password login.
import { clip, clientIp, esc, hashPassword, randomToken, rateLimit, sameOrigin, sha256, toInt, verifyPassword } from './lib.js';
import { scoreLead } from './lead.js';

const COOKIE = '__Host-crm';

// An empty or malformed body is treated as an empty form instead of an error.
async function readForm(request) {
  try {
    return await request.formData();
  } catch {
    return new FormData();
  }
}
const SESSION_DAYS = 14;

export const STATUSES = [
  'New', 'Contacted', 'Appointment set', 'Offer made', 'Under contract',
  'Closed - bought', 'Referred to realtor', 'Not a fit', 'Dead',
];
const CLOSED = ['Closed - bought', 'Referred to realtor', 'Not a fit', 'Dead'];
const PRIORITIES = ['Hot', 'Warm', 'Cold'];
const SOURCES = ['website', 'facebook', 'phone', 'referral', 'other'];
const CONDITIONS = ['Move-in ready', 'Needs some work', 'Needs a lot of work'];
const OCCUPANCY = ['I live there', 'Tenants', 'Vacant'];
const TIMELINES = ['As soon as possible', '1–3 months', '3–6 months', 'Just exploring'];
const MONEY = ['asking_price', 'est_value', 'repair_estimate', 'mortgage_owing', 'offer_amount'];

// ---------- responses ----------

const SECURITY = {
  'Content-Security-Policy':
    "default-src 'none'; style-src 'self'; img-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  // same-origin (not no-referrer): with no-referrer, browsers send "Origin: null" on form posts.
  'Referrer-Policy': 'same-origin',
};

const html = (body, status = 200, extra = {}) =>
  new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', ...SECURITY, ...extra } });

const redirect = (to, extra = {}) => new Response(null, { status: 303, headers: { Location: to, ...SECURITY, ...extra } });

function page(title, body, { nav = true } = {}) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>${esc(title)} · Jay CRM</title><link rel="stylesheet" href="/crm/app.css"></head><body>
${nav ? `<header class="top"><a class="brand" href="/crm">Jay CRM</a><nav><a href="/crm">Leads</a><a href="/crm/new">+ Add lead</a><a href="/crm/export.csv">Export</a><a href="/crm/password">Password</a>
<form method="post" action="/crm/logout"><button class="link">Log out</button></form></nav></header>` : ''}
<main>${body}</main></body></html>`;
}

// ---------- auth ----------

const getCookie = (request, name) =>
  (request.headers.get('Cookie') || '').split(/;\s*/).find((c) => c.startsWith(name + '='))?.slice(name.length + 1);

async function isLoggedIn(request, env) {
  const token = getCookie(request, COOKIE);
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return false;
  const row = await env.DB.prepare('SELECT expires_at FROM sessions WHERE token_hash = ?').bind(await sha256(token)).first();
  return !!row && row.expires_at > Date.now();
}

async function setting(env, key) {
  return (await env.DB.prepare('SELECT value FROM settings WHERE key = ?').bind(key).first())?.value;
}

function loginPage(error = '') {
  return html(
    page('Log in', `<section class="card narrow"><h1>Jay CRM</h1>${error ? `<p class="error">${esc(error)}</p>` : ''}
<form method="post" action="/crm/login"><label>Password<input type="password" name="password" autocomplete="current-password" required autofocus></label>
<button>Log in</button></form></section>`, { nav: false }),
    error ? 401 : 200,
  );
}

async function login(request, env) {
  if (!(await rateLimit(env.DB, `login:${clientIp(request)}`, 5, 900))) {
    return loginPage('Too many attempts. Wait 15 minutes and try again.');
  }
  const form = await readForm(request);
  const ok = await verifyPassword(String(form.get('password') || ''), await setting(env, 'password_hash'));
  if (!ok) return loginPage('Wrong password.');

  const token = randomToken();
  const expires = Date.now() + SESSION_DAYS * 864e5;
  await env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(Date.now()).run();
  await env.DB.prepare('INSERT INTO sessions (token_hash, expires_at) VALUES (?, ?)').bind(await sha256(token), expires).run();
  const cookie = `${COOKIE}=${token}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=${SESSION_DAYS * 86400}`;
  const next = (await setting(env, 'must_change_password')) === '1' ? '/crm/password' : '/crm';
  return redirect(next, { 'Set-Cookie': cookie });
}

async function logout(request, env) {
  const token = getCookie(request, COOKIE);
  if (token) await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256(token)).run();
  return redirect('/crm/login', { 'Set-Cookie': `${COOKIE}=; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=0` });
}

// ---------- views ----------

const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Toronto' });
const money = (n) => (n == null ? '' : '$' + Number(n).toLocaleString('en-CA'));
const when = (s) => (s ? new Date(s.replace(' ', 'T') + 'Z').toLocaleString('en-CA', { timeZone: 'America/Toronto', dateStyle: 'medium', timeStyle: 'short' }) : '');
const options = (list, selected) => list.map((v) => `<option${v === selected ? ' selected' : ''}>${esc(v)}</option>`).join('');
const badge = (p) => `<span class="badge ${esc(String(p).toLowerCase())}">${esc(p)}</span>`;

async function dashboard(url, env) {
  const status = url.searchParams.get('status') || 'open';
  const priority = url.searchParams.get('priority') || '';
  const q = clip(url.searchParams.get('q'), 100);

  const where = [];
  const args = [];
  if (status === 'open') where.push(`status NOT IN (${CLOSED.map(() => '?').join(',')})`), args.push(...CLOSED);
  else if (status === 'due') {
    where.push(`follow_up IS NOT NULL AND follow_up <= ? AND status NOT IN (${CLOSED.map(() => '?').join(',')})`);
    args.push(today(), ...CLOSED);
  } else if (STATUSES.includes(status)) where.push('status = ?'), args.push(status);
  if (PRIORITIES.includes(priority)) where.push('priority = ?'), args.push(priority);
  if (q) {
    where.push('(name LIKE ? OR phone LIKE ? OR address LIKE ? OR city LIKE ?)');
    args.push(...Array(4).fill(`%${q}%`));
  }
  const sql = `SELECT id, created_at, name, phone, address, city, province, priority, score, status, follow_up, source
    FROM leads ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY CASE priority WHEN 'Hot' THEN 0 WHEN 'Warm' THEN 1 ELSE 2 END, created_at DESC LIMIT 500`;
  const { results: leads } = await env.DB.prepare(sql).bind(...args).all();

  const counts = await env.DB.prepare(
    `SELECT
      SUM(status = 'New') AS new_count,
      SUM(priority = 'Hot' AND status NOT IN (${CLOSED.map(() => '?').join(',')})) AS hot,
      SUM(follow_up IS NOT NULL AND follow_up <= ? AND status NOT IN (${CLOSED.map(() => '?').join(',')})) AS due,
      SUM(status = 'Under contract') AS contract,
      SUM(status = 'Closed - bought') AS closed
    FROM leads`,
  ).bind(...CLOSED, today(), ...CLOSED).first();

  const stat = (label, n, href) => `<a class="stat" href="${href}"><strong>${n || 0}</strong><span>${label}</span></a>`;
  const rows = leads
    .map((l) => {
      const overdue = l.follow_up && l.follow_up <= today() && !CLOSED.includes(l.status);
      return `<tr>
<td>${badge(l.priority)}</td>
<td><a href="/crm/lead/${l.id}"><strong>${esc(l.name || '(no name)')}</strong></a><br><small>${esc(l.phone)}</small></td>
<td>${esc(l.address)}${l.province ? `<br><small>${esc(l.province)}</small>` : ''}</td>
<td>${esc(l.status)}</td>
<td class="${overdue ? 'overdue' : ''}">${esc(l.follow_up || '')}</td>
<td><small>${esc(when(l.created_at))}<br>${esc(l.source)}</small></td></tr>`;
    })
    .join('');

  const statusOpts = [['open', 'All open'], ['due', 'Follow-ups due'], ['all', 'Everything'], ...STATUSES.map((s) => [s, s])]
    .map(([v, t]) => `<option value="${esc(v)}"${v === status ? ' selected' : ''}>${esc(t)}</option>`).join('');

  return html(page('Leads', `
<div class="stats">${stat('New', counts.new_count, '/crm?status=New')}${stat('Hot (open)', counts.hot, '/crm?priority=Hot')}${stat('Follow-ups due', counts.due, '/crm?status=due')}${stat('Under contract', counts.contract, '/crm?status=Under+contract')}${stat('Bought', counts.closed, '/crm?status=Closed+-+bought')}</div>
<form class="filters" method="get" action="/crm">
<select name="status">${statusOpts}</select>
<select name="priority"><option value="">Any priority</option>${options(PRIORITIES, priority)}</select>
<input type="search" name="q" value="${esc(q)}" placeholder="Search name, phone, address">
<button>Filter</button></form>
<div class="table-wrap"><table><thead><tr><th>Priority</th><th>Seller</th><th>Property</th><th>Status</th><th>Follow up</th><th>Received</th></tr></thead>
<tbody>${rows || '<tr><td colspan="6" class="empty">No leads here yet.</td></tr>'}</tbody></table></div>`));
}

function leadForm(l = {}, action) {
  const f = (name, label, type = 'text') =>
    `<label>${label}<input type="${type}" name="${name}" value="${esc(l[name] ?? '')}"${type === 'text' ? ' maxlength="300"' : ''}></label>`;
  const m = (name, label) => `<label>${label}<input type="text" inputmode="numeric" name="${name}" value="${esc(l[name] ?? '')}" placeholder="$"></label>`;
  const s = (name, label, list) => `<label>${label}<select name="${name}"><option value=""></option>${options(list, l[name])}</select></label>`;
  return `<form method="post" action="${action}" class="lead-edit">
<fieldset><legend>Status</legend><div class="grid">
${s('status', 'Status', STATUSES)}${s('priority', 'Priority', PRIORITIES)}${f('follow_up', 'Follow-up date', 'date')}${s('source', 'Source', SOURCES)}
</div></fieldset>
<fieldset><legend>Seller</legend><div class="grid">
${f('name', 'Name')}${f('phone', 'Phone', 'tel')}${f('email', 'Email', 'email')}${f('motivation', 'Why are they selling?')}
</div></fieldset>
<fieldset><legend>Property</legend><div class="grid">
${f('address', 'Address')}${f('city', 'City')}${s('province', 'Province', ['Ontario', 'Alberta'])}${f('property_type', 'Type (detached, semi, condo…)')}
${f('beds', 'Beds')}${f('baths', 'Baths')}${s('condition', 'Condition', CONDITIONS)}${s('listed', 'Listed with agent?', ['No', 'Yes'])}
${s('occupancy', 'Occupancy', OCCUPANCY)}${s('timeline', 'Timeline', TIMELINES)}
</div></fieldset>
<fieldset><legend>Numbers</legend><div class="grid">
${m('asking_price', 'Asking price')}${m('est_value', 'After-repair value')}${m('repair_estimate', 'Repair estimate')}${m('mortgage_owing', 'Mortgage owing')}${m('offer_amount', 'Our offer')}
</div></fieldset>
<button>Save</button></form>`;
}

function readLeadForm(form) {
  const l = {};
  for (const k of ['name', 'phone', 'email', 'motivation', 'address', 'city', 'property_type', 'beds', 'baths']) l[k] = clip(form.get(k), 300) || null;
  const pick = (k, list) => (list.includes(form.get(k)) ? form.get(k) : null);
  l.status = pick('status', STATUSES) || 'New';
  l.priority = pick('priority', PRIORITIES);
  l.source = pick('source', SOURCES) || 'other';
  l.province = pick('province', ['Ontario', 'Alberta']);
  l.condition = pick('condition', CONDITIONS);
  l.listed = pick('listed', ['No', 'Yes']);
  l.occupancy = pick('occupancy', OCCUPANCY);
  l.timeline = pick('timeline', TIMELINES);
  const fu = String(form.get('follow_up') || '');
  l.follow_up = /^\d{4}-\d{2}-\d{2}$/.test(fu) ? fu : null;
  for (const k of MONEY) l[k] = toInt(form.get(k));
  const { score, priority } = scoreLead(l);
  l.score = score;
  l.priority = l.priority || priority;
  return l;
}

const LEAD_COLUMNS = ['name', 'phone', 'email', 'motivation', 'address', 'city', 'province', 'property_type', 'beds', 'baths', 'condition', 'listed', 'occupancy', 'timeline', 'status', 'priority', 'score', 'source', 'follow_up', ...MONEY];

async function leadDetail(id, env, saved = false) {
  const l = await env.DB.prepare('SELECT * FROM leads WHERE id = ?').bind(id).first();
  if (!l) return html(page('Not found', '<p>Lead not found.</p>'), 404);
  const { results: notes } = await env.DB.prepare('SELECT * FROM notes WHERE lead_id = ? ORDER BY created_at DESC').bind(id).all();
  const tel = (l.phone || '').replace(/[^0-9+]/g, '');
  const maps = l.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(l.address + (l.city ? ', ' + l.city : '') + (l.province ? ', ' + l.province : ''))}` : '';
  const spread = l.est_value != null && l.offer_amount != null ? l.est_value - l.offer_amount - (l.repair_estimate || 0) : null;

  return html(page(l.name || 'Lead', `
<p><a href="/crm">← All leads</a></p>
${saved ? '<p class="saved">Saved.</p>' : ''}
<div class="lead-head"><div><h1>${esc(l.name || '(no name)')} ${badge(l.priority)}</h1>
<p>${esc([l.address, l.city, l.province].filter(Boolean).join(', '))}</p>
<p class="muted">Received ${esc(when(l.created_at))} · ${esc(l.source)}${l.source_page ? ` · from <code>${esc(l.source_page)}</code>` : ''} · score ${l.score}</p></div>
<div class="actions">${tel ? `<a class="btn" href="tel:${esc(tel)}">Call</a><a class="btn" href="sms:${esc(tel)}">Text</a>` : ''}${maps ? `<a class="btn ghost" href="${esc(maps)}" rel="noreferrer" target="_blank">Map</a>` : ''}</div></div>
${spread != null ? `<p class="card">Rough spread: after-repair value ${money(l.est_value)} − offer ${money(l.offer_amount)} − repairs ${money(l.repair_estimate || 0)} = <strong>${money(spread)}</strong> (before holding and selling costs)</p>` : ''}
<div class="two-col"><section class="card">${leadForm(l, `/crm/lead/${l.id}`)}</section>
<section class="card"><h2>Notes</h2>
<form method="post" action="/crm/lead/${l.id}/note"><textarea name="body" rows="3" maxlength="5000" required placeholder="Call notes, what they said, next step…"></textarea><button>Add note</button></form>
${notes.map((n) => `<div class="note"><small>${esc(when(n.created_at))}</small><p>${esc(n.body).replace(/\n/g, '<br>')}</p></div>`).join('') || '<p class="muted">No notes yet.</p>'}
<details class="danger"><summary>Delete this lead</summary>
<form method="post" action="/crm/lead/${l.id}/delete"><label class="check"><input type="checkbox" name="confirm" value="yes" required> Yes, permanently delete this lead and its notes</label><button class="danger-btn">Delete</button></form></details>
</section></div>`));
}

async function updateLead(id, request, env) {
  const l = readLeadForm(await readForm(request));
  await env.DB.prepare(`UPDATE leads SET ${LEAD_COLUMNS.map((c) => `${c} = ?`).join(', ')}, updated_at = datetime('now') WHERE id = ?`)
    .bind(...LEAD_COLUMNS.map((c) => l[c] ?? null), id).run();
  return redirect(`/crm/lead/${id}?saved=1`);
}

async function createLead(request, env) {
  const l = readLeadForm(await readForm(request));
  if (!l.name && !l.phone && !l.address) return redirect('/crm/new');
  const r = await env.DB.prepare(`INSERT INTO leads (${LEAD_COLUMNS.join(', ')}) VALUES (${LEAD_COLUMNS.map(() => '?').join(', ')})`)
    .bind(...LEAD_COLUMNS.map((c) => l[c] ?? null)).run();
  return redirect(`/crm/lead/${r.meta.last_row_id}`);
}

async function exportCsv(env) {
  const { results } = await env.DB.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
  const cols = results.length ? Object.keys(results[0]) : ['id'];
  // Prefix cells that start with = + - @ so spreadsheets don't run them as formulas.
  const cell = (v) => {
    let s = String(v ?? '');
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const body = [cols.join(','), ...results.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\n');
  return new Response(body, {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="leads-${today()}.csv"`, ...SECURITY },
  });
}

function passwordPage(msg = '', error = false) {
  return page('Password', `<section class="card narrow"><h1>Change password</h1>${msg ? `<p class="${error ? 'error' : 'saved'}">${esc(msg)}</p>` : ''}
<form method="post" action="/crm/password"><label>Current password<input type="password" name="current" autocomplete="current-password" required></label>
<label>New password (at least 12 characters)<input type="password" name="next" autocomplete="new-password" minlength="12" required></label>
<label>New password again<input type="password" name="again" autocomplete="new-password" minlength="12" required></label><button>Change password</button></form></section>`);
}

async function changePassword(request, env) {
  const form = await readForm(request);
  const next = String(form.get('next') || '');
  if (!(await verifyPassword(String(form.get('current') || ''), await setting(env, 'password_hash')))) return html(passwordPage('Current password is wrong.', true), 400);
  if (next.length < 12) return html(passwordPage('New password must be at least 12 characters.', true), 400);
  if (next !== form.get('again')) return html(passwordPage('The new passwords don’t match.', true), 400);
  await env.DB.batch([
    env.DB.prepare("INSERT INTO settings (key, value) VALUES ('password_hash', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").bind(await hashPassword(next)),
    env.DB.prepare("INSERT INTO settings (key, value) VALUES ('must_change_password', '0') ON CONFLICT(key) DO UPDATE SET value = '0'"),
    // Log out every other session.
    env.DB.prepare('DELETE FROM sessions'),
  ]);
  return redirect('/crm/login');
}

const CSS = `*{box-sizing:border-box}body{margin:0;font:15px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#24272b;background:#f4f1ea}
a{color:#3e5545}main{max-width:1200px;margin:0 auto;padding:16px}h1{font-size:1.5rem;margin:0 0 4px}h2{font-size:1.15rem}
.top{display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;justify-content:space-between;padding:10px 16px;background:#4f6b57;color:#fff}
.top a,.top .link{color:#fff;text-decoration:none;font-weight:600}.brand{font-size:1.1rem}.top nav{display:flex;flex-wrap:wrap;gap:14px;align-items:center}.top form{margin:0}
button{background:#4f6b57;color:#fff;border:0;border-radius:8px;padding:9px 16px;font:inherit;font-weight:600;cursor:pointer}
button.link{background:none;padding:0}.btn{display:inline-block;background:#4f6b57;color:#fff;border-radius:8px;padding:8px 14px;text-decoration:none;font-weight:600}
.btn.ghost{background:#fff;color:#4f6b57;border:1px solid #4f6b57}.actions{display:flex;gap:8px;flex-wrap:wrap;align-items:flex-start}
input,select,textarea{width:100%;padding:8px 10px;border:1px solid #cfc8b8;border-radius:8px;font:inherit;background:#fff;margin-top:3px}
label{display:block;font-weight:600;font-size:.9rem}label.check{display:flex;gap:8px;align-items:center;font-weight:500}label.check input{width:auto}
.card{background:#fff;border:1px solid #dcd5c6;border-radius:10px;padding:16px;margin-bottom:16px}.narrow{max-width:420px;margin:40px auto}.narrow label{margin-bottom:12px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:14px}
.stat{background:#fff;border:1px solid #dcd5c6;border-radius:10px;padding:12px;text-decoration:none;color:#24272b}.stat strong{display:block;font-size:1.6rem}.stat span{color:#555a5f;font-size:.9rem}
.filters{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}.filters select,.filters input{width:auto;flex:1 1 160px;margin:0}
.table-wrap{overflow-x:auto;background:#fff;border:1px solid #dcd5c6;border-radius:10px}table{width:100%;border-collapse:collapse;min-width:720px}
th,td{text-align:left;padding:10px;border-bottom:1px solid #eee8dc;vertical-align:top}th{font-size:.8rem;text-transform:uppercase;color:#555a5f;background:#faf8f3}
.empty{text-align:center;color:#555a5f;padding:30px}.overdue{color:#b91c1c;font-weight:700}
.badge{display:inline-block;font-size:.75rem;font-weight:700;padding:2px 8px;border-radius:999px;vertical-align:middle}
.badge.hot{background:#fde2e1;color:#991b1b}.badge.warm{background:#fdf0d5;color:#8a5a12}.badge.cold{background:#e5e7eb;color:#374151}
.lead-head{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;margin-bottom:12px}.muted{color:#555a5f;font-size:.9rem}
.two-col{display:grid;gap:16px}@media(min-width:960px){.two-col{grid-template-columns:3fr 2fr;align-items:start}}
fieldset{border:0;padding:0;margin:0 0 14px}legend{font-weight:800;margin-bottom:6px}.grid{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(170px,1fr))}
.note{border-top:1px solid #eee8dc;padding-top:8px;margin-top:8px}.note p{margin:2px 0}textarea{margin-bottom:8px}
.saved{background:#e6f2e8;border:1px solid #9fc5a8;padding:8px 12px;border-radius:8px}.error{background:#fde2e1;border:1px solid #f1a9a6;padding:8px 12px;border-radius:8px}
.danger{margin-top:20px}
@media(max-width:700px){table{min-width:0}thead{display:none}tr{display:block;padding:8px 0;border-bottom:1px solid #eee8dc}td{display:block;border:0;padding:3px 12px}td:empty{display:none}}.danger summary{color:#b91c1c;cursor:pointer}.danger-btn{background:#b91c1c;margin-top:8px}code{font-size:.85em}`;

// ---------- router ----------

export async function handleCrm(request, env, url) {
  const path = url.pathname.replace(/\/+$/, '') || '/crm';
  const method = request.method;

  if (path === '/crm/app.css') {
    return new Response(CSS, { headers: { 'Content-Type': 'text/css; charset=utf-8', 'Cache-Control': 'no-store' } });
  }
  // Every state-changing request must come from a CRM page on this site.
  if (method === 'POST' && !sameOrigin(request)) return html(page('Forbidden', '<p>Forbidden.</p>', { nav: false }), 403);

  if (path === '/crm/login') return method === 'POST' ? login(request, env) : loginPage();
  if (!(await isLoggedIn(request, env))) return redirect('/crm/login');

  if (path === '/crm/logout' && method === 'POST') return logout(request, env);
  if (path === '/crm' && method === 'GET') return dashboard(url, env);
  if (path === '/crm/export.csv') return exportCsv(env);
  if (path === '/crm/password') return method === 'POST' ? changePassword(request, env) : html(passwordPage());
  if (path === '/crm/new') {
    return method === 'POST'
      ? createLead(request, env)
      : html(page('Add lead', `<p><a href="/crm">← All leads</a></p><h1>Add a lead</h1><p class="muted">For calls, Facebook lead ads, referrals or anything that didn’t come through the website.</p><section class="card">${leadForm({ status: 'New', source: 'phone' }, '/crm/new')}</section>`));
  }

  const m = path.match(/^\/crm\/lead\/(\d+)(?:\/(note|delete))?$/);
  if (m) {
    const id = Number(m[1]);
    if (!m[2] && method === 'GET') return leadDetail(id, env, url.searchParams.get('saved') === '1');
    if (!m[2] && method === 'POST') return updateLead(id, request, env);
    if (m[2] === 'note' && method === 'POST') {
      const body = clip((await readForm(request)).get('body'), 5000);
      if (body) {
        await env.DB.batch([
          env.DB.prepare('INSERT INTO notes (lead_id, body) VALUES (?, ?)').bind(id, body),
          env.DB.prepare("UPDATE leads SET updated_at = datetime('now') WHERE id = ?").bind(id),
        ]);
      }
      return redirect(`/crm/lead/${id}`);
    }
    if (m[2] === 'delete' && method === 'POST') {
      if ((await readForm(request)).get('confirm') === 'yes') {
        await env.DB.batch([
          env.DB.prepare('DELETE FROM notes WHERE lead_id = ?').bind(id),
          env.DB.prepare('DELETE FROM leads WHERE id = ?').bind(id),
        ]);
        return redirect('/crm');
      }
      return redirect(`/crm/lead/${id}`);
    }
  }
  return html(page('Not found', '<p>Page not found.</p>'), 404);
}
