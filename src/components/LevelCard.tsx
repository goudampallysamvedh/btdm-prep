import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import {
  Tag as TagIcon, Package, Layers, Flame, Timer, Target, Briefcase, Calculator, BookOpen, TrendingUp, Check, type LucideIcon,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { badgesOf, earned, levelFor, xpOf, type Badge, type XpSource } from '@/lib/xp'
import { prefersReducedMotion } from '@/lib/motion'
import Counter from './fx/Counter'
import { Confetti } from './Confetti'
import { cx } from './ui'

// Mirrors xpOf() in lib/xp.ts; keep the two in step.
const XP_RULES: [string, number][] = [
  ['Finish the daily plan', 25],
  ['Score a case', 40],
  ['Finish a lesson', 20],
  ['Exam question (+1 if right)', 2],
  ['Flashcard reviewed', 1],
]

const ICONS: Record<string, LucideIcon> = {
  first: TagIcon, q500: Package, cards: Layers, streak: Flame, mock: Timer,
  ace: Target, case: Briefcase, math: Calculator, lessons: BookOpen, trends: TrendingUp,
}

function useXpSource(): XpSource {
  const tests = useStore((s) => s.tests)
  const leitner = useStore((s) => s.leitner)
  const lessonsDone = useStore((s) => s.lessonsDone)
  const trendsRead = useStore((s) => s.trendsRead)
  const judgeDrill = useStore((s) => s.judgeDrill)
  const caseAttempts = useStore((s) => s.caseAttempts)
  const mathStats = useStore((s) => s.mathStats)
  const planDone = useStore((s) => s.planDone)
  return { tests, leitner, lessonsDone, trendsRead, judgeDrill, caseAttempts, mathStats, planDone }
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
      const fresh = key ? key.split(',').filter((id) => !before.has(id)) : []
      // Only ever switch the celebration on, so StrictMode's second effect run can't cancel it.
      if (level > prevLevel || fresh.length) setState({ leveledUp: level > prevLevel, fresh })
    } catch {
      // Storage blocked: skip the celebration.
    }
  }, [level, key])
  return state
}

export type Progression = ReturnType<typeof useProgression>

/** XP, level and badges, plus what is new since this device last showed them. Call once per screen. */
export function useProgression() {
  const src = useXpSource()
  const xp = xpOf(src)
  const lv = levelFor(xp)
  const badges = badgesOf(src)
  const news = useNewSinceLastVisit(lv.level, badges.filter(earned).map((b) => b.id))
  return { xp, lv, badges, ...news }
}

/** Home: rank on the buyer's career ladder, XP on a rolling register, and the next badge to chase. */
export function LevelPanel({ p, className }: { p: Progression; className?: string }) {
  const { xp, lv, badges, leveledUp } = p
  // The closest unearned badge, by share of the way there.
  const next = badges.filter((b) => !earned(b)).sort((a, b) => b.have / b.need - a.have / a.need)[0]
  const NextIcon = next ? ICONS[next.id] : Check

  return (
    <section className={cx('card relative grid content-start gap-5 overflow-hidden p-5', className)} aria-labelledby="level-h">
      {leveledUp && <Confetti />}
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="level-h" className="text-[0.95rem]">Level {lv.level}</h2>
        {leveledUp && (
          <motion.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent">
            Promoted
          </motion.span>
        )}
      </div>
      <div className="-mt-3 grid gap-1">
        <p className="font-display text-[1.9rem] leading-none">{lv.rank}</p>
        <p className="flex items-baseline gap-1 text-muted">
          <Counter value={xp} fontSize={18} fontWeight={500} textColor="var(--ink)" intro={!prefersReducedMotion()} motionBlur={false} />
          <span className="text-sm">XP</span>
        </p>
      </div>
      <div className="grid gap-1.5">
        <div className="h-1.5 overflow-hidden rounded-full bg-paper-2" role="progressbar" aria-valuemin={0} aria-valuemax={lv.span} aria-valuenow={lv.into} aria-label={`XP toward level ${lv.level + 1}`}>
          {lv.into > 0 && <motion.div className="h-full rounded-full bg-accent" initial={{ width: 0 }} animate={{ width: `${(lv.into / lv.span) * 100}%` }} transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }} />}
        </div>
        <div className="num flex justify-between text-xs text-muted">
          <span>Level {lv.level}</span>
          <span>{lv.span - lv.into} XP to level {lv.level + 1}</span>
        </div>
      </div>
      <dl className="grid gap-1.5 text-sm">
        <dt className="text-xs text-muted">How you earn XP</dt>
        {XP_RULES.map(([what, xp]) => (
          <div key={what} className="flex items-baseline justify-between gap-2">
            <dd className="text-ink-2">{what}</dd>
            <dd className="num text-muted">+{xp}</dd>
          </div>
        ))}
      </dl>
      {next && (
        <a href="#badges" className="flex items-center gap-3 rounded-2xl bg-paper px-3 py-2.5 text-ink no-underline transition-colors hover:bg-paper-2">
          <BadgeMedal badge={next} Icon={NextIcon} size={36} />
          <span className="min-w-0">
            <span className="block text-sm font-semibold">Next: {next.name}</span>
            <span className="num block text-xs text-muted">{Math.min(next.have, next.need)} of {next.need} · {next.how.toLowerCase()}</span>
          </span>
        </a>
      )}
    </section>
  )
}

/** A badge: a ring that fills as you get closer, solid ink once it's earned. */
function BadgeMedal({ badge, Icon, size = 52, fresh = false }: { badge: Badge; Icon: LucideIcon; size?: number; fresh?: boolean }) {
  const got = earned(badge)
  const stroke = size > 44 ? 3 : 2.5
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const p = Math.min(1, badge.have / badge.need)
  return (
    <motion.span
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
      initial={fresh && !prefersReducedMotion() ? { scale: 0.4, rotate: -25, opacity: 0 } : false}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.25 }}
      aria-hidden
    >
      {got ? (
        <span className="absolute inset-0 rounded-full bg-ink" />
      ) : (
        <svg width={size} height={size} className="absolute inset-0 -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="var(--paper)" stroke="var(--paper-2)" strokeWidth={stroke} />
          {p > 0 && <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--accent)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - p)} />}
        </svg>
      )}
      <Icon size={Math.round(size * 0.4)} strokeWidth={1.75} className={cx('relative', got ? 'text-paper' : 'text-muted')} />
      {fresh && <span className="absolute -inset-1 animate-ping rounded-full border-2 border-accent [animation-iteration-count:2]" />}
    </motion.span>
  )
}

/** Home: the badge shelf. Tap one to see what earns it. */
export function BadgeShelf({ p, className }: { p: Progression; className?: string }) {
  const { badges, fresh } = p
  const got = badges.filter(earned)
  const [open, setOpen] = useState<string | null>(fresh[0] ?? null)
  const sel = badges.find((b) => b.id === (open ?? fresh[0]))

  return (
    <section id="badges" className={cx('card grid content-start gap-4 p-5', className)} aria-labelledby="badges-h">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="badges-h" className="text-[0.95rem]">Badges</h2>
        <span className="num text-sm text-muted">{got.length} of {badges.length} earned</span>
      </div>
      <ul className="grid grid-cols-5 gap-x-2 gap-y-4">
        {badges.map((b) => {
          const Icon = ICONS[b.id]
          const isOpen = sel?.id === b.id
          return (
            <li key={b.id} className="grid justify-items-center">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : b.id)}
                aria-pressed={isOpen}
                aria-label={`${b.name}: ${earned(b) ? 'earned' : `${Math.min(b.have, b.need)} of ${b.need}`}`}
                className={cx(
                  'grid justify-items-center gap-1.5 rounded-2xl px-1 py-2 transition-[background-color,scale] active:scale-95',
                  isOpen ? 'bg-paper' : 'hover:bg-paper/70',
                )}
              >
                <BadgeMedal badge={b} Icon={Icon} fresh={fresh.includes(b.id)} />
                <span className={cx('max-w-[5.5rem] text-center text-[0.72rem] font-medium leading-tight', earned(b) ? 'text-ink' : 'text-muted')}>{b.name}</span>
              </button>
            </li>
          )
        })}
      </ul>
      <p className="min-h-6 text-sm text-ink-2" aria-live="polite">
        {sel ? (
          <motion.span key={sel.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="block">
            <b className="font-semibold">{sel.name}</b>: {sel.how}.{' '}
            <span className="num text-muted">{earned(sel) ? (fresh.includes(sel.id) ? 'Just earned.' : 'Earned.') : `${Math.min(sel.have, sel.need)} of ${sel.need} so far.`}</span>
          </motion.span>
        ) : (
          <span className="text-muted">Each ring fills as you get closer. Tap a badge to see what earns it.</span>
        )}
      </p>
    </section>
  )
}
