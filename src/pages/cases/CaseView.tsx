import type { CaseStudy } from '@/data/cases'
import { COMPETENCIES, SOLUTION_CRITERIA } from '@/data/playbook'
import { Card, Tag } from '@/components/ui'

/** The case as competitors would read it: cover sheet + situation + data. */
export function CaseView({ c }: { c: CaseStudy }) {
  return (
    <div className="grid gap-4">
      <Card className="grid gap-3">
        <div className="text-sm text-muted">Career cluster: Marketing · Instructional area: {c.area}</div>
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <h2 className="mb-2 text-[0.95rem]">Solution</h2>
            <ul className="grid gap-1 text-sm">
              {SOLUTION_CRITERIA.map((s) => <li key={s.key}><b className="font-medium">{s.label}</b>: {s.text}</li>)}
            </ul>
          </div>
          <div>
            <h2 className="mb-2 text-[0.95rem]">Career competencies</h2>
            <ul className="grid gap-1 text-sm">
              {c.competencies.map((k) => { const cc = COMPETENCIES.find((x) => x.key === k)!; return <li key={k}><b className="font-medium">{cc.label}</b>: {cc.text}</li> })}
            </ul>
          </div>
          <div>
            <h2 className="mb-2 text-[0.95rem]">Performance indicators</h2>
            <ol className="grid gap-1 text-sm">
              {c.pis.map((p) => <li key={p.code} className="flex gap-2"><Tag className="shrink-0">{p.code}</Tag><span>{p.text}</span></li>)}
            </ol>
          </div>
        </div>
      </Card>

      <Card className="grid gap-3">
        <h2 className="text-lg">Case study situation</h2>
        <p>
          Your team plays the <b className="font-semibold">{c.roles[0]}</b> and the <b className="font-semibold">{c.roles[1]}</b> for <b className="font-semibold">{c.company}</b>. Decide together who takes which role. The {c.judge} (judge) wants your team's recommendations.
        </p>
        {c.situation.map((p, i) => <p key={i}>{p}</p>)}
        <div>
          <p className="font-medium">The {c.judge} (judge) wants your team to:</p>
          <ul className="prose-app mt-1">{c.tasks.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
        <p className="text-sm text-muted">
          You will present your ideas to the {c.judge} (judge) in a meeting. The judge will begin by greeting you and asking to hear your ideas, will ask questions after your presentation, and will conclude by thanking you.
        </p>
      </Card>

      {c.data.map((t) => (
        <Card key={t.title} className="grid gap-2">
          <h3 className="text-[0.95rem]">{t.title}</h3>
          <div className="scroll-x">
            <table className={`num w-full text-sm ${t.columns.length > 3 ? 'min-w-[480px]' : ''}`}>
              <thead>
                <tr className="text-left">
                  {t.columns.map((col, i) => <th key={i} className="border-b border-line-2 px-2 py-1.5 text-xs font-medium text-muted">{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {t.rows.map((r, i) => (
                  <tr key={i} className="border-b border-line">
                    {r.map((cell, j) => <td key={j} className={j === 0 ? 'px-2 py-1.5 font-medium' : 'px-2 py-1.5'}>{cell}</td>)}
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
