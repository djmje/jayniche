// City pages. Each city gets its own page at /<province>/<slug>/.
// Keep every entry genuinely local: neighbourhoods, housing stock and what sellers there deal with.

export interface City {
  slug: string;
  name: string;
  province: 'ontario' | 'alberta';
  title: string; // <title>, under 60 characters
  description: string;
  intro: string;
  neighbourhoods: string[];
  housing: string[]; // paragraphs about local housing stock and common issues
  local: string[]; // paragraphs about selling in this market
  situations: string[]; // slugs of the most relevant situation pages
}

export const cities: City[] = [
  {
    slug: 'toronto',
    name: 'Toronto & the GTA',
    province: 'ontario',
    title: 'Sell Your House Fast in Toronto | Cash Offer, As-Is',
    description:
      'Sell your Toronto or GTA house as-is for cash. No repairs, showings or agent fees. Inherited homes, rentals and houses that need work. You pick the closing date.',
    intro:
      'Toronto homes sell well when they are polished and listed. Plenty of houses in the GTA aren’t in that shape, though: a parent’s bungalow that hasn’t been updated since the 1970s, a semi with a basement that takes on water, or a rental with tenants who don’t want showings. We buy those houses as they are.',
    neighbourhoods: [
      'Scarborough', 'North York', 'Etobicoke', 'East York', 'York and Weston', 'Leslieville and Riverdale',
      'Mississauga', 'Brampton', 'Vaughan', 'Markham', 'Pickering and Ajax', 'Oshawa and Whitby',
    ],
    housing: [
      'Much of the GTA’s older housing is post-war: brick bungalows and side-splits in Scarborough, Etobicoke and North York, many still on their original wiring, windows and furnaces. Closer to downtown, semi-detached and row houses in neighbourhoods like Leslieville and Riverdale are often more than a hundred years old, and some still have knob-and-tube wiring or galvanized plumbing that insurers and buyers’ inspectors flag.',
      'Basements are a common sticking point. Wet or flooded basements, unpermitted basement apartments and older foundations can scare off financed buyers or drag out a listing. We look at these issues as part of the price rather than asking you to fix them first.',
    ],
    local: [
      'Ontario sellers don’t pay land transfer tax, but a traditional sale still means agent commission, staging, repairs from the buyer’s inspection and carrying costs while the house sits. In Toronto the buyer also pays the municipal land transfer tax, which can make some buyers more price-sensitive on homes that need work.',
      'If the house is part of an estate, the executor generally needs a Certificate of Appointment of Estate Trustee before signing a sale agreement. If tenants live there, Ontario’s Landlord and Tenant Board rules decide what notice they get. We can buy with tenants in place, so you don’t have to end anyone’s tenancy to sell to us.',
    ],
    situations: ['ontario-inherited', 'ontario-tenants', 'repairs', 'ontario-power-of-sale'],
  },
  {
    slug: 'ottawa',
    name: 'Ottawa',
    province: 'ontario',
    title: 'Sell Your House Fast in Ottawa | Cash Offer, Any Condition',
    description:
      'Sell your Ottawa house as-is for a fair cash offer. No repairs, showings or commissions. Estates, rentals, damaged homes and tight timelines. You choose the closing date.',
    intro:
      'Ottawa has a lot of steady, well-kept housing, but it also has older homes that need more than a coat of paint, plenty of rentals near the universities and military postings that force quick moves. If listing your house feels like a project you don’t have time for, we can make you an offer on it as it is.',
    neighbourhoods: [
      'Vanier', 'Overbrook', 'Alta Vista', 'Carlington', 'Westboro and Hintonburg', 'Sandy Hill', 'Centretown',
      'Kanata', 'Orléans', 'Barrhaven', 'Nepean', 'Gloucester',
    ],
    housing: [
      'Inner neighbourhoods like Westboro, Carlington and Overbrook have small post-war “wartime” houses and 1950s bungalows, many on original foundations and systems. Sandy Hill and Centretown have older brick homes, some carved into multiple units over the years, which can raise questions about permits and fire separation when you sell.',
      'Some areas along the Ottawa River, such as Constance Bay and parts of Cumberland, were hit by the 2017 and 2019 spring floods, and some homes still carry the effects. Water damage, old repairs and insurance history are all things we can work around.',
    ],
    local: [
      'Ottawa has a large federal and military workforce, so relocations and postings are a common reason people need to sell on a set date. Because you choose the closing date with us, you can line the sale up with your move instead of hoping a buyer’s timing matches yours.',
      'Rental houses near the University of Ottawa and Carleton are often tenant-occupied year-round. Ontario’s Landlord and Tenant Board rules apply, and we can buy with tenants in place.',
    ],
    situations: ['relocating', 'ontario-tenants', 'repairs', 'ontario-inherited'],
  },
  {
    slug: 'london',
    name: 'London',
    province: 'ontario',
    title: 'Sell Your House Fast in London, ON | Cash Offer, As-Is',
    description:
      'Sell your London, Ontario house as-is for cash. No repairs, cleanup or showings. Student rentals, estates and older homes. Fair offer, and you pick the closing date.',
    intro:
      'London has everything from Victorian homes in Old South to 1960s bungalows in Westmount and student rentals around Western and Fanshawe. If yours needs work, has tenants, or is part of an estate, selling it the usual way can take a lot of time and money up front. We buy houses in London as they are.',
    neighbourhoods: [
      'Old East Village', 'Old South and Wortley Village', 'Old North', 'SoHo', 'Hamilton Road', 'Argyle',
      'Westmount', 'Byron', 'Masonville', 'Huron Heights', 'White Oaks', 'Lambeth',
    ],
    housing: [
      'London’s older core, including Old East Village, SoHo, Old South and Old North, is full of homes built before the Second World War. They have character, but often also original wiring, plaster walls, old plumbing and foundations that need attention. Further out, Argyle, Huron Heights and Westmount have many post-war bungalows and back-splits that haven’t been updated.',
      'Around Western University and Fanshawe College, many single-family homes have been converted into student rentals. These often come with wear and tear, multiple tenants on separate leases, and questions about licensing and permits.',
    ],
    local: [
      'Student rentals and other tenant-occupied houses are a big part of London’s market. Ontario’s Landlord and Tenant Board rules decide how and when a tenancy can end. We can buy with tenants in place, which saves you from serving notices or waiting for leases to run out.',
      'If you’ve inherited a house in London, the executor usually needs to get the estate certificate from the Superior Court of Justice before a sale can close. We’re happy to wait for it and line up the closing date with the estate’s timing.',
    ],
    situations: ['ontario-tenants', 'ontario-inherited', 'repairs', 'divorce'],
  },
  {
    slug: 'kitchener-waterloo',
    name: 'Kitchener-Waterloo',
    province: 'ontario',
    title: 'Sell Your House Fast in Kitchener-Waterloo | Cash Offer',
    description:
      'Sell your Kitchener, Waterloo or Cambridge house as-is for cash. No repairs, showings or agent fees. Rentals, estates and older homes. You choose the closing date.',
    intro:
      'Kitchener-Waterloo has grown quickly, but a lot of the region’s houses are still older homes that need updating, or rentals near the universities. If you want to sell without renovating, cleaning out or dealing with showings, we can make you a cash offer on the house as it stands.',
    neighbourhoods: [
      'Downtown Kitchener', 'Victoria Park', 'Mount Hope–Breithaupt Park', 'Vanier', 'Forest Heights', 'Stanley Park',
      'Uptown Waterloo', 'Northdale', 'Lakeshore', 'Cambridge (Galt, Preston, Hespeler)', 'Elmira', 'New Hamburg',
    ],
    housing: [
      'Central Kitchener neighbourhoods like Victoria Park and Mount Hope–Breithaupt Park have older brick homes, many over a hundred years old, with the usual list of aging wiring, plumbing and foundations. Areas like Stanley Park, Forest Heights and Vanier are mostly 1960s and 1970s houses that are often due for roofs, windows and mechanical updates.',
      'Waterloo’s Northdale neighbourhood, next to the University of Waterloo and Laurier, is full of houses that were converted into student rentals. Many have been through years of heavy use. Cambridge’s older cores in Galt, Preston and Hespeler have century homes, some close to the Grand and Speed rivers.',
    ],
    local: [
      'For tenant-occupied houses, Ontario’s Landlord and Tenant Board rules apply. A sale on its own doesn’t end a tenancy, and ending one for a buyer’s own use requires proper notice and compensation. We can buy with the tenants staying put.',
      'If you’re moving for work, downsizing or settling an estate, you can pick a closing date that fits instead of waiting on a listing.',
    ],
    situations: ['ontario-tenants', 'repairs', 'downsizing', 'ontario-inherited'],
  },
  {
    slug: 'windsor',
    name: 'Windsor',
    province: 'ontario',
    title: 'Sell Your House Fast in Windsor, ON | Cash Offer, As-Is',
    description:
      'Sell your Windsor house as-is for a fair cash offer. No repairs, showings or commissions. Flood damage, older homes, rentals and estates. You pick the closing date.',
    intro:
      'Windsor has some of the most affordable older housing in Ontario, and a lot of it needs work. Basement flooding, aging brick homes and long-held rentals are common reasons people here decide to sell as-is instead of fixing up and listing.',
    neighbourhoods: [
      'Walkerville', 'Olde Sandwich Towne', 'Riverside', 'East Windsor', 'Forest Glade', 'South Windsor',
      'Fontainebleau', 'Downtown Windsor', 'Tecumseh', 'LaSalle', 'Amherstburg', 'Kingsville and Leamington',
    ],
    housing: [
      'Walkerville, Olde Sandwich Towne and the neighbourhoods around downtown have many homes built in the early 1900s, through the auto industry boom. Many are solid brick but still have original wiring, plumbing and foundations. East Windsor and Forest Glade have more post-war and 1970s housing.',
      'Heavy rainstorms in 2016 and 2017 flooded thousands of basements in Windsor and Tecumseh. Some homes still carry the effects: old water damage, mould or repairs that were never quite finished. We buy homes with water damage and can factor it into the offer instead of asking you to fix it.',
    ],
    local: [
      'Many Windsor houses have been rentals for years. Ontario’s Landlord and Tenant Board rules apply, and we can buy with tenants in place.',
      'If you’ve inherited a house in Windsor-Essex, perhaps from a parent who owned it for decades, we can buy it as-is, belongings and all, once the estate has its certificate from the Superior Court of Justice.',
    ],
    situations: ['repairs', 'ontario-inherited', 'ontario-tenants', 'behind-on-mortgage'],
  },
  {
    slug: 'sudbury',
    name: 'Sudbury',
    province: 'ontario',
    title: 'Sell Your House Fast in Sudbury | Cash Offer, Any Condition',
    description:
      'Sell your Greater Sudbury house as-is for cash. No repairs, showings or agent fees. Older homes, estates, rentals and moves. Fair offer, and you choose the closing date.',
    intro:
      'Greater Sudbury is a big area with a lot of older housing, much of it built for mining families decades ago. If your house needs updates, is part of an estate or you need to move for work, we can make you a cash offer and close on your schedule.',
    neighbourhoods: [
      'Donovan', 'Flour Mill', 'Gatchell', 'West End', 'Minnow Lake', 'New Sudbury',
      'South End', 'Copper Cliff', 'Garson', 'Val Caron', 'Chelmsford', 'Lively',
    ],
    housing: [
      'Older neighbourhoods like the Donovan, the Flour Mill, Gatchell and Copper Cliff have modest homes built from the early 1900s through the post-war years, many originally tied to the mines and smelters. They often need foundation, roofing and heating work. Northern winters are hard on houses, and older furnaces, oil tanks and drafty windows come up often.',
      'Many homes are built on rock, which can make foundation and drainage repairs more involved. We look at all of it and give you a number for the house as-is.',
    ],
    local: [
      'Mining and health care bring people in and out of Sudbury, so job moves are a common reason to sell on a set date. You choose the closing date with us.',
      'For estates, the executor usually needs a certificate from the Superior Court of Justice before a sale can close. For rentals, the Landlord and Tenant Board rules apply, and we can buy with tenants in place.',
    ],
    situations: ['relocating', 'ontario-inherited', 'repairs', 'ontario-tenants'],
  },
  {
    slug: 'calgary',
    name: 'Calgary',
    province: 'alberta',
    title: 'Sell Your House Fast in Calgary | Cash Offer, Any Condition',
    description:
      'Sell your Calgary house as-is for a fair cash offer. No repairs, showings or agent fees. Hail damage, older bungalows, rentals and estates. You pick the closing date.',
    intro:
      'Calgary’s market moves quickly for move-in-ready homes. Houses with hail damage, dated 1960s interiors, tenants or a complicated situation can still sit. We buy Calgary houses as they are, so you can skip the repairs and showings.',
    neighbourhoods: [
      'Forest Lawn', 'Marlborough', 'Rundle', 'Bowness', 'Montgomery', 'Ogden', 'Inglewood and Ramsay',
      'Bridgeland', 'Huntington Hills', 'Shawnessy', 'Airdrie', 'Chestermere',
    ],
    housing: [
      'Inner-city communities like Bowness, Montgomery and Ogden, and established areas like Forest Lawn, Marlborough and Huntington Hills, are full of 1950s to 1970s bungalows. Many still have original windows, furnaces and electrical panels. Some older homes sit on lots that builders want for infill, while others just need more updating than most buyers want to take on.',
      'Northeast Calgary was hit by a major hailstorm in June 2020, and hail damage to roofs, siding and windows is common across the city. Parts of Bowness, Inglewood and other river communities were flooded in 2013. We buy homes with storm or water damage, whether or not an insurance claim was made.',
    ],
    local: [
      'Alberta has no land transfer tax, so a traditional sale mostly costs agent commission, repairs and carrying costs. Most Alberta sale contracts also ask the seller to provide a Real Property Report with municipal compliance. If yours is missing or out of date, we can usually work with that instead of making it your problem.',
      'If the house is rented, Alberta’s Residential Tenancies Act decides how a tenancy can end, and a sale on its own doesn’t end it. We can buy with tenants in place.',
    ],
    situations: ['repairs', 'alberta-tenants', 'alberta-inherited', 'alberta-foreclosure'],
  },
  {
    slug: 'edmonton',
    name: 'Edmonton',
    province: 'alberta',
    title: 'Sell Your House Fast in Edmonton | Cash Offer, As-Is',
    description:
      'Sell your Edmonton house as-is for cash. No repairs, cleanup or showings. Older bungalows, rentals, estates and foreclosure situations. You choose the closing date.',
    intro:
      'Edmonton has a lot of older, affordable housing, from Alberta Avenue’s early-1900s homes to Mill Woods’ 1970s splits. If yours needs work, is rented out or is part of an estate, we can make you a cash offer on it as it is and close when it suits you.',
    neighbourhoods: [
      'Alberta Avenue', 'Beverly', 'Highlands', 'Bonnie Doon', 'Strathcona', 'Westmount',
      'Mill Woods', 'Castle Downs', 'Clareview', 'Jasper Place', 'St. Albert', 'Sherwood Park',
    ],
    housing: [
      'Older neighbourhoods like Alberta Avenue, Beverly, Highlands and Westmount have homes from the early 1900s through the 1950s. Many have aging wiring, old foundations or past renovations of uncertain quality. Mill Woods, Castle Downs and Clareview are mostly 1970s and 1980s homes that are now due for roofs, windows and mechanical work.',
      'Some older Alberta homes have vermiculite insulation or other materials that put buyers off, and cold winters are hard on old furnaces, plumbing and foundations. We buy houses with these issues and factor them into the offer.',
    ],
    local: [
      'Alberta foreclosures go through the Court of King’s Bench. If you’re behind on your mortgage, selling before the process runs its course can help you keep more of your equity. We can move quickly when timing matters.',
      'Alberta’s Residential Tenancies Act governs tenant-occupied homes, and a sale alone doesn’t end a tenancy. We can buy with tenants in place, or work around the notice periods.',
    ],
    situations: ['alberta-foreclosure', 'alberta-tenants', 'alberta-inherited', 'repairs'],
  },
  {
    slug: 'red-deer',
    name: 'Red Deer',
    province: 'alberta',
    title: 'Sell Your House Fast in Red Deer | Cash Offer, As-Is',
    description:
      'Sell your Red Deer house as-is for a fair cash offer. No repairs, showings or commissions. Older homes, rentals, estates and job moves. You pick the closing date.',
    intro:
      'Red Deer sits between Calgary and Edmonton, and its housing market follows the oil and gas economy more closely than most. If you need to sell an older house, a rental or an inherited home without repairs or showings, we can make you a cash offer.',
    neighbourhoods: [
      'Riverside Meadows', 'Waskasoo', 'Woodlea', 'Highland Green', 'Normandeau', 'Eastview',
      'Morrisroe', 'Westpark', 'Glendale', 'Johnstone Park', 'Sylvan Lake', 'Blackfalds',
    ],
    housing: [
      'Red Deer’s older central areas, including Riverside Meadows, Waskasoo and Woodlea, have post-war homes on mature lots, many with original systems. Neighbourhoods like Highland Green, Normandeau and Eastview have lots of 1960s to 1980s bungalows and bi-levels that are due for updating.',
      'Hail is common across central Alberta, and roofs, siding and windows take a beating. We buy homes with hail or water damage as they are.',
    ],
    local: [
      'Energy-sector jobs mean moves in and out of Red Deer are common. You pick the closing date, so the sale can match your move.',
      'Alberta has no land transfer tax, and rental homes are governed by the Residential Tenancies Act. We can buy with tenants in place.',
    ],
    situations: ['relocating', 'alberta-tenants', 'repairs', 'alberta-inherited'],
  },
  {
    slug: 'lethbridge',
    name: 'Lethbridge',
    province: 'alberta',
    title: 'Sell Your House Fast in Lethbridge | Cash Offer, As-Is',
    description:
      'Sell your Lethbridge house as-is for cash. No repairs, cleanup or showings. Older homes, student rentals and estates. Fair cash offer, and you choose the closing date.',
    intro:
      'Lethbridge has a mix of early-1900s homes near downtown, post-war bungalows and rentals near the university and college. If yours needs work or comes with a complicated situation, we can make you an offer on it as it is.',
    neighbourhoods: [
      'London Road', 'Westminster', 'Staffordville', 'Senator Buchanan', 'Victoria Park', 'Agnes Davidson',
      'Lakeview', 'Glendale', 'North Lethbridge', 'West Lethbridge', 'Coaldale', 'Picture Butte',
    ],
    housing: [
      'London Road and Westminster have some of the oldest homes in Lethbridge, many from the early 1900s, with the aging foundations, wiring and plumbing that come with them. North Lethbridge and neighbourhoods like Agnes Davidson and Lakeview have many post-war and 1960s bungalows.',
      'West Lethbridge has a lot of rentals near the University of Lethbridge, and student houses often need work after years of turnover. Wind and hail are hard on roofs and siding in southern Alberta.',
    ],
    local: [
      'For student and other rentals, Alberta’s Residential Tenancies Act decides how a tenancy can end. We can buy with tenants in place.',
      'If you’ve inherited a house in Lethbridge, the personal representative usually needs a grant from the Court of King’s Bench before the house can be transferred. We can wait for it and close when the estate is ready.',
    ],
    situations: ['alberta-tenants', 'alberta-inherited', 'repairs', 'downsizing'],
  },
];

export const citiesIn = (province: 'ontario' | 'alberta') => cities.filter((c) => c.province === province);
