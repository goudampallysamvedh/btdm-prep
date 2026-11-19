import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { AREAS } from '@/data/areas'
import type { AreaReadiness } from '@/lib/mastery'
import { prefersReducedMotion } from '@/lib/motion'
import { Tooltip, TooltipContent, TooltipTrigger } from './shadcn/tooltip'

/** How many of an area's exam questions you'd expect to get right, as whole squares. */
export const expectedRight = (r: AreaReadiness) => Math.round(r.weight * r.accuracy)

/**
 * The exam as a planogram: the 100-question blueprint laid out like a shelf plan. Each
 * instructional area is a facing as wide as its share of the exam (one square per question),
 * stocked with the questions you'd likely get right. Untried areas stay grey.
 */
export function Planogram({ ready }: { ready: AreaReadiness[] }) {
  const byArea = new Map(ready.map((r) => [r.area, r]))
  const animateIn = !prefersReducedMotion()
  let index = 0
  return (
    <ul className="flex flex-wrap gap-x-2 gap-y-3" aria-label="Exam readiness by area: one square per exam question">
      {AREAS.map((a) => {
        const r = byArea.get(a.code)!
        const right = r.answered ? expectedRight(r) : 0
        const pct = Math.round(r.accuracy * 100)
        const start = index
        index += a.weight
        return (
          <li key={a.code}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to={`/exam/practice?mode=area&area=${a.code}&count=10`}
                  className="group grid gap-1.5 rounded-md p-1 no-underline outline-offset-1 transition-colors hover:bg-paper-2"
                  aria-label={`${a.name}: ${a.weight} exam questions, ${r.answered ? `about ${right} right (${pct}%)` : 'not practiced yet'}. Practice it.`}
                >
                  <span className="grid grid-flow-col grid-rows-3 gap-[3px]" aria-hidden>
                    {Array.from({ length: a.weight }, (_, i) => (
                      <motion.span
                        key={i}
                        className={
                          'size-[15px] rounded-[3px] ' +
                          (!r.answered ? 'bg-paper-2' : i < right ? 'bg-accent' : 'bg-marker')
                        }
                        initial={animateIn ? { opacity: 0, scale: 0.4 } : false}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (start + i) * 0.006, duration: 0.25 }}
                      />
                    ))}
                  </span>
                  <span className="text-center text-[0.7rem] font-medium leading-none text-muted group-hover:text-ink">{a.code}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={6}>
                <span className="font-semibold">{a.name}</span>
                <span className="num block opacity-80">
                  {a.weight} questions · {r.answered ? `${pct}% on ${r.answered} tried` : 'not practiced yet'}
                </span>
              </TooltipContent>
            </Tooltip>
          </li>
        )
      })}
    </ul>
  )
}

/** The key: each swatch is the mark it explains. */
export function PlanogramKey() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
      <li className="flex items-center gap-1.5"><span className="size-3 rounded-[3px] bg-accent" aria-hidden />Likely right</li>
      <li className="flex items-center gap-1.5"><span className="size-3 rounded-[3px] bg-marker" aria-hidden />Likely missed</li>
      <li className="flex items-center gap-1.5"><span className="size-3 rounded-[3px] bg-paper-2" aria-hidden />Not practiced</li>
    </ul>
  )
}
