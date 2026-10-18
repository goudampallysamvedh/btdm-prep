import { useMemo } from 'react'
import { prefersReducedMotion } from '@/lib/motion'

const COLORS = ['var(--accent)', 'var(--good)', 'var(--warn)', 'var(--info)', 'var(--ink)']

/** A short, one-time confetti burst inside its (relative) parent. Decorative only. */
export function Confetti({ pieces = 22 }: { pieces?: number }) {
  const bits = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => {
        const angle = (i / pieces) * Math.PI * 2 + Math.random() * 0.4
        const dist = 90 + Math.random() * 90
        return {
          dx: `${Math.round(Math.cos(angle) * dist)}px`,
          dy: `${Math.round(Math.sin(angle) * dist * 0.7 + 60)}px`,
          rot: `${Math.round(Math.random() * 540 - 270)}deg`,
          color: COLORS[i % COLORS.length],
          delay: `${Math.round(Math.random() * 120)}ms`,
        }
      }),
    [pieces],
  )
  if (prefersReducedMotion()) return null
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {bits.map((b, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{ background: b.color, animationDelay: b.delay, ['--dx' as string]: b.dx, ['--dy' as string]: b.dy, ['--rot' as string]: b.rot }}
        />
      ))}
    </div>
  )
}
