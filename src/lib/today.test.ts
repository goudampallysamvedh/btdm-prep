import { describe, expect, it } from 'vitest'
import { buildPlan, DAILY_GOAL } from './today'
import { streak } from './dates'

const base = { counts: {}, focusArea: 'PM' as const, lessonsDone: {}, trendsRead: {} }
const day = (d: number) => new Date(2026, 9, 18 + d, 15) // Oct 18 2026 is a Sunday

describe("Today's plan", () => {
  it('always has three steps with modest goals (about 15 minutes)', () => {
    for (let d = 0; d < 7; d++) {
      const steps = buildPlan({ ...base, now: day(d) })
      expect(steps).toHaveLength(3)
      expect(steps[0].title).toContain(String(DAILY_GOAL.cards))
      expect(steps[1].title).toContain(String(DAILY_GOAL.questions))
      // Never a full case or a 100-question mock as a daily task.
      for (const s of steps) expect(s.to).not.toMatch(/\/exam\/mock|\/cases\/(?!judge)[a-z]/)
    }
    expect(DAILY_GOAL.cards).toBeLessThanOrEqual(20)
    expect(DAILY_GOAL.questions).toBeLessThanOrEqual(10)
  })
  it('rotates the third step through the week', () => {
    const third = [0, 1, 2, 3, 4, 5, 6].map((d) => buildPlan({ ...base, now: day(d) })[2].to.split('?')[0].split('/').slice(0, 3).join('/'))
    expect(third).toEqual(['/learn/trends', '/learn/lessons', '/math', '/cases/judge', '/learn/lessons', '/math', '/cases/judge'])
  })
  it('checks off steps when the small goals are met', () => {
    const steps = buildPlan({ ...base, counts: { cards: DAILY_GOAL.cards, questions: 4, math: DAILY_GOAL.math }, now: day(2) })
    expect(steps[0].done).toBe(true)
    expect(steps[1].done).toBe(false)
    expect(steps[1].progress).toEqual({ have: 4, need: DAILY_GOAL.questions })
    expect(steps[2].done).toBe(true)
  })
})

describe('streak days', () => {
  it("only counts a lesson or trend read on that same day", () => {
    const monday = day(1)
    const sundayEvening = new Date(2026, 9, 18, 21).getTime()
    const tuesdayMorning = new Date(2026, 9, 20, 8).getTime()
    const counts = { cards: DAILY_GOAL.cards, questions: DAILY_GOAL.questions }
    expect(buildPlan({ ...base, counts, lessonsDone: { risk: sundayEvening }, now: monday })[2].done).toBe(false)
    expect(buildPlan({ ...base, counts, lessonsDone: { risk: tuesdayMorning }, now: monday })[2].done).toBe(false)
    expect(buildPlan({ ...base, counts, lessonsDone: { risk: monday.getTime() }, now: monday }).every((s) => s.done)).toBe(true)
  })
  it('streak counts finished-plan days, with today optional until it is done', () => {
    const now = new Date(2026, 9, 18, 15)
    expect(streak({ '2026-10-17': 1, '2026-10-16': 1 }, now)).toBe(2)
    expect(streak({ '2026-10-18': 1, '2026-10-17': 1, '2026-10-16': 1 }, now)).toBe(3)
    expect(streak({ '2026-10-16': 1 }, now)).toBe(0)
  })
})
