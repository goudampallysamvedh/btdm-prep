import { describe, expect, it } from 'vitest'
import { AREAS, BLUEPRINT } from './areas'
import { TOPIC_BY_ID } from './topics'
import { QUESTIONS } from './questions'
import { FLASHCARDS, KIT_CARD_COUNT } from './flashcards'

describe('exam blueprint', () => {
  it('has 20 areas summing to 100 questions', () => {
    expect(AREAS).toHaveLength(20)
    expect(Object.values(BLUEPRINT).reduce((a, b) => a + b, 0)).toBe(100)
  })
  it('matches the sample-exam blueprint', () => {
    expect(BLUEPRINT).toEqual({
      PM: 11, IM: 11, EI: 9, PR: 9, EC: 6, FI: 6, OP: 6, PD: 6, SE: 6, CM: 5,
      CO: 5, NF: 5, MP: 4, PI: 3, BL: 2, CR: 2, EN: 1, HR: 1, MK: 1, SM: 1,
    })
  })
  it('topic ids are unique', () => {
    const ids = AREAS.flatMap((a) => a.terms.map((t) => t.id))
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('question bank', () => {
  it('has at least 200 original questions plus the 47 kit questions', () => {
    expect(QUESTIONS.filter((q) => q.source === 'original').length).toBeGreaterThanOrEqual(200)
    expect(QUESTIONS.filter((q) => q.source === 'kit')).toHaveLength(47)
  })

  it('has unique ids', () => {
    const ids = QUESTIONS.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it.each(QUESTIONS.map((q) => [q.id, q] as const))('%s is well formed', (_id, q) => {
    expect(q.options).toHaveLength(4)
    expect(new Set(q.options.map((o) => o.trim().toLowerCase())).size).toBe(4)
    expect([0, 1, 2, 3]).toContain(q.answer)
    expect(q.stem.length).toBeGreaterThan(15)
    expect(q.explanation.length).toBeGreaterThan(20)
    expect(q.pi).toMatch(/^[A-Z]{2}:\d{3}$/)
    expect(q.pi.slice(0, 2)).toBe(q.area)
    const topic = TOPIC_BY_ID[q.topic]
    expect(topic, `unknown topic ${q.topic}`).toBeDefined()
    expect(topic.area, `${q.id}: topic ${q.topic} belongs to ${topic.area}`).toBe(q.area)
    // Explanations must not refer to letter positions, since options are shuffled.
    expect(q.explanation).not.toMatch(/\b(option|choice|answer) [A-D]\b/)
  })

  it('has enough questions in every area for a full blueprint mock exam (and at least 2× in heavy areas)', () => {
    for (const a of AREAS) {
      const n = QUESTIONS.filter((q) => q.area === a.code).length
      expect(n, a.code).toBeGreaterThanOrEqual(a.weight)
      if (a.weight >= 2) expect(n, a.code).toBeGreaterThanOrEqual(2 * a.weight)
    }
  })
})

describe('flashcards', () => {
  it('keeps all 94 kit cards', () => {
    expect(KIT_CARD_COUNT).toBe(94)
  })
  it('has unique ids and valid topics', () => {
    const ids = FLASHCARDS.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const c of FLASHCARDS) {
      const t = TOPIC_BY_ID[c.topic]
      expect(t, `${c.id} topic ${c.topic}`).toBeDefined()
      expect(t.area, `${c.id} ${c.front}`).toBe(c.area)
    }
  })
  it('has no duplicate fronts within a deck', () => {
    const seen = new Set<string>()
    for (const c of FLASHCARDS) {
      const k = `${c.deck}:${c.front.toLowerCase()}`
      expect(seen.has(k), c.front).toBe(false)
      seen.add(k)
    }
  })
})

describe('lessons', () => {
  it('have unique ids, known topics, and valid quick checks', async () => {
    const { LESSONS } = await import('./lessons')
    expect(new Set(LESSONS.map((l) => l.id)).size).toBe(LESSONS.length)
    for (const l of LESSONS) {
      expect(TOPIC_BY_ID[l.topic], `${l.id} topic ${l.topic}`).toBeDefined()
      expect(l.sections.length).toBeGreaterThanOrEqual(2)
      for (const c of l.checks) {
        expect(c.options[c.answer], `${l.id}: ${c.q}`).toBeDefined()
        expect(new Set(c.options).size).toBe(c.options.length)
      }
    }
    expect(LESSONS.filter((l) => l.group === 'case').length).toBeGreaterThanOrEqual(5)
  })
})
