import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useCountUp } from '@/lib/motion'

/** A big-number tile (Home, partner page). Numbers count up when the screen opens. */
export function Stat({ icon, value, unit, label, to }: { icon: ReactNode; value: number | string; unit?: string; label: string; to?: string }) {
  const counted = useCountUp(typeof value === 'number' ? value : 0)
  const body = (
    <>
      <span className="text-accent">{icon}</span>
      <span className="mt-1 flex items-baseline gap-0.5">
        <span className="num font-display text-[clamp(1.9rem,8vw,2.75rem)] font-extrabold leading-none">
          {typeof value === 'number' ? <><span aria-hidden>{counted}</span><span className="sr-only">{value}</span></> : value}
        </span>
        {unit && <span className="num text-sm font-bold text-muted">{unit}</span>}
      </span>
      <span className="mt-1 text-xs font-bold leading-snug text-ink-2 sm:text-sm">{label}</span>
    </>
  )
  const cls = 'card flex min-w-0 flex-col p-3 text-ink no-underline sm:p-4'
  return to ? <Link to={to} className={cls + ' lift hover:border-accent'}>{body}</Link> : <div className={cls}>{body}</div>
}
