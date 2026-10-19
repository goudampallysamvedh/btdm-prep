import { useEffect } from 'react'
import { dayKey } from './dates'
import { useStore, type DailyKind } from './store'
import { LESSONS } from '@/data/lessons'
import { TRENDS } from '@/data/trends'
import { AREA_BY_CODE } from '@/data/areas'
import type { AreaCode } from '@/types'

/** Daily goals. Finishing every step of the day's plan keeps the streak going. */
export const DAILY_GOAL: Record<DailyKind, number> = { cards: 15, questions: 8, math: 5, judge: 3, smart: 20 }

/**
 * The 20-question smart practice step starts on this day. Earlier days keep their three-step plan,
 * so plans already finished (and the streak) are never changed.
 */
export const SMART_STEP_FROM = '2026-10-20'

/** Rough minutes for a plan with this many steps. */
export const planMinutes = (steps: number) => (steps >= 4 ? 25 : 15)

export interface PlanStep {
  title: string
  sub: string
  to: string
  done: boolean
  progress?: { have: number; need: number }
}

/** How many of a daily kind you've done today. */
export function useTodayCount(kind: DailyKind): number {
  return useStore((s) => s.daily[dayKey(new Date())]?.[kind] ?? 0)
}

export function buildPlan(opts: {
  counts: Partial<Record<DailyKind, number>>
  focusArea: AreaCode
  lessonsDone: Record<string, number>
  trendsRead: Record<string, number>
  now?: Date
}): PlanStep[] {
  const now = opts.now ?? new Date()
  const start = new Date(now).setHours(0, 0, 0, 0)
  const end = start + 86_400_000
  const doneToday = (times: Record<string, number>) => Object.values(times).some((t) => t >= start && t < end)
  const c = (k: DailyKind) => opts.counts[k] ?? 0
  const area = AREA_BY_CODE[opts.focusArea]

  const steps: PlanStep[] = [
    {
      title: `Review ${DAILY_GOAL.cards} flashcards`,
      sub: 'About 5 minutes',
      to: '/cards?daily=1',
      done: c('cards') >= DAILY_GOAL.cards,
      progress: { have: Math.min(c('cards'), DAILY_GOAL.cards), need: DAILY_GOAL.cards },
    },
    {
      title: `Answer ${DAILY_GOAL.questions} exam questions`,
      sub: area.name,
      to: `/exam/practice?mode=area&area=${area.code}&count=${DAILY_GOAL.questions}`,
      done: c('questions') >= DAILY_GOAL.questions,
      progress: { have: Math.min(c('questions'), DAILY_GOAL.questions), need: DAILY_GOAL.questions },
    },
  ]

  // A small third task that changes each day.
  const dow = now.getDay()
  if (dow === 1 || dow === 4) {
    const next = LESSONS.find((l) => !opts.lessonsDone[l.id]) ?? LESSONS[(now.getDate() + dow) % LESSONS.length]
    steps.push({ title: 'Read one short lesson', sub: `${next.title} · ${next.minutes} min`, to: `/learn/lessons/${next.id}`, done: doneToday(opts.lessonsDone) })
  } else if (dow === 2 || dow === 5) {
    steps.push({ title: `Solve ${DAILY_GOAL.math} math problems`, sub: 'About 4 minutes', to: '/math?daily=1', done: c('math') >= DAILY_GOAL.math, progress: { have: Math.min(c('math'), DAILY_GOAL.math), need: DAILY_GOAL.math } })
  } else if (dow === 3 || dow === 6) {
    steps.push({ title: `Answer ${DAILY_GOAL.judge} judge questions out loud`, sub: 'About 3 minutes', to: '/cases/judge?daily=1', done: c('judge') >= DAILY_GOAL.judge, progress: { have: Math.min(c('judge'), DAILY_GOAL.judge), need: DAILY_GOAL.judge } })
  } else {
    const next = TRENDS.find((t) => !opts.trendsRead[t.id]) ?? TRENDS[now.getDate() % TRENDS.length]
    steps.push({ title: 'Read one industry trend', sub: `${next.title} · 2 minutes`, to: `/learn/trends/${next.id}`, done: doneToday(opts.trendsRead) })
  }

  if (dayKey(now) >= SMART_STEP_FROM) {
    steps.push({
      title: `Answer ${DAILY_GOAL.smart} smart practice questions`,
      sub: 'Mixed questions picked for your weak spots · about 10 minutes',
      to: `/exam/practice?mode=smart&count=${DAILY_GOAL.smart}`,
      done: c('smart') >= DAILY_GOAL.smart,
      progress: { have: Math.min(c('smart'), DAILY_GOAL.smart), need: DAILY_GOAL.smart },
    })
  }
  return steps
}

/**
 * Marks today in `planDone` the moment every step of today's plan is finished (on any screen).
 * The streak only counts days with a finished plan.
 */
export function usePlanTracker() {
  const today = dayKey(new Date())
  const counts = useStore((s) => s.daily[today])
  const lessonsDone = useStore((s) => s.lessonsDone)
  const trendsRead = useStore((s) => s.trendsRead)
  const marked = useStore((s) => !!s.planDone[today])
  useEffect(() => {
    if (marked) return
    // Whether a step is done never depends on the focus area, so any area works here.
    const steps = buildPlan({ counts: counts ?? {}, focusArea: 'PM', lessonsDone, trendsRead })
    if (steps.every((st) => st.done)) useStore.getState().markPlanDone(today)
  }, [counts, lessonsDone, trendsRead, marked, today])
}
