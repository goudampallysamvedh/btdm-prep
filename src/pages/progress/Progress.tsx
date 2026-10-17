import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { areaReadiness, cardEvidence, projectedScore, questionEvidence, scoreOf, STATUS_LABEL, topicStatuses, type TopicStatus } from '@/lib/mastery'
import { AREAS } from '@/data/areas'
import { TOPICS } from '@/data/topics'
import { FLASHCARDS } from '@/data/flashcards'
import { CASES } from '@/data/cases'
import { fmtDate } from '@/lib/dates'
import { TrendChart, type Point } from '@/components/charts'
import { STATUS_STYLE, STATUS_ICON, TopicLinks } from '@/components/TopicLinks'
import { Bar, Card, Empty, LinkButton, PageHeader, Ring, SectionTitle, Segmented, Tag, cx, toneFor } from '@/components/ui'

const kindLabel: Record<string, string> = { practice: 'Practice', mock: 'Mock exam', missed: 'Missed review', area: 'Area practice', math: 'Math practice', 'case-quiz': 'Case quiz' }

export default function Progress() {
  const tests = useStore((s) => s.tests)
  const leitner = useStore((s) => s.leitner)
  const attempts = useStore((s) => s.caseAttempts)
  const mathStats = useStore((s) => s.mathStats)
  const official = useStore((s) => s.officialScores)
  const [openTopic, setOpenTopic] = useState<string | null>(null)
  const [view, setView] = useState<'map' | 'history'>('map')

  const ready = useMemo(() => areaReadiness(tests), [tests])
  const projected = projectedScore(ready)
  const evidence = useMemo(() => [...questionEvidence(tests), ...cardEvidence(leitner)].sort((a, b) => a.at - b.at), [tests, leitner])
  const statuses = useMemo(() => topicStatuses(evidence), [evidence])
  const counts = useMemo(() => {
    const c: Record<TopicStatus, number> = { learned: 0, shaky: 0, need: 0, unseen: 0 }
    for (const t of TOPICS) if (!t.hidden) c[statuses[t.id]]++
    return c
  }, [statuses])
  const points: Point[] = tests.map((t) => ({ x: t.finishedAt, y: scoreOf(t), series: t.kind === 'mock' ? ('mock' as const) : ('practice' as const), label: t.title }))
  points.push(...official.map((o) => ({ x: o.at, y: o.score / 100, series: 'official' as const, label: o.exam })))
  const boxes = [1, 2, 3, 4, 5].map((b) => Object.values(leitner).filter((s) => s.box === b).length)
  const seenCards = Object.keys(leitner).length

  return (
    <>
      <PageHeader title="Progress">
        Green topics are learned. Red ones need work. Tap any topic to study it.
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-[auto_1fr]">
        <Card className="flex items-center gap-5">
          <Ring value={projected / 100} size={120} label={`Projected exam score ${Math.round(projected)} out of 100`}>
            <span className="grid">
              <span className="num text-3xl font-bold">{Math.round(projected)}</span>
              <span className="text-[0.65rem] font-bold uppercase tracking-wide text-muted">projected</span>
            </span>
          </Ring>
          <div className="grid gap-1 text-sm">
            <span className="font-bold">Projected exam score</span>
            <span className="text-muted">Your accuracy in each area × its share of the 100-question exam. Starts at 50 and firms up as you answer more.</span>
            <span className="num">{tests.reduce((s, t) => s + t.answers.length, 0)} questions answered · {tests.length} tests</span>
          </div>
        </Card>
        <Card>
          {points.length ? <TrendChart points={points} /> : <p className="text-sm text-muted">Your score trend appears here after your first test.</p>}
        </Card>
      </div>

      <SectionTitle aside={<Segmented label="View" value={view} onChange={setView} options={[{ value: 'map', label: 'Topic map' }, { value: 'history', label: 'Test history' }]} />}>
        {view === 'map' ? 'Topic map' : 'Test history'}
      </SectionTitle>

      {view === 'map' ? (
        <>
          <div className="mb-3 flex flex-wrap gap-2 text-sm">
            {(['learned', 'shaky', 'need', 'unseen'] as TopicStatus[]).map((s) => (
              <span key={s} className={cx('inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 font-bold', STATUS_STYLE[s])}>
                <span aria-hidden>{STATUS_ICON[s]}</span> {STATUS_LABEL[s]} <span className="num">{counts[s]}</span>
              </span>
            ))}
          </div>
          <div className="grid gap-3">
            {AREAS.map((a) => {
              const r = ready.find((x) => x.area === a.code)!
              const ts = TOPICS.filter((t) => t.area === a.code && !t.hidden)
              return (
                <Card key={a.code} className="grid gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Tag>{a.code}</Tag>
                    <span className="min-w-0 flex-1 font-bold">{a.name}</span>
                    <span className="num text-sm text-muted">{a.weight} pts on exam · {r.answered ? `${Math.round(r.accuracy * 100)}%` : '—'}</span>
                  </div>
                  <Bar value={r.answered ? r.accuracy : 0} tone={toneFor(r.accuracy)} label={`${a.name} accuracy`} />
                  <div className="flex flex-wrap gap-1.5">
                    {ts.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setOpenTopic(openTopic === t.id ? null : t.id)}
                        aria-expanded={openTopic === t.id}
                        className={cx('inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-2 text-sm font-bold', STATUS_STYLE[statuses[t.id]], openTopic === t.id && 'ring-2 ring-accent')}
                      >
                        <span aria-hidden className="num">{STATUS_ICON[statuses[t.id]]}</span>
                        {t.name}
                        <span className="sr-only">: {STATUS_LABEL[statuses[t.id]]}</span>
                      </button>
                    ))}
                  </div>
                  {openTopic && ts.some((t) => t.id === openTopic) && (
                    <div className="rounded-xl bg-paper-2 p-3 animate-rise">
                      <div className="mb-2 text-sm">
                        <b>{TOPICS.find((t) => t.id === openTopic)?.name}</b> · {STATUS_LABEL[statuses[openTopic]]}
                      </div>
                      <TopicLinks topicId={openTopic} />
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </>
      ) : tests.length === 0 ? (
        <Empty title="No tests yet" action={<LinkButton to="/exam">Start practicing</LinkButton>}>Your reports will be listed here.</Empty>
      ) : (
        <ul className="grid gap-2">
          {[...tests].sort((a, b) => b.finishedAt - a.finishedAt).map((t) => (
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
      )}

      <div className="mt-2 grid gap-4 md:grid-cols-3">
        <div>
          <SectionTitle>Flashcards</SectionTitle>
          <Card className="grid gap-2">
            <span className="text-sm text-muted">{seenCards} of {FLASHCARDS.length} cards started</span>
            <div className="flex items-end gap-1.5" role="img" aria-label={`Cards per Leitner box: ${boxes.join(', ')}`}>
              {boxes.map((n, i) => (
                <div key={i} className="grid flex-1 justify-items-center gap-1">
                  <span className="num text-xs">{n}</span>
                  <div className="w-full rounded-t bg-accent" style={{ height: `${8 + (seenCards ? (n / seenCards) * 70 : 0)}px`, opacity: 0.35 + i * 0.16 }} />
                  <span className="text-[0.65rem] text-muted">Box {i + 1}</span>
                </div>
              ))}
            </div>
            <LinkButton to="/cards" variant="ghost" size="sm">Study cards</LinkButton>
          </Card>
        </div>
        <div>
          <SectionTitle>Case attempts</SectionTitle>
          <Card className="grid gap-2">
            {attempts.length === 0 ? (
              <span className="text-sm text-muted">Self-scored case runs show up here.</span>
            ) : (
              <ul className="grid gap-1.5 text-sm">
                {[...attempts].sort((a, b) => b.at - a.at).slice(0, 5).map((a) => (
                  <li key={a.id} className="flex justify-between gap-2">
                    <span className="truncate">{CASES.find((c) => c.id === a.caseId)?.title ?? a.caseId}</span>
                    <span className="num font-bold">{a.total}/100</span>
                  </li>
                ))}
              </ul>
            )}
            <LinkButton to="/cases" variant="ghost" size="sm">Case simulator</LinkButton>
          </Card>
        </div>
        <div>
          <SectionTitle>Retail math</SectionTitle>
          <Card className="grid gap-2">
            {Object.keys(mathStats).length === 0 ? (
              <span className="text-sm text-muted">Generator results show up here.</span>
            ) : (
              <ul className="grid gap-1.5 text-sm">
                {Object.values(mathStats).sort((a, b) => b.tried - a.tried).slice(0, 6).map((m) => (
                  <li key={m.kind} className="flex justify-between gap-2">
                    <span className="truncate">{m.kind}</span>
                    <span className="num">{m.correct}/{m.tried}</span>
                  </li>
                ))}
              </ul>
            )}
            <LinkButton to="/math" variant="ghost" size="sm">Math lab</LinkButton>
          </Card>
        </div>
      </div>
    </>
  )
}
