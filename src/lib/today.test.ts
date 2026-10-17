import { describe, expect, it } from 'vitest'
import { buildPlan, DAILY_GOAL } from './today'

const base = { counts: {}, focusArea: 'PM' as const, lessonsDone: {}, trendsRead: {} }
const day = (d: number) => new Date(2026, 9, 18 + d, 15) // Oct 18 2026 is a Sunday

describe("Today's plan", () => {
  it('always has three small steps with small goals', () => {
    for (let d = 0; d < 7; d++) {
      const steps = buildPlan({ ...base, now: day(d) })
      expect(steps).toHaveLength(3)
      expect(steps[0].title).toContain(String(DAILY_GOAL.cards))
      expect(steps[1].title).toContain(String(DAILY_GOAL.questions))
      // Never a full case or a 100-question mock as a daily task.
      for (const s of steps) expect(s.to).not.toMatch(/\/exam\/mock|\/cases\/(?!judge)[a-z]/)
    }
    expect(DAILY_GOAL.cards).toBeLessThanOrEqual(10)
    expect(DAILY_GOAL.questions).toBeLessThanOrEqual(5)
  })
  it('rotates the third step through the week', () => {
    const third = [0, 1, 2, 3, 4, 5, 6].map((d) => buildPlan({ ...base, now: day(d) })[2].to.split('?')[0].split('/').slice(0, 3).join('/'))
    expect(third).toEqual(['/learn/trends', '/learn/lessons', '/math', '/cases/judge', '/learn/lessons', '/math', '/cases/judge'])
  })
  it('checks off steps when the small goals are met', () => {
    const steps = buildPlan({ ...base, counts: { cards: 10, questions: 4, math: 3 }, now: day(2) })
    expect(steps[0].done).toBe(true)
    expect(steps[1].done).toBe(false)
    expect(steps[1].progress).toEqual({ have: 4, need: 5 })
    expect(steps[2].done).toBe(true)
  })
})
