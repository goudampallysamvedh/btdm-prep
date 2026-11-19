import { useEffect, useState } from 'react'
import { Award, Sparkles } from 'lucide-react'
import { useStore } from '@/lib/store'
import { badgesOf, earned, levelFor, xpOf, type Badge } from '@/lib/xp'
import { useCountUp } from '@/lib/motion'
import { Bar, cx } from './ui'
import { Confetti } from './Confetti'

/** Home: current rank, XP to the next level, and the badge shelf. */
export function LevelCard() {
  const tests = useStore((s) => s.tests)
  const leitner = useStore((s) => s.leitner)
  const lessonsDone = useStore((s) => s.lessonsDone)
  const trendsRead = useStore((s) => s.trendsRead)
  const judgeDrill = useStore((s) => s.judgeDrill)
  const caseAttempts = useStore((s) => s.caseAttempts)
  const mathStats = useStore((s) => s.mathStats)
  const planDone = useStore((s) => s.planDone)

  const src = { tests, leitner, lessonsDone, trendsRead, judgeDrill, caseAttempts, mathStats, planDone }
  const xp = xpOf(src)
  const badges = badgesOf(src)
  const lv = levelFor(xp)
  const shownXp = useCountUp(xp)
  const got = badges.filter(earned)
  const { leveledUp, fresh } = useNewSinceLastVisit(lv.level, got.map((b) => b.id))
  const [open, setOpen] = useState<string | null>(null)
  const sel = badges.find((b) => b.id === open)

  return (
    <section className="card relative mt-4 grid gap-4 overflow-hidden p-4 sm:p-5" aria-labelledby="level-h">
      {leveledUp && <Confetti />}
      <div className="flex items-center gap-4">
        <span className="level-badge num grid size-14 shrink-0 place-items-center rounded-2xl text-2xl font-extrabold" aria-hidden>
          {lv.level}
        </span>
        <div className="min-w-0 flex-1">
          <p className="eyebrow flex items-center gap-1.5">
            Level {lv.level}
            {leveledUp && <span className="tag animate-pop" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}><Sparkles size={11} aria-hidden />Level up!</span>}
          </p>
          <h2 id="level-h" className="truncate text-xl">{lv.rank}</h2>
          <div className="mt-2 grid gap-1">
            <Bar value={lv.into / lv.span} label={`${lv.into} of ${lv.span} XP to level ${lv.level + 1}`} />
            <span className="num flex justify-between text-xs text-muted">
              <span><span aria-hidden>{shownXp}</span><span className="sr-only">{xp}</span> XP total</span>
              <span>{lv.span - lv.into} XP to level {lv.level + 1}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <div className="flex items-baseline justify-between">
          <h3 className="flex items-center gap-1.5 text-base"><Award size={16} className="text-accent" aria-hidden />Badges</h3>
          <span className="num text-xs text-muted">{got.length}/{badges.length}</span>
        </div>
        <ul className="grid grid-cols-5 gap-2 sm:grid-cols-10">
          {badges.map((b, i) => (
            <li key={b.id}>
              <button
                type="button"
                onClick={() => setOpen(open === b.id ? null : b.id)}
                aria-pressed={open === b.id}
                aria-label={`${b.name}: ${earned(b) ? 'earned' : `${Math.min(b.have, b.need)} of ${b.need}`}`}
                className={cx(
                  'badge-tile relative grid aspect-square w-full place-items-center rounded-xl border text-2xl animate-deal',
                  earned(b) ? 'border-accent/40 bg-accent-soft' : open === b.id ? 'border-line bg-paper-2' : 'border-line bg-paper-2 grayscale opacity-70',
                  open === b.id && 'ring-2 ring-accent ring-offset-2 ring-offset-card',
                  fresh.includes(b.id) && 'badge-new',
                )}
                style={{ animationDelay: `${i * 35}ms` }}
              >
                <span aria-hidden>{b.emoji}</span>
                {!earned(b) && <BadgeProgress b={b} />}
              </button>
            </li>
          ))}
        </ul>
        <p className="min-h-10 text-sm text-ink-2" aria-live="polite">
          {sel ? (
            <span key={sel.id} className="block animate-rise">
              <b>{sel.name}</b> · {sel.how}.{' '}
              <span className="num text-muted">{earned(sel) ? 'Earned ✓' : `${Math.min(sel.have, sel.need)}/${sel.need}`}</span>
            </span>
          ) : (
            <span className="text-muted">Tap a badge to see how to earn it.</span>
          )}
        </p>
      </div>
    </section>
  )
}

function BadgeProgress({ b }: { b: Badge }) {
  return (
    <span className="absolute inset-x-1.5 bottom-1.5 h-1 overflow-hidden rounded-full bg-line" aria-hidden>
      <span className="block h-full rounded-full bg-accent" style={{ width: `${Math.min(1, b.have / b.need) * 100}%` }} />
    </span>
  )
}

/** Compares level and badges with what this device last showed; the first visit just records them. */
function useNewSinceLastVisit(level: number, ids: string[]) {
  const [state, setState] = useState<{ leveledUp: boolean; fresh: string[] }>({ leveledUp: false, fresh: [] })
  const key = ids.join(',')
  useEffect(() => {
    try {
      const prevLevel = Number(localStorage.getItem('st-level'))
      const prevIds = localStorage.getItem('st-badges')
      localStorage.setItem('st-level', String(level))
      localStorage.setItem('st-badges', key)
      if (!prevLevel || prevIds === null) return
      const before = new Set(prevIds.split(','))
      const fresh = ids.filter((id) => !before.has(id))
      // Only ever switch the celebration on, so StrictMode's second effect run can't cancel it.
      if (level > prevLevel || fresh.length) setState({ leveledUp: level > prevLevel, fresh })
    } catch {
      // Storage blocked: skip the celebration.
    }
  }, [level, key]) // eslint-disable-line react-hooks/exhaustive-deps
  return state
}
