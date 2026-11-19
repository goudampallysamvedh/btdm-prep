import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronRight, Clock, RotateCcw, Calculator, Shuffle } from 'lucide-react'
import { useStore } from '@/lib/store'
import { AREAS } from '@/data/areas'
import { QUESTIONS } from '@/data/questions'
import { areaReadiness, missedQuestionIds, scoreOf } from '@/lib/mastery'
import { fmtDate } from '@/lib/dates'
import { OfficialExams } from './OfficialExams'
import { Bar, Button, Disclosure, PageHeader, Segmented, Tag } from '@/components/ui'

export default function ExamHub() {
  const tests = useStore((s) => s.tests)
  const activeMock = useStore((s) => s.activeMock)
  const [count, setCount] = useState<'10' | '20' | '30'>('10')
  const nav = useNavigate()
  const ready = useMemo(() => areaReadiness(tests), [tests])
  const missed = useMemo(() => missedQuestionIds(tests), [tests])
  const recent = [...tests].sort((a, b) => b.finishedAt - a.finishedAt).slice(0, 3)
  const mathCount = QUESTIONS.filter((q) => q.math).length

  const more = [
    activeMock
      ? { to: '/exam/mock', icon: Clock, title: 'Resume mock exam', sub: `${activeMock.answers.filter((a) => a !== null).length} of 100 answered` }
      : { to: '/exam/mock', icon: Clock, title: 'Timed mock exam', sub: '100 questions, like the real test' },
    missed.length
      ? { to: `/exam/practice?mode=missed&count=${Math.min(30, missed.length)}`, icon: RotateCcw, title: 'Fix my mistakes', sub: `${missed.length} question${missed.length === 1 ? '' : 's'} you missed` }
      : null,
    { to: `/exam/practice?mode=math&count=${Math.min(10, mathCount)}`, icon: Calculator, title: 'Math questions', sub: 'Calculator practice' },
    { to: '/exam/practice?mode=all&count=20', icon: Shuffle, title: 'Random mix', sub: '20 questions from anywhere' },
  ].filter(Boolean) as { to: string; icon: typeof Clock; title: string; sub: string }[]

  return (
    <>
      <PageHeader title="Exam practice">Practice for the 100-question Marketing Cluster Exam.</PageHeader>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-12">
        {/* The one main action. */}
        <section className="card grid content-between gap-8 p-6 sm:p-8 md:col-span-7" aria-labelledby="quick-h">
          <div className="grid gap-2">
            <h2 id="quick-h" className="text-xl">Quick practice</h2>
            <p className="max-w-[44ch] text-muted">Questions picked from the areas you need most. You see the answer right after each one.</p>
          </div>
          <div className="grid gap-5">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
              <p className="flex items-baseline gap-2">
                <span className="num text-[clamp(3.5rem,8vw,5rem)] font-normal leading-none">{count}</span>
                <span className="text-lg text-muted">questions</span>
              </p>
              <div className="flex items-center gap-2 text-sm text-muted">
                <span>How many?</span>
                <Segmented label="Number of questions" value={count} onChange={setCount} options={[{ value: '10', label: '10' }, { value: '20', label: '20' }, { value: '30', label: '30' }]} />
              </div>
            </div>
            <Button size="lg" className="w-full" onClick={() => nav(`/exam/practice?mode=smart&count=${count}`)}>
              Start {count} questions
            </Button>
          </div>
        </section>

        {/* Other modes: a quiet list with rules. */}
        <section className="md:col-span-5" aria-labelledby="more-h">
          <h2 id="more-h" className="mb-1 text-[0.95rem]">Other ways to practice</h2>
          <ul className="divide-y divide-line border-y border-line">
            {more.map(({ to, icon: Icon, title, sub }) => (
              <li key={title}>
                <Link to={to} className="group flex min-h-16 items-center gap-3 py-3 text-ink no-underline">
                  <Icon size={18} strokeWidth={1.75} className="shrink-0 text-muted" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{title}</span>
                    <span className="block text-sm text-muted">{sub}</span>
                  </span>
                  <ChevronRight size={18} strokeWidth={1.75} className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-10 grid gap-4">
        <Disclosure title="Practice one area" hint="Choose any of the 20 exam areas">
          <ul className="grid grid-cols-[minmax(0,1fr)] gap-x-8 sm:grid-cols-2">
            {AREAS.map((a) => {
              const r = ready.find((x) => x.area === a.code)!
              const n = QUESTIONS.filter((q) => q.area === a.code).length
              return (
                <li key={a.code} className="border-t border-line first:border-t-0 sm:[&:nth-child(2)]:border-t-0">
                  <Link to={`/exam/practice?mode=area&area=${a.code}&count=${Math.min(10, n)}`} className="flex min-h-14 items-center gap-3 py-2 text-ink no-underline">
                    <Tag>{a.code}</Tag>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{a.name}</span>
                      <Bar value={r.answered ? r.accuracy : 0} className="mt-1.5 !h-1" label={`${a.name} readiness`} />
                    </span>
                    <span className="num w-10 text-right text-sm text-muted">{r.answered ? `${Math.round(r.accuracy * 100)}%` : '—'}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </Disclosure>

        <Disclosure title="Official DECA sample exam" hint="Take the real one on paper and log your score">
          <OfficialExams bare />
        </Disclosure>

        {recent.length > 0 && (
          <Disclosure title="Recent results" hint={`Last: ${recent[0].title}, ${Math.round(scoreOf(recent[0]) * 100)}%`}>
            <ul className="divide-y divide-line border-t border-line">
              {recent.map((t) => (
                <li key={t.id}>
                  <Link to={`/progress/test/${t.id}`} className="flex min-h-14 items-center gap-3 py-2 text-ink no-underline">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{t.title}</span>
                      <span className="text-xs text-muted">{fmtDate(t.finishedAt)} · {t.answers.length} questions</span>
                    </span>
                    <span className="num text-lg">{Math.round(scoreOf(t) * 100)}<span className="text-sm text-muted">%</span></span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="/progress" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink">
              All progress <ArrowRight size={16} strokeWidth={1.75} aria-hidden />
            </Link>
          </Disclosure>
        )}
      </div>
    </>
  )
}
