import { useEffect } from 'react'
import { motion } from 'motion/react'
import { Check, Flag, X } from 'lucide-react'
import type { Question } from '@/types'
import { areaName } from '@/data/areas'
import { TOPIC_BY_ID } from '@/data/topics'
import { prefersReducedMotion } from '@/lib/motion'
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
  const correct = chosen === q.answer
  const still = prefersReducedMotion()

  return (
    <article className="card grid gap-5 p-5 sm:p-8 animate-rise" aria-labelledby={`stem-${q.id}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {number !== undefined && (
          <span className="num text-sm font-medium text-ink-2">
            Q{number}
            {total ? <span className="font-normal text-muted"> / {total}</span> : null}
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
              'ml-auto inline-flex min-h-11 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors',
              flagged ? 'bg-warn-bg text-warn' : 'text-muted hover:bg-paper-2 hover:text-ink',
            )}
          >
            <Flag size={16} strokeWidth={1.75} aria-hidden /> {flagged ? 'Flagged' : 'Flag'}
          </button>
        )}
      </div>
      <p id={`stem-${q.id}`} className="text-[1.3rem] font-medium leading-snug sm:text-[1.5rem]">
        {q.stem}
      </p>
      <div className="grid gap-2.5" role="radiogroup" aria-label="Answer choices">
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
                'flex min-h-14 w-full items-start gap-3.5 rounded-2xl border px-4 py-3.5 text-left text-[1.02rem] leading-snug transition-colors',
                state === 'idle' && 'border-line bg-paper',
                state === 'idle' && !locked && onChoose && 'hover:border-ink',
                state === 'idle' && locked && 'text-muted',
                state === 'chosen' && 'border-ink bg-paper',
                state === 'right' && 'border-good bg-good-bg',
                state === 'wrong' && 'border-bad bg-bad-bg animate-shake',
                locked && 'cursor-default',
              )}
            >
              <span
                className={cx(
                  'num grid size-7 shrink-0 place-items-center rounded-md border text-sm font-medium',
                  state === 'right' && 'border-good bg-good text-paper',
                  state === 'wrong' && 'border-bad bg-bad text-paper',
                  state === 'chosen' && 'border-ink bg-ink text-paper',
                  state === 'idle' && 'border-line-2 text-muted',
                )}
                aria-hidden
              >
                {state === 'right' || state === 'wrong' ? (
                  <motion.span
                    className="grid place-items-center"
                    initial={still ? false : { scale: 0.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 520, damping: 18 }}
                  >
                    {state === 'right' ? <Check size={16} strokeWidth={2.25} /> : <X size={16} strokeWidth={2.25} />}
                  </motion.span>
                ) : (
                  LETTERS[i]
                )}
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
        <motion.div
          role="status"
          initial={still ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
          className={cx('rounded-2xl px-4 py-3.5 leading-relaxed', correct ? 'bg-good-bg' : 'bg-bad-bg')}
        >
          <span className={cx('font-semibold', correct ? 'text-good' : 'text-bad')}>{correct ? 'Correct. ' : 'Not quite. '}</span>
          {q.explanation}
        </motion.div>
      )}
    </article>
  )
}
