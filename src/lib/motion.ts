import { useEffect, useRef, useState } from 'react'

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/** Counts a number up from 0 (first show) or from its last value, over about 0.7 s. */
export function useCountUp(target: number, ms = 700): number {
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? target : 0))
  const from = useRef(shown)
  useEffect(() => {
    if (prefersReducedMotion()) {
      setShown(target)
      return
    }
    const start = performance.now()
    const begin = from.current
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms)
      const eased = 1 - Math.pow(1 - t, 3)
      const v = Math.round(begin + (target - begin) * eased)
      setShown(v)
      from.current = v
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return shown
}
