import { useMemo, useState } from 'react'
import * as M from '@/lib/retailMath'
import { Card, cx, inputCls } from '@/components/ui'

const DEFAULT = [
  { name: 'Feb', salesPct: 12, ssRatio: 4, reductionsPct: 5 },
  { name: 'Mar', salesPct: 16, ssRatio: 3.5, reductionsPct: 5 },
  { name: 'Apr', salesPct: 18, ssRatio: 3.2, reductionsPct: 6 },
  { name: 'May', salesPct: 20, ssRatio: 3, reductionsPct: 8 },
  { name: 'Jun', salesPct: 19, ssRatio: 3, reductionsPct: 10 },
  { name: 'Jul', salesPct: 15, ssRatio: 3.4, reductionsPct: 15 },
]

const k = (n: number) => `$${M.num(n / 1000, 1)}k`

export function SixMonthPlan() {
  const [season, setSeason] = useState('500000')
  const [endEom, setEndEom] = useState('220000')
  const [imu, setImu] = useState('50')
  const [months, setMonths] = useState(DEFAULT)

  const totalPct = months.reduce((s, m) => s + m.salesPct, 0)
  const rows = useMemo(() => {
    const s = Number(season)
    const e = Number(endEom)
    const i = Number(imu) / 100
    if (!(s > 0) || !(e >= 0) || !(i >= 0 && i < 1)) return null
    return M.sixMonthPlan(
      s,
      months.map((m) => ({ name: m.name, salesPct: m.salesPct / 100, ssRatio: m.ssRatio, reductionsPct: m.reductionsPct / 100 })),
      e,
      i,
    )
  }, [season, endEom, imu, months])

  const setCell = (idx: number, key: 'salesPct' | 'ssRatio' | 'reductionsPct', v: string) => {
    const n = Number(v)
    setMonths(months.map((m, j) => (j === idx ? { ...m, [key]: Number.isFinite(n) ? n : 0 } : m)))
  }

  return (
    <Card className="grid gap-4">
      <h2 className="text-lg">Spring season plan</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1 text-sm">
          <span className="font-bold">Season sales (retail)</span>
          <input className={inputCls + ' num'} inputMode="decimal" value={season} onChange={(e) => setSeason(e.target.value.replace(/[$,\s]/g, ''))} />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-bold">EOM after the last month</span>
          <input className={inputCls + ' num'} inputMode="decimal" value={endEom} onChange={(e) => setEndEom(e.target.value.replace(/[$,\s]/g, ''))} />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-bold">Initial markup %</span>
          <input className={inputCls + ' num'} inputMode="decimal" value={imu} onChange={(e) => setImu(e.target.value.replace(/[%\s]/g, ''))} />
        </label>
      </div>
      {Math.abs(totalPct - 100) > 0.01 && (
        <p className="rounded-xl bg-warn-bg px-3 py-2 text-sm text-warn">Monthly sales shares add up to {M.num(totalPct, 1)}%, not 100%.</p>
      )}
      <div className="scroll-x -mx-1 px-1">
        <table className="num w-full min-w-[640px] border-collapse text-sm">
          <caption className="sr-only">Six-month merchandise plan</caption>
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted">
              <th className="py-2 pr-2">Month</th>
              <th className="px-2">% of season</th>
              <th className="px-2">Sales</th>
              <th className="px-2">S/S ratio</th>
              <th className="px-2">BOM</th>
              <th className="px-2">Red. %</th>
              <th className="px-2">Reductions</th>
              <th className="px-2">EOM</th>
              <th className="px-2 text-accent">Purchases</th>
              <th className="px-2">At cost</th>
            </tr>
          </thead>
          <tbody>
            {months.map((m, i) => {
              const r = rows?.[i]
              return (
                <tr key={m.name} className="border-t border-line">
                  <th scope="row" className="py-1.5 pr-2 text-left">{m.name}</th>
                  <td className="px-1"><CellInput label={`${m.name} % of season`} value={m.salesPct} onChange={(v) => setCell(i, 'salesPct', v)} /></td>
                  <td className="px-2">{r ? k(r.sales) : '—'}</td>
                  <td className="px-1"><CellInput label={`${m.name} stock-to-sales ratio`} value={m.ssRatio} onChange={(v) => setCell(i, 'ssRatio', v)} /></td>
                  <td className="px-2">{r ? k(r.bom) : '—'}</td>
                  <td className="px-1"><CellInput label={`${m.name} reductions %`} value={m.reductionsPct} onChange={(v) => setCell(i, 'reductionsPct', v)} /></td>
                  <td className="px-2">{r ? k(r.reductions) : '—'}</td>
                  <td className="px-2">{r ? k(r.eom) : '—'}</td>
                  <td className={cx('px-2 font-bold', r && r.purchases < 0 ? 'text-bad' : 'text-accent')}>{r ? k(r.purchases) : '—'}</td>
                  <td className="px-2">{r ? k(r.purchasesCost) : '—'}</td>
                </tr>
              )
            })}
          </tbody>
          {rows && (
            <tfoot>
              <tr className="border-t-2 border-line-2 font-bold">
                <th scope="row" className="py-2 pr-2 text-left">Season</th>
                <td className="px-2">{M.num(totalPct, 0)}%</td>
                <td className="px-2">{k(rows.reduce((s, r) => s + r.sales, 0))}</td>
                <td />
                <td />
                <td />
                <td className="px-2">{k(rows.reduce((s, r) => s + r.reductions, 0))}</td>
                <td />
                <td className="px-2 text-accent">{k(rows.reduce((s, r) => s + r.purchases, 0))}</td>
                <td className="px-2">{k(rows.reduce((s, r) => s + r.purchasesCost, 0))}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <ul className="grid gap-1 text-xs text-muted">
        <li>• BOM = sales × stock-to-sales ratio. Each month's EOM is the next month's BOM.</li>
        <li>• Purchases = sales + reductions + EOM − BOM. A negative number (red) means the plan carries too much stock into that month.</li>
        <li>• Values shown in thousands ($k).</li>
      </ul>
    </Card>
  )
}

function CellInput({ label, value, onChange }: { label: string; value: number; onChange: (v: string) => void }) {
  return (
    <input
      aria-label={label}
      inputMode="decimal"
      className="num w-16 rounded-lg border border-line-2 bg-card px-2 py-1 text-right focus:border-accent focus:outline-none"
      defaultValue={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
