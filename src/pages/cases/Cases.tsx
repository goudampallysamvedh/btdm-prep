import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, MessagesSquare } from 'lucide-react'
import { CASES } from '@/data/cases'
import { WARMUPS } from '@/data/warmups'
import { useStore } from '@/lib/store'
import { planChecks } from './CasePlanner'
import { LinkButton, PageHeader, SectionTitle, Tag, cx } from '@/components/ui'

export default function Cases() {
  const attempts = useStore((s) => s.caseAttempts)
  const plans = useStore((s) => s.casePlans)
  return (
    <>
      <PageHeader title="Cases" actions={<LinkButton variant="ghost" to="/learn/playbook">BTDM playbook</LinkButton>}>
        Pick a case, prep for 30 minutes, present for 15, then score yourselves.
      </PageHeader>

      <ul className="border-t border-line">
        {CASES.map((c) => {
          const mine = attempts.filter((a) => a.caseId === c.id)
          const best = mine.length ? Math.max(...mine.map((a) => a.total)) : null
          const plan = plans[c.id]
          const planTotal = plan ? planChecks(c, plan).length : 0
          const ready = plan ? planChecks(c, plan).filter((x) => x.ok).length : 0
          return (
            <li key={c.id} className="border-b border-line">
              <Link
                to={`/cases/${c.id}`}
                className="-mx-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-2 rounded-2xl px-3 py-5 text-ink no-underline transition-colors hover:bg-card"
              >
                <span className="grid min-w-0 gap-1">
                  <span className="truncate text-sm text-muted">{c.company} · {c.area}</span>
                  <span className="font-display text-[1.65rem] font-normal leading-tight">{c.title}</span>
                  <span className="text-sm text-muted">{c.roles[0]} + {c.roles[1]}</span>
                  <span className="mt-1 flex flex-wrap gap-1">{c.pis.map((p) => <Tag key={p.code}>{p.code}</Tag>)}</span>
                </span>
                <span className="grid justify-items-end gap-1 text-right">
                  {best !== null ? (
                    <span className="num text-3xl leading-none">{best}<span className="text-sm text-muted">/100</span></span>
                  ) : (
                    <span className="text-sm text-muted">Not tried</span>
                  )}
                  <span className="num text-xs text-muted">{best !== null ? `best of ${mine.length} run${mine.length > 1 ? 's' : ''}` : '—'}</span>
                  {plan && <span className="num text-xs text-muted">Plan {ready}/{planTotal}</span>}
                  <span className="flex gap-0.5" role="img" aria-label={`Difficulty ${c.difficulty} of 3`}>
                    {[1, 2, 3].map((d) => <i key={d} className={cx('inline-block h-1.5 w-4 rounded-full', d <= c.difficulty ? 'bg-accent' : 'bg-paper-2')} />)}
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-[22px] bg-card p-5 sm:p-6">
        <span className="flex items-center gap-3">
          <MessagesSquare size={18} strokeWidth={1.75} className="text-muted" aria-hidden />
          <span><b className="font-semibold">Judge question drill</b><span className="block text-sm text-muted">80 follow-up questions, practiced against a case</span></span>
        </span>
        <LinkButton to="/cases/judge">Drill now</LinkButton>
      </div>

      <SectionTitle>Warm-ups from your prep kit</SectionTitle>
      <p className="mb-3 max-w-[68ch] text-sm text-muted">Seven individual-series role-plays from your original kit. They're one-person, 10 + 10 minute scenarios, great for practicing define → explain → apply on a single PI set.</p>
      <ul className="border-t border-line">
        {WARMUPS.map((w) => <Warmup key={w.id} w={w} />)}
      </ul>
    </>
  )
}

function Warmup({ w }: { w: (typeof WARMUPS)[number] }) {
  const [open, setOpen] = useState(false)
  const [key, setKey] = useState(false)
  return (
    <li className="border-b border-line">
      <button className="flex min-h-14 w-full items-center justify-between gap-3 py-3 text-left" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>
          <span className="block text-sm text-muted">{w.event}</span>
          <span className="block font-medium">{w.title}</span>
        </span>
        <ChevronDown size={18} strokeWidth={1.75} className={cx('shrink-0 text-muted transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      {open && (
        <div className="animate-rise mb-3 grid gap-3 rounded-2xl bg-card p-4 sm:p-5">
          <p>You are the <b className="font-semibold">{w.you}</b>. The judge plays <b className="font-semibold">{w.judge}</b>.</p>
          <p>{w.situation}</p>
          <div><b className="font-semibold">Present your recommendations to:</b><ul className="prose-app mt-1">{w.tasks.map((t) => <li key={t}>{t}</li>)}</ul></div>
          <ul className="grid gap-1 text-sm">{w.pis.map(([c, t]) => <li key={c} className="flex gap-2"><Tag className="shrink-0">{c}</Tag>{t}</li>)}</ul>
          <button className="min-h-9 justify-self-start text-sm font-medium text-ink underline underline-offset-4" onClick={() => setKey(!key)} aria-expanded={key}>{key ? 'Hide' : 'Show'} the judge's key points</button>
          {key && <ul className="prose-app text-sm">{w.key.map((k) => <li key={k}>{k}</li>)}</ul>}
        </div>
      )}
    </li>
  )
}
