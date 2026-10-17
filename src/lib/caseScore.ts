import type { CaseScoreLine } from '@/types'
import type { CaseStudy } from '@/data/cases'
import { COMPETENCIES, RUBRIC_POINTS, SOLUTION_CRITERIA } from '@/data/playbook'

/** Rubric lines for a case, matching the 2026 BTDM sample evaluation form (total 100). */
export function rubricLines(c: CaseStudy): Omit<CaseScoreLine, 'points'>[] {
  return [
    ...c.pis.map((p, i) => ({ key: `pi${i}`, label: `${p.code} ${p.text}`, max: RUBRIC_POINTS.pi.max })),
    ...SOLUTION_CRITERIA.map((s) => ({ key: `sol-${s.key}`, label: `Solution: ${s.label}`, max: RUBRIC_POINTS.solution.max })),
    ...c.competencies.map((k) => ({ key: `cc-${k}`, label: COMPETENCIES.find((x) => x.key === k)!.label, max: RUBRIC_POINTS.competency.max })),
    { key: 'overall', label: 'Overall impression', max: RUBRIC_POINTS.overall.max },
  ]
}

export function maxTotal(c: CaseStudy): number {
  return rubricLines(c).reduce((s, l) => s + l.max, 0)
}

/** Level index (0 Novice … 3 Exemplary) for a score on a line with this max. */
export function levelOf(points: number, max: number): 0 | 1 | 2 | 3 {
  if (points >= max) return 3
  const bands: Record<number, number[]> = { 10: [3, 6, 9], 8: [2, 5, 7], 6: [1, 3, 5] }
  const b = bands[max] ?? [max * 0.3, max * 0.6, max * 0.9]
  return points <= b[0] ? 0 : points <= b[1] ? 1 : points <= b[2] ? 2 : 3
}

/** Points to award when a level is tapped: the top of that level's band. */
export function pointsForLevel(level: 0 | 1 | 2 | 3, max: number): number {
  const tops: Record<number, number[]> = { 10: [3, 6, 9, 10], 8: [2, 5, 7, 8], 6: [1, 3, 5, 6] }
  return (tops[max] ?? [Math.round(max * 0.3), Math.round(max * 0.6), Math.round(max * 0.9), max])[level]
}

const FIX_TIPS: Record<string, string> = {
  pi: 'Use define → explain → apply: one-sentence definition, why it matters for this business, then a specific recommendation with a number or date.',
  'sol-unique': 'Add one idea the judge hasn\'t heard all day. Borrow from a current trend.',
  'sol-practical': 'Show it can really happen: who does what, by when, and roughly what it costs.',
  'sol-effective': 'Tie the solution to the case\'s goal with 2–3 measurable targets.',
  'cc-critical': 'Use the case facts and numbers as evidence; do one quick calculation.',
  'cc-communication': 'Slow down, make eye contact, drop filler words, and preview your structure.',
  'cc-decision': 'Commit to one recommendation and name the tradeoff and backup plan.',
  'cc-collaboration': 'Plan handoffs that build on each other, and split the judge questions.',
  'cc-innovation': 'Add a creative twist: a new channel, partnership, or experience.',
  overall: 'Stand tall, greet the judge in character, and close by thanking them and inviting questions.',
}

export function fixFirst(lines: CaseScoreLine[], n = 3): { label: string; tip: string; pct: number }[] {
  return [...lines]
    .map((l) => ({ l, pct: l.points / l.max }))
    .filter((x) => x.pct < 0.7)
    .sort((a, b) => a.pct - b.pct || b.l.max - a.l.max)
    .slice(0, n)
    .map(({ l, pct }) => ({ label: l.label, pct, tip: FIX_TIPS[l.key.startsWith('pi') ? 'pi' : l.key] ?? '' }))
}
