/**
 * BTDM facts and strategy. Facts verified against the DECA Guide 2026–27 (Team Decision Making
 * guidelines, pp. 53–54) and the 2026 BTDM district sample event, checked October 2026.
 */

export const SOURCES = [
  { label: 'BTDM event page (deca.org)', url: 'https://www.deca.org/compete/buying-and-merchandising-team-decision-making' },
  { label: '2026–27 Team Decision Making guidelines (PDF)', url: 'https://cdn.prod.website-files.com/635c470cc81318fc3e9c1e0e/6a8327f7f7f637d914a9fc71_HS_TDM_Guidelines.pdf' },
  { label: '2026 BTDM sample event with the new rubric (PDF)', url: 'https://cdn.prod.website-files.com/635c470cc81318fc3e9c1e0e/6a4553be16f9fc19f8fa36ae_DECA_BTDM_2026_District_Event_Sample.pdf' },
  { label: '2025 BTDM district event (PDF)', url: 'https://cdn.prod.website-files.com/635c470cc81318fc3e9c1e0e/67c1dae3ce169ac2379f18d9_DECA_BTDM_2025_District_Event.pdf' },
  { label: '2024 BTDM district event (PDF)', url: 'https://cdn.prod.website-files.com/635c470cc81318fc3e9c1e0e/65dca6ff82f4a53d97fd400b_DECA_BTDM_2024_District_Event.pdf' },
  { label: '2023 BTDM district event (PDF)', url: 'https://cdn.prod.website-files.com/635c470cc81318fc3e9c1e0e/63fcdbdc1d261e84fb3e1150_DECA_BTDM_2023_District_Event_CR.pdf' },
  { label: '2026–27 Marketing cluster performance indicators (PDF)', url: 'https://cdn.prod.website-files.com/635c470cc81318fc3e9c1e0e/6a3c7392af68506b6dfcde04_2026-27-HS-DECA-Marketing.pdf' },
  { label: 'Exam blueprint (PDF)', url: 'https://cdn.prod.website-files.com/635c470cc81318fc3e9c1e0e/6a3c69fcf9672174167a66c9_HS_Blueprint.pdf' },
  { label: '2026–27 competitive event updates (DECA Direct)', url: 'https://www.decadirect.org/articles/deca-announces-competitive-event-topics-and-updates-for-2026-2027' },
  { label: 'Role-play advice (DECA Direct)', url: 'https://www.decadirect.org/subcategories/role-play-events' },
]

export const FORMAT = [
  { k: 'Team', v: '2 members of the same chapter' },
  { k: 'Exam', v: '100-question Marketing Cluster Exam each; the two scores are averaged into one team score' },
  { k: 'Cases', v: '1 case study in prelims; a second case study for finalists' },
  { k: 'Prep', v: '30 minutes. Partners may consult only each other. Notes made during prep can be used while presenting.' },
  { k: 'Judge', v: 'Up to 15 minutes with the judge (a business executive), including the judge\'s questions' },
  { k: 'PIs', v: '5 performance indicators per case, listed in the participant instructions' },
  { k: 'Weighting', v: 'The presentation counts 2× the averaged exam score. The exam score carries into finals.' },
  { k: 'Both partners', v: 'Both must take part in the presentation. Each member should answer at least one judge question.' },
  { k: 'Allowed', v: 'Four-function calculator (exam and prep). Materials made during prep may be handed to the judge.' },
  { k: 'Not allowed', v: 'Phones, tablets, scientific/graphing calculators, printed reference materials, audio or visual aids' },
]

/** Point values from the 2026 BTDM sample event\'s judge evaluation form (total 100). */
export const RUBRIC_POINTS = {
  pi: { max: 10, bands: ['0–3', '4–6', '7–9', '10'] },
  solution: { max: 8, bands: ['0–2', '3–5', '6–7', '8'] },
  competency: { max: 6, bands: ['0–1', '2–3', '4–5', '6'] },
  overall: { max: 8, bands: ['0–2', '3–5', '6–7', '8'] },
}

export const LEVELS = ['Novice', 'Developing', 'Proficient', 'Exemplary'] as const

export const LEVEL_MEANING = [
  'Lists the PIs or competencies, but understanding is incomplete or inaccurate; ideas lack logical support.',
  'Defines the PIs and competencies but doesn\'t connect them to the case objective; reasoning has gaps.',
  'Explains the PIs and competencies and connects them to solving the case, with well-supported ideas.',
  'Strategically applies the PIs and competencies to comprehensively solve the case, with practical, real-world reasoning.',
]

export const SOLUTION_CRITERIA = [
  { key: 'unique', label: 'Unique', text: 'Original thinking, fresh perspectives, an insightful approach.' },
  { key: 'practical', label: 'Practical', text: 'An actionable, viable solution in a real-world context.' },
  { key: 'effective', label: 'Effective', text: 'A solution that achieves relevant outcomes.' },
]

export const COMPETENCIES = [
  { key: 'critical', label: 'Critical Thinking', text: 'Thinks critically to understand and solve problems.' },
  { key: 'communication', label: 'Communication', text: 'Communicates clearly, effectively, and with reason.' },
  { key: 'decision', label: 'Decision Making', text: 'Considers the impacts of decisions.' },
  { key: 'collaboration', label: 'Collaboration', text: 'Participates and advocates in groups to achieve common goals.' },
  { key: 'innovation', label: 'Innovation', text: 'Demonstrates a creative and innovative mindset.' },
] as const

export type CompetencyKey = (typeof COMPETENCIES)[number]['key']

export const WHAT_CHANGED = [
  '<mark>Career Competencies</mark> replaced 21st Century Skills. The guide lists five (Critical Thinking, Communication, Decision Making, Collaboration, Innovation); the 2026 BTDM sample scores three of them.',
  'New <mark>Solution</mark> lines: judges score whether your solution is unique, practical, and effective (8 points each on the sample).',
  'Every rubric line uses four levels: Novice, Developing, Proficient, Exemplary. The exemplary level "sets the standard."',
  'Team Decision Making cases now have <mark>5 performance indicators</mark> (down from 7).',
  'An <mark>Overall Impression</mark> line (8 points) rates professionalism, poise, and confidence.',
]

export const CASE_RESEARCH = {
  summary:
    'DECA\'s 2026–27 PI list says Team Decision Making case studies use only Tier 1 (business administration core) and Tier 2 (marketing cluster) performance indicators, not the Merchandising pathway used by RMS role-plays. Recent BTDM district cases were strategy cases about branding, positioning, product ideas, vendors, and buying behavior, with very little math.',
  cases: [
    { year: 2026, setting: 'Discount retail chain', roles: 'Merchandising manager + branding manager', area: 'Selling', pis: 'Generate product ideas; features and benefits; nature of selling; motivational theories of buying; building a clientele' },
    { year: 2025, setting: 'Big-city grocery store', roles: 'Merchandising specialist + branding specialist', area: 'Product/Service Management', pis: 'Product/service management; corporate branding; corporate brand positioning; product positioning; buying behavior; actions and results; select vendors' },
    { year: 2024, setting: 'Largest big-box discounter', roles: 'Merchandising manager + customer relations manager', area: 'Economics', pis: 'Corporate brand positioning; brand promise; profit; business risk; functions of prices; competition; customer relationships' },
    { year: 2023, setting: 'Video game retail chain', roles: 'Director of merchandising + director of marketing', area: 'Market Planning', pis: 'Generate product ideas; product mix; positioning; marketing planning; market identification; marketing strategies; situation analysis' },
  ],
  takeaways: [
    'Expect two named roles (merchandising + branding/marketing/customer relations). Decide together how to split the PIs.',
    'Most-used areas: Product/Service Management (branding, positioning, product mix, product ideas), Selling, Market Planning, Economics, Customer Relations, and Operations (vendors).',
    'The judge asks every team the same two standard questions (one usually about promotion), then may ask clarifying ones.',
    'Retail math won\'t be required, but one well-placed number (a margin, a sell-through goal, a break-even) makes your solution "effective" and shows critical thinking.',
  ],
}

export const STUDY_PLAN = [
  { week: 1, exam: 'Tier 1 areas: Product/Service Mgmt, Marketing-Info Mgmt, Emotional Intelligence, Promotion. Daily flashcards for those areas.', cases: 'Read the playbook. Run one case together with no timer. Learn define → explain → apply.' },
  { week: 2, exam: 'Tier 2 areas (Economics, Finance, Operations, Prof. Development, Selling) and the visual guide. Two practice sets per area.', cases: 'Two timed cases. Use the partner planner. Self-score and fix the top issue.' },
  { week: 3, exam: 'Remaining areas, then a full timed mock. Re-study the "need to learn" topics from your report.', cases: 'Two more cases. Drill 20 judge questions out loud, alternating who answers.' },
  { week: 4, exam: 'Second mock exam. Missed-question review until every miss is fixed. Retail math lab warm-ups.', cases: 'Full dress rehearsal with a teacher or parent as judge. Practice handoffs until they\'re smooth.' },
]

export const EXAM_PATTERNS = [
  { title: 'The ethical, responsible answer wins', body: 'Admit the mistake. Apologize to the customer. Report unsafe equipment. Refuse the kickback. Promote a friend only if procedures were followed and they\'re the most qualified. If one choice is the "right thing to do," it\'s almost always correct.' },
  { title: '"First step" means identify the need', body: 'First step in a decision? <mark>Pinpoint the objective.</mark> First step in marketing info? <mark>Identify the information needs.</mark> Before a feature-benefit chart? <mark>Know where to find product facts.</mark> Before following directions? <mark>Listen.</mark>' },
  { title: 'Absolutes are usually wrong', body: '"Make eye contact with <i>all</i> audience members." "Leaders are <i>always</i> ethical." "Gather as much data as you <i>possibly</i> can." DECA answers are moderate and realistic.' },
  { title: 'Distractors are real neighbor terms', body: 'The wrong answers are actual vocabulary from the same family: brand promise vs. slogan vs. personality; contraction vs. recession vs. depression; mean vs. median vs. mode. Learn each family as a set.' },
]

export const PI_FORMULA = {
  steps: [
    { k: 'Define it', v: 'one sentence, using the textbook term.' },
    { k: 'Explain', v: 'why it matters to this business, using the case facts.' },
    { k: 'Apply it', v: 'a specific recommendation with a number, a name, or a date.' },
  ],
  example:
    '"An exclusive product is merchandise sold only by one retailer. For a discount chain trying to win teens, an exclusive gives them a reason to visit us instead of comparing prices online. We recommend a limited back-to-school collection with a creator teens follow, launching July 15 with 60% of units in our top 200 stores."',
}

export const PREP_PHASES = [
  { id: 'read', label: 'Read & split PIs', minutes: 5, tips: ['Both partners read everything once, underlining numbers and every task the judge wants.', 'Match the 5 PIs to the tasks, then decide together who covers each one.'] },
  { id: 'plan', label: 'Build the plan', minutes: 12, tips: ['Agree on ONE solution first, then each partner outlines their PIs with define → explain → apply.', 'Add one number to make it effective (budget, margin, sell-through goal, timeline).', 'Decide what makes it unique: a fresh idea the judge hasn\'t heard all day.'] },
  { id: 'assign', label: 'Assign speaking parts', minutes: 8, tips: ['Write the opener, the order of PIs, and each handoff line.', 'Predict 3 judge questions. DECA expects each partner to answer at least one.', 'Plan a strong close: recap benefits, then invite questions.'] },
  { id: 'rehearse', label: 'Rehearse handoffs', minutes: 5, tips: ['Whisper through the opener and every handoff once.', 'Check timing: aim for 8–10 minutes of presenting, leaving room for questions.', 'Organize notes so either partner can find any point quickly.'] },
]

export const PRESENTATION_FLOW = [
  { k: 'Open (30–45 sec)', v: 'Both partners greet the judge in character, introduce your roles, thank them, and restate the challenge in one sentence.' },
  { k: 'Preview', v: '"We\'ll cover three things: the product idea, how we\'ll position and promote it, and how it builds our clientele."' },
  { k: 'Body', v: 'Alternate by PI using planned handoffs. Weave PIs into the solution; don\'t read them like a list.' },
  { k: 'Solution', v: 'One clear plan with a timeline, a budget or number, and a success metric.' },
  { k: 'Close', v: 'Recap the benefits to the judge\'s business. "What questions do you have for us?"' },
  { k: 'Questions', v: 'Pause, restate briefly, answer in 2–3 sentences, tie it back to the plan. Split questions so both partners answer.' },
]

export const TEAM_TIPS = [
  'Collaboration shows: nod and look at your partner while they speak; add to their answer only to strengthen it ("To build on that…").',
  'Handoffs should pass the topic, not just the turn: "…and that\'s why the price point works. Jordan will explain how we\'ll get teens into the store."',
  'Never contradict your partner in front of the judge. If they misspeak, add a correction gently in your next point.',
  'If you finish early, use the time: a quick risk-and-backup plan or a 30/60/90-day timeline.',
]
