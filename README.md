# Jay Home Buyers website (jayniche.ca)

A fast, static site built with [Astro](https://astro.build) and hosted free on Cloudflare Pages.
Every push to GitHub rebuilds the site automatically.

## Where things live

| What | File |
| --- | --- |
| Phone, email, cities, form endpoint, tracking IDs | `src/data/site.ts` |
| Header, footer, SEO tags, GA4 and Meta Pixel | `src/layouts/Base.astro` |
| Lead form | `src/components/LeadForm.astro` |
| Pages (each file = one URL) | `src/pages/` |
| Colours and layout | `src/styles/global.css` |
| Copy of the old jayniche.ca site | `archive/` |

## Cloudflare Pages build settings

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
