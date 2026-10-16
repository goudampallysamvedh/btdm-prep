import type { AreaCode, LeitnerState, TestRecord } from '@/types'
import { QUESTION_BY_ID } from '@/data/questions'
import { AREAS, BLUEPRINT } from '@/data/areas'
import { TOPICS, TOPIC_BY_ID } from '@/data/topics'
import { FLASHCARDS } from '@/data/flashcards'

export type TopicStatus = 'learned' | 'shaky' | 'need' | 'unseen'

export interface Evidence {
  topic: string
  correct: boolean
  at: number
  /** Session id: a test id, or a flashcard day. Learned requires 2+ distinct sessions. */
  session: string
  kind: 'question' | 'card'
}

export const STATUS_LABEL: Record<TopicStatus, string> = {
  learned: 'Learned',
  shaky: 'Still shaky',
  need: 'Need to learn',
  unseen: 'Not seen yet',
}

/** Evidence from tests, oldest first. */
export function questionEvidence(tests: TestRecord[]): Evidence[] {
  const out: Evidence[] = []
  for (const t of [...tests].sort((a, b) => a.finishedAt - b.finishedAt)) {
    for (const a of t.answers) {
      const q = QUESTION_BY_ID[a.qid]
      if (!q || a.chosen === null) continue
      out.push({ topic: q.topic, correct: a.correct, at: t.finishedAt, session: t.id, kind: 'question' })
    }
  }
  return out
}

const CARD_BY_ID = Object.fromEntries(FLASHCARDS.map((c) => [c.id, c]))

/** Flashcards count as evidence once they've been reviewed: box 3+ = known, lapses on the latest review = missed. */
export function cardEvidence(leitner: Record<string, LeitnerState>): Evidence[] {
  const out: Evidence[] = []
  for (const [id, s] of Object.entries(leitner)) {
    const c = CARD_BY_ID[id]
    if (!c || !s.last) continue
    const day = new Date(s.last).toDateString()
    out.push({ topic: c.topic, correct: s.box >= 3, at: s.last, session: `fc-${day}`, kind: 'card' })
  }
  return out.sort((a, b) => a.at - b.at)
}

/** Classify a topic from its evidence, oldest first. */
export function statusFrom(ev: Evidence[]): TopicStatus {
  if (!ev.length) return 'unseen'
  const recent = ev.slice(-5)
  const acc = recent.filter((e) => e.correct).length / recent.length
  const last = ev[ev.length - 1]
  const correctSessions = new Set(ev.filter((e) => e.correct).map((e) => e.session))
  if (last.correct && correctSessions.size >= 2 && acc >= 0.75) return 'learned'
  if (!last.correct && acc < 0.5) return 'need'
  return 'shaky'
}

export function groupByTopic(ev: Evidence[]): Map<string, Evidence[]> {
  const m = new Map<string, Evidence[]>()
  for (const e of ev) {
    const arr = m.get(e.topic)
    if (arr) arr.push(e)
    else m.set(e.topic, [e])
  }
  return m
}

export function topicStatuses(ev: Evidence[]): Record<string, TopicStatus> {
  const g = groupByTopic(ev)
  const out: Record<string, TopicStatus> = {}
  for (const t of TOPICS) out[t.id] = statusFrom(g.get(t.id) ?? [])
  return out
}

// ---------- Test report ----------

export interface TopicLine {
  topic: string
  name: string
  area: AreaCode
  right: number
  total: number
  status: TopicStatus
  before: TopicStatus
}

export interface AreaLine {
  area: AreaCode
  right: number
  total: number
  /** Expected exam points lost if this accuracy held on the real exam. */
  pointsAtStake: number
}

export interface TestReportData {
  right: number
  answered: number
  total: number
  pct: number
  durationSec: number
  areas: AreaLine[]
  topics: TopicLine[]
  learned: TopicLine[]
  shaky: TopicLine[]
  need: TopicLine[]
  newlyLearned: TopicLine[]
  slipped: TopicLine[]
  previous?: { id: string; pct: number; title: string }
}

export function buildReport(test: TestRecord, allTests: TestRecord[], leitner: Record<string, LeitnerState>): TestReportData {
  const sorted = [...allTests].sort((a, b) => a.finishedAt - b.finishedAt)
  const idx = sorted.findIndex((t) => t.id === test.id)
  const priorTests = sorted.slice(0, idx < 0 ? sorted.length : idx)
  const cards = cardEvidence(leitner).filter((e) => e.at <= test.finishedAt)
  const evBefore = [...questionEvidence(priorTests), ...cards.filter((e) => e.at < test.startedAt)].sort((a, b) => a.at - b.at)
  const evAfter = [...questionEvidence([...priorTests, test]), ...cards].sort((a, b) => a.at - b.at)
  const gBefore = groupByTopic(evBefore)
  const gAfter = groupByTopic(evAfter)

  const byTopic = new Map<string, { right: number; total: number }>()
  const byArea = new Map<AreaCode, { right: number; total: number }>()
  let right = 0
  let answered = 0
  for (const a of test.answers) {
    const q = QUESTION_BY_ID[a.qid]
    if (!q) continue
    const ta = byTopic.get(q.topic) ?? { right: 0, total: 0 }
    const aa = byArea.get(q.area) ?? { right: 0, total: 0 }
    ta.total++
    aa.total++
    if (a.correct) {
      ta.right++
      aa.right++
      right++
    }
    if (a.chosen !== null) answered++
    byTopic.set(q.topic, ta)
    byArea.set(q.area, aa)
  }

  const topics: TopicLine[] = [...byTopic.entries()].map(([topic, v]) => {
    const t = TOPIC_BY_ID[topic]
    return {
      topic,
      name: t?.name ?? topic,
      area: t?.area ?? 'MK',
      right: v.right,
      total: v.total,
      status: statusFrom(gAfter.get(topic) ?? []),
      before: statusFrom(gBefore.get(topic) ?? []),
    }
  })

  const areas: AreaLine[] = [...byArea.entries()]
    .map(([area, v]) => ({ area, right: v.right, total: v.total, pointsAtStake: BLUEPRINT[area] * (1 - v.right / v.total) }))
    .sort((a, b) => b.pointsAtStake - a.pointsAtStake)

  const prev = [...priorTests].reverse().find((t) => t.kind === test.kind) ?? priorTests[priorTests.length - 1]

  const total = test.answers.length
  return {
    right,
    answered,
    total,
    pct: total ? right / total : 0,
    durationSec: Math.round((test.finishedAt - test.startedAt) / 1000),
    areas,
    topics,
    learned: topics.filter((t) => t.status === 'learned'),
    shaky: topics.filter((t) => t.status === 'shaky'),
    need: topics.filter((t) => t.status === 'need'),
    newlyLearned: topics.filter((t) => t.status === 'learned' && t.before !== 'learned'),
    slipped: topics.filter((t) => t.before === 'learned' && t.status !== 'learned'),
    previous: prev ? { id: prev.id, pct: scoreOf(prev), title: prev.title } : undefined,
  }
}

export function scoreOf(t: TestRecord): number {
  return t.answers.length ? t.answers.filter((a) => a.correct).length / t.answers.length : 0
}

// ---------- Readiness ----------

export interface AreaReadiness {
  area: AreaCode
  weight: number
  /** Recency-weighted accuracy with a 50% prior, 0..1. */
  accuracy: number
  answered: number
  /** 0..1: how much evidence backs the estimate. */
  confidence: number
  priority: number
}

export function areaReadiness(tests: TestRecord[]): AreaReadiness[] {
  const ev = new Map<AreaCode, boolean[]>()
  for (const t of [...tests].sort((a, b) => a.finishedAt - b.finishedAt)) {
    for (const a of t.answers) {
      const q = QUESTION_BY_ID[a.qid]
      if (!q || a.chosen === null) continue
      const arr = ev.get(q.area) ?? []
      arr.push(a.correct)
      ev.set(q.area, arr)
    }
  }
  return AREAS.map((a) => {
    const arr = (ev.get(a.code) ?? []).slice(-30)
    let wc = 0
    let w = 0
    arr.forEach((c, i) => {
      const weight = Math.pow(0.9, arr.length - 1 - i)
      w += weight
      if (c) wc += weight
    })
    const accuracy = (wc + 1) / (w + 2)
    const confidence = Math.min(1, arr.length / (2 * a.weight + 4))
    const priority = a.weight * (1 - accuracy) + a.weight * 0.35 * (1 - confidence)
    return { area: a.code, weight: a.weight, accuracy, answered: (ev.get(a.code) ?? []).length, confidence, priority }
  })
}

/** Projected exam score out of 100, using each area's accuracy times its blueprint weight. */
export function projectedScore(r: AreaReadiness[]): number {
  return r.reduce((s, a) => s + a.weight * a.accuracy, 0)
}

/** Weakest topic in an area: need > shaky > unseen, in topic order. */
export function weakestTopic(area: AreaCode, statuses: Record<string, TopicStatus>): string | undefined {
  const ts = TOPICS.filter((t) => t.area === area && !t.id.startsWith('T.'))
  return (
    ts.find((t) => statuses[t.id] === 'need')?.id ??
    ts.find((t) => statuses[t.id] === 'shaky')?.id ??
    ts.find((t) => statuses[t.id] === 'unseen')?.id
  )
}

/** Questions whose most recent answer was wrong. */
export function missedQuestionIds(tests: TestRecord[]): string[] {
  const last = new Map<string, boolean>()
  for (const t of [...tests].sort((a, b) => a.finishedAt - b.finishedAt)) {
    for (const a of t.answers) {
      if (a.chosen === null && t.kind !== 'mock') continue
      last.set(a.qid, a.correct)
    }
  }
  return [...last.entries()].filter(([, c]) => !c).map(([id]) => id).filter((id) => QUESTION_BY_ID[id])
}

/** Last time each question was seen. */
export function lastSeen(tests: TestRecord[]): Map<string, number> {
  const m = new Map<string, number>()
  for (const t of tests) for (const a of t.answers) m.set(a.qid, Math.max(m.get(a.qid) ?? 0, t.finishedAt))
  return m
}
