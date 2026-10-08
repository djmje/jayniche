# Launch checklist: things only you can do

The site is live at https://jayniche.ca. These steps get it found on Google and tracked properly.
Do them roughly in this order. Each takes 5–20 minutes.

**Keep your business name and phone number identical everywhere:** "Jay Home Buyers", the same
phone number, and https://jayniche.ca.

---

## 1. Fill in your details on the site (5 min, tell Claude or edit `src/data/site.ts`)

- [ ] Business phone (turns on the tap-to-call buttons and adds it to Google's business info)
- [ ] Business email (shown on Contact and in the footer)
- [ ] Your photo for the About page
- [ ] Meta Pixel ID: Facebook **Events Manager** → **Data sources** → your Pixel/dataset → copy
      the ID (a long number). Put it in `metaPixelId`. The site then sends a **Lead** event every
      time the form is submitted, so you can build a retargeting audience and optimize ads for leads.

## 2. Google Search Console (15 min)

1. Go to https://search.google.com/search-console and click **Add property**.
2. Choose **Domain** and type `jayniche.ca`.
3. Google shows a **TXT record**. Copy it.
4. In Cloudflare: **jayniche.ca → DNS → Records → Add record**, Type **TXT**, Name `@`, paste the value, Save.
5. Back in Search Console click **Verify** (can take a few minutes).
6. Go to **Sitemaps**, enter `sitemap-index.xml`, and click **Submit**.
7. Go to **URL inspection**, paste `https://jayniche.ca/`, and click **Request indexing**. Repeat for
   `/ontario/` and `/alberta/`.

(Alternative: Search Console's **URL prefix** option gives an HTML tag. Put its `content="..."`
value in `googleSiteVerification` in `src/data/site.ts`.)

## 3. Google Analytics 4 (10 min)

1. https://analytics.google.com → **Admin → Create → Property**, name it "Jay Home Buyers", time zone Toronto (or Edmonton).
2. Choose **Web**, enter `https://jayniche.ca`.
3. Copy the **Measurement ID** (`G-XXXXXXXXXX`) into `ga4Id` in `src/data/site.ts`.
4. After it's live: **Admin → Events**, find `generate_lead`, and mark it as a **Key event**. That's
   your form submission. The event includes `source_page`, so you can see which pages produce leads.

## 4. Google Business Profile (20 min + verification)

1. https://business.google.com → **Add business** → "Jay Home Buyers".
2. Category: pick the closest investor-type category Google offers (for example **Property investment company** or **Real estate investment company**). Do **not** pick "Real estate agency" or "Real estate agent".
3. When asked "Do you want to add a location customers can visit?", choose **No**. This makes you a
   **service-area business** and hides your address.
4. Service areas: add Ontario and Alberta, plus the cities you serve (Toronto, Ottawa, London,
   Kitchener, Waterloo, Windsor, Sudbury, Calgary, Edmonton, Red Deer, Lethbridge).
5. Phone and website `https://jayniche.ca`.
6. Verify (Google may ask for a video of you, your vehicle or business documents).
7. Description: *"Jay Home Buyers buys houses for cash, as-is, across Ontario and Alberta. No
   repairs, no showings and no agent fees. We cover your lawyer fees and you pick the closing date.
   Every offer is reviewed by a real person. We're a private buyer, not a real estate brokerage."*
8. First 3 posts (one a week):
   - "Inherited a house? We buy estate properties as-is, belongings and all. https://jayniche.ca/ontario/inherited-house/"
   - "Tired landlord? We buy rentals with tenants in place. https://jayniche.ca/ontario/sell-house-with-tenants/"
   - "House needs major repairs? Skip them. Get a fair cash offer and pick your closing date. https://jayniche.ca/situations/house-needs-repairs/"

## 5. Bing Webmaster Tools (5 min)

https://www.bing.com/webmasters → sign in → **Import from Google Search Console**. Done.

## 6. Directory listings (once your phone number is set)

Same name, phone and website on every one:

- [ ] Bing Places: https://www.bingplaces.com (can import from Google Business Profile)
- [ ] Apple Business Connect: https://businessconnect.apple.com
- [ ] Yelp: https://biz.yelp.ca
- [ ] Canada411 / Yellow Pages: https://www.yellowpages.ca
- [ ] Facebook Page: add the website and phone to the About section
- [ ] Instagram bio: link is already `jayniche.ca`, nothing to change

## 7. Link and lead test (5 min)

- [ ] Open your **Instagram bio link** on your phone. It should land on the new page with the form.
- [ ] Open your **Facebook ad** preview link. Same check.
- [ ] Open `https://www.jayniche.ca` and `http://jayniche.ca`. Both should go to `https://jayniche.ca`.
- [ ] Submit the form once with "TEST" as the name. Within a minute, readbyjay@gmail.com should
      get "New lead from Jay Home Buyers website" with all fields and `source_page`.
- [ ] Then delete the old Cloudflare Worker `white-darkness-0aa3`
      (Workers & Pages → white-darkness-0aa3 → Settings → Delete). A copy is saved in `archive/`.

## 8. Review request text (send after a closed deal)

> Hi [Name], thanks again for trusting us with [address]. If you were happy with how it went,
> would you mind leaving a short Google review? It really helps other homeowners find us:
> [your Google review link]. No pressure at all. Thanks! – Jay, Jay Home Buyers

(Get your review link in Google Business Profile → **Ask for reviews**. Only ask real sellers,
never offer anything in exchange, and never write reviews yourself.)

## 9. Next 90 days

**Every week (15 min in Search Console):**
- **Performance → Search results:** which searches you show up for, and which pages get clicks.
- **Pages:** any pages "Not indexed"? Click in to see why.
- Look for searches with lots of impressions but few clicks. Those page titles may need work.

**One new page or post per week:**

| Week | Add |
| --- | --- |
| 1 | City page: Hamilton |
| 2 | Blog: "How long does probate take in Alberta?" |
| 3 | City page: Mississauga or Brampton (split from Toronto) |
| 4 | Blog: "What is a Real Property Report and do I need one to sell?" (Alberta) |
| 5 | City page: St. Catharines / Niagara |
| 6 | Blog: "Selling a house with a hoarding problem" |
| 7 | City page: Airdrie or St. Albert |
| 8 | Blog: "Ontario N12 notice: what landlords selling a rental need to know" |
| 9 | City page: Guelph or Barrie |
| 10 | Blog: "Selling a house after a divorce in Alberta" |
| 11 | City page: Medicine Hat or Grande Prairie |
| 12 | Blog: a real (anonymized, with permission) story from a deal you closed |

**Monthly:** ask every happy seller for a review, and add one real photo (you, a property, a
handshake) to the About page or Google Business Profile.
