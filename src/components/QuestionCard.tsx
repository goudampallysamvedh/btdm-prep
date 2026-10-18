import { useEffect, useRef } from 'react'
import { Check, Flag, X } from 'lucide-react'
import type { Question } from '@/types'
import { areaName } from '@/data/areas'
import { TOPIC_BY_ID } from '@/data/topics'
import { cx, Tag } from './ui'

const LETTERS = ['A', 'B', 'C', 'D']

export function QuestionCard({
  q,
  order,
  chosen,
  onChoose,
  reveal,
  flagged,
  onFlag,
  number,
  total,
}: {
  q: Question
  /** Display index -> original option index. */
  order: number[]
  /** Original option index the user chose. */
  chosen: number | null
  onChoose?: (originalIndex: number) => void
  /** Show right/wrong and the explanation. */
  reveal: boolean
  flagged?: boolean
  onFlag?: () => void
  number?: number
  total?: number
}) {
  const stemRef = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    // Keyboard: 1-4 or A-D picks an answer.
    if (!onChoose || (reveal && chosen !== null)) return
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      const k = e.key.toUpperCase()
      const i = '1234'.indexOf(k) >= 0 ? '1234'.indexOf(k) : LETTERS.indexOf(k)
      if (i >= 0 && i < 4) {
        e.preventDefault()
        onChoose(order[i])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onChoose, order, reveal, chosen])

  const locked = reveal && chosen !== null
  const topic = TOPIC_BY_ID[q.topic]

  return (
    <article className="card grid gap-4 p-4 sm:p-6 animate-rise" aria-labelledby={`stem-${q.id}`}>
      <div className="flex flex-wrap items-center gap-2">
        {number !== undefined && (
          <span className="num text-sm font-bold text-muted">
            Q{number}
            {total ? <span className="font-normal"> / {total}</span> : null}
          </span>
        )}
        <Tag>{q.pi}</Tag>
        <span className="text-sm text-muted">{areaName(q.area)}</span>
        {locked && topic && <span className="text-sm text-muted">· {topic.name}</span>}
        {onFlag && (
          <button
            type="button"
            onClick={onFlag}
            aria-pressed={!!flagged}
            className={cx(
              'ml-auto inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-bold',
              flagged ? 'bg-warn-bg text-warn' : 'text-muted hover:bg-paper-2',
            )}
          >
            <Flag size={16} aria-hidden /> {flagged ? 'Flagged' : 'Flag'}
          </button>
        )}
      </div>
      <p id={`stem-${q.id}`} ref={stemRef} className="text-[1.08rem] font-bold leading-snug sm:text-lg">
        {q.stem}
      </p>
      <div className="grid gap-2" role="radiogroup" aria-label="Answer choices">
        {order.map((orig, i) => {
          const isChosen = chosen === orig
          const isRight = orig === q.answer
          const state = !locked ? (isChosen ? 'chosen' : 'idle') : isRight ? 'right' : isChosen ? 'wrong' : 'idle'
          return (
            <button
              key={orig}
              type="button"
              role="radio"
              aria-checked={isChosen}
              disabled={locked || !onChoose}
              onClick={() => onChoose?.(orig)}
              className={cx(
                'flex min-h-12 items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors',
                state === 'idle' && 'border-line bg-card hover:border-accent',
                state === 'chosen' && 'border-accent bg-accent-soft',
                state === 'right' && 'border-good bg-good-bg',
                state === 'wrong' && 'border-bad bg-bad-bg animate-shake',
                state === 'right' && isChosen && 'animate-pop',
                locked && 'cursor-default',
              )}
            >
              <span
                className={cx(
                  'num grid size-7 shrink-0 place-items-center rounded-lg text-sm font-bold',
                  state === 'right' ? 'bg-good text-card' : state === 'wrong' ? 'bg-bad text-card' : state === 'chosen' ? 'bg-accent text-accent-ink' : 'bg-paper-2 text-muted',
                )}
                aria-hidden
              >
                {state === 'right' ? <Check size={16} /> : state === 'wrong' ? <X size={16} /> : LETTERS[i]}
              </span>
              <span className="pt-0.5">{q.options[orig]}</span>
              <span className="sr-only">
                {state === 'right' ? ' (correct answer)' : state === 'wrong' ? ' (your answer, incorrect)' : ''}
              </span>
            </button>
          )
        })}
      </div>
      {locked && (
        <div
          role="status"
          className={cx('rounded-r-xl border-l-4 px-4 py-3 animate-rise', chosen === q.answer ? 'border-good bg-good-bg' : 'border-bad bg-bad-bg')}
        >
          <b>{chosen === q.answer ? 'Correct. ' : 'Not quite. '}</b>
          {q.explanation}
        </div>
      )}
    </article>
  )
}
