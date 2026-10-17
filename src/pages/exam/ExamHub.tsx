import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Clock, RotateCcw, Calculator, Shuffle, Sparkles } from 'lucide-react'
import { useStore } from '@/lib/store'
import { AREAS } from '@/data/areas'
import { QUESTIONS } from '@/data/questions'
import { areaReadiness, missedQuestionIds, scoreOf } from '@/lib/mastery'
import { fmtDate } from '@/lib/dates'
import { OfficialExams } from './OfficialExams'
import { Bar, Button, Card, Disclosure, PageHeader, Segmented, Tag, toneFor } from '@/components/ui'

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

      <Card className="grid gap-4 border-accent">
        <div className="flex items-center gap-2">
          <Sparkles size={22} className="text-accent" aria-hidden />
          <h2 className="text-xl">Quick practice</h2>
        </div>
        <p className="text-muted">Questions picked from the areas you need most. You see the answer right after each one.</p>
        <Button size="lg" onClick={() => nav(`/exam/practice?mode=smart&count=${count}`)}>
          Start {count} questions
        </Button>
        <div className="flex items-center justify-center gap-2 text-sm text-muted">
          <span>How many?</span>
          <Segmented label="Number of questions" value={count} onChange={setCount} options={[{ value: '10', label: '10' }, { value: '20', label: '20' }, { value: '30', label: '30' }]} />
        </div>
      </Card>

      <h2 className="mb-2 mt-6 text-lg">Other ways to practice</h2>
      <Card className="grid grid-cols-1 gap-1 p-2 sm:p-2">
        {more.map(({ to, icon: Icon, title, sub }) => (
          <Link key={title} to={to} className="flex min-h-14 items-center gap-3 rounded-xl px-2 py-2 text-ink no-underline hover:bg-paper-2">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-paper-2 text-accent" aria-hidden><Icon size={20} /></span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">{title}</span>
              <span className="block text-sm text-muted">{sub}</span>
            </span>
            <ChevronRight size={18} className="text-muted" aria-hidden />
          </Link>
        ))}
      </Card>

      <div className="mt-4 grid gap-3">
        <Disclosure title="Practice one area" hint="Choose any of the 20 exam areas">
          <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {AREAS.map((a) => {
              const r = ready.find((x) => x.area === a.code)!
              const n = QUESTIONS.filter((q) => q.area === a.code).length
              return (
                <li key={a.code}>
                  <Link to={`/exam/practice?mode=area&area=${a.code}&count=${Math.min(10, n)}`} className="flex min-h-14 items-center gap-3 rounded-xl px-2 py-2 text-ink no-underline hover:bg-paper-2">
                    <Tag>{a.code}</Tag>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{a.name}</span>
                      <Bar value={r.answered ? r.accuracy : 0} tone={toneFor(r.accuracy)} className="mt-1" label={`${a.name} readiness`} />
                    </span>
                    <span className="num w-10 text-right text-xs text-muted">{r.answered ? `${Math.round(r.accuracy * 100)}%` : '—'}</span>
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
            <ul className="grid gap-1">
              {recent.map((t) => (
                <li key={t.id}>
                  <Link to={`/progress/test/${t.id}`} className="flex min-h-12 items-center gap-3 rounded-xl px-2 py-2 text-ink no-underline hover:bg-paper-2">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold">{t.title}</span>
                      <span className="text-xs text-muted">{fmtDate(t.finishedAt)} · {t.answers.length} questions</span>
                    </span>
                    <span className="num font-bold">{Math.round(scoreOf(t) * 100)}%</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="/progress" className="mt-2 inline-block text-sm font-bold">All progress →</Link>
          </Disclosure>
        )}
      </div>
    </>
  )
}
