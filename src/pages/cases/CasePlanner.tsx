import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react'
import type { CasePlan } from '@/types'
import type { CaseStudy } from '@/data/cases'
import { useStore } from '@/lib/store'
import { Button, Card, Segmented, Tag, cx, inputCls } from '@/components/ui'

export function emptyPlan(c: CaseStudy): CasePlan {
  return {
    caseId: c.id,
    updatedAt: Date.now(),
    owners: Object.fromEntries(c.pis.map((p, i) => [i, p.fits === 0 ? 'A' : 'B'])) as Record<number, 'A' | 'B'>,
    points: {},
    handoffs: {},
    opener: '',
    closer: '',
    solution: '',
    judgeQs: c.judgeQuestions.map((q, i) => ({ q, by: (i === 0 ? 'A' : 'B') as 'A' | 'B' })),
    notes: '',
  }
}

export interface PlanCheck {
  ok: boolean
  label: string
}

export function planChecks(c: CaseStudy, p: CasePlan): PlanCheck[] {
  const a = c.pis.filter((_, i) => p.owners[i] === 'A').length
  const b = c.pis.length - a
  const order = c.pis.map((_, i) => i)
  const switches = order.slice(0, -1).filter((i) => p.owners[i] !== p.owners[i + 1])
  return [
    { ok: a >= 2 && b >= 2, label: `PIs are balanced (A: ${a}, B: ${b}; each partner owns at least 2)` },
    { ok: p.judgeQs.some((q) => q.by === 'A') && p.judgeQs.some((q) => q.by === 'B'), label: 'Each partner will field at least one judge question' },
    { ok: c.pis.every((_, i) => (p.points[i] ?? '').trim().length >= 10), label: 'Every PI has talking points (define → explain → apply)' },
    { ok: switches.every((i) => (p.handoffs[i] ?? '').trim().length >= 5), label: `Handoff lines written at every switch (${switches.length})` },
    { ok: p.opener.trim().length >= 10 && p.closer.trim().length >= 10, label: 'Opener and close are written' },
    { ok: p.solution.trim().length >= 20, label: 'One clear solution with a number, date, or metric' },
  ]
}

export function CasePlanner({ c, partnerA, partnerB }: { c: CaseStudy; partnerA: string; partnerB: string }) {
  const saved = useStore((s) => s.casePlans[c.id])
  const [plan, setPlan] = useState<CasePlan>(() => saved ?? emptyPlan(c))
  const [newQ, setNewQ] = useState('')

  // Pick up an imported plan from a partner.
  useEffect(() => {
    if (saved && saved.updatedAt > plan.updatedAt) setPlan(saved)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved?.updatedAt])

  // Autosave (debounced).
  useEffect(() => {
    const t = setTimeout(() => useStore.getState().saveCasePlan(plan), 400)
    return () => clearTimeout(t)
  }, [plan])

  const update = (patch: Partial<CasePlan>) => setPlan((p) => ({ ...p, ...patch, updatedAt: Date.now() }))
  const checks = useMemo(() => planChecks(c, plan), [c, plan])
  const name = (who: 'A' | 'B' | '') => (who === 'A' ? partnerA : who === 'B' ? partnerB : '—')
  const okCount = checks.filter((x) => x.ok).length

  return (
    <div className="grid gap-4">
      <Card className="grid gap-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg">Team checklist</h2>
          <span className={cx('num text-sm font-bold', okCount === checks.length ? 'text-good' : 'text-muted')}>{okCount}/{checks.length}</span>
        </div>
        <ul className="grid gap-1.5">
          {checks.map((x) => (
            <li key={x.label} className={cx('flex items-start gap-2 text-sm', x.ok ? 'text-good' : 'text-ink-2')}>
              {x.ok ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-label="done" /> : <Circle size={18} className="mt-0.5 shrink-0 text-muted" aria-label="not yet" />}
              {x.label}
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted">Saved automatically on this device. Share it with your partner from Partner sync.</p>
      </Card>

      <Card className="grid gap-2">
        <label className="grid gap-1">
          <span className="font-bold">Opener (both partners introduce themselves and the challenge)</span>
          <textarea className={inputCls + ' min-h-20'} value={plan.opener} onChange={(e) => update({ opener: e.target.value })} placeholder={`"Good afternoon! I'm ${partnerA}, ${c.roles[0]}, and this is ${partnerB}, ${c.roles[1]}. Thank you for meeting with us. You asked us to…"`} />
        </label>
      </Card>

      <ol className="grid gap-3">
        {c.pis.map((p, i) => {
          const owner = plan.owners[i] ?? 'A'
          const next = c.pis[i + 1]
          const switchNext = next && (plan.owners[i + 1] ?? 'A') !== owner
          return (
            <li key={p.code}>
              <Card className={cx('grid gap-2 border-l-4', owner === 'A' ? 'border-l-accent' : 'border-l-info')}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="num text-sm font-bold text-muted">{i + 1}</span>
                    <Tag>{p.code}</Tag>
                    <span className="text-sm font-bold">{p.text}</span>
                  </span>
                  <Segmented<'A' | 'B'> label={`Who presents ${p.code}`} value={owner} onChange={(v) => update({ owners: { ...plan.owners, [i]: v } })} options={[{ value: 'A', label: partnerA }, { value: 'B', label: partnerB }]} />
                </div>
                <p className="text-xs text-muted">Best fit: the {c.roles[p.fits]}</p>
                <textarea
                  aria-label={`Talking points for ${p.code}`}
                  className={inputCls + ' min-h-24'}
                  value={plan.points[i] ?? ''}
                  onChange={(e) => update({ points: { ...plan.points, [i]: e.target.value } })}
                  placeholder="Define: … / Explain (why it matters here): … / Apply (specific recommendation, number, date): …"
                />
                {switchNext && (
                  <label className="grid gap-1 rounded-xl bg-paper-2 p-2">
                    <span className="text-xs font-bold">Handoff: {name(owner)} → {name(plan.owners[i + 1] ?? 'A')}</span>
                    <input className={inputCls} value={plan.handoffs[i] ?? ''} onChange={(e) => update({ handoffs: { ...plan.handoffs, [i]: e.target.value } })} placeholder={`"…and that's how we'll position it. ${name(plan.owners[i + 1] ?? 'A')} will explain how we…"`} />
                  </label>
                )}
              </Card>
            </li>
          )
        })}
      </ol>

      <Card className="grid gap-3">
        <label className="grid gap-1">
          <span className="font-bold">The solution (unique, practical, effective)</span>
          <textarea className={inputCls + ' min-h-24'} value={plan.solution} onChange={(e) => update({ solution: e.target.value })} placeholder="What exactly we'll do, by when, what it costs, and 2–3 success metrics." />
        </label>
        <label className="grid gap-1">
          <span className="font-bold">Close</span>
          <textarea className={inputCls + ' min-h-16'} value={plan.closer} onChange={(e) => update({ closer: e.target.value })} placeholder={'"To recap… We\'re confident this will… What questions do you have for us?"'} />
        </label>
      </Card>

      <Card className="grid gap-3">
        <h2 className="text-lg">Judge questions: who takes which?</h2>
        <ul className="grid gap-2">
          {plan.judgeQs.map((jq, k) => (
            <li key={k} className="grid gap-2 rounded-xl border border-line p-2 sm:grid-cols-[1fr_auto_auto] sm:items-center">
              <span className="text-sm">{jq.q}</span>
              <Segmented<'A' | 'B' | ''>
                label="Who answers"
                value={jq.by}
                onChange={(v) => update({ judgeQs: plan.judgeQs.map((x, j) => (j === k ? { ...x, by: v } : x)) })}
                options={[{ value: 'A', label: partnerA }, { value: 'B', label: partnerB }, { value: '', label: '?' }]}
              />
              {k >= c.judgeQuestions.length ? (
                <Button size="sm" variant="quiet" aria-label="Remove question" onClick={() => update({ judgeQs: plan.judgeQs.filter((_, j) => j !== k) })}>
                  <Trash2 size={16} aria-hidden />
                </Button>
              ) : <span className="text-xs text-muted">standard</span>}
            </li>
          ))}
        </ul>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (!newQ.trim()) return
            update({ judgeQs: [...plan.judgeQs, { q: newQ.trim(), by: '' }] })
            setNewQ('')
          }}
        >
          <input className={inputCls} value={newQ} onChange={(e) => setNewQ(e.target.value)} placeholder="Predict another judge question…" aria-label="New predicted judge question" />
          <Button type="submit" variant="ghost" icon={<Plus size={16} aria-hidden />}>Add</Button>
        </form>
      </Card>

      <Card>
        <label className="grid gap-1">
          <span className="font-bold">Scratch notes</span>
          <textarea className={inputCls + ' min-h-24'} value={plan.notes} onChange={(e) => update({ notes: e.target.value })} placeholder="Numbers, calculations, reminders…" />
        </label>
      </Card>
    </div>
  )
}
