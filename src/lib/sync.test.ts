import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { TestRecord } from '@/types'

// No IndexedDB in node: keep saved progress in memory.
vi.mock('idb-keyval', () => ({ get: async () => undefined, set: async () => {}, del: async () => {} }))

const { emptyProgress, useStore } = await import('./store')
const { acceptState, channelFor, isMine, joinLink, makeQueue, newSecret, packState, syncVault, unpackState, vaultId } = await import('./live')
const { mergeBackup, mergeData, mergePartner, makePartnerPackage, pickData, stableJson } = await import('./share')
type ProgressState = typeof emptyProgress

const t = (id: string): TestRecord => ({ id, kind: 'practice', title: id, startedAt: 0, finishedAt: 1, answers: [] })
const names = (me: 'A' | 'B', a = 'Sam', b = 'Arjun') => ({ ...emptyProgress.settings, partnerA: a, partnerB: b, me })
const person = (patch: Partial<ProgressState> = {}): ProgressState => ({ ...emptyProgress, settings: names('A'), ...patch })
const backup = (data: ProgressState) => ({ app: 'sell-through' as const, kind: 'backup' as const, v: 1, exportedAt: 0, data })
const ids = (tests: TestRecord[]) => tests.map((x) => x.id).sort()

beforeEach(() => useStore.setState({ ...emptyProgress, settings: names('A') }))
afterEach(() => vi.unstubAllGlobals())

/** An in-memory stand-in for the shared copy (textdb.dev). */
function fakeVault() {
  const saved = new Map<string, string>()
  const posts: string[] = []
  const state = { offline: false, readStatus: 200, afterPost: undefined as undefined | ((id: string) => void) }
  vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
    if (state.offline) throw new TypeError('Failed to fetch')
    const id = url.split('/').pop()!
    if (init?.method === 'POST') {
      saved.set(id, String(init.body))
      posts.push(id)
      const hook = state.afterPost
      state.afterPost = undefined
      hook?.(id)
      return new Response('ok')
    }
    return new Response(state.readStatus === 200 ? (saved.get(id) ?? '') : 'error', { status: state.readStatus })
  })
  return { saved, posts, state }
}
const encode = async (key: CryptoKey, data: ProgressState, device = 'laptop') =>
  Buffer.from(await packState(key, { v: 2, me: data.settings.me, device, sentAt: 1, data: pickData(data) })).toString('base64url')
const decode = async (key: CryptoKey, text: string) => (await unpackState(key, Buffer.from(text, 'base64url')))!.data

describe('the shared copy (vault)', () => {
  it('never saves over the copy when it could not read it (server error), so nothing there is lost', async () => {
    const secret = newSecret()
    const { key } = await channelFor(secret)
    const v = fakeVault()
    const id = await vaultId(secret, 'A')
    v.saved.set(id, await encode(key, person({ tests: [t('laptop')] })))
    useStore.setState({ tests: [t('phone')] })
    v.state.readStatus = 503
    await syncVault(secret, key)
    expect(v.posts).toEqual([])
    expect(ids((await decode(key, v.saved.get(id)!)).tests)).toEqual(['laptop'])
  })

  it('offline then online: nothing changes while offline, then both sides catch up', async () => {
    const secret = newSecret()
    const { key } = await channelFor(secret)
    const v = fakeVault()
    const id = await vaultId(secret, 'A')
    v.saved.set(id, await encode(key, person({ tests: [t('laptop')] })))
    useStore.setState({ tests: [t('phone')] })
    v.state.offline = true
    await syncVault(secret, key)
    expect(ids(useStore.getState().tests)).toEqual(['phone'])
    v.state.offline = false
    await syncVault(secret, key)
    expect(ids(useStore.getState().tests)).toEqual(['laptop', 'phone'])
    expect(ids((await decode(key, v.saved.get(id)!)).tests)).toEqual(['laptop', 'phone'])
  })

  it('a reload before saving: the next open saves what only this device has', async () => {
    const secret = newSecret()
    const { key } = await channelFor(secret)
    const v = fakeVault()
    useStore.setState({ tests: [t('before-reload')] }) // made, then the app reloaded before the save
    await syncVault(secret, key)
    expect(ids((await decode(key, v.saved.get(await vaultId(secret, 'A'))!)).tests)).toEqual(['before-reload'])
  })

  it('two of your devices saving at the same time: the one that was overwritten merges and saves again', async () => {
    const secret = newSecret()
    const { key } = await channelFor(secret)
    const v = fakeVault()
    const id = await vaultId(secret, 'A')
    v.saved.set(id, await encode(key, person({ tests: [t('base')] })))
    // The laptop read the copy before this phone saved, and saves right after it (last write wins).
    const laptop = await encode(key, person({ tests: [t('base'), t('laptop')] }))
    v.state.afterPost = (i) => v.saved.set(i, laptop)
    useStore.setState({ tests: [t('phone')] })
    await syncVault(secret, key)
    expect(ids((await decode(key, v.saved.get(id)!)).tests)).toEqual(['base', 'laptop', 'phone'])
    expect(ids(useStore.getState().tests)).toEqual(['base', 'laptop', 'phone'])
  })

  it('does not save again when the copy only differs in order', async () => {
    const secret = newSecret()
    const { key } = await channelFor(secret)
    const v = fakeVault()
    const id = await vaultId(secret, 'A')
    v.saved.set(id, await encode(key, person({ tests: [t('b'), t('a')], planDone: { '2026-11-02': 1, '2026-11-01': 1 } })))
    useStore.setState({ tests: [t('a'), t('b')], planDone: { '2026-11-01': 1, '2026-11-02': 1 } })
    await syncVault(secret, key)
    expect(v.posts).toEqual([])
    expect(stableJson({ x: [t('b'), t('a')], y: 1 })).toBe(stableJson({ y: 1, x: [t('a'), t('b')] }))
  })
})

describe('the sync queue', () => {
  it('keeps going after a task fails (before, one bad update left live updates stuck on "Connecting")', async () => {
    const run = makeQueue()
    const done: number[] = []
    void run(async () => {
      throw new Error('bad update')
    })
    await run(async () => void done.push(1))
    expect(done).toEqual([1])
  })
})

describe('who is who', () => {
  it('renaming yourself on one device keeps you as you on your other devices', () => {
    expect(isMine({ settings: names('A', 'Samvedh') }, 'A', { settings: names('A', 'Sam') })).toBe(true)
    // ...and your partner stays your partner, whatever they are called now.
    expect(isMine({ settings: names('B', 'Sam', 'Arjun K') }, 'B', { settings: names('A', 'Sam', 'Arjun') })).toBe(false)
  })

  it('your own renamed progress is merged into yours, not shown as your partner', async () => {
    useStore.setState({ tests: [t('phone')] })
    await acceptState({ v: 2, me: 'A', device: 'laptop', sentAt: 1, data: pickData(person({ settings: { ...names('A', 'Samvedh'), updatedAt: 5 }, tests: [t('laptop')] })) }, 'phone')
    const st = useStore.getState()
    expect(ids(st.tests)).toEqual(['laptop', 'phone'])
    expect(st.partnerData).toBeNull()
    expect(st.settings.partnerA).toBe('Samvedh')
  })

  it('a partner who renamed themselves keeps all their progress instead of being replaced', async () => {
    const partner = (n: string, test: string, at = 0) => ({ v: 2 as const, me: 'B' as const, device: test, sentAt: 1, data: pickData(person({ settings: { ...names('B', 'Sam', n), updatedAt: at }, tests: [t(test)] })) })
    await acceptState(partner('Arjun', 'arjun-phone'), 'me')
    await acceptState(partner('Arjun K', 'arjun-laptop', 9), 'me')
    await acceptState(partner('Arjun', 'arjun-phone'), 'me') // the phone hasn't seen the new name yet
    const st = useStore.getState()
    expect(ids(st.partnerData!.tests)).toEqual(['arjun-laptop', 'arjun-phone'])
    expect(st.partner?.name).toBe('Arjun K') // the newest name wins, whichever device spoke last
  })

  it('joining a link takes its names, so A and B mean the same people on every device', () => {
    useStore.setState({ settings: names('B', 'Arjun', 'Sam') }) // this device had the names the other way round
    const info = { key: newSecret(), me: 'A' as const, a: 'Sam', b: 'Arjun' }
    expect(joinLink(info, 'A')).toBe('Sam')
    const s = useStore.getState().settings
    expect([s.partnerA, s.partnerB, s.me]).toEqual(['Sam', 'Arjun', 'A'])
    expect(s.updatedAt).toBeGreaterThan(0)
  })

  it('switching to a different link drops the old partner (the new link refills it); re-pasting the same link keeps it', () => {
    const key = newSecret()
    const other = { ...emptyProgress, settings: names('B') }
    useStore.setState({ live: { key, linkedAt: 1 }, partnerData: pickData(other), partner: { name: 'Arjun', projected: 50, areas: {}, answered: 1, at: 1 } })
    joinLink({ key, me: 'A', a: 'Sam', b: 'Arjun' }, 'A')
    expect(useStore.getState().partnerData).not.toBeNull()
    joinLink({ key: newSecret(), me: 'A', a: 'Sam', b: 'Priya' }, 'A')
    expect(useStore.getState().partnerData).toBeNull()
    expect(useStore.getState().partner).toBeNull()
  })
})

describe('merging your devices', () => {
  it('a deleted test, case score, official score, or card review never comes back from another device', () => {
    useStore.setState(person({ tests: [t('keep'), t('gone')], leitner: { c1: { box: 2, due: 0, seen: 1, lapses: 0, last: 100 } }, caseAttempts: [{ id: 'ca', caseId: 'x', at: 1, partnerA: 'A', partnerB: 'B', lines: [], total: 70, notes: '' }], officialScores: [{ id: 'o1', exam: 'e', score: 70, at: 1 }] }))
    const other = pickData(useStore.getState() as ProgressState) // the laptop still has everything
    const st = useStore.getState()
    st.deleteTest('gone')
    st.resetLeitner(['c1'])
    st.deleteCaseAttempt('ca')
    st.deleteOfficial('o1')
    const here = useStore.getState() as ProgressState
    const merged = mergeBackup(here, backup({ ...emptyProgress, ...other })).state
    expect(ids(merged.tests!)).toEqual(['keep'])
    expect(merged.leitner).toEqual({})
    expect(merged.caseAttempts).toEqual([])
    expect(merged.officialScores).toEqual([])
    // ...and the laptop deletes them too when it hears from this device.
    const there = mergeBackup({ ...emptyProgress, ...other }, backup(here)).state
    expect(ids(there.tests!)).toEqual(['keep'])
    expect(there.leitner).toEqual({})
    // A card reviewed again after the reset stays.
    const later = mergeBackup(here, backup({ ...emptyProgress, ...other, leitner: { c1: { box: 1, due: 0, seen: 2, lapses: 0, last: Date.now() + 1000 } } })).state
    expect(Object.keys(later.leitner!)).toEqual(['c1'])
  })

  it('keeps the higher judge-question count from either device', () => {
    const r = mergeBackup(person({ judgeDrill: { q1: 1, q2: 5 } }), backup(person({ judgeDrill: { q1: 4, q2: 2 } }))).state
    expect(r.judgeDrill).toEqual({ q1: 4, q2: 5 })
  })

  it('a sync code that turns on live updates also brings the names, so the slot letters agree', () => {
    const laptop = person({ settings: names('B', 'Arjun', 'Sam') }) // names the other way round
    const phone = person({ settings: names('A'), live: { key: newSecret(), linkedAt: 1 } })
    const s = mergeBackup(laptop, backup(phone)).state.settings!
    expect([s.partnerA, s.partnerB, s.me]).toEqual(['Sam', 'Arjun', 'A'])
  })

  it("keeps the partner's most recently changed settings, whichever update arrives last", () => {
    const newer = pickData(person({ settings: { ...names('B', 'Sam', 'Arjun K'), updatedAt: 9 } }))
    const older = pickData(person({ settings: { ...names('B'), updatedAt: 2 } }))
    expect(mergeData(newer, older).settings.partnerB).toBe('Arjun K')
    expect(mergeData(older, newer).settings.partnerB).toBe('Arjun K')
  })
})

describe('partner codes', () => {
  it('an old partner code does not roll back newer progress from the same partner', () => {
    const fresh = { name: 'Arjun', projected: 80, areas: {}, answered: 500, at: 2_000 }
    const here = person({ partner: fresh })
    const stale = { ...makePartnerPackage(person({ settings: names('B') })), summary: { ...fresh, projected: 40, at: 1_000 } }
    const r = mergePartner(here, stale)
    expect(r.state.partner).toBeUndefined()
    expect(r.summary.join(' ')).toMatch(/older/)
    // A newer code still updates.
    expect(mergePartner(here, { ...stale, summary: { ...fresh, at: 3_000 } }).state.partner?.at).toBe(3_000)
  })
})
