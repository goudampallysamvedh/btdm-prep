import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'
import { get, set, del } from 'idb-keyval'
import type { CaseAttempt, CasePlan, LeitnerState, MathStat, TestRecord } from '@/types'
import { dayKey } from './dates'

export type Theme = 'system' | 'light' | 'dark'
/** 'on' = always animate, 'device' = follow the device's reduce-motion setting, 'off' = no animation. */
export type Motion = 'on' | 'device' | 'off'

export interface ActiveMock {
  qids: string[]
  answers: (number | null)[]
  flags: boolean[]
  ms: number[]
  startedAt: number
  limitSec: number
  index: number
}

export interface Settings {
  theme: Theme
  motion?: Motion
  competitionDate: string // yyyy-mm-dd or ''
  competitionName: string
  partnerA: string
  partnerB: string
  /** Which partner is using this device. */
  me: 'A' | 'B'
  dailyGoal: number
}

export type DailyKind = 'cards' | 'questions' | 'math' | 'judge'

export interface PartnerSummary {
  name: string
  projected: number
  /** Area code -> estimated accuracy 0..1 (only areas with answers). */
  areas: Record<string, number>
  answered: number
  at: number
  // Added later; older partner codes leave these out.
  /** Study streak in days, as of `at`. */
  streak?: number
  /** Days with any study in the 7 days up to `at`. */
  activeDays7?: number
  /** Area codes to work on most, highest priority first. */
  focus?: string[]
  /** Topic ids marked "need to learn" (then "still shaky"), most important first. */
  needTopics?: string[]
  /** Topic counts by status. */
  topics?: { learned: number; shaky: number; need: number }
  /** Flashcards at box 3+ vs. reviewed but not yet known. */
  cards?: { known: number; learning: number }
  lessonsDone?: number
  /** Last few test scores (0..1), oldest first. */
  trend?: number[]
  /** Case practice: scored attempts and best total out of 100. */
  cases?: { attempts: number; best: number }
}

/** Live partner updates through an encrypted relay. `key` is the shared team secret. */
export interface LiveLink {
  key: string
  linkedAt: number
}

export interface OfficialScore {
  id: string
  exam: string
  /** Questions right out of 100. */
  score: number
  at: number
}

/** The study progress one person carries between devices. */
export type ProgressData = Pick<
  ProgressState,
  'settings' | 'officialScores' | 'activity' | 'daily' | 'planDone' | 'tests' | 'leitner' | 'caseAttempts' | 'casePlans' | 'mathStats' | 'lessonsDone' | 'trendsRead' | 'judgeDrill'
>

export const DATA_KEYS = ['settings', 'officialScores', 'activity', 'daily', 'planDone', 'tests', 'leitner', 'caseAttempts', 'casePlans', 'mathStats', 'lessonsDone', 'trendsRead', 'judgeDrill'] as const

export interface ProgressState {
  settings: Settings
  /** Scores from DECA's official sample exams, taken on paper or PDF and logged by hand. */
  officialScores: OfficialScore[]
  /** Latest exam summary received from your partner (for the team exam estimate). */
  partner: PartnerSummary | null
  /** Live partner updates, when linked. */
  live: LiveLink | null
  /** Your partner's study progress combined from all of their devices (live updates). */
  partnerData: ProgressData | null
  /** dayKey -> number of study actions that day. */
  activity: Record<string, number>
  /** dayKey -> small counters for Today's plan (cards, questions, math, judge). */
  daily: Record<string, Partial<Record<DailyKind, number>>>
  /** dayKey -> when every step of that day's plan was finished. The streak counts these days. */
  planDone: Record<string, number>
  tests: TestRecord[]
  leitner: Record<string, LeitnerState>
  caseAttempts: CaseAttempt[]
  casePlans: Record<string, CasePlan>
  mathStats: Record<string, MathStat>
  lessonsDone: Record<string, number>
  trendsRead: Record<string, number>
  judgeDrill: Record<string, number>
  activeMock: ActiveMock | null
}

interface Actions {
  setSettings: (s: Partial<Settings>) => void
  logActivity: (n?: number) => void
  bumpDaily: (kind: DailyKind) => void
  markPlanDone: (day: string) => void
  addTest: (t: TestRecord) => void
  deleteTest: (id: string) => void
  setLeitner: (id: string, s: LeitnerState) => void
  resetLeitner: (ids?: string[]) => void
  addCaseAttempt: (a: CaseAttempt) => void
  deleteCaseAttempt: (id: string) => void
  saveCasePlan: (p: CasePlan) => void
  recordMath: (kind: string, correct: boolean) => void
  markLesson: (id: string) => void
  markTrend: (id: string) => void
  markJudgeQ: (id: string) => void
  setActiveMock: (m: ActiveMock | null) => void
  addOfficial: (o: OfficialScore) => void
  deleteOfficial: (id: string) => void
  replaceAll: (s: Partial<ProgressState>) => void
}

export const defaultSettings: Settings = {
  theme: 'system',
  motion: 'on',
  competitionDate: '',
  competitionName: 'District CDC',
  partnerA: 'Partner A',
  partnerB: 'Partner B',
  me: 'A',
  dailyGoal: 20,
}

export const emptyProgress: ProgressState = {
  settings: defaultSettings,
  officialScores: [],
  partner: null,
  live: null,
  partnerData: null,
  activity: {},
  daily: {},
  planDone: {},
  tests: [],
  leitner: {},
  caseAttempts: [],
  casePlans: {},
  mathStats: {},
  lessonsDone: {},
  trendsRead: {},
  judgeDrill: {},
  activeMock: null,
}

const idbStorage: StateStorage = {
  getItem: async (name) => (await get<string>(name)) ?? null,
  setItem: async (name, value) => set(name, value),
  removeItem: async (name) => del(name),
}

export const useStore = create<ProgressState & Actions>()(
  persist(
    (setState) => ({
      ...emptyProgress,
      setSettings: (s) => setState((st) => ({ settings: { ...st.settings, ...s } })),
      logActivity: (n = 1) =>
        setState((st) => {
          const k = dayKey(new Date())
          return { activity: { ...st.activity, [k]: (st.activity[k] ?? 0) + n } }
        }),
      bumpDaily: (kind) =>
        setState((st) => {
          const k = dayKey(new Date())
          const day = st.daily[k] ?? {}
          // Keep only the last 14 days.
          const keep = Object.fromEntries(Object.entries(st.daily).filter(([d]) => d >= dayKey(new Date(Date.now() - 14 * 86_400_000))))
          return { daily: { ...keep, [k]: { ...day, [kind]: (day[kind] ?? 0) + 1 } } }
        }),
      markPlanDone: (day) => setState((st) => (st.planDone[day] ? {} : { planDone: { ...st.planDone, [day]: Date.now() } })),
      addTest: (t) => setState((st) => ({ tests: [...st.tests, t] })),
      deleteTest: (id) => setState((st) => ({ tests: st.tests.filter((t) => t.id !== id) })),
      setLeitner: (id, s) => setState((st) => ({ leitner: { ...st.leitner, [id]: s } })),
      resetLeitner: (ids) =>
        setState((st) => {
          if (!ids) return { leitner: {} }
          const next = { ...st.leitner }
          ids.forEach((i) => delete next[i])
          return { leitner: next }
        }),
      addCaseAttempt: (a) => setState((st) => ({ caseAttempts: [...st.caseAttempts, a] })),
      deleteCaseAttempt: (id) => setState((st) => ({ caseAttempts: st.caseAttempts.filter((a) => a.id !== id) })),
      saveCasePlan: (p) => setState((st) => ({ casePlans: { ...st.casePlans, [p.caseId]: p } })),
      recordMath: (kind, correct) =>
        setState((st) => {
          const cur = st.mathStats[kind] ?? { kind, tried: 0, correct: 0 }
          return {
            mathStats: {
              ...st.mathStats,
              [kind]: { kind, tried: cur.tried + 1, correct: cur.correct + (correct ? 1 : 0), last: Date.now() },
            },
          }
        }),
      markLesson: (id) => setState((st) => ({ lessonsDone: { ...st.lessonsDone, [id]: Date.now() } })),
      markTrend: (id) => setState((st) => ({ trendsRead: { ...st.trendsRead, [id]: Date.now() } })),
      markJudgeQ: (id) => setState((st) => ({ judgeDrill: { ...st.judgeDrill, [id]: (st.judgeDrill[id] ?? 0) + 1 } })),
      setActiveMock: (m) => setState({ activeMock: m }),
      addOfficial: (o) => setState((st) => ({ officialScores: [...st.officialScores, o] })),
      deleteOfficial: (id) => setState((st) => ({ officialScores: st.officialScores.filter((o) => o.id !== id) })),
      replaceAll: (s) => setState((st) => ({ ...st, ...s })),
    }),
    {
      name: 'sell-through-progress',
      version: 1,
      storage: createJSONStorage(() => idbStorage),
    },
  ),
)

/** True once saved progress has loaded from IndexedDB. */
export function useHydrated(): boolean {
  const [h, setH] = useState(() => useStore.persist.hasHydrated())
  useEffect(() => {
    if (useStore.persist.hasHydrated()) setH(true)
    return useStore.persist.onFinishHydration(() => setH(true))
  }, [])
  return h
}

export function newId(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}
