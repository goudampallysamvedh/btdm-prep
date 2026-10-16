import type { Flashcard, LeitnerState } from '@/types'

/** Days until a card in each Leitner box comes back. Box 1 returns the same day. */
export const BOX_DAYS = [0, 0, 1, 3, 7, 14] as const

const DAY = 86_400_000

/** Next state after a review. Correct moves up a box; a miss sends the card back to box 1. */
export function review(prev: LeitnerState | undefined, correct: boolean, now = Date.now()): LeitnerState {
  const box = correct ? Math.min(5, (prev?.box ?? 0) + 1) : 1
  // Box-1 cards come back after ~10 minutes in the same session.
  const due = box === 1 ? now + 10 * 60_000 : startOfDay(now) + BOX_DAYS[box] * DAY
  return {
    box,
    due,
    seen: (prev?.seen ?? 0) + 1,
    lapses: (prev?.lapses ?? 0) + (correct ? 0 : 1),
    last: now,
  }
}

function startOfDay(ms: number): number {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function isDue(s: LeitnerState | undefined, now = Date.now()): boolean {
  return !!s && s.due <= now
}

/** Cards due now (already started), oldest due first. */
export function dueCards(cards: Flashcard[], leitner: Record<string, LeitnerState>, now = Date.now()): Flashcard[] {
  return cards.filter((c) => isDue(leitner[c.id], now)).sort((a, b) => leitner[a.id].due - leitner[b.id].due)
}

export function newCards(cards: Flashcard[], leitner: Record<string, LeitnerState>): Flashcard[] {
  return cards.filter((c) => !leitner[c.id])
}
