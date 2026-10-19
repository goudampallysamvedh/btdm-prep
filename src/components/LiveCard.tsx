import { useEffect, useRef, useState } from 'react'
import { ClipboardCopy, Radio, Send } from 'lucide-react'
import { useStore } from '@/lib/store'
import { makeLinkCode, newSecret, parseLinkCode, useLiveStatus, type LinkInfo } from '@/lib/live'
import { relTime } from '@/lib/dates'
import { Button, Card, cx, inputCls } from './ui'

const isDefault = (n: string) => /^Partner [AB]$/.test(n)

/** Set up and show live partner updates (encrypted, through a free relay). */
export function LiveCard() {
  const live = useStore((s) => s.live)
  const settings = useStore((s) => s.settings)
  const partner = useStore((s) => s.partner)
  const status = useLiveStatus()
  const [code, setCode] = useState('')
  const [paste, setPaste] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, setPending] = useState<LinkInfo | null>(null)
  const pickRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (pending) pickRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [pending])
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const linkCode = (key: string) => makeLinkCode({ key, me: settings.me, a: settings.partnerA, b: settings.partnerB })
  const copy = async (c: string) => {
    try {
      await navigator.clipboard.writeText(c)
      setMsg({ ok: true, text: "Copied. Paste it here in the app on your partner's phone, and on any of your own other devices." })
    } catch {
      setMsg({ ok: true, text: 'Select the code and copy it, then send it to your partner.' })
    }
  }

  const create = async () => {
    const key = newSecret()
    useStore.getState().replaceAll({ live: { key, linkedAt: Date.now() } })
    const c = linkCode(key)
    setCode(c)
    await copy(c)
  }

  const join = () => {
    const info = parseLinkCode(paste)
    if (!info) {
      setMsg({ ok: false, text: 'That isn\'t a live link. It starts with STL1.' })
      return
    }
    setMsg(null)
    setPending(info)
  }

  // The same link works on every device; each device just says whose it is.
  const finish = (me: 'A' | 'B') => {
    if (!pending) return
    const names = isDefault(settings.partnerA) && isDefault(settings.partnerB) && pending.a && pending.b ? { partnerA: pending.a, partnerB: pending.b } : {}
    const myName = me === 'A' ? names.partnerA ?? settings.partnerA : names.partnerB ?? settings.partnerB
    // A summary received earlier that is actually this person's own isn't "partner" data.
    const partner = useStore.getState().partner
    useStore.getState().replaceAll({
      live: { key: pending.key, linkedAt: Date.now() },
      settings: { ...settings, ...names, me },
      ...(partner && partner.name === myName ? { partner: null } : {}),
    })
    setPending(null)
    setPaste('')
    setMsg({ ok: true, text: `Linked! This device belongs to ${myName}. Updates now flow both ways.` })
  }
  const nameOf = (who: 'A' | 'B') => (who === 'A' ? pending?.a || settings.partnerA : pending?.b || settings.partnerB)

  const unlink = () => {
    if (!confirm('Turn off live updates on this device? You can link again any time.')) return
    useStore.getState().replaceAll({ live: null })
    setCode('')
    setMsg(null)
  }

  const dot = { live: 'bg-good', connecting: 'bg-warn', offline: 'bg-muted', off: 'bg-muted' }[status.state]
  const label = { live: 'Live', connecting: 'Connecting…', offline: 'Offline. Will catch up when you\'re back online.', off: 'Off' }[status.state]

  return (
    <Card className="grid gap-3">
      <div className="flex items-center gap-2">
        <Radio size={20} className="text-accent" aria-hidden />
        <h2 className="flex-1 text-lg">Live updates</h2>
        {live && (
          <span className="inline-flex items-center gap-1.5 text-sm font-bold" role="status">
            <span className={cx('size-2.5 rounded-full', dot, status.state === 'live' && 'animate-pulse')} aria-hidden />
            {label}
          </span>
        )}
      </div>

      {!live ? (
        <>
          <p className="text-sm">Link every device once (yours and your partner's). After that, every device shows the latest progress for both of you, whichever device you studied on. Updates are encrypted on your phone before they're sent through a free relay (ntfy.sh), so only your linked devices can read them.</p>
          <div className="grid gap-2 rounded-xl bg-paper-2 p-3">
            <span className="text-sm font-bold">One of you: create the link</span>
            <div><Button onClick={create} icon={<ClipboardCopy size={16} aria-hidden />}>Create a live link</Button></div>
          </div>
          <div className="grid gap-2 rounded-xl bg-paper-2 p-3">
            <span className="text-sm font-bold">Every other device (your partner's and your own): paste it here</span>
            <div className="flex gap-2">
              <input className={inputCls + ' num flex-1 text-xs'} value={paste} onChange={(e) => { setPaste(e.target.value); setMsg(null) }} placeholder="Paste a live link (STL1.…)" aria-label="Paste your partner's live link" />
              <Button onClick={join} disabled={!paste.trim()}>Link</Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm">
            {partner ? <>Last update from <b>{partner.name}</b>: {relTime(partner.at)}.</> : 'Waiting for your partner\'s first update. Make sure they pasted your link.'}
            {status.lastSent ? <> Your progress was sent {relTime(status.lastSent)}.</> : null}
          </p>
          <p className="text-xs text-muted">Updates send while the app is open. If your partner's app was closed, it catches up next time they open it. To add another phone or computer (yours or your partner's), tap <b>Show the link again</b> and paste it there.</p>
          <div className="flex flex-wrap gap-2">
            {!code && <Button size="sm" variant="ghost" onClick={() => setCode(linkCode(live.key))}>Show the link again</Button>}
            <Button size="sm" variant="quiet" onClick={unlink}>Turn off</Button>
          </div>
        </>
      )}

      {pending && (
        <div ref={pickRef} className="grid scroll-mt-20 gap-2 rounded-xl border border-accent bg-accent-soft/40 p-3 animate-rise">
          <span className="font-bold">Whose device is this?</span>
          <div className="grid grid-cols-2 gap-2">
            {(['A', 'B'] as const).map((who) => (
              <Button key={who} variant={who !== pending.me ? 'primary' : 'ghost'} onClick={() => finish(who)}>{nameOf(who)}</Button>
            ))}
          </div>
          <span className="text-xs text-muted">{nameOf(pending.me)} made this link. If this is {nameOf(pending.me)}'s other phone or laptop, pick {nameOf(pending.me)}.</span>
        </div>
      )}

      {code && (
        <div className="grid gap-2 animate-rise">
          <textarea readOnly className={inputCls + ' num min-h-16 text-xs'} value={code} onFocus={(e) => e.currentTarget.select()} aria-label="Live link" />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="ghost" onClick={() => copy(code)} icon={<ClipboardCopy size={16} aria-hidden />}>Copy</Button>
            {canShare && <Button size="sm" variant="ghost" onClick={() => navigator.share({ title: 'Sell-Through live link', text: code }).catch(() => {})} icon={<Send size={16} aria-hidden />}>Send…</Button>}
          </div>
        </div>
      )}
      {msg && <p role="status" className={cx('rounded-xl px-3 py-2 text-sm', msg.ok ? 'bg-good-bg text-good' : 'bg-bad-bg text-bad')}>{msg.text}</p>}
    </Card>
  )
}
