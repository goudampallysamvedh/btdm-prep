import type { Area, AreaCode } from '@/types'

/**
 * Exam blueprint and area-by-area study guide.
 * Weights: questions per 100 on the Marketing Cluster Exam. Identical on the 2022 (test 1245)
 * and 2025 (test 1302) samples. Terms from the original prep kit; entries marked NEW were added
 * to cover performance indicators that the samples or recent BTDM cases tested.
 * Each term's `id` is a topic id used for progress tracking.
 */
export interface AreaTerm {
  id: string
  term: string
  html: string
}
export interface AreaDef extends Omit<Area, 'terms'> {
  terms: AreaTerm[]
}

export const AREAS: AreaDef[] = [
  {
    code: 'PM', name: 'Product/Service Management', weight: 11, tier: 1,
    terms: [
      { id: 'PM.mix', term: 'Product mix', html: 'all the products a company sells. Width = number of product lines; depth/length = items per line; <mark>consistency</mark> = how closely lines relate (same target market, use, or distribution).' },
      { id: 'PM.plc', term: 'Product life cycle', html: 'introduction → growth → maturity → decline. <mark>Market saturation</mark> happens in maturity. <mark>Penetration pricing</mark> (low) builds share fast; <mark>skimming</mark> (high) recovers development costs.' },
      { id: 'PM.newprod', term: 'New-product steps', html: 'idea generation → screening → concept testing → development → <mark>test marketing</mark> (launch in a limited area) → commercialization.' },
      { id: 'PM.warranty', term: 'Warranties', html: 'express (written or spoken) vs. implied (unwritten, product works as expected); full (whole product) vs. <mark>limited</mark> (specific parts or repairs). Guarantee and warranty claims give the company customer <mark>feedback</mark>.' },
      { id: 'PM.position', term: 'Positioning strategies', html: 'by product attributes, benefits, users, price/quality, or against <mark>competitors</mark> ("We\'re the best!"). A positioning statement says who it\'s for, what it is, and why it\'s different.' },
      { id: 'PM.brand', term: 'Branding family', html: '<mark>Brand promise</mark> = the benefit customers can always count on (kept by meeting expectations consistently). <mark>Brand personality</mark> = human traits (young, rugged). Brand identity = recognizable elements (logo, colors). Brand values = beliefs it stands for. Slogan = the catchphrase. <mark>Customer voice</mark> = using customer feedback to improve branding.' },
      { id: 'PM.corpbrand', term: 'Corporate brand positioning', html: 'communicating the company\'s <mark>value</mark> while weighing the target market\'s needs and wants. A corporate brand (the retailer\'s own name) covers every product and store experience.' },
      { id: 'PM.bundle', term: 'Product bundling', html: 'two or more products at one price. Main advantage: <mark>reduces comparison shopping</mark>.' },
      { id: 'PM.grades', term: 'Grades & standards', html: 'Grade A eggs, Prime beef. Signals quality and that food is <mark>safe to eat</mark>.' },
      { id: 'PM.ideas', term: 'Idea generation', html: 'Six Thinking Hats: white = facts, <mark>red = emotions and intuition</mark>, black = risks, yellow = positives, green = new ideas, blue = process control. Also brainstorming, customer feedback, competitor analysis, and trend tracking.' },
      { id: 'PM.tech', term: 'Technology risk', html: 'rapid change makes products <mark>obsolete</mark> faster; <mark>technological forecasting</mark> predicts which technologies will emerge and when.' },
      { id: 'PM.opps', term: 'Product opportunities', html: 'found through <mark>personal expertise</mark>, hobbies, technology, or accidental discovery.' },
      { id: 'PM.protect', term: 'Consumer protection & product ethics (NEW)', html: 'the <mark>Consumer Product Safety Commission</mark> sets safety standards and orders recalls; the FDA covers food, drugs, and cosmetics; the FTC covers labeling and deceptive claims. Ethical product decisions: honest labels, no planned safety shortcuts, prompt recalls.' },
      { id: 'PM.touch', term: 'Customer touchpoints (NEW)', html: 'every place a customer meets the brand: ads, website, app, store, packaging, receipt, returns desk. Mapping touchpoints shows where the brand promise is kept or broken.' },
    ],
    trap: 'Brand promise, slogan, and personality all sound right. Promise = what you deliver; slogan = the words; personality = the human traits.',
  },
  {
    code: 'IM', name: 'Marketing-Information Management', weight: 11, tier: 1,
    terms: [
      { id: 'IM.data', term: 'Primary vs. secondary data', html: 'primary is collected by you for this problem (<mark>focus groups</mark>, your own surveys); secondary already exists (trade journals, <mark>online libraries</mark>, government data).' },
      { id: 'IM.design', term: 'Research designs', html: '<mark>exploratory</mark> (fast, cheap, define the issue), descriptive (who/what/how many), causal (cause and effect, experiments).' },
      { id: 'IM.sampling', term: 'Sampling', html: 'a census contacts everyone, which is usually impossible, so companies <mark>sample</mark>. <mark>Random sampling</mark> reduces bias; referral (snowball) sampling asks respondents for more names. A sampling plan answers who, how many, and how chosen.' },
      { id: 'IM.questionnaire', term: 'Questionnaire design', html: 'qualitative questions avoid <mark>yes/no answers</mark>; never lead respondents; <mark>vary question types</mark> to keep attention; edit forms to make sure they\'re <mark>completed properly</mark>; code <mark>all possible responses</mark>.' },
      { id: 'IM.stats', term: 'Descriptive statistics', html: 'summarize data and compare. Mean = average, median = middle, <mark>mode = most frequent</mark>, range = high minus low.' },
      { id: 'IM.objectivity', term: 'Objectivity', html: 'researchers keep opinions out; interviewers watch tone and body language to <mark>avoid appearing biased</mark>.' },
      { id: 'IM.mis', term: 'Marketing-information system', html: 'first step: <mark>identify the information needs</mark>. Used to <mark>monitor the competition</mark> and <mark>solve problems</mark>. Rule: <mark>don\'t overextend company resources</mark>.' },
      { id: 'IM.ethics', term: 'Ethics & law', html: '<mark>Sugging</mark> = selling under the guise of research; frugging = fundraising under the guise of research. Misinterpreting data to <mark>promote products</mark> is unethical. Privacy laws <mark>vary by jurisdiction</mark>.' },
      { id: 'IM.collect', term: 'Data-collection methods (NEW)', html: 'observation (watch behavior, no questions), surveys (mail, phone, online, in person), diaries (respondents log purchases over time), and experiments. <mark>Observation</mark> records what people do, not what they say they do.' },
    ],
    trap: 'Exploratory vs. causal: if the question says "not much time or money" and "from various sources," it\'s exploratory.',
  },
  {
    code: 'EI', name: 'Emotional Intelligence', weight: 9, tier: 1,
    terms: [
      { id: 'EI.initiative', term: 'Initiative', html: 'acting without being told; seeking extra duties. Initiative often comes with <mark>adaptability (flexibility)</mark>.' },
      { id: 'EI.assertive', term: 'Assertiveness', html: 'standing up for beliefs and <mark>communicating honestly</mark> without hurting others. Not aggressive.' },
      { id: 'EI.responsible', term: 'Responsibility & self-control', html: 'when you make a mistake, <mark>admit it</mark> and <mark>apologize</mark>; never blame the register or the manager.' },
      { id: 'EI.adapt', term: 'Adaptability', html: 'confidence, flexibility, empathy, objectivity, respect. Believing you\'ll handle a new challenge = <mark>confidence</mark>.' },
      { id: 'EI.persuade', term: 'Persuasion', html: 'create desire by <mark>explaining benefits</mark> to the other person.' },
      { id: 'EI.negotiate', term: 'Negotiation', html: 'build trust by <mark>actively listening</mark>; goal is usually a <mark>compromise</mark> (win-win).' },
      { id: 'EI.coach', term: 'Coaching & feedback', html: 'positive, forward-looking: <mark>"Maybe next time you could try this."</mark>' },
      { id: 'EI.leadership', term: 'Ethics & leadership', html: 'ethical people aren\'t always leaders, and leaders aren\'t always ethical. Leaders keep teams aligned by <mark>communicating effectively</mark>.' },
      { id: 'EI.ambiguity', term: 'Ambiguity', html: 'in an unclear situation, first <mark>ask questions</mark>. People follow the crowd to <mark>be accepted by peers</mark>.' },
      { id: 'EI.honest', term: 'Honest communication & privacy', html: 'includes <mark>not sharing confidential information</mark> and respecting others\' privacy.' },
      { id: 'EI.power', term: 'Power & challenging the status quo (NEW)', html: 'use power appropriately: influence through expertise and respect, not threats. Challenging the status quo means <mark>questioning "the way we\'ve always done it"</mark> with evidence and a better option.' },
    ],
    trap: 'Several answers can sound "nice." Pick the one that names the exact trait shown in the scenario.',
  },
  {
    code: 'PR', name: 'Promotion', weight: 9, tier: 1,
    terms: [
      { id: 'PR.mix', term: 'Promotional mix', html: 'advertising, sales promotion, personal selling, publicity/PR. <mark>Personal selling</mark> fits complex products; <mark>publicity</mark> is cheapest. Promotion\'s role: <mark>preselling</mark>.' },
      { id: 'PR.types', term: 'Types of promotion', html: 'product promotion (primary = whole category; secondary = one brand) vs. institutional (<mark>public service</mark> = noncontroversial causes; <mark>public relations</mark> = handles controversial issues by <mark>influencing attitudes</mark>).' },
      { id: 'PR.media', term: 'Media', html: 'broadcast (TV, radio) is a type of <mark>promotional media</mark>; out-of-home includes billboards and transit. Billboard copy is short because <mark>viewing time is brief</mark>.' },
      { id: 'PR.adparts', term: 'Ad parts', html: '<mark>headline</mark> (short, catchy), body copy, illustration, signature/logo, call to action, white space.' },
      { id: 'PR.digital', term: 'Digital & direct', html: '<mark>pay-per-click</mark> charges only when clicked; <mark>direct-response</mark> lets people act immediately (infomercial phone order); direct marketing is an effective <mark>promotional tool</mark>; kiosks are <mark>interactive</mark>.' },
      { id: 'PR.wom', term: 'Word of mouth', html: 'disadvantage: <mark>limited control</mark>. <mark>Product seeding</mark> puts free products with influencers; sponsoring events earns <mark>publicity</mark>.' },
      { id: 'PR.placement', term: 'Product placement', html: 'branded products used as props in shows, movies, games.' },
      { id: 'PR.regulation', term: 'Regulation & ethics', html: 'governments protect consumers from <mark>deceptive advertising</mark>. <mark>Cease-and-desist</mark> = stop running the ad; affirmative disclosure = add missing info; corrective advertising = fix a false claim. Influencers must <mark>disclose paid partnerships</mark>.' },
    ],
    trap: 'Institutional public service vs. public relations: noncontroversial cause (anti-drug campaign) = public service.',
  },
  {
    code: 'EC', name: 'Economics', weight: 6, tier: 2,
    terms: [
      { id: 'EC.utility', term: 'Utility', html: 'form, time, place, possession, information. Must <mark>provide satisfaction</mark>.' },
      { id: 'EC.systems', term: 'Economic systems', html: 'traditional, command (<mark>socialist</mark> = high taxes for many services; communist = government owns everything), market, mixed.' },
      { id: 'EC.cycle', term: 'Business cycle', html: 'expansion, peak, <mark>contraction</mark>, trough.' },
      { id: 'EC.wants', term: 'Wants', html: '<mark>economic wants</mark> have monetary value; noneconomic wants (air, sunshine) don\'t.' },
      { id: 'EC.specialization', term: 'Specialization', html: 'breaking work into specialized tasks <mark>raises productivity</mark>. Fewer tasks = narrower <mark>scope</mark>.' },
      { id: 'EC.exchange', term: 'Exchange rate', html: 'one currency\'s value compared with <mark>another currency</mark>. A stronger dollar makes imported merchandise <mark>cheaper</mark> for U.S. buyers.' },
      { id: 'EC.unemployment', term: 'Unemployment', html: '<mark>reduces demand and spending</mark>.' },
      { id: 'EC.org', term: 'Org structures', html: 'line, line-and-staff (advisory staff), <mark>matrix</mark> (cross-department teams, efficient resource use), bureaucratic.' },
      { id: 'EC.ethics', term: 'Business ethics', html: 'poor ethics hurts the company internally by <mark>decreasing productivity</mark>.' },
      { id: 'EC.market', term: 'Prices, competition, profit & risk (NEW)', html: 'prices <mark>ration goods and signal</mark> producers what to make. Competition pushes better quality and lower prices. Profit = revenue − expenses, affected by prices, costs, and volume. Business risks are <mark>economic, natural, or human</mark>; some can be insured, some only managed.' },
    ],
    trap: 'Recession and depression are not phases of the business cycle; contraction is.',
  },
  {
    code: 'FI', name: 'Financial Analysis', weight: 6, tier: 2,
    terms: [
      { id: 'FI.credit', term: 'Credit', html: 'buy now, pay later; lets you <mark>borrow against future income</mark>. Interest is the fee for credit.' },
      { id: 'FI.goals', term: 'Financial goals', html: 'SMART: <mark>specific</mark>, measurable, attainable/realistic, results-oriented, time-bound.' },
      { id: 'FI.networth', term: 'Net worth', html: 'assets minus liabilities, found with a <mark>personal balance sheet</mark>.' },
      { id: 'FI.retire', term: 'Retirement', html: '401(k) = <mark>defined contribution</mark>; <mark>pension</mark> = employer-funded retirement income; 457 = for government employees.' },
      { id: 'FI.insurance', term: 'Insurance', html: 'you pay a premium for protection against loss. <mark>Disability</mark> replaces income when you can\'t work; health covers medical bills; liability covers harm to others.' },
      { id: 'FI.income', term: 'Income & pay', html: '<mark>earned income</mark> = wages for work; unearned = dividends, rent, transfer payments. <mark>Net pay</mark> = take-home pay; gross pay = before deductions.' },
      { id: 'FI.invest', term: 'Investments', html: '<mark>stocks</mark> swing up and down; savings, money market, and bonds are steadier.' },
      { id: 'FI.accounting', term: 'Accounting', html: '<mark>accounts receivable</mark> = money customers owe the business. <mark>Good faith money</mark> = deposit showing intent to complete a deal. A budget plans spending against expected revenue.' },
    ],
    trap: 'Net vs. gross pay. Net is what\'s left after deductions.',
  },
  {
    code: 'OP', name: 'Operations', weight: 6, tier: 2,
    terms: [
      { id: 'OP.projects', term: 'Projects', html: 'have a definite <mark>beginning and end</mark>. Keys: <mark>being organized</mark>; share the plan with the <mark>client and team</mark>; check status through <mark>meetings</mark>.' },
      { id: 'OP.costs', term: 'Costs', html: '<mark>fixed</mark> costs don\'t change with sales (rent, insurance, <mark>utilities</mark>); variable costs do (shipping, commissions, cost of goods).' },
      { id: 'OP.safety', term: 'Safety', html: 'accidents cause <mark>financial loss</mark>. Give first aid when <mark>immediate treatment is essential</mark>. Report ignored hazards to the government (whistleblower protection).' },
      { id: 'OP.ethics', term: 'Ethics', html: 'an <mark>externality</mark> is a cost you can\'t easily put a number on (pollution).' },
      { id: 'OP.quality', term: 'Quality culture', html: '<mark>employee empowerment</mark>: people manage their work, innovate, and collaborate.' },
      { id: 'OP.property', term: 'Protecting property', html: 'legal protection for intellectual property stops <mark>others from using it without permission</mark>; company property agreements cover <mark>responsibility for lost or damaged equipment</mark>.' },
      { id: 'OP.purchasing', term: 'Purchasing & vendors (NEW)', html: 'purchasing gets the right goods, in the right amount, at the right time and price. <mark>Select vendors</mark> on quality, price, reliability, delivery time, terms, and service; <mark>evaluate vendor performance</mark> with on-time %, fill rate, and defect rate. Ethical purchasing: no gifts or kickbacks that sway decisions.' },
    ],
    trap: 'Insurance and utilities are fixed costs, even though the bill amounts vary a bit.',
  },
  {
    code: 'PD', name: 'Professional Development', weight: 6, tier: 2,
    terms: [
      { id: 'PD.jobsearch', term: 'Job search', html: 'resume on <mark>quality paper</mark>, no exaggeration, at most two fonts. Letter of application goes with <mark>online</mark> applications. After an interview, send a <mark>follow-up letter or email to the interviewer</mark>.' },
      { id: 'PD.careers', term: 'Careers', html: '<mark>public relations</mark> writes press releases; <mark>securities and investments</mark> includes brokerages and stock exchanges; associations hire <mark>lobbyists</mark>. Retail careers: buyer, planner, allocator, merchandiser, visual merchandiser.' },
      { id: 'PD.selfmgmt', term: 'Self-management', html: 'time management: <mark>know when and how you work best</mark>. Systematic behavior aims at <mark>becoming more effective</mark>.' },
      { id: 'PD.decisions', term: 'Problem solving & decisions', html: 'identify <mark>possible alternatives</mark>; the decision-making model starts by <mark>pinpointing your objective</mark>.' },
      { id: 'PD.policies', term: 'Policies & ethics', html: '"wet floor" signs are <mark>health and safety</mark> policy; ethical standards <mark>build positive relationships</mark>.' },
    ],
    trap: 'Don\'t pick social media or contacting the CEO. DECA prefers direct, professional, proper-channel actions.',
  },
  {
    code: 'SE', name: 'Selling', weight: 6, tier: 2,
    terms: [
      { id: 'SE.intangible', term: 'Selling intangibles', html: 'services like <mark>health insurance</mark> can\'t be touched.' },
      { id: 'SE.knowledge', term: 'Product knowledge', html: 'features, benefits, price, availability, construction, warranties: <mark>salespeople use it to answer questions</mark>. Comparing items? Use <mark>materials and content</mark>.' },
      { id: 'SE.featben', term: 'Feature-benefit selling', html: 'feature = what it is; benefit = what it does for the customer. First, <mark>know where to get product facts</mark>.' },
      { id: 'SE.policies', term: 'Selling policies', html: 'internal factors (prices, employees) vs. external factors the company can\'t control (<mark>competitors\' actions</mark>, <mark>raw material availability</mark>).' },
      { id: 'SE.ethicstech', term: 'Ethics & technology', html: 'refusing kickbacks is <mark>ethical</mark>; websites <mark>support the selling function</mark>; spreadsheets <mark>quickly analyze sales data</mark>; testimonial ads <mark>build customer confidence</mark>.' },
      { id: 'SE.motives', term: 'Buying motives', html: 'an <mark>external reward</mark> comes from others (approval, looking fashionable); internal comes from yourself. Rational motives (price, quality) vs. emotional motives (status, fun). Maslow: physiological → safety → social → esteem → self-actualization.' },
      { id: 'SE.clientele', term: 'Building a clientele (NEW)', html: 'a clientele is a base of <mark>repeat customers</mark> loyal to you or the store. Keys: excellent service, remembering preferences, follow-up, loyalty perks, and <mark>trust</mark>. Keeping a customer costs less than winning a new one.' },
    ],
    trap: 'A testimonial doesn\'t "prove" a product is the best buy. It builds confidence.',
  },
  {
    code: 'CM', name: 'Channel Management', weight: 5, tier: 2,
    terms: [
      { id: 'CM.channels', term: 'Channels', html: '<mark>producer → ultimate consumer</mark> is the direct consumer channel; adding intermediaries makes it indirect. A channel ends at the consumer or when the product is <mark>changed</mark>.' },
      { id: 'CM.conflict', term: 'Conflict', html: 'caused by <mark>different goals</mark>. Vertical = different levels (<mark>store brand vs. national brand</mark>); horizontal = same level.' },
      { id: 'CM.ethicslaw', term: 'Ethics & law', html: '<mark>slotting allowance</mark> = fee to get shelf space; <mark>gray market</mark> = buying through unauthorized channels; <mark>exclusive dealing</mark> can be illegal if it restricts competition.' },
      { id: 'CM.tech', term: 'Technology', html: '<mark>RFID</mark> chips go on the box or pallet; <mark>GPS</mark> gives drivers location and directions.' },
      { id: 'CM.coord', term: 'Coordination', html: 'match distribution to promotion to <mark>guarantee enough supply of advertised items</mark>.' },
      { id: 'CM.intensity', term: 'Distribution intensity', html: '<mark>intensive</mark> = every possible outlet (gum); selective = a limited number of good outlets (appliances); exclusive = one outlet per area (luxury). Affinity partners team up to reach each other\'s customers.' },
    ],
    trap: 'Producer to industrial user is direct, but it\'s for business goods, not consumer goods.',
  },
  {
    code: 'CO', name: 'Communication Skills', weight: 5, tier: 2,
    terms: [
      { id: 'CO.presenting', term: 'Presenting', html: 'make eye contact with <mark>individuals around the room</mark>; audiences show support by <mark>applauding</mark>.' },
      { id: 'CO.listening', term: 'Listening & directions', html: 'you must be ready to <mark>listen</mark>; <mark>restating directions</mark> in your own words clarifies them.' },
      { id: 'CO.reports', term: 'Reports', html: '<mark>progress report</mark> = short status update; formal report = complex analysis for decisions; best current industry info = <mark>trade publications</mark>.' },
      { id: 'CO.letters', term: 'Letters', html: 'letter of <mark>inquiry</mark> makes a request; sales letters <mark>encourage action</mark>.' },
      { id: 'CO.channels', term: 'Channels', html: 'negotiation and raises need a <mark>face-to-face meeting</mark>; job problems go to your <mark>immediate supervisor</mark>.' },
    ],
    trap: '"Eye contact with all members" is impossible in a large room. Pick "individuals around the room."',
  },
  {
    code: 'NF', name: 'Information Management', weight: 5, tier: 2,
    terms: [
      { id: 'NF.computers', term: 'Computers', html: '<mark>software</mark> is a core component; a traveling presenter with big files needs a <mark>laptop</mark>.' },
      { id: 'NF.spreadsheets', term: 'Spreadsheets', html: '<mark>sort</mark> changes ascending/descending order; chart makes graphs; filters show only matching rows.' },
      { id: 'NF.data', term: 'Data', html: '<mark>data mining</mark> finds patterns to predict outcomes; customer records must be <mark>updated and checked often</mark>; statistics help <mark>improve performance</mark>.' },
      { id: 'NF.trends', term: 'Trends & tech', html: 'growing concern for <mark>protecting the environment</mark>; online survey services gather feedback quickly.' },
      { id: 'NF.writing', term: 'Writing', html: 'collaborative writing needs <mark>plenty of time for revision</mark>; big decisions get a <mark>formal report</mark>.' },
    ],
    trap: 'The internet and websites are not components of a computer system. Software is.',
  },
  {
    code: 'MP', name: 'Market Planning', weight: 4, tier: 3,
    terms: [
      { id: 'MP.strategy', term: 'Marketing strategies', html: 'plans of action that <mark>can be changed as needed</mark> and must consider the marketing mix. Marketing planning develops <mark>strategies</mark>.' },
      { id: 'MP.segment', term: 'Segmentation', html: 'demographic = <mark>common characteristics</mark>; behavioral = <mark>rate of use, benefits, loyalty</mark>; psychographic = lifestyle; geographic = location.' },
      { id: 'MP.plan', term: 'Marketing plan', html: 'situation analysis, objectives, strategies, <mark>implementation (includes budget)</mark>, evaluation and control.' },
      { id: 'MP.forecast', term: 'Sales forecasts', html: 'rising forecast → <mark>hire more workers</mark>; hot new product → forecast is <mark>high</mark>. Buyers use forecasts to plan purchases.' },
      { id: 'MP.situation', term: 'Situation analysis / SWOT (NEW)', html: 'a snapshot of where the business stands: <mark>strengths and weaknesses are internal</mark>; opportunities and threats are external. It comes first in the marketing plan.' },
    ],
    trap: 'Implementation explains budget; strategies outline actions; objectives describe goals.',
  },
  {
    code: 'PI', name: 'Pricing', weight: 3, tier: 3,
    terms: [
      { id: 'PI.exchange', term: 'Exchange price', html: 'the price both buyer and seller accept.' },
      { id: 'PI.factors', term: 'Pricing factors', html: 'more supply → <mark>lower the price</mark>; fixed vs. variable costs; competition; demand; perceived value; calculators compute unit prices.' },
      { id: 'PI.ethics', term: 'Ethics & law', html: '<mark>confusing customers</mark> and <mark>predatory pricing</mark> (pricing low to drive rivals out) are unethical. Price fixing among competitors and bait-and-switch are illegal.' },
      { id: 'PI.strategies', term: 'Retail pricing strategies (NEW)', html: '<mark>keystone</mark> = double the cost; <mark>EDLP</mark> = consistently low prices; <mark>high-low</mark> = regular prices with frequent sales; psychological ($19.99); loss leader = below cost to draw traffic; prestige = high price signals quality.' },
    ],
    trap: 'Rebates and advertised discounts are normal tactics, not unethical.',
  },
  {
    code: 'BL', name: 'Business Law', weight: 2, tier: 3,
    terms: [
      { id: 'BL.laws', term: 'Laws vs. rules', html: 'laws are passed by government (<mark>speed limit</mark>); dress codes and store lines are rules or policies.' },
      { id: 'BL.ip', term: 'Intellectual property', html: '<mark>trademarks</mark>, patents, copyrights are intangible property protected by law.' },
      { id: 'BL.admin', term: 'Administrative law', html: 'agencies control rates, conduct, and supply. Issuing broadcast licenses = <mark>control of supply</mark>. Following the <mark>spirit of the law</mark> means acting on its intent, not hunting loopholes.' },
    ],
  },
  {
    code: 'CR', name: 'Customer Relations', weight: 2, tier: 3,
    terms: [
      { id: 'CR.promise', term: 'Brand promise', html: 'a <mark>specific benefit</mark> customers can expect; must communicate an <mark>appealing benefit</mark>.' },
      { id: 'CR.relations', term: 'Positive relations', html: 'a rude employee costs <mark>repeat business</mark>. Updating firewalls builds trust through <mark>online security</mark>.' },
      { id: 'CR.crm', term: 'CRM & ethics (NEW)', html: 'customer relationship management uses data to personalize service and keep customers. Ethical CRM <mark>protects customer data</mark>, asks permission, and never misleads.' },
    ],
  },
  {
    code: 'EN', name: 'Entrepreneurship', weight: 1, tier: 3,
    terms: [{ id: 'EN.ethics', term: 'Ethics', html: 'sustainability aims at <mark>long-term profitability</mark>, community health, and environment. Exaggerating projected income to investors is <mark>puffery</mark>.' }],
  },
  {
    code: 'HR', name: 'Human Resources Mgmt', weight: 1, tier: 3,
    terms: [{ id: 'HR.orient', term: 'Orientation & ethics', html: '<mark>coworkers</mark> answer new hires\' routine questions; promoting a friend is fine when procedures are followed and they\'re <mark>most qualified</mark>.' }],
  },
  {
    code: 'MK', name: 'Marketing', weight: 1, tier: 3,
    terms: [{ id: 'MK.actions', term: 'Company actions', html: 'a <mark>touchpoint</mark> is any direct contact with customers (watching your ad); tracking what sells helps <mark>spot product trends</mark>. Buying behavior is shaped by personal, psychological, social, and situational factors.' }],
  },
  {
    code: 'SM', name: 'Strategic Management', weight: 1, tier: 3,
    terms: [{ id: 'SM.mgmt', term: 'Management', html: 'strategic planning covers <mark>3–5 years</mark>; buyouts are decided by <mark>top-level</mark> management.' }],
  },
]

export const AREA_BY_CODE: Record<AreaCode, AreaDef> = Object.fromEntries(AREAS.map((a) => [a.code, a])) as Record<AreaCode, AreaDef>

export const AREA_CODES: AreaCode[] = AREAS.map((a) => a.code)

export function areaName(code: AreaCode): string {
  return AREA_BY_CODE[code]?.name ?? code
}

/** Blueprint weights sum to 100. */
export const BLUEPRINT: Record<AreaCode, number> = Object.fromEntries(AREAS.map((a) => [a.code, a.weight])) as Record<AreaCode, number>
