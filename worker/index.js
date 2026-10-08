// Runs in front of the static site on Cloudflare.
// Sends www.jayniche.ca and plain http to https://jayniche.ca, then serves the page.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === 'www.jayniche.ca' || (url.protocol === 'http:' && url.hostname === 'jayniche.ca')) {
      url.hostname = 'jayniche.ca';
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};
