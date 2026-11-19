import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react'
import type { CasePlan } from '@/types'
import type { CaseStudy } from '@/data/cases'
import { useStore } from '@/lib/store'
import { Button, Card, Segmented, Tag, cx, inputCls } from '@/components/ui'

export function emptyPlan(c: CaseStudy): CasePlan {
  return {
    caseId: c.id,
    updatedAt: Date.now(),
    owners: {},
    points: {},
    handoffs: {},
    opener: '',
    closer: '',
    solution: '',
    judgeQs: c.judgeQuestions.map((q) => ({ q, by: '' as const })),
    notes: '',
  }
}

export interface PlanCheck {
  ok: boolean
  label: string
}

export function planChecks(c: CaseStudy, p: CasePlan): PlanCheck[] {
  const a = c.pis.filter((_, i) => p.owners[i] === 'A').length
  const b = c.pis.filter((_, i) => p.owners[i] === 'B').length
  const order = c.pis.map((_, i) => i)
  const switches = order.slice(0, -1).filter((i) => p.owners[i] && p.owners[i + 1] && p.owners[i] !== p.owners[i + 1])
  return [
    { ok: a + b === c.pis.length, label: 'You decided who covers each PI' },
    { ok: a >= 1 && b >= 1, label: 'Both partners present part of the plan' },
    { ok: p.judgeQs.some((q) => q.by === 'A') && p.judgeQs.some((q) => q.by === 'B'), label: 'Both partners plan to answer at least one judge question (DECA expects this)' },
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
      <Card className="grid gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[0.95rem]">Team checklist</h2>
          <span className={cx('num text-sm font-medium', okCount === checks.length ? 'text-good' : 'text-muted')}>{okCount} of {checks.length}</span>
        </div>
        <ul className="grid gap-2">
          {checks.map((x) => (
            <li key={x.label} className={cx('flex items-start gap-2 text-sm', x.ok ? 'text-ink' : 'text-muted')}>
              {x.ok ? <CheckCircle2 size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-good" aria-label="done" /> : <Circle size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-muted" aria-label="not yet" />}
              {x.label}
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted">Saved automatically on this device. Share it with your partner from Sync.</p>
      </Card>

      <Card className="grid gap-6">
        <Row id="plan-opener" label="Opener" hint="Both partners introduce themselves and the challenge.">
          <textarea id="plan-opener" className={inputCls + ' min-h-20'} value={plan.opener} onChange={(e) => update({ opener: e.target.value })} placeholder={`"Good afternoon! I'm [name], the [role], and this is [name], the [role]. Thank you for meeting with us. You asked us to…"`} />
        </Row>

        {c.pis.map((p, i) => {
          const owner = plan.owners[i] ?? ''
          const next = c.pis[i + 1]
          const nextOwner = next ? plan.owners[i + 1] ?? '' : ''
          const switchNext = !!next && !!owner && !!nextOwner && nextOwner !== owner
          return (
            <Row
              key={p.code}
              id={`plan-pi-${i}`}
              border
              label={<span className="flex items-center gap-2"><span className="num text-muted">{i + 1}</span><Tag>{p.code}</Tag></span>}
              hint={p.text}
            >
              <Segmented<'A' | 'B' | ''> label={`Who presents ${p.code}`} value={owner} onChange={(v) => update({ owners: { ...plan.owners, [i]: v as 'A' | 'B' } })} options={[{ value: 'A', label: partnerA }, { value: 'B', label: partnerB }]} />
              <textarea
                id={`plan-pi-${i}`}
                aria-label={`Talking points for ${p.code}`}
                className={inputCls + ' min-h-24'}
                value={plan.points[i] ?? ''}
                onChange={(e) => update({ points: { ...plan.points, [i]: e.target.value } })}
                placeholder="Define: … / Explain (why it matters here): … / Apply (specific recommendation, number, date): …"
              />
              {switchNext && (
                <label className="grid gap-1 rounded-2xl border border-line bg-paper p-3">
                  <span className="text-xs font-medium text-muted">Handoff: {name(owner)} → {name(nextOwner)}</span>
                  <input className={inputCls} value={plan.handoffs[i] ?? ''} onChange={(e) => update({ handoffs: { ...plan.handoffs, [i]: e.target.value } })} placeholder={`"…and that's how we'll position it. ${name(nextOwner)} will explain how we…"`} />
                </label>
              )}
            </Row>
          )
        })}

        <Row
          id="plan-solution"
          border
          label="The solution"
          hint="Unique, practical, effective. Back it up: your point, a number from the case, what it means, then the action. Name one risk and your backup plan."
        >
          <textarea id="plan-solution" className={inputCls + ' min-h-24'} value={plan.solution} onChange={(e) => update({ solution: e.target.value })} placeholder="What exactly we'll do, by when, what it costs, and 2–3 success metrics." />
          <span className="text-xs text-muted">
            <Link to="/learn/lessons/data-arguments" className="font-medium text-ink">Using data</Link> · <Link to="/learn/lessons/risk" className="font-medium text-ink">Planning for risk</Link>
          </span>
        </Row>

        <Row id="plan-close" label="Close">
          <textarea id="plan-close" className={inputCls + ' min-h-16'} value={plan.closer} onChange={(e) => update({ closer: e.target.value })} placeholder={'"To recap… We\'re confident this will… What questions do you have for us?"'} />
        </Row>
      </Card>

      <Card className="grid gap-3">
        <h2 className="text-[0.95rem]">Judge questions: who takes which?</h2>
        <ul className="grid gap-2">
          {plan.judgeQs.map((jq, k) => (
            <li key={k} className="grid gap-2 rounded-2xl border border-line bg-paper p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
              <span className="text-sm">{jq.q}</span>
              <Segmented<'A' | 'B' | ''>
                label="Who answers"
                value={jq.by}
                onChange={(v) => update({ judgeQs: plan.judgeQs.map((x, j) => (j === k ? { ...x, by: v } : x)) })}
                options={[{ value: 'A', label: partnerA }, { value: 'B', label: partnerB }, { value: '', label: '?' }]}
              />
              {k >= c.judgeQuestions.length ? (
                <Button size="sm" variant="quiet" aria-label="Remove question" onClick={() => update({ judgeQs: plan.judgeQs.filter((_, j) => j !== k) })}>
                  <Trash2 size={16} strokeWidth={1.75} aria-hidden />
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
          <Button type="submit" variant="ghost" icon={<Plus size={16} strokeWidth={1.75} aria-hidden />}>Add</Button>
        </form>
      </Card>

      <Card>
        <Row id="plan-notes" label="Scratch notes">
          <textarea id="plan-notes" className={inputCls + ' min-h-24'} value={plan.notes} onChange={(e) => update({ notes: e.target.value })} placeholder="Numbers, calculations, reminders…" />
        </Row>
      </Card>
    </div>
  )
}

/** One form row: label and hint on the left, fields on the right (stacked on a phone). */
function Row({ id, label, hint, border, children }: { id: string; label: ReactNode; hint?: string; border?: boolean; children: ReactNode }) {
  return (
    <div className={cx('grid gap-3 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-8', border && 'border-t border-line pt-6')}>
      <div className="grid content-start gap-1">
        <label htmlFor={id} className="text-sm font-medium">{label}</label>
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
      <div className="grid min-w-0 gap-3">{children}</div>
    </div>
  )
}
