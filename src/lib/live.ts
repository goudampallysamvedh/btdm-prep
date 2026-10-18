/**
 * Live partner updates through ntfy.sh, a free public relay that needs no account.
 *
 * Partners share one random team secret (the "live link"). From it, each phone derives:
 *  - a channel name on the relay, which is hard to guess, and
 *  - an AES-GCM key. Every update is encrypted on the phone before it's sent, so the relay
 *    only ever passes along scrambled data. Without the secret, nobody can read or fake one.
 * Only the partner summary is sent (streak, exam estimate, focus areas, and so on).
 */
import { useEffect, useRef } from 'react'
import { create } from 'zustand'
import { useHydrated, useStore, type PartnerSummary, type ProgressState } from './store'

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
export const useLiveStatus = create<{ state: LiveState; lastSent: number; lastHeard: number }>()(() => ({ state: 'off', lastSent: 0, lastHeard: 0 }))

/** Take a received message: keep it only if it's from the partner and newer than what we have. */
export function accept(msg: LiveMessage) {
  const st = useStore.getState()
  if (msg.me === st.settings.me) return // from me (another of my devices)
  if (st.partner && msg.summary.at < st.partner.at) return
  st.replaceAll({ partner: msg.summary })
  useLiveStatus.setState({ lastHeard: Date.now() })
}

function snapshot(): ProgressState {
  const s = useStore.getState()
  return { ...s }
}

/** Fields that change the summary; the time stamp is left out so unchanged progress isn't resent. */
const signature = (p: PartnerSummary) => JSON.stringify({ ...p, at: 0 })

/**
 * Keeps the partner summary flowing both ways while the app is open:
 * catches up on recent updates, listens for new ones, and sends yours when your progress changes.
 */
export function useLiveSync() {
  const hydrated = useHydrated()
  const secret = useStore((s) => s.live?.key)
  const chan = useRef<Channel | null>(null)
  const lastSig = useRef('')

  // Listen.
  useEffect(() => {
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
      const take = async (payload: string) => {
        const msg = await unseal(ch.key, payload)
        if (msg) accept(msg)
      }
      try {
        const r = await fetch(`${RELAY}/${ch.topic}/json?poll=1&since=12h`)
        for (const line of (await r.text()).split('\n')) {
          if (!line.trim()) continue
          const m = JSON.parse(line) as { event?: string; message?: string }
          if (m.event === 'message' && m.message) await take(m.message)
        }
      } catch {
        /* offline: keep what we have */
      }
      if (stopped) return
      es = new EventSource(`${RELAY}/${ch.topic}/sse`)
      es.onopen = () => useLiveStatus.setState({ state: 'live' })
      es.onerror = () => useLiveStatus.setState({ state: navigator.onLine ? 'connecting' : 'offline' })
      es.onmessage = (e) => {
        try {
          const m = JSON.parse(e.data) as { event?: string; message?: string }
          if (m.event === 'message' && m.message) void take(m.message)
        } catch {
          /* not for us */
        }
      }
      // Send once on open so the partner sees a fresh "updated" time.
      lastSig.current = ''
      void send()
    })()
    return () => {
      stopped = true
      es?.close()
      chan.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, secret])

  // Send when something in the summary changes (debounced, and only if it actually changed).
  const send = async () => {
    const st = useStore.getState()
    const ch = chan.current
    if (!ch || !st.live) return
    // Loaded on demand so the app's first screen stays fast.
    const { ownerName, partnerSummary } = await import('./share')
    const summary = partnerSummary(snapshot(), ownerName(st))
    const sig = signature(summary)
    if (sig === lastSig.current) return
    try {
      const body = await seal(ch.key, { v: 1, me: st.settings.me, summary })
      const r = await fetch(`${RELAY}/${ch.topic}`, { method: 'POST', body })
      if (r.ok) {
        lastSig.current = sig
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
  const lessonsDone = useStore((s) => s.lessonsDone)
  const caseAttempts = useStore((s) => s.caseAttempts)
  const settings = useStore((s) => s.settings)
  useEffect(() => {
    if (!hydrated || !secret) return
    const t = window.setTimeout(() => void send(), 4000)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, secret, tests, leitner, planDone, activity, lessonsDone, caseAttempts, settings])
}
