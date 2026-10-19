import { describe, expect, it } from 'vitest'
import { channelFor, makeLinkCode, newSecret, parseLinkCode, seal, unseal, type LiveMessage } from './live'

const summary = { name: 'Ava', projected: 61.5, areas: { PR: 0.7 }, answered: 40, at: 1_760_000_000_000, streak: 4 }
const msg: LiveMessage = { v: 1, me: 'A', summary }

describe('live partner updates', () => {
  it('derives the same channel and key from the same secret, and different ones otherwise', async () => {
    const s = newSecret()
    const [a, b, c] = await Promise.all([channelFor(s), channelFor(s), channelFor(newSecret())])
    expect(a.topic).toBe(b.topic)
    expect(a.topic).toMatch(/^st-[0-9a-f]{40}$/)
    expect(a.topic).not.toBe(c.topic)
    expect(await unseal(b.key, await seal(a.key, msg))).toEqual(msg)
  })

  it('cannot be read or faked without the secret', async () => {
    const mine = await channelFor(newSecret())
    const stranger = await channelFor(newSecret())
    const sealed = await seal(mine.key, msg)
    expect(sealed).not.toContain('Ava')
    expect(await unseal(stranger.key, sealed)).toBeNull()
    const [iv, ct] = sealed.split('.')
    const tampered = `${iv}.${ct.slice(0, -2)}${ct.endsWith('A') ? 'B' : 'A'}${ct.slice(-1)}`
    expect(await unseal(mine.key, tampered)).toBeNull()
    expect(await unseal(mine.key, 'garbage')).toBeNull()
  })

  it('round-trips link codes and rejects junk', () => {
    const info = { key: newSecret(), me: 'B' as const, a: 'Ava', b: 'Ben' }
    expect(parseLinkCode(makeLinkCode(info))).toEqual(info)
    expect(parseLinkCode('hello')).toBeNull()
    expect(parseLinkCode('STL1.abc')).toBeNull()
  })

  it('keeps an encrypted update small enough for the relay', async () => {
    const big = { ...summary, areas: Object.fromEntries('PM IM EI PR EC FI OP PD SE CM CO NF MP PI BL CR EN HR MK SM'.split(' ').map((a) => [a, 0.123])), needTopics: Array.from({ length: 8 }, (_, i) => `XX.topic-${i}`), focus: ['PM', 'IM', 'EI'], topics: { learned: 30, shaky: 20, need: 10 }, cards: { known: 400, learning: 100 }, trend: [0.5, 0.6, 0.7, 0.8, 0.5, 0.6, 0.7, 0.8], cases: { attempts: 9, best: 88 }, lessonsDone: 16, activeDays7: 7 }
    const ch = await channelFor(newSecret())
    expect((await seal(ch.key, { v: 1, me: 'A', summary: big })).length).toBeLessThan(4000)
  })
})

describe('full progress between devices', () => {
  it('packs and unpacks a progress update, and strangers cannot open it', async () => {
    const { emptyProgress } = await import('./store')
    const { pickData } = await import('./share')
    const { packState, unpackState } = await import('./live')
    const ch = await channelFor(newSecret())
    const data = pickData({ ...emptyProgress, planDone: { '2026-10-18': 1 } })
    const msg = { v: 2 as const, me: 'A' as const, device: 'd1', sentAt: 5, data }
    const bytes = await packState(ch.key, msg)
    expect(await unpackState(ch.key, bytes)).toEqual(msg)
    expect(await unpackState((await channelFor(newSecret())).key, bytes)).toBeNull()
  })

  it('combines the same person from different devices: union of finished days, latest card reviews, all tests', async () => {
    const { emptyProgress } = await import('./store')
    const { mergeData, pickData } = await import('./share')
    const t = (id: string) => ({ id, kind: 'practice' as const, title: id, startedAt: 0, finishedAt: 1, answers: [] })
    const phone = pickData({ ...emptyProgress, planDone: { '2026-10-17': 1, '2026-10-18': 1 }, tests: [t('p')], leitner: { c1: { box: 3, due: 0, seen: 3, lapses: 0, last: 200 } } })
    const laptop = pickData({ ...emptyProgress, planDone: { '2026-10-16': 1 }, tests: [t('l')], leitner: { c1: { box: 1, due: 0, seen: 1, lapses: 1, last: 100 } } })
    const m = mergeData(phone, laptop)
    expect(Object.keys(m.planDone).sort()).toEqual(['2026-10-16', '2026-10-17', '2026-10-18'])
    expect(m.tests.map((x) => x.id).sort()).toEqual(['l', 'p'])
    expect(m.leitner.c1.box).toBe(3)
    // Same result in either order, and merging again changes nothing.
    expect(mergeData(laptop, phone).planDone).toEqual(m.planDone)
    expect(mergeData(m, laptop)).toEqual(m)
  })
})

describe('telling you and your partner apart', () => {
  const who = (me: 'A' | 'B', a: string, b: string) => ({ settings: { theme: 'system' as const, competitionDate: '', competitionName: '', partnerA: a, partnerB: b, me, dailyGoal: 20 } })
  it('uses names when both are set, so a device in the wrong slot is still recognized as you', async () => {
    const { isMine } = await import('./live')
    const me = who('A', 'Samvedh', 'Arjun')
    expect(isMine(who('B', 'Arjun', 'Samvedh'), 'B', me)).toBe(true) // your device, wrong slot
    expect(isMine(who('B', 'Samvedh', 'Arjun'), 'B', me)).toBe(false) // your partner
    expect(isMine(who('A', 'Samvedh', 'Arjun'), 'A', me)).toBe(true)
  })
  it('falls back to the slot when names are not set', async () => {
    const { isMine } = await import('./live')
    expect(isMine(who('A', 'Partner A', 'Partner B'), 'A', who('A', 'Partner A', 'Partner B'))).toBe(true)
    expect(isMine(who('B', 'Partner A', 'Partner B'), 'B', who('A', 'Partner A', 'Partner B'))).toBe(false)
  })
})
