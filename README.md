# Jay Home Buyers website (jayniche.ca)

A fast, static site built with [Astro](https://astro.build) and hosted free on Cloudflare Pages.
Every push to GitHub rebuilds the site automatically.

## Where things live

| What | File |
| --- | --- |
| Phone, email, Web3Forms key, GA4 / Meta Pixel / Search Console IDs | `src/data/site.ts` |
| City pages (add a city = add an entry) | `src/data/cities.ts` |
| Situation pages (inherited, tenants, power of sale, …) | `src/data/situations.ts` |
| Blog posts (add a post = add a `.md` file) | `src/pages/blog/` |
| Redirects, security headers, routing | `worker/index.js` |
| Laptop CRM (runs on your computer) | `crm/jaycrm.py`, setup in `crm/README.md` |
| Lead drop box the laptop CRM pulls from | `worker/lead.js`, `worker/inbox.js` |
| Where each legal fact comes from | `SOURCES.md` |
| Your to-do list (Google, directories, reviews, 90-day plan) | `docs/LAUNCH-CHECKLIST.md` |
| Questions to ask RECO and RECA | `docs/RECO-RECA-checklist.md` |
| Header, footer, SEO tags, GA4 and Meta Pixel | `src/layouts/Base.astro` |
| Lead form | `src/components/LeadForm.astro` |
| Pages (each file = one URL) | `src/pages/` |
| Colours and layout | `src/styles/global.css` |
| Copy of the old jayniche.ca site | `archive/` |

## How it deploys

Cloudflare Workers Builds (Worker name `jayniche`) watches this GitHub repo.

- Push to **`main`** → goes live on https://jayniche.ca (and www redirects to it).
- Push to any other branch → gets a preview link (Cloudflare → Workers & Pages → jayniche → Previews).

## Old Cloudflare Pages notes (not used)

In Cloudflare: **Workers & Pages → your project → Settings → Build**.

- Framework preset: **Astro**
- Build command: `npm run build`
- Build output directory: `dist`
- Node version: read from `.node-version` (22). If the build complains, add an
  environment variable `NODE_VERSION` = `22`.

Every branch gets its own preview link. The production branch (usually `main`) is
what goes live on jayniche.ca once the domain is connected.

## Run it on your own computer (optional)

1. Install Node.js 22 or newer from nodejs.org.
2. In this folder run `npm install`, then `npm run dev`.
3. Open http://localhost:4321.
