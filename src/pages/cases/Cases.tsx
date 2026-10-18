import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, MessagesSquare } from 'lucide-react'
import { CASES } from '@/data/cases'
import { WARMUPS } from '@/data/warmups'
import { useStore } from '@/lib/store'
import { planChecks } from './CasePlanner'
import { Card, LinkButton, PageHeader, Pill, SectionTitle, Tag, cx } from '@/components/ui'

export default function Cases() {
  const attempts = useStore((s) => s.caseAttempts)
  const plans = useStore((s) => s.casePlans)
  return (
    <>
      <PageHeader title="Cases" actions={<LinkButton variant="ghost" to="/learn/playbook">BTDM playbook</LinkButton>}>
        Pick a case, prep for 30 minutes, present for 15, then score yourselves.
      </PageHeader>

      <ul className="grid gap-3 md:grid-cols-2">
        {CASES.map((c) => {
          const mine = attempts.filter((a) => a.caseId === c.id)
          const best = mine.length ? Math.max(...mine.map((a) => a.total)) : null
          const plan = plans[c.id]
          const ready = plan ? planChecks(c, plan).filter((x) => x.ok).length : 0
          return (
            <li key={c.id}>
              <Link to={`/cases/${c.id}`} className="card flex h-full flex-col gap-2 p-4 text-ink no-underline lift hover:border-accent">
                <span className="flex items-center justify-between gap-2">
                  <span className="eyebrow">{c.company}</span>
                  <span className="flex gap-0.5" aria-label={`Difficulty ${c.difficulty} of 3`}>
                    {[1, 2, 3].map((d) => <i key={d} className={cx('inline-block h-2 w-4 rounded-full', d <= c.difficulty ? 'bg-accent' : 'bg-paper-2')} />)}
                  </span>
                </span>
                <span className="font-display text-xl font-extrabold leading-tight" style={{ fontStretch: '108%' }}>{c.title}</span>
                <span className="text-sm text-muted">{c.roles[0]} + {c.roles[1]} · {c.area}</span>
                <span className="flex flex-wrap gap-1">{c.pis.map((p) => <Tag key={p.code}>{p.code}</Tag>)}</span>
                <span className="mt-auto flex flex-wrap gap-2 pt-1">
                  {best !== null ? <Pill tone="good">Best {best}/100 · {mine.length} run{mine.length > 1 ? 's' : ''}</Pill> : <Pill>Not tried</Pill>}
                  {plan && <Pill tone="info">Plan {ready}/{planChecks(c, plan).length}</Pill>}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      <Card className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-3">
          <MessagesSquare size={22} className="text-accent" aria-hidden />
          <span><b>Judge question drill</b><span className="block text-sm text-muted">80 follow-up questions, practiced against a case</span></span>
        </span>
        <LinkButton to="/cases/judge">Drill now</LinkButton>
      </Card>

      <SectionTitle>Warm-ups from your prep kit</SectionTitle>
      <p className="mb-3 text-sm text-muted">Seven individual-series role-plays from your original kit. They're one-person, 10 + 10 minute scenarios, great for practicing define → explain → apply on a single PI set.</p>
      <ul className="grid gap-2">
        {WARMUPS.map((w) => <Warmup key={w.id} w={w} />)}
      </ul>
    </>
  )
}

function Warmup({ w }: { w: (typeof WARMUPS)[number] }) {
  const [open, setOpen] = useState(false)
  const [key, setKey] = useState(false)
  return (
    <li className="card">
      <button className="flex w-full items-center justify-between gap-3 p-4 text-left" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>
          <span className="eyebrow">{w.event}</span>
          <span className="block font-bold">{w.title}</span>
        </span>
        <ChevronDown size={20} className={cx('shrink-0 text-muted transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      {open && (
        <div className="grid gap-3 border-t border-line p-4 animate-rise">
          <p>You are the <b>{w.you}</b>. The judge plays <b>{w.judge}</b>.</p>
          <p>{w.situation}</p>
          <div><b>Present your recommendations to:</b><ul className="prose-app mt-1">{w.tasks.map((t) => <li key={t}>{t}</li>)}</ul></div>
          <ul className="grid gap-1 text-sm">{w.pis.map(([c, t]) => <li key={c} className="flex gap-2"><Tag className="shrink-0">{c}</Tag>{t}</li>)}</ul>
          <button className="justify-self-start text-sm font-bold text-accent" onClick={() => setKey(!key)} aria-expanded={key}>{key ? 'Hide' : 'Show'} the judge's key points</button>
          {key && <ul className="prose-app text-sm">{w.key.map((k) => <li key={k}>{k}</li>)}</ul>}
        </div>
      )}
    </li>
  )
}
