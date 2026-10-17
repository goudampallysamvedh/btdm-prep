import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, X } from 'lucide-react'
import type { AnswerRecord, AreaCode, Question, TestKind } from '@/types'
import { useHydrated, useStore, newId } from '@/lib/store'
import { drawPractice, optionOrder, type PracticeMode } from '@/lib/exam'
import { areaName } from '@/data/areas'
import { TOPIC_BY_ID } from '@/data/topics'
import { QuestionCard } from '@/components/QuestionCard'
import { Bar, Button, Empty, LinkButton } from '@/components/ui'

function titleFor(mode: PracticeMode, area?: string, topic?: string): string {
  switch (mode) {
    case 'smart': return 'Smart practice'
    case 'area': return `${areaName(area as AreaCode)} practice`
    case 'topic': return `${TOPIC_BY_ID[topic ?? '']?.name ?? 'Topic'} practice`
    case 'pi': return `${topic} practice`
    case 'missed': return 'Missed-question review'
    case 'math': return 'Math practice'
    default: return 'Mixed practice'
  }
}

const kindFor: Record<PracticeMode, TestKind> = { smart: 'practice', area: 'area', topic: 'area', pi: 'area', missed: 'missed', math: 'math', all: 'practice' }

export default function Practice() {
  const hydrated = useHydrated()
  if (!hydrated) return <p className="py-16 text-center text-muted" role="status">Loading your progress…</p>
  return <PracticeRun />
}

function PracticeRun() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const mode = (params.get('mode') ?? 'smart') as PracticeMode
  const area = params.get('area') ?? undefined
  const topic = params.get('topic') ?? undefined
  const pi = params.get('pi') ?? undefined
  const count = Math.max(1, Math.min(50, Number(params.get('count') ?? 20)))

  const [set] = useState<Question[]>(() => drawPractice({ mode, area: area as AreaCode, topic, pi, count }, useStore.getState().tests))
  const [orders] = useState(() => set.map(() => optionOrder()))
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(() => set.map(() => null))
  const shownAt = useRef(Date.now())
  const ms = useRef<number[]>(set.map(() => 0))
  const startedAt = useRef(Date.now())
  const nextRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    shownAt.current = Date.now()
  }, [i])

  const title = titleFor(mode, area, mode === 'pi' ? pi : topic)
  const done = answers.filter((a) => a !== null).length
  const right = answers.filter((a, k) => a !== null && a === set[k].answer).length

  const finish = (all = answers) => {
    const recs: AnswerRecord[] = set.map((q, k) => ({ qid: q.id, chosen: all[k], correct: all[k] === q.answer, ms: ms.current[k] }))
    const answered = recs.filter((r) => r.chosen !== null)
    if (!answered.length) {
      nav('/exam')
      return
    }
    const id = newId('t')
    useStore.getState().addTest({ id, kind: kindFor[mode], title, startedAt: startedAt.current, finishedAt: Date.now(), answers: answered })
    nav(`/progress/test/${id}`, { replace: true })
  }

  const choose = (orig: number) => {
    if (answers[i] !== null) return
    ms.current[i] = Date.now() - shownAt.current
    const next = answers.slice()
    next[i] = orig
    setAnswers(next)
    useStore.getState().logActivity()
    useStore.getState().bumpDaily('questions')
    setTimeout(() => nextRef.current?.focus(), 50)
  }

  if (!set.length) {
    return (
      <Empty title="No questions here yet" action={<LinkButton to="/exam">Back to the exam trainer</LinkButton>}>
        {mode === 'missed' ? 'You have no missed questions to review. Nice work.' : 'There are no questions matching that filter.'}
      </Empty>
    )
  }

  const q = set[i]
  const isLast = i === set.length - 1
  return (
    <div className="mx-auto grid max-w-2xl gap-4">
      <div className="flex items-center gap-3">
        <Button variant="quiet" size="sm" onClick={() => (done ? finish() : nav('/exam'))} aria-label={done ? 'End and see report' : 'Leave practice'}>
          <X size={18} aria-hidden />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <h1 className="truncate text-lg">{title}</h1>
            <span className="num shrink-0 text-sm text-muted">
              {right}/{done} right
            </span>
          </div>
          <Bar value={(i + (answers[i] !== null ? 1 : 0)) / set.length} label="Progress through this set" className="mt-1" />
        </div>
      </div>

      <QuestionCard q={q} order={orders[i]} chosen={answers[i]} onChoose={choose} reveal number={i + 1} total={set.length} />

      <div className="flex flex-wrap justify-between gap-2">
        <Button variant="ghost" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>
          Back
        </Button>
        {isLast ? (
          <Button ref={nextRef} onClick={() => finish()} disabled={answers[i] === null}>
            See my report <ArrowRight size={18} aria-hidden />
          </Button>
        ) : (
          <Button ref={nextRef} onClick={() => setI(i + 1)} disabled={answers[i] === null}>
            Next <ArrowRight size={18} aria-hidden />
          </Button>
        )}
      </div>
      <p className="text-center text-xs text-muted">Tip: press 1–4 or A–D to answer, then Enter for next.</p>
    </div>
  )
}
