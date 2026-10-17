import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronDown, Layers, Lightbulb, Search } from 'lucide-react'
import { PI_GUIDE, LEVEL_NAME } from '@/data/piNotes'
import { AREAS, AREA_BY_CODE } from '@/data/areas'
import { QUESTIONS } from '@/data/questions'
import { useStore } from '@/lib/store'
import type { AreaCode } from '@/types'
import { Card, Disclosure, LinkButton, PageHeader, Pill, Segmented, Tag, cx, inputCls } from '@/components/ui'

type Filter = 'case' | 'exam' | 'tier2' | 'all'

const Q_BY_PI = QUESTIONS.reduce<Record<string, number>>((m, q) => ((m[q.pi] = (m[q.pi] ?? 0) + 1), m), {})

export default function PIGuide() {
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const [filter, setFilter] = useState<Filter>((params.get('f') as Filter) ?? 'all')
  const area = (params.get('area') ?? '') as AreaCode | ''
  const [open, setOpen] = useState<string | null>(null)
  const leitner = useStore((s) => s.leitner)

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return PI_GUIDE.filter(
      (p) =>
        (!area || p.code.startsWith(area)) &&
        (filter === 'all' || (filter === 'case' && p.inCase) || (filter === 'exam' && p.onExam) || (filter === 'tier2' && p.tier === 2)) &&
        (!needle || p.code.toLowerCase().includes(needle) || p.text.toLowerCase().includes(needle) || p.plain.toLowerCase().includes(needle)),
    )
  }, [q, filter, area])

  const groups = AREAS.map((a) => ({ a, items: list.filter((p) => p.code.startsWith(a.code)) })).filter((g) => g.items.length)
  const known = PI_GUIDE.filter((p) => (leitner[`pi-${p.code.replace(':', '')}`]?.box ?? 0) >= 3).length

  return (
    <>
      <PageHeader title="PI guide" actions={<LinkButton size="sm" to="/cards?deck=pi&pif=case" icon={<Layers size={16} aria-hidden />}>Study as flashcards</LinkButton>}>
        All {PI_GUIDE.length} performance indicators for BTDM, in plain words. Tap one to learn it.
      </PageHeader>

      <Disclosure title="How to study PIs for ICDC" hint="Which ones to learn first">
        <ol className="prose-app text-sm">
          <li>Start with <b>In BTDM cases</b>: the PIs DECA used in recent BTDM case studies. Learn to define → explain → apply each one.</li>
          <li>Then <b>On sample exams</b>: PIs tested on the 2022, 2025, and 2026 sample exams.</li>
          <li>Then the <b>Marketing cluster</b> (Tier 2) PIs, which BTDM case studies draw on most.</li>
          <li>Prerequisite (PQ) PIs are basics; specialist (SP) PIs are the most advanced and most common in case studies.</li>
        </ol>
      </Disclosure>

      <Card className="my-4 grid gap-3 md:sticky md:top-2 md:z-10">
        <label className="relative block">
          <span className="sr-only">Search PIs</span>
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
          <input className={inputCls + ' pl-10'} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by code or words, e.g. PM:042 or vendors" />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented<Filter>
            label="Which PIs"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'case', label: 'In BTDM cases' },
              { value: 'exam', label: 'On sample exams' },
              { value: 'tier2', label: 'Marketing cluster' },
              { value: 'all', label: 'All' },
            ]}
          />
          <select
            aria-label="Area"
            className={inputCls + ' !min-h-10 !w-auto max-w-56'}
            value={area}
            onChange={(e) => {
              if (e.target.value) params.set('area', e.target.value)
              else params.delete('area')
              setParams(params, { replace: true })
            }}
          >
            <option value="">All areas</option>
            {AREAS.map((a) => <option key={a.code} value={a.code}>{a.code} · {a.name}</option>)}
          </select>
          <span className="num ml-auto text-xs text-muted">{list.length} shown · {known}/{PI_GUIDE.length} known as flashcards</span>
        </div>
      </Card>

      {groups.length === 0 && <p className="py-8 text-center text-muted">No PIs match. Try another word or filter.</p>}

      {groups.map(({ a, items }) => (
        <section key={a.code} className="mb-5">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Tag>{a.code}</Tag>
            <h2 className="text-lg">{a.name}</h2>
            <span className="text-xs text-muted">{items.length} PI{items.length === 1 ? '' : 's'} · {a.weight} exam question{a.weight === 1 ? '' : 's'}</span>
            <Link to={`/cards?deck=pi&area=${a.code}&pif=${filter}`} className="ml-auto text-sm font-bold">Flashcards →</Link>
          </div>
          <ul className="grid gap-1.5">
            {items.map((p) => {
              const isOpen = open === p.code
              const nq = Q_BY_PI[p.code] ?? 0
              const box = leitner[`pi-${p.code.replace(':', '')}`]?.box
              return (
                <li key={p.code} className={cx('card overflow-hidden', isOpen && 'border-accent')}>
                  <button className="flex w-full items-start gap-3 px-3 py-2.5 text-left" onClick={() => setOpen(isOpen ? null : p.code)} aria-expanded={isOpen}>
                    <span className="num mt-0.5 shrink-0 text-xs font-bold text-muted">{p.code}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.95rem] font-bold leading-snug">{p.text}</span>
                      <span className="mt-1 flex flex-wrap gap-1">
                        {p.inCase && <Pill tone="accent">BTDM case</Pill>}
                        {p.onExam && <Pill tone="info">Sample exam</Pill>}
                        <Pill>{p.level} · {LEVEL_NAME[p.level]}</Pill>
                        {box && box >= 3 && <Pill tone="good">Known</Pill>}
                      </span>
                    </span>
                    <ChevronDown size={18} className={cx('mt-0.5 shrink-0 text-muted transition-transform', isOpen && 'rotate-180')} aria-hidden />
                  </button>
                  {isOpen && (
                    <div className="grid gap-2 border-t border-line bg-paper-2/60 px-3 py-3 animate-rise">
                      <p><b>What it means:</b> {p.plain}</p>
                      {p.inCaseLine && (
                        <p className="flex gap-2 text-[0.95rem] italic">
                          <Lightbulb size={16} className="mt-1 shrink-0 text-accent" aria-hidden />
                          <span><span className="not-italic font-bold">Say it in a case:</span> "{p.inCaseLine.replace(/^"|"$/g, '')}"</span>
                        </p>
                      )}
                      <p className="text-sm text-muted">
                        In a case, hit all three: <b>define</b> it in one sentence, <b>explain</b> why it matters to this business, and <b>apply</b> it with a specific recommendation.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {nq > 0 && <LinkButton size="sm" to={`/exam/practice?mode=pi&pi=${encodeURIComponent(p.code)}&count=${Math.min(nq, 10)}`}>Practice ({nq})</LinkButton>}
                        <LinkButton size="sm" variant="ghost" to={`/learn/guide/${p.code.slice(0, 2)}`}>{AREA_BY_CODE[p.code.slice(0, 2) as AreaCode]?.name} guide</LinkButton>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </>
  )
}
