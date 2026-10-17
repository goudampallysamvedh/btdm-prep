/**
 * Judge follow-up questions for practice. Original, written to match the style of DECA's standard
 * judge questions. Kept to 80 distinct questions (no near-duplicates) so the set is learnable.
 * Practice them against a case: the drill shows a case and your plan above each question.
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
    ['Why will customers choose this over what competitors already sell?', 'Name one clear point of difference (exclusive, quality, story, fit) and the customer it wins.'],
    ['How many different styles or colors should we carry, and why?', 'Pick breadth vs. depth; tie depth to proven sellers and your customer\'s sizes and colors.'],
    ['What would you cut from our current assortment to make room?', 'Use data: lowest sell-through or sales per square foot; keep the traffic drivers.'],
    ['Where did this idea come from?', 'Cite the source: sales data, customer feedback, a trend, or a competitor gap.'],
    ['What stage of the product life cycle is this in, and what does that mean for us?', 'Name the stage and the matching move (e.g., growth = deepen and widen distribution).'],
    ['How will you test the idea before a full launch?', 'A small test in a few stores, with a clear number that means "go."'],
    ['Should this be our own store brand or a national brand?', 'Compare margin, control, traffic draw, and exclusivity; recommend one.'],
    ['How will you make sure the product is safe and good quality?', 'Standards, testing, certifications, clear labels, and a guarantee.'],
  ]),
  ...R('Pricing & profit', [
    ['How did you decide on that price?', 'Cost, competition, demand, perceived value, and your goal; show the markup.'],
    ['What markup will we earn at that price?', 'Do the math out loud: (retail − cost) ÷ retail.'],
    ['Why not just match the lowest competitor price?', 'Explain the margin risk; compete on value, exclusivity, or service instead.'],
    ['When would you mark it down, and by how much?', 'Tie markdowns to sell-through; start early and small.'],
    ['How does this plan increase profit, not just sales?', 'Revenue − expenses: margin dollars, fewer markdowns, faster turnover.'],
    ['What will this cost, and when will it pay for itself?', 'A rough budget and a simple payback or break-even estimate.'],
    ['How would a 10% increase in our cost change your plan?', 'Options: absorb it, raise price, renegotiate, or change the product.'],
    ['Should we use everyday low prices or run sales?', 'Fit the strategy to our image and customers; commit to one.'],
    ['Is it ethical to advertise a "compare at" price?', 'Only when the comparison is real and fair; never mislead.'],
  ]),
  ...R('Vendors & buying', [
    ['How would you choose between two vendors with the same price?', 'Reliability, quality, lead time, terms, and service, scored side by side.'],
    ['What would you negotiate for with the vendor?', 'Cost, exclusivity, terms, markdown money, ad funds; offer something in return.'],
    ['What will you do if the vendor delivers late?', 'Backup stock, the agreed penalty, a backup vendor, and a heads-up to stores.'],
    ['How will you know the vendor did a good job?', 'On-time %, defects, and how their product sold, reviewed regularly.'],
    ['Would you buy from a vendor here at home or overseas?', 'Trade cost against lead time, minimums, tariffs, and currency risk.'],
    ['How much should we buy for the first order?', 'Enough to test, with room to reorder; base it on the forecast and budget.'],
    ['Where will the money for this purchase come from?', 'Open-to-buy, shifting from slower categories, or vendor support.'],
    ['How will you keep national-brand vendors happy while growing our own brand?', 'Protect their best sellers\' space, run joint promotions, and be honest.'],
  ]),
  ...R('Promotion', [
    ['How would you best promote this to teenagers?', 'Where they spend time (short video, creators), a shareable hook, and in-store moments.'],
    ['Which part of the promotional mix matters most here, and why?', 'Pick one lead element and support it; tie the choice to the product and customer.'],
    ['How will you get people talking about this without paying for ads?', 'Publicity, product seeding, referral codes, events, customer posts.'],
    ['What would the headline of your first ad be?', 'Say it: short, benefit-driven, with a call to action.'],
    ['How will you make sure the promotion and the inventory line up?', 'Product in stores before ads run; stock matched to the promotion\'s reach.'],
    ['How much would you spend on promotion?', 'A rough budget as a share of expected sales; put most into what works best.'],
    ['What rules do we have to follow when using influencers?', 'Clear disclosure of paid partnerships and no false claims.'],
    ['How would you promote this inside the store?', 'Front displays, endcaps, signs, related items nearby, and trained staff.'],
    ['How will you reach the parents who pay?', 'Value messages, email, and timing around back-to-school or holidays.'],
  ]),
  ...R('Channels & omnichannel', [
    ['Should we sell this online, in stores, or both?', 'Usually both, connected: shared stock and the same price.'],
    ['How would buy online, pick up in store help us?', 'Saves shipping and brings shoppers into stores, where they buy more.'],
    ['What if shoppers look at it in our store and buy it cheaper online?', 'Price-match rules, exclusives, service, and take-it-home-today.'],
    ['Would you launch online first or in stores first?', 'Pick one and give the reason (online buzz vs. store traffic).'],
    ['How would you handle online returns?', 'Return to any store, clear size info, and fast restocking.'],
    ['What role should our app play?', 'Stock check, early access, alerts, and rewards in one place.'],
    ['How would you get more product to stores fast if it sells out?', 'Warehouse reserve, ship-from-store, and quick reorders.'],
  ]),
  ...R('Customers & clientele', [
    ['Who exactly is the target customer?', 'Describe them: age, income, lifestyle, and what they care about.'],
    ['How will this bring customers back after the first purchase?', 'Follow-up, rewards, new drops, and personal offers.'],
    ['What makes people want to buy this?', 'Name the emotional and practical reasons and connect them to the product.'],
    ['How will store employees help sell this?', 'Training on features and benefits, suggesting add-ons, and a simple script.'],
    ['What is our brand promise, in one sentence?', 'Say it simply and show how the plan keeps it.'],
    ['How would you handle an upset customer who couldn\'t get one?', 'Apologize, offer a waitlist or rain check, and follow up.'],
    ['How will you keep our current customers while attracting new ones?', 'Don\'t push away the core; give loyal members first access.'],
    ['How would you use customer data without making people uncomfortable?', 'Ask permission, be open about it, and give them something useful in return.'],
    ['What would make a teen choose our store over shopping on their phone?', 'Experiences, take-it-home-today, exclusives, and social moments.'],
  ]),
  ...R('Data & results', [
    ['Is there any way to know if we made the right decision?', 'Name 2–3 numbers, a target for each, and when you\'ll check.'],
    ['What numbers would you check after the first week?', 'Sell-through, sales vs. plan, store traffic, and social mentions.'],
    ['What research would you do before launching?', 'A quick survey or small group of customers, plus existing reports.'],
    ['What would tell you to stop or change the plan?', 'A clear trigger, like sell-through under 30% by week 3.'],
    ['How would you know the promotion worked?', 'Sales lift, coupon use, new members, and cost per new customer.'],
    ['What is a realistic sales forecast for this?', 'Base it on similar items and last year, adjusted for trends.'],
    ['How would you track whether we\'re reaching younger shoppers?', 'New loyalty members by age, repeat visits, and sales from that age group.'],
  ]),
  ...R('Risk & ethics', [
    ['What is the biggest risk in your plan?', 'Name it honestly and give a backup plan.'],
    ['What happens if it doesn\'t sell?', 'Markdowns, vendor help, bundles, or selling leftovers to an off-price store.'],
    ['What happens if it sells out right away?', 'Reorder plan, waitlist, purchase limits, and honest communication.'],
    ['Are there any legal issues we should think about?', 'Ad claims, copying designs, customer privacy, and product safety.'],
    ['How would you keep resellers from buying up all the stock?', 'Purchase limits, member access, and online bot protection.'],
    ['What if a competitor copies the idea next month?', 'Exclusive contracts, moving fast, the brand story, and the next drop.'],
    ['How would an economic slowdown affect your plan?', 'Focus on value, keep low price points, and buy less at first.'],
    ['How would you handle a quality problem after launch?', 'Pull it, replace or refund, be honest, and fix it with the vendor.'],
  ]),
  ...R('Implementation', [
    ['What are the first three things you would do Monday morning?', 'Concrete actions with who does each.'],
    ['What is your timeline from approval to launch?', 'Key dates: order, delivery, promotion start, launch, review.'],
    ['Who needs to be involved to make this work?', 'Buying, planning, marketing, stores, warehouse, and the vendor.'],
    ['How will you train store employees for the launch?', 'Short training on the product and how to sell it, before launch day.'],
    ['What would you need from me to make this happen?', 'A clear ask: budget, approval, or a decision.'],
    ['How would you roll this out to all stores?', 'Test first, learn, then expand in stages.'],
    ['What could make this launch late, and how would you prevent it?', 'Name the risky steps (vendor, shipping, signs) and a check-in for each.'],
  ]),
  ...R('Curveballs', [
    ['If you could only do one part of your plan, which would it be?', 'Pick the part with the biggest impact and say why.'],
    ['What would you do with double the budget? Half?', 'Scale up what works best; cut the nice-to-haves.'],
    ['Why should I trust your numbers?', 'Explain where they came from; offer to test them small first.'],
    ['What did you consider and reject?', 'Name another option and why you didn\'t choose it. It shows good decision making.'],
    ['How do you think our competitors will respond?', 'Predict one move and your answer to it.'],
    ['Convince me in 30 seconds.', 'Problem, solution, benefit, proof: four sentences.'],
    ['What makes this solution unique?', 'Point to the part no competitor offers.'],
    ['What would you add to your partner\'s answer?', 'Build on it ("To add to that…"); don\'t repeat it. It shows teamwork.'],
  ]),
]

export const JUDGE_QUESTIONS: JudgeQ[] = RAW.map((r, i) => ({ id: `jq-${String(i + 1).padStart(3, '0')}`, ...r }))

export const JUDGE_CATS: JudgeCat[] = [...new Set(RAW.map((r) => r.cat))]
