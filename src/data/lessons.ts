/**
 * Buying & merchandising lessons plus case-skills lessons (research, customers, goals, risk, data).
 * Each ends with a quick check and BTDM case moves. All wording is original.
 */
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
  /** 'case' = case skills; default = buying & merchandising. */
  group?: 'case'
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

  // ---------------- Case skills ----------------
  {
    id: 'data-arguments', group: 'case', title: 'Use the case data to win', topic: 'S.data', pis: ['NF:216', 'NF:093', 'NF:278', 'CO:061', 'CO:204'], minutes: 6,
    hook: 'BTDM cases give you numbers on purpose. Judges reward teams that turn a number into a reason, not teams that read the table aloud.',
    sections: [
      { h: 'Sum up the data before you plan', html: '<ol><li><b>Sort it.</b> Group the case numbers by store, month, product, or age group so patterns show.</li><li><b>Compare.</b> What is up, what is down, and what doesn\'t fit? An <mark>outlier</mark> (one store or month far from the rest) is worth a sentence.</li><li><b>Keep two or three.</b> Use only the findings that change your decision. Skip the rest.</li><li><b>Ask why.</b> Does the number back up what the company assumed, or prove it wrong?</li></ol>' },
      { h: 'Claim, number, meaning, action', html: '<p>Say your point first, then prove it:</p><ul><li><b>Claim:</b> "Teens are our fastest-growing shoppers."</li><li><b>Number:</b> "Sales to 14- to 18-year-olds grew 22% while total sales grew 4%."</li><li><b>Meaning:</b> "Most of our growth is coming from them."</li><li><b>Action:</b> "So the launch budget goes to short video, not print."</li></ul><p>An <mark>if-then</mark> line works too: "If most of our buyers start on their phones, then we launch in the app first."</p>' },
      { h: 'Make numbers easy to hear', html: '<ul><li>One or two numbers per point. Round them: "about 75%," not "74.6%."</li><li>Before and after beats a long list: "Returns fell from 12% to 7%."</li><li>Words are fine when exact numbers don\'t matter: "most shoppers."</li><li>Don\'t <mark>cherry-pick</mark>. If a number hurts your plan, name it and answer it.</li></ul><p>Picking a visual: <b>bar</b> compares groups, <b>line</b> shows change over time, <b>pie</b> shows parts of a whole, a <b>table</b> gives exact values.</p>' },
      { h: 'Answer pushback with data', html: '<ol><li>Restate the other view fairly: "Discounts do bring people in."</li><li>Give the number that changes the picture.</li><li>Say what it means.</li><li>Offer the stronger option: "So we\'ll put the money into faster pickup instead of a bigger discount."</li></ol>' },
    ],
    caseMoves: [
      'Open your solution with the case\'s own number: "Online sales grew 30% while stores stayed flat, so…"',
      'End each PI with a "so": number, what it means, what we\'ll do.',
      'If the judge asks "Why should I trust your numbers?", say where they came from and offer to test small first.',
    ],
    checks: [
      { q: 'What is the strongest way to use data in your presentation?', options: ['State your point, give one key number, and explain what it means', 'Read every number in the case table', 'Show numbers and let the judge decide what they mean', 'Avoid numbers so the judge isn\'t confused'], answer: 0, why: 'Claim first, then the number, then what it means for the plan.' },
      { q: 'Which line is easiest for a judge to follow?', options: ['Returns fell from about 12% to 7% after we added size charts.', 'Returns were 12.3%, 11.8%, 10.4%, 9.1%, 8.2%, then 7.0%.', 'Returns changed a lot.', 'Returns are a KPI.'], answer: 0, why: 'One rounded before-and-after comparison, tied to a cause.' },
      { q: 'You want to show how website visits changed over six months. Which visual fits best?', options: ['Line graph', 'Pie chart', 'A single number', 'Organization chart'], answer: 0, why: 'Line graphs show change over time.' },
    ],
  },
  {
    id: 'research', group: 'case', title: 'Research, competitors & benchmarks', topic: 'S.research', pis: ['IM:281', 'IM:428', 'IM:292', 'EC:012', 'NF:015'], minutes: 7, visual: 'research',
    hook: 'Every strong plan answers "How do you know?" Show the judge you\'d check the facts and the competition before spending money.',
    sections: [
      { h: 'Primary vs. secondary data', html: '<table><thead><tr><th></th><th>Primary</th><th>Secondary</th></tr></thead><tbody><tr><td>What it is</td><td>You collect it now, for this question</td><td>Already collected by someone, for another purpose</td></tr><tr><td>Examples</td><td>Surveys, interviews, focus groups, observation, store tests</td><td>Census data, trade groups like the NRF, industry reports, news, competitors\' annual reports, your own past sales records</td></tr><tr><td>Good</td><td>Specific and current</td><td><mark>Fast and cheap</mark></td></tr><tr><td>Watch out</td><td>Costs time and money</td><td>May be old or not quite fit</td></tr></tbody></table><p><b>Check primary data:</b> does the sample look like the real customers, and are the questions neutral (no <mark>leading questions</mark>)? <b>Check secondary data:</b> who published it, how recent it is, why it was collected, and whether another source agrees.</p>' },
      { h: 'Competitor research', html: '<p>Three kinds of competitors:</p><ul><li><b>Direct:</b> same kind of product, same customers (two sneaker brands).</li><li><b>Indirect:</b> a different product that meets the same need (a bookstore vs. an audiobook app).</li><li><b>New entrants:</b> startups and brands moving into your space.</li></ul><p>Compare them on four things: <mark>price strategy</mark>, how they win customers (social, loyalty, referrals, ads), how their product is different (quality, tech, customization, sustainability, service), and their <mark>positioning</mark> (cheapest, best quality, most innovative, best experience, most responsible). Sources: their sites and apps, reviews, public ad libraries, their emails, and visiting their stores (mystery shopping).</p>' },
      { h: 'Benchmarking', html: '<p><mark>Benchmarking</mark> compares your numbers with a standard to find the gap.</p><ul><li><b>Competitive:</b> against a direct rival.</li><li><b>Industry:</b> against the industry average.</li><li><b>Internal:</b> your stores or departments against each other.</li><li><b>Best practice:</b> against a leader in any industry.</li></ul><p>Steps: pick the KPI, find the benchmark, measure the gap, set a target, act, then measure again. Example: "Our stores average 1.6 units per transaction; our top stores average 2.3. Better cross-merchandising can close part of that gap."</p>' },
    ],
    caseMoves: [
      'Name a research step: "Before the full launch, we\'ll survey 500 loyalty members and test in 10 stores."',
      'Benchmark out loud: "Teens are 9% of our sales but about 20% of our closest competitor\'s. That\'s the gap we\'re closing."',
      'Name the real competitor: "Our biggest rival isn\'t the store next door. It\'s the shopping app on their phone."',
    ],
    checks: [
      { q: 'A retailer looks up Census data on household income in a new city. This is', options: ['secondary data', 'primary data', 'a focus group', 'an experiment'], answer: 0, why: 'The government collected it for another purpose; the retailer is reusing it.' },
      { q: 'For a bookstore, an audiobook app is', options: ['an indirect competitor', 'a direct competitor', 'a vendor', 'a channel member'], answer: 0, why: 'A different product that meets the same need.' },
      { q: 'Comparing each store\'s sales per square foot with the chain\'s top stores is', options: ['internal benchmarking', 'primary research', 'price fixing', 'psychographic segmentation'], answer: 0, why: 'Benchmarking inside the same company is internal.' },
    ],
  },
  {
    id: 'segments', group: 'case', title: 'Target customers & personas', topic: 'S.segment', pis: ['MP:003', 'MP:001', 'CO:084', 'MK:019'], minutes: 6, visual: 'segmentation',
    hook: '"Who exactly is the customer?" comes up in almost every case. A sharp answer names a segment, describes one person, and ties every choice back to them.',
    sections: [
      { h: 'Four ways to divide a market', html: '<ul><li><mark>Demographic</mark>: who they are (age, income, gender, family, job).</li><li><mark>Geographic</mark>: where they are (region, climate, city or rural).</li><li><mark>Psychographic</mark>: how they think (values, interests, lifestyle, personality).</li><li><mark>Behavioral</mark>: what they do (how often they buy, loyalty, benefits wanted, occasions, price sensitivity).</li></ul><p>Exam tip: "rate of use" and "loyalty" are behavioral; "lifestyle" and "values" are psychographic.</p>' },
      { h: 'Why people buy', html: '<ul><li><b>Emotions:</b> excitement, belonging, and fear of missing out drive many purchases.</li><li><b>Other people:</b> friends, family, creators, and reviews. Seeing others buy is <mark>social proof</mark>.</li><li><b>Culture and subculture:</b> shape tastes and what feels "normal" to buy.</li><li><b>Technology:</b> personal recommendations, virtual try-on, and social shopping change how people find products.</li></ul>' },
      { h: 'Build a persona', html: '<p>A <mark>persona</mark> is one realistic, named customer built from at least two kinds of segmentation. Example: <i>"Maya, 16, lives in a suburb, spends birthday and job money, buys what her friends post, browses on her phone, then picks up in store."</i> Add one need, one frustration, and where to reach her. Update it as real data comes in.</p>' },
      { h: 'Tie every decision to the customer', html: '<p>Use four beats: <b>decision</b> → <b>because</b> (customer trait) → <b>proof</b> (a number) → <b>result</b>.</p><p><i>"We\'ll launch on short video, because our core shopper is 14 to 18. The case shows most of their visits start on mobile, so we expect 5,000 new loyalty sign-ups in the first month."</i></p>' },
    ],
    caseMoves: [
      'Describe your customer in one breath: age, where they shop, what they care about, and what they want from this store.',
      'Use "decision, because, proof, result" for every big choice.',
    ],
    checks: [
      { q: 'Grouping customers by how often they buy and how loyal they are is', options: ['behavioral segmentation', 'demographic segmentation', 'geographic segmentation', 'psychographic segmentation'], answer: 0, why: 'Usage rate and loyalty describe what people do.' },
      { q: 'Which is a psychographic trait?', options: ['Cares about sustainability and the outdoors', 'Lives in Denver', 'Is 35 to 44 years old', 'Buys twice a month'], answer: 0, why: 'Values and lifestyle are psychographic.' },
      { q: 'A persona is most useful when it', options: ['combines several traits into one realistic customer', 'lists every customer the store has', 'uses only age', 'never changes'], answer: 0, why: 'Combining traits makes the customer specific enough to plan for.' },
    ],
  },
  {
    id: 'goals', group: 'case', title: 'Objectives, actions & metrics', topic: 'S.goals', pis: ['MP:006', 'PD:254', 'FI:065', 'MK:019'], minutes: 6,
    hook: 'A plan the judge can picture has a clear goal, the steps to reach it, a date for each step, and a number that proves it worked.',
    sections: [
      { h: 'Write a SMART objective', html: '<p><mark>SMART</mark>: specific, measurable, attainable, relevant (or results-oriented), and time-bound.</p><ul><li><b>Weak:</b> "Get more teen customers."</li><li><b>Strong:</b> "Grow loyalty members ages 14 to 18 from 40,000 to 55,000 by June 30."</li></ul>' },
      { h: 'Turn the goal into actions', html: '<p>Each action starts with a verb and has a <b>department or role</b> at the company that owns it, a <b>deadline</b>, and something you can <b>count</b>.</p><ul><li>Marketing starts a creator campaign by March 1. <i>Measure: sign-ups per post.</i></li><li>Stores add a QR sign-up at checkout by February 15. <i>Measure: sign-ups per store.</i></li><li>Buying adds two members-only drops. <i>Measure: sell-through.</i></li></ul><p>If an action doesn\'t move the objective, cut it.</p>' },
      { h: 'Milestones and measures', html: '<p><mark>Milestones</mark> are checkpoints, like a 30-60-90 day plan. Use both kinds of measures:</p><ul><li><b>Quantitative</b> (numbers): sales, sell-through, new members.</li><li><b>Qualitative</b> (opinions): survey comments, reviews, staff feedback.</li></ul><p>Decide ahead of time what you\'ll change if a checkpoint is missed: switch channels, retrain staff, or adjust the price.</p>' },
    ],
    caseMoves: [
      'Say one SMART objective early so the judge knows the finish line.',
      'Give a 30-60-90 day timeline, one sentence each.',
      'Close with the two or three numbers you\'ll check, and when.',
    ],
    checks: [
      { q: 'Which objective is SMART?', options: ['Raise online sales of the exclusive 15% by December 31', 'Do better online', 'Become the best store anywhere', 'Sell more soon'], answer: 0, why: 'It is specific, measurable, and has a deadline.' },
      { q: 'A milestone is', options: ['a checkpoint that shows progress toward a goal', 'the final budget', 'a kind of competitor', 'a markdown'], answer: 0, why: 'Milestones break a timeline into checkpoints.' },
      { q: 'Which is a qualitative measure?', options: ['What customers write in survey comments', 'Units sold', 'Sell-through %', 'Number of new members'], answer: 0, why: 'Qualitative measures capture opinions and feelings, not counts.' },
    ],
  },
  {
    id: 'risk', group: 'case', title: 'Risk: plan for what could go wrong', topic: 'S.risk', pis: ['SM:075', 'SM:076', 'EC:011'], minutes: 6,
    hook: '"What\'s the biggest risk in your plan?" is one of the most common judge questions. Teams with a ready answer look prepared, not surprised.',
    sections: [
      { h: 'Spot the risks', html: '<ul><li><b>Financial:</b> costs run over, sales fall short.</li><li><b>Operational:</b> a vendor ships late, stores run out.</li><li><b>Market:</b> a competitor copies you, the trend fades.</li><li><b>Legal:</b> ad claims, privacy, product safety.</li><li><b>Reputation:</b> backlash or a creator partnership gone wrong.</li><li><b>Technology:</b> a data breach or a site crash on launch day.</li><li><b>Natural:</b> storms and disasters.</li></ul><p>Exam tip: business risks are often grouped as <mark>economic, natural, and human</mark>.</p>' },
      { h: 'Rank them: likelihood × impact', html: '<table><thead><tr><th>Likelihood ↓ / Impact →</th><th>Low</th><th>Medium</th><th>High</th></tr></thead><tbody><tr><td><b>High</b></td><td>Watch closely</td><td>Act</td><td><mark>Act now</mark></td></tr><tr><td><b>Medium</b></td><td>Watch</td><td>Reduce it</td><td>Manage actively</td></tr><tr><td><b>Low</b></td><td>Accept</td><td>Watch</td><td>Have a backup plan</td></tr></tbody></table><p>Spend your effort on the top-right corner first.</p>' },
      { h: 'Four ways to respond', html: '<ul><li><mark>Avoid</mark>: don\'t do the risky thing (drop an unsafe product).</li><li><mark>Reduce</mark>: lower the chance or the damage (test small, quality checks, safety stock).</li><li><mark>Transfer</mark>: shift the cost to someone else (insurance, a vendor contract with late-delivery penalties).</li><li><mark>Accept</mark>: live with small risks and keep watching.</li></ul><p>A <b>contingency plan</b> says what you\'ll do if the risk happens, and a <b>trigger</b> tells you when to switch to it. Review risks regularly; they change.</p>' },
    ],
    caseMoves: [
      'Name one real risk and its fix: "The biggest risk is late delivery. We\'ll hold 10% safety stock and keep a second vendor approved."',
      'Give a trigger: "If sell-through is under 30% by week 3, we switch to plan B."',
    ],
    checks: [
      { q: 'Buying insurance against storm damage is which risk response?', options: ['Transfer', 'Avoid', 'Accept', 'Reduce'], answer: 0, why: 'Insurance shifts the cost of the loss to the insurer.' },
      { q: 'A risk that is likely and would do major damage should be', options: ['handled right away', 'ignored', 'accepted with no plan', 'reviewed next year'], answer: 0, why: 'High likelihood plus high impact is the top priority.' },
      { q: 'Approving a second vendor in case the first one ships late is', options: ['a contingency plan', 'price fixing', 'a product recall', 'secondary data'], answer: 0, why: 'It is a ready backup if the risk happens.' },
    ],
  },
]

export const LESSON_BY_ID = Object.fromEntries(LESSONS.map((l) => [l.id, l]))
