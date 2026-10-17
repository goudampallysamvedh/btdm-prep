import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import type { CaseAttempt, CasePlan, LeitnerState, TestRecord } from '@/types'
import type { PartnerSummary, ProgressState } from './store'
import { areaReadiness, projectedScore } from './mastery'

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
  const r = areaReadiness(s.tests)
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
    summary: {
      name: me,
      projected: Math.round(projectedScore(r) * 10) / 10,
      areas: Object.fromEntries(r.filter((a) => a.answered).map((a) => [a.area, Math.round(a.accuracy * 1000) / 1000])),
      answered: s.tests.reduce((n, t) => n + t.answers.length, 0),
      at: Date.now(),
    },
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

/** Merge a backup into the current device (e.g., same person, second device). */
export function mergeBackup(s: ProgressState, b: Backup): MergeResult {
  const d = b.data
  const tests = unionById<TestRecord>(s.tests, d.tests ?? [])
  const leitner: Record<string, LeitnerState> = { ...s.leitner }
  for (const [id, st] of Object.entries(d.leitner ?? {})) {
    if (!leitner[id] || (st.last ?? 0) > (leitner[id].last ?? 0)) leitner[id] = st
  }
  const activity = { ...s.activity }
  for (const [k, n] of Object.entries(d.activity ?? {})) activity[k] = Math.max(activity[k] ?? 0, n)
  const plans = { ...s.casePlans }
  for (const plan of Object.values(d.casePlans ?? {})) if (!plans[plan.caseId] || plan.updatedAt > plans[plan.caseId].updatedAt) plans[plan.caseId] = plan
  return {
    state: {
      tests,
      leitner,
      activity,
      casePlans: plans,
      caseAttempts: unionById(s.caseAttempts, d.caseAttempts ?? []),
      officialScores: unionById(s.officialScores ?? [], d.officialScores ?? []),
      lessonsDone: { ...(d.lessonsDone ?? {}), ...s.lessonsDone },
      trendsRead: { ...(d.trendsRead ?? {}), ...s.trendsRead },
      judgeDrill: { ...(d.judgeDrill ?? {}), ...s.judgeDrill },
      mathStats: { ...(d.mathStats ?? {}), ...s.mathStats },
    },
    summary: [`${tests.length - s.tests.length} tests added`, `${Object.keys(leitner).length} flashcards tracked`],
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
