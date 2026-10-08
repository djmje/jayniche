import { site, hasPhone } from '../data/site';
import { cities } from '../data/cities';
import { ontarioRegions } from '../data/regions';

export const localBusinessSchema = (description: string) => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: site.name,
  url: site.url,
  image: `${site.url}/og-image.png`,
  description,
  ...(hasPhone && { telephone: site.phoneE164 }),
  ...(site.email && { email: site.email }),
  areaServed: [
    { '@type': 'AdministrativeArea', name: 'Ontario' },
    { '@type': 'AdministrativeArea', name: 'Alberta' },
    ...ontarioRegions.map((r) => ({
      '@type': 'Place',
      name: `${r.name}, Ontario`,
      containedInPlace: { '@type': 'AdministrativeArea', name: 'Ontario' },
    })),
    ...cities.map((c) => ({
      '@type': 'City',
      name: c.name.replace(' & the GTA', ''),
      containedInPlace: { '@type': 'AdministrativeArea', name: c.province === 'ontario' ? 'Ontario' : 'Alberta' },
    })),
  ],
  sameAs: [site.instagram],
});

export const faqSchema = (faqs: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

export const breadcrumbSchema = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: new URL(it.path, site.url).href,
  })),
});
