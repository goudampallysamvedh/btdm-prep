import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, Save, Trash2 } from 'lucide-react'
import type { CaseScoreLine } from '@/types'
import type { CaseStudy } from '@/data/cases'
import { LEVELS, RUBRIC_POINTS } from '@/data/playbook'
import { fixFirst, levelOf, pointsForLevel, rubricLines } from '@/lib/caseScore'
import { useStore, newId } from '@/lib/store'
import { fmtDate } from '@/lib/dates'
import { Sparkline } from '@/components/charts'
import { Button, Callout, Card, cx, inputCls } from '@/components/ui'
import type { TimerState } from './CaseTimer'

const LEVEL_STYLE = ['bg-bad-bg text-bad border-bad/40', 'bg-warn-bg text-warn border-warn/40', 'bg-good-bg text-good border-good/40', 'bg-good text-card border-good']

export function CaseScorer({ c, timer, partnerA, partnerB }: { c: CaseStudy; timer: TimerState; partnerA: string; partnerB: string }) {
  const base = useMemo(() => rubricLines(c), [c])
  const [pts, setPts] = useState<Record<string, number | null>>(() => Object.fromEntries(base.map((l) => [l.key, null])))
  const [notes, setNotes] = useState('')
  const [savedId, setSavedId] = useState<string | null>(null)
  const attempts = useStore((s) => s.caseAttempts).filter((a) => a.caseId === c.id).sort((a, b) => a.at - b.at)

  const scored = base.every((l) => pts[l.key] !== null)
  const lines: CaseScoreLine[] = base.map((l) => ({ ...l, points: pts[l.key] ?? 0 }))
  const total = lines.reduce((s, l) => s + l.points, 0)
  const fixes = fixFirst(lines)
  const set = (k: string, v: number, max: number) => {
    setPts({ ...pts, [k]: Math.max(0, Math.min(max, v)) })
    setSavedId(null)
  }

  const save = () => {
    const id = newId('case')
    useStore.getState().addCaseAttempt({
      id, caseId: c.id, at: Date.now(), partnerA, partnerB, lines, total, notes,
      prepSecUsed: timer.prepUsed || undefined, presentSecUsed: timer.presentUsed || undefined,
    })
    useStore.getState().logActivity(5)
    setSavedId(id)
  }

  const groups = [
    { title: 'Performance indicators', keys: base.filter((l) => l.key.startsWith('pi')) },
    { title: 'Solution', keys: base.filter((l) => l.key.startsWith('sol')) },
    { title: 'Career competencies', keys: base.filter((l) => l.key.startsWith('cc')) },
    { title: 'Overall impression', keys: base.filter((l) => l.key === 'overall') },
  ]

  return (
    <div className="grid gap-4">
      <Callout tone="info" title="Score like a strict judge">
        Proficient means you <b>defined, explained, and applied</b> the PI to this case. Exemplary means a specific, practical recommendation that fully solves it. Record yourselves if you can, and score from the recording.
      </Callout>

      {groups.map((g) => (
        <Card key={g.title} className="grid gap-3">
          <h2 className="text-lg">{g.title}</h2>
          {g.keys.map((l) => {
            const v = pts[l.key]
            const lvl = v === null ? null : levelOf(v, l.max)
            const bands = l.max === 10 ? RUBRIC_POINTS.pi.bands : l.max === 8 ? RUBRIC_POINTS.solution.bands : RUBRIC_POINTS.competency.bands
            return (
              <div key={l.key} className="grid gap-2 border-b border-line pb-3 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-bold">{l.label}</span>
                  <span className="num shrink-0 text-sm"><b>{v ?? '–'}</b>/{l.max}</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5" role="radiogroup" aria-label={`Level for ${l.label}`}>
                  {LEVELS.map((name, i) => (
                    <button
                      key={name}
                      role="radio"
                      aria-checked={lvl === i}
                      onClick={() => set(l.key, pointsForLevel(i as 0 | 1 | 2 | 3, l.max), l.max)}
                      className={cx('min-h-9 rounded-lg border px-2.5 text-xs font-bold', lvl === i ? LEVEL_STYLE[i] : 'border-line text-ink-2 hover:border-accent')}
                    >
                      {name} <span className="num font-normal opacity-80">{bands[i]}</span>
                    </button>
                  ))}
                  <span className="ml-auto inline-flex items-center gap-1">
                    <Button size="sm" variant="quiet" aria-label="One point less" onClick={() => set(l.key, (v ?? 0) - 1, l.max)}><Minus size={14} aria-hidden /></Button>
                    <Button size="sm" variant="quiet" aria-label="One point more" onClick={() => set(l.key, (v ?? 0) + 1, l.max)}><Plus size={14} aria-hidden /></Button>
                  </span>
                </div>
              </div>
            )
          })}
        </Card>
      ))}

      <Card className="receipt grid gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl">Scorecard</h2>
          <span className="num text-3xl font-bold">{total}<span className="text-base text-muted">/100</span></span>
        </div>
        {!scored && <p className="text-sm text-muted">Rate every line to see a complete score.</p>}
        {scored && (
          fixes.length ? (
            <div className="grid gap-2">
              <div className="font-bold">Fix these first</div>
              {fixes.map((f) => (
                <div key={f.label} className="rounded-xl border-l-4 border-warn bg-warn-bg px-3 py-2 text-sm">
                  <b>{f.label}</b> <span className="num text-muted">({Math.round(f.pct * 100)}%)</span>
                  <div>{f.tip}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-good">Strong across the board. Try a harder case, and drill judge questions out loud.</p>
          )
        )}
        <label className="grid gap-1">
          <span className="text-sm font-bold">Notes for next time</span>
          <textarea className={inputCls + ' min-h-16'} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={save} disabled={!scored || !!savedId} icon={<Save size={16} aria-hidden />}>{savedId ? 'Saved' : 'Save this attempt'}</Button>
          <span className="text-xs text-muted">This is a rough estimate using the 2026 sample form's point values, not an official score.</span>
        </div>
      </Card>

      {attempts.length > 0 && (
        <Card className="grid gap-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg">Your attempts on this case</h2>
            <Sparkline values={attempts.map((a) => a.total / 100)} width={120} height={28} />
          </div>
          <ul className="grid gap-1.5 text-sm">
            {[...attempts].reverse().map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-2 border-b border-line pb-1.5">
                <span>{fmtDate(a.at)} · {a.partnerA} & {a.partnerB}{a.notes ? ` · ${a.notes.slice(0, 40)}${a.notes.length > 40 ? '…' : ''}` : ''}</span>
                <span className="flex items-center gap-2">
                  <b className="num">{a.total}</b>
                  <Button size="sm" variant="quiet" aria-label="Delete attempt" onClick={() => { if (confirm('Delete this attempt?')) useStore.getState().deleteCaseAttempt(a.id) }}><Trash2 size={14} aria-hidden /></Button>
                </span>
              </li>
            ))}
          </ul>
          <Link to="/progress" className="text-sm font-bold">See all progress →</Link>
        </Card>
      )}
    </div>
  )
}
