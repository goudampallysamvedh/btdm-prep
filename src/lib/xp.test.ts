import { describe, expect, it } from 'vitest'
import { badgesOf, earned, levelFor, longestStreak, xpOf, type XpSource } from './xp'

const empty: XpSource = { tests: [], leitner: {}, lessonsDone: {}, trendsRead: {}, judgeDrill: {}, caseAttempts: [], mathStats: {}, planDone: {} }

describe('xp', () => {
  it('starts at level 1 with nothing earned', () => {
    expect(xpOf(empty)).toBe(0)
    expect(levelFor(0)).toEqual({ level: 1, rank: 'Stock Associate', into: 0, span: 100 })
    expect(badgesOf(empty).some(earned)).toBe(false)
  })

  it('levels up at 100, 300, 600 XP', () => {
    expect(levelFor(99).level).toBe(1)
    expect(levelFor(100)).toMatchObject({ level: 2, into: 0, span: 200 })
    expect(levelFor(300).level).toBe(3)
    expect(levelFor(650)).toMatchObject({ level: 4, into: 50 })
    expect(levelFor(1e9).rank).toBe('Chief Merchant')
  })

  it('counts answers, cards and plan days', () => {
    const s: XpSource = {
      ...empty,
      tests: [{ id: 't', kind: 'mock', title: '', startedAt: 0, finishedAt: 0, answers: [{ qid: 'a', chosen: 0, correct: true, ms: 1 }, { qid: 'b', chosen: 1, correct: false, ms: 1 }] }],
      leitner: { c: { box: 1, due: 0, seen: 3, lapses: 0 } },
      planDone: { '2026-11-01': 1 },
    }
    expect(xpOf(s)).toBe(2 * 2 + 1 + 3 + 25)
    expect(badgesOf(s).filter(earned).map((b) => b.id)).toEqual(['first', 'mock'])
  })

  it('finds the longest run of days across month ends', () => {
    expect(longestStreak({})).toBe(0)
    expect(longestStreak({ '2026-10-30': 1, '2026-10-31': 1, '2026-11-01': 1, '2026-11-05': 1 })).toBe(3)
  })
})
