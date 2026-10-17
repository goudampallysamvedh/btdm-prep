import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChevronRight, Lightbulb, RefreshCw, X } from 'lucide-react'
import { GENERATORS, GENERATOR_BY_KIND, displayAnswer, isCorrect, parseAnswer, type Problem } from '@/lib/mathProblems'
import { pick } from '@/lib/random'
import { useStore } from '@/lib/store'
import { Button, Card, cx, inputCls } from '@/components/ui'

const unitHint: Record<Problem['unit'], string> = { '$': 'dollars, e.g. 45.00', '%': 'percent, e.g. 40', x: 'times, e.g. 3.5', units: 'units, e.g. 80', weeks: 'weeks, e.g. 6' }

/** Endless practice: generates a problem, checks the typed answer, shows the worked steps. */
export function MathPractice({ kinds, title = 'Endless practice' }: { kinds?: string[]; title?: string }) {
  const pool = kinds?.length ? kinds : GENERATORS.map((g) => g.kind)
  const [kind, setKind] = useState<string>('any')
  const make = (k = kind) => {
    const g = GENERATOR_BY_KIND[k === 'any' ? pick(pool) : k]
    return g.make(Math.random)
  }
  const [p, setP] = useState<Problem>(() => make())
  const [typed, setTyped] = useState('')
  const [result, setResult] = useState<null | 'right' | 'wrong'>(null)
  const [showSteps, setShowSteps] = useState(false)
  const [run, setRun] = useState({ right: 0, total: 0, streak: 0 })
  const inputRef = useRef<HTMLInputElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [p])

  const next = (k = kind) => {
    setP(make(k))
    setTyped('')
    setResult(null)
    setShowSteps(false)
  }

  const check = () => {
    const v = parseAnswer(typed)
    if (v === null) return
    const ok = isCorrect(p, v)
    setResult(ok ? 'right' : 'wrong')
    setShowSteps(true)
    setRun((r) => ({ right: r.right + (ok ? 1 : 0), total: r.total + 1, streak: ok ? r.streak + 1 : 0 }))
    const st = useStore.getState()
    st.recordMath(GENERATOR_BY_KIND[p.kind]?.label ?? p.kind, ok)
    st.logActivity()
    st.bumpDaily('math')
    setTimeout(() => nextRef.current?.focus(), 30)
  }

  return (
    <Card className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl">{title}</h2>
        <span className="num text-sm text-muted">
          {run.right}/{run.total} right{run.streak >= 3 ? ` · 🔥 ${run.streak} in a row` : ''}
        </span>
      </div>
      {pool.length > 1 && (
        <label className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-bold">Problem type</span>
          <select
            className={inputCls + ' !min-h-10 !w-auto max-w-full'}
            value={kind}
            onChange={(e) => {
              setKind(e.target.value)
              next(e.target.value)
            }}
          >
            <option value="any">Mixed ({pool.length} types)</option>
            {pool.map((k) => (
              <option key={k} value={k}>
                {GENERATOR_BY_KIND[k].label}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="rounded-xl bg-paper-2 p-4">
        <div className="eyebrow mb-1">{GENERATOR_BY_KIND[p.kind].label}</div>
        <p className="text-[1.05rem] font-bold leading-snug">{p.prompt}</p>
      </div>

      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (result) next()
          else check()
        }}
      >
        <label className="grid min-w-0 flex-1 gap-1 text-sm">
          <span className="font-bold">Your answer</span>
          <span className="relative">
            {p.unit === '$' && <span className="num pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>}
            <input
              ref={inputRef}
              inputMode="decimal"
              autoComplete="off"
              className={cx(inputCls, 'num text-lg', p.unit === '$' && 'pl-7', p.unit === '%' && 'pr-8', result === 'right' && '!border-good', result === 'wrong' && '!border-bad')}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              readOnly={!!result}
              placeholder={unitHint[p.unit]}
              aria-describedby="math-feedback"
            />
            {p.unit === '%' && <span className="num pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">%</span>}
          </span>
        </label>
        {result ? (
          <Button ref={nextRef} type="submit" icon={<ChevronRight size={18} aria-hidden />}>
            Next problem
          </Button>
        ) : (
          <>
            <Button type="submit" disabled={parseAnswer(typed) === null}>Check</Button>
            <Button variant="ghost" onClick={() => setShowSteps((s) => !s)} icon={<Lightbulb size={16} aria-hidden />}>
              {showSteps ? 'Hide steps' : 'Show steps'}
            </Button>
          </>
        )}
      </form>

      <div id="math-feedback" role="status" aria-live="polite">
        {result && (
          <div className={cx('mb-3 flex items-center gap-2 rounded-xl px-3 py-2 font-bold animate-pop', result === 'right' ? 'bg-good-bg text-good' : 'bg-bad-bg text-bad')}>
            {result === 'right' ? <Check size={18} aria-hidden /> : <X size={18} aria-hidden />}
            {result === 'right' ? `Correct: ${displayAnswer(p)}` : `Not quite. The answer is ${displayAnswer(p)}.`}
          </div>
        )}
        {showSteps && (
          <ol className="grid gap-1.5 rounded-xl border border-line p-3 animate-rise">
            {p.steps.map((s, i) => (
              <li key={i} className="num grid grid-cols-[1.5rem_1fr] gap-2 text-[0.92rem]">
                <span className="text-muted">{i + 1}.</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <Link to={`/math/${p.tool}`} className="font-bold">
          Formula & calculator →
        </Link>
        {!result && (
          <Button size="sm" variant="quiet" onClick={() => next()} icon={<RefreshCw size={14} aria-hidden />}>
            Skip
          </Button>
        )}
      </div>
    </Card>
  )
}
