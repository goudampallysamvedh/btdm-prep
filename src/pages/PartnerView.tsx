import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck, Flame, HandHelping, RefreshCw, Target } from 'lucide-react'
import { useStore } from '@/lib/store'
import { areaReadiness } from '@/lib/mastery'
import { helpIdeas } from '@/lib/partner'
import { daysAgo, relDay, relTime } from '@/lib/dates'
import { useLiveStatus } from '@/lib/live'
import { AREAS, AREA_BY_CODE } from '@/data/areas'
import { TOPIC_BY_ID } from '@/data/topics'
import { LESSONS } from '@/data/lessons'
import type { AreaCode } from '@/types'
import { Sparkline } from '@/components/charts'
import { Stat } from '@/components/Stat'
import { Bar, Callout, Card, Disclosure, Empty, LinkButton, PageHeader, Tag, cx, toneFor } from '@/components/ui'

const pct = (v: number) => `${Math.round(v * 100)}%`

export default function PartnerView() {
  const p = useStore((s) => s.partner)
  const live = useStore((s) => !!s.live)
  const liveState = useLiveStatus((s) => s.state)
  const tests = useStore((s) => s.tests)
  const mine = useMemo(() => areaReadiness(tests), [tests])

  if (!p) {
    return (
      <>
        <PageHeader title="Partner's progress" />
        <Empty title="No partner data yet" action={<LinkButton to="/sync?tab=partner">Go to Sync</LinkButton>}>
          Swap partner codes in Sync. Then you'll see your partner's streak, exam estimate, and what they need to work on here, and they'll see yours.
        </Empty>
      </>
    )
  }

  const old = daysAgo(p.at)
  const rich = p.streak !== undefined
  const help = helpIdeas(mine, p)
  const needCount = p.topics?.need ?? 0
  const areaName = (a: string) => AREA_BY_CODE[a as AreaCode]?.name ?? a
  const topicTotal = p.topics ? p.topics.learned + p.topics.shaky + p.topics.need : 0

  return (
    <>
      <PageHeader title={`${p.name}'s progress`}>
        {live ? (
          <span className="inline-flex flex-wrap items-center gap-1.5">
            <span className={cx('size-2.5 rounded-full', liveState === 'live' ? 'bg-good animate-pulse' : 'bg-warn')} aria-hidden />
            {liveState === 'live' ? 'Live' : 'Reconnecting'} · last update {relTime(p.at)}
          </span>
        ) : (
          <>From their last partner code, sent {relDay(p.at)}. <Link to="/sync?tab=partner" className="font-bold">Turn on live updates</Link></>
        )}
      </PageHeader>

      {((old >= 3 && !live) || !rich) && (
        <div className="mb-4">
          <Callout tone="warn" title={!rich ? 'Ask for a new code to see more' : `This is ${old} days old`}>
            {!rich
              ? `${p.name}'s code came from an older version of the app. Once they update the app and send a new partner code, you'll see their streak, topics to learn, and more.`
              : `Ask ${p.name} to send a fresh partner code from Sync so this stays current.`}
          </Callout>
        </div>
      )}

      <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
        <Stat icon={<Flame size={18} className={p.streak ? 'animate-wiggle' : undefined} aria-hidden />} value={p.streak ?? '—'} label={old > 0 ? `day streak (as of ${relDay(p.at)})` : 'day streak'} />
        <Stat icon={<Target size={18} aria-hidden />} value={Math.round(p.projected)} unit="/100" label="exam estimate" />
        <Stat icon={<CalendarCheck size={18} aria-hidden />} value={p.activeDays7 ?? '—'} unit={p.activeDays7 !== undefined ? '/7' : undefined} label="days studied this week" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="grid min-w-0 content-start gap-3">
          <h2 className="text-lg">What {p.name} should work on</h2>
          {p.focus?.length ? (
            <ul className="grid gap-2">
              {p.focus.map((a) => {
                const acc = p.areas[a]
                return (
                  <li key={a} className="grid gap-1">
                    <span className="flex items-center gap-2">
                      <Tag>{a}</Tag>
                      <span className="min-w-0 flex-1 truncate font-bold">{areaName(a)}</span>
                      <span className="num text-sm text-muted">{acc !== undefined ? pct(acc) : 'not started'}</span>
                    </span>
                    {acc !== undefined && <Bar value={acc} tone={toneFor(acc)} label={`${areaName(a)} accuracy`} />}
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted">Exam areas they're weakest in show here.</p>
          )}
          {!!p.needTopics?.length && (
            <>
              <h3 className="mt-1 text-sm font-bold">Topics to learn</h3>
              <ul className="flex flex-wrap gap-1.5">
                {p.needTopics.map((id, i) => (
                  <li key={id} className={cx('rounded-full px-2.5 py-1 text-xs font-bold', i < needCount ? 'bg-bad-bg text-bad' : 'bg-warn-bg text-warn')}>
                    {TOPIC_BY_ID[id]?.name ?? id}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted"><span className="font-bold text-bad">Red</span> = need to learn, <span className="font-bold text-warn">amber</span> = still shaky.</p>
            </>
          )}
        </Card>

        <Card className="grid min-w-0 content-start gap-3">
          <div className="flex items-center gap-2"><HandHelping size={20} className="text-accent" aria-hidden /><h2 className="text-lg">Help each other</h2></div>
          {help.youHelp.length + help.theyHelp.length === 0 ? (
            <p className="text-sm">No big gaps between you yet. Answer more practice questions and swap codes again to find areas to coach each other on. Meanwhile, practice a case together.</p>
          ) : (
            <ul className="grid gap-2 text-sm">
              {help.youHelp.map((h) => (
                <li key={`y-${h.area}`} className="rounded-xl bg-good-bg px-3 py-2">
                  <b>You can coach {areaName(h.area)}.</b> You're at {pct(h.mine)}, {p.name} is at {pct(h.theirs)}. Quiz them, or share your best flashcards.
                </li>
              ))}
              {help.theyHelp.map((h) => (
                <li key={`t-${h.area}`} className="rounded-xl bg-info-bg px-3 py-2">
                  <b>Ask {p.name} about {areaName(h.area)}.</b> They're at {pct(h.theirs)}, you're at {pct(h.mine)}.{' '}
                  <Link to={`/exam/practice?mode=area&area=${h.area}&count=10`} className="font-bold">Practice it</Link>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-muted">Your BTDM exam scores are averaged, so lifting your partner's weak areas raises the team score as much as your own.</p>
        </Card>

        <Card className="grid min-w-0 content-start gap-3">
          <h2 className="text-lg">What {p.name} has learned</h2>
          {p.topics && topicTotal > 0 ? (
            <>
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-paper-2" role="img" aria-label={`${p.topics.learned} learned, ${p.topics.shaky} shaky, ${p.topics.need} need to learn`}>
                <div className="animate-grow bg-good" style={{ width: `${(p.topics.learned / topicTotal) * 100}%` }} />
                <div className="animate-grow bg-warn" style={{ width: `${(p.topics.shaky / topicTotal) * 100}%` }} />
                <div className="animate-grow bg-bad" style={{ width: `${(p.topics.need / topicTotal) * 100}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <span><b className="num block text-xl text-good">{p.topics.learned}</b>learned</span>
                <span><b className="num block text-xl text-warn">{p.topics.shaky}</b>shaky</span>
                <span><b className="num block text-xl text-bad">{p.topics.need}</b>need to learn</span>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">Topics show up here once {p.name} answers questions or reviews flashcards.</p>
          )}
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl bg-paper-2 p-2"><dt className="text-muted">Flashcards known</dt><dd className="num text-lg font-bold">{p.cards ? p.cards.known : '—'}</dd></div>
            <div className="rounded-xl bg-paper-2 p-2"><dt className="text-muted">Questions answered</dt><dd className="num text-lg font-bold">{p.answered}</dd></div>
            <div className="rounded-xl bg-paper-2 p-2"><dt className="text-muted">Lessons done</dt><dd className="num text-lg font-bold">{p.lessonsDone ?? '—'}<span className="text-sm font-normal text-muted"> / {LESSONS.length}</span></dd></div>
            <div className="rounded-xl bg-paper-2 p-2"><dt className="text-muted">Cases scored</dt><dd className="num text-lg font-bold">{p.cases ? p.cases.attempts : '—'}{p.cases?.attempts ? <span className="text-sm font-normal text-muted"> · best {p.cases.best}</span> : null}</dd></div>
          </dl>
          {p.trend && p.trend.length >= 2 && (
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted">Recent test scores</span>
              <span className="flex items-center gap-2"><Sparkline values={p.trend} width={120} height={28} /><b className="num">{pct(p.trend[p.trend.length - 1])}</b></span>
            </div>
          )}
        </Card>

        <Card className="grid min-w-0 content-start gap-3">
          <h2 className="text-lg">Areas side by side</h2>
          <AreaCompare mine={mine} theirs={p.areas} name={p.name} />
        </Card>
      </div>

      <div className="mt-4 flex justify-center">
        <LinkButton to="/sync?tab=partner" variant="ghost" icon={<RefreshCw size={16} aria-hidden />}>Swap fresh codes</LinkButton>
      </div>
    </>
  )
}

function AreaCompare({ mine, theirs, name }: { mine: ReturnType<typeof areaReadiness>; theirs: Record<string, number>; name: string }) {
  const rows = AREAS.filter((a) => theirs[a.code] !== undefined || mine.find((m) => m.area === a.code)?.answered)
  if (!rows.length) return <p className="text-sm text-muted">Answer some practice questions to compare areas.</p>
  const list = (rs: typeof rows) => (
    <ul className="grid gap-2.5">
      {rs.map((a) => {
        const m = mine.find((x) => x.area === a.code)
        const myAcc = m?.answered ? m.accuracy : undefined
        const t = theirs[a.code]
        return (
          <li key={a.code} className="grid gap-1 text-sm">
            <span className="flex items-center gap-2"><Tag>{a.code}</Tag><span className="min-w-0 flex-1 truncate">{a.name}</span></span>
            <span className="grid grid-cols-[3.5rem_1fr_2.5rem] items-center gap-2 text-xs"><span className="text-muted">You</span>{myAcc !== undefined ? <Bar value={myAcc} tone="ink" /> : <span className="text-muted">—</span>}<span className="num text-right">{myAcc !== undefined ? pct(myAcc) : ''}</span></span>
            <span className="grid grid-cols-[3.5rem_1fr_2.5rem] items-center gap-2 text-xs"><span className="truncate text-muted">{name}</span>{t !== undefined ? <Bar value={t} /> : <span className="text-muted">—</span>}<span className="num text-right">{t !== undefined ? pct(t) : ''}</span></span>
          </li>
        )
      })}
    </ul>
  )
  return (
    <>
      {list(rows.slice(0, 5))}
      {rows.length > 5 && <Disclosure title="Show all areas" hint={`${rows.length} areas`}>{list(rows.slice(5))}</Disclosure>}
    </>
  )
}
