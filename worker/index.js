// Runs in front of the static site on Cloudflare.
// - Sends www.jayniche.ca and plain http to https://jayniche.ca
// - /api/lead saves form submissions to the CRM database
// - /crm is the private, password-protected CRM
// - Adds security headers to every page
import { handleLead } from './lead.js';
import { handleCrm } from './crm.js';

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
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === 'www.jayniche.ca' || (url.protocol === 'http:' && url.hostname === 'jayniche.ca')) {
      url.hostname = 'jayniche.ca';
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }

    let response;
    if (url.pathname === '/api/lead') response = await handleLead(request, env);
    else if (url.pathname === '/crm' || url.pathname.startsWith('/crm/')) response = await handleCrm(request, env, url);
    else response = await env.ASSETS.fetch(request);
    return withSecurityHeaders(response);
  },
};
