import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MessageSquareQuote } from 'lucide-react'
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
      <Link to="/math" className="mb-3 inline-flex items-center gap-1 text-sm font-bold no-underline">
        <ArrowLeft size={16} aria-hidden /> Math lab
      </Link>
      <PageHeader eyebrow={tool.group} title={tool.title}>
        {tool.blurb}
      </PageHeader>

      <div className={cx('grid gap-4', tool.modes.length > 0 && 'lg:grid-cols-[1fr_1.2fr]')}>
        <Card className="grid content-start gap-3">
          <h2 className="text-lg">Formulas</h2>
          <dl className="grid gap-2">
            {tool.formulas.map((f) => (
              <div key={f.name} className="rounded-xl bg-paper-2 px-3 py-2">
                <dt className="text-sm font-bold">{f.name}</dt>
                <dd className="num m-0 text-[0.92rem]">= {f.f}</dd>
              </div>
            ))}
          </dl>
          <div className="flex gap-2 rounded-xl border border-dashed border-line-2 p-3 text-sm">
            <MessageSquareQuote size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden />
            <span>
              <b>Say it in a case:</b> {tool.caseUse}
            </span>
          </div>
        </Card>

        {tool.modes.length > 0 && (
          <Card className="grid content-start gap-4">
            <h2 className="text-lg">Calculator</h2>
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
            <span className="font-bold">{f.label}</span>
            <span className="relative">
              {f.unit === '$' && <span className="num pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>}
              <input
                inputMode="decimal"
                className={cx(inputCls, 'num', f.unit === '$' && 'pl-7', (f.unit === '%' || f.unit === 'days') && 'pr-12')}
                value={vals[f.key]}
                onChange={(e) => setVals({ ...vals, [f.key]: e.target.value.replace(/[$,%\s]/g, '') })}
              />
              {f.unit === '%' && <span className="num pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">%</span>}
              {f.unit === 'days' && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">days</span>}
            </span>
          </label>
        ))}
      </div>
      <div aria-live="polite" className="grid gap-2">
        {'error' in out ? (
          <p className="rounded-xl bg-warn-bg px-3 py-2 text-sm text-warn">{out.error}</p>
        ) : (
          out.rows.map((r) => (
            <div key={r.label} className={cx('rounded-xl border px-3 py-2.5', r.primary ? 'border-accent bg-accent-soft' : 'border-line')}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm font-bold">{r.label}</span>
                <span className={cx('num font-bold', r.primary ? 'text-xl text-accent' : 'text-lg')}>{r.value}</span>
              </div>
              <ul className="num mt-1 grid gap-0.5 text-xs text-ink-2">
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
