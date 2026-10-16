import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Clock, Flag, ListChecks } from 'lucide-react'
import { useHydrated, useStore, newId, type ActiveMock } from '@/lib/store'
import { drawMock } from '@/lib/exam'
import { rng, shuffle } from '@/lib/random'
import { fmtClock } from '@/lib/dates'
import { QUESTION_BY_ID } from '@/data/questions'
import { QuestionCard } from '@/components/QuestionCard'
import { Button, Callout, Card, PageHeader, Segmented, cx } from '@/components/ui'

function seedOf(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

export default function Mock() {
  const hydrated = useHydrated()
  const active = useStore((s) => s.activeMock)
  if (!hydrated) return <p className="py-16 text-center text-muted" role="status">Loading…</p>
  return active ? <MockRun mock={active} /> : <MockSetup />
}

function MockSetup() {
  const [mins, setMins] = useState<'60' | '90' | '100' | '0'>('60')
  const start = () => {
    const qs = drawMock(useStore.getState().tests)
    const m: ActiveMock = {
      qids: qs.map((q) => q.id),
      answers: qs.map(() => null),
      flags: qs.map(() => false),
      ms: qs.map(() => 0),
      startedAt: Date.now(),
      limitSec: Number(mins) * 60,
      index: 0,
    }
    useStore.getState().setActiveMock(m)
  }
  return (
    <>
      <PageHeader eyebrow="Exam trainer" title="Timed mock exam">
        100 questions drawn to match the Marketing Cluster blueprint exactly (PM 11, IM 11, EI 9, PR 9 …). No feedback until you submit.
      </PageHeader>
      <Card className="grid max-w-xl gap-4">
        <div className="grid gap-2">
          <span className="font-bold">Time limit</span>
          <Segmented
            label="Time limit"
            value={mins}
            onChange={setMins}
            options={[
              { value: '60', label: '60 min' },
              { value: '90', label: '90 min' },
              { value: '100', label: '100 min' },
              { value: '0', label: 'Untimed' },
            ]}
          />
          <p className="text-sm text-muted">Testing time can vary by association and conference, so check your district's or state's rules. Practice under a slightly tighter limit than you'll get.</p>
        </div>
        <ul className="grid gap-1 text-sm">
          <li>• Your place is saved. You can close the app and resume, but the clock keeps running.</li>
          <li>• Flag questions to revisit. The review screen shows anything unanswered.</li>
          <li>• Use only a four-function calculator, like the real exam.</li>
        </ul>
        <Button size="lg" onClick={start} icon={<Clock size={18} aria-hidden />}>
          Start the mock exam
        </Button>
      </Card>
    </>
  )
}

function MockRun({ mock }: { mock: ActiveMock }) {
  const nav = useNavigate()
  const [now, setNow] = useState(Date.now())
  const [review, setReview] = useState(false)
  const [shownAt, setShownAt] = useState(Date.now())
  const setActive = useStore((s) => s.setActiveMock)
  const i = mock.index
  const qs = useMemo(() => mock.qids.map((id) => QUESTION_BY_ID[id]).filter(Boolean), [mock.qids])
  const orders = useMemo(() => mock.qids.map((id) => shuffle([0, 1, 2, 3], rng(seedOf(id + mock.startedAt)))), [mock.qids, mock.startedAt])
  const left = mock.limitSec ? mock.limitSec - (now - mock.startedAt) / 1000 : Infinity
  const answered = mock.answers.filter((a) => a !== null).length

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  useEffect(() => setShownAt(Date.now()), [i])

  const submit = (m: ActiveMock = mock) => {
    const id = newId('mock')
    const finishedAt = Math.min(Date.now(), m.limitSec ? m.startedAt + m.limitSec * 1000 : Date.now())
    useStore.getState().addTest({
      id,
      kind: 'mock',
      title: 'Mock exam',
      startedAt: m.startedAt,
      finishedAt,
      limitSec: m.limitSec || undefined,
      answers: m.qids.map((qid, k) => ({
        qid,
        chosen: m.answers[k],
        correct: m.answers[k] === QUESTION_BY_ID[qid]?.answer,
        ms: m.ms[k],
        flagged: m.flags[k] || undefined,
      })),
    })
    useStore.getState().logActivity(5)
    setActive(null)
    nav(`/progress/test/${id}`, { replace: true })
  }

  useEffect(() => {
    if (left <= 0) submit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left <= 0])

  const update = (patch: Partial<ActiveMock>) => setActive({ ...mock, ...patch })
  const go = (k: number) => {
    const ms = mock.ms.slice()
    ms[i] += Date.now() - shownAt
    update({ index: Math.max(0, Math.min(qs.length - 1, k)), ms })
    setReview(false)
  }

  const timer = (
    <div
      className={cx('num inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-bold', left < 300 ? 'bg-bad-bg text-bad' : 'bg-paper-2 text-ink-2')}
      role="timer"
      aria-live={left < 300 ? 'polite' : 'off'}
      aria-label={Number.isFinite(left) ? `${Math.ceil(left / 60)} minutes left` : 'Untimed'}
    >
      <Clock size={15} aria-hidden /> {Number.isFinite(left) ? fmtClock(left) : 'Untimed'}
    </div>
  )

  if (review) {
    const unanswered = mock.answers.map((a, k) => (a === null ? k : -1)).filter((k) => k >= 0)
    const flagged = mock.flags.map((f, k) => (f ? k : -1)).filter((k) => k >= 0)
    return (
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl">Review before submitting</h1>
          {timer}
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-lg bg-paper-2 px-2.5 py-1 font-bold">{answered} answered</span>
          <span className="rounded-lg bg-bad-bg px-2.5 py-1 font-bold text-bad">{unanswered.length} blank</span>
          <span className="rounded-lg bg-warn-bg px-2.5 py-1 font-bold text-warn">{flagged.length} flagged</span>
        </div>
        {unanswered.length > 0 && <Callout tone="warn">There's no penalty for guessing, so answer every blank before you submit.</Callout>}
        <Card>
          <ol className="grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-1.5" aria-label="Question navigator">
            {qs.map((_, k) => (
              <li key={k}>
                <button
                  type="button"
                  onClick={() => go(k)}
                  className={cx(
                    'num relative grid h-11 w-full place-items-center rounded-lg border text-sm font-bold',
                    mock.answers[k] === null ? 'border-bad/50 bg-bad-bg text-bad' : 'border-line bg-paper-2 text-ink-2',
                  )}
                  aria-label={`Question ${k + 1}${mock.answers[k] === null ? ', unanswered' : ''}${mock.flags[k] ? ', flagged' : ''}`}
                >
                  {k + 1}
                  {mock.flags[k] && <Flag size={11} className="absolute right-1 top-1 text-warn" aria-hidden />}
                </button>
              </li>
            ))}
          </ol>
        </Card>
        <div className="flex flex-wrap justify-between gap-2">
          <Button variant="ghost" onClick={() => setReview(false)}>
            <ArrowLeft size={18} aria-hidden /> Back to questions
          </Button>
          <Button
            onClick={() => {
              if (confirm(unanswered.length ? `${unanswered.length} questions are blank. Submit anyway?` : 'Submit your exam?')) submit()
            }}
          >
            Submit exam
          </Button>
        </div>
      </div>
    )
  }

  const q = qs[i]
  return (
    <div className="mx-auto grid max-w-2xl gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg">Mock exam</h1>
        <div className="flex items-center gap-2">
          {timer}
          <Button size="sm" variant="ghost" onClick={() => setReview(true)} icon={<ListChecks size={16} aria-hidden />}>
            Review <span className="num">({answered}/100)</span>
          </Button>
        </div>
      </div>
      <QuestionCard
        q={q}
        order={orders[i]}
        chosen={mock.answers[i]}
        reveal={false}
        onChoose={(orig) => {
          const answers = mock.answers.slice()
          answers[i] = orig
          update({ answers })
        }}
        flagged={mock.flags[i]}
        onFlag={() => {
          const flags = mock.flags.slice()
          flags[i] = !flags[i]
          update({ flags })
        }}
        number={i + 1}
        total={qs.length}
      />
      <div className="flex justify-between gap-2">
        <Button variant="ghost" onClick={() => go(i - 1)} disabled={i === 0}>
          <ArrowLeft size={18} aria-hidden /> Back
        </Button>
        {i === qs.length - 1 ? (
          <Button onClick={() => setReview(true)}>Review & submit</Button>
        ) : (
          <Button onClick={() => go(i + 1)}>
            Next <ArrowRight size={18} aria-hidden />
          </Button>
        )}
      </div>
    </div>
  )
}
