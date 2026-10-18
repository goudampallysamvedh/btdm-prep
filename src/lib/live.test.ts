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
