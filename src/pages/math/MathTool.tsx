import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { TOOL_BY_ID, type Tool, type ToolMode } from './tools'
import { MathPractice } from './MathPractice'
import { SixMonthPlan } from './SixMonthPlan'
import { Card, Empty, LinkButton, PageHeader, SectionTitle, Segmented, cx, inputCls } from '@/components/ui'

export default function MathTool() {
  const { tool: id } = useParams()
  const tool = TOOL_BY_ID[id ?? '']
  if (!tool) return <Empty title="Tool not found" action={<LinkButton to="/math">Back to the math lab</LinkButton>} />
  return <ToolPage key={tool.id} tool={tool} />
}

function ToolPage({ tool }: { tool: Tool }) {
  const [modeId, setModeId] = useState(tool.modes[0]?.id ?? '')
  const mode = tool.modes.find((m) => m.id === modeId)
  return (
    <>
      <Link to="/math" className="mb-4 inline-flex min-h-9 items-center gap-1.5 text-sm font-medium text-muted no-underline hover:text-ink">
        <ArrowLeft size={16} strokeWidth={1.75} aria-hidden /> Math lab
      </Link>
      <PageHeader title={tool.title}>
        {tool.group} · {tool.blurb}
      </PageHeader>

      <div className={cx('grid gap-4', tool.modes.length > 0 && 'lg:grid-cols-[1fr_1.2fr]')}>
        <Card className="grid content-start gap-3">
          <h2 className="text-[0.95rem]">Formulas</h2>
          <dl className="grid gap-2">
            {tool.formulas.map((f) => (
              <div key={f.name} className="rounded-2xl bg-paper-2 px-4 py-3">
                <dt className="text-sm font-medium text-muted">{f.name}</dt>
                <dd className="num m-0 text-[1.05rem]">= {f.f}</dd>
              </div>
            ))}
          </dl>
          <p className="text-sm text-ink-2">
            <b className="font-semibold">Say it in a case:</b> {tool.caseUse}
          </p>
        </Card>

        {tool.modes.length > 0 && (
          <Card className="grid content-start gap-4">
            <h2 className="text-[0.95rem]">Calculator</h2>
            {tool.modes.length > 1 && (
              <Segmented label="Calculator mode" value={modeId} onChange={setModeId} options={tool.modes.map((m) => ({ value: m.id, label: m.label }))} />
            )}
            {mode && <Calculator key={mode.id} mode={mode} />}
          </Card>
        )}
      </div>

      {tool.id === 'six-month-plan' && (
        <div className="mt-4">
          <SixMonthPlan />
        </div>
      )}

      <SectionTitle>Practice</SectionTitle>
      <MathPractice kinds={tool.practice} title={`Practice: ${tool.title}`} />
    </>
  )
}

function Calculator({ mode }: { mode: ToolMode }) {
  const [vals, setVals] = useState<Record<string, string>>(() => Object.fromEntries(mode.fields.map((f) => [f.key, String(f.default)])))
  const out = useMemo(() => {
    const nums: Record<string, number> = {}
    for (const f of mode.fields) {
      const n = Number(vals[f.key])
      if (vals[f.key] === '' || !Number.isFinite(n)) return { error: `Enter a number for ${f.label}.` }
      nums[f.key] = n
    }
    try {
      return { rows: mode.compute(nums) }
    } catch (e) {
      return { error: (e as Error).message }
    }
  }, [vals, mode])

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {mode.fields.map((f) => (
          <label key={f.key} className="grid gap-1 text-sm">
            <span className="font-medium">{f.label}</span>
            <span className="relative">
              {f.unit === '$' && <span className="num pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">$</span>}
              <input
                inputMode="decimal"
                className={cx(inputCls, 'num !min-h-12 !rounded-2xl text-lg', f.unit === '$' && '!pl-8', (f.unit === '%' || f.unit === 'days') && '!pr-14')}
                value={vals[f.key]}
                onChange={(e) => setVals({ ...vals, [f.key]: e.target.value.replace(/[$,%\s]/g, '') })}
              />
              {f.unit === '%' && <span className="num pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted">%</span>}
              {f.unit === 'days' && <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted">days</span>}
            </span>
          </label>
        ))}
      </div>
      <div aria-live="polite" className="grid gap-2">
        {'error' in out ? (
          <p className="rounded-2xl bg-warn-bg px-4 py-3 text-sm text-warn">{out.error}</p>
        ) : (
          out.rows.map((r) => (
            <div key={r.label} className={cx('rounded-2xl px-4 py-3', r.primary ? 'bg-paper-2' : 'border border-line bg-paper')}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-muted">{r.label}</span>
                <span className={cx('num font-normal', r.primary ? 'text-[1.75rem] leading-tight text-accent' : 'text-lg')}>{r.value}</span>
              </div>
              <ul className="num mt-1 grid gap-0.5 text-xs text-muted">
                {r.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </>
  )
}
