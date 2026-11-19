import { useSearchParams } from 'react-router-dom'
import type { DailyKind } from '@/lib/store'
import { DAILY_GOAL, useTodayCount } from '@/lib/today'
import { Bar, LinkButton } from './ui'

const NOUN: Record<DailyKind, string> = { cards: 'cards', questions: 'questions', math: 'problems', judge: 'questions', smart: 'smart practice questions' }

/** Shown when a screen is opened from Today's plan (?daily=1): a quiet line of progress toward today's small goal. */
export function DailyGoal({ kind }: { kind: DailyKind }) {
  const [params] = useSearchParams()
  const have = useTodayCount(kind)
  if (params.get('daily') !== '1') return null
  const need = DAILY_GOAL[kind]
  const done = have >= need
  return (
    <div className="mb-6 grid gap-2" role="status">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium">
          {done ? 'Done for today' : "Today's goal"} <span className="font-normal text-muted">· {NOUN[kind]}</span>
        </span>
        <span className="flex items-center gap-3">
          {done && <LinkButton size="sm" variant="ghost" to="/">Back to today's plan</LinkButton>}
          <span className="num text-muted">{Math.min(have, need)} of {need}</span>
        </span>
      </div>
      <Bar value={have / need} tone={done ? 'good' : 'accent'} label="Today's goal" />
    </div>
  )
}
