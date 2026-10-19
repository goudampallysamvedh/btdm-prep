import { useSearchParams } from 'react-router-dom'
import type { DailyKind } from '@/lib/store'
import { DAILY_GOAL, useTodayCount } from '@/lib/today'
import { Bar, LinkButton } from './ui'

const NOUN: Record<DailyKind, string> = { cards: 'cards', questions: 'questions', math: 'problems', judge: 'questions', smart: 'smart practice questions' }

/** Shown when a screen is opened from Today's plan (?daily=1): progress toward today's small goal. */
export function DailyGoal({ kind }: { kind: DailyKind }) {
  const [params] = useSearchParams()
  const have = useTodayCount(kind)
  if (params.get('daily') !== '1') return null
  const need = DAILY_GOAL[kind]
  const done = have >= need
  return (
    <div className="mb-4 grid gap-2 rounded-xl bg-accent-soft px-4 py-3" role="status">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-bold">{done ? 'Done for today! 🎉' : `Today's goal: ${Math.min(have, need)} of ${need} ${NOUN[kind]}`}</span>
        {done && <LinkButton size="sm" to="/">Back to today's plan</LinkButton>}
      </div>
      <Bar value={have / need} tone={done ? 'good' : 'accent'} label="Today's goal" />
    </div>
  )
}
