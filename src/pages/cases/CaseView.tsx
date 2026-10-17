import type { CaseStudy } from '@/data/cases'
import { COMPETENCIES, SOLUTION_CRITERIA } from '@/data/playbook'
import { Card, Tag } from '@/components/ui'

/** The case as competitors would read it: cover sheet + situation + data. */
export function CaseView({ c, partnerA, partnerB }: { c: CaseStudy; partnerA: string; partnerB: string }) {
  return (
    <div className="grid gap-4">
      <Card className="grid gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow">Career cluster: Marketing</span>
          <span className="eyebrow">· Instructional area: {c.area}</span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <div className="mb-1 font-bold">Solution</div>
            <ul className="grid gap-1 text-sm">
              {SOLUTION_CRITERIA.map((s) => <li key={s.key}><b>{s.label}</b>: {s.text}</li>)}
            </ul>
          </div>
          <div>
            <div className="mb-1 font-bold">Career competencies</div>
            <ul className="grid gap-1 text-sm">
              {c.competencies.map((k) => { const cc = COMPETENCIES.find((x) => x.key === k)!; return <li key={k}><b>{cc.label}</b>: {cc.text}</li> })}
            </ul>
          </div>
          <div>
            <div className="mb-1 font-bold">Performance indicators</div>
            <ol className="grid gap-1 text-sm">
              {c.pis.map((p) => <li key={p.code} className="flex gap-2"><Tag className="shrink-0">{p.code}</Tag><span>{p.text}</span></li>)}
            </ol>
          </div>
        </div>
      </Card>

      <Card className="grid gap-3">
        <h2 className="text-xl">Case study situation</h2>
        <p>
          You are to assume the roles of the <b>{c.roles[0]}</b> ({partnerA}) and the <b>{c.roles[1]}</b> ({partnerB}) for <b>{c.company}</b>. The {c.judge} (judge) wants your team's recommendations.
        </p>
        {c.situation.map((p, i) => <p key={i}>{p}</p>)}
        <div>
          <p className="font-bold">The {c.judge} (judge) wants your team to:</p>
          <ul className="prose-app mt-1">{c.tasks.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
        <p className="text-sm text-muted">
          You will present your ideas to the {c.judge} (judge) in a meeting. The judge will begin by greeting you and asking to hear your ideas, will ask questions after your presentation, and will conclude by thanking you.
        </p>
      </Card>

      {c.data.map((t) => (
        <Card key={t.title} className="grid gap-2">
          <h3 className="text-lg">{t.title}</h3>
          <div className="scroll-x">
            <table className={`num w-full text-sm ${t.columns.length > 3 ? 'min-w-[480px]' : ''}`}>
              <thead>
                <tr className="text-left">
                  {t.columns.map((col, i) => <th key={i} className="border-b border-line-2 px-2 py-1.5 text-xs uppercase tracking-wide text-muted">{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {t.rows.map((r, i) => (
                  <tr key={i} className="border-b border-line">
                    {r.map((cell, j) => <td key={j} className={j === 0 ? 'px-2 py-1.5 font-body font-bold' : 'px-2 py-1.5'}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {t.note && <p className="text-xs text-muted">{t.note}</p>}
        </Card>
      ))}
    </div>
  )
}
