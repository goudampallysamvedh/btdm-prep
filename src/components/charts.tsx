import { useId } from 'react'
import { fmtDate } from '@/lib/dates'

export interface Point {
  x: number // epoch ms
  y: number // 0..1
  label?: string
  series: 'mock' | 'practice' | 'official'
}

/** Score trend over time. Hand-built SVG: two series, 70% target line, accessible table fallback. */
export function TrendChart({ points, height = 200 }: { points: Point[]; height?: number }) {
  const id = useId()
  const W = 640
  const H = height
  const pad = { l: 36, r: 12, t: 12, b: 26 }
  if (points.length === 0) return null
  const xs = points.map((p) => p.x)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const sx = (x: number) => (maxX === minX ? (pad.l + W - pad.r) / 2 : pad.l + ((x - minX) / (maxX - minX)) * (W - pad.l - pad.r))
  const sy = (y: number) => pad.t + (1 - y) * (H - pad.t - pad.b)
  const series = (['practice', 'mock', 'official'] as const).map((s) => ({ s, pts: points.filter((p) => p.series === s).sort((a, b) => a.x - b.x) }))
  const color = { practice: 'var(--muted)', mock: 'var(--accent)', official: 'var(--good)' }

  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-labelledby={`${id}-t`}>
        <title id={`${id}-t`}>Score trend: {points.length} tests</title>
        {[0, 0.25, 0.5, 0.75, 1].map((g) => (
          <g key={g}>
            <line x1={pad.l} x2={W - pad.r} y1={sy(g)} y2={sy(g)} stroke="var(--line)" strokeWidth={1} />
            <text x={pad.l - 6} y={sy(g) + 4} textAnchor="end" fontSize="11" fill="var(--muted)" className="num">
              {Math.round(g * 100)}
            </text>
          </g>
        ))}
        <line x1={pad.l} x2={W - pad.r} y1={sy(0.7)} y2={sy(0.7)} stroke="var(--good)" strokeDasharray="5 5" strokeWidth={1.5} />
        <text x={W - pad.r} y={sy(0.7) - 5} textAnchor="end" fontSize="11" fill="var(--good)">
          70% AMA cert mark
        </text>
        {series.map(({ s, pts }) =>
          pts.length ? (
            <g key={s}>
              {pts.length > 1 && (
                <polyline
                  fill="none"
                  stroke={color[s]}
                  strokeWidth={s === 'mock' ? 3 : 2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeDasharray={s === 'practice' ? '1 0' : undefined}
                  points={pts.map((p) => `${sx(p.x)},${sy(p.y)}`).join(' ')}
                />
              )}
              {pts.map((p, i) => (
                <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={s === 'mock' ? 5 : 3.5} fill={s === 'mock' ? 'var(--accent)' : 'var(--card)'} stroke={color[s]} strokeWidth={2}>
                  <title>
                    {p.label ?? s}: {Math.round(p.y * 100)}% on {fmtDate(p.x)}
                  </title>
                </circle>
              ))}
            </g>
          ) : null,
        )}
        <text x={pad.l} y={H - 6} fontSize="11" fill="var(--muted)">
          {fmtDate(minX)}
        </text>
        <text x={W - pad.r} y={H - 6} fontSize="11" fill="var(--muted)" textAnchor="end">
          {fmtDate(maxX)}
        </text>
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <i className="inline-block size-2.5 rounded-full bg-accent" /> Mock exams
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="inline-block size-2.5 rounded-full border-2 border-muted" /> Practice sets
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="inline-block size-2.5 rounded-full bg-good" /> Official DECA samples
        </span>
      </figcaption>
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
      <polyline fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" points={values.map((v, i) => `${sx(i)},${sy(v)}`).join(' ')} />
    </svg>
  )
}
