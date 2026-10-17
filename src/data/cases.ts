import type { CompetencyKey } from './playbook'

export interface DataTable {
  title: string
  columns: string[]
  rows: (string | number)[][]
  note?: string
}

export interface CasePI {
  code: string
  text: string
  /** Which role it fits best: 0 = first role, 1 = second role. */
  fits: 0 | 1
  /** What a strong answer covers for this PI (judge key points). */
  key: string[]
}

export interface CaseStudy {
  id: string
  title: string
  company: string
  /** Two-sentence summary used for judge-question practice. */
  brief: string
  /** An example plan to defend when the team hasn't written its own. */
  examplePlan: string
  /** Instructional area printed on the case cover. */
  area: string
  roles: [string, string]
  judge: string
  situation: string[]
  tasks: string[]
  pis: CasePI[]
  competencies: CompetencyKey[]
  data: DataTable[]
  /** The two standard questions every team is asked. */
  judgeQuestions: [string, string]
  solutionKeys: string[]
  /** Suggested trend ids that would make a solution more unique. */
  trends: string[]
  difficulty: 1 | 2 | 3
}

/**
 * Eight original practice cases in the BTDM format: two roles, a judge character, five Tier 1/Tier 2
 * performance indicators, the case's career competencies, and two standard judge questions.
 * Companies and numbers are fictional. Data tables are added for practice; real DECA cases include little data.
 */
export const CASES: CaseStudy[] = [
  {
    id: 'hallway-threads',
    brief: "HALLWAY THREADS, a 140-store teen apparel chain, lost sales last back-to-school season. The VP of merchandising wants one store-exclusive product that gets teens talking and coming back.",
    examplePlan: "A creator-designed capsule of graphic tees and accessories under $25, released in three drops starting mid-July, with early access for loyalty members.",
    title: 'A back-to-school exclusive for teens',
    company: 'HALLWAY THREADS',
    area: 'Product/Service Management',
    roles: ['merchandising manager', 'brand manager'],
    judge: 'vice president of merchandising',
    difficulty: 1,
    situation: [
      'HALLWAY THREADS is a 140-store specialty apparel chain located mostly in suburban malls. Its core customers are 13- to 18-year-olds and the parents who pay for back-to-school (BTS) shopping. BTS (mid-July through early September) produces about 30% of the chain\'s annual sales.',
      'Last BTS, sales fell 4% while two fast-fashion competitors and online marketplaces grew. Customer surveys say HALLWAY THREADS has "good basics" but "nothing you can\'t get anywhere else." Graphic tees and accessories grew; denim and outerwear fell.',
      'The vice president of merchandising (judge) has $350,000 at cost available for one exclusive BTS product or collection that would only be sold at HALLWAY THREADS. She wants an idea that gets teens talking and brings them back during the season.',
    ],
    tasks: [
      'Generate a product idea for the BTS exclusive and explain why it fits teen shoppers',
      'Explain how the exclusive will be positioned against competitors',
      'Describe how word of mouth will spread the launch',
      'Explain how the exclusive will build repeat visits during the season',
    ],
    pis: [
      { code: 'PM:128', text: 'Generate product ideas.', fits: 0, key: ['Offers a specific idea (e.g., a limited creator-designed graphic tee and accessory capsule) with price points and quantities', 'Shows how the idea came from data: growth in graphics and accessories, survey comments, teen trends', 'Considers feasibility: fits the $350,000 cost budget and lead times for a mid-July launch'] },
      { code: 'PM:042', text: 'Describe factors used by marketers to position products/services.', fits: 1, key: ['Names positioning bases: attributes, benefits, users, price/quality, vs. competitors', 'Writes a clear positioning statement ("For teens who…, our … is the only …")', 'Differentiates from fast fashion on exclusivity, creator story, or quality, not just price'] },
      { code: 'SE:359', text: 'Discuss motivational theories that impact buying behavior.', fits: 0, key: ['Uses a theory such as Maslow (belonging, esteem) or emotional vs. rational motives', 'Connects scarcity and limited drops to belonging and self-expression for teens', 'Remembers the parent as payer: rational motives like price, durability, value'] },
      { code: 'PR:247', text: 'Describe word-of-mouth channels used to communicate with targeted audiences.', fits: 1, key: ['Identifies channels: creators/influencers, product seeding, referral codes, user-generated content, school ambassadors', 'Notes the limited control of word of mouth and how to manage it (clear guidelines, disclosures)', 'Includes a shareable moment (in-store design wall, unboxing, "drop day")'] },
      { code: 'SE:828', text: 'Explain key factors in building a clientele.', fits: 1, key: ['Defines a clientele as loyal repeat customers', 'Uses loyalty sign-ups, early access, and staggered drops to bring teens back across the season', 'Measures repeat visits and loyalty sign-ups'] },
    ],
    competencies: ['critical', 'communication', 'innovation'],
    data: [
      { title: 'Last back-to-school season by category', columns: ['Category', 'Sales', 'Change vs. prior year', 'Gross margin'], rows: [['Denim', '$8.4M', '−9%', '48%'], ['Graphic tees', '$6.1M', '+7%', '61%'], ['Outerwear', '$3.9M', '−6%', '52%'], ['Accessories', '$2.8M', '+12%', '64%'], ['Basics (tees, socks)', '$5.6M', '−2%', '55%']] },
      { title: 'Teen customer survey (n = 1,200)', columns: ['What would make you shop here more?', '% choosing'], rows: [['Products I can\'t get anywhere else', '58%'], ['Collabs with creators I follow', '41%'], ['Lower prices', '37%'], ['Better online ordering', '22%']] },
    ],
    judgeQuestions: ['How would you decide how many units to buy for each store?', 'What would you do if the exclusive sells out in the first week?'],
    solutionKeys: ['A specific, original exclusive with price points (e.g., $24.99 tees, $14.99 accessories) and a launch date', 'A staggered drop calendar (3 drops across BTS) to drive repeat visits', 'Allocation by store sales history with a reserve for fast reorders', 'Metrics: sell-through by week 2, loyalty sign-ups, repeat purchase rate, social mentions'],
    trends: ['collabs', 'teens', 'social-commerce'],
  },
  {
    id: 'northline',
    brief: "NORTHLINE OUTDOOR is launching its first private-label jacket at $129 and must pick one of three vendors (Vietnam, Mexico, or the USA). Jackets must arrive by August 15.",
    examplePlan: "Choose the Mexican vendor for its on-time record and low defects, earn about a 62% markup at $129, and review the vendor every quarter.",
    title: 'Choosing a vendor for a private-label jacket',
    company: 'NORTHLINE OUTDOOR',
    area: 'Operations',
    roles: ['buyer', 'product development manager'],
    judge: 'director of sourcing',
    difficulty: 2,
    situation: [
      'NORTHLINE OUTDOOR is a 60-store regional outdoor retailer in the Upper Midwest. It wants to launch its first private-label insulated jacket for fall, retailing at $129. National-brand jackets at similar quality sell for $179–$229.',
      'Three vendors submitted proposals. The director of sourcing (judge) is concerned about recent tariff changes, a vendor that missed deadlines for a competitor last year, and keeping NORTHLINE\'s reputation for quality and responsible sourcing.',
      'Jackets must arrive in the distribution center by August 15 to hit stores for the fall season. The buyer has been offered a weekend trip by one vendor\'s sales representative.',
    ],
    tasks: [
      'Recommend which vendor to use and explain the selection criteria',
      'Explain how you will evaluate the vendor once the order is placed',
      'Explain the role of ethics in this purchasing decision',
      'Discuss how pricing and currency factors affect the recommendation',
    ],
    pis: [
      { code: 'OP:161', text: 'Select vendors.', fits: 0, key: ['Uses multiple criteria: landed cost, quality/defects, on-time %, lead time, MOQ, terms, ethics', 'Weights the criteria and compares vendors objectively (a scorecard)', 'Makes a clear recommendation and explains the tradeoff accepted'] },
      { code: 'OP:162', text: 'Evaluate vendor performance.', fits: 1, key: ['Sets measures: on-time delivery, fill rate, defect rate, responsiveness', 'Plans checkpoints: pre-production sample approval, inspection before shipping', 'Explains consequences: chargebacks, corrective action, or switching vendors'] },
      { code: 'OP:246', text: 'Discuss the importance of utilizing ethical purchasing methods.', fits: 0, key: ['Declines the trip; gifts can bias decisions and break company policy', 'Values responsible factory practices and certifications', 'Protects the brand\'s reputation and fair treatment of all bidders'] },
      { code: 'PI:002', text: 'Explain factors affecting pricing decisions.', fits: 1, key: ['Names factors: costs, competition, demand, perceived value, company objectives', 'Calculates margin at $129 retail using landed cost (markup on retail)', 'Positions the price against national brands at $179–$229'] },
      { code: 'EC:100', text: 'Describe the determinants of exchange rates and their effects on the domestic economy.', fits: 0, key: ['Defines exchange rate and what moves it (interest rates, inflation, trade, stability)', 'Explains that a weaker dollar raises the cost of imports', 'Uses it in the decision: currency and tariff risk favor a nearer or domestic vendor or a price buffer'] },
    ],
    competencies: ['critical', 'decision', 'collaboration'],
    data: [
      { title: 'Vendor proposals (6,000 jackets)', columns: ['', 'Vendor A (Vietnam)', 'Vendor B (Mexico)', 'Vendor C (USA)'], rows: [['Landed cost per unit', '$41', '$49', '$63'], ['Lead time', '120 days', '60 days', '35 days'], ['On-time delivery (past year)', '78%', '94%', '97%'], ['Defect rate', '3.5%', '1.2%', '0.8%'], ['Minimum order', '8,000 units', '3,000 units', '1,500 units'], ['Payment terms', 'Net 60', '2/10, net 30', 'Net 30'], ['Factory audit', 'Pending', 'Certified', 'Certified']], note: 'Landed cost includes freight and current tariffs. Today is May 1.' },
    ],
    judgeQuestions: ['How would your recommendation change if tariffs on Vendor A\'s country dropped by half?', 'What will you do if the first shipment arrives with a high defect rate?'],
    solutionKeys: ['Vendor B is the strongest fit: on-time and quality records, meets the Aug 15 date (Vendor A\'s 120-day lead time misses it and its MOQ exceeds the order)', 'Margin check: ($129 − $49) ÷ $129 ≈ 62% markup on retail', 'Take the 2% cash discount (2/10, net 30)', 'Scorecard reviewed quarterly; pre-shipment inspection; decline the gift'],
    trends: ['tariffs', 'private-label'],
  },
  {
    id: 'freshcart',
    brief: "FRESHCART MARKET wants store brands to grow from 14% to 20% of snack and beverage sales. It can't afford to lose the national brands that fund its promotions.",
    examplePlan: "Add a premium store-brand tier, take shelf space only from slow national items, and run joint promotions with the top national vendors.",
    title: 'Growing store brands without losing national brands',
    company: 'FRESHCART MARKET',
    area: 'Channel Management',
    roles: ['category manager', 'brand manager'],
    judge: 'vice president of merchandising',
    difficulty: 2,
    situation: [
      'FRESHCART MARKET is a 75-store regional grocery chain known for fresh produce and friendly service. Its "FreshCart Select" store brand makes up 14% of sales, below the 21% national average for store brands.',
      'FRESHCART wants to grow store-brand share in the snack and beverage aisles to 20% within two years because store brands earn higher margins. Two national snack companies that pay FRESHCART slotting allowances and fund weekly promotions have warned that shrinking their shelf space could reduce that support.',
      'Shoppers trust FRESHCART\'s produce but some say store-brand packaged foods look "generic." The vice president of merchandising (judge) wants a plan that grows the store brand while keeping vendor relationships healthy.',
    ],
    tasks: [
      'Recommend how to grow store-brand share in snacks and beverages',
      'Explain how FRESHCART will maintain relationships with national-brand vendors',
      'Explain how FRESHCART will show shoppers the store brand is high quality',
      'Explain how pricing and promotion of the store brand will stay ethical',
    ],
    pis: [
      { code: 'CM:008', text: 'Explain the nature of channel-member relationships.', fits: 0, key: ['Identifies vertical channel conflict caused by different goals', 'Proposes win-win steps: protect top national items\' facings, joint promotions, honest space reviews', 'Shows that both sides benefit from category growth'] },
      { code: 'CM:006', text: 'Describe ethical considerations in channel management.', fits: 0, key: ['Addresses slotting allowances honestly (no pay-to-play deception)', 'Avoids misusing vendor sales data to copy their products', 'Treats vendors fairly and keeps agreements'] },
      { code: 'PM:206', text: 'Explain the nature of corporate branding.', fits: 1, key: ['Ties FreshCart Select to the corporate brand promise of freshness and quality', 'Consistent packaging and identity across all store-brand items', 'Uses the store\'s trust in produce to lift packaged-goods perception'] },
      { code: 'PM:019', text: 'Describe the uses of grades and standards in marketing.', fits: 1, key: ['Uses quality standards, certifications, and clear ingredient labeling', 'Taste tests or quality guarantees as proof', 'Explains how standards build trust and safety'] },
      { code: 'PI:015', text: 'Describe the role of business ethics in pricing.', fits: 0, key: ['Honest comparison claims ("compare to" only when truly comparable)', 'No confusing or deceptive pricing', 'Fair value pricing builds long-term trust'] },
    ],
    competencies: ['critical', 'communication', 'decision'],
    data: [
      { title: 'Snacks & beverages, last 52 weeks', columns: ['', 'National brands', 'FreshCart Select'], rows: [['Sales', '$41.2M', '$5.8M'], ['Gross margin', '29%', '41%'], ['Sales growth', '+1%', '+6%'], ['Shelf space share', '88%', '12%']] },
      { title: 'Vendor support', columns: ['Support type', 'Annual value'], rows: [['Slotting allowances', '$1.1M'], ['Promotional funding', '$2.4M'], ['Co-op advertising', '$0.6M']] },
    ],
    judgeQuestions: ['What would you say to a national-brand rep who threatens to pull promotional funding?', 'How will you know if the store-brand growth is actually profitable?'],
    solutionKeys: ['Phased growth: premium "Select Reserve" tier plus value tier, space shifted gradually from slow national SKUs, not leaders', 'Joint business plans with top vendors, keeping their best sellers at eye level', 'Visible quality proof: taste-test events, satisfaction guarantee, redesigned packaging', 'Track category margin $ (not just %), store-brand share, and vendor funding'],
    trends: ['private-label', 'value'],
  },
  {
    id: 'glow',
    brief: "GLOW & CO., a teen beauty chain, has too much slow-selling skin care while newer clean products sell out. The holidays start in seven weeks.",
    examplePlan: "Mark down the slow viral items now, reorder the clean products, and check sell-through every week.",
    title: 'Too much inventory, falling sell-through',
    company: 'GLOW & CO.',
    area: 'Pricing',
    roles: ['merchandise planner', 'pricing manager'],
    judge: 'general merchandise manager',
    difficulty: 3,
    situation: [
      'GLOW & CO. is a 90-store beauty and wellness chain popular with teens and young adults. Its skin-care category grew 30% two years ago on viral products, but sales are now flat while inventory is up 22%.',
      'Several items that went viral last year are now selling slowly, while newer "clean" and fragrance-free products sell out. Stores report crowded shelves and expired testers. Competitors are running frequent 20%-off events.',
      'The general merchandise manager (judge) needs a plan to clear excess inventory, protect margin, and decide what to keep buying, before the holiday gift season.',
    ],
    tasks: [
      'Recommend which products to mark down, keep, or reorder, using the data',
      'Explain the pricing approach and markdown timing',
      'Explain which data GLOW & CO. should monitor from now on',
      'Explain how the plan will protect profit',
    ],
    pis: [
      { code: 'PI:002', text: 'Explain factors affecting pricing decisions.', fits: 1, key: ['Names factors: demand, competition, costs, product life cycle, inventory levels', 'Explains why slow sellers need markdowns while strong sellers hold price', 'Considers competitor 20%-off events without starting a price war'] },
      { code: 'PI:001', text: 'Explain the nature and scope of the pricing function.', fits: 1, key: ['Pricing aims to meet objectives such as profit, share, and moving inventory', 'Pricing decisions include markdowns, promotions, and price levels', 'Coordinates pricing with buying and promotion'] },
      { code: 'PM:024', text: 'Identify the impact of product life cycles on marketing decisions.', fits: 0, key: ['Classifies items: viral hits now in decline vs. clean products in growth', 'Decline → mark down and stop reordering; growth → deepen and protect in-stock', 'Uses the life cycle to shape the holiday assortment'] },
      { code: 'IM:184', text: 'Identify data monitored for marketing decision making.', fits: 0, key: ['Names KPIs: sell-through, weeks of supply, turnover, gross margin, social buzz', 'Sets a review cadence (weekly) and triggers (e.g., markdown when weeks of supply > 16)', 'Uses POS and inventory data by SKU and store'] },
      { code: 'EC:010', text: 'Identify factors affecting a business\'s profit.', fits: 1, key: ['Profit = revenue − expenses; excess inventory raises carrying costs and markdowns', 'Early, smaller markdowns protect more margin than late, deep ones', 'Frees open-to-buy for faster-selling products'] },
    ],
    competencies: ['critical', 'decision', 'communication'],
    data: [
      { title: 'Top skin-care SKUs (last 8 weeks)', columns: ['Item', 'Retail', 'Units on hand', 'Avg weekly units', 'Weeks of supply', 'Sell-through', 'Margin'], rows: [['Glass-Skin Serum (viral 2024)', '$28', '9,600', '320', '30', '18%', '62%'], ['Peel Pads', '$22', '7,200', '400', '18', '26%', '58%'], ['Clean Barrier Cream', '$24', '1,800', '900', '2', '81%', '60%'], ['Fragrance-Free Cleanser', '$16', '2,400', '800', '3', '74%', '57%'], ['Glitter Body Mist', '$14', '6,500', '130', '50', '9%', '66%']], note: 'Weeks of supply = units on hand ÷ average weekly units. Holiday season starts in 7 weeks.' },
    ],
    judgeQuestions: ['Won\'t marking down the viral serum hurt our brand image?', 'How much open-to-buy should we save for new products during the holidays?'],
    solutionKeys: ['Mark down Glitter Body Mist and Glass-Skin Serum now (e.g., 25% then 40%), or bundle into holiday gift sets', 'Reorder and give more space to Barrier Cream and Cleanser (2–3 weeks of supply = stockout risk)', 'Weekly KPI dashboard: sell-through, weeks of supply, GMROI', 'Use freed open-to-buy for growth items; avoid matching every competitor 20%-off event'],
    trends: ['value', 'social-commerce'],
  },
  {
    id: 'bayside',
    brief: "BAYSIDE HOME's stores and website run separately. Online returns are high and shoppers can't see what's in stock nearby.",
    examplePlan: "Launch buy online, pick up in store with real-time stock, one price everywhere, and returns at any store.",
    title: 'Connecting stores and online',
    company: 'BAYSIDE HOME',
    area: 'Customer Relations',
    roles: ['omnichannel manager', 'customer experience manager'],
    judge: 'chief operating officer',
    difficulty: 2,
    situation: [
      'BAYSIDE HOME sells home décor, bedding, and small furniture through 48 stores and a website. Online sales grew 35% in two years, but online return rates are high, and reviews complain that customers "can\'t tell what\'s in stock" at their local store.',
      'Store associates see shoppers photograph items and then buy them online elsewhere. Store sales are flat. BAYSIDE has never offered buy online, pick up in store (BOPIS), and its website and stores run separate promotions.',
      'The chief operating officer (judge) wants a plan that makes shopping seamless across channels and turns one-time shoppers into loyal customers.',
    ],
    tasks: [
      'Recommend how to connect BAYSIDE\'s store and online channels',
      'Explain how customer service will support the plan',
      'Describe the technology associates and customers will use',
      'Explain how BAYSIDE will build long-term customer relationships',
    ],
    pis: [
      { code: 'CM:003', text: 'Explain the nature of channels of distribution.', fits: 0, key: ['Explains channels and intermediaries; BAYSIDE uses a direct online channel and stores', 'Recommends an omnichannel approach: shared inventory, BOPIS, ship-from-store, returns anywhere', 'Shows how channels support each other instead of competing'] },
      { code: 'CR:003', text: 'Explain the nature of positive customer relations.', fits: 1, key: ['Positive relations build repeat business and word of mouth', 'Fixes pain points: visible local stock, easy returns, consistent prices', 'Keeping customers costs less than finding new ones'] },
      { code: 'SE:076', text: 'Explain the role of customer service as a component of selling relationships.', fits: 1, key: ['Service before, during, and after the sale', 'Associates help with design advice and order online for out-of-stock items', 'Follow-up after delivery or pickup'] },
      { code: 'SE:107', text: 'Describe the use of technology in the selling function.', fits: 0, key: ['Mobile POS and tablets to check stock and order (endless aisle)', 'Real-time inventory on the website', 'Room-visualizer or AR tools to cut returns'] },
      { code: 'CR:016', text: 'Discuss the nature of customer relationship management.', fits: 1, key: ['Defines CRM: using customer data to personalize and keep customers', 'One customer profile across channels; loyalty program', 'Protects data and asks permission'] },
    ],
    competencies: ['critical', 'communication', 'collaboration'],
    data: [
      { title: 'Channel performance', columns: ['', 'Stores', 'Online'], rows: [['Sales (last year)', '$96M', '$41M'], ['Two-year growth', '0%', '+35%'], ['Return rate', '6%', '19%'], ['Average order', '$84', '$132'], ['Repeat customers (12 mo.)', '31%', '18%']] },
      { title: 'Top online review complaints', columns: ['Complaint', 'Share of negative reviews'], rows: [['Item looked different at home', '38%'], ['Couldn\'t check local stock', '24%'], ['Different prices online vs. store', '17%'], ['Slow delivery', '21%']] },
    ],
    judgeQuestions: ['How would BOPIS affect our store employees\' jobs?', 'How will we keep online returns from hurting profit?'],
    solutionKeys: ['Launch BOPIS + real-time local inventory + returns in any store, phased by region', 'Unified pricing and one loyalty profile', 'Associates with tablets for endless aisle; room visualizer to cut returns', 'Metrics: online return rate, BOPIS add-on sales, repeat rate'],
    trends: ['bopis', 'loyalty', 'ai-shopping'],
  },
  {
    id: 'playvault',
    brief: "PLAYVAULT, a toy chain, has a limited supply of the hot holiday toy BYTEBOTS. Last year it ran out early and then marked down leftovers.",
    examplePlan: "Allocate by store sales with a warehouse reserve, limit two per customer, and reorder only if week-one sell-through is strong.",
    title: 'Planning the holiday season for a hot toy',
    company: 'PLAYVAULT',
    area: 'Market Planning',
    roles: ['planner', 'marketing manager'],
    judge: 'director of merchandise planning',
    difficulty: 3,
    situation: [
      'PLAYVAULT is a 120-store toy and game retailer. November and December produce 45% of its annual sales. This year, a collectible robot toy, BYTEBOTS, is trending on social media, and PLAYVAULT has secured an early shipment, though supply is limited.',
      'Last year PLAYVAULT ran out of a hot toy in the first week of December, then had too much of other toys in January, leading to heavy markdowns. Competitors with stronger online ordering captured the late shoppers.',
      'The director of merchandise planning (judge) needs a holiday plan covering the forecast, how BYTEBOTS will be allocated and promoted, and how to reduce risk.',
    ],
    tasks: [
      'Explain how PLAYVAULT should forecast holiday sales',
      'Analyze PLAYVAULT\'s situation before the season',
      'Recommend a strategy for BYTEBOTS allocation and promotion',
      'Explain the main risks and how to manage them',
    ],
    pis: [
      { code: 'MP:013', text: 'Explain the nature of sales forecasts.', fits: 0, key: ['Defines a forecast as predicted sales for a period, based on history, trends, and conditions', 'Adjusts last year\'s numbers for trends (BYTEBOTS buzz) and economic conditions', 'Uses the forecast to set purchases, staffing, and promotion timing'] },
      { code: 'MP:008', text: 'Explain the role of situation analysis in the marketing planning process.', fits: 1, key: ['Uses SWOT: strengths (secured supply), weaknesses (online ordering), opportunities, threats', 'Learns from last year\'s stockouts and markdowns', 'Situation analysis comes first and shapes the strategy'] },
      { code: 'MP:001', text: 'Explain the concept of marketing strategies.', fits: 1, key: ['States a target market and marketing-mix plan for the season', 'Strategy can change as conditions change (in-season adjustments)', 'Uses BYTEBOTS to drive traffic for other toys (cross-merchandising)'] },
      { code: 'CM:007', text: 'Coordinate channel management with other marketing activities.', fits: 0, key: ['Inventory must be in stores before ads run', 'Allocates by store demand; keeps a DC reserve for fast replenishment', 'Coordinates online reservations and pickup with promotions'] },
      { code: 'EC:011', text: 'Determine factors affecting business risk.', fits: 0, key: ['Identifies risks: overbuying, stockouts, shipping delays, fad decline', 'Economic, natural, and human risks', 'Manages risk: purchase limits, staged orders, markdown plan for leftovers'] },
    ],
    competencies: ['critical', 'decision', 'innovation'],
    data: [
      { title: 'Planned holiday sales (all stores)', columns: ['Month', 'Last year actual', 'This year plan', 'Stock-to-sales ratio'], rows: [['October', '$9.0M', '$9.3M', '4.0'], ['November', '$16.5M', '$17.4M', '3.2'], ['December', '$24.0M', '$25.0M', '2.0'], ['January', '$6.5M', '$6.4M', '3.5']] },
      { title: 'BYTEBOTS supply', columns: ['', 'Units'], rows: [['Early shipment (arrives Nov 1)', '60,000'], ['Possible reorder (arrives Dec 10 if placed by Nov 15)', 'up to 30,000'], ['Estimated demand at $34.99', '95,000–120,000']] },
    ],
    judgeQuestions: ['How would you decide which stores get the most BYTEBOTS?', 'What happens if BYTEBOTS demand fades by mid-December?'],
    solutionKeys: ['Forecast from last year adjusted by trend: e.g., +5% overall with BYTEBOTS as upside', 'Allocate by store sales history plus a 15–20% DC reserve; online reservation with store pickup', 'Limit 2 per customer; place the Nov 15 reorder only if week-1 sell-through tops ~60%', 'Cross-merchandise BYTEBOTS with accessories; plan January markdowns early'],
    trends: ['bopis', 'social-commerce', 'store-fleet'],
  },
  {
    id: 'stride',
    brief: "STRIDE ATHLETIC's sneaker shoppers buy once and rarely come back. Only 15% of loyalty members buy twice a year.",
    examplePlan: "Fit-first selling, a 30-day fit guarantee, and a sneaker trade-in for store credit to bring teens back.",
    title: 'Building a loyal clientele for sneakers',
    company: 'STRIDE ATHLETIC',
    area: 'Selling',
    roles: ['store operations manager', 'brand manager'],
    judge: 'vice president of retail',
    difficulty: 1,
    situation: [
      'STRIDE ATHLETIC is a 70-store athletic footwear chain. Teens and young adults make up 55% of its customers. Most shoppers buy one pair and don\'t come back for a year or more; many check prices online and buy elsewhere.',
      'STRIDE\'s associates are friendly but focus on finding sizes in the back room rather than helping shoppers choose. Its loyalty program has 400,000 members but only 15% made more than one purchase last year.',
      'The vice president of retail (judge) wants a plan to turn one-time buyers into regulars, using selling, the brand promise, and current trends.',
    ],
    tasks: [
      'Explain how STRIDE\'s selling approach should change',
      'Recommend how associates should present product features and benefits',
      'Define STRIDE\'s brand promise and how stores will keep it',
      'Recommend a way to use a current trend to build repeat visits',
    ],
    pis: [
      { code: 'SE:017', text: 'Explain the nature and scope of the selling function.', fits: 0, key: ['Selling determines and satisfies customer needs, not just finding sizes', 'Consultative selling: ask about activities, fit, and style', 'Selling builds relationships that lead to repeat business'] },
      { code: 'SE:109', text: 'Analyze product information to identify product features and benefits.', fits: 0, key: ['Turns features into benefits ("carbon plate → faster, less tired legs")', 'Uses product knowledge from vendors and training', 'Matches benefits to the customer\'s stated needs'] },
      { code: 'SE:828', text: 'Explain key factors in building a clientele.', fits: 1, key: ['Trust, personal service, remembering preferences, follow-up', 'Loyalty perks and reasons to return (new-release alerts, fit reminders)', 'Measures repeat purchase rate'] },
      { code: 'CR:001', text: 'Identify company\'s brand promise.', fits: 1, key: ['States a clear promise (e.g., "The right fit, every time")', 'Shows how every touchpoint delivers it', 'A promise must be kept consistently or it hurts trust'] },
      { code: 'NF:013', text: 'Describe current business trends.', fits: 1, key: ['Picks a relevant trend: resale/trade-in, social commerce, loyalty, personalization', 'Explains why it matters to STRIDE\'s teen customers', 'Turns it into a specific program'] },
    ],
    competencies: ['communication', 'collaboration', 'innovation'],
    data: [
      { title: 'Loyalty program snapshot', columns: ['Measure', 'Value'], rows: [['Members', '400,000'], ['Members with 2+ purchases in 12 months', '15%'], ['Average spend, 1-time buyer', '$96'], ['Average spend, repeat buyer', '$248'], ['Opted in to text alerts', '22%']] },
    ],
    judgeQuestions: ['How would you train associates to sell this way during busy weekends?', 'How will you know whether the trade-in program is worth it?'],
    solutionKeys: ['Fit-first consultative selling with a gait or fit check and personalized recommendations', 'Brand promise "The right fit, every time" backed by a 30-day fit guarantee', 'Sneaker trade-in for store credit (resale trend) plus member early access to drops', 'Goal: raise repeat-member share from 15% to 25% in a year'],
    trends: ['resale', 'loyalty', 'teens'],
  },
  {
    id: 'valumax',
    brief: "VALUMAX, a big-box discounter, is deciding whether to shrink its falling electronics department to grow beauty and wellness.",
    examplePlan: "Test moving 3,000 square feet to beauty in 50 stores, keep electronics accessories, and expand only if sales per square foot rise.",
    title: 'Which category deserves the space?',
    company: 'VALUMAX',
    area: 'Economics',
    roles: ['merchandising manager', 'customer insights manager'],
    judge: 'senior vice president of stores',
    difficulty: 3,
    situation: [
      'VALUMAX is a national big-box discount chain with 900 stores. Electronics sales are falling as shoppers buy online, while beauty and wellness has grown for three straight years. Each store has the same floor plan.',
      'VALUMAX is considering cutting electronics space by one-third and using it for a larger beauty and wellness department, including a partner brand shop-in-shop. Some executives worry that losing electronics will cost VALUMAX its reputation as a one-stop shop and send customers to competitors.',
      'The senior vice president of stores (judge) wants a recommendation on whether and how to reallocate the space, and how VALUMAX will compete and measure results.',
    ],
    tasks: [
      'Recommend whether VALUMAX should reallocate the space, using the data',
      'Explain how competition affects the decision',
      'Explain how prices and the product mix should change',
      'Explain how VALUMAX will connect this decision to results',
    ],
    pis: [
      { code: 'EC:012', text: 'Explain the concept of competition.', fits: 1, key: ['Defines competition: rivalry for the same customers (price and non-price)', 'Online sellers dominate electronics on price; beauty competitors are specialty stores', 'Recommends competing where VALUMAX can win'] },
      { code: 'EC:006', text: 'Describe the functions of prices in markets.', fits: 1, key: ['Prices ration goods and signal producers and sellers what is valued', 'Falling electronics prices and margins signal lower value of that space', 'Beauty\'s strong margins signal opportunity'] },
      { code: 'EC:010', text: 'Identify factors affecting a business\'s profit.', fits: 0, key: ['Profit depends on revenue, costs, and space productivity', 'Uses sales per square foot and margin per square foot to compare', 'Considers one-time remodel costs'] },
      { code: 'PM:003', text: 'Explain the concept of product mix.', fits: 0, key: ['Defines width, depth, and consistency', 'Keeps core electronics (chargers, headphones, gaming) and cuts slow lines', 'Adds depth in beauty and wellness while staying one-stop'] },
      { code: 'MK:019', text: 'Describe connections between company actions and results.', fits: 1, key: ['Links the space change to specific results: traffic, basket size, margin', 'Pilot and test before national rollout', 'Measures and adjusts'] },
    ],
    competencies: ['critical', 'decision', 'communication'],
    data: [
      { title: 'Department comparison (average store)', columns: ['', 'Electronics', 'Beauty & wellness'], rows: [['Selling square feet', '9,000', '4,500'], ['Annual sales', '$2.7M', '$2.25M'], ['Sales per sq ft', '$300', '$500'], ['Gross margin', '18%', '41%'], ['3-year sales trend', '−14%', '+26%'], ['Shoppers who also buy elsewhere in store', '47%', '68%']], note: 'Remodel cost: about $180,000 per store.' },
    ],
    judgeQuestions: ['What would you tell customers who come in looking for a TV that we no longer carry?', 'How long until the remodel pays for itself?'],
    solutionKeys: ['Reallocate about 3,000 sq ft after a 50-store pilot', 'Margin per sq ft: electronics $54 vs. beauty $205, which supports the move', 'Keep high-turn electronics accessories and offer endless-aisle ordering for big electronics', 'Payback math: added margin vs. $180,000 remodel; track traffic, basket size, sales per sq ft'],
    trends: ['store-fleet', 'retail-media', 'collabs'],
  },
]

export const CASE_BY_ID = Object.fromEntries(CASES.map((c) => [c.id, c]))
