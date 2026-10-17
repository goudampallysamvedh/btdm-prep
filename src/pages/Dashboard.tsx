import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, Check, Flame, Target } from 'lucide-react'
import { useStore } from '@/lib/store'
import { areaReadiness, projectedScore, scoreOf } from '@/lib/mastery'
import { dueCards } from '@/lib/srs'
import { daysUntil, streak } from '@/lib/dates'
import { AREAS, AREA_BY_CODE } from '@/data/areas'
import { FLASHCARDS } from '@/data/flashcards'
import { LESSONS } from '@/data/lessons'
import { Bar, Card, Disclosure, LinkButton, Tag, cx, toneFor } from '@/components/ui'

interface Step {
  title: string
  sub: string
  to: string
  done: boolean
}

export default function Dashboard() {
  const settings = useStore((s) => s.settings)
  const tests = useStore((s) => s.tests)
  const activity = useStore((s) => s.activity)
  const leitner = useStore((s) => s.leitner)
  const activeMock = useStore((s) => s.activeMock)
  const partner = useStore((s) => s.partner)
  const caseAttempts = useStore((s) => s.caseAttempts)
  const lessonsDone = useStore((s) => s.lessonsDone)
  const mathStats = useStore((s) => s.mathStats)

  const ready = useMemo(() => areaReadiness(tests), [tests])
  const projected = projectedScore(ready)
  const focus = [...ready].sort((a, b) => b.priority - a.priority).slice(0, 3)
  const days = daysUntil(settings.competitionDate)
  const st = streak(activity)
  const last = [...tests].sort((a, b) => b.finishedAt - a.finishedAt)[0]
  const name = settings.me === 'A' ? settings.partnerA : settings.partnerB

  // ----- Today's plan: three steps, the third rotates through the week -----
  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0)).getTime()
  const due = dueCards(FLASHCARDS.filter((c) => c.deck !== 'pi'), leitner).length
  const cardsToday = Object.values(leitner).filter((s) => (s.last ?? 0) >= startOfDay).length
  const testsToday = tests.filter((t) => t.finishedAt >= startOfDay)
  const weakest = AREA_BY_CODE[focus[0].area]
  const nextLesson = LESSONS.find((l) => !lessonsDone[l.id])

  const steps: Step[] = [
    {
      title: 'Review flashcards',
      sub: cardsToday ? `${cardsToday} reviewed today` : due ? `${due} cards due` : 'Learn a few new cards',
      to: '/cards',
      done: cardsToday >= 10 || (cardsToday > 0 && due === 0),
    },
    {
      title: 'Practice 10 exam questions',
      sub: `Focus: ${weakest.name}`,
      to: `/exam/practice?mode=area&area=${weakest.code}&count=10`,
      done: testsToday.length > 0,
    },
    thirdStep(),
  ]
  const nextStep = steps.find((s) => !s.done)
  const doneCount = steps.filter((s) => s.done).length

  function thirdStep(): Step {
    const dow = new Date().getDay()
    if (dow === 0 || dow === 3)
      return { title: 'Run a case with your partner', sub: '30-minute prep + 15-minute presentation', to: '/cases', done: caseAttempts.some((a) => a.at >= startOfDay) }
    if (dow === 2 || dow === 5)
      return { title: 'Retail math warm-up', sub: 'Five quick problems', to: '/math', done: Object.values(mathStats).some((m) => (m.last ?? 0) >= startOfDay) }
    if (dow === 6)
      return { title: 'Take a timed mock exam', sub: '100 questions, like the real thing', to: '/exam/mock', done: testsToday.some((t) => t.kind === 'mock') }
    return nextLesson
      ? { title: `Lesson: ${nextLesson.title}`, sub: `${nextLesson.minutes} minutes`, to: `/learn/lessons/${nextLesson.id}`, done: Object.values(lessonsDone).some((t) => t >= startOfDay) }
      : { title: 'Drill judge questions', sub: 'Answer five out loud', to: '/cases/judge', done: false }
  }

  return (
    <>
      <header className="mb-4 grid gap-3 animate-rise">
        <h1 className="text-[clamp(1.9rem,7vw,2.8rem)]">
          {greeting()}
          {name !== 'Partner A' && name !== 'Partner B' ? `, ${name}` : ''}
        </h1>
        <div className="flex flex-wrap gap-2 text-sm">
          {days === null ? (
            <Link to="/settings" className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 font-bold no-underline shadow-sm">
              <CalendarDays size={15} aria-hidden /> Set your competition date
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 font-bold shadow-sm">
              <CalendarDays size={15} className="text-accent" aria-hidden />
              {days > 0 ? `${days} days to ${settings.competitionName}` : days === 0 ? `${settings.competitionName} is today` : 'Set your next date'}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 font-bold shadow-sm">
            <Flame size={15} className="text-accent" aria-hidden /> {st}-day streak
          </span>
          <Link to="/progress" className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 font-bold text-ink no-underline shadow-sm">
            <Target size={15} className="text-accent" aria-hidden /> Exam est. {Math.round(projected)}/100
            {partner && <span className="font-normal text-muted"> · team {Math.round((projected + partner.projected) / 2)}</span>}
          </Link>
        </div>
      </header>

      {activeMock && (
        <Card className="mb-4 flex items-center justify-between gap-3 border-accent">
          <span><b>Mock exam in progress</b><span className="block text-sm text-muted">{activeMock.answers.filter((a) => a !== null).length}/100 answered</span></span>
          <LinkButton to="/exam/mock">Resume</LinkButton>
        </Card>
      )}

      <Card className="receipt grid gap-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-xl">Today's plan</h2>
          <span className="num text-sm text-muted">{doneCount}/3 done</span>
        </div>
        <ol className="grid gap-2">
          {steps.map((s, i) => (
            <li key={s.title}>
              <Link
                to={s.to}
                className={cx(
                  'flex min-h-16 items-center gap-3 rounded-xl border px-3 py-2.5 text-ink no-underline transition-colors',
                  s.done ? 'border-transparent bg-good-bg' : s === nextStep ? 'border-accent bg-accent-soft/60' : 'border-line hover:border-accent',
                )}
              >
                <span
                  className={cx('num grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold', s.done ? 'bg-good text-card' : s === nextStep ? 'bg-accent text-accent-ink' : 'bg-paper-2 text-muted')}
                  aria-hidden
                >
                  {s.done ? <Check size={16} /> : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cx('block font-bold', s.done && 'text-muted line-through')}>{s.title}</span>
                  <span className="block truncate text-sm text-muted">{s.sub}</span>
                </span>
                <ArrowRight size={18} className="shrink-0 text-muted" aria-hidden />
                <span className="sr-only">{s.done ? '(done)' : ''}</span>
              </Link>
            </li>
          ))}
        </ol>
        {nextStep ? (
          <LinkButton to={nextStep.to} size="lg" className="w-full whitespace-normal py-2 text-center">
            Start step {steps.indexOf(nextStep) + 1}
          </LinkButton>
        ) : (
          <p className="rounded-xl bg-good-bg px-4 py-3 text-center font-bold text-good">All done for today. Nice work! 🎉</p>
        )}
      </Card>

      <h2 className="mb-2 mt-6 text-lg">Your focus areas</h2>
      <Card className="grid grid-cols-1 gap-1 p-2 sm:p-2">
        {focus.map((r) => {
          const a = AREA_BY_CODE[r.area]
          return (
            <Link key={r.area} to={`/exam/practice?mode=area&area=${a.code}&count=10`} className="flex min-h-14 items-center gap-3 rounded-xl px-2 py-2 text-ink no-underline hover:bg-paper-2">
              <Tag>{a.code}</Tag>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold">{a.name}</span>
                <span className="block truncate text-xs text-muted">{a.weight} exam questions · {r.answered ? `${Math.round(r.accuracy * 100)}% right` : 'not started'}</span>
              </span>
              <span className="text-sm font-bold text-accent">Practice</span>
            </Link>
          )
        })}
      </Card>

      <div className="mt-4 grid gap-3">
        <Disclosure title="Readiness by area" hint="How ready you are in all 20 exam areas">
          <BlueprintStrip ready={ready} />
        </Disclosure>
        {last && (
          <Link to={`/progress/test/${last.id}`} className="card flex min-h-14 items-center justify-between gap-3 px-4 py-3 text-ink no-underline hover:border-accent">
            <span className="min-w-0">
              <span className="block font-bold">Last report: {last.title}</span>
              <span className="text-sm text-muted">What you learned and what to study next</span>
            </span>
            <span className="num text-lg font-bold">{Math.round(scoreOf(last) * 100)}%</span>
          </Link>
        )}
      </div>
    </>
  )
}

function greeting(): string {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

function BlueprintStrip({ ready }: { ready: ReturnType<typeof areaReadiness> }) {
  return (
    <div className="grid gap-3">
      <p className="text-sm text-muted">Each block's width is the area's share of the 100-question exam; the fill is your accuracy. Tap a block to practice it.</p>
      <div className="flex h-14 w-full overflow-hidden rounded-xl border border-line" role="list" aria-label="Readiness by exam area">
        {AREAS.map((a) => {
          const r = ready.find((x) => x.area === a.code)!
          const fill = r.answered ? r.accuracy : 0
          return (
            <Link
              key={a.code}
              role="listitem"
              to={`/exam/practice?mode=area&area=${a.code}&count=10`}
              className="relative border-r border-card no-underline last:border-r-0"
              style={{ width: `${a.weight}%` }}
              aria-label={`${a.name}: ${a.weight} questions, ${r.answered ? Math.round(fill * 100) + '% accuracy' : 'not started'}`}
            >
              <span className="absolute inset-0 bg-paper-2" />
              <span
                className={cx('absolute inset-x-0 bottom-0 transition-[height] duration-700', fill >= 0.75 ? 'bg-good' : fill >= 0.55 ? 'bg-warn' : 'bg-bad')}
                style={{ height: `${fill * 100}%`, opacity: r.answered ? 0.85 : 0 }}
              />
              {a.weight >= 4 && <span className="num absolute inset-x-0 top-1 text-center text-[0.65rem] font-bold text-ink">{a.code}</span>}
            </Link>
          )
        })}
      </div>
      <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {AREAS.map((a) => {
          const r = ready.find((x) => x.area === a.code)!
          return (
            <li key={a.code} className="grid grid-cols-[2.8rem_1fr_2.8rem] items-center gap-2 text-sm">
              <Tag>{a.code}</Tag>
              <Bar value={r.answered ? r.accuracy : 0} tone={toneFor(r.accuracy)} label={`${a.name} accuracy`} />
              <span className="num text-right text-xs text-muted">{r.answered ? `${Math.round(r.accuracy * 100)}%` : '—'}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
