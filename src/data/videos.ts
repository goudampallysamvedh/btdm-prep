/**
 * Video library. Every link was checked on Oct 16, 2026 with YouTube's and Vimeo's oEmbed endpoints
 * (HTTP 200 = the video exists and is public). Kit videos are marked `kit: true`.
 * To re-check: run `npm run check:videos`.
 */
export interface Video {
  title: string
  url: string
  why: string
  channel?: string
  kit?: boolean
}

export interface VideoGroup {
  title: string
  blurb: string
  videos: Video[]
}

export const VIDEO_GROUPS: VideoGroup[] = [
  {
    title: 'Team Decision Making examples',
    blurb: 'Watch with the rubric in mind: count how many PIs each team defines, explains, and applies, and how they hand off.',
    videos: [
      { title: 'DECA Sample Competitive Events: Team Decision Making', url: 'https://www.youtube.com/watch?v=ThomLbhzMLU', channel: 'DECA Inc.', why: 'DECA\'s own sample of a team event, the closest thing to BTDM on video.' },
      { title: 'Entrepreneurship Team Decision-Making role-play (state level)', url: 'https://www.youtube.com/watch?v=MMmHiaJ5lGo', channel: 'Leemawnayde', why: 'A full two-person run-through. Watch how partners split PIs and questions.' },
      { title: 'Role-play example with commentary', url: 'https://www.youtube.com/watch?v=aS6z8AEMzCw', channel: 'Northwood University', why: 'A sample role-play paused with coaching notes on what scores.' },
      { title: 'How to structure a role-play', url: 'https://www.youtube.com/watch?v=kIO_B60dI2M', channel: 'Nevada DECA', why: 'A clear opening–body–close structure you can adapt for two people.' },
    ],
  },
  {
    title: 'Role-play examples',
    blurb: 'Individual series events use the same PI and rubric approach.',
    videos: [
      { title: 'DECA Principles of Marketing role-play by an ICDC finalist', url: 'https://www.youtube.com/watch?v=i5rfQmelnng', why: 'Full run-through from an international finalist. Count the PIs.', kit: true },
      { title: 'DECA Principles of Marketing role-play example (95+ score)', url: 'https://www.youtube.com/watch?v=GsuJVLCJ_kQ', channel: 'Prilo', why: 'High-scoring marketing role-play; good model for structure.', kit: true },
      { title: 'DECA Automotive Services Marketing role-play (90+ score)', url: 'https://www.youtube.com/watch?v=zNJljQ0lAJM', channel: 'Prilo', why: 'A marketing-cluster series event using the same exam.', kit: true },
      { title: 'Oregon DECA sample role-play', url: 'https://www.youtube.com/watch?v=9GdPJTCd7A4', channel: 'Oregon DECA', why: 'A state association demo showing the judge interaction.', kit: true },
      { title: 'The Ultimate DECA Video Series: The Role-Play (official)', url: 'https://vimeo.com/1169922904', why: 'DECA\'s own walkthrough of structure, timing, and PIs. On Vimeo.', kit: true },
    ],
  },
  {
    title: 'Role-play strategy',
    blurb: 'Short videos on the skills judges reward.',
    videos: [
      { title: 'How to use performance indicators in DECA role-plays', url: 'https://www.youtube.com/watch?v=6LiO3f5j_Qc', channel: 'Abhishek\'s DECA Page', why: 'The define → explain → apply skill in depth.', kit: true },
      { title: 'Tips for your PIs and transitions', url: 'https://www.youtube.com/watch?v=xGMOKqOqfUs', channel: 'Davidson Academy DECA', why: 'Moving smoothly from one PI to the next; great for partner handoffs.', kit: true },
      { title: 'Tips for your DECA role-play introduction', url: 'https://www.youtube.com/watch?v=GPQZKfJvYgI', channel: 'Davidson Academy DECA', why: 'The first 30 seconds set the judge\'s impression.', kit: true },
      { title: 'Top 10 tips for DECA role-plays', url: 'https://www.youtube.com/watch?v=DxkQCgh2sEk', channel: 'Julia Wezio', why: 'Quick checklist to watch before competition.', kit: true },
      { title: 'How to ace your DECA role-play for ICDC', url: 'https://www.youtube.com/watch?v=vpf8JHfVHxQ', channel: 'Prilo', why: 'What separates finalists at the international level.', kit: true },
    ],
  },
  {
    title: 'Retail math',
    blurb: 'Pair each with the matching calculator in the math lab.',
    videos: [
      { title: 'Markups and markdowns', url: 'https://www.youtube.com/watch?v=Xe26WJhzO88', channel: 'MooMooMath and Science', why: 'A fast, clear refresher on markup and markdown percentages.' },
      { title: 'Markup and markdown', url: 'https://www.youtube.com/watch?v=qod3aqQzWNA', channel: 'Mrs. Math Teacher', why: 'Worked examples at a slower pace.' },
      { title: 'Open-to-buy explained', url: 'https://www.youtube.com/watch?v=RxXY5Pouaks', channel: 'Retail Dogma', why: 'How buyers budget purchases; pairs with the OTB calculator.' },
      { title: 'Planning markdowns in retail', url: 'https://www.youtube.com/watch?v=GgIjFmdxRKU', channel: 'daVinci Retail', why: 'Why and when buyers plan markdowns into the season.' },
      { title: 'Inventory turnover ratio explained', url: 'https://www.youtube.com/watch?v=950ieZFViPo', channel: 'Retail Dogma', why: 'Turnover and why faster is (usually) better.' },
      { title: 'Gross margin return on inventory (GMROI)', url: 'https://www.youtube.com/watch?v=HlGzEV0Gmeg', channel: 'NHPA TV', why: 'A short explanation of the KPI that combines margin and turn.' },
      { title: 'GMROI: what it is and how retailers use it', url: 'https://www.youtube.com/watch?v=yXWIfpAqRlQ', channel: '4retailers', why: 'Using GMROI to compare categories and products.' },
    ],
  },
  {
    title: 'Buying & merchandising',
    blurb: 'What buyers and merchandisers actually do.',
    videos: [
      { title: 'Retail buyer career video', url: 'https://www.youtube.com/watch?v=M2dXriu30nA', channel: 'CareerOneStop', why: 'A 90-second overview of the buyer job (U.S. Dept. of Labor-sponsored).' },
      { title: 'Retail careers: what buyer jobs are like', url: 'https://www.youtube.com/watch?v=7_mW_NNso60', channel: 'CareersOutThere', why: 'Real buyers on negotiation, numbers, and trends.' },
      { title: 'What I do as a fashion buyer / merchandiser', url: 'https://www.youtube.com/watch?v=MQlfiJV6SRk', channel: 'pattycore', why: 'A day-to-day look at assortments, vendors, and sales reviews.' },
      { title: 'Planograms: an introduction to visual merchandising', url: 'https://www.youtube.com/watch?v=rLEC4NlduLY', channel: 'SMSB Consulting', why: 'Two minutes on what planograms are and why they matter.' },
      { title: 'Visual merchandising basics', url: 'https://www.youtube.com/watch?v=tOjkQfzE0mY', channel: 'ZenGenius', why: 'Focal points, color, and displays that sell.' },
      { title: '7 key elements of visual merchandising', url: 'https://www.youtube.com/watch?v=wUy5o0TxDCY', channel: 'Taylor', why: 'A quick checklist for store layouts and displays.' },
    ],
  },
  {
    title: 'Exam concepts',
    blurb: 'Short explainers for heavily tested ideas.',
    videos: [
      { title: 'The 4 Ps of the marketing mix, simplified', url: 'https://www.youtube.com/watch?v=Mco8vBAwOmA', why: 'Product, price, place, promotion: the frame for most questions.', kit: true },
      { title: 'Product life cycle explained', url: 'https://www.youtube.com/watch?v=7YWJqxeqj2w', channel: 'EPM', why: 'Pairs with the life-cycle diagram in the visual guide.', kit: true },
      { title: 'Market segmentation: geographic, demographic, psychographic, behavioral', url: 'https://www.youtube.com/watch?v=PxC0zWc2tsA', why: 'The four segmentation types the exam tests.', kit: true },
      { title: 'Distribution channels explained', url: 'https://www.youtube.com/watch?v=_MrDlmHO7jQ', why: 'Direct vs. indirect channels and intermediaries.', kit: true },
      { title: 'Promotional mix explained', url: 'https://www.youtube.com/watch?v=ZxgsJ3t1nq0', why: 'Advertising, sales promotion, personal selling, PR.', kit: true },
      { title: 'Primary vs. secondary research in 4 minutes', url: 'https://www.youtube.com/watch?v=OeF93Q8gPsM', why: 'The most-tested Marketing-Information Management idea.', kit: true },
      { title: 'Business cycles explained in 5 minutes', url: 'https://www.youtube.com/watch?v=NwqP8IcYpYs', why: 'Expansion, peak, contraction, trough.', kit: true },
      { title: 'Penetration pricing vs. price skimming', url: 'https://www.youtube.com/watch?v=vq5PlqSBsVk', why: 'The two introduction-stage pricing strategies.', kit: true },
    ],
  },
]

export const ALL_VIDEOS = VIDEO_GROUPS.flatMap((g) => g.videos)
export const VIDEOS_CHECKED = 'October 16, 2026'
