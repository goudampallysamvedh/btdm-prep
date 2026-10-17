import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Calculator, CalendarDays, ClipboardCheck, Flame, Layers, Target } from 'lucide-react'
import { useStore } from '@/lib/store'
import { areaReadiness, cardEvidence, projectedScore, questionEvidence, scoreOf, topicStatuses, weakestTopic } from '@/lib/mastery'
import { dueCards, newCards } from '@/lib/srs'
import { daysUntil, dayKey, streak } from '@/lib/dates'
import { AREAS, AREA_BY_CODE } from '@/data/areas'
import { TOPIC_BY_ID } from '@/data/topics'
import { FLASHCARDS } from '@/data/flashcards'
import { Bar, Card, LinkButton, Ring, SectionTitle, Tag, cx, inputCls, toneFor } from '@/components/ui'
import { TopicLinks } from '@/components/TopicLinks'

export default function Dashboard() {
  const settings = useStore((s) => s.settings)
  const setSettings = useStore((s) => s.setSettings)
  const tests = useStore((s) => s.tests)
  const activity = useStore((s) => s.activity)
  const leitner = useStore((s) => s.leitner)
  const activeMock = useStore((s) => s.activeMock)
  const partner = useStore((s) => s.partner)

  const ready = useMemo(() => areaReadiness(tests), [tests])
  const projected = projectedScore(ready)
  const statuses = useMemo(() => topicStatuses([...questionEvidence(tests), ...cardEvidence(leitner)].sort((a, b) => a.at - b.at)), [tests, leitner])
  const next = [...ready].sort((a, b) => b.priority - a.priority).slice(0, 3)
  const due = dueCards(FLASHCARDS, leitner).length
  const fresh = newCards(FLASHCARDS, leitner).length
  const days = daysUntil(settings.competitionDate)
  const st = streak(activity)
  const today = activity[dayKey(new Date())] ?? 0
  const last = [...tests].sort((a, b) => b.finishedAt - a.finishedAt)[0]
  const answeredTotal = tests.reduce((s, t) => s + t.answers.length, 0)

  return (
    <>
      <header className="mb-5 grid gap-1 animate-rise">
        <span className="eyebrow">Buying & Merchandising Team Decision Making</span>
        <h1 className="text-[clamp(2rem,7vw,3rem)]">
          {greeting()}, {settings.me === 'A' ? settings.partnerA : settings.partnerB}
          {settings.partnerA === 'Partner A' && settings.partnerB === 'Partner B' ? '' : '.'}
        </h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="receipt grid content-start gap-2">
          <span className="eyebrow inline-flex items-center gap-1.5"><CalendarDays size={14} aria-hidden /> Countdown</span>
          {days === null ? (
            <label className="grid gap-1 text-sm">
              <span>When is {settings.competitionName}?</span>
              <input type="date" className={inputCls} value={settings.competitionDate} onChange={(e) => setSettings({ competitionDate: e.target.value })} />
            </label>
          ) : (
            <>
              <span className="num text-5xl font-bold leading-none">{Math.max(0, days)}</span>
              <span className="text-sm text-muted">
                {days > 0 ? `days until ${settings.competitionName}` : days === 0 ? `${settings.competitionName} is today. You've got this.` : `${settings.competitionName} has passed. Set your next date in Settings.`}
              </span>
              <Link to="/settings" className="text-xs font-bold">Change date</Link>
            </>
          )}
        </Card>
        <Card className="receipt grid content-start gap-2">
          <span className="eyebrow inline-flex items-center gap-1.5"><Flame size={14} aria-hidden /> Streak</span>
          <span className="num text-5xl font-bold leading-none">{st}</span>
          <span className="text-sm text-muted">{st === 1 ? 'day' : 'days'} in a row</span>
          <Bar value={today / settings.dailyGoal} tone={today >= settings.dailyGoal ? 'good' : 'accent'} label="Today's goal progress" />
          <span className="num text-xs text-muted">{Math.min(today, settings.dailyGoal)}/{settings.dailyGoal} study actions today</span>
        </Card>
        <Card className="receipt flex items-center gap-4">
          <Ring value={projected / 100} size={96} label={`Projected exam score ${Math.round(projected)}`}>
            <span className="num text-2xl font-bold">{Math.round(projected)}</span>
          </Ring>
          <div className="grid gap-1 text-sm">
            <span className="eyebrow inline-flex items-center gap-1.5"><Target size={14} aria-hidden /> Exam readiness</span>
            <span className="text-muted">Projected score out of 100, weighted by the blueprint.</span>
            <span className="num text-xs text-muted">{answeredTotal} answers so far</span>
            {partner && (
              <Link to="/sync" className="num text-xs font-bold">
                Team avg with {partner.name}: {Math.round((projected + partner.projected) / 2)}
              </Link>
            )}
          </div>
        </Card>
      </div>

      <SectionTitle aside={<Link to="/progress" className="text-sm font-bold">Topic map →</Link>}>Readiness by area</SectionTitle>
      <Card className="grid gap-3">
        <BlueprintStrip ready={ready} />
        <p className="text-xs text-muted">Each block's width is that area's share of the 100-question exam; its fill is your estimated accuracy.</p>
      </Card>

      <SectionTitle>Study this next</SectionTitle>
      <div className="grid gap-3 md:grid-cols-3">
        {next.map((r, i) => {
          const a = AREA_BY_CODE[r.area]
          const topic = weakestTopic(r.area, statuses)
          return (
            <Card key={r.area} className={cx('grid content-start gap-3', i === 0 && 'border-accent')}>
              <div className="flex items-center gap-2">
                <Tag tone={i === 0 ? 'accent' : 'plain'}>{a.code}</Tag>
                <span className="text-xs font-bold text-muted">{a.weight} pts on exam</span>
              </div>
              <h3 className="text-lg leading-tight">{a.name}</h3>
              <span className="text-sm text-muted">
                {r.answered ? `${Math.round(r.accuracy * 100)}% estimated accuracy` : 'Not started yet'}
                {topic ? ` · weakest: ${TOPIC_BY_ID[topic]?.name}` : ''}
              </span>
              <div className="flex flex-wrap gap-2">
                <LinkButton size="sm" to={`/exam/practice?mode=area&area=${a.code}&count=10`}>Practice 10</LinkButton>
                <LinkButton size="sm" variant="ghost" to={`/learn/guide/${a.code}`}>Study guide</LinkButton>
              </div>
              {topic && <TopicLinks topicId={topic} compact />}
            </Card>
          )
        })}
      </div>

      <SectionTitle>Quick start</SectionTitle>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <QuickTile to="/cards" icon={<Layers size={22} />} title="Flashcards" sub={due ? `${due} due now` : `${fresh} new to learn`} hot={due > 0} />
        <QuickTile to="/exam/practice?mode=smart&count=10" icon={<ClipboardCheck size={22} />} title="10-question set" sub="Smart practice" />
        <QuickTile to="/math" icon={<Calculator size={22} />} title="Math warm-up" sub="Endless problems" />
        <QuickTile to="/cases" icon={<Briefcase size={22} />} title="Run a case" sub="30 + 15 min, team mode" />
      </div>

      {(last || activeMock) && (
        <>
          <SectionTitle>Pick up where you left off</SectionTitle>
          <div className="grid gap-3 md:grid-cols-2">
            {activeMock && (
              <Card className="flex items-center justify-between gap-3">
                <span>
                  <b>Mock exam in progress</b>
                  <span className="block text-sm text-muted">{activeMock.answers.filter((a) => a !== null).length}/100 answered</span>
                </span>
                <LinkButton to="/exam/mock">Resume</LinkButton>
              </Card>
            )}
            {last && (
              <Card className="flex items-center justify-between gap-3">
                <span className="min-w-0">
                  <b className="block truncate">Last: {last.title}</b>
                  <span className="num text-sm text-muted">{Math.round(scoreOf(last) * 100)}% · {last.answers.length} questions</span>
                </span>
                <LinkButton variant="ghost" to={`/progress/test/${last.id}`}>Report</LinkButton>
              </Card>
            )}
          </div>
        </>
      )}
    </>
  )
}

function greeting(): string {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

function QuickTile({ to, icon, title, sub, hot }: { to: string; icon: React.ReactNode; title: string; sub: string; hot?: boolean }) {
  return (
    <Link to={to} className={cx('card grid min-h-28 content-between gap-3 p-4 text-ink no-underline transition-colors hover:border-accent', hot && 'border-accent')}>
      <span className={cx('grid size-10 place-items-center rounded-xl', hot ? 'bg-accent text-accent-ink' : 'bg-paper-2 text-accent')} aria-hidden>
        {icon}
      </span>
      <span>
        <span className="block font-bold">{title}</span>
        <span className="text-sm text-muted">{sub}</span>
      </span>
    </Link>
  )
}

function BlueprintStrip({ ready }: { ready: ReturnType<typeof areaReadiness> }) {
  return (
    <div>
      <div className="flex h-16 w-full overflow-hidden rounded-xl border border-line" role="list" aria-label="Readiness by exam area">
        {AREAS.map((a) => {
          const r = ready.find((x) => x.area === a.code)!
          const fill = r.answered ? r.accuracy : 0
          return (
            <Link
              key={a.code}
              role="listitem"
              to={`/exam/practice?mode=area&area=${a.code}&count=10`}
              className="group relative border-r border-card last:border-r-0 no-underline"
              style={{ width: `${a.weight}%` }}
              aria-label={`${a.name}: ${a.weight} questions, ${r.answered ? Math.round(fill * 100) + '% accuracy' : 'not started'}`}
              title={`${a.name} · ${a.weight} Qs · ${r.answered ? Math.round(fill * 100) + '%' : 'not started'}`}
            >
              <span className="absolute inset-0 bg-paper-2" />
              <span
                className={cx('absolute inset-x-0 bottom-0 transition-[height] duration-700', fill >= 0.75 ? 'bg-good' : fill >= 0.55 ? 'bg-warn' : 'bg-bad')}
                style={{ height: `${fill * 100}%`, opacity: r.answered ? 0.85 : 0 }}
              />
              {a.weight >= 4 && (
                <span className="num absolute inset-x-0 top-1 text-center text-[0.65rem] font-bold text-ink">{a.code}</span>
              )}
            </Link>
          )
        })}
      </div>
      <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {AREAS.slice(0, 12).map((a) => {
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
