// Runs in front of the static site on Cloudflare.
// - Sends www.jayniche.ca and plain http to https://jayniche.ca
// - /api/lead saves form submissions to a drop box until the laptop CRM pulls them
// - /api/inbox is how the laptop CRM (crm/jaycrm.py) pulls them, with a secret key
// - Every 2 minutes, pulls new Facebook lead ad leads into the drop box (worker/facebook.js)
// - Adds security headers to every page
import { handleLead } from './lead.js';
import { handleInbox } from './inbox.js';
import { pollFacebookLeads } from './facebook.js';

const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
};

function withSecurityHeaders(response) {
  const r = new Response(response.body, response);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) if (!r.headers.has(k)) r.headers.set(k, v);
  return r;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.hostname === 'www.jayniche.ca' || (url.protocol === 'http:' && url.hostname === 'jayniche.ca')) {
      url.hostname = 'jayniche.ca';
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }

    // The old Hamilton landing page was folded into the Hamilton city page.
    if (url.pathname === '/we-buy-houses-hamilton' || url.pathname === '/we-buy-houses-hamilton/') {
      return Response.redirect(`https://jayniche.ca/ontario/hamilton/${url.search}`, 301);
    }

    let response;
    if (url.pathname === '/api/lead') response = await handleLead(request, env, ctx);
    else if (url.pathname === '/api/inbox' || url.pathname === '/api/inbox/ack') response = await handleInbox(request, env, url);
    else response = await env.ASSETS.fetch(request);
    return withSecurityHeaders(response);
  },

  // Cron (wrangler.jsonc "triggers"): new Facebook lead ad leads.
  async scheduled(event, env, ctx) {
    ctx.waitUntil(pollFacebookLeads(env));
  },
};
