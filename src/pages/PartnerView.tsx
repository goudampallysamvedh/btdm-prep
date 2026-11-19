import { useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import { useStore } from '@/lib/store'
import { areaReadiness, projectedScore } from '@/lib/mastery'
import { helpIdeas } from '@/lib/partner'
import { daysAgo, relDay, relTime } from '@/lib/dates'
import { useLiveStatus } from '@/lib/live'
import { AREAS, AREA_BY_CODE } from '@/data/areas'
import { TOPIC_BY_ID } from '@/data/topics'
import { LESSONS } from '@/data/lessons'
import type { AreaCode } from '@/types'
import { Sparkline } from '@/components/charts'
import { NumberTicker } from '@/components/fx/NumberTicker'
import { Callout, Disclosure, Empty, LinkButton, PageHeader, cx } from '@/components/ui'

const pct = (v: number) => `${Math.round(v * 100)}%`

/*
  Partner answers: "How is my teammate doing, and where can we help each other?"
  The two of you run as two lanes (you in ink, them in the data hue) through the area comparison.
  Grid: 12 columns; the figures span 3/3/3/3, then 7 + 5, then 12.
*/
export default function PartnerView() {
  const p = useStore((s) => s.partner)
  const live = useStore((s) => !!s.live)
  const liveState = useLiveStatus((s) => s.state)
  const tests = useStore((s) => s.tests)
  const settings = useStore((s) => s.settings)
  const mine = useMemo(() => areaReadiness(tests), [tests])

  if (!p) {
    return (
      <>
        <PageHeader title="Partner's progress">BTDM is scored as a team, so your partner’s weak areas matter as much as yours.</PageHeader>
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
  const myProjected = projectedScore(mine)
  const myName = settings.me === 'A' ? settings.partnerA : settings.partnerB

  return (
    <>
      <PageHeader
        title={`${p.name}'s progress`}
        actions={<LinkButton to="/sync?tab=partner" variant="ghost" size="sm" icon={<RefreshCw size={15} strokeWidth={1.75} aria-hidden />}>Swap fresh codes</LinkButton>}
      >
        {live ? (
          <span className="inline-flex flex-wrap items-center gap-1.5">
            <span className={cx('size-2 rounded-full', liveState === 'live' ? 'bg-good' : 'bg-warn')} aria-hidden />
            {liveState === 'live' ? 'Live' : 'Reconnecting'} · last update {relTime(p.at)}
          </span>
        ) : (
          <>From their last partner code, sent {relDay(p.at)}. <Link to="/sync?tab=partner" className="font-medium text-ink">Turn on live updates</Link></>
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

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-12">
        <section aria-label={`${p.name}'s numbers`} className="card grid grid-cols-2 gap-px overflow-hidden bg-line p-0 md:col-span-12 md:grid-cols-4">
          <Figure label="Team estimate" value={Math.round((myProjected + p.projected) / 2)} unit="/100">
            You {Math.round(myProjected)} · {p.name} {Math.round(p.projected)}
          </Figure>
          <Figure label={`${p.name}’s estimate`} value={Math.round(p.projected)} unit="/100">From their recent answers</Figure>
          <Figure label="Streak" value={p.streak ?? null} unit="days">{old > 0 ? `As of ${relDay(p.at)}` : 'Current'}</Figure>
          <Figure label="Days studied this week" value={p.activeDays7 ?? null} unit="of 7">Any study counts</Figure>
        </section>

        <section className="card grid content-start gap-4 p-5 md:col-span-7 md:p-6" aria-labelledby="compare-h">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 id="compare-h" className="text-[0.95rem]">Areas side by side</h2>
            <ul className="flex gap-4 text-xs text-muted">
              <li className="flex items-center gap-1.5"><span className="h-1.5 w-4 rounded-full bg-ink" aria-hidden />{myName === 'Partner A' || myName === 'Partner B' ? 'You' : `You (${myName})`}</li>
              <li className="flex items-center gap-1.5"><span className="h-1.5 w-4 rounded-full bg-accent" aria-hidden />{p.name}</li>
            </ul>
          </div>
          <AreaCompare mine={mine} theirs={p.areas} name={p.name} />
        </section>

        <div className="grid content-start gap-4 md:col-span-5">
          <section className="card grid content-start gap-3 p-5" aria-labelledby="focus-h">
            <h2 id="focus-h" className="text-[0.95rem]">What {p.name} should work on</h2>
            {p.focus?.length ? (
              <ul className="grid">
                {p.focus.map((a) => {
                  const acc = p.areas[a]
                  return (
                    <li key={a} className="flex items-baseline justify-between gap-3 border-b border-line py-2 text-sm last:border-b-0">
                      <span className="min-w-0 truncate">{areaName(a)}</span>
                      <span className="num shrink-0 text-muted">{acc !== undefined ? pct(acc) : 'not started'}</span>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted">Exam areas they're weakest in show here.</p>
            )}
            {!!p.needTopics?.length && (
              <div className="grid gap-2 pt-1">
                <h3 className="text-sm font-medium">Topics to learn</h3>
                <ul className="flex flex-wrap gap-1.5">
                  {p.needTopics.map((id, i) => (
                    <li key={id} className={cx('rounded-full px-2.5 py-1 text-xs font-medium', i < needCount ? 'bg-bad-bg text-bad' : 'bg-warn-bg text-warn')}>
                      {TOPIC_BY_ID[id]?.name ?? id}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted"><span className="font-medium text-bad">Red</span> means need to learn, <span className="font-medium text-warn">amber</span> still shaky.</p>
              </div>
            )}
          </section>

          <section className="card grid content-start gap-3 p-5" aria-labelledby="help-h">
            <h2 id="help-h" className="text-[0.95rem]">Help each other</h2>
            {help.youHelp.length + help.theyHelp.length === 0 ? (
              <p className="text-sm text-ink-2">No big gaps between you yet. Answer more practice questions and swap codes again to find areas to coach each other on. Meanwhile, practice a case together.</p>
            ) : (
              <ul className="grid gap-2 text-sm">
                {help.youHelp.map((h) => (
                  <li key={`y-${h.area}`} className="rounded-2xl border border-line bg-paper px-4 py-3">
                    <span className="font-semibold">You can coach {areaName(h.area)}.</span> You're at <span className="num">{pct(h.mine)}</span>, {p.name} is at <span className="num">{pct(h.theirs)}</span>. Quiz them, or share your best flashcards.
                  </li>
                ))}
                {help.theyHelp.map((h) => (
                  <li key={`t-${h.area}`} className="rounded-2xl border border-line bg-paper px-4 py-3">
                    <span className="font-semibold">Ask {p.name} about {areaName(h.area)}.</span> They're at <span className="num">{pct(h.theirs)}</span>, you're at <span className="num">{pct(h.mine)}</span>.{' '}
                    <Link to={`/exam/practice?mode=area&area=${h.area}&count=10`} className="font-medium text-ink">Practice it</Link>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-muted">Your BTDM exam scores are averaged, so lifting your partner's weak areas raises the team score as much as your own.</p>
          </section>
        </div>

        <section className="card grid gap-6 p-5 md:col-span-12 md:grid-cols-2 md:gap-10 md:p-6" aria-labelledby="learned-h">
          <div className="grid content-start gap-3">
            <h2 id="learned-h" className="text-[0.95rem]">What {p.name} has learned</h2>
            {p.topics && topicTotal > 0 ? (
              <>
                <div className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full" role="img" aria-label={`${p.topics.learned} learned, ${p.topics.shaky} shaky, ${p.topics.need} need to learn`}>
                  <div className="animate-grow rounded-full bg-good" style={{ width: `${(p.topics.learned / topicTotal) * 100}%` }} />
                  <div className="animate-grow rounded-full bg-warn" style={{ width: `${(p.topics.shaky / topicTotal) * 100}%` }} />
                  <div className="animate-grow rounded-full bg-bad" style={{ width: `${(p.topics.need / topicTotal) * 100}%` }} />
                </div>
                <dl className="grid grid-cols-3 gap-2 text-sm">
                  <div><dd className="num text-2xl">{p.topics.learned}</dd><dt className="text-muted">learned</dt></div>
                  <div><dd className="num text-2xl">{p.topics.shaky}</dd><dt className="text-muted">shaky</dt></div>
                  <div><dd className="num text-2xl">{p.topics.need}</dd><dt className="text-muted">need to learn</dt></div>
                </dl>
              </>
            ) : (
              <p className="text-sm text-muted">Topics show up here once {p.name} answers questions or reviews flashcards.</p>
            )}
          </div>
          <dl className="grid content-start text-sm">
            <Row label="Flashcards known">{p.cards ? p.cards.known : '—'}</Row>
            <Row label="Questions answered">{p.answered}</Row>
            <Row label="Lessons done">{p.lessonsDone ?? '—'}<span className="text-muted"> of {LESSONS.length}</span></Row>
            <Row label="Cases scored">{p.cases ? p.cases.attempts : '—'}{p.cases?.attempts ? <span className="text-muted"> · best {p.cases.best}</span> : null}</Row>
            {p.trend && p.trend.length >= 2 && (
              <Row label="Recent test scores">
                <span className="inline-flex items-center gap-2"><Sparkline values={p.trend} width={96} height={22} />{pct(p.trend[p.trend.length - 1])}</span>
              </Row>
            )}
          </dl>
        </section>
      </div>
    </>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line py-2.5 last:border-b-0">
      <dt className="text-muted">{label}</dt>
      <dd className="num text-right text-ink">{children}</dd>
    </div>
  )
}

function Figure({ label, value, unit, children }: { label: string; value: number | null; unit?: string; children: ReactNode }) {
  return (
    <div className="grid content-start gap-2 bg-card p-4 sm:p-5">
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
    </div>
  )
}

/** Two lanes per area: you in ink, your partner in the data hue, on one shared scale. */
function AreaCompare({ mine, theirs, name }: { mine: ReturnType<typeof areaReadiness>; theirs: Record<string, number>; name: string }) {
  const rows = AREAS.filter((a) => theirs[a.code] !== undefined || mine.find((m) => m.area === a.code)?.answered)
  if (!rows.length) return <p className="text-sm text-muted">Answer some practice questions to compare areas.</p>
  const lane = (v: number | undefined, tone: string, who: string, area: string) => (
    <span className="grid grid-cols-[minmax(0,1fr)_2.75rem] items-center gap-3">
      <span className="h-1.5 overflow-hidden rounded-full bg-paper-2" role="img" aria-label={`${who}, ${area}: ${v !== undefined ? pct(v) : 'not started'}`}>
        {v !== undefined && v > 0 && <span className={cx('animate-grow block h-full rounded-full', tone)} style={{ width: `${v * 100}%` }} />}
      </span>
      <span className="num text-right text-xs text-muted">{v !== undefined ? pct(v) : '—'}</span>
    </span>
  )
  const list = (rs: typeof rows) => (
    <ul className="grid">
      {rs.map((a) => {
        const m = mine.find((x) => x.area === a.code)
        const myAcc = m?.answered ? m.accuracy : undefined
        return (
          <li key={a.code} className="grid gap-1.5 border-b border-line py-3 text-sm last:border-b-0">
            <span className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate font-medium">{a.name}</span>
              <span className="num shrink-0 text-xs text-muted">{a.weight} questions</span>
            </span>
            {lane(myAcc, 'bg-ink', 'You', a.name)}
            {lane(theirs[a.code], 'bg-accent', name, a.name)}
          </li>
        )
      })}
    </ul>
  )
  return (
    <>
      {list(rows.slice(0, 4))}
      {rows.length > 4 && (
        <Disclosure title="Show all areas" hint={`${rows.length} areas`} className="bg-paper">
          {list(rows.slice(4))}
        </Disclosure>
      )}
    </>
  )
}
