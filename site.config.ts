// Everything niche-specific lives here (plus src/theme.css, docs/BRIEF.md and the listing files).
// To start the next domain, change this file; the engine in src/lib and src/pages holds no niche words.
import { US_STATES } from './src/data/us-states';
import type { AttributeDef, BestFor, Faq, ListingData, ListingFilter, Taxonomy } from './src/lib/types';

// ---- Launch values (same as Ben's other directory sites; npm run check warns if any PLACEHOLDER remains) ----
export const PLACEHOLDERS = {
  /** Email or URL for the home-page "domain for sale" banner. */
  forSaleContact: 'https://www.domainmarket.com/',
  /** Inbox that receives "Add your business" emails (must be a verified Email Routing destination). */
  submissionsEmail: 'hello@namefolio.co',
  /** Price shown for Verified, e.g. "$49/year". */
  verifiedPrice: '$149 a year',
  /** Hosted checkout link (Stripe Payment Link) or a mailto: address if you invoice. */
  verifiedPaymentLink: 'mailto:hello@namefolio.co',
};

const styles: Record<string, string> = {
  'fine-line': 'Fine line',
  traditional: 'American traditional',
  'neo-traditional': 'Neo-traditional',
  realism: 'Realism',
  blackwork: 'Blackwork',
  japanese: 'Japanese',
  'black-and-grey': 'Black and grey',
  color: 'Color',
  lettering: 'Lettering and script',
  geometric: 'Geometric',
  watercolor: 'Watercolor',
  portraits: 'Portraits',
};

const services: Record<string, string> = {
  'walk-ins': 'Walk-ins',
  piercing: 'Piercing',
  'cover-ups': 'Cover-ups',
  'custom-designs': 'Custom designs',
  'laser-removal': 'Laser removal',
};

const attributes: AttributeDef[] = [
  { key: 'styles', label: 'Styles', type: 'multi', options: styles },
  { key: 'services', label: 'Services', type: 'multi', options: services },
  { key: 'appointmentOnly', label: 'Appointment only', type: 'bool' },
  { key: 'minimumCharge', label: 'Shop minimum', type: 'number', format: (n) => `$${n}`, max: 10000 },
  { key: 'depositRequired', label: 'Deposit to book', type: 'bool' },
  { key: 'minAge', label: 'Minimum age', type: 'number', format: (n) => `${n}+`, max: 99 },
  { key: 'veganInk', label: 'Vegan ink', type: 'bool' },
  { key: 'wheelchairAccessible', label: 'Wheelchair accessible', type: 'bool' },
  { key: 'cardsAccepted', label: 'Cards accepted', type: 'bool' },
];

// General descriptions of each style for the styles index. About the style, never about any shop.
const styleIntros: Record<string, string> = {
  'fine-line': 'Thin, precise linework, often with a single needle. Delicate florals, script and small detailed pieces.',
  traditional: 'Bold black outlines, a limited palette and classic flash motifs: roses, daggers, eagles, swallows.',
  'neo-traditional': 'Traditional’s bold lines with a wider palette, more depth and more ornate detail.',
  realism: 'Pieces that look like photographs or paintings, built from careful shading and contrast.',
  blackwork: 'Solid black ink used boldly: heavy fills, patterns, ornamental and graphic designs.',
  japanese: 'Irezumi tradition: koi, dragons, waves and flowers, often planned as large flowing pieces.',
  'black-and-grey': 'Black ink diluted to soft greys for smooth shading, portraits and realism.',
  color: 'Full-color work, from saturated traditional palettes to soft blended tones.',
  lettering: 'Script, calligraphy and type: names, dates and words, where the lettering is the design.',
  geometric: 'Lines, shapes and symmetry: mandalas, dotwork patterns and sacred geometry.',
  watercolor: 'Soft washes and bleeds of color that imitate watercolor painting, with or without outlines.',
  portraits: 'Likenesses of people and pets, usually in realism or black and grey.',
};

const has = (l: ListingData, key: string, term: string) =>
  Array.isArray(l.attributes[key]) && (l.attributes[key] as string[]).includes(term);
const opensSunday = (l: ListingData) => !!l.hours?.sun && l.hours.sun !== 'closed';

/** Short practical facts on listing cards. Only from the listing's own data. */
function cardFlags(l: ListingData): string[] {
  const out: string[] = [];
  if (has(l, 'services', 'walk-ins')) out.push('Walk-ins');
  else if (l.attributes.appointmentOnly === true) out.push('Appointment only');
  if (typeof l.attributes.minimumCharge === 'number') out.push(`$${l.attributes.minimumCharge} minimum`);
  if (opensSunday(l)) out.push('Open Sundays');
  if (has(l, 'services', 'piercing')) out.push('Piercing');
  return out.slice(0, 4);
}

const taxonomies: Taxonomy[] = [
  {
    segment: 'styles',
    attribute: 'styles',
    title: (t) => `${t} Tattoo Shops`,
    description: (t, n) => `${n} tattoo shops that list ${t.toLowerCase()} as a style, grouped by state and city.`,
  },
  {
    segment: 'services',
    attribute: 'services',
    title: (t) => `Tattoo Shops Offering ${t}`,
    description: (t, n) => `${n} tattoo shops that list ${t.toLowerCase()}, grouped by state and city.`,
  },
];

const bestFor: BestFor[] = [
  { label: 'Walk-ins welcome', test: (l) => has(l, 'services', 'walk-ins') },
  { label: 'Open Sundays', test: opensSunday },
  { label: 'Fine line', test: (l) => has(l, 'styles', 'fine-line') },
  { label: 'Cover-ups', test: (l) => has(l, 'services', 'cover-ups') },
  { label: 'Piercing too', test: (l) => has(l, 'services', 'piercing') },
  { label: 'Wheelchair accessible', test: (l) => l.attributes.wheelchairAccessible === true },
];

export const site = {
  name: 'TattooStudioGuide',
  domain: 'tattoostudioguide.com',
  url: 'https://tattoostudioguide.com',
  lang: 'en-US',
  countryPhrase: 'in the US',
  ogLocale: 'en_US',
  currency: 'USD',
  tagline: 'Tattoo shops and studios across the US, by city and style.',
  owner: 'TattooStudioGuide',
  /** Sender address for form emails; must be on the domain with Email Routing enabled. */
  formFromEmail: 'submissions@tattoostudioguide.com',

  entity: { one: 'tattoo shop', many: 'tattoo shops', One: 'Tattoo shop', Many: 'Tattoo shops', ManyTitle: 'Tattoo Shops' },
  hub: 'tattoo-shops',
  regionNoun: 'state',
  schemaType: 'TattooParlor',

  // The credential checked before a listing is marked Verified. Same wording on plans, About and llms.txt.
  credential: {
    name: 'tattoo establishment license',
    source: 'the state or local health department that issues it',
    /** Past participle used in the footer line: "Verified listings are paid, {checked}, labeled and shown first." */
    checked: 'license-checked',
  },

  regions: US_STATES as Record<string, { name: string; code?: string }>,
  attributes,
  taxonomies,
  bestFor,

  /** 3–5 short facts for meta descriptions and markdown tables. */
  cardFacts(l: ListingData): string[] {
    const s = (l.attributes.styles as string[] | undefined) ?? [];
    return [...(s.length ? [s.slice(0, 3).map((k) => styles[k]).join(', ')] : []), ...cardFlags(l)].slice(0, 5);
  },

  /** Short practical facts on listing cards, under the style line. */
  cardFlags,

  /** FAQs built only from the listing's own data. */
  listingFaqs(l: ListingData): Faq[] {
    const faqs: Faq[] = [];
    const s = (l.attributes.styles as string[] | undefined) ?? [];
    if (has(l, 'services', 'walk-ins')) faqs.push({ q: `Does ${l.name} take walk-ins?`, a: `Yes. ${l.name} lists walk-ins. Availability depends on the artists on shift, so calling ahead helps.` });
    else if (l.attributes.appointmentOnly === true) faqs.push({ q: `Does ${l.name} take walk-ins?`, a: `No. ${l.name} works by appointment only.` });
    if (s.length) faqs.push({ q: `What styles does ${l.name} tattoo?`, a: `${l.name} lists these styles: ${s.map((k) => styles[k]).join(', ')}.` });
    if (typeof l.attributes.minimumCharge === 'number') faqs.push({ q: `What is the shop minimum at ${l.name}?`, a: `${l.name} publishes a shop minimum of $${l.attributes.minimumCharge}. The final price depends on size, placement and detail.` });
    if (l.hours?.sun) faqs.push({ q: `Is ${l.name} open on Sundays?`, a: opensSunday(l) ? `Yes, ${l.hours.sun.replace(/-/g, ' to ')} on Sundays.` : `No, ${l.name} is closed on Sundays.` });
    if (typeof l.attributes.minAge === 'number') faqs.push({ q: `How old do you have to be to get tattooed at ${l.name}?`, a: `${l.name} lists a minimum age of ${l.attributes.minAge}. Bring a valid photo ID.` });
    return faqs;
  },

  /** City-page FAQs, built from the listed shops only. */
  cityFaqs(place: string, ls: ListingData[]): Faq[] {
    const names = (f: (l: ListingData) => boolean) => ls.filter(f).map((l) => l.name);
    const walk = names((l) => has(l, 'services', 'walk-ins'));
    const sun = names(opensSunday);
    return [
      { q: `How many tattoo shops are in ${place}?`, a: `${ls.length} tattoo ${ls.length === 1 ? 'shop is' : 'shops are'} listed in ${place}.` },
      { q: `Which tattoo shops in ${place} take walk-ins?`, a: walk.length ? `${walk.join(', ')} list walk-ins.` : 'None of the listed shops say they take walk-ins yet.' },
      { q: `Which tattoo shops in ${place} are open on Sundays?`, a: sun.length ? `${sun.join(', ')}.` : 'None of the listed shops publish Sunday hours yet.' },
    ];
  },

  homeFaqs: [
    { q: 'How much does a tattoo cost?', a: 'Each shop sets its own prices. Many publish a shop minimum, and where a shop does, we show it on its listing. We never estimate prices.' },
    { q: 'Do I need ID to get a tattoo?', a: 'Shops set their age policy within state law. Most ask for a valid photo ID and tattoo adults 18 and over. Check the listing or call the shop.' },
    { q: 'Can I just walk in?', a: 'Some shops take walk-ins and others work by appointment only. Every listing says which, when the shop has published it.' },
    { q: 'What does Verified mean?', a: 'Verified listings are paid. We check the shop’s tattoo establishment license and confirm the details with the owner, then label the listing and show it first. It is never a rating.' },
  ] as Faq[],

  // ---- Discovery UI (home, search, filters, cards) ----
  ui: {
    /** Short noun used in navigation, buttons and cards; SEO titles keep `entity`. */
    one: 'studio',
    many: 'studios',
    One: 'Studio',
    Many: 'Studios',
    /** Words for the primary taxonomy in the UI. */
    term: 'style',
    terms: 'styles',
    Terms: 'Styles',
    termsH1: 'Tattoo styles',
    termsLead: 'Start with the look you want. Each style lists the studios that say they tattoo it.',
    heroTitle: ['Find your next', 'tattoo studio'],
    heroLead: 'Discover tattoo studios by city, location and style.',
    searchPlaceholder: 'City, style or studio name',
    /** Stopwords ignored by search, on top of the entity words. */
    searchStopwords: ['tattoo', 'tattoos', 'tattooist', 'parlor', 'parlour'],
    /** Home shows a launch state until this many listings are live. */
    launchThreshold: 12,
    launchTitle: 'We’re building the independent tattoo studio directory.',
    launchLead: 'Studios are being added and checked across the US, city by city.',
  },

  /** The taxonomy shown on cards, in the hero shortcuts and on the styles index. */
  primaryTaxonomy: 'styles',
  /** Terms in the hero and "Explore by style", in this order. */
  featuredTerms: ['fine-line', 'blackwork', 'traditional', 'japanese', 'realism', 'neo-traditional', 'lettering', 'color'],
  termIntros: styleIntros,
  /** Shorter names for chips and the style index where the full label is long. */
  termShort: { traditional: 'Traditional', lettering: 'Lettering', 'black-and-grey': 'Black & grey' } as Record<string, string>,
  /** Extra words search understands for a term (lower case). */
  termSynonyms: {
    'fine-line': ['fineline', 'fine line', 'single needle'],
    traditional: ['traditional', 'american traditional', 'old school'],
    'black-and-grey': ['black and gray', 'black and grey', 'black & grey', 'black & gray'],
    color: ['colour', 'color', 'colored', 'coloured'],
    lettering: ['lettering', 'script', 'calligraphy'],
    japanese: ['japanese', 'irezumi'],
    portraits: ['portrait', 'portraits'],
  } as Record<string, string[]>,

  /** Simple yes/no filters. Shown only where at least one listing on the page matches. */
  filters: [
    { key: 'walk-ins', label: 'Walk-ins', words: ['walk in', 'walk ins', 'walkin', 'walkins'], test: (l) => has(l, 'services', 'walk-ins') },
    { key: 'appointment-only', label: 'Appointment only', words: ['appointment only', 'by appointment'], test: (l) => l.attributes.appointmentOnly === true },
    { key: 'open-sunday', label: 'Open Sundays', words: ['open sunday', 'open sundays', 'sunday'], test: opensSunday },
  ] as ListingFilter[],

  /** A map beside results needs a tile provider; none is set up yet (see docs/BRIEF.md). */
  map: null as null | { tileUrl: string; attribution: string },

  titles: {
    home: 'Tattoo Shops & Studios in the US by City and Style | TattooStudioGuide',
    studios: 'Search Tattoo Studios in the US by City and Style | TattooStudioGuide',
    studiosDescription: 'Search tattoo shops and studios by city, style or name. Filter by walk-ins and Verified listings. No ratings, just the facts each shop publishes.',
    styles: 'Tattoo Styles: Find Studios by Style | TattooStudioGuide',
    stylesDescription: 'Fine line, blackwork, traditional, Japanese, realism and more. What each tattoo style is, and the studios that list it.',
    homeDescription: 'Find tattoo shops by state, city and style. Hours, walk-ins, shop minimums and how to book, with the date each listing was last checked.',
    homeH1: 'Find a tattoo shop near you',
    region: (name: string, n: number) => `Tattoo Shops in ${name}: ${n} Studios by City | TattooStudioGuide`,
    regionDescription: (name: string, n: number, cities: number) => `${n} tattoo shops in ${cities} ${cities === 1 ? 'city' : 'cities'} across ${name}. Compare styles, walk-ins, shop minimums and hours.`,
    city: (city: string, code: string) => `Tattoo Shops in ${city}, ${code}: Walk-ins, Styles & Hours | TattooStudioGuide`,
    cityDescription: (city: string, code: string, n: number) => `${n} tattoo shops in ${city}, ${code}. Compare styles, walk-in policy, shop minimums and opening hours.`,
    cityH1: (city: string, code: string) => `Tattoo shops in ${city}, ${code}`,
    listing: (name: string, city: string, code: string) => `${name}, ${city} ${code}: Tattoo Shop Hours, Styles & Walk-ins`,
    listingDescription: (name: string, city: string, code: string, facts: string[]) => `${name} is a tattoo shop in ${city}, ${code}.${facts.length ? ' ' + facts.join(' · ') + '.' : ''} Hours, address and how to book.`,
  },
};

export type Site = typeof site;
