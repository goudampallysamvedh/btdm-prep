import { describe, expect, it } from 'vitest'
import { TRENDS, TRENDS_CHECKED, TREND_CARDS, TREND_QUESTIONS } from './trends'
import { CASES } from './cases'

describe('industry trends', () => {
  it('has a valid last-checked date that is not in the future', () => {
    expect(TRENDS_CHECKED).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(new Date(TRENDS_CHECKED + 'T00:00:00').getTime()).toBeLessThanOrEqual(Date.now() + 86_400_000)
  })
  it('has unique ids and at least 12 trends', () => {
    expect(TRENDS.length).toBeGreaterThanOrEqual(12)
    expect(new Set(TRENDS.map((t) => t.id)).size).toBe(TRENDS.length)
  })
  it.each(TRENDS.map((t) => [t.id, t] as const))('%s is complete and every stat cites a real source', (_id, t) => {
    expect(t.title.length).toBeGreaterThan(3)
    expect(t.what.length).toBeGreaterThan(40)
    expect(t.asOf.length).toBeGreaterThan(3)
    expect(t.sayIt.length).toBeGreaterThan(20)
    expect(t.data.length).toBeGreaterThanOrEqual(1)
    expect(t.sources.length).toBeGreaterThanOrEqual(1)
    for (const s of t.sources) expect(s.url).toMatch(/^https:\/\//)
    for (const d of t.data) {
      expect(d.source).toBeGreaterThanOrEqual(0)
      expect(d.source).toBeLessThan(t.sources.length)
      expect(d.stat.length).toBeGreaterThan(20)
    }
    for (const p of t.pis) expect(p).toMatch(/^[A-Z]{2}:\d{3}$/)
  })
  it('keeps every trend that a case links to', () => {
    const ids = new Set(TRENDS.map((t) => t.id))
    for (const c of CASES) for (const t of c.trends) expect(ids.has(t), `${c.id} → ${t}`).toBe(true)
  })
  it('keeps trend flashcards and questions', () => {
    expect(TREND_CARDS.length).toBeGreaterThanOrEqual(8)
    expect(TREND_QUESTIONS.length).toBeGreaterThanOrEqual(6)
  })
})
