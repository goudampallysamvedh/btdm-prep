import { describe, expect, it } from 'vitest'
import { review, dueCards, newCards } from './srs'
import { FLASHCARDS } from '@/data/flashcards'

const NOW = new Date(2026, 9, 16, 15, 0).getTime()
const DAY = 86_400_000

describe('Leitner review', () => {
  it('moves a known new card to box 1 then up the boxes', () => {
    const a = review(undefined, true, NOW)
    expect(a.box).toBe(1)
    const b = review(a, true, NOW)
    expect(b.box).toBe(2)
    const c = review({ ...b, box: 4 }, true, NOW)
    expect(c.box).toBe(5)
    expect(review(c, true, NOW).box).toBe(5)
  })
  it('sends a missed card back to box 1 and counts the lapse', () => {
    const s = review({ box: 4, due: NOW, seen: 5, lapses: 0 }, false, NOW)
    expect(s.box).toBe(1)
    expect(s.lapses).toBe(1)
    expect(s.due - NOW).toBe(10 * 60_000)
  })
  it('schedules box 3 three days out from the start of today', () => {
    const s = review({ box: 2, due: NOW, seen: 2, lapses: 0 }, true, NOW)
    const start = new Date(2026, 9, 16).getTime()
    expect(s.due).toBe(start + 3 * DAY)
  })
  it('lists due and new cards', () => {
    const [c1, c2] = FLASHCARDS
    const st = { [c1.id]: { box: 2, due: NOW - 1, seen: 1, lapses: 0 } }
    expect(dueCards(FLASHCARDS, st, NOW).map((c) => c.id)).toEqual([c1.id])
    expect(newCards(FLASHCARDS, st).some((c) => c.id === c2.id)).toBe(true)
    expect(newCards(FLASHCARDS, st).some((c) => c.id === c1.id)).toBe(false)
  })
})
