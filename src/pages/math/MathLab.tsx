import { Link } from 'react-router-dom'
import { TOOLS } from './tools'
import { MathPractice } from './MathPractice'
import { DailyGoal } from '@/components/DailyGoal'
import { PageHeader, SectionTitle } from '@/components/ui'

export default function MathLab() {
  const groups = [...new Set(TOOLS.map((t) => t.group))]
  return (
    <>
      <PageHeader title="Retail math lab">
        Practice problems with step-by-step answers, plus calculators for every formula.
      </PageHeader>

      <DailyGoal kind="math" />
      <MathPractice />

      <p className="mt-4 text-sm text-muted">Tip: BTDM cases need little math. One number (a margin or a sell-through goal) is enough to back up your idea.</p>

      {groups.map((g) => (
        <section key={g}>
          <SectionTitle>{g}</SectionTitle>
          <ul className="grid gap-x-10 divide-y divide-line border-t border-line md:grid-cols-2 md:divide-y-0">
            {TOOLS.filter((t) => t.group === g).map((t) => (
              <li key={t.id} className="border-b border-line">
                <Link to={`/math/${t.id}`} className="group grid min-h-16 gap-0.5 py-3.5 text-ink no-underline">
                  <span className="font-medium group-hover:underline group-hover:decoration-line-2 group-hover:underline-offset-4">{t.title}</span>
                  <span className="text-sm text-muted">{t.blurb}</span>
                  <span className="num text-xs text-muted">{t.formulas[0].name} = {t.formulas[0].f}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  )
}
