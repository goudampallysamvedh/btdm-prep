import { describe, expect, it } from 'vitest'
import { GENERATORS, displayAnswer, isCorrect, parseAnswer } from './mathProblems'
import { rng } from './random'
import * as M from './retailMath'

describe('problem generators', () => {
  it.each(GENERATORS.map((g) => [g.kind, g] as const))('%s produces valid, self-consistent problems', (_k, g) => {
    for (let seed = 1; seed <= 300; seed++) {
      const p = g.make(rng(seed))
      expect(Number.isFinite(p.answer), `${g.kind} seed ${seed}`).toBe(true)
      expect(p.answer, `${g.kind} seed ${seed}: ${p.prompt}`).toBeGreaterThan(0)
      expect(p.steps.length).toBeGreaterThan(0)
      expect(p.prompt).not.toMatch(/NaN|undefined|Infinity/)
      for (const s of p.steps) expect(s).not.toMatch(/NaN|undefined|Infinity/)
      // The displayed answer must be accepted by the checker.
      const typed = parseAnswer(displayAnswer(p))
      expect(typed, displayAnswer(p)).not.toBeNull()
      expect(isCorrect(p, typed!), `${g.kind} seed ${seed}: ${displayAnswer(p)}`).toBe(true)
      // The worked solution ends with (or contains) the answer for money and percent problems.
      if (p.unit === '$' || p.unit === '%') {
        const shown = p.unit === '$' ? M.money(p.answer) : M.pct(p.answer)
        expect(p.steps.join(' '), `${g.kind} seed ${seed}`).toContain(shown)
      }
      // Percent answers stay in a sensible range.
      if (p.unit === '%') expect(p.answer).toBeLessThan(3)
    }
  })
})

describe('answer checking', () => {
  it('parses typed answers', () => {
    expect(parseAnswer('$1,234.50')).toBe(1234.5)
    expect(parseAnswer('40%')).toBe(40)
    expect(parseAnswer('4.5 times')).toBe(4.5)
    expect(parseAnswer('80 units')).toBe(80)
    expect(parseAnswer('abc')).toBeNull()
    expect(parseAnswer('')).toBeNull()
  })
  it('accepts percent answers typed as whole percents within rounding', () => {
    expect(isCorrect({ answer: 2 / 3, unit: '%' }, 66.7)).toBe(true)
    expect(isCorrect({ answer: 2 / 3, unit: '%' }, 67)).toBe(false)
    expect(isCorrect({ answer: 0.25, unit: '%' }, 25)).toBe(true)
    expect(isCorrect({ answer: 0.25, unit: '%' }, 33.3)).toBe(false)
  })
  it('accepts money to the cent', () => {
    expect(isCorrect({ answer: 45, unit: '$' }, 45)).toBe(true)
    expect(isCorrect({ answer: 45, unit: '$' }, 45.5)).toBe(false)
    expect(isCorrect({ answer: 4900, unit: '$' }, 4900)).toBe(true)
  })
})
