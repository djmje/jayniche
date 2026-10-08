// POST /api/lead: saves a website form submission to the CRM database.
import { clip, clientIp, json, rateLimit, sameOrigin } from './lib.js';

// Scores a lead against the "good lead" profile: needs work, not listed,
// motivated timeline. Listed homes are usually not a fit.
export function scoreLead({ condition, listed, occupancy, timeline }) {
  let score = 0;
  score += { 'Needs a lot of work': 3, 'Needs some work': 2 }[condition] ?? 0;
  score += { Yes: -4, No: 1 }[listed] ?? 0;
  score += { Vacant: 2, Tenants: 1 }[occupancy] ?? 0;
  score += { 'As soon as possible': 3, '1–3 months': 2, '3–6 months': 1 }[timeline] ?? 0;
  const priority = listed === 'Yes' ? 'Cold' : score >= 6 ? 'Hot' : score >= 3 ? 'Warm' : 'Cold';
  return { score, priority };
}

export async function handleLead(request, env) {
  if (request.method !== 'POST') return json({ success: false, message: 'Method not allowed' }, 405);
  if (!sameOrigin(request)) return json({ success: false, message: 'Forbidden' }, 403);

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ success: false, message: 'Bad request' }, 400);
  }

  // Honeypot: real people never fill this hidden field. Pretend it worked.
  if (form.get('botcheck')) return json({ success: true });

  if (!(await rateLimit(env.DB, `lead:${clientIp(request)}`, 10, 3600))) {
    return json({ success: false, message: 'Too many submissions. Please call us instead.' }, 429);
  }

  const lead = {
    source_page: clip(form.get('source_page'), 200),
    name: clip(form.get('name'), 120),
    phone: clip(form.get('phone'), 40),
    address: clip(form.get('address'), 300),
    province: clip(form.get('province'), 20),
    condition: clip(form.get('condition'), 40),
    listed: clip(form.get('listed'), 10),
    occupancy: clip(form.get('occupancy'), 30),
    timeline: clip(form.get('timeline'), 30),
  };
  if (!lead.name || !lead.phone || !lead.address) {
    return json({ success: false, message: 'Missing required fields' }, 400);
  }

  const { score, priority } = scoreLead(lead);
  await env.DB.prepare(
    `INSERT INTO leads (source, source_page, name, phone, address, province, condition, listed, occupancy, timeline, score, priority)
     VALUES ('website', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(lead.source_page, lead.name, lead.phone, lead.address, lead.province, lead.condition, lead.listed, lead.occupancy, lead.timeline, score, priority)
    .run();

  return json({ success: true });
}
