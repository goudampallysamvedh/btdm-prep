import { ExternalLink } from 'lucide-react'
import {
  CASE_RESEARCH, COMPETENCIES, FORMAT, LEVELS, LEVEL_MEANING, PI_FORMULA, PREP_PHASES, PRESENTATION_FLOW,
  RUBRIC_POINTS, SOLUTION_CRITERIA, SOURCES, STUDY_PLAN, TEAM_TIPS, WHAT_CHANGED,
} from '@/data/playbook'
import { Callout, Card, Html, LinkButton, PageHeader, SectionTitle, cx } from '@/components/ui'

export default function Playbook() {
  return (
    <>
      <PageHeader eyebrow="Buying and Merchandising Team Decision Making" title="BTDM playbook">
        Everything about the event in one place, checked against the 2026–27 DECA Guide and DECA's published BTDM cases.
      </PageHeader>

      <SectionTitle>How you're scored</SectionTitle>
      <Card className="grid gap-4">
        <div className="flex h-14 overflow-hidden rounded-xl border border-line text-sm font-bold" role="img" aria-label="Presentation counts two thirds, averaged exam counts one third">
          <div className="grid flex-[2] place-items-center bg-accent text-accent-ink">Case presentation · 2×</div>
          <div className="grid flex-1 place-items-center bg-ink-2 text-paper">Team exam avg · 1×</div>
        </div>
        <p className="text-sm text-muted">The presentation is weighted twice the averaged exam score, and the exam score carries into finals. A weak exam partner pulls the team average down, so both partners study.</p>
        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {FORMAT.map((f) => (
            <div key={f.k} className="border-b border-line pb-2">
              <dt className="eyebrow">{f.k}</dt>
              <dd className="m-0 text-[0.95rem]">{f.v}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <SectionTitle>The judge's evaluation form (100 points)</SectionTitle>
      <Card className="grid gap-4">
        <div className="scroll-x">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted">
                <th className="py-2">Line</th>
                {LEVELS.map((l) => <th key={l} className="px-2">{l}</th>)}
                <th className="px-2">Max</th>
              </tr>
            </thead>
            <tbody className="num">
              {[
                ['5 performance indicators (each)', RUBRIC_POINTS.pi, '50'],
                ['Solution: unique, practical, effective (each)', RUBRIC_POINTS.solution, '24'],
                ['3 career competencies (each)', RUBRIC_POINTS.competency, '18'],
                ['Overall impression', RUBRIC_POINTS.overall, '8'],
              ].map(([label, r, total]) => {
                const rp = r as { max: number; bands: string[] }
                return (
                  <tr key={label as string} className="border-t border-line">
                    <td className="py-2 font-body">{label as string}</td>
                    {rp.bands.map((b) => <td key={b} className="px-2">{b}</td>)}
                    <td className="px-2 font-bold">{total as string}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {LEVELS.map((l, i) => (
            <div key={l} className={cx('rounded-xl p-3 text-sm', i === 0 ? 'bg-bad-bg' : i === 1 ? 'bg-warn-bg' : 'bg-good-bg')}>
              <b>{l}:</b> {LEVEL_MEANING[i]}
            </div>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <div className="mb-1 font-bold">Solution</div>
            <ul className="grid gap-1 text-sm">{SOLUTION_CRITERIA.map((s) => <li key={s.key}><b>{s.label}:</b> {s.text}</li>)}</ul>
          </div>
          <div>
            <div className="mb-1 font-bold">Career competencies (the guide lists five)</div>
            <ul className="grid gap-1 text-sm">{COMPETENCIES.map((c) => <li key={c.key}><b>{c.label}:</b> {c.text}</li>)}</ul>
          </div>
        </div>
        <Callout tone="warn" title="Check your case">
          The 2026 BTDM sample scored only three competencies (Critical Thinking, Communication, Decision Making). Each case lists its own, so read the cover sheet. The point split above comes from that sample's form.
        </Callout>
      </Card>

      <SectionTitle>What changed for 2026–27</SectionTitle>
      <Card><ul className="prose-app">{WHAT_CHANGED.map((w) => <li key={w}><Html html={w} /></li>)}</ul></Card>

      <SectionTitle>What DECA's BTDM cases actually test</SectionTitle>
      <Card className="grid gap-3">
        <p>{CASE_RESEARCH.summary}</p>
        <div className="scroll-x">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted">
                <th className="py-2 pr-2">Year</th><th className="px-2">Business</th><th className="px-2">Your roles</th><th className="px-2">Area</th><th className="px-2">PI themes</th>
              </tr>
            </thead>
            <tbody>
              {CASE_RESEARCH.cases.map((c) => (
                <tr key={c.year} className="border-t border-line align-top">
                  <td className="num py-2 pr-2 font-bold">{c.year}</td><td className="px-2">{c.setting}</td><td className="px-2">{c.roles}</td><td className="px-2">{c.area}</td><td className="px-2">{c.pis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="prose-app">{CASE_RESEARCH.takeaways.map((t) => <li key={t}>{t}</li>)}</ul>
      </Card>

      <SectionTitle>The PI formula: define → explain → apply</SectionTitle>
      <Card className="grid gap-3">
        <ol className="grid gap-2 sm:grid-cols-3">
          {PI_FORMULA.steps.map((s, i) => (
            <li key={s.k} className="rounded-xl bg-paper-2 p-3">
              <div className="num text-xs text-muted">STEP {i + 1}</div>
              <div className="font-bold">{s.k}</div>
              <div className="text-sm">{s.v}</div>
            </li>
          ))}
        </ol>
        <p className="border-l-4 border-marker pl-3 italic">{PI_FORMULA.example}</p>
        <p className="text-sm text-muted">Most competitors only define. Proficient means you explain it for this business; Exemplary means you apply it with specifics that solve the case.</p>
      </Card>

      <SectionTitle>Your 30 minutes of prep</SectionTitle>
      <div className="flex h-12 overflow-hidden rounded-xl border border-line text-xs font-bold">
        {PREP_PHASES.map((p, i) => (
          <div key={p.id} className={cx('grid place-items-center px-1 text-center', i === 0 ? 'bg-marker text-[#14213d]' : i === 1 ? 'bg-accent text-accent-ink' : i === 2 ? 'bg-ink-2 text-paper' : 'bg-line-2 text-ink')} style={{ flex: p.minutes }}>
            {p.minutes}m · {p.label}
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {PREP_PHASES.map((p) => (
          <Card key={p.id}>
            <div className="mb-1 font-bold">{p.label} <span className="num font-normal text-muted">({p.minutes} min)</span></div>
            <ul className="prose-app text-sm">{p.tips.map((t) => <li key={t}>{t}</li>)}</ul>
          </Card>
        ))}
      </div>

      <SectionTitle>The 15 minutes with the judge</SectionTitle>
      <Card>
        <dl className="grid gap-2">
          {PRESENTATION_FLOW.map((f) => (
            <div key={f.k} className="grid gap-1 border-b border-line pb-2 sm:grid-cols-[10rem_1fr]">
              <dt className="font-bold">{f.k}</dt>
              <dd className="m-0">{f.v}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <SectionTitle>Winning as a team</SectionTitle>
      <Card><ul className="prose-app">{TEAM_TIPS.map((t) => <li key={t}>{t}</li>)}</ul></Card>

      <SectionTitle>Hitting the competencies</SectionTitle>
      <div className="grid gap-3 md:grid-cols-2">
        <Card className="text-sm"><b>Critical Thinking:</b> use the case's facts and numbers as evidence. One calculation beats three adjectives.</Card>
        <Card className="text-sm"><b>Communication:</b> eye contact, steady pace, no filler words, plain language. Both partners speak about equally.</Card>
        <Card className="text-sm"><b>Decision Making:</b> commit, and name the tradeoff. "We recommend X because… The risk is Y, so we'll Z."</Card>
        <Card className="text-sm"><b>Collaboration & Innovation:</b> smooth handoffs that build on each other, plus one idea the judge hasn't heard all day (see Industry trends).</Card>
      </div>

      <SectionTitle>Four-week plan</SectionTitle>
      <div className="grid gap-3 md:grid-cols-2">
        {STUDY_PLAN.map((w) => (
          <Card key={w.week} className="grid gap-1.5">
            <div className="font-display text-lg font-extrabold">Week {w.week}</div>
            <div className="text-sm"><b>Exam:</b> {w.exam}</div>
            <div className="text-sm"><b>Cases:</b> {w.cases}</div>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <LinkButton to="/cases">Run a case</LinkButton>
        <LinkButton variant="ghost" to="/cases/judge">Drill judge questions</LinkButton>
      </div>

      <SectionTitle>Official sources</SectionTitle>
      <ul className="grid gap-1.5 text-sm">
        {SOURCES.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1">{s.label} <ExternalLink size={13} className="mt-1 shrink-0" aria-hidden /></a>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-muted">DECA's case PDFs are copyrighted and can't be reposted. Read them on deca.org; this app's cases are original.</p>
    </>
  )
}
