import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, ArrowUpRight, Check, Users } from 'lucide-react'
import { useStore } from '@/lib/store'
import { areaReadiness, projectedScore, scoreOf } from '@/lib/mastery'
import { buildPlan, planMinutes, type PlanStep } from '@/lib/today'
import { dayKey, daysUntil, relTime, streak } from '@/lib/dates'
import { AREA_BY_CODE } from '@/data/areas'
import { Bar, LinkButton, cx, toneFor } from '@/components/ui'
import { Confetti } from '@/components/Confetti'
import { NumberTicker } from '@/components/fx/NumberTicker'
import { BadgeShelf, LevelPanel, useProgression } from '@/components/LevelCard'
import { Planogram, PlanogramKey, expectedRight } from '@/components/Planogram'

/*
  Home answers one question: "What do I study now, and how ready am I?"
  Grid: a 12-column column (77px columns, 16px gutters = 1100px). Rows span 3/3/3/3 (the figures),
  then 9 + 3 (the plan and the level), then 12 (the exam planogram), then 6 + 6 (badges, teammate),
  so every internal edge meets one above it.
*/
export default function Dashboard() {
  const settings = useStore((s) => s.settings)
  const tests = useStore((s) => s.tests)
  const planDone = useStore((s) => s.planDone)
  const activeMock = useStore((s) => s.activeMock)
  const partner = useStore((s) => s.partner)
  const lessonsDone = useStore((s) => s.lessonsDone)
  const trendsRead = useStore((s) => s.trendsRead)
  const progression = useProgression()

  const ready = useMemo(() => areaReadiness(tests), [tests])
  const projected = Math.round(projectedScore(ready))
  const byPriority = [...ready].sort((a, b) => b.priority - a.priority)
  const weakest = byPriority.slice(0, 4)
  const untried = ready.filter((r) => !r.answered)
  const practiced = ready.filter((r) => r.answered).reduce((t, r) => ({ right: t.right + expectedRight(r), weight: t.weight + r.weight }), { right: 0, weight: 0 })
  const days = daysUntil(settings.competitionDate)
  const st = streak(planDone)
  const doneToday = !!planDone[dayKey(new Date())]
  const last = [...tests].sort((a, b) => b.finishedAt - a.finishedAt)[0]
  const name = settings.me === 'A' ? settings.partnerA : settings.partnerB
  const hasName = name !== 'Partner A' && name !== 'Partner B'

  // ----- Today's plan: three or four steps. Finishing it grows the streak. -----
  const counts = useStore((s) => s.daily[dayKey(new Date())]) ?? {}
  const steps = buildPlan({ counts, focusArea: byPriority[0].area, lessonsDone, trendsRead })
  const nextStep = steps.find((s) => !s.done)
  const doneCount = steps.filter((s) => s.done).length
  const celebrate = useCelebrateOnce(!nextStep)

  // The one finding, read first under the greeting.
  const weakestTried = ready.filter((r) => r.answered >= 5).sort((a, b) => a.accuracy - b.accuracy)[0]
  const finding = activeMock
    ? `Your mock exam is waiting: ${activeMock.answers.filter((a) => a !== null).length} of 100 answered.`
    : !nextStep
      ? `Today's plan is done, and your streak is ${st} day${st === 1 ? '' : 's'}.`
      : weakestTried && weakestTried.accuracy < 0.7
        ? `${AREA_BY_CODE[weakestTried.area].name} is your weakest area, at ${Math.round(weakestTried.accuracy * 100)}%.`
        : `Today's plan takes about ${planMinutes(steps.length)} minutes.`

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-12">
      <header className="mb-4 grid gap-3 md:col-span-12 md:mb-6 md:grid-cols-[1fr_auto] md:items-end">
        <div className="grid gap-2">
          <h1 className="text-[clamp(2.5rem,6vw,3.5rem)]">
            {greeting()}
            {hasName ? `, ${name}.` : '.'}
          </h1>
          <p className="text-[0.95rem] text-muted">
            <span className="text-ink-2">{longDate()}</span> · {finding}
          </p>
        </div>
        {activeMock ? (
          <LinkButton to="/exam/mock" className="md:justify-self-end">Resume mock exam</LinkButton>
        ) : nextStep ? (
          <LinkButton to={nextStep.to} icon={<ArrowRight size={17} aria-hidden />} className="flex-row-reverse md:justify-self-end">
            Start step {steps.indexOf(nextStep) + 1}
          </LinkButton>
        ) : null}
      </header>

      {/* The figures: one divided strip, regular weight, no icons. */}
      <section aria-label="Your numbers" className="card grid grid-cols-2 gap-px overflow-hidden bg-line p-0 md:col-span-12 md:grid-cols-4">
        <Figure label="Exam estimate" value={projected} unit="/100" to="/progress">
          {partner ? `Team average ${Math.round((projected + partner.projected) / 2)}` : untried.length ? `${untried.length} areas not tried count at 50%` : 'From your recent answers'}
        </Figure>
        <Figure label="Streak" value={st} unit={st === 1 ? 'day' : 'days'}>
          {doneToday ? 'Today counts' : st > 0 ? "Finish today's plan to keep it" : "Finish today's plan to start one"}
        </Figure>
        {days === null || days < 0 ? (
          <Figure label="Competition" value={null} to="/settings">
            <span className="text-ink underline decoration-line-2 underline-offset-2">Set the date</span> to count down
          </Figure>
        ) : (
          <Figure label={settings.competitionName} value={days} unit={days === 1 ? 'day' : 'days'}>
            {days === 0 ? 'It’s today. Good luck.' : 'until you compete'}
          </Figure>
        )}
        <Figure label="Today" value={doneCount} unit={`of ${steps.length} steps`}>
          {nextStep ? `About ${planMinutes(steps.length)} min in all` : 'All done'}
        </Figure>
      </section>

      {/* The plan: the screen's main job. */}
      <section className="card relative grid grid-cols-[minmax(0,1fr)] content-start gap-4 p-5 md:col-span-9 md:p-6" aria-labelledby="plan-h">
        {celebrate && <Confetti />}
        <div className="grid gap-1">
          <h2 id="plan-h" className="text-[0.95rem]">Today’s plan</h2>
          <p className="text-sm text-muted">
            {nextStep
              ? `Finish all ${steps.length === 4 ? 'four' : 'three'} to ${st > 0 ? `make your streak ${st + 1} days` : 'start a streak'}.`
              : 'Done for today. A case with your partner or a mock exam is good extra practice.'}
          </p>
        </div>
        <ol className="grid gap-2">
          {steps.map((s, i) => (
            <PlanRow key={s.title} step={s} n={i + 1} next={s === nextStep} />
          ))}
        </ol>
      </section>

      <LevelPanel p={progression} className="md:col-span-3" />

      {/* The exam, as a planogram: the signature of this screen. */}
      <section className="card grid gap-6 p-5 md:col-span-12 md:grid-cols-[1fr_300px] md:gap-10 md:p-6" aria-labelledby="exam-h">
        <div className="grid content-start gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 id="exam-h" className="text-[0.95rem]">Your exam, question by question</h2>
            <PlanogramKey />
          </div>
          <p className="max-w-[62ch] text-sm text-muted">
            The 100 questions of the Marketing Cluster Exam, shelved by area like a planogram: one square per question, each area as wide as its share of the exam.{' '}
            {practiced.weight ? (
              <>
                At your current accuracy you’d get about <b className="num font-semibold text-ink">{practiced.right}</b> of the <span className="num">{practiced.weight}</span> questions in areas you’ve practiced right.
              </>
            ) : (
              'Practice an area and its shelf fills in.'
            )}
          </p>
          <Planogram ready={ready} />
        </div>
        <div className="grid content-start gap-3">
          <h3 className="text-[0.95rem]">Work on these next</h3>
          <ul className="grid gap-1">
            {weakest.map((r) => {
              const a = AREA_BY_CODE[r.area]
              return (
                <li key={r.area}>
                  <Link to={`/exam/practice?mode=area&area=${a.code}&count=10`} className="group grid gap-1.5 rounded-xl px-2 py-2.5 text-ink no-underline transition-colors hover:bg-paper">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="min-w-0 truncate text-sm font-medium">{a.name}</span>
                      <span className="num shrink-0 text-sm text-muted">{r.answered ? `${Math.round(r.accuracy * 100)}%` : '—'}</span>
                    </span>
                    <Bar value={r.answered ? r.accuracy : 0} tone={r.answered ? toneFor(r.accuracy) : 'accent'} label={`${a.name} accuracy`} />
                    <span className="flex items-center justify-between text-xs text-muted">
                      <span className="num">{a.weight} exam questions{r.answered ? '' : ' · not tried'}</span>
                      <span className="inline-flex items-center gap-0.5 font-medium text-ink opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                        Practice <ArrowUpRight size={13} aria-hidden />
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <BadgeShelf p={progression} className="md:col-span-6" />

      <div className="grid content-start gap-4 md:col-span-6">
        <WeekStrip />
        <PartnerCard />
        {last && (
          <Link to={`/progress/test/${last.id}`} className="card lift flex items-center justify-between gap-4 p-5 text-ink no-underline">
            <span className="min-w-0">
              <span className="block text-[0.95rem] font-semibold">Last test: {last.title}</span>
              <span className="block text-sm text-muted">{relTime(last.finishedAt)} · what to study next</span>
            </span>
            <span className="num shrink-0 text-2xl">{Math.round(scoreOf(last) * 100)}%</span>
          </Link>
        )}
      </div>
    </div>
  )
}

/** One cell of the figures strip: label, value at regular weight, one plain caption. */
function Figure({ label, value, unit, to, children }: { label: string; value: number | null; unit?: string; to?: string; children: ReactNode }) {
  const body = (
    <>
      <span className="truncate text-sm text-muted">{label}</span>
      <span className="flex items-baseline gap-1.5">
        {value === null ? (
          <span className="text-[2rem] leading-none text-muted">—</span>
        ) : (
          <>
            <NumberTicker value={value} className="text-[2rem] leading-none text-ink" />
            {unit && <span className="text-sm text-muted">{unit}</span>}
          </>
        )}
      </span>
      <span className="text-xs leading-snug text-muted">{children}</span>
    </>
  )
  const cls = 'grid content-start gap-2 bg-card p-4 text-ink no-underline sm:p-5'
  return to ? <Link to={to} className={cls + ' transition-colors hover:bg-paper-2'}>{body}</Link> : <div className={cls}>{body}</div>
}

function PlanRow({ step: s, n, next }: { step: PlanStep; n: number; next: boolean }) {
  const partial = s.progress && !s.done && s.progress.have > 0
  return (
    <li>
      <Link
        to={s.to}
        className={cx(
          'group flex min-h-16 items-center gap-4 rounded-2xl border px-4 py-3 text-ink no-underline transition-colors active:scale-[0.995]',
          s.done ? 'border-transparent bg-transparent' : next ? 'border-ink/80 bg-paper' : 'border-line bg-paper hover:border-line-2',
        )}
      >
        <span
          className={cx(
            'num grid size-8 shrink-0 place-items-center rounded-full text-sm',
            s.done ? 'bg-accent text-accent-ink' : next ? 'pulse-ring bg-ink text-paper' : 'border border-line-2 text-muted',
          )}
          aria-hidden
        >
          {s.done ? (
            <motion.span initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
              <Check size={16} strokeWidth={2.5} />
            </motion.span>
          ) : (
            n
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className={cx('block font-medium', s.done && 'text-muted line-through decoration-line-2')}>{s.title}</span>
          <span className="block truncate text-sm text-muted">{partial ? `${s.progress!.have} of ${s.progress!.need} done` : s.sub}</span>
          {partial && <Bar value={s.progress!.have / s.progress!.need} className="mt-2 max-w-64" label={`${s.title} progress`} />}
        </span>
        {!s.done && <ArrowRight size={18} className="shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-ink" aria-hidden />}
        <span className="sr-only">{s.done ? '(done)' : next ? '(next)' : ''}</span>
      </Link>
    </li>
  )
}

/** The last seven days: plan finished, studied, or nothing. */
function WeekStrip() {
  const activity = useStore((s) => s.activity)
  const planDone = useStore((s) => s.planDone)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - 6 + i)
    const k = dayKey(d)
    return { k, label: d.toLocaleDateString(undefined, { weekday: 'short' }), plan: !!planDone[k], studied: !!activity[k], today: i === 6 }
  })
  const studied = days.filter((d) => d.studied || d.plan).length
  return (
    <section className="card grid gap-4 p-5" aria-labelledby="week-h">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="week-h" className="text-[0.95rem]">This week</h2>
        <span className="num text-sm text-muted">Studied {studied} of 7 days</span>
      </div>
      <ol className="grid grid-cols-7 gap-1">
        {days.map((d) => (
          <li key={d.k} className="grid justify-items-center gap-1.5">
            <span
              className={cx(
                'grid size-8 place-items-center rounded-full',
                d.plan ? 'bg-accent text-accent-ink' : d.studied ? 'bg-marker' : 'bg-paper-2',
                d.today && !d.plan && 'ring-1 ring-ink ring-offset-2 ring-offset-card',
              )}
              aria-label={`${d.label}: ${d.plan ? 'plan finished' : d.studied ? 'studied' : 'no study'}`}
              role="img"
            >
              {d.plan && <Check size={14} strokeWidth={2.5} aria-hidden />}
            </span>
            <span className={cx('text-xs', d.today ? 'font-semibold text-ink' : 'text-muted')}>{d.today ? 'Today' : d.label}</span>
          </li>
        ))}
      </ol>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-accent" aria-hidden />Plan finished</li>
        <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-marker" aria-hidden />Studied</li>
      </ul>
    </section>
  )
}

/** Your teammate: their streak, estimate, and what they're working on. */
function PartnerCard() {
  const p = useStore((s) => s.partner)
  if (!p) {
    return (
      <Link to="/sync?tab=partner" className="card lift grid gap-1 p-5 text-ink no-underline">
        <span className="flex items-center justify-between gap-3">
          <span className="text-[0.95rem] font-semibold">Team up with your partner</span>
          <Users size={18} strokeWidth={1.75} className="text-muted" aria-hidden />
        </span>
        <span className="text-sm text-muted">BTDM is a team event. Swap codes to see each other’s streak, estimate and weak spots.</span>
      </Link>
    )
  }
  const focus = (p.focus ?? Object.entries(p.areas).sort((a, b) => a[1] - b[1]).map(([a]) => a)).slice(0, 2)
  return (
    <Link to="/partner" className="card lift grid gap-3 p-5 text-ink no-underline">
      <span className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-paper-2 text-sm font-semibold" aria-hidden>
          {p.name.slice(0, 1).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{p.name}</span>
          <span className="block text-xs text-muted">Your teammate · updated {relTime(p.at)}</span>
        </span>
        <ArrowRight size={18} className="shrink-0 text-muted" aria-hidden />
      </span>
      <span className="grid grid-cols-2 gap-4">
        <span className="grid">
          <span className="text-xs text-muted">Exam estimate</span>
          <span className="num text-xl">{Math.round(p.projected)}<span className="text-sm text-muted">/100</span></span>
        </span>
        <span className="grid">
          <span className="text-xs text-muted">Streak</span>
          <span className="num text-xl">{p.streak ?? '—'}<span className="text-sm text-muted"> days</span></span>
        </span>
      </span>
      {focus.length > 0 && (
        <span className="text-sm text-ink-2">
          <span className="text-muted">Needs work: </span>
          {focus.map((a) => AREA_BY_CODE[a as keyof typeof AREA_BY_CODE]?.name ?? a).join(', ')}
        </span>
      )}
    </Link>
  )
}

/** True once per day, the first time today's plan is seen complete. */
function useCelebrateOnce(allDone: boolean): boolean {
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (!allDone) return
    const today = dayKey(new Date())
    try {
      if (localStorage.getItem('st-celebrated') === today) return
      localStorage.setItem('st-celebrated', today)
    } catch {
      return
    }
    setShow(true)
  }, [allDone])
  return show
}

function greeting(): string {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

function longDate(): string {
  return new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
}
