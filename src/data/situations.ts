// Situation pages. Province-specific ones live under /ontario/ or /alberta/ because the law differs.
// Facts here come from the official sources listed in SOURCES.md. If you're not sure a fact is
// current, leave it out rather than guess.

export interface Section {
  h2: string;
  paragraphs?: string[];
  list?: string[];
}

export interface Situation {
  key: string;
  path: string;
  label: string; // short name used in links
  province?: 'ontario' | 'alberta';
  title: string; // <title>, under 60 characters
  description: string;
  h1: string;
  intro: string;
  sections: Section[];
  faqs: { q: string; a: string }[];
  related: string[]; // other situation keys
}

export const situations: Situation[] = [
  {
    key: 'ontario-inherited',
    path: '/ontario/inherited-house/',
    label: 'Inherited house (Ontario)',
    province: 'ontario',
    title: 'Sell an Inherited House in Ontario | Estate Cash Offer',
    description:
      'Inherited a house in Ontario? Sell it as-is, belongings and all. How probate and the estate certificate work, and how a cash sale can make settling the estate simpler.',
    h1: 'Selling an inherited house in Ontario',
    intro:
      'Inheriting a house often comes at a hard time, along with a long list of decisions. You may be dealing with a home full of belongings, repairs nobody has got to, siblings who want different things, and a court process you’ve never been through. We buy inherited houses in Ontario as-is, and we work around the estate’s timeline.',
    sections: [
      {
        h2: 'Do you need probate to sell?',
        paragraphs: [
          'In most cases, yes. When the house was in the deceased person’s name alone, Ontario says the executor (called the estate trustee) should get a court certificate before anyone signs an agreement of purchase and sale. That certificate comes from the Superior Court of Justice.',
          'There are two kinds. Estates worth up to $150,000 can apply for a Small Estate Certificate. Larger estates apply for a Certificate of Appointment of Estate Trustee. Ontario says applications are typically processed within about 15 business days once they’re complete, but gathering documents and valuing the estate usually takes longer than the court part.',
          'If the house was owned jointly, for example by spouses as joint tenants, it may pass directly to the surviving owner without probate. A lawyer can tell you which applies.',
        ],
      },
      {
        h2: 'What the estate pays',
        paragraphs: [
          'Ontario charges an Estate Administration Tax when the certificate is issued. For applications made since January 1, 2020, there is no tax on the first $50,000 of the estate’s value. Above that, it’s $15 for every $1,000 (or part of $1,000). The house is valued as of the date of death, less any mortgage registered on it.',
          'Within 180 days of receiving the certificate, the estate trustee also has to file an Estate Information Return with the Ministry of Finance, even if no tax is owed.',
        ],
      },
      {
        h2: 'How selling to us works for an estate',
        list: [
          'You can talk to us before the certificate is issued. We’ll make an offer and set the closing date for after the estate is ready.',
          'Leave the furniture, clothes and everything else you don’t want. We deal with the clean-out.',
          'No repairs, no staging and no showings while the family is grieving.',
          'We cover your lawyer fees on homes we buy, and there’s no agent commission.',
          'If some heirs want to keep the house and others want to sell, it helps to get everyone on the same page before accepting any offer. We’re happy to explain our offer to everyone involved.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Can I sell the house before probate is finished?',
        a: 'You can talk to us and agree on a price, but Ontario says the estate certificate should be obtained before signing an agreement of purchase and sale. We’ll wait for it and close when the estate is ready.',
      },
      {
        q: 'Do we have to clear out the house first?',
        a: 'No. Take what matters to you and leave the rest. We handle the clean-out after closing.',
      },
      {
        q: 'Who signs the sale documents?',
        a: 'Usually the estate trustee named in the certificate. Your estate lawyer will confirm who needs to sign.',
      },
    ],
    related: ['repairs', 'ontario-tenants', 'downsizing'],
  },
  {
    key: 'alberta-inherited',
    path: '/alberta/inherited-house/',
    label: 'Inherited house (Alberta)',
    province: 'alberta',
    title: 'Sell an Inherited House in Alberta | Estate Cash Offer',
    description:
      'Inherited a house in Alberta? Sell it as-is, belongings and all. How grants of probate work at the Court of King’s Bench, and how a cash sale can simplify the estate.',
    h1: 'Selling an inherited house in Alberta',
    intro:
      'Settling an estate in Alberta usually means dealing with the house: what it’s worth, what to do with everything in it, and who has the authority to sell. We buy inherited houses across Alberta as-is, and we fit our closing date around the estate.',
    sections: [
      {
        h2: 'Do you need a grant to sell?',
        paragraphs: [
          'Usually, yes. In Alberta, the person handling the estate is called the personal representative. When a house was in the deceased person’s name alone, the personal representative normally needs a grant of probate (if there was a will) or a grant of administration (if there wasn’t) from the Court of King’s Bench before the house can be transferred to a buyer.',
          'The court charges a filing fee based on the net value of the estate’s property in Alberta. Alberta doesn’t have an estate tax like Ontario’s Estate Administration Tax.',
          'If the house was owned jointly with a right of survivorship, it may pass to the surviving owner without a grant. Your lawyer can confirm which applies.',
        ],
      },
      {
        h2: 'How selling to us works for an estate',
        list: [
          'Talk to us any time. We can agree on terms and set the closing for after the grant is issued.',
          'Leave the belongings you don’t want. We handle the clean-out.',
          'No repairs, showings or staging.',
          'If the Real Property Report is missing or out of date, we can usually work around it.',
          'No commission, and we cover your lawyer fees on homes we buy.',
        ],
      },
    ],
    faqs: [
      {
        q: 'How long does a grant of probate take in Alberta?',
        a: 'It depends on the court’s workload and how complete the application is. Your lawyer can give you a current estimate. We’ll set the closing date to match.',
      },
      {
        q: 'The house has been empty for months. Is that a problem?',
        a: 'No. Vacant homes are common in estates. Just let us know about anything like frozen pipes or damage so we can account for it.',
      },
    ],
    related: ['repairs', 'alberta-tenants', 'downsizing'],
  },
  {
    key: 'ontario-power-of-sale',
    path: '/ontario/power-of-sale/',
    label: 'Power of sale (Ontario)',
    province: 'ontario',
    title: 'Facing Power of Sale in Ontario? Sell Before the Lender',
    description:
      'Behind on your mortgage in Ontario and facing power of sale? How the notice periods work, and how selling the house yourself can protect your equity.',
    h1: 'Facing power of sale in Ontario',
    intro:
      'If you’ve received a Notice of Sale under Mortgage, you still have options, but the clock is running. In many cases you can still sell the house yourself before the lender does, which usually means more control over the price and the timing.',
    sections: [
      {
        h2: 'How power of sale works in Ontario',
        paragraphs: [
          'Most Ontario mortgages give the lender a power of sale. Under the Mortgages Act, the lender can’t send the Notice of Sale until the payment has been in default for at least 15 days, and can’t sell until at least 35 days after the notice is given. If the mortgage doesn’t include a power of sale, the statutory version requires three months of default and 45 days’ notice.',
          'Once the lender sells, it pays itself what’s owed plus its legal and sale costs, and any money left over goes to you. If the sale doesn’t cover what you owe, you may still be on the hook for the difference.',
        ],
      },
      {
        h2: 'Why selling before the lender does can help',
        list: [
          'You choose the buyer and the closing date, instead of the lender choosing for you.',
          'You may avoid some of the legal and sale costs that get added to your balance.',
          'You can close on a date that pays out the mortgage before more fees pile up.',
        ],
        paragraphs: [
          'Talk to your lender and a lawyer as early as you can. Sometimes catching up the payments, refinancing or a short extension is the better answer. If selling is the right move, we can make an offer quickly and close on a date that works with your lender’s deadlines.',
        ],
      },
    ],
    faqs: [
      {
        q: 'I got a Notice of Sale. Can I still sell my house?',
        a: 'In many cases, yes, as long as the lender hasn’t sold it yet. Speak to a lawyer right away, then reach out. We can usually make an offer quickly.',
      },
      {
        q: 'Will selling to you stop the power of sale?',
        a: 'If the sale closes and pays off what you owe the lender, including their costs, the mortgage is discharged. Your lawyer will coordinate the payout with the lender.',
      },
    ],
    related: ['behind-on-mortgage', 'repairs', 'divorce'],
  },
  {
    key: 'alberta-foreclosure',
    path: '/alberta/foreclosure/',
    label: 'Foreclosure (Alberta)',
    province: 'alberta',
    title: 'Facing Foreclosure in Alberta? Sell Your House First',
    description:
      'Behind on your mortgage in Alberta? How foreclosure works through the Court of King’s Bench, the redemption period, and how selling first can protect your equity.',
    h1: 'Facing foreclosure in Alberta',
    intro:
      'Foreclosure in Alberta is a court process, and it usually takes months rather than weeks. That gives you time to make a plan. For many people, selling the house before the court orders a sale is the best way to keep the most equity.',
    sections: [
      {
        h2: 'How foreclosure works in Alberta',
        paragraphs: [
          'The lender usually starts with a demand letter, then files a Statement of Claim with the Court of King’s Bench. You have 20 days to file a Statement of Defence. The court can then make a redemption order, which gives you a set period to pay what’s owed before the property can be listed for sale by the court.',
          'Under Alberta’s Law of Property Act, the standard redemption period is six months for most homes and one year for farm land, and the court can shorten or lengthen it. From start to finish, the process can take anywhere from under three months to more than a year.',
          'Whether the lender can come after you for any shortfall after the sale depends on the type of mortgage and how the case unfolds. Ask a lawyer about your situation.',
        ],
      },
      {
        h2: 'Why selling during the redemption period can help',
        list: [
          'You control the price and the closing date, instead of a court-ordered sale.',
          'Legal costs keep growing as the case goes on. Selling sooner can limit them.',
          'You can plan your move instead of facing an order to leave.',
        ],
        paragraphs: [
          'Talk to your lender and a lawyer early. If selling makes sense, we can make an offer quickly and close on a date that works within the court timeline.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Can I sell my house during an Alberta foreclosure?',
        a: 'Often, yes, especially during the redemption period. Your lawyer will work with the lender’s lawyer so the sale pays out the mortgage.',
      },
      {
        q: 'I have tenants. Does foreclosure affect them?',
        a: 'Tenants can be affected by a foreclosure order. If you sell to us first, we can buy with tenants in place.',
      },
    ],
    related: ['behind-on-mortgage', 'alberta-tenants', 'repairs'],
  },
  {
    key: 'ontario-tenants',
    path: '/ontario/sell-house-with-tenants/',
    label: 'Selling with tenants (Ontario)',
    province: 'ontario',
    title: 'Sell a Rental House With Tenants in Ontario | Cash Offer',
    description:
      'Sell your Ontario rental property with tenants in place. How Landlord and Tenant Board rules work when you sell, and why a buyer who keeps the tenants can make it easier.',
    h1: 'Selling a house with tenants in Ontario',
    intro:
      'Selling a tenant-occupied house in Ontario can be slow and stressful: showings need notice, tenants may not cooperate, and ending a tenancy has strict rules. We buy rental houses with the tenants in place, so you don’t have to end anyone’s tenancy to sell.',
    sections: [
      {
        h2: 'A sale doesn’t end a tenancy',
        paragraphs: [
          'In Ontario, the lease stays in place when a house is sold. The buyer becomes the new landlord. A tenancy can only end for one of the reasons in the Residential Tenancies Act, using the Landlord and Tenant Board’s forms.',
          'If the buyer (or certain family members) wants to move in, and the property has three or fewer residential units, the seller can give the tenant an N12 notice. It must give at least 60 days’ notice and end on the last day of a rental period. The landlord who serves an N12 for a purchaser must pay the tenant one month’s rent in compensation, or offer another unit the tenant accepts. Changes in effect from September 21, 2026 removed the compensation for some landlord’s own-use notices, but not for purchaser’s own-use notices.',
          'If the tenant doesn’t leave, the landlord has to apply to the Landlord and Tenant Board, which can take months.',
        ],
      },
      {
        h2: 'How selling to us is different',
        list: [
          'We can buy with tenants in place, so no N12, no compensation and no Board application are needed for the sale.',
          'Fewer or no showings. We may need to see the property once, with proper notice to the tenants.',
          'We take on the existing lease, including tenants who pay below-market rent.',
          'Rent arrears, damage or a tenancy already at the Board? Tell us, and we’ll factor it in.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Do my tenants have to move out before I sell to you?',
        a: 'No. We buy with tenants in place and take over the lease.',
      },
      {
        q: 'My tenant isn’t paying rent. Can I still sell?',
        a: 'Yes. Let us know the details, including any Landlord and Tenant Board filings, and we’ll account for it in the offer.',
      },
    ],
    related: ['repairs', 'ontario-inherited', 'behind-on-mortgage'],
  },
  {
    key: 'alberta-tenants',
    path: '/alberta/sell-house-with-tenants/',
    label: 'Selling with tenants (Alberta)',
    province: 'alberta',
    title: 'Sell a Rental House With Tenants in Alberta | Cash Offer',
    description:
      'Sell your Alberta rental property with tenants in place. How the Residential Tenancies Act handles a sale, the notice periods, and why keeping the tenants can be easier.',
    h1: 'Selling a house with tenants in Alberta',
    intro:
      'In Alberta, selling a rental house doesn’t automatically end the tenancy, and the rules for ending one are specific. We buy rental houses with tenants in place, so you can sell without serving notices or waiting out a lease.',
    sections: [
      {
        h2: 'What Alberta’s Residential Tenancies Act says about a sale',
        paragraphs: [
          'A sale on its own doesn’t end a tenancy. A fixed-term lease generally runs until its end date, and the tenant can stay until then unless both sides agree otherwise.',
          'For a monthly periodic tenancy, a landlord can end it because of a sale in certain cases, once the sale is firm (all conditions met or waived) and the buyer asks in writing. One case is when the buyer or a relative will move in. Another covers detached houses, semi-detached houses and single condo units, where the buyer doesn’t have to move in. In both cases the landlord must give three months’ written notice, with the reason stated.',
          'Disputes can go to the Residential Tenancy Dispute Resolution Service (RTDRS) or the courts.',
        ],
      },
      {
        h2: 'How selling to us is different',
        list: [
          'We can buy with tenants in place and take over the lease.',
          'No need to time the sale around notice periods or lease end dates.',
          'Fewer or no showings. We may need one viewing with proper notice to the tenants.',
          'Rent arrears or damage? Tell us, and we’ll factor it into the offer.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Can I sell my Alberta rental while it has a fixed-term lease?',
        a: 'Yes. The lease carries on with the new owner. We regularly buy with leases in place.',
      },
      {
        q: 'How much notice do tenants get if the buyer wants vacant possession?',
        a: 'For a monthly periodic tenancy ended because of a qualifying sale, three months’ written notice. Check the current Residential Tenancies Act rules before serving any notice.',
      },
    ],
    related: ['repairs', 'alberta-inherited', 'behind-on-mortgage'],
  },
  {
    key: 'repairs',
    path: '/situations/house-needs-repairs/',
    label: 'House needs repairs or has damage',
    title: 'Sell a House That Needs Repairs | Fire & Water Damage',
    description:
      'Sell a house that needs major repairs, or has fire, water, mould or foundation damage, as-is in Ontario or Alberta. No repairs, no cleanup, fair cash offer.',
    h1: 'Selling a house that needs major repairs',
    intro:
      'Some houses need more work than it makes sense to do before selling. The roof, the foundation, the furnace, a basement that floods, or damage from a fire. We buy houses in Ontario and Alberta in any condition, so you don’t have to fix anything first.',
    sections: [
      {
        h2: 'What we buy',
        list: [
          'Fire and smoke damage, including houses that are boarded up',
          'Flooded basements, water damage and mould',
          'Foundation cracks, sagging floors and structural issues',
          'Old roofs, windows, furnaces, wiring and plumbing',
          'Hoarding situations and houses full of belongings',
          'Unfinished renovations and unpermitted work',
        ],
      },
      {
        h2: 'Why repairs before selling often don’t pay off',
        paragraphs: [
          'Big repairs take money up front, contractors, permits and time, and you often don’t get it all back in the sale price. Listing a house as-is with a realtor can work, but many buyers need a mortgage, and lenders and insurers can be wary of homes with serious issues. That can mean conditional offers that fall apart after the inspection.',
          'We buy without financing conditions and price the repairs into our offer. We’ll walk you through how we got to the number, so you can compare it with fixing up and listing.',
        ],
      },
      {
        h2: 'Insurance claims',
        paragraphs: [
          'If there’s an open insurance claim for fire or water damage, tell us. Depending on the claim, you may be able to sell and still settle it. Check with your insurer first.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Do I need to get quotes or an inspection first?',
        a: 'No. We do our own assessment. If you already have quotes or an inspection report, feel free to share them.',
      },
      {
        q: 'The house isn’t safe to live in. Will you still look at it?',
        a: 'Yes. Uninhabitable houses are part of what we buy.',
      },
    ],
    related: ['ontario-inherited', 'alberta-inherited', 'downsizing'],
  },
  {
    key: 'divorce',
    path: '/situations/divorce/',
    label: 'Divorce or separation',
    title: 'Selling a House During Divorce or Separation | Cash Offer',
    description:
      'Separating and need to sell the house in Ontario or Alberta? A private, quick sale with no showings and a closing date that fits both of you. No repairs or commissions.',
    h1: 'Selling the house during a divorce or separation',
    intro:
      'When a relationship ends, the house is often the biggest thing left to sort out. A traditional sale means agreeing on repairs, an agent, a list price and months of showings, all while things are already tense. A cash sale can be simpler and more private.',
    sections: [
      {
        h2: 'How a direct sale can help',
        list: [
          'One offer, one price, and a clear number for both of you to divide.',
          'No showings or open houses while one of you still lives there.',
          'A closing date you can both agree on, set around your separation agreement or court timeline.',
          'No repairs to argue about or pay for.',
        ],
      },
      {
        h2: 'Things to sort out first',
        paragraphs: [
          'If you both own the house, you both need to agree to sell and sign. In both Ontario and Alberta, the family home can carry special rights for a spouse, even one who isn’t on title. Talk to a family lawyer before accepting any offer.',
          'We’re glad to talk to you together or separately, and we send the same written offer to both of you.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Can one spouse sell the house without the other?',
        a: 'Usually not. Both owners need to sign, and the family home has extra protections for spouses. Speak to a family lawyer.',
      },
      {
        q: 'Can we close after our separation agreement is signed?',
        a: 'Yes. You pick the closing date.',
      },
    ],
    related: ['behind-on-mortgage', 'downsizing', 'repairs'],
  },
  {
    key: 'downsizing',
    path: '/situations/downsizing/',
    label: 'Downsizing',
    title: 'Downsizing? Sell Your House As-Is | Ontario & Alberta',
    description:
      'Moving to a smaller home, a condo or retirement living? Sell your house as-is with no repairs, no clean-out and a closing date that matches your move.',
    h1: 'Selling your house to downsize',
    intro:
      'After decades in a house, getting it ready to sell can feel bigger than the move itself: repairs, clearing out the basement, staging and keeping it spotless for showings. We buy houses as-is, so you can take what you want and leave the rest.',
    sections: [
      {
        h2: 'Why downsizers sell to us',
        list: [
          'Pick a closing date that lines up with your new place or retirement residence.',
          'Leave behind anything you don’t want to take. We handle the clean-out.',
          'No showings, open houses or strangers walking through.',
          'No repairs or updates, even if the house hasn’t been touched in years.',
          'No commission, and we cover your lawyer fees on homes we buy.',
        ],
      },
      {
        h2: 'Is a cash sale right for you?',
        paragraphs: [
          'If your house is in great shape and you have time, listing with a realtor may get you a higher price. If the house needs work, or the time and hassle of a listing matters to you, a direct sale can make more sense. We’ll tell you honestly which way we think you’d come out ahead.',
          'Many people involve a son, daughter or trusted friend in the decision. You’re welcome to have them on the call.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Can I stay in the house until my new place is ready?',
        a: 'Yes. You choose the closing date, so you can plan the move around it.',
      },
      {
        q: 'Can my family be involved?',
        a: 'Of course. We’re happy to explain our offer to anyone you want involved.',
      },
    ],
    related: ['relocating', 'repairs', 'ontario-inherited'],
  },
  {
    key: 'relocating',
    path: '/situations/relocating/',
    label: 'Relocating for work or family',
    title: 'Relocating? Sell Your House Fast | Ontario & Alberta',
    description:
      'Moving for a new job, a posting or family? Sell your house as-is in Ontario or Alberta on your timeline, with no showings or repairs, and a closing date that fits.',
    h1: 'Selling your house when you’re relocating',
    intro:
      'A new job, a military posting or a family move doesn’t wait for the housing market. If you need to be somewhere else by a certain date, carrying two homes or managing showings from far away gets expensive and stressful quickly.',
    sections: [
      {
        h2: 'How a direct sale helps when you’re moving',
        list: [
          'A firm closing date you choose, matched to your move.',
          'No showings to manage after you’ve left.',
          'No repairs or cleaning to arrange from another city.',
          'Your lawyer can handle the closing remotely in most cases.',
        ],
      },
      {
        h2: 'Comparing your options',
        paragraphs: [
          'If your employer offers a relocation package with a guaranteed sale, compare that too. If the house needs work, or you need certainty on the date, a direct cash sale can be the simplest route. We’ll give you a written offer you can compare.',
        ],
      },
    ],
    faqs: [
      {
        q: 'I’ve already moved. Can I still sell to you?',
        a: 'Yes. Vacant houses are fine. We can arrange access with you or someone you trust.',
      },
    ],
    related: ['downsizing', 'repairs', 'divorce'],
  },
  {
    key: 'behind-on-mortgage',
    path: '/situations/behind-on-mortgage/',
    label: 'Behind on mortgage payments',
    title: 'Behind on Mortgage Payments? Your Options to Sell',
    description:
      'Behind on mortgage payments in Ontario or Alberta? Your options, from talking to your lender to selling before power of sale or foreclosure, explained plainly.',
    h1: 'Behind on your mortgage payments',
    intro:
      'Falling behind on a mortgage is stressful, and it’s more common than people think. The earlier you act, the more options you have. Selling isn’t always the answer, but when it is, selling on your own terms usually beats waiting for the lender to act.',
    sections: [
      {
        h2: 'Start with your lender',
        paragraphs: [
          'Call your lender before things escalate. Many lenders would rather work out a plan, such as deferring or adding missed payments to the balance, or extending the amortization, than go to enforcement. A non-profit credit counsellor can also help you look at the whole picture.',
        ],
      },
      {
        h2: 'What happens if it goes further',
        paragraphs: [
          'In Ontario, lenders usually use power of sale: after 15 days of default they can send a Notice of Sale, and they can sell 35 days after that.',
          'In Alberta, lenders go through a court foreclosure at the Court of King’s Bench, usually with a redemption period of six months for most homes.',
        ],
      },
      {
        h2: 'When selling makes sense',
        paragraphs: [
          'If you can’t catch up and there’s equity in the house, selling before the lender does lets you choose the price and the date, and keep what’s left after the mortgage is paid. We can make an offer quickly and close on a date that works with your lender’s deadlines. Talk to a lawyer about your specific situation.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Will I get anything if I sell?',
        a: 'If the sale price is more than what you owe (including the lender’s costs), the difference is yours. We’ll show you the numbers.',
      },
    ],
    related: ['ontario-power-of-sale', 'alberta-foreclosure', 'divorce'],
  },
];

export const situationByKey = (key: string) => {
  const s = situations.find((x) => x.key === key);
  if (!s) throw new Error(`Unknown situation: ${key}`);
  return s;
};

// Situations to show on a province hub: that province's specific ones plus the general ones.
export const situationsFor = (province: 'ontario' | 'alberta') =>
  situations.filter((s) => !s.province || s.province === province);
