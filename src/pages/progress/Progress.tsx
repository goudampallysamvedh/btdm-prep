import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useStore } from '@/lib/store'
import { areaReadiness, cardEvidence, projectedScore, questionEvidence, scoreOf, STATUS_LABEL, topicStatuses, type TopicStatus } from '@/lib/mastery'
import { AREAS } from '@/data/areas'
import { TOPICS } from '@/data/topics'
import { FLASHCARDS } from '@/data/flashcards'
import { CASES } from '@/data/cases'
import { fmtDate } from '@/lib/dates'
import { TrendChart, type Point } from '@/components/charts'
import { STATUS_STYLE, STATUS_ICON, TopicLinks } from '@/components/TopicLinks'
import { NumberTicker } from '@/components/fx/NumberTicker'
import { Bar, Card, Empty, LinkButton, PageHeader, Tag, cx } from '@/components/ui'

const kindLabel: Record<string, string> = { practice: 'Practice', mock: 'Mock exam', missed: 'Missed review', area: 'Area practice', math: 'Math practice', 'case-quiz': 'Case quiz' }

export default function Progress() {
  const tests = useStore((s) => s.tests)
  const leitner = useStore((s) => s.leitner)
  const attempts = useStore((s) => s.caseAttempts)
  const mathStats = useStore((s) => s.mathStats)
  const official = useStore((s) => s.officialScores)
  const [openTopic, setOpenTopic] = useState<string | null>(null)

  const ready = useMemo(() => areaReadiness(tests), [tests])
  const projected = projectedScore(ready)
  const evidence = useMemo(() => [...questionEvidence(tests), ...cardEvidence(leitner)].sort((a, b) => a.at - b.at), [tests, leitner])
  const statuses = useMemo(() => topicStatuses(evidence), [evidence])
  const counts = useMemo(() => {
    const c: Record<TopicStatus, number> = { learned: 0, shaky: 0, need: 0, unseen: 0 }
    for (const t of TOPICS) if (!t.hidden) c[statuses[t.id]]++
    return c
  }, [statuses])
  // Weakest first, so the top of the list is where practice pays most; areas with no answers sit last.
  const ranked = useMemo(
    () => AREAS.map((a) => ({ a, r: ready.find((x) => x.area === a.code)! })).sort((x, y) => (x.r.answered ? x.r.accuracy : 2) - (y.r.answered ? y.r.accuracy : 2) || y.a.weight - x.a.weight),
    [ready],
  )
  const points: Point[] = tests.map((t) => ({ x: t.finishedAt, y: scoreOf(t), series: t.kind === 'mock' ? ('mock' as const) : ('practice' as const), label: t.title }))
  points.push(...official.map((o) => ({ x: o.at, y: o.score / 100, series: 'official' as const, label: o.exam })))
  const boxes = [1, 2, 3, 4, 5].map((b) => Object.values(leitner).filter((s) => s.box === b).length)
  const seenCards = Object.keys(leitner).length
  const answeredTotal = tests.reduce((s, t) => s + t.answers.length, 0)

  return (
    <>
      <PageHeader title="Progress">
        Green topics are learned. Red ones need work. Tap any topic to study it.
      </PageHeader>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-12">
        <Card className="grid content-between gap-6 md:col-span-4">
          <div className="grid gap-2">
            <h2 className="text-[0.95rem]">Projected exam score</h2>
            <p className="flex items-baseline gap-1.5" aria-label={`Projected exam score ${Math.round(projected)} out of 100`}>
              <NumberTicker value={Math.round(projected)} className="text-[2.5rem] font-normal leading-none" />
              <span className="text-lg text-muted">/ 100</span>
            </p>
          </div>
          <div className="grid gap-3">
            <Bar value={projected / 100} label="Projected exam score" />
            <p className="text-sm text-muted">Your accuracy in each area × its share of the 100-question exam. Starts at 50 and firms up as you answer more.</p>
            <p className="num text-sm">{answeredTotal} questions answered · {tests.length} tests</p>
          </div>
        </Card>
        <Card className="md:col-span-8">
          <h2 className="mb-3 text-[0.95rem]">Score trend</h2>
          {points.length ? <TrendChart points={points} /> : <p className="text-sm text-muted">Your score trend appears here after your first test.</p>}
        </Card>

        <section className="card md:col-span-7" aria-labelledby="areas-h">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 p-5 pb-3 sm:p-6 sm:pb-3">
            <h2 id="areas-h" className="text-[0.95rem]">Area readiness</h2>
            <span className="text-sm text-muted">Weakest first. Open an area for its topics.</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 px-5 pb-3 text-sm text-muted sm:px-6">
            {(['learned', 'shaky', 'need', 'unseen'] as TopicStatus[]).map((st) => (
              <span key={st} className="inline-flex items-center gap-1.5">
                <span aria-hidden className={cx('num grid size-5 place-items-center rounded-md border text-xs', STATUS_STYLE[st])}>{STATUS_ICON[st]}</span>
                {STATUS_LABEL[st]} <span className="num text-ink">{counts[st]}</span>
              </span>
            ))}
          </div>
          <ul className="border-t border-line px-2 pb-2 sm:px-3">
            {ranked.map(({ a, r }) => {
              const ts = TOPICS.filter((t) => t.area === a.code && !t.hidden)
              return (
                <li key={a.code} className="border-b border-line last:border-b-0">
                  <details className="group">
                    <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 rounded-2xl px-3 py-2 hover:bg-paper-2/60 [&::-webkit-details-marker]:hidden">
                      <Tag>{a.code}</Tag>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{a.name}</span>
                        <Bar value={r.answered ? r.accuracy : 0} className="mt-1.5 !h-1" label={`${a.name} accuracy`} />
                      </span>
                      <span className="num w-11 shrink-0 text-right text-sm">{r.answered ? `${Math.round(r.accuracy * 100)}%` : <span className="text-muted">—</span>}</span>
                      <ChevronDown size={16} strokeWidth={1.75} className="shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden />
                    </summary>
                    <div className="grid gap-3 px-3 pb-4 pt-1">
                      <p className="num text-sm text-muted">{a.weight} pts on the exam</p>
                      <div className="flex flex-wrap gap-1.5">
                        {ts.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setOpenTopic(openTopic === t.id ? null : t.id)}
                            aria-expanded={openTopic === t.id}
                            className={cx('inline-flex min-h-9 items-center gap-1.5 rounded-md border px-2.5 text-sm font-medium', STATUS_STYLE[statuses[t.id]], openTopic === t.id && 'ring-2 ring-ink')}
                          >
                            <span aria-hidden className="num">{STATUS_ICON[statuses[t.id]]}</span>
                            {t.name}
                            <span className="sr-only">: {STATUS_LABEL[statuses[t.id]]}</span>
                          </button>
                        ))}
                      </div>
                      {openTopic && ts.some((t) => t.id === openTopic) && (
                        <div className="animate-rise rounded-2xl border border-line bg-paper p-3">
                          <div className="mb-2 text-sm">
                            <span className="font-medium">{TOPICS.find((t) => t.id === openTopic)?.name}</span> · {STATUS_LABEL[statuses[openTopic]]}
                          </div>
                          <TopicLinks topicId={openTopic} />
                        </div>
                      )}
                    </div>
                  </details>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="md:col-span-5" aria-labelledby="hist-h">
          <h2 id="hist-h" className="mb-2 text-[0.95rem]">Test history</h2>
          {tests.length === 0 ? (
            <Empty title="No tests yet" action={<LinkButton to="/exam">Start practicing</LinkButton>}>Your reports will be listed here.</Empty>
          ) : (
            <ul className="grid gap-2">
              {[...tests].sort((a, b) => b.finishedAt - a.finishedAt).map((t) => (
                <li key={t.id}>
                  <Link to={`/progress/test/${t.id}`} className="lift flex min-h-16 items-center gap-3 rounded-2xl border border-line bg-paper px-4 py-3 text-ink no-underline">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{t.title}</span>
                      <span className="block truncate text-xs text-muted">{kindLabel[t.kind]} · {fmtDate(t.finishedAt)} · {t.answers.length} questions</span>
                    </span>
                    <span className="num w-14 shrink-0 text-right text-lg">{Math.round(scoreOf(t) * 100)}<span className="text-sm text-muted">%</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Card className="grid content-start gap-3 md:col-span-4">
          <h2 className="text-[0.95rem]">Flashcards</h2>
          <span className="text-sm text-muted">{seenCards} of {FLASHCARDS.length} cards started</span>
          <div className="flex items-end gap-1.5" role="img" aria-label={`Cards per Leitner box: ${boxes.join(', ')}`}>
            {boxes.map((n, i) => (
              <div key={i} className="grid flex-1 justify-items-center gap-1">
                <span className="num text-xs">{n}</span>
                <div className="w-full rounded-t bg-accent" style={{ height: `${8 + (seenCards ? (n / seenCards) * 70 : 0)}px`, opacity: 0.35 + i * 0.16 }} />
                <span className="text-xs text-muted">Box {i + 1}</span>
              </div>
            ))}
          </div>
          <LinkButton to="/cards" variant="ghost" size="sm" className="justify-self-start">Study cards</LinkButton>
        </Card>
        <Card className="grid content-start gap-3 md:col-span-4">
          <h2 className="text-[0.95rem]">Case attempts</h2>
          {attempts.length === 0 ? (
            <span className="text-sm text-muted">Self-scored case runs show up here.</span>
          ) : (
            <ul className="divide-y divide-line text-sm">
              {[...attempts].sort((a, b) => b.at - a.at).slice(0, 5).map((a) => (
                <li key={a.id} className="flex justify-between gap-3 py-1.5">
                  <span className="truncate">{CASES.find((c) => c.id === a.caseId)?.title ?? a.caseId}</span>
                  <span className="num shrink-0">{a.total}<span className="text-muted">/100</span></span>
                </li>
              ))}
            </ul>
          )}
          <LinkButton to="/cases" variant="ghost" size="sm" className="justify-self-start">Case simulator</LinkButton>
        </Card>
        <Card className="grid content-start gap-3 md:col-span-4">
          <h2 className="text-[0.95rem]">Retail math</h2>
          {Object.keys(mathStats).length === 0 ? (
            <span className="text-sm text-muted">Generator results show up here.</span>
          ) : (
            <ul className="divide-y divide-line text-sm">
              {Object.values(mathStats).sort((a, b) => b.tried - a.tried).slice(0, 6).map((m) => (
                <li key={m.kind} className="flex justify-between gap-3 py-1.5">
                  <span className="truncate">{m.kind}</span>
                  <span className="num shrink-0">{m.correct}/{m.tried}</span>
                </li>
              ))}
            </ul>
          )}
          <LinkButton to="/math" variant="ghost" size="sm" className="justify-self-start">Math lab</LinkButton>
        </Card>
      </div>
    </>
  )
}
