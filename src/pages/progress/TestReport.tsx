import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowDownRight, ArrowUpRight, Trash2 } from 'lucide-react'
import { useHydrated, useStore } from '@/lib/store'
import { buildReport, type TopicLine } from '@/lib/mastery'
import { areaName } from '@/data/areas'
import { QUESTION_BY_ID } from '@/data/questions'
import { fmtClock, fmtDateTime } from '@/lib/dates'
import { QuestionCard } from '@/components/QuestionCard'
import { TopicLinks, StatusChip } from '@/components/TopicLinks'
import { Bar, Button, Card, Empty, LinkButton, PageHeader, SectionTitle, Segmented, Tag, cx } from '@/components/ui'

export default function TestReport() {
  const hydrated = useHydrated()
  const { id } = useParams()
  const tests = useStore((s) => s.tests)
  const leitner = useStore((s) => s.leitner)
  const test = tests.find((t) => t.id === id)
  const report = useMemo(() => (test ? buildReport(test, tests, leitner) : null), [test, tests, leitner])
  const [filter, setFilter] = useState<'missed' | 'all'>('missed')
  const nav = useNavigate()

  if (!hydrated) return <p className="py-16 text-center text-muted" role="status">Loading…</p>
  if (!test || !report) return <Empty title="Test not found" action={<LinkButton to="/progress">Go to progress</LinkButton>}>It may have been deleted or imported from another device.</Empty>

  const pct = Math.round(report.pct * 100)
  const delta = report.previous ? pct - Math.round(report.previous.pct * 100) : null
  const reviewItems = test.answers.filter((a) => (filter === 'missed' ? !a.correct : true))

  return (
    <>
      <PageHeader title={`${test.title} report`}>{`${fmtDateTime(test.finishedAt)} · ${fmtClock(report.durationSec)} min`}</PageHeader>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-12">
        <section className="card grid content-between gap-6 p-5 sm:p-6 md:col-span-5" aria-label="Score">
          <div className="grid gap-2">
            <p className="flex items-baseline gap-1">
              <span className="num text-[clamp(3.5rem,8vw,4.5rem)] font-normal leading-none">{pct}</span>
              <span className="text-2xl text-muted">%</span>
            </p>
            <p className="num text-lg">
              {report.right} / {report.total} right
              {report.answered < report.total && <span className="text-sm text-bad"> · {report.total - report.answered} left blank</span>}
            </p>
          </div>
          <div className="grid gap-2">
            <Bar value={report.pct} label={`Score ${pct}%`} />
            {delta !== null && (
              <span className={cx('inline-flex items-center gap-1 text-sm font-medium', delta >= 0 ? 'text-good' : 'text-bad')}>
                {delta >= 0 ? <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden /> : <ArrowDownRight size={16} strokeWidth={1.75} aria-hidden />}
                {delta >= 0 ? '+' : ''}
                {delta} pts vs. last {report.previous?.title.toLowerCase()}
              </span>
            )}
            <span className="text-sm text-muted">{pct >= 70 ? 'At or above the 70% AMA certification mark.' : 'Aim for 70%+ (the AMA certification mark), then 80%.'}</span>
          </div>
        </section>

        <Card className="grid content-start gap-3 md:col-span-7">
          <h2 className="text-[0.95rem]">Since your last test</h2>
          {report.newlyLearned.length === 0 && report.slipped.length === 0 ? (
            <p className="text-sm text-muted">No topics changed level this time. Topics count as learned after you get them right in two separate tests.</p>
          ) : (
            <>
              {report.newlyLearned.length > 0 && (
                <div className="grid gap-2">
                  <span className="text-sm font-medium">Newly learned</span>
                  <div className="flex flex-wrap gap-1.5">{report.newlyLearned.map((t) => <StatusChip key={t.topic} status="learned" className="!font-medium">{t.name}</StatusChip>)}</div>
                </div>
              )}
              {report.slipped.length > 0 && (
                <div className="grid gap-2">
                  <span className="text-sm font-medium">Slipped</span>
                  <div className="flex flex-wrap gap-1.5">{report.slipped.map((t) => <StatusChip key={t.topic} status={t.status} className="!font-medium">{t.name}</StatusChip>)}</div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      <SectionTitle>What you learned and what's next</SectionTitle>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-12">
        <TopicColumn title="Need to learn" lines={report.need} empty="No weak topics in this test." withLinks className="md:col-span-7" />
        <div className="grid content-start gap-4 md:col-span-5">
          <TopicColumn title="Still shaky" lines={report.shaky} empty="Nothing shaky in this test." />
          <TopicColumn title="Learned" lines={report.learned} empty="Get a topic right in two separate tests to lock it in." />
        </div>
      </div>

      <SectionTitle aside={<span className="text-sm text-muted">Sorted by exam points at stake</span>}>By area</SectionTitle>
      <Card>
        <ul className="divide-y divide-line">
          {report.areas.map((a) => (
            <li key={a.area} className="grid grid-cols-[3.2rem_minmax(0,1fr)_auto] items-center gap-x-3 py-3 first:pt-0 last:pb-0">
              <Tag>{a.area}</Tag>
              <div className="min-w-0">
                <div className="flex justify-between gap-2 text-sm">
                  <span className="truncate font-medium">{areaName(a.area)}</span>
                  <span className="num shrink-0">{a.right}/{a.total}</span>
                </div>
                <Bar value={a.right / a.total} label={`${areaName(a.area)} score`} className="mt-1.5 !h-1" />
              </div>
              <span className="num w-20 text-right text-xs text-muted" title="Expected points lost on the real exam at this accuracy">
                {a.pointsAtStake > 0.05 ? `−${a.pointsAtStake.toFixed(1)} pts` : 'on track'}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <SectionTitle
        aside={<Segmented label="Which questions" value={filter} onChange={setFilter} options={[{ value: 'missed', label: `Missed (${test.answers.filter((a) => !a.correct).length})` }, { value: 'all', label: 'All' }]} />}
      >
        Question review
      </SectionTitle>
      <div className="mx-auto grid max-w-[44rem] gap-4">
        {reviewItems.length === 0 && <p className="text-muted">No missed questions. Perfect set!</p>}
        {reviewItems.map((a) => {
          const q = QUESTION_BY_ID[a.qid]
          if (!q) return null
          const n = test.answers.indexOf(a) + 1
          return <QuestionCard key={a.qid} q={q} order={[0, 1, 2, 3]} chosen={a.chosen ?? -1} reveal number={n} total={test.answers.length} />
        })}
      </div>

      <div className="mt-10 flex flex-wrap gap-2">
        <LinkButton to="/exam/practice?mode=smart&count=20">Practice again</LinkButton>
        {report.need.length > 0 && <LinkButton variant="ghost" to="/exam/practice?mode=missed&count=20">Review misses</LinkButton>}
        <Button
          variant="danger"
          icon={<Trash2 size={16} strokeWidth={1.75} aria-hidden />}
          onClick={() => {
            if (confirm('Delete this test from your history?')) {
              useStore.getState().deleteTest(test.id)
              nav('/progress')
            }
          }}
        >
          Delete
        </Button>
      </div>
    </>
  )
}

function TopicColumn({ title, lines, empty, withLinks, className }: { title: string; lines: TopicLine[]; empty: string; withLinks?: boolean; className?: string }) {
  return (
    <Card className={cx('grid content-start gap-3', className)}>
      <h3 className="flex items-baseline gap-2 text-[0.95rem]">
        {title} <span className="num text-sm font-normal text-muted">{lines.length}</span>
      </h3>
      {lines.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <ul className="divide-y divide-line">
          {lines.map((t) => (
            <li key={t.topic} className="grid gap-2 py-2.5 first:pt-0 last:pb-0">
              <div className="flex items-baseline justify-between gap-3">
                <Link to={`/learn/guide/${t.area}#${encodeURIComponent(t.topic)}`} className="font-medium text-ink">
                  {t.name}
                </Link>
                <span className="num shrink-0 text-xs text-muted">
                  {t.area} · {t.right}/{t.total}
                </span>
              </div>
              {withLinks && <TopicLinks topicId={t.topic} compact />}
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
