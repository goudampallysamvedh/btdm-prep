import { Link } from 'react-router-dom'
import { TOOLS } from './tools'
import { MathPractice } from './MathPractice'
import { PageHeader, SectionTitle } from '@/components/ui'

export default function MathLab() {
  const groups = [...new Set(TOOLS.map((t) => t.group))]
  return (
    <>
      <PageHeader title="Retail math lab">
        Practice problems with step-by-step answers, plus calculators for every formula.
      </PageHeader>

      <MathPractice />

      <p className="mt-3 text-sm text-muted">Tip: BTDM cases need little math. One number (a margin or a sell-through goal) is enough to back up your idea.</p>

      {groups.map((g) => (
        <section key={g}>
          <SectionTitle>{g}</SectionTitle>
          <ul className="grid gap-3 sm:grid-cols-2">
            {TOOLS.filter((t) => t.group === g).map((t) => (
              <li key={t.id}>
                <Link to={`/math/${t.id}`} className="card grid h-full gap-2 p-4 text-ink no-underline transition-colors hover:border-accent">
                  <span className="font-display text-lg font-extrabold" style={{ fontStretch: '108%' }}>{t.title}</span>
                  <span className="text-sm text-muted">{t.blurb}</span>
                  <span className="num mt-1 text-xs text-ink-2">{t.formulas[0].name} = {t.formulas[0].f}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  )
}
