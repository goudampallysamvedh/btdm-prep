import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUp, Check, RotateCcw, X } from 'lucide-react'
import { answer, type Block } from '@/lib/helper'
import { useHelperUi } from '@/lib/helperUi'
import { useStore } from '@/lib/store'
import { areaReadiness } from '@/lib/mastery'
import { shuffle } from '@/lib/random'
import { AREAS, AREA_BY_CODE } from '@/data/areas'
import { TOPIC_BY_ID } from '@/data/topics'
import { FLASHCARDS } from '@/data/flashcards'
import { QUESTION_BY_ID } from '@/data/questions'
import { STATUS_LABEL } from '@/lib/mastery'
import { TOOL_BY_ID } from '@/pages/math/tools'
import { DIAGRAMS } from '@/pages/learn/Visual'
import { StatusChip, TopicLinks } from '@/components/TopicLinks'
import { Bar, Html, cx, inputCls, toneFor } from '@/components/ui'

const CARD_BY_ID = Object.fromEntries(FLASHCARDS.map((c) => [c.id, c]))
const linkCls = 'inline-flex min-h-9 items-center rounded-lg border border-line bg-card px-2.5 text-sm font-bold text-ink-2 no-underline hover:border-accent hover:text-accent'

/** The study helper drawer: answers come from the app's own content (no AI). */
export default function HelperPanel({ onNavigate }: { onNavigate: () => void }) {
  const messages = useHelperUi((s) => s.messages)
  const push = useHelperUi((s) => s.push)
  const clear = useHelperUi((s) => s.clear)
  const setOpen = useHelperUi((s) => s.setOpen)
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const endRef = useRef<HTMLDivElement>(null)

  const ask = (q: string) => {
    const { tests, leitner } = useStore.getState()
    push({ role: 'user', text: q })
    push({ role: 'bot', blocks: answer(q, { tests, leitner }) })
  }

  useEffect(() => {
    if (!useHelperUi.getState().messages.length) push({ role: 'bot', blocks: answer('hello', { tests: [], leitner: {} }) })
    inputRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [push, setOpen])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [messages.length])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const q = text.trim()
    if (!q) return
    setText('')
    ask(q)
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-2 border-b border-line px-4 py-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg leading-tight">Study helper</h2>
          <p className="text-xs text-muted">DECA &amp; BTDM only · answers come from this app</p>
        </div>
        {messages.length > 1 && (
          <button type="button" onClick={() => { clear(); push({ role: 'bot', blocks: answer('hello', { tests: [], leitner: {} }) }) }} className="grid size-10 place-items-center rounded-xl text-muted hover:bg-paper-2" aria-label="Start over">
            <RotateCcw size={18} />
          </button>
        )}
        <button type="button" onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-xl text-ink-2 hover:bg-paper-2" aria-label="Close study helper">
          <X size={20} />
        </button>
      </header>

      <div
        className="flex-1 overflow-y-auto overscroll-contain px-4 py-4"
        aria-live="polite"
        onClickCapture={(e) => {
          if ((e.target as HTMLElement).closest('a')) onNavigate()
        }}
      >
        <ol className="grid grid-cols-1 gap-4">
          {messages.map((m) =>
            m.role === 'user' ? (
              <li key={m.id} className="ml-10 justify-self-end rounded-2xl rounded-br-md bg-ink px-3.5 py-2 text-paper animate-rise">{m.text}</li>
            ) : (
              <li key={m.id} className="grid min-w-0 grid-cols-1 gap-2.5 animate-rise">
                {m.blocks.map((b, i) => <BlockView key={i} b={b} ask={ask} />)}
              </li>
            ),
          )}
        </ol>
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="flex gap-2 border-t border-line p-3">
        <input
          ref={inputRef}
          className={inputCls + ' flex-1'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask about a term, PI, or formula…"
          aria-label="Ask the study helper"
          enterKeyHint="send"
          maxLength={300}
        />
        <button type="submit" disabled={!text.trim()} className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-ink transition-[scale] active:scale-95 disabled:opacity-40" aria-label="Send">
          <ArrowUp size={20} />
        </button>
      </form>
    </div>
  )
}

function BlockView({ b, ask }: { b: Block; ask: (q: string) => void }) {
  switch (b.kind) {
    case 'text':
      return (
        <div className="prose-app text-[0.95rem]">
          {b.title && <p className="!mb-1 font-bold">{b.title}</p>}
          <Html html={b.html} />
        </div>
      )
    case 'card':
      return <FlipCard front={b.front} back={b.back} />
    case 'cards':
      return (
        <div className="grid gap-2">
          {b.ids.map((id) => CARD_BY_ID[id] && <FlipCard key={id} front={CARD_BY_ID[id].front} back={CARD_BY_ID[id].back} small />)}
        </div>
      )
    case 'diagram': {
      const d = DIAGRAMS.find((x) => x.id === b.id)
      if (!d) return null
      return (
        <figure className="grid min-w-0 gap-2 rounded-xl border border-line p-3">
          <figcaption className="text-sm font-bold">{d.title} <span className="font-normal text-muted">· tap to explore</span></figcaption>
          <div className="min-w-0 text-sm">{d.render()}</div>
        </figure>
      )
    }
    case 'calc':
      return <MiniCalc toolId={b.toolId} />
    case 'quiz':
      return <MiniQuiz qids={b.qids} />
    case 'areas':
      return <AreaBars areas={b.areas} />
    case 'blueprint':
      return <Blueprint />
    case 'topics':
      return (
        <ul className="grid grid-cols-1 gap-2">
          {b.items.map((t) => (
            <li key={t.id} className="grid min-w-0 gap-1.5 rounded-xl border border-line p-2.5">
              <span className="flex items-center gap-2">
                <StatusChip status={t.status}>{STATUS_LABEL[t.status]}</StatusChip>
                <span className="min-w-0 truncate text-sm font-bold">{TOPIC_BY_ID[t.id]?.name}</span>
              </span>
              <TopicLinks topicId={t.id} compact />
            </li>
          ))}
        </ul>
      )
    case 'links':
      return (
        <div className="grid gap-1.5">
          <span className="eyebrow">Go deeper</span>
          {b.topicId && <TopicLinks topicId={b.topicId} compact />}
          {b.links.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {b.links.map((l) => <Link key={l.to} to={l.to} className={linkCls}>{l.label} →</Link>)}
            </div>
          )}
        </div>
      )
    case 'chips':
      return b.items.length ? (
        <div className="flex flex-wrap gap-1.5">
          {b.items.map((c) => (
            <button key={c} type="button" onClick={() => ask(c)} className="rounded-full border border-accent/40 bg-accent-soft/50 px-3 py-1.5 text-sm font-bold text-accent transition-[scale] hover:bg-accent-soft active:scale-95">
              {c}
            </button>
          ))}
        </div>
      ) : null
  }
}

function FlipCard({ front, back, small }: { front: string; back: string; small?: boolean }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <button
      type="button"
      onClick={() => setFlipped(!flipped)}
      aria-label={flipped ? `${front}: ${back}. Tap to flip back.` : `${front}. Tap to see the answer.`}
      className={cx('grid w-full gap-1 rounded-xl border p-3 text-left transition-colors', flipped ? 'border-accent bg-accent-soft/40' : 'border-line bg-paper-2 hover:border-accent', small ? 'min-h-14' : 'min-h-20')}
    >
      <span className={cx('font-bold', !small && 'font-display text-lg')}>{front}</span>
      {flipped ? <span key="b" className="text-sm animate-rise">{back}</span> : <span className="text-xs text-muted">Tap to flip</span>}
    </button>
  )
}

function MiniCalc({ toolId }: { toolId: string }) {
  const tool = TOOL_BY_ID[toolId]
  const mode = tool?.modes[0]
  const [vals, setVals] = useState<Record<string, number>>(() => Object.fromEntries((mode?.fields ?? []).map((f) => [f.key, f.default])))
  if (!tool || !mode) return null
  let outputs: ReturnType<typeof mode.compute> = []
  try {
    outputs = mode.compute(vals)
  } catch {
    outputs = []
  }
  const shown = outputs.filter((o) => o.primary).length ? outputs.filter((o) => o.primary) : outputs.slice(0, 2)
  return (
    <div className="grid grid-cols-1 gap-2 rounded-xl border border-line p-3">
      <span className="text-sm font-bold">Try it: {mode.label}</span>
      <div className="grid grid-cols-2 gap-2">
        {mode.fields.map((f) => (
          <label key={f.key} className="grid gap-0.5 text-xs font-bold text-muted">
            {f.label} {f.unit !== '#' && `(${f.unit})`}
            <input
              type="number"
              inputMode="decimal"
              className={inputCls + ' !min-h-10 num text-sm'}
              value={Number.isFinite(vals[f.key]) ? vals[f.key] : ''}
              onChange={(e) => setVals({ ...vals, [f.key]: e.target.value === '' ? NaN : Number(e.target.value) })}
            />
          </label>
        ))}
      </div>
      <div className="grid gap-1 rounded-lg bg-paper-2 p-2 text-sm">
        {shown.map((o) => (
          <div key={o.label} className="flex items-baseline justify-between gap-2">
            <span>{o.label}</span>
            <b className="num">{o.value}</b>
          </div>
        ))}
        {!shown.length && <span className="text-muted">Enter numbers to see the result.</span>}
      </div>
      {shown[0]?.steps?.length ? <p className="num text-xs text-muted">{shown[0].steps[0]}</p> : null}
      <Link to={`/math/${tool.id}`} className="text-sm font-bold">Full calculator and practice →</Link>
    </div>
  )
}

function MiniQuiz({ qids }: { qids: string[] }) {
  const qs = useMemo(() => qids.map((id) => QUESTION_BY_ID[id]).filter(Boolean), [qids])
  const orders = useMemo(() => qs.map(() => shuffle([0, 1, 2, 3])), [qs])
  const [picked, setPicked] = useState<(number | null)[]>(() => qs.map(() => null))
  const done = picked.filter((p) => p !== null).length
  const right = picked.filter((p, i) => p === qs[i]?.answer).length
  if (!qs.length) return <p className="text-sm text-muted">No practice questions on this one yet.</p>
  return (
    <div className="grid grid-cols-1 gap-3">
      {qs.map((q, qi) => {
        const p = picked[qi]
        return (
          <div key={q.id} className="grid gap-1.5 rounded-xl border border-line p-3">
            <p className="text-sm font-bold">{qi + 1}. {q.stem}</p>
            {orders[qi].map((oi) => {
              const state = p === null ? 'idle' : oi === q.answer ? 'right' : oi === p ? 'wrong' : 'idle'
              return (
                <button
                  key={oi}
                  type="button"
                  disabled={p !== null}
                  onClick={() => setPicked(picked.map((x, j) => (j === qi ? oi : x)))}
                  className={cx(
                    'flex items-start gap-2 rounded-lg border px-2.5 py-2 text-left text-sm',
                    state === 'idle' && 'border-line hover:border-accent',
                    state === 'right' && 'border-good bg-good-bg',
                    state === 'right' && oi === p && 'animate-pop',
                    state === 'wrong' && 'border-bad bg-bad-bg animate-shake',
                  )}
                >
                  {state === 'right' ? <Check size={15} className="mt-0.5 shrink-0 text-good" aria-label="correct" /> : state === 'wrong' ? <X size={15} className="mt-0.5 shrink-0 text-bad" aria-label="incorrect" /> : null}
                  {q.options[oi]}
                </button>
              )
            })}
            {p !== null && <p className="text-xs text-ink-2 animate-rise">{q.explanation}</p>}
          </div>
        )
      })}
      {done === qs.length && (
        <p className={cx('rounded-lg px-3 py-2 text-sm font-bold animate-pop', right === qs.length ? 'bg-good-bg text-good' : 'bg-paper-2')}>
          {right} of {qs.length} right.{right === qs.length ? ' Nice!' : ' Read the explanations, then try the full lesson.'}
        </p>
      )}
    </div>
  )
}

function AreaBars({ areas }: { areas: string[] }) {
  const tests = useStore((s) => s.tests)
  const ready = useMemo(() => areaReadiness(tests), [tests])
  return (
    <div className="grid grid-cols-1 gap-2 rounded-xl border border-line p-3">
      <span className="text-sm font-bold">Your progress</span>
      {areas.map((code) => {
        const r = ready.find((x) => x.area === code)
        const a = AREA_BY_CODE[code as keyof typeof AREA_BY_CODE]
        if (!r || !a) return null
        return (
          <div key={code} className="grid min-w-0 grid-cols-1 gap-1 text-sm">
            <span className="flex items-baseline justify-between gap-2">
              <span className="min-w-0 truncate">{a.name} <span className="text-xs text-muted">· {a.weight} exam Qs</span></span>
              <b className="num shrink-0 whitespace-nowrap">{r.answered ? `${Math.round(r.accuracy * 100)}%` : 'not started'}</b>
            </span>
            <Bar value={r.answered ? r.accuracy : 0} tone={r.answered ? toneFor(r.accuracy) : 'accent'} label={`${a.name} accuracy`} />
          </div>
        )
      })}
    </div>
  )
}

function Blueprint() {
  const max = Math.max(...AREAS.map((a) => a.weight))
  return (
    <div className="grid gap-1 rounded-xl border border-line p-3" role="img" aria-label="Questions per exam area">
      <span className="mb-1 text-sm font-bold">Questions per area (out of 100)</span>
      {[...AREAS].sort((a, b) => b.weight - a.weight).map((a) => (
        <div key={a.code} className="grid grid-cols-[2.2rem_1fr_1.5rem] items-center gap-2 text-xs">
          <span className="num font-bold text-muted">{a.code}</span>
          <span className="h-2.5 overflow-hidden rounded-full bg-paper-2"><span className="animate-grow block h-full rounded-full bg-accent" style={{ width: `${(a.weight / max) * 100}%` }} /></span>
          <span className="num text-right">{a.weight}</span>
        </div>
      ))}
    </div>
  )
}
