/**
 * Judge follow-up questions for drill. Original, written to match the style of DECA's standard
 * judge questions (practical "how would you…" and "what if…" questions from a business executive).
 */
export interface JudgeQ {
  id: string
  cat: JudgeCat
  q: string
  /** What a strong answer includes. */
  tip: string
}

export type JudgeCat = 'Product & assortment' | 'Pricing & profit' | 'Vendors & buying' | 'Promotion' | 'Channels & omnichannel' | 'Customers & clientele' | 'Data & results' | 'Risk & ethics' | 'Implementation' | 'Curveballs'

const R = (cat: JudgeCat, rows: [string, string][]) => rows.map(([q, tip]) => ({ cat, q, tip }))

const RAW = [
  ...R('Product & assortment', [
    ['Why will customers choose this product over what competitors already sell?', 'Name one clear point of difference (exclusive, quality, story, fit) and the target customer it wins.'],
    ['How many different styles or colors should we carry, and why?', 'Pick breadth vs. depth; tie depth to proven sellers and the size or color curve of your customer.'],
    ['What would you cut from our current assortment to make room?', 'Use data: lowest sell-through or sales per square foot; keep traffic drivers.'],
    ['How does this fit the rest of our product mix?', 'Talk about consistency with target market and brand; mention cross-merchandising.'],
    ['Where did this product idea come from?', 'Cite the source: sales data, customer feedback, trend, competitor gap.'],
    ['What stage of the product life cycle is this product in, and what does that mean for us?', 'Name the stage and the matching move (e.g., growth = deepen and widen distribution).'],
    ['How will you test the idea before a full launch?', 'Concept test or test market in a limited number of stores with a clear success measure.'],
    ['Should this be a private label or a national brand product?', 'Compare margin, control, traffic draw, and exclusivity; recommend one.'],
    ['How will you keep the product from looking "generic"?', 'Packaging, design, a brand story, and quality standards.'],
    ['What would make this product feel worth the price to a parent paying for it?', 'Rational motives: durability, value, warranty, practicality.'],
    ['How will you make sure the product is safe?', 'Grades, standards, certifications, testing, and clear labels.'],
    ['What size and quantity mix would you send to a small store vs. a large store?', 'Allocate by store volume and history; small stores get a tighter, best-seller assortment.'],
  ]),
  ...R('Pricing & profit', [
    ['How did you decide on that price?', 'Cost, competition, demand, perceived value, and objective; show the markup.'],
    ['What markup will we earn at that price?', 'Do the math out loud: (retail − cost) ÷ retail.'],
    ['Why not just match the lowest competitor price?', 'Explain the margin risk; compete on value, exclusivity, or service.'],
    ['When would you mark the product down, and by how much?', 'Tie markdowns to sell-through triggers; early, smaller markdowns first.'],
    ['How does this plan increase profit, not just sales?', 'Revenue − expenses; margin dollars, fewer markdowns, better turnover.'],
    ['Should we use everyday low pricing or run sales?', 'Fit the strategy to the brand image and customer; commit to one.'],
    ['What will the plan cost, and when will it pay for itself?', 'Give a rough budget and a break-even or payback estimate.'],
    ['How would a 10% increase in our cost affect your recommendation?', 'Options: absorb, raise price, renegotiate, change the product spec.'],
    ['Is it ethical to advertise "compare at" prices?', 'Only when the comparison is real and fair; avoid deceptive claims.'],
    ['How would you price a bundle of these items?', 'Below the sum of the parts but above cost; bundles reduce comparison shopping.'],
    ['How will you keep our margin healthy if we have to discount?', 'Plan a higher initial markup, limit discounts to slow sellers, and work vendor markdown money.'],
    ['What price points would you offer, and why?', 'Price lining (good, better, best) so every customer finds a step.'],
  ]),
  ...R('Vendors & buying', [
    ['How would you choose between two vendors with the same price?', 'Reliability, quality, lead time, terms, and service; use a scorecard.'],
    ['What would you negotiate for with the vendor?', 'Cost, exclusivity, terms, markdown money, co-op ad funds; offer something in return.'],
    ['What will you do if the vendor delivers late?', 'Contingency stock, chargebacks per agreement, backup vendor, and communication with stores.'],
    ['How will you judge whether the vendor did a good job?', 'On-time %, fill rate, defect rate, and sales of their product, reviewed regularly.'],
    ['Would you buy from a domestic or an overseas vendor here?', 'Trade cost against lead time, minimums, tariffs, and currency risk.'],
    ['A vendor offers you a gift. What do you do?', 'Decline and follow company policy; gifts can bias decisions.'],
    ['How much should we buy for the first order?', 'Enough to test with a reserve for reorders; base it on the forecast and open-to-buy.'],
    ['Where will the money for this purchase come from?', 'Open-to-buy, shifting from slower categories, or vendor support.'],
    ['How would you protect the partnership if sales are disappointing?', 'Joint review, markdown support, adjust assortment; keep communication honest.'],
    ['What would make the partner brand want to work with us?', 'Access to our customers, volume, visibility, data, and a co-marketing plan.'],
    ['How will you keep national-brand vendors happy while growing our own brand?', 'Protect their best sellers\' space, joint promotions, and fair, honest reviews.'],
    ['What terms would you ask for on payment?', 'Cash discounts (e.g., 2/10, net 30), dating, and freight terms (FOB).'],
  ]),
  ...R('Promotion', [
    ['How would you best promote this to teenagers?', 'Where they spend time (short video, creators), a shareable hook, and in-store moments.'],
    ['Which part of the promotional mix matters most here, and why?', 'Pick one lead element and support it; tie the choice to the product and target.'],
    ['How will you get people talking about this without paying for ads?', 'Publicity, product seeding, referral codes, events, user-generated content.'],
    ['What would the headline of your first ad be?', 'Say it: short, benefit-driven, with a call to action.'],
    ['How will you make sure the promotion and the inventory line up?', 'Product in stores before ads run; allocation matched to the promotion\'s reach.'],
    ['How much would you spend on promotion?', 'A rough budget as a % of expected sales; prioritize the highest-return channels.'],
    ['What rules do we have to follow when we use influencers?', 'Clear disclosure of paid partnerships; no deceptive claims.'],
    ['How would you use our loyalty members in the launch?', 'Early access, exclusive previews, referral rewards.'],
    ['How would you promote this inside the store?', 'Power wall, endcaps, signage, cross-merchandising, trained associates.'],
    ['How will you reach the parents who pay?', 'Value messaging, email, and back-to-school timing.'],
    ['Would you run this as a limited-time offer? Why?', 'Urgency and scarcity vs. risk of disappointing shoppers; plan restocks or waitlists.'],
    ['How could our partner brand help promote this?', 'Co-op advertising, social posts to their followers, shared events.'],
  ]),
  ...R('Channels & omnichannel', [
    ['Should we sell this online, in stores, or both?', 'Usually both, connected: shared inventory and consistent price.'],
    ['How would buy online, pick up in store help us?', 'Saves shipping, drives store traffic and add-on sales.'],
    ['What if shoppers look at it in our store and buy it cheaper online?', 'Price-match policy, exclusives, service, and instant availability.'],
    ['How will stores know how much to expect and when?', 'Allocation plan, ship dates, and communication to store managers.'],
    ['Would you launch online first or in stores first?', 'Pick one and justify (buzz online vs. traffic in stores).'],
    ['How do we keep online and store prices consistent?', 'One pricing system and the same promotions across channels.'],
    ['How would you handle online returns of this product?', 'Return to any store, clear size info, and processes to restock quickly.'],
    ['What role should our app play?', 'Stock check, early access, alerts, and loyalty in one place.'],
    ['How could we reach customers who never visit our stores?', 'Social commerce, marketplaces, delivery partners, retail media.'],
    ['How would you get the product to stores fast if it sells out?', 'Distribution center reserve, ship-from-store, prioritized replenishment.'],
  ]),
  ...R('Customers & clientele', [
    ['Who exactly is the target customer?', 'Demographic plus psychographic description, with a quick example person.'],
    ['How will this bring customers back after the first purchase?', 'Follow-up, loyalty perks, new drops, personalized offers.'],
    ['What buying motives are you appealing to?', 'Name emotional and rational motives and connect them to the product.'],
    ['How will associates help sell this?', 'Training on features and benefits, suggestion selling, and a script for the launch.'],
    ['What will customers say about us after this launch?', 'State the brand promise they\'ll experience.'],
    ['How would you handle an upset customer who couldn\'t get one?', 'Apologize, offer waitlist or rain check, follow up personally.'],
    ['How will you know customers are satisfied?', 'Reviews, surveys, repeat purchases, Net Promoter-style questions.'],
    ['How will you keep our current customers while attracting new ones?', 'Don\'t alienate the core; give loyal members first access.'],
    ['What is our brand promise, in one sentence?', 'Say it simply and show how the plan keeps it.'],
    ['How would you use customer data without making people uncomfortable?', 'Permission, transparency, and clear value in return.'],
    ['How does customer service fit into this plan?', 'Service before, during, and after the sale builds relationships.'],
    ['What would make a teen choose our store over their phone?', 'Experiences, instant gratification, exclusives, social moments.'],
  ]),
  ...R('Data & results', [
    ['Is there any way to know if we made the right decision?', 'Name 2–3 metrics, a target for each, and when you\'ll check.'],
    ['What numbers would you check after the first week?', 'Sell-through, sales vs. plan, traffic, and social mentions.'],
    ['What research would you do before launching?', 'Quick primary research (survey, focus group) plus secondary data.'],
    ['What would tell you to stop or change the plan?', 'A clear trigger (e.g., sell-through under 30% by week 3).'],
    ['How would you measure whether the promotion worked?', 'Sales lift, redemption, new loyalty members, cost per new customer.'],
    ['What does success look like in 90 days?', 'Specific targets with numbers.'],
    ['How would you use our sales data to plan the next order?', 'Sell-through and weeks of supply by store, size, and color.'],
    ['What is a realistic sales forecast for this?', 'Base it on history and comparable items, adjusted for trends.'],
    ['How will you compare this to doing nothing?', 'Use a control group or last year\'s baseline.'],
    ['Which one number would you watch most closely, and why?', 'Pick one KPI and connect it to the objective.'],
    ['How would you track whether we built a younger clientele?', 'New loyalty members by age, repeat rate, share of sales from target ages.'],
    ['What would you report to me after 30 days?', 'A short scorecard: results vs. targets, what you learned, and the next adjustment.'],
  ]),
  ...R('Risk & ethics', [
    ['What is the biggest risk in your plan?', 'Name it honestly and give a backup plan.'],
    ['What happens if the product doesn\'t sell?', 'Markdown plan, vendor support, bundles, or off-price channels.'],
    ['What happens if it sells out immediately?', 'Reorder plan, waitlist, purchase limits, communication.'],
    ['How could this plan hurt our brand?', 'Identify the risk (quality, image, customer frustration) and the safeguard.'],
    ['Are there any legal issues we should think about?', 'Advertising claims, IP (no copying designs), data privacy, product safety.'],
    ['How would you keep resellers from buying up the stock?', 'Purchase limits, member access, online bot protection.'],
    ['What if a competitor copies the idea next month?', 'Exclusive contracts, speed, brand story, and the next drop.'],
    ['How would an economic downturn affect your plan?', 'Value focus, opening price points, smaller first buys.'],
    ['Is it fair to give loyalty members first access?', 'Yes if clear and open to anyone who joins; it rewards loyalty.'],
    ['How do we make sure the partner shares our values?', 'Due diligence, factory audits, contract terms, and reputation checks.'],
    ['How would you handle a quality problem after launch?', 'Pull, replace, refund, communicate honestly, and fix with the vendor.'],
    ['How would you reduce theft of a hot, high-demand item?', 'RFID or tags, smart placement, staffing, and limits, without making shopping miserable.'],
  ]),
  ...R('Implementation', [
    ['What are the first three things you would do Monday morning?', 'Concrete actions with owners.'],
    ['What is your timeline from approval to launch?', 'Key dates: order, delivery, promotion start, launch, review.'],
    ['Who needs to be involved to make this work?', 'Departments: buying, planning, marketing, stores, DC, vendor.'],
    ['How will you train store employees for the launch?', 'Short training on product knowledge and selling script, before launch.'],
    ['What would you need from me to make this happen?', 'A clear ask: budget, approval, or a decision.'],
    ['How would you roll this out to all stores?', 'Pilot, learn, then phased rollout.'],
    ['How much will this cost, roughly?', 'An estimate with the main cost drivers.'],
    ['How long would it take to see results?', 'Short-term and longer-term milestones.'],
    ['What would you do differently in stores that are underperforming?', 'Diagnose (traffic, conversion, assortment) and adjust.'],
    ['How does this plan support our company goals?', 'Connect to the goal named in the case (traffic, clientele, margin).'],
    ['How would you get store managers excited about this?', "Show what's in it for them (sales, traffic), give them tools, and recognize wins."],
    ['What could cause this launch to be late, and how would you prevent it?', 'Name the critical path (vendor, shipping, signage) and a checkpoint for each.'],
  ]),
  ...R('Curveballs', [
    ['If you could only do one part of your plan, which would it be?', 'Pick the highest-impact element and say why.'],
    ['What would you do with double the budget? Half?', 'Scale up the highest-return pieces; cut the nice-to-haves.'],
    ['Why should I trust your numbers?', 'Explain the source and assumptions; offer to validate with a test.'],
    ['Which of you would lead this project, and why?', 'Answer as a team: lead by role, with the other supporting.'],
    ['What did you consider and reject?', 'Name an alternative and the reason you rejected it. It shows decision making.'],
    ['How would your plan change for a store in a rural area?', 'Adjust assortment, promotion channels, and fulfillment.'],
    ['What do you think our competitors will do in response?', 'Predict one move and your counter.'],
    ['How is this idea different from what we\'ve tried before?', 'Point to what\'s new and what you learned from the past.'],
    ['Convince me in 30 seconds.', 'Problem, solution, benefit, proof, in four sentences.'],
    ['What would a customer say if they disliked this idea?', 'Show empathy and how the plan addresses it.'],
    ['How would you explain this plan to our store associates?', 'Simple language: what\'s changing, why, and what they do.'],
    ['What does "unique" mean for this solution?', 'Point to the part no competitor offers.'],
    ['Partner B, what would you add to that answer?', 'Build on it ("To add to that…"), don\'t repeat it. Shows collaboration.'],
    ['What is one thing you would want to research more?', 'Name a real unknown and how you\'d find out quickly.'],
  ]),
]

export const JUDGE_QUESTIONS: JudgeQ[] = RAW.map((r, i) => ({ id: `jq-${String(i + 1).padStart(3, '0')}`, ...r }))

export const JUDGE_CATS: JudgeCat[] = [...new Set(RAW.map((r) => r.cat))]
