import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Lightbulb, Pause, Play, Shuffle, SkipForward } from 'lucide-react'
import { JUDGE_CATS, JUDGE_QUESTIONS, type JudgeCat } from '@/data/judgeQuestions'
import { CASES, CASE_BY_ID } from '@/data/cases'
import { useStore } from '@/lib/store'
import { pick, shuffle } from '@/lib/random'
import { fmtClock } from '@/lib/dates'
import { Bar, Button, Card, Disclosure, PageHeader, cx, inputCls } from '@/components/ui'
import { DailyGoal } from '@/components/DailyGoal'

const ANSWER_SEC = 45

interface DrillQ {
  id: string
  q: string
  tip: string
  cat: string
  standard?: boolean
}

export default function JudgeDrill() {
  const [params, setParams] = useSearchParams()
  const drilled = useStore((s) => s.judgeDrill)
  const plans = useStore((s) => s.casePlans)
  const [caseId, setCaseId] = useState(() => params.get('case') ?? pick(CASES).id)
  const c = CASE_BY_ID[caseId] ?? CASES[0]
  const [cat, setCat] = useState<JudgeCat | 'all'>('all')
  const [round, setRound] = useState(0)

  // The case's two standard questions first, then the general bank.
  const deck: DrillQ[] = useMemo(
    () => [
      ...(cat === 'all'
        ? c.judgeQuestions.map((q, k) => ({ id: `${c.id}-std-${k}`, q, tip: 'Answer for this business specifically: use a fact or number from the case and tie it back to your plan.', cat: 'This case', standard: true }))
        : []),
      ...shuffle(JUDGE_QUESTIONS.filter((q) => cat === 'all' || q.cat === cat)),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [c.id, cat, round],
  )
  const [i, setI] = useState(0)
  const [tip, setTip] = useState(false)
  const [left, setLeft] = useState(ANSWER_SEC)
  const [running, setRunning] = useState(false)
  const timer = useRef<number | null>(null)
  const q = deck[i % deck.length]

  const myPlan = plans[c.id]?.solution?.trim()

  useEffect(() => {
    if (!running) return
    timer.current = window.setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [running])
  useEffect(() => {
    if (left === 0) setRunning(false)
  }, [left])

  const reset = () => {
    setI(0)
    setTip(false)
    setLeft(ANSWER_SEC)
    setRunning(false)
  }
  const chooseCase = (id: string) => {
    setCaseId(id)
    params.set('case', id)
    setParams(params, { replace: true })
    reset()
  }
  const next = () => {
    if (!q.standard) useStore.getState().markJudgeQ(q.id)
    useStore.getState().logActivity()
    useStore.getState().bumpDaily('judge')
    setI(i + 1)
    setTip(false)
    setLeft(ANSWER_SEC)
    setRunning(false)
  }

  return (
    <>
      <PageHeader title="Judge question drill">Answer out loud as if you're in front of the judge, using the case below. Take turns.</PageHeader>
      <DailyGoal kind="judge" />

      <section className="mx-auto grid max-w-3xl gap-6 py-4 sm:py-8">
        <div className="flex items-center justify-between gap-2 text-sm text-muted">
          <span>{q.standard ? "This case's judge question" : q.cat}</span>
          <span className="num">Question {(i % deck.length) + 1}</span>
        </div>
        <p key={q.id} className="animate-rise font-display text-[clamp(1.9rem,6vw,3rem)] font-normal leading-[1.1] tracking-[-0.01em]">{q.q}</p>

        <div className="grid gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <span className={cx('num text-4xl leading-none', left <= 10 && left > 0 && 'text-bad', left === 0 && 'text-muted')} role="timer" aria-label={`${left} seconds left`}>
              {fmtClock(left)}
            </span>
            {running ? (
              <Button variant="ghost" onClick={() => setRunning(false)} icon={<Pause size={16} strokeWidth={1.75} aria-hidden />}>Pause</Button>
            ) : (
              <Button variant="ghost" onClick={() => { if (left === 0) setLeft(ANSWER_SEC); setRunning(true) }} icon={<Play size={16} strokeWidth={1.75} aria-hidden />}>
                {left === ANSWER_SEC ? 'Start 45s' : 'Resume'}
              </Button>
            )}
          </div>
          <Bar value={left / ANSWER_SEC} tone={left <= 10 ? 'bad' : 'accent'} label="Time left to answer" />
        </div>

        {tip ? (
          <p className="animate-rise rounded-2xl bg-card p-4 sm:p-5">
            <b className="font-semibold">A strong answer:</b> {q.tip}
          </p>
        ) : (
          <div>
            <Button variant="quiet" onClick={() => setTip(true)} icon={<Lightbulb size={16} strokeWidth={1.75} aria-hidden />}>Show what a strong answer includes</Button>
          </div>
        )}
        <div className="flex justify-end">
          <Button size="lg" onClick={next} icon={<SkipForward size={16} strokeWidth={1.75} aria-hidden />}>Next question</Button>
        </div>
      </section>

      <Card className="mx-auto mt-6 grid max-w-3xl gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex min-w-[12rem] flex-1 items-center gap-2 text-sm">
            <span className="font-medium">Case</span>
            <select className={inputCls + ' !min-h-10'} value={c.id} onChange={(e) => chooseCase(e.target.value)}>
              {CASES.map((x) => <option key={x.id} value={x.id}>{x.company}</option>)}
            </select>
          </label>
          <Button size="sm" variant="ghost" icon={<Shuffle size={16} strokeWidth={1.75} aria-hidden />} onClick={() => chooseCase(pick(CASES.filter((x) => x.id !== c.id)).id)}>Random case</Button>
        </div>
        <p className="text-[0.95rem]">{c.brief}</p>
        <div className="rounded-2xl border border-line bg-paper px-4 py-3 text-sm">
          <b className="font-semibold">{myPlan ? "Your team's plan:" : 'Example plan to defend:'}</b> {myPlan || c.examplePlan}
          {!myPlan && (
            <span className="mt-1 block text-xs text-muted">
              Write your own in the <Link to={`/cases/${c.id}?tab=plan`} className="font-medium text-ink">case planner</Link> and it will show here.
            </span>
          )}
        </div>
      </Card>

      <div className="mx-auto mt-4 max-w-3xl">
        <Disclosure title="More options" hint={cat === 'all' ? `${JUDGE_QUESTIONS.length} questions · ${Object.keys(drilled).length} practiced` : cat}>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <span className="font-medium">Only this topic</span>
              <select className={inputCls + ' !min-h-10 !w-auto'} value={cat} onChange={(e) => { setCat(e.target.value as JudgeCat | 'all'); reset() }}>
                <option value="all">All topics</option>
                {JUDGE_CATS.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </label>
            <Button size="sm" variant="ghost" onClick={() => { setRound(round + 1); reset() }} icon={<Shuffle size={16} strokeWidth={1.75} aria-hidden />}>Shuffle questions</Button>
          </div>
        </Disclosure>
      </div>
    </>
  )
}
