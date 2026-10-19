import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import type { CaseAttempt, CasePlan, LeitnerState, MathStat, TestRecord } from '@/types'
import { DATA_KEYS, defaultSettings, emptyProgress, type DailyKind, type PartnerSummary, type ProgressData, type ProgressState } from './store'
import { areaReadiness, cardEvidence, projectedScore, questionEvidence, scoreOf, topicStatuses } from './mastery'
import { dayKey, streak } from './dates'
import { AREA_BY_CODE } from '@/data/areas'
import { TOPICS } from '@/data/topics'

export const APP_ID = 'sell-through'
export const FORMAT_VERSION = 1

// ---------- Full backup (one person's progress) ----------

export interface Backup {
  app: typeof APP_ID
  kind: 'backup'
  v: number
  exportedAt: number
  data: Omit<ProgressState, 'activeMock'>
}

export function makeBackup(s: ProgressState): Backup {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeMock, ...data } = s
  return { app: APP_ID, kind: 'backup', v: FORMAT_VERSION, exportedAt: Date.now(), data }
}

// ---------- Partner package (what teammates share) ----------

export interface PartnerPackage {
  app: typeof APP_ID
  kind: 'partner'
  v: number
  exportedAt: number
  from: string
  partnerA: string
  partnerB: string
  plans: CasePlan[]
  attempts: CaseAttempt[]
  summary: PartnerSummary
}

export function makePartnerPackage(s: ProgressState): PartnerPackage {
  const me = s.settings.me === 'A' ? s.settings.partnerA : s.settings.partnerB
  return {
    app: APP_ID,
    kind: 'partner',
    v: FORMAT_VERSION,
    exportedAt: Date.now(),
    from: me,
    partnerA: s.settings.partnerA,
    partnerB: s.settings.partnerB,
    plans: Object.values(s.casePlans),
    attempts: s.caseAttempts,
    summary: partnerSummary(s, me),
  }
}

/** What a partner sees about you: scores, streak, and what you still need to work on. */
export function partnerSummary(s: ProgressState, me: string, now = new Date()): PartnerSummary {
  const r = areaReadiness(s.tests)
  const ev = [...questionEvidence(s.tests), ...cardEvidence(s.leitner)].sort((a, b) => a.at - b.at)
  const statuses = topicStatuses(ev)
  const studyTopics = TOPICS.filter((t) => !t.hidden && !t.id.startsWith('T.'))
  const count = (st: string) => studyTopics.filter((t) => statuses[t.id] === st).length
  const weight = (area: string) => AREA_BY_CODE[area as keyof typeof AREA_BY_CODE]?.weight ?? 0
  const byWeight = (st: string) => studyTopics.filter((t) => statuses[t.id] === st).sort((a, b) => weight(b.area) - weight(a.area)).map((t) => t.id)
  const days7 = Array.from({ length: 7 }, (_, i) => dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)))
  const cards = Object.values(s.leitner).filter((c) => c.last)
  const finished = [...s.tests].filter((t) => t.answers.length).sort((a, b) => a.finishedAt - b.finishedAt)
  return {
    name: me,
    projected: Math.round(projectedScore(r) * 10) / 10,
    areas: Object.fromEntries(r.filter((a) => a.answered).map((a) => [a.area, Math.round(a.accuracy * 1000) / 1000])),
    answered: s.tests.reduce((n, t) => n + t.answers.length, 0),
    at: now.getTime(),
    streak: streak(s.planDone ?? {}, now),
    activeDays7: days7.filter((d) => s.activity[d]).length,
    focus: [...r].sort((a, b) => b.priority - a.priority).slice(0, 3).map((a) => a.area),
    needTopics: [...byWeight('need'), ...byWeight('shaky')].slice(0, 8),
    topics: { learned: count('learned'), shaky: count('shaky'), need: count('need') },
    cards: { known: cards.filter((c) => c.box >= 3).length, learning: cards.filter((c) => c.box < 3).length },
    lessonsDone: Object.keys(s.lessonsDone).length,
    trend: finished.slice(-8).map((t) => Math.round(scoreOf(t) * 100) / 100),
    cases: { attempts: s.caseAttempts.length, best: s.caseAttempts.reduce((m, a) => Math.max(m, a.total), 0) },
  }
}

// ---------- Codes ----------

const PREFIX = 'ST1.'

export function toCode(obj: unknown): string {
  return PREFIX + compressToEncodedURIComponent(JSON.stringify(obj))
}

export type Parsed = { ok: true; value: Backup | PartnerPackage } | { ok: false; error: string }

export function parseShared(text: string): Parsed {
  const t = text.trim()
  let json: string | null = t
  if (t.startsWith(PREFIX)) {
    json = decompressFromEncodedURIComponent(t.slice(PREFIX.length))
    if (!json) return { ok: false, error: 'That code looks incomplete. Copy the whole code and try again.' }
  }
  let v: unknown
  try {
    v = JSON.parse(json)
  } catch {
    return { ok: false, error: 'That isn\'t a Sell-Through code or backup file.' }
  }
  const o = v as {
    app?: string
    v?: number
    kind?: string
    data?: { tests?: unknown }
    plans?: unknown
    attempts?: unknown
    summary?: unknown
  }
  if (!o || o.app !== APP_ID) return { ok: false, error: 'That file wasn\'t made by Sell-Through.' }
  if (typeof o.v !== 'number' || o.v > FORMAT_VERSION) return { ok: false, error: 'That file is from a newer version of the app. Update the app first.' }
  if (o.kind === 'backup' && o.data && Array.isArray(o.data.tests)) return { ok: true, value: o as unknown as Backup }
  if (o.kind === 'partner' && Array.isArray(o.plans) && Array.isArray(o.attempts) && o.summary) return { ok: true, value: o as unknown as PartnerPackage }
  return { ok: false, error: 'That file is missing data.' }
}

// ---------- Merging ----------

function unionById<T extends { id: string }>(a: T[], b: T[]): T[] {
  const m = new Map(a.map((x) => [x.id, x]))
  for (const x of b) if (!m.has(x.id)) m.set(x.id, x)
  return [...m.values()]
}

export interface MergeResult {
  state: Partial<ProgressState>
  summary: string[]
}

/** Merge a partner package: newer case plans win, attempts are combined, partner summary is stored. */
export function mergePartner(s: ProgressState, p: PartnerPackage): MergeResult {
  const plans = { ...s.casePlans }
  let newer = 0
  for (const plan of p.plans) {
    const mine = plans[plan.caseId]
    if (!mine || plan.updatedAt > mine.updatedAt) {
      plans[plan.caseId] = plan
      newer++
    }
  }
  const attempts = unionById(s.caseAttempts, p.attempts)
  const added = attempts.length - s.caseAttempts.length
  const meName = s.settings.me === 'A' ? s.settings.partnerA : s.settings.partnerB
  const isSelf = p.from === meName && p.summary.name === meName
  return {
    state: { casePlans: plans, caseAttempts: attempts, ...(isSelf ? {} : { partner: p.summary }) },
    summary: [
      `${newer} case plan${newer === 1 ? '' : 's'} updated`,
      `${added} case attempt${added === 1 ? '' : 's'} added`,
      isSelf ? 'This package came from you, so no partner exam data was saved.' : `${p.summary.name}'s exam estimate saved (${Math.round(p.summary.projected)}/100)`,
    ],
  }
}

/** The name of the person whose progress this is. */
export function ownerName(s: Pick<ProgressState, 'settings'>): string {
  return s.settings.me === 'A' ? s.settings.partnerA : s.settings.partnerB
}

/** True when this device was never set up (names and competition date still blank). */
function isDefaultSettings(s: ProgressState): boolean {
  return s.settings.partnerA === defaultSettings.partnerA && s.settings.partnerB === defaultSettings.partnerB && !s.settings.competitionDate
}

/**
 * Merge your own progress from another device. Nothing is lost on either side: tests and scores are
 * combined, each flashcard keeps its most recent review, and counters keep the higher value (so
 * syncing the same two devices again never double-counts). Sync both ways to make devices match.
 */
export function mergeBackup(s: ProgressState, b: Backup): MergeResult {
  const d = b.data
  const tests = unionById<TestRecord>(s.tests, d.tests ?? [])
  const leitner: Record<string, LeitnerState> = { ...s.leitner }
  let cardsUpdated = 0
  for (const [id, st] of Object.entries(d.leitner ?? {})) {
    if (!leitner[id] || (st.last ?? 0) > (leitner[id].last ?? 0)) {
      leitner[id] = st
      cardsUpdated++
    }
  }
  const activity = { ...s.activity }
  for (const [k, n] of Object.entries(d.activity ?? {})) activity[k] = Math.max(activity[k] ?? 0, n)
  const daily: ProgressState['daily'] = { ...s.daily }
  for (const [day, counts] of Object.entries(d.daily ?? {})) {
    const merged = { ...(daily[day] ?? {}) }
    for (const [k, n] of Object.entries(counts ?? {}) as [DailyKind, number][]) merged[k] = Math.max(merged[k] ?? 0, n)
    daily[day] = merged
  }
  const plans = { ...s.casePlans }
  let plansUpdated = 0
  for (const plan of Object.values(d.casePlans ?? {})) {
    if (!plans[plan.caseId] || plan.updatedAt > plans[plan.caseId].updatedAt) {
      plans[plan.caseId] = plan
      plansUpdated++
    }
  }
  const mathStats: Record<string, MathStat> = { ...s.mathStats }
  for (const [k, st] of Object.entries(d.mathStats ?? {})) {
    const mine = mathStats[k]
    mathStats[k] = mine
      ? { kind: st.kind, tried: Math.max(mine.tried, st.tried), correct: Math.max(mine.correct, st.correct), last: Math.max(mine.last ?? 0, st.last ?? 0) || undefined }
      : st
  }
  const caseAttempts = unionById(s.caseAttempts, d.caseAttempts ?? [])
  const partner = !s.partner || (d.partner && d.partner.at > s.partner.at) ? (d.partner ?? s.partner) : s.partner
  const takeSettings = isDefaultSettings(s) && !!d.settings
  // Your other device joins your live link too, as the same partner (A or B).
  const takeLive = !s.live && !!d.live
  const testsAdded = tests.length - s.tests.length
  const attemptsAdded = caseAttempts.length - s.caseAttempts.length
  const n = (k: number, word: string) => `${k} ${word}${k === 1 ? '' : 's'}`
  return {
    state: {
      tests,
      leitner,
      activity,
      daily,
      planDone: { ...(d.planDone ?? {}), ...s.planDone },
      casePlans: plans,
      caseAttempts,
      officialScores: unionById(s.officialScores ?? [], d.officialScores ?? []),
      lessonsDone: { ...(d.lessonsDone ?? {}), ...s.lessonsDone },
      trendsRead: { ...(d.trendsRead ?? {}), ...s.trendsRead },
      judgeDrill: { ...(d.judgeDrill ?? {}), ...s.judgeDrill },
      mathStats,
      partner,
      ...(takeSettings ? { settings: { ...defaultSettings, ...d.settings, theme: s.settings.theme } } : takeLive ? { settings: { ...s.settings, me: d.settings.me } } : {}),
      ...(takeLive ? { live: d.live } : {}),
    },
    summary: [
      `${n(testsAdded, 'test')} added`,
      `${n(cardsUpdated, 'flashcard')} updated`,
      `${n(plansUpdated, 'case plan')} updated, ${n(attemptsAdded, 'case score')} added`,
      ...(takeSettings ? ['Your names and exam date were copied to this device.'] : []),
      ...(takeLive ? ['Live partner updates are now on for this device too.'] : []),
    ],
  }
}

/** Team exam estimate: the average of both partners' projected scores. */
export function teamExam(mine: number, partner: PartnerSummary | null): number | null {
  return partner ? (mine + partner.projected) / 2 : null
}

export function downloadJson(obj: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(obj, null, 1)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

/** Use the phone's share sheet for a file when available; falls back to a download. */
export async function shareJson(obj: unknown, filename: string, title: string): Promise<'shared' | 'downloaded'> {
  const file = new File([JSON.stringify(obj)], filename, { type: 'application/json' })
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
  if (nav.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title })
      return 'shared'
    } catch {
      /* cancelled: fall back */
    }
  }
  downloadJson(obj, filename)
  return 'downloaded'
}

// ---------- Live: one person's progress, combined across devices ----------

export function pickData(s: ProgressData): ProgressData {
  return Object.fromEntries(DATA_KEYS.map((k) => [k, s[k]])) as unknown as ProgressData
}

/** Combine two copies of the same person's progress: nothing is lost, latest reviews and highest counts win. */
export function mergeData(a: ProgressData, b: ProgressData): ProgressData {
  const base: ProgressState = { ...emptyProgress, ...a }
  const r = mergeBackup(base, { app: APP_ID, kind: 'backup', v: FORMAT_VERSION, exportedAt: 0, data: { ...emptyProgress, ...b } })
  return pickData({ ...base, ...r.state, settings: b.settings ?? a.settings })
}

/** True when merging changed any progress (settings aside). */
export function dataChanged(before: ProgressData, after: Partial<ProgressData>): boolean {
  return DATA_KEYS.some((k) => k !== 'settings' && k in after && JSON.stringify(before[k]) !== JSON.stringify(after[k]))
}
