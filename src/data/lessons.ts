/** Buying & merchandising lessons. Each ends with a quick check and BTDM case moves. */
export interface LessonCheck {
  q: string
  options: string[]
  answer: number
  why: string
}

export interface Lesson {
  id: string
  title: string
  topic: string
  pis: string[]
  minutes: number
  hook: string
  sections: { h: string; html: string }[]
  caseMoves: string[]
  mathTool?: string
  visual?: string
  checks: LessonCheck[]
}

export const LESSONS: Lesson[] = [
  {
    id: 'assortment', title: 'Assortment planning: breadth vs. depth', topic: 'M.assortment', pis: ['PM:003', 'PM:001'], minutes: 6,
    hook: 'An assortment is the promise of "we have what you came for." Planning it means deciding how many different things to carry and how much of each.',
    sections: [
      { h: 'Breadth and depth', html: '<p><mark>Breadth</mark> (variety) is how many different product lines, brands, or classes you carry. <mark>Depth</mark> is how many choices within each: sizes, colors, styles, and units.</p><ul><li><b>Broad & shallow:</b> many categories, few choices each. Convenience stores, dollar stores, and new-item tests.</li><li><b>Narrow & deep:</b> few categories, many choices each. Specialty stores that want to be the authority (a running store).</li><li><b>Broad & deep:</b> department stores and superstores. Expensive: lots of inventory.</li></ul>' },
      { h: 'What shapes the plan', html: '<ul><li><b>Target market:</b> who shops, what sizes and price points they need.</li><li><b>Store image and space:</b> a small store can\'t go broad and deep.</li><li><b>Budget (open-to-buy):</b> every extra color ties up money.</li><li><b>Merchandise type:</b> staples get a model stock and steady reorders; fashion items are bought once and sold through.</li><li><b>Sales history and trends:</b> what sold, at what sell-through, and what\'s rising.</li></ul>' },
      { h: 'Tools buyers use', html: '<p>A <mark>model stock plan</mark> lists the ideal quantity of a basic item by size and color. A <mark>SKU</mark> (one style, one size, one color) is the unit you plan and track. Buyers often keep a <b>core assortment</b> in every store and add <b>localized</b> items by climate or demographics.</p>' },
    ],
    caseMoves: [
      'Name the strategy: "We recommend a narrow, deep assortment of the exclusive: one hero item in 6 colors."',
      'Tie depth to the target market: "Teens buy sizes XS–XL, so we\'ll weight the size curve toward S and M."',
      'Test before you go broad: launch in 50 stores, expand if sell-through tops 60% in four weeks.',
    ],
    checks: [
      { q: 'A boutique carries only denim but stocks 40 fits and washes. Its assortment is', options: ['broad and shallow', 'narrow and deep', 'broad and deep', 'narrow and shallow'], answer: 1, why: 'One category (narrow) with many choices (deep).' },
      { q: 'Adding a new category of pet toys to a grocery store increases assortment', options: ['depth', 'breadth', 'turnover', 'shrink'], answer: 1, why: 'A new category adds variety, which is breadth.' },
      { q: 'Which item most likely gets a model stock plan?', options: ['A one-time holiday sweater', 'White crew socks', 'A designer collab drop', 'A prom dress'], answer: 1, why: 'Staples like socks have steady demand and are reordered by size and color.' },
    ],
  },
  {
    id: 'category', title: 'Category management', topic: 'M.category', pis: ['PM:001', 'PM:003', 'IM:184'], minutes: 6,
    hook: 'Category management treats each category, like snacks or juniors\' tops, as a mini business with its own goals, strategy, and scorecard.',
    sections: [
      { h: 'The idea', html: '<p>Instead of managing brands one at a time, a category manager plans the <mark>whole category</mark> around what shoppers need: assortment, pricing, space, and promotion. Vendors often help; a lead vendor may serve as <b>category captain</b>.</p>' },
      { h: 'Category roles', html: '<ul><li><b>Destination:</b> the store wants to be known for it; it draws trips (a teen retailer\'s graphic tees).</li><li><b>Routine:</b> everyday needs, priced competitively.</li><li><b>Seasonal:</b> back-to-school, holiday, swim.</li><li><b>Convenience:</b> fills out the trip (phone chargers at the register).</li></ul>' },
      { h: 'A simple category review', html: '<ol><li>Define the category and its role.</li><li>Assess performance: sales, margin, turnover, sell-through, share vs. competitors.</li><li>Set goals (e.g., +8% sales, +2 pts margin).</li><li>Choose tactics: assortment, pricing, space, promotion.</li><li>Implement, then <mark>measure and adjust</mark>.</li></ol><p>The <b>merchandise hierarchy</b> (department → class → subclass → style → SKU) lets you analyze at any level.</p>' },
    ],
    caseMoves: [
      'Assign a role: "We\'ll make teen accessories a destination category with an endcap and weekly new arrivals."',
      'Use a scorecard metric: "Success is sales per square foot above the department average within one season."',
    ],
    checks: [
      { q: 'A category the store wants to be famous for, which draws shoppers in on its own, plays which role?', options: ['Convenience', 'Routine', 'Destination', 'Seasonal'], answer: 2, why: 'Destination categories generate trips.' },
      { q: 'Which comes first in a category review?', options: ['Choosing promotions', 'Defining the category and its role', 'Ordering fixtures', 'Hiring a category captain'], answer: 1, why: 'You must know what the category is for before choosing tactics.' },
    ],
  },
  {
    id: 'vendors', title: 'Vendor selection & negotiation', topic: 'M.vendor', pis: ['OP:161', 'OP:162', 'OP:160', 'EI:062'], minutes: 7,
    hook: 'Great buyers don\'t just pick products; they pick partners. The 2025 BTDM case asked teams to choose a vendor.',
    sections: [
      { h: 'Choosing a vendor', html: '<p>Compare vendors on more than price:</p><ul><li><b>Quality</b> and consistency</li><li><b>Price and terms</b>: discounts, payment terms, freight (FOB)</li><li><b>Reliability</b>: on-time delivery, fill rate, lead time</li><li><b>Service</b>: returns, markdown money, co-op ad funds, training</li><li><b>Fit</b>: brand image, exclusivity, ethics and sustainability</li></ul><p>A <mark>weighted scorecard</mark> makes the decision objective: rate each vendor 1–5 on each factor, multiply by the factor\'s weight, and add.</p>' },
      { h: 'Terms to know', html: '<ul><li><b>Trade discount:</b> off list price for channel members.</li><li><b>Quantity discount:</b> lower unit cost for bigger orders.</li><li><b>Cash discount</b> "2/10, net 30": 2% off if paid in 10 days, full amount due in 30.</li><li><b>FOB shipping point</b> (buyer pays freight, owns goods in transit) vs. <b>FOB destination</b> (vendor pays).</li><li><b>Markdown money, co-op advertising, chargebacks, consignment.</b></li></ul>' },
      { h: 'Negotiating', html: '<p>Prepare: know your goals, your walk-away point, and the vendor\'s interests. Build trust by <mark>actively listening</mark>. Aim for a <b>win-win</b>: trade something you can give (a bigger order, endcap placement, longer commitment) for what you need (lower cost, exclusivity, faster delivery). Never accept gifts that could sway the decision.</p>' },
    ],
    caseMoves: [
      'Show your scorecard out loud: "We weighted reliability 30%, quality 30%, price 25%, and service 15%. Vendor B scored 4.3 vs. 3.6."',
      'Offer a win-win: "In exchange for 90-day exclusivity, we\'ll give their line an endcap in all 200 stores."',
      'Evaluate after: "We\'ll review on-time % and defect rate every quarter."',
    ],
    mathTool: 'markup',
    checks: [
      { q: 'With terms 2/10, net 30 on a $10,000 invoice, paying on day 8 costs', options: ['$10,000', '$9,800', '$9,000', '$10,200'], answer: 1, why: '2% off when paid within 10 days: $10,000 × 0.98.' },
      { q: 'Under FOB shipping point, who pays freight?', options: ['The vendor', 'The buyer', 'The carrier', 'The customer'], answer: 1, why: 'The buyer takes title at the vendor\'s dock and pays shipping.' },
      { q: 'Which best builds trust in a vendor negotiation?', options: ['Refusing to share any needs', 'Active listening', 'Making a final offer immediately', 'Accepting a gift'], answer: 1, why: 'Listening shows respect and uncovers win-win options.' },
    ],
  },
  {
    id: 'private-label', title: 'Private label vs. national brands', topic: 'M.privatelabel', pis: ['PM:206', 'PM:207', 'PM:042', 'CM:008'], minutes: 6,
    hook: 'Store brands are at record highs. Knowing when to push your own brand, when to lean on national brands, and when to collaborate is core buying strategy.',
    sections: [
      { h: 'The tradeoff', html: '<table><thead><tr><th></th><th>National brand</th><th>Private label</th></tr></thead><tbody><tr><td>Draws traffic</td><td>Yes: recognition</td><td>Only if it builds a following</td></tr><tr><td>Margin</td><td>Lower</td><td><mark>Higher</mark></td></tr><tr><td>Price to shopper</td><td>Higher</td><td>Usually lower</td></tr><tr><td>Exclusive?</td><td>No: shoppers compare prices</td><td><mark>Yes</mark>: builds store loyalty</td></tr><tr><td>Control</td><td>Vendor controls product & ads</td><td>Retailer controls everything</td></tr></tbody></table>' },
      { h: 'Tiers and collaborations', html: '<ul><li><b>Good-better-best</b> tiers: a value store brand, a mainstream one, and a <b>premium private label</b> that rivals national quality.</li><li><b>Exclusive / licensed brands:</b> a known name made only for one retailer.</li><li><b>Collaborations:</b> limited collections with designers or cult brands. Scarcity and buzz drive traffic.</li></ul>' },
      { h: 'Channel relationships', html: '<p>Launching a store brand next to a national brand can cause <mark>vertical channel conflict</mark>. Keep vendors on side with fair shelf space, honest comparison claims, and joint promotions.</p>' },
    ],
    caseMoves: [
      'Use corporate branding: "Our exclusive carries the store\'s brand promise: style for less."',
      'Address conflict: "We\'ll keep national brands at eye level in their sets so vendors keep their visibility."',
    ],
    checks: [
      { q: 'The main financial reason retailers grow private label is', options: ['higher margin', 'lower quality', 'no need for inventory', 'vendors pay for it'], answer: 0, why: 'Store brands usually carry higher gross margins.' },
      { q: 'A national brand complains when a retailer\'s store brand sits beside it at a lower price. This is', options: ['horizontal conflict', 'vertical conflict', 'a gray market', 'predatory pricing'], answer: 1, why: 'Conflict between different channel levels is vertical.' },
    ],
  },
  {
    id: 'pricing', title: 'Retail pricing strategies', topic: 'PI.strategies', pis: ['PI:001', 'PI:002', 'PI:015'], minutes: 7,
    hook: 'Price tells shoppers what to expect. Each strategy sends a different message and works for a different retailer.',
    sections: [
      { h: 'The big six', html: '<ul><li><b>Keystone:</b> retail = 2 × cost (100% on cost, 50% on retail). Simple starting point.</li><li><b>EDLP (everyday low pricing):</b> consistently low prices, few sales. Builds trust and steady traffic and cuts ad costs.</li><li><b>High-low:</b> higher regular prices with frequent sales. Creates urgency and excitement, but trains shoppers to wait.</li><li><b>Psychological (odd) pricing:</b> $19.99 feels like "under $20." Even pricing ($50) signals quality.</li><li><b>Loss leader:</b> priced at or below cost to drive traffic for other purchases. Must be legal and not deceptive.</li><li><b>Prestige pricing:</b> a high price signals luxury and quality.</li></ul>' },
      { h: 'More tools', html: '<ul><li><b>Price lining:</b> a few set price points (good $25 / better $40 / best $60).</li><li><b>Bundle pricing:</b> one price for a set; cuts comparison shopping.</li><li><b>Dynamic pricing:</b> prices change with demand, mostly online.</li><li><b>Penetration vs. skimming</b> for new products.</li></ul>' },
      { h: 'Ethics and law', html: '<p>Avoid <mark>bait-and-switch</mark>, deceptive "compare at" prices, <mark>price fixing</mark> with competitors, and <mark>predatory pricing</mark>. Rebates, clearance, and odd pricing are fine.</p>' },
    ],
    caseMoves: [
      'Pick and defend one strategy: "As a discount chain, we\'ll use EDLP on the exclusive at $14.99, an odd price under $15."',
      'Show the margin: "At $6.50 cost, $14.99 is a 57% markup on retail."',
    ],
    mathTool: 'markup',
    checks: [
      { q: 'A $30-cost item priced with keystone pricing retails for', options: ['$45', '$60', '$39', '$90'], answer: 1, why: 'Keystone doubles cost.' },
      { q: 'A store with weekly sale flyers and higher regular prices uses', options: ['EDLP', 'high-low pricing', 'prestige pricing', 'price fixing'], answer: 1, why: 'High-low alternates regular prices with frequent promotions.' },
      { q: 'Which is illegal?', options: ['Odd pricing', 'A mail-in rebate', 'Competitors agreeing on prices', 'Clearance markdowns'], answer: 2, why: 'Price fixing violates antitrust law.' },
    ],
  },
  {
    id: 'visual-merch', title: 'Visual merchandising & planograms', topic: 'M.visual', pis: ['PR:003', 'PR:001', 'SE:017'], minutes: 6,
    hook: 'Visual merchandising is the silent salesperson. It decides what shoppers notice, touch, and buy.',
    sections: [
      { h: 'Principles', html: '<ul><li><b>Eye level is buy level:</b> feature high-margin and new items there.</li><li><b>Focal point:</b> every display needs one spot that grabs the eye first.</li><li><b>Decompression zone:</b> shoppers adjust just inside the door; don\'t put key items there.</li><li><b>Power wall:</b> the first wall shoppers see, often to the right, gets seasonal or hero merchandise.</li><li><b>Cross-merchandising:</b> group related items to raise units per transaction.</li><li><b>Color blocking, repetition, and lighting</b> make displays readable from a distance.</li></ul>' },
      { h: 'Planograms', html: '<p>A <mark>planogram</mark> is a diagram showing exactly where each product sits on a fixture and how many <b>facings</b> it gets. It keeps hundreds of stores consistent, gives best-sellers the space they earn, and makes resets fast.</p>' },
      { h: 'Fixtures and signage', html: '<p>Gondolas, endcaps, tables, four-ways, and wall systems each suit different merchandise. Signs should do one job: price, direction, or brand story. Clear signage reduces questions and supports self-service.</p>' },
    ],
    caseMoves: [
      'Place it: "The exclusive gets the front-right power wall and an endcap by checkout for impulse add-ons."',
      'Cross-merchandise: "We\'ll pair the water bottles with matching stickers and straps to lift units per transaction."',
    ],
    checks: [
      { q: 'A diagram showing product placement and facings on a shelf is a', options: ['floor plan', 'planogram', 'merchandise plan', 'model stock'], answer: 1, why: 'Planograms map exact shelf placement.' },
      { q: 'Where should high-margin items usually go on a shelf?', options: ['Bottom shelf', 'Eye level', 'Top shelf', 'Back room'], answer: 1, why: 'Eye level gets the most attention.' },
    ],
  },
  {
    id: 'inventory', title: 'Inventory control', topic: 'M.inventory', pis: ['OP:031', 'OP:015', 'CM:004'], minutes: 7,
    hook: 'Too much inventory ties up cash and leads to markdowns. Too little causes stockouts and lost sales. Inventory control finds the balance.',
    sections: [
      { h: 'Perpetual vs. periodic', html: '<ul><li><b>Perpetual:</b> a running count updated with every sale and receipt, usually through POS. Real-time but still needs counts to catch errors and shrink.</li><li><b>Periodic:</b> physical counts at set times (monthly, yearly). Cheaper to run but blind between counts.</li></ul><p>Most retailers use perpetual systems plus <mark>cycle counts</mark> (counting a section at a time) and an annual physical inventory.</p>' },
      { h: 'Keeping the right amount', html: '<ul><li><b>Reorder point</b> = (daily sales × lead time) + safety stock.</li><li><b>Safety stock</b> cushions against late deliveries and demand spikes.</li><li><b>ABC analysis:</b> control your A items (few SKUs, most sales) most tightly.</li><li><b>Just-in-time:</b> small, frequent orders lower carrying costs but need reliable vendors.</li></ul>' },
      { h: 'Shrink and technology', html: '<p><mark>Shrinkage</mark> = book inventory − physical inventory, from theft, fraud, damage, and errors. <b>RFID</b> tags let stores count inventory in minutes and improve accuracy; <b>UPC</b> barcodes identify SKUs at checkout.</p>' },
    ],
    caseMoves: [
      'Protect the launch: "We\'ll hold 15% of units in the DC as safety stock and replenish top stores weekly."',
      'Use tech: "RFID on the exclusive keeps sizes in stock and cuts shrink."',
    ],
    mathTool: 'reorder',
    visual: 'inventory-flow',
    checks: [
      { q: 'A system that updates counts with each sale is', options: ['periodic', 'perpetual', 'consignment', 'JIT'], answer: 1, why: 'Perpetual systems keep a running count.' },
      { q: 'Daily sales 10, lead time 7 days, safety stock 20. Reorder point?', options: ['70', '90', '27', '140'], answer: 1, why: '(10 × 7) + 20 = 90.' },
      { q: 'Book inventory $50,000; physical count $48,500. Shrinkage?', options: ['$1,500', '$98,500', '$48,500', '$3,000'], answer: 0, why: 'Book − physical.' },
    ],
  },
  {
    id: 'seasonal', title: 'Seasonal & merchandise planning', topic: 'M.seasonal', pis: ['MP:013', 'MP:006', 'FI:106'], minutes: 8,
    hook: 'Buyers plan seasons months ahead. The six-month merchandise plan is the budget that keeps sales, stock, and purchases in balance.',
    sections: [
      { h: 'The planning calendar', html: '<p>Retail years usually run on a <b>4-5-4 calendar</b> so weeks compare year to year. Two big seasons, spring (Feb–Jul) and fall (Aug–Jan), each get a <mark>six-month plan</mark>. Buyers place most orders <b>pre-season</b>, then use <b>open-to-buy</b> for in-season reorders and hot items.</p>' },
      { h: 'The six-month plan', html: '<ol><li>Forecast season sales, then spread them by month.</li><li>Plan <b>BOM stock</b> with a stock-to-sales ratio (BOM = sales × ratio).</li><li>EOM for each month = next month\'s BOM.</li><li>Plan <b>reductions</b> (markdowns, discounts, shrink).</li><li><mark>Planned purchases = sales + reductions + EOM − BOM.</mark></li><li><b>Open-to-buy</b> = planned purchases − on order.</li></ol>' },
      { h: 'Seasonal flow', html: '<p>Stock builds before the peak, then runs down. Transition merchandise bridges seasons. Plan markdowns before the season ends so goods sell through, and leave OTB for trend reorders.</p>' },
    ],
    caseMoves: [
      'Fund the idea: "We\'ll use July open-to-buy for the back-to-school exclusive, about $18,000 at retail per store group."',
      'Time it: "Product lands July 15, peaks the first two weeks of August, and moves to markdown September 15."',
    ],
    mathTool: 'six-month-plan',
    checks: [
      { q: 'Planned purchases =', options: ['Sales + EOM − BOM − reductions', 'Sales + reductions + EOM − BOM', 'BOM − EOM', 'Sales × stock-to-sales ratio'], answer: 1, why: 'Purchases replace what you sell and reduce, adjusted for the stock change.' },
      { q: 'A month\'s EOM stock equals', options: ['last month\'s BOM', 'next month\'s BOM', 'the month\'s sales', 'zero'], answer: 1, why: 'Inventory at the end of one month is the start of the next.' },
    ],
  },
  {
    id: 'omnichannel', title: 'Omnichannel retail', topic: 'M.omni', pis: ['CM:003', 'CM:007', 'PR:100', 'CR:003'], minutes: 6,
    hook: 'Shoppers don\'t think in channels. They browse on TikTok, check stock in the app, and pick up in store, and expect it all to work together.',
    sections: [
      { h: 'Multichannel vs. omnichannel', html: '<p><b>Multichannel</b> means selling through several channels that run separately. <mark>Omnichannel</mark> connects them: shared inventory, one customer profile, consistent prices and promotions, and returns anywhere.</p>' },
      { h: 'Key services', html: '<ul><li><b>BOPIS</b> (buy online, pick up in store) and curbside</li><li><b>Ship-from-store:</b> stores fill nearby online orders</li><li><b>Endless aisle:</b> order unstocked items from a kiosk or associate device</li><li><b>BORIS:</b> buy online, return in store</li><li><b>Drop shipping:</b> vendor ships directly to the customer</li></ul>' },
      { h: 'Shopper behaviors', html: '<p><b>Showrooming:</b> see it in store, buy online elsewhere. <b>Webrooming:</b> research online, buy in store. Omnichannel retailers win both by matching online prices, showing local stock, and making pickup fast.</p>' },
    ],
    caseMoves: [
      'Connect channels: "Launch online first with a 48-hour loyalty early access, then in stores, with free pickup."',
      'Measure it: "Track pickup add-on rate and online-to-store conversion."',
    ],
    checks: [
      { q: 'Researching online and then buying in a store is', options: ['showrooming', 'webrooming', 'drop shipping', 'BOPIS'], answer: 1, why: 'Webrooming = web research, store purchase.' },
      { q: 'What makes retailing omnichannel rather than multichannel?', options: ['Having a website', 'Connected inventory, data, and experience across channels', 'Selling on social media', 'Having more stores'], answer: 1, why: 'Omnichannel is about integration.' },
    ],
  },
  {
    id: 'markdowns', title: 'Markdown strategy', topic: 'M.markdown', pis: ['PI:002', 'MP:001', 'FI:106'], minutes: 6,
    hook: 'Markdowns aren\'t failures; they\'re a tool. The goal is to sell through at the highest total margin, not to avoid markdowns entirely.',
    sections: [
      { h: 'Why markdowns happen', html: '<ul><li><b>Buying errors:</b> wrong quantity, colors, or sizes</li><li><b>Pricing errors:</b> priced too high</li><li><b>Selling errors:</b> poor display or weak promotion</li><li><b>Planned:</b> end of season, clearance, promotional events</li></ul>' },
      { h: 'Timing', html: '<p><mark>Early markdowns</mark> (smaller cuts while demand exists) usually cost less total margin than <b>late markdowns</b> (deep cuts after the season). Many retailers follow a <b>markdown cadence</b>: 25% → 40% → 60%, reviewed weekly using sell-through. Promotional markdowns are temporary; permanent markdowns are clearance.</p>' },
      { h: 'Measuring', html: '<ul><li><b>Off-retail %</b> = markdown $ ÷ original price (what shoppers see)</li><li><b>Markdown % of sales</b> = total markdown $ ÷ net sales (how buyers plan)</li><li>Markdowns reduce maintained markup, so buyers plan a higher initial markup to cover them.</li></ul><p>Vendors may provide <b>markdown money</b>; leftover goods may go to <b>off-price</b> retailers.</p>' },
    ],
    caseMoves: [
      'Plan the exit: "If sell-through is under 40% by week 4, we take 25% off; anything left by week 8 moves to clearance."',
      'Protect margin: "We priced at a 55% initial markup, so even with markdowns of 10% of sales we maintain about 50%."',
    ],
    mathTool: 'markdown',
    visual: 'markdown-timing',
    checks: [
      { q: 'A $80 jacket marked down to $60 has an off-retail % of', options: ['20%', '25%', '33.3%', '75%'], answer: 1, why: '$20 ÷ $80 = 25%.' },
      { q: 'Why take markdowns early?', options: ['To lower the original cost', 'Goods sell while demand still exists, costing less margin overall', 'To avoid all promotions', 'Vendors require it'], answer: 1, why: 'Smaller, earlier cuts usually beat deep late clearance.' },
    ],
  },
  {
    id: 'kpis', title: 'Retail KPIs', topic: 'M.kpi', pis: ['FI:106', 'IM:184', 'MK:019'], minutes: 7,
    hook: 'Judges love a solution with a scoreboard. These are the numbers buyers and store teams live by.',
    sections: [
      { h: 'Sales KPIs', html: '<ul><li><b>Comparable (same-store) sales:</b> growth at stores open 1+ year</li><li><b>Conversion rate:</b> buyers ÷ visitors</li><li><b>Average transaction value (ATV):</b> sales ÷ transactions</li><li><b>Units per transaction (UPT)</b></li><li><b>Sales per square foot:</b> space productivity</li></ul>' },
      { h: 'Inventory & profit KPIs', html: '<ul><li><b>Sell-through %:</b> units sold ÷ units available</li><li><b>Stock turnover:</b> sales ÷ average inventory</li><li><b>Weeks of supply</b></li><li><b>In-stock rate</b></li><li><b>Gross margin %</b> and <b>maintained markup %</b></li><li><b>GMROI:</b> gross margin $ ÷ average inventory at cost</li><li><b>Shrink %</b></li></ul>' },
      { h: 'Picking the right KPI', html: '<p>Match the KPI to the goal. Building a younger clientele? Track <mark>new loyalty members ages 14–24</mark> and repeat purchase rate. Launching an exclusive? Track <mark>sell-through</mark> and social buzz. Improving profit? Track <mark>gross margin</mark> and GMROI.</p>' },
    ],
    caseMoves: [
      'Always end with 2–3 metrics and a timeline: "In 90 days we expect 65% sell-through, 10,000 new teen loyalty members, and a 2-point lift in category margin."',
    ],
    mathTool: 'turnover',
    checks: [
      { q: 'Which KPI best shows how fast a new item is selling?', options: ['Sell-through', 'Shrink %', 'Comparable sales', 'Exchange rate'], answer: 0, why: 'Sell-through compares units sold with units available.' },
      { q: 'GMROI compares gross margin with', options: ['net sales', 'average inventory at cost', 'number of stores', 'markdowns'], answer: 1, why: 'GMROI = gross margin $ ÷ average inventory at cost.' },
    ],
  },
]

export const LESSON_BY_ID = Object.fromEntries(LESSONS.map((l) => [l.id, l]))
