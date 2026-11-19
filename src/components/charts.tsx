import { useEffect, useId, useRef, useState } from 'react'
import { fmtDate } from '@/lib/dates'

export interface Point {
  x: number // epoch ms
  y: number // 0..1
  label?: string
  series: 'mock' | 'practice' | 'official'
}

/**
 * Score trend over time. Hand-built SVG: one line in the accent hue through every test, a quiet 70%
 * target. Mock exams are filled dots, practice sets outlined, official samples ringed in ink.
 * Drawn at its real pixel width so the grey 12px labels stay 12px on a phone.
 */
export function TrendChart({ points, height = 220 }: { points: Point[]; height?: number }) {
  const id = useId()
  const box = useRef<HTMLDivElement>(null)
  const [W, setW] = useState(640)
  useEffect(() => {
    const el = box.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => setW(Math.max(240, Math.round(el.clientWidth))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const H = height
  const pad = { l: 34, r: 10, t: 12, b: 28 }
  if (points.length === 0) return null
  const xs = points.map((p) => p.x)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const sx = (x: number) => (maxX === minX ? (pad.l + W - pad.r) / 2 : pad.l + ((x - minX) / (maxX - minX)) * (W - pad.l - pad.r))
  const sy = (y: number) => pad.t + (1 - y) * (H - pad.t - pad.b)
  const line = points.filter((p) => p.series !== 'official').sort((a, b) => a.x - b.x)
  const official = points.filter((p) => p.series === 'official')
  const kinds = [points.some((p) => p.series === 'mock') && 'filled: mock exams', points.some((p) => p.series === 'practice') && 'outlined: practice sets', official.length > 0 && 'ringed: official samples'].filter(Boolean)

  return (
    <figure className="m-0">
      <div ref={box} className="w-full overflow-hidden">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block max-w-full" role="img" aria-labelledby={`${id}-t`}>
          <title id={`${id}-t`}>Score trend: {points.length} tests</title>
          {[0, 0.25, 0.5, 0.75, 1].map((g) => (
            <g key={g}>
              <line x1={pad.l} x2={W - pad.r} y1={sy(g)} y2={sy(g)} stroke="var(--line)" strokeWidth={1} />
              <text x={pad.l - 8} y={sy(g) + 4} textAnchor="end" fontSize="12" fill="var(--muted)" className="num">
                {Math.round(g * 100)}
              </text>
            </g>
          ))}
          <line x1={pad.l} x2={W - pad.r} y1={sy(0.7)} y2={sy(0.7)} stroke="var(--muted)" strokeDasharray="4 5" strokeWidth={1} />
          <text x={W - pad.r} y={sy(0.7) - 6} textAnchor="end" fontSize="12" fill="var(--muted)">
            70% AMA cert mark
          </text>
          {line.length > 1 && (
            <polyline fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" points={line.map((p) => `${sx(p.x)},${sy(p.y)}`).join(' ')} />
          )}
          {line.map((p, i) => (
            <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={p.series === 'mock' ? 5 : 3.5} fill={p.series === 'mock' ? 'var(--accent)' : 'var(--card)'} stroke="var(--accent)" strokeWidth={2}>
              <title>
                {p.label ?? p.series}: {Math.round(p.y * 100)}% on {fmtDate(p.x)}
              </title>
            </circle>
          ))}
          {official.map((p, i) => (
            <circle key={`o${i}`} cx={sx(p.x)} cy={sy(p.y)} r={5} fill="var(--card)" stroke="var(--ink)" strokeWidth={2}>
              <title>
                {p.label ?? 'Official sample'}: {Math.round(p.y * 100)}% on {fmtDate(p.x)}
              </title>
            </circle>
          ))}
          <text x={pad.l} y={H - 6} fontSize="12" fill="var(--muted)">
            {fmtDate(minX)}
          </text>
          <text x={W - pad.r} y={H - 6} fontSize="12" fill="var(--muted)" textAnchor="end">
            {fmtDate(maxX)}
          </text>
        </svg>
      </div>
      {kinds.length > 1 && <figcaption className="mt-1 text-xs text-muted">Dots, {kinds.join(' · ')}.</figcaption>}
    </figure>
  )
}

/** Tiny inline sparkline for a list of 0..1 values. */
export function Sparkline({ values, width = 80, height = 24 }: { values: number[]; width?: number; height?: number }) {
  if (values.length < 2) return null
  const sx = (i: number) => (i / (values.length - 1)) * (width - 4) + 2
  const sy = (v: number) => 2 + (1 - v) * (height - 4)
  return (
    <svg width={width} height={height} aria-hidden className="inline-block">
      <polyline fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" points={values.map((v, i) => `${sx(i)},${sy(v)}`).join(' ')} />
    </svg>
  )
}
