import { describe, expect, it } from 'vitest'
import { CASES } from './cases'
import { TREND_BY_ID } from './trends'
import { JUDGE_QUESTIONS } from './judgeQuestions'
import { WARMUPS } from './warmups'
import { maxTotal, levelOf, pointsForLevel, rubricLines, fixFirst } from '@/lib/caseScore'
import { emptyPlan, planChecks } from '@/pages/cases/CasePlanner'

describe('case studies', () => {
  it('has at least 8 cases with unique ids', () => {
    expect(CASES.length).toBeGreaterThanOrEqual(8)
    expect(new Set(CASES.map((c) => c.id)).size).toBe(CASES.length)
  })
  it.each(CASES.map((c) => [c.id, c] as const))('%s follows the BTDM format', (_id, c) => {
    expect(c.pis).toHaveLength(5)
    for (const p of c.pis) {
      expect(p.code).toMatch(/^[A-Z]{2}:\d{3}$/)
      expect(p.key.length).toBeGreaterThanOrEqual(3)
    }
    expect(new Set(c.pis.map((p) => p.code)).size).toBe(5)
    expect(c.competencies).toHaveLength(3)
    expect(c.roles).toHaveLength(2)
    expect(c.judgeQuestions).toHaveLength(2)
    expect(c.tasks.length).toBeGreaterThanOrEqual(3)
    expect(c.data.length).toBeGreaterThanOrEqual(1)
    for (const t of c.data) for (const r of t.rows) expect(r.length, t.title).toBe(t.columns.length)
    for (const t of c.trends) expect(TREND_BY_ID[t], t).toBeDefined()
    // Both roles get PIs
    expect(c.pis.some((p) => p.fits === 0)).toBe(true)
    expect(c.pis.some((p) => p.fits === 1)).toBe(true)
    // The rubric totals 100 points, like the 2026 sample form.
    expect(maxTotal(c)).toBe(100)
  })
})

describe('rubric scoring', () => {
  it('maps points to DECA bands', () => {
    expect(levelOf(3, 10)).toBe(0)
    expect(levelOf(4, 10)).toBe(1)
    expect(levelOf(9, 10)).toBe(2)
    expect(levelOf(10, 10)).toBe(3)
    expect(levelOf(2, 8)).toBe(0)
    expect(levelOf(6, 8)).toBe(2)
    expect(levelOf(5, 6)).toBe(2)
    expect(levelOf(6, 6)).toBe(3)
    for (const max of [6, 8, 10]) for (const l of [0, 1, 2, 3] as const) expect(levelOf(pointsForLevel(l, max), max)).toBe(l)
  })
  it('suggests the weakest lines to fix first', () => {
    const lines = rubricLines(CASES[0]).map((l, i) => ({ ...l, points: i === 2 ? 1 : l.max }))
    const f = fixFirst(lines)
    expect(f).toHaveLength(1)
    expect(f[0].label).toContain(CASES[0].pis[2].code)
  })
})

describe('partner planner checks', () => {
  it('flags an empty plan and passes a complete one', () => {
    const c = CASES[0]
    const p = emptyPlan(c)
    expect(planChecks(c, p).every((x) => x.ok)).toBe(false)
    const full = {
      ...p,
      owners: { 0: 'A', 1: 'B', 2: 'A', 3: 'B', 4: 'B' } as Record<number, 'A' | 'B'>,
      points: Object.fromEntries(c.pis.map((_, i) => [i, 'Define, explain, apply with a number'])),
      handoffs: { 0: 'Over to you', 1: 'Back to me', 2: 'Your turn now' },
      opener: 'Hello, thank you for meeting us',
      closer: 'To recap, questions?',
      solution: 'Launch three drops, July 15, 65% sell-through goal',
    }
    expect(planChecks(c, full).every((x) => x.ok)).toBe(true)
  })
})

describe('judge questions and warm-ups', () => {
  it('has 100+ unique judge questions with tips', () => {
    expect(JUDGE_QUESTIONS.length).toBeGreaterThanOrEqual(100)
    expect(new Set(JUDGE_QUESTIONS.map((q) => q.q)).size).toBe(JUDGE_QUESTIONS.length)
    for (const q of JUDGE_QUESTIONS) expect(q.tip.length).toBeGreaterThan(10)
  })
  it('keeps all 7 kit scenarios', () => {
    expect(WARMUPS).toHaveLength(7)
    for (const w of WARMUPS) expect(w.pis).toHaveLength(5)
  })
})
