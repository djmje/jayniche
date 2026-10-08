// Every business detail lives here. Change it once and every page updates.
// Anything left as an empty string is hidden on the site until you fill it in.

export const site = {
  name: 'Jay Home Buyers',
  url: 'https://jayniche.ca',

  // Phone in two formats: what people see, and what their phone dials.
  phoneDisplay: '', // e.g. '(905) 555-0123'
  phoneE164: '', // e.g. '+19055550123'
  email: '',

  instagram: 'https://www.instagram.com/jayhomebuyers/',

  provinces: ['Ontario', 'Alberta'],

  // Only cities you've confirmed. Each one gets its own page later.
  cities: {
    ontario: [] as string[],
    alberta: [] as string[],
  },

  // Web3Forms access key: leads are emailed to you, same as the old site.
  // Find it at https://app.web3forms.com (it's meant to be public, like the old page had it).
  // While empty, the form shows the thank-you message but sends nothing,
  // which is fine for preview builds and never for the live site.
  web3formsKey: '',

  // Tracking IDs. Leave empty until you have them; nothing loads while empty.
  ga4Id: '', // e.g. 'G-XXXXXXXXXX'
  metaPixelId: '', // e.g. '123456789012345'
  googleSiteVerification: '', // the content="..." value from Search Console
};

export const hasPhone = site.phoneDisplay !== '' && site.phoneE164 !== '';
