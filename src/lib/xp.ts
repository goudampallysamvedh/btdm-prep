import type { ProgressData } from './store'
import { dayKey } from './dates'

/** XP is derived from saved progress, never stored, so it syncs and survives imports for free. */
export type XpSource = Pick<ProgressData, 'tests' | 'leitner' | 'lessonsDone' | 'trendsRead' | 'judgeDrill' | 'caseAttempts' | 'mathStats' | 'planDone'>

export function xpOf(s: XpSource): number {
  const answered = s.tests.reduce((n, t) => n + t.answers.length, 0)
  const correct = s.tests.reduce((n, t) => n + t.answers.filter((a) => a.correct).length, 0)
  const cards = Object.values(s.leitner).reduce((n, c) => n + c.seen, 0)
  const math = Object.values(s.mathStats).reduce((n, m) => n + m.tried + m.correct, 0)
  return (
    answered * 2 + correct +
    cards +
    math * 2 +
    Object.keys(s.lessonsDone).length * 20 +
    Object.keys(s.trendsRead).length * 10 +
    Object.keys(s.judgeDrill).length * 5 +
    s.caseAttempts.length * 40 +
    Object.keys(s.planDone).length * 25
  )
}

/** Career ladder on the merchandise floor; level n starts at 100·n(n−1)/2 XP. */
const RANKS = ['Stock Associate', 'Sales Floor Lead', 'Department Lead', 'Assistant Buyer', 'Buyer', 'Senior Buyer', 'Merchandise Manager', 'Divisional Merch. Manager', 'General Merch. Manager', 'Chief Merchant']
const startOf = (level: number) => (100 * level * (level - 1)) / 2

export interface Level { level: number; rank: string; into: number; span: number }

export function levelFor(xp: number): Level {
  let level = 1
  while (xp >= startOf(level + 1)) level++
  return { level, rank: RANKS[Math.min(level, RANKS.length) - 1], into: xp - startOf(level), span: startOf(level + 1) - startOf(level) }
}

/** Longest run of consecutive days in a day-keyed record. */
export function longestStreak(days: Record<string, number>): number {
  let best = 0
  for (const k of Object.keys(days)) {
    const [y, m, d] = k.split('-').map(Number)
    const prev = new Date(y, m - 1, d - 1)
    if (days[dayKey(prev)]) continue // not the start of a run
    let n = 0
    const cur = new Date(y, m - 1, d)
    while (days[dayKey(cur)]) { n++; cur.setDate(cur.getDate() + 1) }
    best = Math.max(best, n)
  }
  return best
}

export interface Badge { id: string; emoji: string; name: string; how: string; have: number; need: number }

export function badgesOf(s: XpSource): Badge[] {
  const answered = s.tests.reduce((n, t) => n + t.answers.length, 0)
  const cards = Object.values(s.leitner).reduce((n, c) => n + c.seen, 0)
  const mathRight = Object.values(s.mathStats).reduce((n, m) => n + m.correct, 0)
  const mocks = s.tests.filter((t) => t.kind === 'mock').length
  const best = Math.max(0, ...s.tests.filter((t) => t.answers.length >= 10).map((t) => t.answers.filter((a) => a.correct).length / t.answers.length))
  return [
    { id: 'first', emoji: '🏷️', name: 'First Sale', how: 'Answer your first exam question', have: answered, need: 1 },
    { id: 'q500', emoji: '📦', name: 'Full Stockroom', how: 'Answer 500 exam questions', have: answered, need: 500 },
    { id: 'cards', emoji: '🃏', name: 'Card Shark', how: 'Review 200 flashcards', have: cards, need: 200 },
    { id: 'streak', emoji: '🔥', name: 'Hot Streak', how: 'Finish the daily plan 7 days in a row', have: longestStreak(s.planDone), need: 7 },
    { id: 'mock', emoji: '⏱️', name: 'Dress Rehearsal', how: 'Finish a timed mock exam', have: mocks, need: 1 },
    { id: 'ace', emoji: '🎯', name: 'Markdown Master', how: 'Score 90%+ on a test of 10+ questions', have: Math.round(best * 100), need: 90 },
    { id: 'case', emoji: '💼', name: 'Case Closed', how: 'Score a role-play case', have: s.caseAttempts.length, need: 1 },
    { id: 'math', emoji: '🧮', name: 'Margin Maven', how: 'Get 50 retail math problems right', have: mathRight, need: 50 },
    { id: 'lessons', emoji: '📚', name: 'Scholar', how: 'Finish 5 lessons', have: Object.keys(s.lessonsDone).length, need: 5 },
    { id: 'trends', emoji: '📈', name: 'Trend Spotter', how: 'Read 10 industry trends', have: Object.keys(s.trendsRead).length, need: 10 },
  ]
}

export const earned = (b: Badge) => b.have >= b.need
