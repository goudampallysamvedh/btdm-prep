import { describe, expect, it } from 'vitest'
import type { TestRecord } from '@/types'
import { QUESTIONS } from '@/data/questions'
import { BLUEPRINT } from '@/data/areas'
import { statusFrom, buildReport, areaReadiness, projectedScore, missedQuestionIds, type Evidence } from './mastery'
import { drawMock, drawPractice } from './exam'
import { rng } from './random'
import { streak, daysUntil } from './dates'

const ev = (correct: boolean, session: string, at: number): Evidence => ({ topic: 'PM.plc', correct, session, at, kind: 'question' })

describe('topic status', () => {
  it('is unseen with no evidence', () => expect(statusFrom([])).toBe('unseen'))
  it('is shaky after a single correct answer', () => expect(statusFrom([ev(true, 'a', 1)])).toBe('shaky'))
  it('needs two separate sessions to count as learned', () => {
    expect(statusFrom([ev(true, 'a', 1), ev(true, 'a', 2)])).toBe('shaky')
    expect(statusFrom([ev(true, 'a', 1), ev(true, 'b', 2)])).toBe('learned')
  })
  it('is need-to-learn when the latest answers are wrong', () => {
    expect(statusFrom([ev(false, 'a', 1)])).toBe('need')
    expect(statusFrom([ev(true, 'a', 1), ev(false, 'b', 2), ev(false, 'c', 3)])).toBe('need')
  })
  it('drops from learned when the last answer is wrong', () => {
    expect(statusFrom([ev(true, 'a', 1), ev(true, 'b', 2), ev(true, 'c', 3), ev(false, 'd', 4)])).toBe('shaky')
  })
})

function makeTest(id: string, at: number, qids: string[], correct: boolean[]): TestRecord {
  return {
    id, kind: 'practice', title: id, startedAt: at - 1000, finishedAt: at,
    answers: qids.map((qid, i) => {
      const q = QUESTIONS.find((x) => x.id === qid)!
      return { qid, chosen: correct[i] ? q.answer : (q.answer + 1) % 4, correct: correct[i], ms: 1000 }
    }),
  }
}

describe('test report', () => {
  const plc = QUESTIONS.filter((q) => q.topic === 'PM.plc').map((q) => q.id)
  const t1 = makeTest('t1', 10_000, plc.slice(0, 2), [true, false])
  const t2 = makeTest('t2', 20_000, plc.slice(2, 4), [true, true])
  it('scores and groups by topic', () => {
    const r = buildReport(t1, [t1], {})
    expect(r.right).toBe(1)
    expect(r.total).toBe(2)
    expect(r.topics[0].topic).toBe('PM.plc')
  })
  it('detects newly learned topics compared with the previous test', () => {
    const r = buildReport(t2, [t1, t2], {})
    const line = r.topics.find((t) => t.topic === 'PM.plc')!
    expect(line.before).not.toBe('learned')
    expect(line.status).toBe('learned')
    expect(r.newlyLearned.map((t) => t.topic)).toContain('PM.plc')
    expect(r.previous?.id).toBe('t1')
  })
  it('lists missed questions until answered correctly', () => {
    expect(missedQuestionIds([t1])).toEqual([plc[1]])
    const fix = makeTest('t3', 30_000, [plc[1]], [true])
    expect(missedQuestionIds([t1, fix])).toEqual([])
  })
})

describe('readiness', () => {
  it('starts at a neutral 50% projection', () => {
    expect(Math.round(projectedScore(areaReadiness([])))).toBe(50)
  })
})

describe('mock exam draw', () => {
  it('matches the blueprint exactly with 100 unique questions', () => {
    const qs = drawMock([], rng(42))
    expect(qs).toHaveLength(100)
    expect(new Set(qs.map((q) => q.id)).size).toBe(100)
    const counts: Record<string, number> = {}
    for (const q of qs) counts[q.area] = (counts[q.area] ?? 0) + 1
    expect(counts).toEqual(BLUEPRINT)
  })
  it('smart practice returns the requested count', () => {
    expect(drawPractice({ mode: 'smart', count: 20 }, [], rng(7))).toHaveLength(20)
    expect(drawPractice({ mode: 'area', area: 'PI', count: 10 }, [], rng(7)).every((q) => q.area === 'PI')).toBe(true)
  })
})

describe('dates', () => {
  it('counts a streak that includes yesterday', () => {
    const now = new Date(2026, 9, 16, 12)
    expect(streak({ '2026-10-15': 3, '2026-10-14': 1 }, now)).toBe(2)
    expect(streak({ '2026-10-16': 1, '2026-10-15': 3 }, now)).toBe(2)
    expect(streak({ '2026-10-13': 1 }, now)).toBe(0)
  })
  it('counts days until a date', () => {
    expect(daysUntil('2026-10-20', new Date(2026, 9, 16, 23))).toBe(4)
    expect(daysUntil('bad')).toBeNull()
  })
})
