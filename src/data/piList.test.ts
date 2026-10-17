import { describe, expect, it } from 'vitest'
import { PI_LIST } from './piList'
import { PI_NOTES, PI_GUIDE } from './piNotes'
import { QUESTIONS } from './questions'
import { CASES } from './cases'
import { AREA_CODES } from './areas'
import { LESSONS } from './lessons'
import { TRENDS } from './trends'
import { FLASHCARDS } from './flashcards'

describe('2026-27 performance indicator list', () => {
  it('has all 450 Tier 1 and Tier 2 PIs with unique codes', () => {
    expect(PI_LIST).toHaveLength(450)
    expect(new Set(PI_LIST.map((p) => p.code)).size).toBe(450)
    for (const p of PI_LIST) {
      expect(p.code).toMatch(/^[A-Z]{2}:\d{3}$/)
      expect(AREA_CODES).toContain(p.code.slice(0, 2))
      expect(p.text.length).toBeGreaterThan(8)
    }
  })
  it('gives every PI a plain-language explanation, and no notes for unknown codes', () => {
    const codes = new Set(PI_LIST.map((p) => p.code))
    for (const p of PI_GUIDE) expect(p.plain.length, p.code).toBeGreaterThan(20)
    for (const k of Object.keys(PI_NOTES)) expect(codes.has(k), `note for unknown ${k}`).toBe(true)
  })
  it('keeps explanations short enough for a flashcard', () => {
    for (const p of PI_GUIDE) expect(p.plain.length, p.code).toBeLessThanOrEqual(230)
  })
  it('covers every PI used by the question bank and the cases', () => {
    const codes = new Set(PI_LIST.map((p) => p.code))
    for (const c of CASES) for (const p of c.pis) expect(codes.has(p.code), `${c.id} ${p.code}`).toBe(true)
    const missing = QUESTIONS.map((q) => q.pi).filter((pi) => !codes.has(pi))
    expect([...new Set(missing)]).toEqual([])
    for (const l of LESSONS) for (const pi of l.pis) expect(codes.has(pi), `lesson ${l.id} ${pi}`).toBe(true)
    for (const t of TRENDS) for (const pi of t.pis) expect(codes.has(pi), `trend ${t.id} ${pi}`).toBe(true)
  })
  it('turns every PI into a flashcard', () => {
    expect(FLASHCARDS.filter((c) => c.deck === 'pi')).toHaveLength(450)
  })
})
