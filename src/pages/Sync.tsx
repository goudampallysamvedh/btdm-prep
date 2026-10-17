import { useMemo, useRef, useState } from 'react'
import { ClipboardCopy, Download, FileUp, Share2, Users } from 'lucide-react'
import { useStore, type ProgressState } from '@/lib/store'
import { makeBackup, makePartnerPackage, mergeBackup, mergePartner, parseShared, shareJson, downloadJson, teamExam, toCode, type Backup, type PartnerPackage } from '@/lib/share'
import { areaReadiness, projectedScore } from '@/lib/mastery'
import { AREA_BY_CODE } from '@/data/areas'
import { CASE_BY_ID } from '@/data/cases'
import { dayKey, fmtDateTime } from '@/lib/dates'
import type { AreaCode } from '@/types'
import { Button, Callout, Card, PageHeader, SectionTitle, cx, inputCls } from '@/components/ui'

function snapshot(): ProgressState {
  const s = useStore.getState()
  return {
    settings: s.settings, officialScores: s.officialScores, partner: s.partner, activity: s.activity, tests: s.tests, leitner: s.leitner,
    caseAttempts: s.caseAttempts, casePlans: s.casePlans, mathStats: s.mathStats, lessonsDone: s.lessonsDone,
    trendsRead: s.trendsRead, judgeDrill: s.judgeDrill, activeMock: s.activeMock,
  }
}

export default function Sync() {
  const settings = useStore((s) => s.settings)
  const partner = useStore((s) => s.partner)
  const tests = useStore((s) => s.tests)
  const plans = useStore((s) => s.casePlans)
  const mine = projectedScore(areaReadiness(tests))
  const team = teamExam(mine, partner)
  const me = settings.me === 'A' ? settings.partnerA : settings.partnerB
  const other = settings.me === 'A' ? settings.partnerB : settings.partnerA

  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [incoming, setIncoming] = useState('')
  const [preview, setPreview] = useState<Backup | PartnerPackage | null>(null)
  const [msg, setMsg] = useState<{ tone: 'good' | 'bad' | 'info'; lines: string[] } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const planCount = Object.keys(plans).length
  const today = dayKey(new Date())

  const makeCode = () => {
    setCode(toCode(makePartnerPackage(snapshot())))
    setCopied(false)
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }
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
  const apply = (mode: 'merge' | 'replace') => {
    if (!preview) return
    const s = snapshot()
    if (preview.kind === 'partner') {
      const r = mergePartner(s, preview)
      useStore.getState().replaceAll(r.state)
      setMsg({ tone: 'good', lines: r.summary })
    } else if (mode === 'replace') {
      if (!confirm('Replace ALL progress on this device with this backup?')) return
      useStore.getState().replaceAll({ ...preview.data, activeMock: null })
      setMsg({ tone: 'good', lines: ['Backup restored.'] })
    } else {
      const r = mergeBackup(s, preview)
      useStore.getState().replaceAll(r.state)
      setMsg({ tone: 'good', lines: r.summary })
    }
    setPreview(null)
    setIncoming('')
  }

  const partnerAreas = useMemo(() => Object.entries(partner?.areas ?? {}).sort((a, b) => a[1] - b[1]).slice(0, 4), [partner])

  return (
    <>
      <PageHeader eyebrow="No server needed" title="Partner sync">
        You and your partner each keep progress on your own phone. Swap a <b>code</b> (paste it in any message) or a <b>file</b> to share case plans, case scores, and exam estimates.
      </PageHeader>

      <Card className="grid gap-3">
        <div className="flex items-center gap-2"><Users size={20} className="text-accent" aria-hidden /><h2 className="text-lg">Team exam estimate</h2></div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-paper-2 p-3"><div className="num text-2xl font-bold">{Math.round(mine)}</div><div className="text-xs text-muted">{me} (you)</div></div>
          <div className="rounded-xl bg-paper-2 p-3"><div className="num text-2xl font-bold">{partner ? Math.round(partner.projected) : '—'}</div><div className="text-xs text-muted">{partner?.name ?? other}</div></div>
          <div className="rounded-xl bg-accent-soft p-3"><div className="num text-2xl font-bold text-accent">{team !== null ? Math.round(team) : '—'}</div><div className="text-xs text-muted">Team average</div></div>
        </div>
        {partner ? (
          <p className="text-sm text-muted">
            {partner.name}'s data from {fmtDateTime(partner.at)}.{partnerAreas.length > 0 && <> Their weakest areas: {partnerAreas.map(([a, v]) => `${AREA_BY_CODE[a as AreaCode]?.name ?? a} (${Math.round(v * 100)}%)`).join(', ')}.</>}
          </p>
        ) : (
          <p className="text-sm text-muted">Import your partner's code to see the team average. Both exam scores are averaged into the team score, so help each other's weak areas.</p>
        )}
      </Card>

      <SectionTitle>Send to your partner</SectionTitle>
      <Card className="grid gap-3">
        <p className="text-sm">Includes your {planCount} case plan{planCount === 1 ? '' : 's'}, your case scores, and your exam estimate. Your flashcards and test history stay on your device.</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={makeCode} icon={<ClipboardCopy size={16} aria-hidden />}>Make a share code</Button>
          <Button variant="ghost" icon={<Share2 size={16} aria-hidden />} onClick={async () => {
            const r = await shareJson(makePartnerPackage(snapshot()), `sell-through-${me.replace(/\W+/g, '-').toLowerCase()}-${today}.json`, 'Sell-Through partner sync')
            setMsg({ tone: 'info', lines: [r === 'shared' ? 'Shared.' : 'File downloaded. Send it to your partner.'] })
          }}>Share as a file</Button>
        </div>
        {code && (
          <div className="grid gap-2 animate-rise">
            <textarea readOnly className={inputCls + ' num min-h-24 text-xs'} value={code} onFocus={(e) => e.currentTarget.select()} aria-label="Share code" />
            <div className="flex items-center gap-3">
              <Button size="sm" onClick={copy}>{copied ? 'Copied ✓' : 'Copy code'}</Button>
              <span className="num text-xs text-muted">{code.length.toLocaleString()} characters</span>
            </div>
          </div>
        )}
      </Card>

      <SectionTitle>Receive from your partner (or restore a backup)</SectionTitle>
      <Card className="grid gap-3">
        <textarea className={inputCls + ' num min-h-24 text-xs'} placeholder="Paste a code that starts with ST1." value={incoming} onChange={(e) => setIncoming(e.target.value)} aria-label="Paste a share code" />
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => check(incoming)} disabled={!incoming.trim()}>Check code</Button>
          <Button variant="ghost" icon={<FileUp size={16} aria-hidden />} onClick={() => fileRef.current?.click()}>Open a file</Button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" onChange={async (e) => {
            const f = e.target.files?.[0]
            if (f) check(await f.text())
            e.target.value = ''
          }} />
        </div>
        {preview && (
          <div className="grid gap-2 rounded-xl border border-accent bg-accent-soft/40 p-3 animate-rise">
            {preview.kind === 'partner' ? (
              <>
                <b>Partner package from {preview.from}</b>
                <span className="text-sm">{preview.plans.length} case plan(s): {preview.plans.map((p) => CASE_BY_ID[p.caseId]?.company ?? p.caseId).join(', ') || 'none'} · {preview.attempts.length} case score(s) · exam estimate {Math.round(preview.summary.projected)}/100</span>
                <span className="text-xs text-muted">Made {fmtDateTime(preview.exportedAt)}. Newer case plans replace older ones; scores are added.</span>
                <div><Button onClick={() => apply('merge')}>Import</Button></div>
              </>
            ) : (
              <>
                <b>Full backup</b>
                <span className="text-sm">{preview.data.tests.length} tests · {Object.keys(preview.data.leitner ?? {}).length} flashcards · made {fmtDateTime(preview.exportedAt)}</span>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => apply('merge')}>Merge into this device</Button>
                  <Button variant="danger" onClick={() => apply('replace')}>Replace everything</Button>
                </div>
              </>
            )}
          </div>
        )}
        {msg && (
          <div role="status" className={cx('rounded-xl px-3 py-2 text-sm', msg.tone === 'good' ? 'bg-good-bg text-good' : msg.tone === 'bad' ? 'bg-bad-bg text-bad' : 'bg-info-bg text-info')}>
            {msg.lines.map((l) => <div key={l}>{l}</div>)}
          </div>
        )}
      </Card>

      <SectionTitle>Back up your own progress</SectionTitle>
      <Card className="grid gap-3">
        <p className="text-sm">Saves everything on this device (tests, flashcards, cases, settings) to a file. Use it to move to a new phone or as a safety copy before clearing your browser.</p>
        <div><Button variant="ghost" icon={<Download size={16} aria-hidden />} onClick={() => downloadJson(makeBackup(snapshot()), `sell-through-backup-${today}.json`)}>Download backup</Button></div>
      </Card>

      <div className="mt-4">
        <Callout tone="info" title="Privacy">
          Nothing is uploaded anywhere. Codes and files go only where you send them. Progress lives in this browser's storage, so if you clear site data, restore from a backup.
        </Callout>
      </div>
    </>
  )
}
