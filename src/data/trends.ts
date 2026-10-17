import { Q } from './questions/helpers'
import type { Flashcard, Question } from '@/types'

/**
 * Industry trends. Figures were checked in October 2026 against the linked sources.
 * Forecasts are labeled as forecasts. To refresh: edit `data`, `asOf`, and `sources`, then redeploy.
 */
/** Date the trend facts were last researched (YYYY-MM-DD). The weekly update job sets this. */
export const TRENDS_CHECKED = '2026-10-16'

export interface Trend {
  id: string
  title: string
  kicker: string
  what: string
  data: { stat: string; source: number }[]
  sources: { label: string; url: string }[]
  asOf: string
  pis: string[]
  sayIt: string
  fits: string
  watchOut: string
}

export const TRENDS: Trend[] = [
  {
    id: 'teens',
    title: 'What teens are buying now',
    kicker: 'The target market in many BTDM cases',
    what: 'DECA partners with Piper Sandler on a twice-yearly survey of U.S. teens. It\'s the best free source on teen spending, brands, and apps, which matters when a case asks you to target high school shoppers.',
    data: [
      { stat: 'Teens\' self-reported annual spending fell 6% year over year to $2,213 (fall 2025).', source: 0 },
      { stat: 'TikTok was teens\' favorite app (46%), ahead of Instagram (31%) and Snapchat (14%). About 87% own an iPhone.', source: 0 },
      { stat: 'Nike stayed the top clothing and footwear brand; Sephora stayed the top beauty destination.', source: 1 },
    ],
    sources: [
      { label: 'Piper Sandler: 50th semi-annual teen survey (Oct 2025)', url: 'https://www.pipersandler.com/news/piper-sandler-completes-50th-semi-annual-teen-survey' },
      { label: 'DECA Direct: Unpacking teen trends, fall 2025', url: 'https://www.decadirect.org/articles/unpacking-teen-trends-fall-2025-taking-stock-with-teens-survey' },
    ],
    asOf: 'Fall 2025 survey',
    pis: ['MP:003', 'SE:359', 'PR:007'],
    sayIt: '"Teens are spending a bit less this year, about $2,200 on average, so our exclusive has to feel like a deal and spread through TikTok, their favorite app."',
    fits: 'Any case targeting high school or Gen Z shoppers (like the 2026 BTDM sample).',
    watchOut: 'Survey data is self-reported and averages hide big differences by income and region.',
  },
  {
    id: 'collabs',
    title: 'Limited-edition collaborations & exclusives',
    kicker: 'Why discount chains partner with famous brands',
    what: 'Mass retailers team up with designer or cult brands on limited, store-exclusive collections. Low prices plus scarcity create buzz and traffic and give shoppers a reason to choose that store.',
    data: [
      { stat: 'Target\'s spring 2025 Kate Spade collection had 300+ items, and more than half were priced at $15 or less.', source: 0 },
      { stat: 'Target has used purchase limits and early access for its loyalty cardholders to curb resellers and sellouts.', source: 1 },
      { stat: 'Not every drop works: analysts called some past collaborations poorly executed in stores.', source: 1 },
    ],
    sources: [
      { label: 'Retail Dive: Kate Spade x Target', url: 'https://www.retaildive.com/news/kate-spade-target-limited-edition-apparel-handbag-collaboration/744193' },
      { label: 'Retail Dive: Target x Rosie Assoulin and 2026 partnerships', url: 'https://www.retaildive.com/news/target-rosie-assoulin-collab/825873/' },
    ],
    asOf: '2025–2026',
    pis: ['PM:206', 'PM:128', 'CM:021', 'SE:828'],
    sayIt: '"We\'ll cap purchases at two per customer and give loyalty members a 48-hour early window. That rewards our clientele and keeps resellers from emptying the shelves."',
    fits: 'Product-exclusive, brand-partnership, and "build a younger clientele" cases.',
    watchOut: 'Sellouts frustrate shoppers and reorders are slow. Plan allocation by store and an online waitlist.',
  },
  {
    id: 'private-label',
    title: 'Store brands at record highs',
    kicker: 'Private label keeps gaining share',
    what: 'Shoppers looking for value, and retailers chasing margin, keep pushing store brands up. Many retailers now run good-better-best private-label tiers.',
    data: [
      { stat: 'U.S. store-brand sales hit a record $282.8 billion in 2025.', source: 0 },
      { stat: 'Store-brand dollar sales grew 3.3% vs. 1.2% for national brands; dollar share reached 21.3% and unit share a record 23.5%.', source: 0 },
    ],
    sources: [{ label: 'PLMA / Circana: U.S. private label reached $282.8B in 2025 (Jan 2026)', url: 'https://www.plma.com/article/us-private-label-industry-reached-2828-billion-sales-2025' }],
    asOf: 'Calendar 2025',
    pis: ['PM:206', 'PM:042', 'CM:008', 'PI:002'],
    sayIt: '"Store brands grew almost three times faster than national brands last year, so launching our own line meets shoppers where they are and lifts our margin."',
    fits: 'Private-label launch, margin improvement, vendor-relationship cases.',
    watchOut: 'Vertical channel conflict with national-brand vendors. Plan how to keep those relationships healthy.',
  },
  {
    id: 'value',
    title: 'Value-seeking shoppers',
    kicker: 'Trading down, hunting deals',
    what: 'Many households are cautious: buying needs over wants, switching to cheaper brands, and waiting for deals. Value doesn\'t only mean lowest price; it also means quality for the money.',
    data: [
      { stat: 'McKinsey\'s 2025 holiday survey of 4,000+ U.S. consumers found net sentiment 35% lower than in 2024, with shoppers shifting toward needed goods.', source: 0 },
      { stat: 'Store brands growing faster than national brands (see Store brands) is one sign of trading down.', source: 1 },
    ],
    sources: [
      { label: 'McKinsey: Holiday shopping 2025', url: 'https://www.mckinsey.com/industries/retail/our-insights/holiday-shopping-trends' },
      { label: 'PLMA 2025 store-brand results', url: 'https://www.plma.com/article/us-private-label-industry-reached-2828-billion-sales-2025' },
    ],
    asOf: 'Late 2025',
    pis: ['EC:006', 'PI:002', 'MK:014'],
    sayIt: '"With shoppers trading down, we\'ll keep an opening price point under $15 and use price lining, $15, $25, $40, so every customer finds a step that fits."',
    fits: 'Pricing, premium-vs-discount positioning, and economics cases.',
    watchOut: 'Deep discounting can train shoppers to wait for sales and erode margin.',
  },
  {
    id: 'retail-media',
    title: 'Retail media networks',
    kicker: 'Retailers selling ads to their own vendors',
    what: 'Retailers sell ad space on their websites, apps, in-store screens, and receipts to the brands they carry, using their shopper data to target ads. It\'s a fast-growing, high-margin revenue stream.',
    data: [
      { stat: 'EMARKETER forecasts U.S. retail media ad spending of about $71 billion in 2026, up roughly 18% (Dec 2025 forecast).', source: 0 },
      { stat: 'Walmart and Amazon were forecast to capture over 89% of the incremental retail media dollars in 2026.', source: 1 },
    ],
    sources: [
      { label: 'EMARKETER: FAQ on retail media networks (2026)', url: 'https://www.emarketer.com/content/faq-on-retail-media-networks-how-marketers-should-allocate-budgets-2026' },
      { label: 'EMARKETER: Retail media forecast H2 2025', url: 'https://www.emarketer.com/content/retail-media-ad-spending-forecast-trends-h2-2025' },
    ],
    asOf: 'Forecasts from late 2025',
    pis: ['PR:007', 'PR:100', 'CM:007', 'IM:184'],
    sayIt: '"Our partner brand can fund part of the launch by buying placements on our app\'s home screen, and we can show them exactly which ads led to sales."',
    fits: 'Promotion, vendor-partnership, and co-op advertising questions.',
    watchOut: 'Shoppers dislike cluttered, ad-heavy apps. Keep ads relevant and labeled.',
  },
  {
    id: 'social-commerce',
    title: 'Social commerce',
    kicker: 'Buying without leaving the app',
    what: 'Shoppers discover and buy products inside social platforms through creator videos, livestreams, and in-app shops.',
    data: [
      { stat: 'U.S. social commerce sales were about $87 billion in 2025 (+21.5%) and are forecast to pass $100 billion in 2026.', source: 0 },
      { stat: 'TikTok Shop U.S. sales were estimated at $15.8 billion in 2025, about 18% of U.S. social commerce.', source: 0 },
    ],
    sources: [{ label: 'EMARKETER: TikTok Shop makes up nearly 20% of social commerce in 2025', url: 'https://www.emarketer.com/press-releases/tiktok-shop-makes-up-nearly-20-of-social-commerce-in-2025' }],
    asOf: 'Dec 2025 estimates and forecasts',
    pis: ['PR:247', 'PR:100', 'CM:003'],
    sayIt: '"We\'ll seed the product with 20 micro-creators and link to it in-app, so teens can buy straight from the video they\'re watching."',
    fits: 'Promotion to Gen Z, product launches, word-of-mouth PIs.',
    watchOut: 'Creators must disclose paid partnerships; the brand has limited control over what they say.',
  },
  {
    id: 'resale',
    title: 'Resale & recommerce',
    kicker: 'Secondhand goes mainstream',
    what: 'Buying and selling used goods, online and in store. Many brands and retailers now run trade-in or resale programs that bring shoppers back and support sustainability goals.',
    data: [
      { stat: '59% of U.S. consumers shopped secondhand apparel in 2025.', source: 0 },
      { stat: 'The U.S. secondhand apparel market is projected to reach $78.8 billion by 2030 (forecast).', source: 1 },
      { stat: 'Gen Z and millennials are expected to drive more than 70% of resale growth through 2030.', source: 0 },
    ],
    sources: [
      { label: 'ThredUp 2026 Resale Report (Apr 2026)', url: 'https://secure.businesswire.com/news/home/20260402799816/en/ThredUps-14th-Annual-Resale-Report-Reveals-New-Era-of-Structural-Competition-and-AI-Driven-Discovery' },
      { label: 'Retail Dive: U.S. resale market to surpass $78B', url: 'https://retaildive.com/news/us-resale-market-surpass-78-billion-in-2030-secondhand/816470/' },
    ],
    asOf: 'ThredUp report, April 2026',
    pis: ['SE:828', 'PM:134', 'NF:013'],
    sayIt: '"A trade-in program gives teens store credit for old items, which brings them back to spend it and shows we care about sustainability."',
    fits: 'Building clientele, sustainability, and younger-shopper cases.',
    watchOut: 'Resale needs space, labor, and inspection. Start with one category or a partner.',
  },
  {
    id: 'ai-shopping',
    title: 'AI shopping assistants',
    kicker: 'From search box to shopping agent',
    what: 'Shoppers use AI chat tools to research, compare, and increasingly buy products. Retailers are adding AI assistants and making product data easy for AI tools to read.',
    data: [
      { stat: 'About 70% of consumers say they use AI tools while shopping online, and 65% use them to research products (Clutch, Jan 2026).', source: 0 },
      { stat: 'Most shoppers still want to approve purchases themselves rather than give AI full buying control.', source: 0 },
      { stat: 'Adobe reported AI-referred traffic to U.S. retail sites grew 393% year over year in Q1 2026.', source: 1 },
    ],
    sources: [
      { label: 'Clutch report: 65% use AI to research products (Jan 2026)', url: 'https://secure.businesswire.com/news/home/20260122526477/en/Clutch-Report-65-of-Consumers-Use-AI-to-Research-Products-Before-Making-a-Purchase' },
      { label: 'FashionUnited: 7 in 10 U.S. consumers use AI to shop (Jul 2026)', url: 'https://fashionunited.com/news/retail/7-in-10-us-consumers-use-ai-to-shop-reshaping-how-americans-make-their-purchases/2026071773585' },
    ],
    asOf: 'Surveys from 2026 (vendor-sponsored)',
    pis: ['PR:100', 'SE:107', 'IM:183'],
    sayIt: '"We\'ll make sure our product pages have complete sizes, materials, and reviews so AI shopping assistants can recommend us."',
    fits: 'Technology-in-selling and promotion PIs; omnichannel cases.',
    watchOut: 'Vendor surveys vary in method. Shoppers worry about privacy and accuracy.',
  },
  {
    id: 'tariffs',
    title: 'Tariffs & sourcing shifts',
    kicker: 'Higher import costs reshape buying',
    what: 'Tariffs raise the landed cost of imported merchandise. Buyers respond by diversifying countries, nearshoring, consolidating vendors, raising some prices, or redesigning products.',
    data: [
      { stat: '85% of large U.S. fashion companies said tariffs hurt financial performance (2026 USFIA study, up from 78%).', source: 0 },
      { stat: 'Companies are diversifying rather than reshoring: 76% source from CAFTA-DR countries, but U.S.-made goods are still under 10% of most companies\' sourcing.', source: 0 },
      { stat: 'Price increases have mostly hit fashion-forward and premium items, with basics largely spared.', source: 1 },
    ],
    sources: [
      { label: 'USFIA 2026 Fashion Industry Benchmarking Study (summary)', url: 'https://textalks.com/?p=85059' },
      { label: 'Supply Chain Dive: Fashion supply chains in 2026', url: 'https://www.supplychaindive.com/news/fashion-supply-chains-2026-risks-and-trends/812006/' },
    ],
    asOf: 'Mid-2026',
    pis: ['OP:161', 'EC:100', 'EC:011', 'PI:002'],
    sayIt: '"To protect our margin from tariffs, we\'ll split the order between two vendors in different countries and keep the basics at the same price."',
    fits: 'Vendor selection, domestic vs. foreign buying, pricing, and business-risk cases.',
    watchOut: 'Policy changes quickly. Say "current tariff levels" instead of quoting exact rates.',
  },
  {
    id: 'shrink',
    title: 'Theft, fraud & shrink',
    kicker: 'Shoplifting down, scams up',
    what: 'Shrink includes theft, fraud, damage, and errors. Retailers balance protection (locked cases, RFID, staffing) against a pleasant shopping experience.',
    data: [
      { stat: 'Retailers reported shoplifting incidents down 12.4% and merchandise theft down 8.1% in 2025 vs. 2024.', source: 0 },
      { stat: 'Fraud and scams rose, including gift card and loyalty fraud, and theft remains above pre-pandemic levels.', source: 0 },
    ],
    sources: [{ label: 'NRF: Retailers see fraud schemes evolve as shoplifting declines (Jul 2026)', url: 'https://nrf.com/media-center/press-releases/retailers-see-fraud-schemes-evolve-as-shoplifting-declines-nrf-study-finds' }],
    asOf: 'NRF study, July 2026',
    pis: ['OP:031', 'EC:011', 'CR:018'],
    sayIt: '"We\'ll RFID-tag the exclusive line so we know exactly what\'s on the floor, cutting shrink without locking items away from teens."',
    fits: 'Inventory control, business risk, loss-prevention questions.',
    watchOut: 'Locked cases can cut sales. Recommend protections that don\'t hurt the customer experience.',
  },
  {
    id: 'bopis',
    title: 'Buy online, pick up in store',
    kicker: 'Stores as fulfillment hubs',
    what: 'BOPIS and curbside pickup connect online and store shopping. They save shipping costs and bring shoppers into stores, where many buy extra items.',
    data: [
      { stat: 'U.S. click-and-collect sales are estimated at well over $100 billion a year in 2025, though estimates differ ($120B–$154B depending on source and definition).', source: 0 },
    ],
    sources: [
      { label: 'Statista topic: Click and collect', url: 'https://statista.com/topics/7830/click-and-collect/' },
      { label: 'Global Sources: BOPIS overview', url: 'https://www.globalsources.com/knowledge/bopis-buy-online-pick-up-in-store/' },
    ],
    asOf: '2025 estimates (sources vary)',
    pis: ['CM:003', 'CR:003', 'SE:076'],
    sayIt: '"Online-only exclusives with free in-store pickup put teens in our store, and we\'ll place the matching accessories right at the pickup counter."',
    fits: 'Omnichannel, channel-management, and customer-service cases.',
    watchOut: 'Pickup areas need staff and accurate inventory, or customers have a bad experience.',
  },
  {
    id: 'bnpl',
    title: 'Buy now, pay later',
    kicker: 'Installment payments at checkout',
    what: 'BNPL services split a purchase into short-term installments, often interest-free. They can raise conversion and order size, but shoppers can overextend.',
    data: [
      { stat: 'BNPL drove about $20 billion in U.S. online holiday spending in 2025, up 9.8% (Adobe).', source: 0 },
      { stat: 'About 82% of holiday BNPL payments were made on mobile devices.', source: 0 },
    ],
    sources: [{ label: 'Adobe: 2025 holiday shopping season results (Jan 2026)', url: 'https://news.adobe.com/news/downloads/pdfs/2026/01/010726-holiday-shopping-season-2025.pdf' }],
    asOf: '2025 holiday season',
    pis: ['FI:002', 'FI:063', 'EC:004'],
    sayIt: '"Offering pay-in-four on the $120 bundle creates possession utility: shoppers take it home today for $30 down."',
    fits: 'Pricing, credit, and premium-merchandise cases.',
    watchOut: 'Ethics: clearly disclose terms and avoid pushing teens into debt.',
  },
  {
    id: 'store-fleet',
    title: 'Fewer, better stores',
    kicker: 'Closings outpace openings',
    what: 'Retailers are closing underperforming stores and investing in the ones that remain: remodels, experiences, services, and fulfillment.',
    data: [
      { stat: 'U.S. store closings outpaced openings in 2024 (7,325 closed vs. 5,970 opened).', source: 0 },
      { stat: 'Coresight expected a larger net loss in 2025, with about 5,800 openings forecast.', source: 1 },
    ],
    sources: [
      { label: 'Drug Store News: How many stores will open and close in 2025', url: 'https://drugstorenews.com/how-many-stores-will-open-close-2025' },
      { label: 'CoStar: Rising U.S. store closings', url: 'https://www.costar.com/article/1870124869/rising-us-store-closings-on-pace-for-record-year' },
    ],
    asOf: '2024 actuals; 2025 forecast',
    pis: ['MP:008', 'EC:010', 'SM:001'],
    sayIt: '"Every square foot has to earn its place, so we\'ll test the shop-in-shop in our top 50 stores and expand only if sales per square foot beat the department average."',
    fits: 'Space-productivity, store-experience, and situation-analysis questions.',
    watchOut: 'Store counts are moving targets. Use them as context, not as your main point.',
  },
  {
    id: 'dupes',
    title: 'Dupe culture',
    kicker: '"Looks like the famous one, costs less"',
    what: 'Dupes are lower-priced lookalikes of popular products. They\'re big on social media, especially among young shoppers, and pressure brands to prove their value.',
    data: [
      { stat: '27% of U.S. adults said they had intentionally bought a dupe (Feb 2025), down from 31% in late 2023.', source: 0 },
      { stat: 'Dupe buyers skew young, lower-income, and very online.', source: 0 },
    ],
    sources: [{ label: 'Morning Consult: Dupe shoppers & brand strategy (2025)', url: 'https://pro.morningconsult.com/analysis/dupe-shoppers-brand-strategy-2025' }],
    asOf: 'Feb 2025 survey',
    pis: ['PM:042', 'BL:001', 'PM:040'],
    sayIt: '"Instead of copying a designer, our store brand will be \'inspired by\' the trend with our own design and name, so we get the value appeal without legal risk."',
    fits: 'Private-label, positioning, and legal/ethical PIs.',
    watchOut: 'Copying protected designs, logos, or trade dress can infringe intellectual property.',
  },
  {
    id: 'loyalty',
    title: 'Loyalty programs everywhere',
    kicker: 'Members are many; active members fewer',
    what: 'Most shoppers belong to loyalty programs, but far fewer use them actively. Paid memberships with perks (free shipping, early access) are growing.',
    data: [
      { stat: '82% of grocery shoppers belong to at least one program, but only 59% of members use it regularly (Upside, 2025).', source: 0 },
      { stat: '53% of consumers said they pay to participate in a loyalty program, up from 32% in 2022 (Deloitte, reported Jan 2024).', source: 1 },
    ],
    sources: [
      { label: 'Upside: Going beyond loyalty (2025)', url: 'https://www.upside.com/reports/going-beyond-loyalty-part-i-for-retailers' },
      { label: 'Retail TouchPoints: Deloitte loyalty trends', url: 'https://www.retailtouchpoints.com/features/deloitte-shares-loyalty-trends-and-best-practices-for-2024/139822/' },
    ],
    asOf: '2024–2025 surveys',
    pis: ['SE:828', 'CR:016', 'CR:030'],
    sayIt: '"Loyalty members get early access to the drop. Signing up is free, and it gives us the data to invite them back for the next one."',
    fits: 'Clientele-building, CRM, and repeat-business cases.',
    watchOut: 'Data privacy: be clear about what you collect and why.',
  },
]

export const TREND_BY_ID = Object.fromEntries(TRENDS.map((t) => [t.id, t]))

/** Conceptual trend flashcards (no volatile numbers). */
export const TREND_CARDS: Flashcard[] = [
  ['Retail media network', 'A retailer\'s advertising business: it sells ad space on its site, app, and in-store screens to brands, targeted with shopper data.'],
  ['Social commerce', 'Discovering and buying products directly inside social media apps, often through creator videos or livestreams.'],
  ['Recommerce (resale)', 'Buying and selling used products; trade-in programs give shoppers credit for items they return.'],
  ['Retailer-exclusive collaboration', 'A limited collection a retailer co-creates with a known brand or designer and sells only in its own stores or site.'],
  ['Dupe', 'A lower-priced product designed to look and feel like a popular, pricier one.'],
  ['Trading down', 'Shoppers switching to cheaper brands, store brands, or discount retailers to save money.'],
  ['Nearshoring', 'Moving sourcing to countries closer to home (for U.S. buyers, Mexico and Central America) to cut lead times and risk.'],
  ['Tariff', 'A tax on imported goods that raises the landed cost of merchandise.'],
  ['Agentic commerce', 'AI assistants that research, compare, and sometimes complete purchases for shoppers.'],
  ['Buy now, pay later (BNPL)', 'Splitting a purchase into short-term installments at checkout, often interest-free.'],
  ['Paid loyalty membership', 'A program shoppers pay to join in exchange for perks like free shipping, discounts, or early access.'],
  ['Shop-in-shop', 'A branded mini-store inside a larger store, run with or by a partner brand.'],
].map(([front, back], i) => ({ id: `t-${String(i + 1).padStart(3, '0')}`, area: 'MK' as const, topic: 'T.trends', front, back, deck: 'trends' as const }))

/** Conceptual trend questions; tagged MK and excluded from blueprint mock exams. */
export const TREND_QUESTIONS: Question[] = [
  Q('TR-01', 'MK:019', 'T.trends', 'A discount chain sells ad placements on its app and in-store screens to the brands it carries, targeting ads with shopper data. This is a',
    'retail media network.', ['slotting allowance.', 'cooperative distribution.', 'gray market.'],
    'Retail media networks let retailers earn ad revenue from vendors by using their own shopper data and channels.'),
  Q('TR-02', 'MK:019', 'T.trends', 'Why do mass retailers launch limited-edition collaborations with well-known designers?',
    'To create buzz and traffic and give shoppers a reason to choose their store', ['To eliminate the need for promotion', 'To raise prices on everyday basics', 'To avoid working with vendors'],
    'Exclusive collaborations combine a famous name with the retailer\'s low prices and scarcity, which drives traffic and differentiation.'),
  Q('TR-03', 'MK:019', 'T.trends', 'A sneaker retailer gives store credit for gently used shoes and resells them. This program mainly helps the retailer by',
    'bringing shoppers back and appealing to sustainability-minded customers.', ['eliminating all new-merchandise sales.', 'avoiding inventory control.', 'raising the price of new shoes.'],
    'Trade-in and resale programs build repeat visits (clientele) and appeal to shoppers who value sustainability.'),
  Q('TR-04', 'MK:019', 'T.trends', 'Facing higher tariffs on goods from one country, a buyer splits orders between vendors in Mexico and Vietnam. This strategy is',
    'diversifying sourcing to reduce risk.', ['predatory pricing.', 'drop shipping.', 'consignment buying.'],
    'Spreading purchases across countries reduces exposure to tariffs and disruptions in any one place.'),
  Q('TR-05', 'MK:019', 'T.trends', 'Which practice keeps a store brand\'s "dupe" of a popular product legal and ethical?',
    'Using its own design and name instead of copying protected logos or trade dress', ['Copying the competitor\'s logo exactly', 'Calling it by the famous brand\'s name', 'Using the competitor\'s packaging'],
    'Lookalike value products are legal when they don\'t infringe trademarks, patents, or trade dress.'),
  Q('TR-06', 'MK:019', 'T.trends', 'A retailer offers "pay in 4" installments at checkout. Which responsibility is most important?',
    'Clearly disclosing payment terms and fees', ['Requiring cash only', 'Hiding late fees to boost conversion', 'Offering it only on clearance items'],
    'Credit-like products must be clearly disclosed so shoppers understand what they owe.'),
  Q('TR-07', 'MK:019', 'T.trends', 'A shopper discovers a hoodie in a creator\'s video and buys it without leaving the app. This is',
    'social commerce.', ['showrooming.', 'telemarketing.', 'direct mail.'],
    'Social commerce is buying directly within social media platforms.'),
  Q('TR-08', 'MK:019', 'T.trends', 'Shoplifting falls but gift card and loyalty-account scams rise. What should a loss-prevention plan add?',
    'Fraud controls such as account verification and gift-card activation checks', ['Only more locked display cases', 'Fewer cashiers', 'Ending the loyalty program'],
    'Shrink includes fraud, not just shoplifting, so controls must match how losses are actually happening.'),
]
