import type { AreaCode, Topic } from '@/types'
import { AREAS } from './areas'

/**
 * Buying & merchandising topics. Each maps to the exam area it most belongs to,
 * so practice on these topics also moves that area's readiness.
 */
const MERCH: Topic[] = [
  { id: 'M.assortment', area: 'PM', name: 'Assortment planning (breadth vs. depth)', links: [{ kind: 'lesson', id: 'assortment' }] },
  { id: 'M.category', area: 'PM', name: 'Category management', links: [{ kind: 'lesson', id: 'category' }] },
  { id: 'M.vendor', area: 'OP', name: 'Vendor selection & negotiation', links: [{ kind: 'lesson', id: 'vendors' }] },
  { id: 'M.privatelabel', area: 'PM', name: 'Private label vs. national brands', links: [{ kind: 'lesson', id: 'private-label' }] },
  { id: 'M.visual', area: 'PR', name: 'Visual merchandising & planograms', links: [{ kind: 'lesson', id: 'visual-merch' }] },
  { id: 'M.inventory', area: 'OP', name: 'Inventory control', links: [{ kind: 'lesson', id: 'inventory' }, { kind: 'visual', id: 'inventory-flow' }] },
  { id: 'M.seasonal', area: 'MP', name: 'Seasonal & merchandise planning', links: [{ kind: 'lesson', id: 'seasonal' }, { kind: 'math', id: 'six-month-plan' }] },
  { id: 'M.omni', area: 'CM', name: 'Omnichannel retail', links: [{ kind: 'lesson', id: 'omnichannel' }] },
  { id: 'M.markdown', area: 'PI', name: 'Markdown strategy', links: [{ kind: 'lesson', id: 'markdowns' }, { kind: 'visual', id: 'markdown-timing' }, { kind: 'math', id: 'markdown' }] },
  { id: 'M.kpi', area: 'FI', name: 'Retail KPIs', links: [{ kind: 'lesson', id: 'kpis' }, { kind: 'math', id: 'turnover' }] },
  { id: 'M.math', area: 'PI', name: 'Retail math formulas', links: [{ kind: 'math', id: 'markup' }] },
  { id: 'T.trends', area: 'MK', name: 'Industry trends', links: [{ kind: 'trend', id: '' }] },
]

/** Extra study links for exam-area topics. */
const EXTRA_LINKS: Record<string, Topic['links']> = {
  'PM.plc': [{ kind: 'visual', id: 'plc' }],
  'PM.position': [{ kind: 'lesson', id: 'private-label' }],
  'PM.mix': [{ kind: 'lesson', id: 'assortment' }],
  'PI.strategies': [{ kind: 'lesson', id: 'pricing' }, { kind: 'math', id: 'markup' }],
  'PI.factors': [{ kind: 'lesson', id: 'pricing' }, { kind: 'math', id: 'breakeven' }],
  'EC.cycle': [{ kind: 'visual', id: 'business-cycle' }],
  'EC.utility': [{ kind: 'visual', id: 'utility' }],
  'CM.channels': [{ kind: 'visual', id: 'channels' }],
  'PR.mix': [{ kind: 'visual', id: 'promo-mix' }],
  'MP.segment': [{ kind: 'visual', id: 'segmentation' }],
  'IM.data': [{ kind: 'visual', id: 'research' }],
  'IM.design': [{ kind: 'visual', id: 'research' }],
  'SM.mgmt': [{ kind: 'visual', id: 'management' }],
  'OP.purchasing': [{ kind: 'lesson', id: 'vendors' }],
  'OP.costs': [{ kind: 'math', id: 'breakeven' }],
  'CM.intensity': [{ kind: 'lesson', id: 'omnichannel' }],
}

/** One hidden topic per area so PI flashcards count toward that area. */
const PI_TOPICS: Topic[] = AREAS.map((a) => ({ id: `${a.code}.pi`, area: a.code, name: `${a.name} PIs`, hidden: true, links: [{ kind: 'pi' as const, id: a.code }] }))

export const TOPICS: Topic[] = [
  ...AREAS.flatMap((a) =>
    a.terms.map((t) => ({
      id: t.id,
      area: a.code,
      name: t.term.replace(/\s*\(NEW\)$/, ''),
      links: [{ kind: 'guide' as const, id: a.code }, ...(EXTRA_LINKS[t.id] ?? [])],
    })),
  ),
  ...MERCH,
  ...PI_TOPICS,
]

export const TOPIC_BY_ID: Record<string, Topic> = Object.fromEntries(TOPICS.map((t) => [t.id, t]))

export function topicsForArea(code: AreaCode): Topic[] {
  return TOPICS.filter((t) => t.area === code)
}
