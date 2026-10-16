import type { AreaCode, Question, TestRecord } from '@/types'
import { QUESTIONS } from '@/data/questions'
import { AREAS } from '@/data/areas'
import { shuffle } from './random'
import { areaReadiness, lastSeen, missedQuestionIds, topicStatuses, questionEvidence } from './mastery'

/** Prefer questions not seen recently, with a little randomness. */
function freshest(pool: Question[], n: number, seen: Map<string, number>, r: () => number): Question[] {
  return shuffle(pool, r)
    .map((q) => ({ q, k: (seen.get(q.id) ?? 0) + r() * 3 * 86_400_000 }))
    .sort((a, b) => a.k - b.k)
    .slice(0, n)
    .map((x) => x.q)
}

/** A 100-question mock exam that matches the blueprint exactly, in mixed order. */
export function drawMock(tests: TestRecord[], r: () => number = Math.random): Question[] {
  const seen = lastSeen(tests)
  const picked: Question[] = []
  for (const a of AREAS) {
    const pool = QUESTIONS.filter((q) => q.area === a.code)
    picked.push(...freshest(pool, a.weight, seen, r))
  }
  return shuffle(picked, r)
}

export type PracticeMode = 'smart' | 'area' | 'topic' | 'missed' | 'math' | 'all'

export interface PracticeSpec {
  mode: PracticeMode
  area?: AreaCode
  topic?: string
  count: number
}

/**
 * Build a practice set.
 * smart: weighted toward high-blueprint areas you're weakest in and topics you still need.
 */
export function drawPractice(spec: PracticeSpec, tests: TestRecord[], r: () => number = Math.random): Question[] {
  const seen = lastSeen(tests)
  const n = spec.count
  switch (spec.mode) {
    case 'area':
      return freshest(QUESTIONS.filter((q) => q.area === spec.area), n, seen, r)
    case 'topic':
      return freshest(QUESTIONS.filter((q) => q.topic === spec.topic), n, seen, r)
    case 'math':
      return freshest(QUESTIONS.filter((q) => q.math), n, seen, r)
    case 'missed': {
      const ids = new Set(missedQuestionIds(tests))
      return shuffle(QUESTIONS.filter((q) => ids.has(q.id)), r).slice(0, n)
    }
    case 'all':
      return freshest(QUESTIONS, n, seen, r)
    case 'smart':
    default: {
      const ready = areaReadiness(tests)
      const statuses = topicStatuses(questionEvidence(tests))
      const totalPriority = ready.reduce((s, a) => s + a.priority, 0) || 1
      // Allocate slots by priority (largest remainder), at least 1 for the top areas.
      const raw = ready.map((a) => ({ area: a.area, x: (a.priority / totalPriority) * n }))
      const alloc = new Map<AreaCode, number>(raw.map((x) => [x.area, Math.floor(x.x)]))
      let left = n - [...alloc.values()].reduce((s, v) => s + v, 0)
      for (const x of [...raw].sort((a, b) => (b.x % 1) - (a.x % 1))) {
        if (left <= 0) break
        alloc.set(x.area, (alloc.get(x.area) ?? 0) + 1)
        left--
      }
      const out: Question[] = []
      for (const [area, k] of alloc) {
        if (!k) continue
        const pool = QUESTIONS.filter((q) => q.area === area)
        // Within the area, topics you need come first.
        const rank = (q: Question) => ({ need: 0, shaky: 1, unseen: 2, learned: 3 })[statuses[q.topic] ?? 'unseen']
        const ordered = freshest(pool, pool.length, seen, r).sort((a, b) => rank(a) - rank(b))
        out.push(...ordered.slice(0, k))
      }
      return shuffle(out, r)
    }
  }
}

/** Shuffled option order for display; maps display index -> original index. */
export function optionOrder(r: () => number = Math.random): number[] {
  return shuffle([0, 1, 2, 3], r)
}
