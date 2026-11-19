import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, Save, Trash2 } from 'lucide-react'
import type { CaseScoreLine } from '@/types'
import type { CaseStudy } from '@/data/cases'
import { LEVELS, RUBRIC_POINTS } from '@/data/playbook'
import { fixFirst, levelOf, maxTotal, pointsForLevel, rubricLines } from '@/lib/caseScore'
import { useStore, newId } from '@/lib/store'
import { fmtDate } from '@/lib/dates'
import { Sparkline } from '@/components/charts'
import { Button, Callout, Card, cx, inputCls } from '@/components/ui'
import type { TimerState } from './CaseTimer'

const LEVEL_STYLE = ['bg-bad-bg text-bad border-bad/40', 'bg-warn-bg text-warn border-warn/40', 'bg-good-bg text-good border-good/40', 'bg-good text-paper border-good']

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
        Proficient means you <b className="font-semibold">defined, explained, and applied</b> the PI to this case. Exemplary means a specific, practical recommendation that fully solves it. Record yourselves if you can, and score from the recording.
      </Callout>

      <Card className="grid gap-8">
        {groups.map((g) => (
          <section key={g.title} aria-label={g.title}>
            <div className="flex items-baseline justify-between gap-3 border-b border-line-2 pb-2">
              <h2 className="text-[0.95rem]">{g.title}</h2>
              <span className="text-xs text-muted">Points</span>
            </div>
            <ul>
              {g.keys.map((l) => {
                const v = pts[l.key]
                const lvl = v === null ? null : levelOf(v, l.max)
                const bands = l.max === 10 ? RUBRIC_POINTS.pi.bands : l.max === 8 ? RUBRIC_POINTS.solution.bands : RUBRIC_POINTS.competency.bands
                return (
                  <li key={l.key} className="grid gap-2 border-b border-line py-3 last:border-0">
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-sm font-medium">{l.label}</span>
                      <span className="num shrink-0 text-right text-sm"><span className="font-semibold">{v ?? '—'}</span><span className="text-muted"> / {l.max}</span></span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5" role="radiogroup" aria-label={`Level for ${l.label}`}>
                      {LEVELS.map((name, i) => (
                        <button
                          key={name}
                          role="radio"
                          aria-checked={lvl === i}
                          onClick={() => set(l.key, pointsForLevel(i as 0 | 1 | 2 | 3, l.max), l.max)}
                          className={cx('min-h-9 rounded-full border px-3 text-xs font-medium transition-colors', lvl === i ? LEVEL_STYLE[i] : 'border-line-2 bg-paper text-ink-2 hover:border-ink')}
                        >
                          {name} <span className="num font-normal opacity-80">{bands[i]}</span>
                        </button>
                      ))}
                      <span className="ml-auto inline-flex items-center gap-1">
                        <Button size="sm" variant="quiet" aria-label="One point less" onClick={() => set(l.key, (v ?? 0) - 1, l.max)}><Minus size={14} strokeWidth={1.75} aria-hidden /></Button>
                        <Button size="sm" variant="quiet" aria-label="One point more" onClick={() => set(l.key, (v ?? 0) + 1, l.max)}><Plus size={14} strokeWidth={1.75} aria-hidden /></Button>
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
        <div className="flex items-baseline justify-between gap-3 border-t-2 border-ink pt-3">
          <span className="font-semibold">Total</span>
          <span className="num text-right text-3xl leading-none">{total}<span className="text-base text-muted"> / {maxTotal(c)}</span></span>
        </div>
      </Card>

      <Card className="grid gap-4">
        <h2 className="text-[0.95rem]">Scorecard</h2>
        {!scored && <p className="text-sm text-muted">Rate every line to see a complete score.</p>}
        {scored && (
          fixes.length ? (
            <div className="grid gap-2">
              <div className="text-sm font-medium">Fix these first</div>
              {fixes.map((f) => (
                <div key={f.label} className="rounded-2xl bg-warn-bg px-4 py-3 text-sm">
                  <b className="font-semibold">{f.label}</b> <span className="num text-muted">({Math.round(f.pct * 100)}%)</span>
                  <div>{f.tip}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-good">Strong across the board. Try a harder case, and drill judge questions out loud.</p>
          )
        )}
        <label className="grid gap-1">
          <span className="text-sm font-medium">Notes for next time</span>
          <textarea className={inputCls + ' min-h-16'} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={save} disabled={!scored || !!savedId} icon={<Save size={16} strokeWidth={1.75} aria-hidden />}>{savedId ? 'Saved' : 'Save this attempt'}</Button>
          <span className="text-xs text-muted">This is a rough estimate using the 2026 sample form's point values, not an official score.</span>
        </div>
      </Card>

      {attempts.length > 0 && (
        <Card className="grid gap-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[0.95rem]">Your attempts on this case</h2>
            <Sparkline values={attempts.map((a) => a.total / 100)} width={120} height={28} />
          </div>
          <ul className="grid text-sm">
            {[...attempts].reverse().map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 border-b border-line py-2 last:border-0">
                <span className="min-w-0">{fmtDate(a.at)} · {a.partnerA} & {a.partnerB}{a.notes ? ` · ${a.notes.slice(0, 40)}${a.notes.length > 40 ? '…' : ''}` : ''}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="num font-semibold">{a.total}</span>
                  <Button size="sm" variant="quiet" aria-label="Delete attempt" onClick={() => { if (confirm('Delete this attempt?')) useStore.getState().deleteCaseAttempt(a.id) }}><Trash2 size={14} strokeWidth={1.75} aria-hidden /></Button>
                </span>
              </li>
            ))}
          </ul>
          <Link to="/progress" className="text-sm font-medium text-ink">See all progress →</Link>
        </Card>
      )}
    </div>
  )
}
