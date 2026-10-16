import { Link } from 'react-router-dom'
import { TOOLS } from './tools'
import { MathPractice } from './MathPractice'
import { Callout, PageHeader, SectionTitle } from '@/components/ui'

export default function MathLab() {
  const groups = [...new Set(TOOLS.map((t) => t.group))]
  return (
    <>
      <PageHeader eyebrow="Four-function calculator allowed" title="Retail math lab">
        Calculators that show every step, plus endless practice problems. One well-placed number (a margin, a sell-through goal, a break-even) makes a case solution feel effective.
      </PageHeader>

      <MathPractice />

      <div className="mt-4">
        <Callout tone="info" title="How much math is in BTDM?">
          Recent BTDM cases are mostly strategy, with little required math, and the exam has only a handful of calculation questions. Use math here to back up your recommendation, not to fill your 15 minutes.
        </Callout>
      </div>

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
