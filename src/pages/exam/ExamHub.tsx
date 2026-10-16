import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Clock, RotateCcw, Sparkles, Calculator, Shuffle } from 'lucide-react'
import { useStore } from '@/lib/store'
import { AREAS } from '@/data/areas'
import { QUESTIONS } from '@/data/questions'
import { areaReadiness, missedQuestionIds, scoreOf } from '@/lib/mastery'
import { fmtDate } from '@/lib/dates'
import { Bar, Button, Card, LinkButton, PageHeader, Pill, SectionTitle, Segmented, Tag, toneFor } from '@/components/ui'

const kindLabel = { practice: 'Practice', mock: 'Mock exam', missed: 'Missed review', area: 'Area practice', math: 'Math practice', 'case-quiz': 'Case quiz' }

export default function ExamHub() {
  const tests = useStore((s) => s.tests)
  const activeMock = useStore((s) => s.activeMock)
  const [count, setCount] = useState<'10' | '20' | '30'>('20')
  const nav = useNavigate()
  const ready = useMemo(() => areaReadiness(tests), [tests])
  const missed = useMemo(() => missedQuestionIds(tests), [tests])
  const recent = [...tests].sort((a, b) => b.finishedAt - a.finishedAt).slice(0, 6)
  const mathCount = QUESTIONS.filter((q) => q.math).length

  return (
    <>
      <PageHeader eyebrow="Marketing Cluster Exam" title="Exam trainer">
        {QUESTIONS.length} original questions in DECA style, weighted to the blueprint. Options are shuffled every time, so you learn the idea, not the letter.
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="grid content-start gap-3">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-accent" aria-hidden />
            <h2 className="text-xl">Smart practice</h2>
          </div>
          <p className="text-sm text-muted">Picks questions from your weakest, highest-weight areas and the topics you still need. Instant feedback after each answer.</p>
          <div className="flex flex-wrap items-center gap-3">
            <Segmented label="Number of questions" value={count} onChange={setCount} options={[{ value: '10', label: '10' }, { value: '20', label: '20' }, { value: '30', label: '30' }]} />
            <Button onClick={() => nav(`/exam/practice?mode=smart&count=${count}`)}>Start</Button>
          </div>
        </Card>

        <Card className="grid content-start gap-3">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-accent" aria-hidden />
            <h2 className="text-xl">Timed mock exam</h2>
          </div>
          <p className="text-sm text-muted">100 questions drawn to match the blueprint exactly. No feedback until you submit, then a full review and report.</p>
          <div className="flex flex-wrap gap-2">
            {activeMock ? (
              <>
                <LinkButton to="/exam/mock">Resume ({activeMock.answers.filter((a) => a !== null).length}/100)</LinkButton>
                <Button variant="ghost" onClick={() => { if (confirm('Discard the mock exam in progress?')) useStore.getState().setActiveMock(null) }}>Discard</Button>
              </>
            ) : (
              <LinkButton to="/exam/mock">Set up a mock</LinkButton>
            )}
          </div>
        </Card>

        <Card className="grid content-start gap-3">
          <div className="flex items-center gap-2">
            <RotateCcw size={20} className="text-accent" aria-hidden />
            <h2 className="text-xl">Missed-question review</h2>
          </div>
          <p className="text-sm text-muted">Every question you got wrong most recently. Get it right and it leaves the list.</p>
          <div className="flex flex-wrap items-center gap-3">
            <Pill tone={missed.length ? 'bad' : 'good'}>{missed.length} to fix</Pill>
            {missed.length ? (
              <LinkButton to={`/exam/practice?mode=missed&count=${Math.min(30, missed.length)}`}>Review misses</LinkButton>
            ) : (
              <Button variant="ghost" disabled>Nothing to review</Button>
            )}
          </div>
        </Card>

        <Card className="grid content-start gap-3">
          <div className="flex items-center gap-2">
            <Calculator size={20} className="text-accent" aria-hidden />
            <h2 className="text-xl">Math & mixed</h2>
          </div>
          <p className="text-sm text-muted">{mathCount} calculation questions (four-function calculator allowed), or a random mix from the whole bank.</p>
          <div className="flex flex-wrap gap-2">
            <LinkButton to={`/exam/practice?mode=math&count=${Math.min(10, mathCount)}`} variant="ghost">Math set</LinkButton>
            <LinkButton to="/exam/practice?mode=all&count=20" variant="ghost" icon={<Shuffle size={16} aria-hidden />}>Random 20</LinkButton>
          </div>
        </Card>
      </div>

      <SectionTitle aside={<span className="text-sm text-muted">Tap an area to practice it</span>}>Practice by area</SectionTitle>
      <ul className="grid gap-2 sm:grid-cols-2">
        {AREAS.map((a) => {
          const r = ready.find((x) => x.area === a.code)!
          const n = QUESTIONS.filter((q) => q.area === a.code).length
          return (
            <li key={a.code}>
              <Link
                to={`/exam/practice?mode=area&area=${a.code}&count=${Math.min(10, n)}`}
                className="card flex min-h-16 items-center gap-3 px-4 py-3 text-ink no-underline transition-colors hover:border-accent"
              >
                <Tag>{a.code}</Tag>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{a.name}</span>
                  <span className="text-xs text-muted">
                    {a.weight} on exam · {n} in bank · {r.answered ? `${Math.round(r.accuracy * 100)}% est.` : 'not started'}
                  </span>
                  <Bar value={r.answered ? r.accuracy : 0} tone={toneFor(r.accuracy)} className="mt-1.5" label={`${a.name} readiness`} />
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      {recent.length > 0 && (
        <>
          <SectionTitle aside={<Link to="/progress" className="text-sm font-bold">All progress →</Link>}>Recent tests</SectionTitle>
          <ul className="grid gap-2">
            {recent.map((t) => (
              <li key={t.id}>
                <Link to={`/progress/test/${t.id}`} className="card flex items-center gap-3 px-4 py-3 text-ink no-underline hover:border-accent">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{t.title}</span>
                    <span className="text-xs text-muted">{kindLabel[t.kind]} · {fmtDate(t.finishedAt)} · {t.answers.length} questions</span>
                  </span>
                  <span className="num text-lg font-bold">{Math.round(scoreOf(t) * 100)}%</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}
