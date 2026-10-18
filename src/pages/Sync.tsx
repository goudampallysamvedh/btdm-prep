import { useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ClipboardCopy, Download, FileUp, Laptop, Send, Smartphone, Users } from 'lucide-react'
import { useStore, type ProgressState } from '@/lib/store'
import { makeBackup, makePartnerPackage, mergeBackup, mergePartner, ownerName, parseShared, downloadJson, teamExam, toCode, type Backup, type PartnerPackage } from '@/lib/share'
import { areaReadiness, projectedScore } from '@/lib/mastery'
import { AREA_BY_CODE } from '@/data/areas'
import { CASE_BY_ID } from '@/data/cases'
import { dayKey, fmtDateTime } from '@/lib/dates'
import type { AreaCode } from '@/types'
import { Button, Callout, Card, Disclosure, PageHeader, Segmented, cx, inputCls } from '@/components/ui'

type Tab = 'me' | 'partner'

function snapshot(): ProgressState {
  const s = useStore.getState()
  return {
    settings: s.settings, officialScores: s.officialScores, partner: s.partner, activity: s.activity, daily: s.daily, tests: s.tests, leitner: s.leitner,
    caseAttempts: s.caseAttempts, casePlans: s.casePlans, mathStats: s.mathStats, lessonsDone: s.lessonsDone,
    trendsRead: s.trendsRead, judgeDrill: s.judgeDrill, activeMock: s.activeMock,
  }
}

const isDefaultName = (n: string) => /^Partner [AB]$/.test(n)

export default function Sync() {
  const [params, setParams] = useSearchParams()
  const tab: Tab = params.get('tab') === 'me' ? 'me' : 'partner'
  const setTab = (t: Tab) => setParams({ tab: t }, { replace: true })
  return (
    <>
      <PageHeader title="Sync">
        Move progress with a code: copy it on one device, paste it on the other. Nothing is uploaded.
      </PageHeader>
      <Segmented<Tab>
        label="What to sync"
        className="mb-4"
        value={tab}
        onChange={setTab}
        options={[{ value: 'me', label: 'My devices' }, { value: 'partner', label: 'Partner' }]}
      />
      {tab === 'me' ? <MyDevices key="me" onSwitch={() => setTab('partner')} /> : <Partner key="partner" onSwitch={() => setTab('me')} />}
      <div className="mt-4">
        <Callout tone="info" title="Privacy">
          Codes go only where you send them. Progress lives in this browser, so sync or save a backup before clearing site data.
        </Callout>
      </div>
    </>
  )
}

// ---------------- My devices ----------------

function MyDevices({ onSwitch }: { onSwitch: () => void }) {
  const tests = useStore((s) => s.tests)
  const leitner = useStore((s) => s.leitner)
  const [merged, setMerged] = useState(false)
  const today = dayKey(new Date())

  return (
    <div className="grid gap-4">
      <Card className="grid gap-3">
        <div className="flex items-center gap-2"><Smartphone size={20} className="text-accent" aria-hidden /><h2 className="text-lg">1. Copy your code on this device</h2></div>
        <p className="text-sm">Your code holds all your progress: {tests.length} test{tests.length === 1 ? '' : 's'}, {Object.keys(leitner).length} flashcards, case plans, scores, lessons, and settings. Send it to yourself (text, email, or notes) or copy it.</p>
        <CodeMaker make={() => toCode(makeBackup(snapshot()))} label="Make my sync code" shareTitle="My Sell-Through progress" />
      </Card>

      <Card className="grid gap-3">
        <div className="flex items-center gap-2"><Laptop size={20} className="text-accent" aria-hidden /><h2 className="text-lg">2. Paste it on your other device</h2></div>
        <p className="text-sm">Open <b>Sync → My devices</b> there and paste the code. Progress from both devices is combined; nothing is lost.</p>
        <Receive expect="backup" onWrongKind={onSwitch} onDone={() => setMerged(true)} />
      </Card>

      <Card className={cx('grid gap-2', merged && 'border-accent')}>
        <h2 className="text-lg">3. Make both devices match</h2>
        <p className="text-sm">Steps 1–2 copy one way. To bring this device's progress back to the first one, make a code here and paste it there. Sync whenever you switch devices.</p>
        {merged && <CodeMaker make={() => toCode(makeBackup(snapshot()))} label="Make a code to send back" shareTitle="My Sell-Through progress" />}
      </Card>

      <Disclosure title="Save a backup file" hint="A safety copy for a new phone">
        <p className="mb-3 text-sm">Saves the same data as a file. Open it later with "Open a file" in step 2.</p>
        <Button variant="ghost" icon={<Download size={16} aria-hidden />} onClick={() => downloadJson(makeBackup(snapshot()), `sell-through-backup-${today}.json`)}>Download backup</Button>
      </Disclosure>
    </div>
  )
}

// ---------------- Partner ----------------

function Partner({ onSwitch }: { onSwitch: () => void }) {
  const settings = useStore((s) => s.settings)
  const partner = useStore((s) => s.partner)
  const tests = useStore((s) => s.tests)
  const plans = useStore((s) => s.casePlans)
  const mine = projectedScore(areaReadiness(tests))
  const team = teamExam(mine, partner)
  const me = ownerName({ settings })
  const other = settings.me === 'A' ? settings.partnerB : settings.partnerA
  const planCount = Object.keys(plans).length
  const partnerAreas = useMemo(() => Object.entries(partner?.areas ?? {}).sort((a, b) => a[1] - b[1]).slice(0, 4), [partner])

  return (
    <div className="grid gap-4">
      <Card className="grid gap-3">
        <div className="flex items-center gap-2"><Users size={20} className="text-accent" aria-hidden /><h2 className="text-lg">Team exam estimate</h2></div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-paper-2 p-3"><div className="num text-2xl font-bold">{Math.round(mine)}</div><div className="text-xs text-muted">{me} (you)</div></div>
          <div className="rounded-xl bg-paper-2 p-3"><div className="num text-2xl font-bold">{partner ? Math.round(partner.projected) : '—'}</div><div className="text-xs text-muted">{partner?.name ?? other}</div></div>
          <div className="rounded-xl bg-accent-soft p-3"><div className="num text-2xl font-bold text-accent">{team !== null ? Math.round(team) : '—'}</div><div className="text-xs text-muted">Team average</div></div>
        </div>
        {partner ? (
          <p className="text-sm text-muted">
            {partner.name}'s data from {fmtDateTime(partner.at)}.{partnerAreas.length > 0 && <> Their weakest areas: {partnerAreas.map(([a, v]) => `${AREA_BY_CODE[a as AreaCode]?.name ?? a} (${Math.round(v * 100)}%)`).join(', ')}.</>}{' '}
            <Link to="/partner" className="font-bold">See all of {partner.name}'s progress →</Link>
          </p>
        ) : (
          <p className="text-sm text-muted">Paste your partner's code below to see the team average.</p>
        )}
      </Card>

      <Card className="grid gap-3">
        <div className="flex items-center gap-2"><Send size={20} className="text-accent" aria-hidden /><h2 className="text-lg">Send to your partner</h2></div>
        <p className="text-sm">Shares your {planCount} case plan{planCount === 1 ? '' : 's'}, case scores, exam estimate, streak, and the areas and topics you need to work on. Your full test history and flashcards stay yours.</p>
        <CodeMaker make={() => toCode(makePartnerPackage(snapshot()))} label="Make a partner code" shareTitle="Sell-Through partner sync" />
      </Card>

      <Card className="grid gap-3">
        <h2 className="text-lg">Paste your partner's code</h2>
        <p className="text-sm">Newer case plans replace older ones, and case scores are added. Do this on each of your devices, or sync your own devices afterward.</p>
        <Receive expect="partner" onWrongKind={onSwitch} />
      </Card>
    </div>
  )
}

// ---------------- Shared pieces ----------------

function CodeMaker({ make, label, shareTitle }: { make: () => string; label: string; shareTitle: string }) {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState('')
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const copy = async (c: string) => {
    try {
      await navigator.clipboard.writeText(c)
      setStatus('Copied ✓ Now paste it on the other device.')
    } catch {
      setStatus('Select the code below and copy it.')
    }
  }
  const create = async () => {
    const c = make()
    setCode(c)
    await copy(c)
  }
  const send = async () => {
    try {
      await navigator.share({ title: shareTitle, text: code })
      setStatus('Sent.')
    } catch {
      /* cancelled */
    }
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        <Button onClick={create} icon={<ClipboardCopy size={16} aria-hidden />}>{code ? 'Make a fresh code' : label}</Button>
        {code && canShare && <Button variant="ghost" onClick={send} icon={<Send size={16} aria-hidden />}>Send…</Button>}
      </div>
      {code && (
        <div className="grid gap-2 animate-rise">
          <textarea readOnly className={inputCls + ' num min-h-20 text-xs'} value={code} onFocus={(e) => e.currentTarget.select()} aria-label="Sync code" />
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" variant="ghost" onClick={() => copy(code)}>Copy again</Button>
            <span role="status" className="text-xs text-muted">{status || `${code.length.toLocaleString()} characters`}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function Receive({ expect, onWrongKind, onDone }: { expect: 'backup' | 'partner'; onWrongKind: () => void; onDone?: () => void }) {
  const settings = useStore((s) => s.settings)
  const [incoming, setIncoming] = useState('')
  const [preview, setPreview] = useState<Backup | PartnerPackage | null>(null)
  const [msg, setMsg] = useState<{ tone: 'good' | 'bad'; lines: string[] } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const meName = ownerName({ settings })

  const check = (text: string) => {
    const r = parseShared(text)
    if (!r.ok) {
      setPreview(null)
      setMsg({ tone: 'bad', lines: [r.error] })
    } else {
      setPreview(r.value)
      setMsg(null)
    }
  }
  const finish = (lines: string[]) => {
    setMsg({ tone: 'good', lines })
    setPreview(null)
    setIncoming('')
    onDone?.()
  }
  const apply = (mode: 'merge' | 'replace') => {
    if (!preview) return
    const s = snapshot()
    if (preview.kind === 'partner') {
      const r = mergePartner(s, preview)
      useStore.getState().replaceAll(r.state)
      finish(r.summary)
    } else if (mode === 'replace') {
      if (!confirm('Replace ALL progress on this device with this code? Anything only on this device will be lost.')) return
      useStore.getState().replaceAll({ ...preview.data, activeMock: null })
      finish(['This device now matches the other one.'])
    } else {
      const r = mergeBackup(s, preview)
      useStore.getState().replaceAll(r.state)
      finish(r.summary)
    }
  }

  const fromName = preview?.kind === 'backup' ? ownerName(preview.data) : preview?.from ?? ''
  const looksLikeSomeoneElse = preview?.kind === 'backup' && !isDefaultName(fromName) && !isDefaultName(meName) && fromName !== meName

  return (
    <div className="grid gap-3">
      <textarea className={inputCls + ' num min-h-20 text-xs'} placeholder="Paste a code that starts with ST1." value={incoming} onChange={(e) => { setIncoming(e.target.value); setMsg(null) }} aria-label="Paste a sync code" />
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => check(incoming)} disabled={!incoming.trim()}>Check code</Button>
        <Button variant="ghost" icon={<FileUp size={16} aria-hidden />} onClick={() => fileRef.current?.click()}>Open a file</Button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" onChange={async (e) => {
          const f = e.target.files?.[0]
          if (f) check(await f.text())
          e.target.value = ''
        }} />
      </div>

      {preview && preview.kind !== expect && (
        <div className="grid gap-2 rounded-xl border border-line bg-paper-2 p-3 animate-rise">
          <span className="text-sm">
            {preview.kind === 'partner'
              ? `This is a partner code from ${preview.from}. Partner codes go in the Partner tab.`
              : `This is a full progress code (${fromName}'s devices). Those go in the My devices tab.`}
          </span>
          <div><Button size="sm" onClick={onWrongKind}>Go to {preview.kind === 'partner' ? 'Partner' : 'My devices'}</Button></div>
        </div>
      )}

      {preview && preview.kind === expect && (
        <div className="grid gap-2 rounded-xl border border-accent bg-accent-soft/40 p-3 animate-rise">
          {preview.kind === 'partner' ? (
            <>
              <b>Partner code from {preview.from}</b>
              <span className="text-sm">{preview.plans.length} case plan(s): {preview.plans.map((p) => CASE_BY_ID[p.caseId]?.company ?? p.caseId).join(', ') || 'none'} · {preview.attempts.length} case score(s) · exam estimate {Math.round(preview.summary.projected)}/100</span>
              <span className="text-xs text-muted">Made {fmtDateTime(preview.exportedAt)}.</span>
              <div><Button onClick={() => apply('merge')}>Import</Button></div>
            </>
          ) : (
            <>
              <b>Progress from {isDefaultName(fromName) ? 'your other device' : `${fromName}'s other device`}</b>
              <span className="text-sm">{preview.data.tests.length} tests · {Object.keys(preview.data.leitner ?? {}).length} flashcards · {Object.keys(preview.data.casePlans ?? {}).length} case plans · made {fmtDateTime(preview.exportedAt)}</span>
              {looksLikeSomeoneElse && (
                <span className="text-sm font-bold text-bad">This looks like {fromName}'s progress, but this device belongs to {meName}. Only merge your own progress; use the Partner tab to share with a teammate.</span>
              )}
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => apply('merge')}>Combine with this device</Button>
                <Button variant="quiet" onClick={() => apply('replace')}>Replace this device instead</Button>
              </div>
            </>
          )}
        </div>
      )}

      {msg && (
        <div role="status" className={cx('rounded-xl px-3 py-2 text-sm', msg.tone === 'good' ? 'bg-good-bg text-good' : 'bg-bad-bg text-bad')}>
          {msg.lines.map((l) => <div key={l}>{l}</div>)}
        </div>
      )}
    </div>
  )
}
