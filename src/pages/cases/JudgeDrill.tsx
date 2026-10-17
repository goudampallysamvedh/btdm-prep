import { useEffect, useMemo, useRef, useState } from 'react'
import { Lightbulb, Pause, Play, Shuffle, SkipForward } from 'lucide-react'
import { JUDGE_CATS, JUDGE_QUESTIONS, type JudgeCat } from '@/data/judgeQuestions'
import { useStore } from '@/lib/store'
import { shuffle } from '@/lib/random'
import { fmtClock } from '@/lib/dates'
import { Button, Card, PageHeader, cx, inputCls } from '@/components/ui'

const ANSWER_SEC = 45

export default function JudgeDrill() {
  const settings = useStore((s) => s.settings)
  const drilled = useStore((s) => s.judgeDrill)
  const [cat, setCat] = useState<JudgeCat | 'all'>('all')
  const [round, setRound] = useState(0)
  const deck = useMemo(() => shuffle(JUDGE_QUESTIONS.filter((q) => cat === 'all' || q.cat === cat)), [cat, round])
  const [i, setI] = useState(0)
  const [tip, setTip] = useState(false)
  const [left, setLeft] = useState(ANSWER_SEC)
  const [running, setRunning] = useState(false)
  const timer = useRef<number | null>(null)

  const q = deck[i % deck.length]
  const who = i % 2 === 0 ? settings.partnerA : settings.partnerB

  useEffect(() => {
    if (!running) return
    timer.current = window.setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [running])
  useEffect(() => {
    if (left === 0) setRunning(false)
  }, [left])

  const next = () => {
    useStore.getState().markJudgeQ(q.id)
    useStore.getState().logActivity()
    setI(i + 1)
    setTip(false)
    setLeft(ANSWER_SEC)
    setRunning(false)
  }

  const practiced = Object.keys(drilled).length

  return (
    <>
      <PageHeader eyebrow="Case simulator" title="Judge question drill">
        One partner reads the question as the judge; the other answers out loud in under 45 seconds. Pause, restate it briefly, answer in two or three sentences, and tie it back to your plan. Then swap.
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="font-bold">Category</span>
          <select className={inputCls + ' !min-h-10 !w-auto'} value={cat} onChange={(e) => { setCat(e.target.value as JudgeCat | 'all'); setI(0) }}>
            <option value="all">All ({JUDGE_QUESTIONS.length})</option>
            {JUDGE_CATS.map((c) => <option key={c} value={c}>{c} ({JUDGE_QUESTIONS.filter((q) => q.cat === c).length})</option>)}
          </select>
        </label>
        <Button size="sm" variant="ghost" onClick={() => { setRound(round + 1); setI(0) }} icon={<Shuffle size={16} aria-hidden />}>Shuffle</Button>
        <span className="num text-sm text-muted">{practiced}/{JUDGE_QUESTIONS.length} practiced</span>
      </div>

      <Card className="mx-auto grid max-w-2xl gap-5 p-6">
        <div className="flex items-center justify-between gap-2">
          <span className="eyebrow">{q.cat}</span>
          <span className="rounded-full bg-accent-soft px-3 py-1 text-sm font-bold text-accent">{who} answers</span>
        </div>
        <p className="font-display text-[clamp(1.4rem,4.5vw,2rem)] font-extrabold leading-tight" style={{ fontStretch: '106%' }}>"{q.q}"</p>
        <div className="flex items-center gap-3">
          <span className={cx('num text-3xl font-bold', left <= 10 && left > 0 && 'text-bad', left === 0 && 'text-muted')} role="timer" aria-label={`${left} seconds left`}>{fmtClock(left)}</span>
          {running ? (
            <Button variant="ghost" onClick={() => setRunning(false)} icon={<Pause size={16} aria-hidden />}>Pause</Button>
          ) : (
            <Button variant="ghost" onClick={() => { if (left === 0) setLeft(ANSWER_SEC); setRunning(true) }} icon={<Play size={16} aria-hidden />}>{left === ANSWER_SEC ? 'Start 45s' : 'Resume'}</Button>
          )}
        </div>
        {tip ? (
          <p className="flex gap-2 rounded-xl bg-paper-2 p-3 animate-rise"><Lightbulb size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden /><span><b>A strong answer:</b> {q.tip}</span></p>
        ) : (
          <Button variant="quiet" onClick={() => setTip(true)} icon={<Lightbulb size={16} aria-hidden />}>Show what a strong answer includes</Button>
        )}
        <div className="flex justify-end">
          <Button onClick={next} icon={<SkipForward size={16} aria-hidden />}>Next question</Button>
        </div>
      </Card>
    </>
  )
}
