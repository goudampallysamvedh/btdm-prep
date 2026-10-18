import type { AreaCode } from '@/types'
import type { PartnerSummary } from './store'
import type { AreaReadiness } from './mastery'
import { AREA_BY_CODE } from '@/data/areas'

export interface HelpIdea {
  area: AreaCode
  mine: number
  theirs: number
}

const STRONG = 0.7
const WEAK = 0.65
const MIN_ANSWERED = 5

/**
 * Where partners can coach each other: areas where one of you is strong and the other is weak.
 * Heavier exam areas come first. Only counts your areas with enough answers to trust.
 */
export function helpIdeas(mine: AreaReadiness[], p: PartnerSummary): { youHelp: HelpIdea[]; theyHelp: HelpIdea[] } {
  const rows = mine
    .filter((m) => m.answered >= MIN_ANSWERED && p.areas[m.area] !== undefined)
    .map((m) => ({ area: m.area, mine: m.accuracy, theirs: p.areas[m.area], weight: AREA_BY_CODE[m.area].weight }))
  const rank = (a: { weight: number; mine: number; theirs: number }) => a.weight * Math.abs(a.mine - a.theirs)
  const strip = ({ area, mine: m, theirs }: HelpIdea & { weight: number }): HelpIdea => ({ area, mine: m, theirs })
  return {
    youHelp: rows.filter((r) => r.mine >= STRONG && r.theirs < WEAK).sort((a, b) => rank(b) - rank(a)).slice(0, 2).map(strip),
    theyHelp: rows.filter((r) => r.theirs >= STRONG && r.mine < WEAK).sort((a, b) => rank(b) - rank(a)).slice(0, 2).map(strip),
  }
}
