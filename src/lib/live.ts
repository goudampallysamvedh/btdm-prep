/**
 * Live partner updates through ntfy.sh, a free public relay that needs no account.
 *
 * Partners share one random team secret (the "live link"). From it, each phone derives:
 *  - a channel name on the relay, which is hard to guess, and
 *  - an AES-GCM key. Every update is encrypted on the phone before it's sent, so the relay
 *    only ever passes along scrambled data. Without the secret, nobody can read or fake one.
 * Each device sends its owner's study progress. Every linked device combines what it hears:
 * your own devices merge your progress, and everyone keeps your partner's progress combined
 * from all of their devices, so every device shows the latest for both of you.
 */
import { useEffect, useRef } from 'react'
import { create } from 'zustand'
import { compressToUint8Array, decompressFromUint8Array } from 'lz-string'
import { emptyProgress, useHydrated, useStore, type PartnerSummary, type ProgressData } from './store'

export const RELAY = 'https://ntfy.sh'
const LINK_PREFIX = 'STL1.'

// ---------- Encoding ----------

function b64url(bytes: Uint8Array): string {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function unb64url(s: string): Uint8Array {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4))
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}
const sha256 = async (text: string) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))
const hex = (b: Uint8Array) => [...b].map((x) => x.toString(16).padStart(2, '0')).join('')

// ---------- Link names ----------

const WORDS = 'amber,maple,coral,olive,cobalt,ruby,jade,ivory,lemon,plum,slate,sage,copper,denim,mint,peach,otter,falcon,tiger,koala,panda,raven,bison,lynx,heron,moose,gecko,orca,puffin,zebra,llama,badger'.split(',')

/** A short, readable name for a link ("amber-otter-42"). Every device on the same link shows the same name. */
export async function linkName(secret: string): Promise<string> {
  const h = await sha256(`name:${secret}`)
  return `${WORDS[h[0] % 16]}-${WORDS[16 + (h[1] % 16)]}-${10 + (h[2] % 90)}`
}

// ---------- Link codes ----------

export interface LinkInfo {
  key: string
  /** Which partner (A or B) made the link; the other partner joins as the opposite letter. */
  me: 'A' | 'B'
  a: string
  b: string
}

export function newSecret(): string {
  return b64url(crypto.getRandomValues(new Uint8Array(32)))
}

export function makeLinkCode(info: LinkInfo): string {
  return LINK_PREFIX + b64url(new TextEncoder().encode(JSON.stringify(info)))
}

export function parseLinkCode(text: string): LinkInfo | null {
  const t = text.trim()
  if (!t.startsWith(LINK_PREFIX)) return null
  try {
    const o = JSON.parse(new TextDecoder().decode(unb64url(t.slice(LINK_PREFIX.length)))) as LinkInfo
    if (typeof o.key !== 'string' || o.key.length < 40 || (o.me !== 'A' && o.me !== 'B')) return null
    return { key: o.key, me: o.me, a: String(o.a ?? ''), b: String(o.b ?? '') }
  } catch {
    return null
  }
}

// ---------- Channel and encryption ----------

export interface Channel {
  topic: string
  key: CryptoKey
}

export async function channelFor(secret: string): Promise<Channel> {
  const topic = 'st-' + hex(await sha256(`topic:${secret}`)).slice(0, 40)
  const key = await crypto.subtle.importKey('raw', await sha256(`key:${secret}`), 'AES-GCM', false, ['encrypt', 'decrypt'])
  return { topic, key }
}

export interface LiveMessage {
  v: 1
  /** The sender's partner letter, so each phone can ignore its own team member's echoes. */
  me: 'A' | 'B'
  summary: PartnerSummary
}

export async function seal(key: CryptoKey, msg: LiveMessage): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(msg))))
  return `${b64url(iv)}.${b64url(ct)}`
}

export async function unseal(key: CryptoKey, payload: string): Promise<LiveMessage | null> {
  try {
    const [iv, ct] = payload.split('.')
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64url(iv) }, key, unb64url(ct))
    const msg = JSON.parse(new TextDecoder().decode(plain)) as LiveMessage
    return msg.v === 1 && msg.summary && (msg.me === 'A' || msg.me === 'B') ? msg : null
  } catch {
    return null // wrong key or tampered: ignore
  }
}

// ---------- Status (this visit only) ----------

export type LiveState = 'off' | 'connecting' | 'live' | 'offline'
export const useLiveStatus = create<{ state: LiveState; lastSent: number; lastHeard: number; slotClash: 'A' | 'B' | null }>()(() => ({ state: 'off', lastSent: 0, lastHeard: 0, slotClash: null }))

const isRealName = (n?: string) => !!n && !/^Partner [AB]$/.test(n.trim())
const nameOf = (s: Pick<ProgressData, 'settings'>) => (s.settings?.me === 'B' ? s.settings?.partnerB : s.settings?.partnerA)?.trim() ?? ''

/**
 * Whose progress is this: yours or your partner's? Names decide when both are set (so a device
 * that picked the wrong slot can't make you your own partner); otherwise the slot letter does.
 */
export function isMine(sender: Pick<ProgressData, 'settings'>, senderSlot: 'A' | 'B', me: Pick<ProgressData, 'settings'>): boolean {
  const a = nameOf(sender)
  const b = nameOf(me)
  if (isRealName(a) && isRealName(b)) return a.toLowerCase() === b.toLowerCase()
  return senderSlot === me.settings.me
}

/** Clear "partner" data that is really your own (left over from a slot mix-up). */
export function dropSelfAsPartner() {
  const st = useStore.getState()
  const me = nameOf(st)
  if (!isRealName(me)) return
  const pName = st.partner?.name?.trim().toLowerCase()
  const dName = st.partnerData ? nameOf(st.partnerData).toLowerCase() : undefined
  if (pName === me.toLowerCase() || dName === me.toLowerCase()) st.replaceAll({ partner: null, partnerData: null })
}

/** Encrypt bytes: 12-byte IV followed by the AES-GCM ciphertext. */
export async function sealBytes(key: CryptoKey, bytes: Uint8Array): Promise<Uint8Array> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes))
  const out = new Uint8Array(12 + ct.length)
  out.set(iv)
  out.set(ct, 12)
  return out
}
export async function unsealBytes(key: CryptoKey, bytes: Uint8Array): Promise<Uint8Array | null> {
  try {
    return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes.slice(0, 12) }, key, bytes.slice(12)))
  } catch {
    return null
  }
}

/** A device's full progress update (sent as an encrypted file on the relay). */
export interface StateMessage {
  v: 2
  me: 'A' | 'B'
  device: string
  sentAt: number
  data: ProgressData
}

export async function packState(key: CryptoKey, msg: StateMessage): Promise<Uint8Array> {
  return sealBytes(key, compressToUint8Array(JSON.stringify(msg)))
}
export async function unpackState(key: CryptoKey, bytes: Uint8Array): Promise<StateMessage | null> {
  const plain = await unsealBytes(key, bytes)
  if (!plain) return null
  try {
    const msg = JSON.parse(decompressFromUint8Array(plain) ?? '') as StateMessage
    return msg.v === 2 && msg.data && Array.isArray(msg.data.tests) && (msg.me === 'A' || msg.me === 'B') ? msg : null
  } catch {
    return null
  }
}

let memoryDevice: string | undefined
/** A random id for this device, so it can skip its own echoes. */
function deviceId(): string {
  try {
    let id = localStorage.getItem('st-device')
    if (!id) {
      id = b64url(crypto.getRandomValues(new Uint8Array(9)))
      localStorage.setItem('st-device', id)
    }
    return id
  } catch {
    memoryDevice ??= b64url(crypto.getRandomValues(new Uint8Array(9)))
    return memoryDevice
  }
}

/** Older app versions send only a summary. Use it until full progress from the partner arrives. */
export function acceptSummary(msg: LiveMessage) {
  const st = useStore.getState()
  if (msg.me === st.settings.me || st.partnerData) return
  if (isRealName(msg.summary.name) && msg.summary.name.trim().toLowerCase() === nameOf(st).toLowerCase()) return // that's you
  if (st.partner && msg.summary.at < st.partner.at) return
  st.replaceAll({ partner: msg.summary })
  useLiveStatus.setState({ lastHeard: Date.now() })
}

/** Merge a received progress update into the right person: you (another of your devices) or your partner. */
export async function acceptState(msg: StateMessage, self = deviceId()) {
  if (msg.device === self) return
  const { dataChanged, mergeBackup, mergeData, ownerName, partnerSummary, pickData } = await import('./share')
  const st = useStore.getState()
  if (isMine(msg.data, msg.me, st)) {
    // Your name in the other slot: one of your devices picked the wrong person. Flag it so it can be fixed.
    if (msg.me !== st.settings.me && msg.device !== 'vault') useLiveStatus.setState({ slotClash: msg.me })
    const r = mergeBackup(st, { app: 'sell-through', kind: 'backup', v: 1, exportedAt: msg.sentAt, data: { ...emptyProgress, ...msg.data } })
    const progress: Partial<ProgressData> = { ...r.state }
    // Settings (names, date, goal) only come from devices that agree on your slot, so a mixed-up
    // device can't swap names on your other devices.
    if (msg.me !== st.settings.me) delete progress.settings
    if (dataChanged(pickData(st), progress) || progress.settings) st.replaceAll(progress)
    return
  }
  // A different person than the partner saved here replaces them instead of being merged in.
  const oldName = st.partnerData ? nameOf(st.partnerData) : ''
  const newName = nameOf(msg.data)
  const samePerson = !(isRealName(oldName) && isRealName(newName) && oldName.toLowerCase() !== newName.toLowerCase())
  const merged = st.partnerData && samePerson ? mergeData(st.partnerData, msg.data) : pickData({ ...emptyProgress, ...msg.data })
  const summary = { ...partnerSummary({ ...emptyProgress, ...merged }, ownerName(merged)), at: Math.max(msg.sentAt, st.partner?.at ?? 0) }
  // Case plans and case scores belong to the team: take the partner's newer plans and any new scores.
  const casePlans = { ...st.casePlans }
  for (const plan of Object.values(msg.data.casePlans ?? {})) if (!casePlans[plan.caseId] || plan.updatedAt > casePlans[plan.caseId].updatedAt) casePlans[plan.caseId] = plan
  const known = new Set(st.caseAttempts.map((a) => a.id))
  const caseAttempts = [...st.caseAttempts, ...(msg.data.caseAttempts ?? []).filter((a) => !known.has(a.id))]
  const same =
    JSON.stringify(merged) === JSON.stringify(st.partnerData) &&
    caseAttempts.length === st.caseAttempts.length &&
    JSON.stringify(casePlans) === JSON.stringify(st.casePlans) &&
    JSON.stringify({ ...summary, at: 0 }) === JSON.stringify({ ...st.partner, at: 0 })
  if (!same) st.replaceAll({ partnerData: merged, partner: summary, casePlans, caseAttempts })
  useLiveStatus.setState({ lastHeard: Date.now() })
}

// ---------- The shared copy (never expires) ----------

/** textdb.dev: free, no-account text storage. Each person has one encrypted copy of all their progress. */
export const VAULT = 'https://textdb.dev/api/data'

export async function vaultId(secret: string, who: 'A' | 'B'): Promise<string> {
  return 'st-' + hex(await sha256(`vault:${secret}:${who}`)).slice(0, 40)
}

async function readVault(key: CryptoKey, id: string): Promise<StateMessage | null> {
  try {
    const r = await fetch(`${VAULT}/${id}`, { cache: 'no-store' })
    if (!r.ok) return null
    const text = (await r.text()).trim()
    return text ? await unpackState(key, unb64url(text)) : null
  } catch {
    return null
  }
}

async function writeVault(key: CryptoKey, id: string, msg: StateMessage): Promise<boolean> {
  try {
    const body = b64url(await packState(key, msg))
    const r = await fetch(`${VAULT}/${id}`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body })
    return r.ok
  } catch {
    return false
  }
}

/** Empty one slot's shared copy (after a device used the wrong slot). The right devices refill it. */
export async function resetVault(secret: string, who: 'A' | 'B'): Promise<void> {
  try {
    await fetch(`${VAULT}/${await vaultId(secret, who)}`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: ' ' })
  } catch {
    /* offline: the right devices will overwrite it anyway */
  }
}

/** Progress without per-device settings (theme, motion), for comparing copies. */
const progressSig = (d: ProgressData) => JSON.stringify({ ...d, settings: { a: d.settings?.partnerA, b: d.settings?.partnerB, date: d.settings?.competitionDate, at: d.settings?.updatedAt } })

/**
 * Make this device and both shared copies identical: read your copy and your partner's,
 * merge them in, then save your copy back if this device had anything it was missing.
 */
export async function syncVault(secret: string, key: CryptoKey): Promise<void> {
  const me = useStore.getState().settings.me
  const other = me === 'A' ? 'B' : 'A'
  const [myId, theirId] = await Promise.all([vaultId(secret, me), vaultId(secret, other)])
  const [mine, theirs] = await Promise.all([readVault(key, myId), readVault(key, theirId)])
  if (mine) await acceptState({ ...mine, me, device: 'vault' })
  if (theirs) await acceptState({ ...theirs, me: other, device: 'vault' })
  const { pickData } = await import('./share')
  const data = pickData(useStore.getState())
  if (!mine || progressSig(mine.data) !== progressSig(data)) {
    if (await writeVault(key, myId, { v: 2, me, device: deviceId(), sentAt: Date.now(), data })) useLiveStatus.setState({ lastSent: Date.now() })
  }
}

/** Re-figure the partner's streak and stats for today from their saved progress (a streak can end overnight). */
async function refreshPartner() {
  const st = useStore.getState()
  if (!st.partnerData) return
  const { ownerName, partnerSummary } = await import('./share')
  st.replaceAll({ partner: { ...partnerSummary({ ...emptyProgress, ...st.partnerData }, ownerName(st.partnerData)), at: st.partner?.at ?? Date.now() } })
}

interface RelayMessage {
  event?: string
  message?: string
  attachment?: { url: string }
}

/**
 * Keeps every device identical: on open it merges both shared copies, then listens for live
 * updates, re-checks every minute, and saves this device's progress whenever it changes.
 */
export function useLiveSync() {
  const hydrated = useHydrated()
  const secret = useStore((s) => s.live?.key)
  const chan = useRef<Channel | null>(null)
  const lastSent = useRef('')
  const queue = useRef<Promise<void>>(Promise.resolve())

  // Listen.
  useEffect(() => {
    if (hydrated) dropSelfAsPartner()
    if (!hydrated || !secret) {
      useLiveStatus.setState({ state: 'off' })
      return
    }
    let es: EventSource | null = null
    let stopped = false
    useLiveStatus.setState({ state: 'connecting' })
    ;(async () => {
      const ch = await channelFor(secret)
      chan.current = ch
      dropSelfAsPartner()
      // Catch up from the shared copies first (they never expire), then today's live updates.
      await (queue.current = queue.current.then(() => syncVault(secret, ch.key)))
      await refreshPartner()
      const handle = async (m: RelayMessage) => {
        if (m.event !== 'message') return
        if (m.attachment?.url) {
          try {
            const r = await fetch(m.attachment.url)
            if (!r.ok) return // expired (files last about 3 hours)
            const msg = await unpackState(ch.key, new Uint8Array(await r.arrayBuffer()))
            if (msg) await acceptState(msg)
          } catch {
            /* skip */
          }
        } else if (m.message) {
          const msg = await unseal(ch.key, m.message)
          if (msg) acceptSummary(msg)
        }
      }
      // Handle one message at a time so merges never race.
      const enqueue = (m: RelayMessage) => (queue.current = queue.current.then(() => handle(m)))
      try {
        const r = await fetch(`${RELAY}/${ch.topic}/json?poll=1&since=12h`)
        const lines = (await r.text()).split(/\r?\n/).filter((l) => l.trim())
        for (const line of lines) await enqueue(JSON.parse(line) as RelayMessage)
      } catch {
        /* offline: keep what we have */
      }
      if (stopped) return
      es = new EventSource(`${RELAY}/${ch.topic}/sse`)
      es.onopen = () => useLiveStatus.setState({ state: 'live' })
      es.onerror = () => useLiveStatus.setState({ state: navigator.onLine ? 'connecting' : 'offline' })
      es.onmessage = (e) => {
        try {
          void enqueue(JSON.parse(e.data) as RelayMessage)
        } catch {
          /* not for us */
        }
      }
      // Send this device's progress once on open, so every other device catches up.
      lastSent.current = ''
      void send()
    })()
    const resync = () => {
      const ch = chan.current
      if (ch && document.visibilityState === 'visible') queue.current = queue.current.then(() => syncVault(secret, ch.key))
    }
    const timer = window.setInterval(resync, 60_000)
    document.addEventListener('visibilitychange', resync)
    return () => {
      stopped = true
      es?.close()
      chan.current = null
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', resync)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, secret])

  // Send this device's progress when it changes (debounced, and only if it actually changed).
  const send = async () => {
    const st = useStore.getState()
    const ch = chan.current
    if (!ch || !st.live) return
    const { pickData } = await import('./share')
    const data = pickData(st)
    const sig = JSON.stringify(data)
    if (sig === lastSent.current) return
    const secretNow = st.live.key
    await (queue.current = queue.current.then(() => syncVault(secretNow, ch.key)))
    try {
      const body = await packState(ch.key, { v: 2, me: st.settings.me, device: deviceId(), sentAt: Date.now(), data })
      const r = await fetch(`${RELAY}/${ch.topic}`, { method: 'PUT', body, headers: { Filename: 'p.bin' } })
      if (r.ok) {
        lastSent.current = sig
        useLiveStatus.setState({ lastSent: Date.now() })
      }
    } catch {
      /* offline: the next change or app open will try again */
    }
  }
  const tests = useStore((s) => s.tests)
  const leitner = useStore((s) => s.leitner)
  const planDone = useStore((s) => s.planDone)
  const activity = useStore((s) => s.activity)
  const daily = useStore((s) => s.daily)
  const lessonsDone = useStore((s) => s.lessonsDone)
  const trendsRead = useStore((s) => s.trendsRead)
  const caseAttempts = useStore((s) => s.caseAttempts)
  const casePlans = useStore((s) => s.casePlans)
  const mathStats = useStore((s) => s.mathStats)
  const settings = useStore((s) => s.settings)
  useEffect(() => {
    if (!hydrated || !secret) return
    const t = window.setTimeout(() => void send(), 5000)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, secret, tests, leitner, planDone, activity, daily, lessonsDone, trendsRead, caseAttempts, casePlans, mathStats, settings])
}
