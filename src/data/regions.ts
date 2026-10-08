// Ontario regions and the cities/towns in them with roughly 30,000+ people (2021 Census).
// A city with a `slug` links to its own page in src/data/cities.ts; the rest are listed as text.
// To give a city its own page, add it to cities.ts and put its slug here.

export interface Region {
  id: string;
  name: string;
  blurb: string;
  cities: { name: string; slug?: string }[];
}

export const ontarioRegions: Region[] = [
  {
    id: 'gta',
    name: 'Toronto & the GTA',
    blurb: 'Toronto plus Peel, York, Durham and Halton regions.',
    cities: [
      { name: 'Toronto', slug: 'toronto' }, { name: 'Mississauga' }, { name: 'Brampton' }, { name: 'Caledon' },
      { name: 'Vaughan' }, { name: 'Markham' }, { name: 'Richmond Hill' }, { name: 'Newmarket' }, { name: 'Aurora' },
      { name: 'Whitchurch-Stouffville' }, { name: 'Georgina' }, { name: 'East Gwillimbury' },
      { name: 'Oshawa' }, { name: 'Whitby' }, { name: 'Ajax' }, { name: 'Pickering' }, { name: 'Clarington' },
      { name: 'Oakville' }, { name: 'Burlington' }, { name: 'Milton' }, { name: 'Halton Hills' },
    ],
  },
  {
    id: 'hamilton-niagara',
    name: 'Hamilton & Niagara',
    blurb: 'Hamilton and the Niagara Region.',
    cities: [
      { name: 'Hamilton' }, { name: 'St. Catharines' }, { name: 'Niagara Falls' }, { name: 'Welland' }, { name: 'Fort Erie' },
    ],
  },
  {
    id: 'waterloo-wellington',
    name: 'Waterloo Region & Wellington',
    blurb: 'Kitchener-Waterloo, Cambridge, Guelph and area.',
    cities: [
      { name: 'Kitchener', slug: 'kitchener-waterloo' }, { name: 'Waterloo', slug: 'kitchener-waterloo' },
      { name: 'Cambridge' }, { name: 'Guelph' }, { name: 'Centre Wellington' },
    ],
  },
  {
    id: 'southwestern',
    name: 'Southwestern Ontario',
    blurb: 'London, Windsor-Essex and the communities between.',
    cities: [
      { name: 'London', slug: 'london' }, { name: 'Windsor', slug: 'windsor' }, { name: 'Lakeshore' }, { name: 'LaSalle' },
      { name: 'Chatham-Kent' }, { name: 'Sarnia' }, { name: 'St. Thomas' }, { name: 'Woodstock' }, { name: 'Stratford' },
      { name: 'Brantford' }, { name: 'Brant County' }, { name: 'Norfolk County' }, { name: 'Haldimand County' },
    ],
  },
  {
    id: 'central',
    name: 'Central Ontario',
    blurb: 'Simcoe County, Dufferin, the Kawarthas and Peterborough.',
    cities: [
      { name: 'Barrie' }, { name: 'Innisfil' }, { name: 'Bradford West Gwillimbury' }, { name: 'New Tecumseth' },
      { name: 'Orillia' }, { name: 'Orangeville' }, { name: 'Peterborough' }, { name: 'Kawartha Lakes' },
    ],
  },
  {
    id: 'eastern',
    name: 'Eastern Ontario',
    blurb: 'Ottawa, Kingston, the Quinte area and Cornwall.',
    cities: [
      { name: 'Ottawa', slug: 'ottawa' }, { name: 'Kingston' }, { name: 'Belleville' }, { name: 'Quinte West' }, { name: 'Cornwall' },
    ],
  },
  {
    id: 'northern',
    name: 'Northern Ontario',
    blurb: 'Sudbury, Thunder Bay, the Soo, North Bay and Timmins.',
    cities: [
      { name: 'Greater Sudbury', slug: 'sudbury' }, { name: 'Thunder Bay' }, { name: 'Sault Ste. Marie' },
      { name: 'North Bay' }, { name: 'Timmins' },
    ],
  },
];
