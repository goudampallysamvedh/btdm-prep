import { describe, expect, it } from 'vitest'
import { emptyProgress, type ProgressState } from './store'
import { makeBackup, makePartnerPackage, mergeBackup, mergePartner, parseShared, partnerSummary, teamExam, toCode } from './share'
import { helpIdeas } from './partner'
import { areaReadiness } from './mastery'
import { QUESTIONS } from '@/data/questions'
import type { CaseAttempt, CasePlan } from '@/types'

const plan = (caseId: string, updatedAt: number, notes = ''): CasePlan => ({
  caseId, updatedAt, owners: { 0: 'A' }, points: {}, handoffs: {}, opener: '', closer: '', solution: '', judgeQs: [], notes,
})
const attempt = (id: string): CaseAttempt => ({ id, caseId: 'northline', at: 1, partnerA: 'A', partnerB: 'B', lines: [], total: 70, notes: '' })

function state(patch: Partial<ProgressState> = {}): ProgressState {
  return { ...emptyProgress, ...patch, settings: { ...emptyProgress.settings, partnerA: 'Ava', partnerB: 'Ben', ...(patch.settings ?? {}) } }
}

describe('share codes', () => {
  it('round-trips a partner package through a code', () => {
    const pkg = makePartnerPackage(state({ casePlans: { northline: plan('northline', 5) }, caseAttempts: [attempt('x')] }))
    const r = parseShared(toCode(pkg))
    expect(r.ok).toBe(true)
    if (r.ok && r.value.kind === 'partner') {
      expect(r.value.plans).toHaveLength(1)
      expect(r.value.attempts[0].id).toBe('x')
      expect(r.value.from).toBe('Ava')
    }
  })
  it('accepts raw JSON backups and rejects junk', () => {
    expect(parseShared(JSON.stringify(makeBackup(state()))).ok).toBe(true)
    expect(parseShared('hello').ok).toBe(false)
    expect(parseShared('ST1.garbage').ok).toBe(false)
    expect(parseShared(JSON.stringify({ app: 'other' })).ok).toBe(false)
  })
})

describe('merging', () => {
  it('keeps the newer case plan and unions attempts', () => {
    const mine = state({ casePlans: { northline: plan('northline', 10, 'mine'), glow: plan('glow', 50, 'mine') }, caseAttempts: [attempt('a')] })
    const theirs = makePartnerPackage(state({ settings: { ...emptyProgress.settings, partnerA: 'Ava', partnerB: 'Ben', me: 'B' }, casePlans: { northline: plan('northline', 20, 'theirs'), glow: plan('glow', 5, 'theirs') }, caseAttempts: [attempt('a'), attempt('b')] }))
    const r = mergePartner(mine, theirs)
    expect(r.state.casePlans!.northline.notes).toBe('theirs')
    expect(r.state.casePlans!.glow.notes).toBe('mine')
    expect(r.state.caseAttempts!.map((a) => a.id).sort()).toEqual(['a', 'b'])
    expect(r.state.partner?.name).toBe('Ben')
  })
  it('does not store your own package as partner data', () => {
    const s = state()
    const r = mergePartner(s, makePartnerPackage(s))
    expect(r.state.partner).toBeUndefined()
  })
  it('merges backups without losing tests', () => {
    const t = (id: string) => ({ id, kind: 'practice' as const, title: id, startedAt: 0, finishedAt: 1, answers: [] })
    const r = mergeBackup(state({ tests: [t('1')] }), makeBackup(state({ tests: [t('1'), t('2')] })))
    expect(r.state.tests!.map((x) => x.id)).toEqual(['1', '2'])
  })
  it('combines two devices of the same person without losing or double-counting', () => {
    const t = (id: string) => ({ id, kind: 'practice' as const, title: id, startedAt: 0, finishedAt: 1, answers: [] })
    const card = (box: number, last: number) => ({ box, due: 0, seen: box, lapses: 0, last })
    const phone = state({
      tests: [t('p1')],
      leitner: { a: card(3, 100), b: card(1, 50) },
      daily: { '2026-10-17': { cards: 4 } },
      mathStats: { markup: { kind: 'markup', tried: 5, correct: 4 } },
      lessonsDone: { risk: 1 },
    })
    const laptop = state({
      tests: [t('l1')],
      leitner: { a: card(2, 90), b: card(4, 200), c: card(1, 10) },
      daily: { '2026-10-17': { cards: 10, questions: 5 } },
      mathStats: { markup: { kind: 'markup', tried: 3, correct: 3 } },
      lessonsDone: { goals: 2 },
    })
    const r = mergeBackup(phone, makeBackup(laptop))
    const merged = { ...phone, ...r.state } as ProgressState
    expect(merged.tests.map((x) => x.id).sort()).toEqual(['l1', 'p1'])
    expect(merged.leitner.a.box).toBe(3) // phone reviewed it more recently
    expect(merged.leitner.b.box).toBe(4) // laptop reviewed it more recently
    expect(merged.leitner.c).toBeDefined()
    expect(merged.daily['2026-10-17']).toEqual({ cards: 10, questions: 5 })
    expect(merged.mathStats.markup).toMatchObject({ tried: 5, correct: 4 })
    expect(Object.keys(merged.lessonsDone).sort()).toEqual(['goals', 'risk'])
    // Syncing back and forth again changes nothing.
    const again = mergeBackup(merged, makeBackup(laptop))
    expect({ ...merged, ...again.state }).toEqual(merged)
    const back = mergeBackup(laptop, makeBackup(merged))
    expect({ ...laptop, ...back.state }.leitner).toEqual(merged.leitner)
  })
  it('copies names to a device that was never set up, but never overwrites them', () => {
    const fresh = { ...emptyProgress }
    const named = state({ settings: { ...emptyProgress.settings, partnerA: 'Ava', partnerB: 'Ben', competitionDate: '2027-01-10' } })
    expect(mergeBackup(fresh, makeBackup(named)).state.settings?.partnerA).toBe('Ava')
    const other = state({ settings: { ...emptyProgress.settings, partnerA: 'Zoe', partnerB: 'Max' } })
    expect(mergeBackup(other, makeBackup(named)).state.settings).toBeUndefined()
  })
  it('round-trips a full progress code', () => {
    const r = parseShared(toCode(makeBackup(state({ lessonsDone: { risk: 1 } }))))
    expect(r.ok && r.value.kind === 'backup' && r.value.data.lessonsDone.risk).toBe(1)
  })
  it('averages team exam scores', () => {
    expect(teamExam(80, { name: 'B', projected: 70, areas: {}, answered: 0, at: 0 })).toBe(75)
    expect(teamExam(80, null)).toBeNull()
  })
})

describe('partner progress', () => {
  const now = new Date(2026, 9, 18, 12)
  const day = (d: number) => `2026-10-${String(d).padStart(2, '0')}`
  const testFor = (area: string, right: number, wrong: number, id: string) => {
    const qs = QUESTIONS.filter((q) => q.area === area).slice(0, right + wrong)
    return { id, kind: 'practice' as const, title: id, startedAt: 0, finishedAt: now.getTime() - 1000, answers: qs.map((q, i) => ({ qid: q.id, chosen: 0, correct: i < right, ms: 1000 })) }
  }

  it('reports streak, this week, focus areas, topics, and trend', () => {
    const s = state({
      activity: { [day(18)]: 3, [day(17)]: 2, [day(16)]: 1, [day(13)]: 4 },
      planDone: { [day(18)]: 1, [day(17)]: 1, [day(16)]: 1, [day(13)]: 1 },
      tests: [testFor('PR', 1, 7, 't1'), testFor('PM', 8, 0, 't2')],
      leitner: { 'm-001': { box: 3, due: 0, seen: 3, lapses: 0, last: 1 }, 'm-002': { box: 1, due: 0, seen: 1, lapses: 1, last: 2 } },
      lessonsDone: { risk: 1, goals: 1 },
      caseAttempts: [attempt('a')],
    })
    const p = partnerSummary(s, 'Ava', now)
    expect(p.streak).toBe(3)
    expect(p.activeDays7).toBe(4)
    expect(p.focus).toHaveLength(3)
    expect(p.focus).toContain('PR')
    expect(p.focus).not.toContain('PM')
    expect(p.topics!.need).toBeGreaterThan(0)
    expect(p.needTopics!.length).toBeGreaterThan(0)
    expect(p.cards).toEqual({ known: 1, learning: 1 })
    expect(p.lessonsDone).toBe(2)
    expect(p.trend).toHaveLength(2)
    expect(p.cases).toEqual({ attempts: 1, best: 70 })
  })

  it('survives a code round trip and old codes without the new fields', () => {
    const pkg = makePartnerPackage(state({ settings: { ...emptyProgress.settings, partnerA: 'Ava', partnerB: 'Ben', me: 'B' } }))
    const r = parseShared(toCode(pkg))
    expect(r.ok && r.value.kind === 'partner' && r.value.summary.streak).toBe(0)
    const old = { name: 'Ben', projected: 60, areas: { PR: 0.4 }, answered: 10, at: 0 }
    expect(helpIdeas(areaReadiness([]), old)).toEqual({ youHelp: [], theyHelp: [] })
  })

  it('finds where partners can coach each other', () => {
    const mine = areaReadiness([testFor('PR', 8, 0, 'a'), testFor('PM', 1, 7, 'b')])
    const p = { name: 'Ben', projected: 60, areas: { PR: 0.4, PM: 0.85 }, answered: 20, at: 0 }
    const h = helpIdeas(mine, p)
    expect(h.youHelp.map((x) => x.area)).toEqual(['PR'])
    expect(h.theyHelp.map((x) => x.area)).toEqual(['PM'])
  })
})
