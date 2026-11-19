import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import { Bar, LinkButton, PageHeader, cx } from '@/components/ui'
import { LESSONS } from '@/data/lessons'
import { TRENDS } from '@/data/trends'
import { useStore } from '@/lib/store'

/** One line in a ruled list: title, grey summary, an optional trailing note or check. */
function Row({ to, title, sub, end }: { to: string; title: string; sub: string; end?: ReactNode }) {
  return (
    <li>
      <Link to={to} className="group flex min-h-14 items-center gap-4 py-3 text-ink no-underline">
        <span className="min-w-0 flex-1">
          <span className="block font-medium group-hover:underline group-hover:decoration-line-2 group-hover:underline-offset-4">{title}</span>
          <span className="block text-sm text-muted">{sub}</span>
        </span>
        {end}
        <ArrowRight size={16} strokeWidth={1.75} aria-hidden className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
      </Link>
    </li>
  )
}

function Section({ title, aside, className, children }: { title: string; aside?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <section className={cx('grid content-start gap-1', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[0.95rem]">{title}</h2>
        {aside && <span className="num text-sm text-muted">{aside}</span>}
      </div>
      {children}
    </section>
  )
}

const Rules = ({ children }: { children: ReactNode }) => <ul className="divide-y divide-line border-t border-line">{children}</ul>

export default function LearnHub() {
  const done = useStore((s) => s.lessonsDone)
  const read = useStore((s) => s.trendsRead)
  const lessonsDone = LESSONS.filter((l) => done[l.id]).length
  const trendsRead = TRENDS.filter((t) => read[t.id]).length
  const upNext = LESSONS.filter((l) => !done[l.id]).slice(0, 3)
  const newest = TRENDS.slice(0, 3)

  return (
    <>
      <PageHeader title="Learn">The study guide, performance indicators, lessons and current trends, in the order most people use them.</PageHeader>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-x-4 gap-y-10 md:grid-cols-12">
        {/* The lead: the study guide is where most study starts. */}
        <section className="card grid content-between gap-8 p-5 sm:p-6 md:col-span-7 md:min-h-[17rem]">
          <div className="grid gap-3">
            <h2 className="font-display text-[clamp(1.9rem,4vw,2.5rem)] font-normal leading-[1.05] tracking-[-0.015em]">Exam study guide</h2>
            <p className="max-w-[46ch] text-muted">The 20 exam areas, most-tested first, with the terms and ideas each one expects you to know.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <LinkButton to="/learn/guide" icon={<ArrowRight size={17} aria-hidden />} className="flex-row-reverse">Open the guide</LinkButton>
          </div>
        </section>

        <Section title="Reference" className="md:col-span-5">
          <Rules>
            <Row to="/learn/pis" title="PI guide" sub="All 450 performance indicators, explained" />
            <Row to="/learn/visual" title="Visual guide" sub="Tap-through diagrams of key ideas" />
            <Row to="/learn/playbook" title="How BTDM works" sub="Rules, scoring, and how to win the case" />
          </Rules>
        </Section>

        <Section title="Lessons" aside={`${lessonsDone} of ${LESSONS.length} done`} className="md:col-span-7">
          <Bar value={lessonsDone / LESSONS.length} label="Lessons completed" className="mb-2" />
          <Rules>
            {upNext.map((l) => (
              <Row key={l.id} to={`/learn/lessons/${l.id}`} title={l.title} sub={`${l.group === 'case' ? 'Case skills' : 'Buying & merch'} · ${l.minutes} min`} />
            ))}
            <Row
              to="/learn/lessons"
              title={upNext.length ? 'All lessons' : 'All lessons, done'}
              sub="Case skills and buying & merchandising"
              end={!upNext.length ? <Check size={16} strokeWidth={1.75} className="text-good" aria-hidden /> : undefined}
            />
          </Rules>
        </Section>

        <Section title="Practice skills" className="md:col-span-5">
          <Rules>
            <Row to="/math" title="Retail math lab" sub="Calculators and endless problems" />
            <Row to="/cases/judge" title="Judge question drill" sub="Answer out loud in 45 seconds" />
          </Rules>
        </Section>

        <Section title="Industry trends" aside={`${trendsRead} of ${TRENDS.length} read`} className="md:col-span-7">
          <Rules>
            {newest.map((t) => (
              <Row
                key={t.id}
                to={`/learn/trends/${t.id}`}
                title={t.title}
                sub={t.kicker}
                end={read[t.id] ? <Check size={16} strokeWidth={1.75} className="text-good" aria-label="Read" /> : undefined}
              />
            ))}
            <Row to="/learn/trends" title="All trends" sub="Updated weekly, with lines to use in a case" />
          </Rules>
        </Section>

        <Section title="Watch" className="md:col-span-5">
          <Rules>
            <Row to="/learn/videos" title="Videos" sub="Role-play examples and explainers" />
          </Rules>
        </Section>
      </div>
    </>
  )
}
