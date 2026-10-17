import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { PREP_PHASES } from '@/data/playbook'
import { fmtClock } from '@/lib/dates'
import { Button, Card, cx } from '@/components/ui'

export const PREP_SEC = 30 * 60
export const PRESENT_SEC = 15 * 60
const WARN_SEC = 2 * 60

export type TimerPhase = 'idle' | 'prep' | 'between' | 'present' | 'done'

export interface TimerState {
  phase: TimerPhase
  /** Seconds elapsed in the current phase, banked from earlier runs. */
  banked: number
  /** Epoch ms when the current run started, or null if paused. */
  runningSince: number | null
  prepUsed: number
  presentUsed: number
}

export const initialTimer: TimerState = { phase: 'idle', banked: 0, runningSince: null, prepUsed: 0, presentUsed: 0 }

export function elapsed(t: TimerState, now = Date.now()): number {
  return t.banked + (t.runningSince ? (now - t.runningSince) / 1000 : 0)
}

function beep(times = 1) {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AC()
    for (let i = 0; i < times; i++) {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.frequency.value = 880
      o.connect(g)
      g.connect(ctx.destination)
      const t0 = ctx.currentTime + i * 0.35
      g.gain.setValueAtTime(0.0001, t0)
      g.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.25)
      o.start(t0)
      o.stop(t0 + 0.27)
    }
    navigator.vibrate?.([200, 100, 200])
  } catch {
    /* audio not available */
  }
}

export function CaseTimer({ t, setT }: { t: TimerState; setT: (t: TimerState) => void }) {
  const [now, setNow] = useState(Date.now())
  const [sound, setSound] = useState(true)
  const firedWarn = useRef(false)
  const firedPhase = useRef(-1)

  useEffect(() => {
    if (!t.runningSince) return
    const i = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(i)
  }, [t.runningSince])

  const el = elapsed(t, now)
  const limit = t.phase === 'present' ? PRESENT_SEC : PREP_SEC
  const left = Math.max(0, limit - el)

  // Prep sub-phase
  let acc = 0
  let phaseIdx = 0
  for (let i = 0; i < PREP_PHASES.length; i++) {
    if (el >= acc + PREP_PHASES[i].minutes * 60) {
      acc += PREP_PHASES[i].minutes * 60
      phaseIdx = Math.min(i + 1, PREP_PHASES.length - 1)
    }
  }

  // Phase transitions and alerts
  useEffect(() => {
    if (t.phase === 'prep') {
      if (phaseIdx !== firedPhase.current && firedPhase.current !== -1 && sound) beep(1)
      firedPhase.current = phaseIdx
      if (el >= PREP_SEC) {
        if (sound) beep(3)
        setT({ ...t, phase: 'between', banked: 0, runningSince: null, prepUsed: PREP_SEC })
      }
    }
    if (t.phase === 'present') {
      if (left <= WARN_SEC && !firedWarn.current) {
        firedWarn.current = true
        if (sound) beep(2)
      }
      if (el >= PRESENT_SEC) {
        if (sound) beep(3)
        setT({ ...t, phase: 'done', banked: 0, runningSince: null, presentUsed: PRESENT_SEC })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Math.floor(el), t.phase])

  const start = (phase: 'prep' | 'present') => {
    firedWarn.current = false
    firedPhase.current = -1
    setT({ ...t, phase, banked: 0, runningSince: Date.now() })
  }
  const pause = () => setT({ ...t, banked: el, runningSince: null })
  const resume = () => setT({ ...t, runningSince: Date.now() })
  const finishEarly = () => {
    if (t.phase === 'prep') setT({ ...t, phase: 'between', banked: 0, runningSince: null, prepUsed: Math.round(el) })
    if (t.phase === 'present') setT({ ...t, phase: 'done', banked: 0, runningSince: null, presentUsed: Math.round(el) })
  }
  const reset = () => setT(initialTimer)

  const warn = t.phase === 'present' && left <= WARN_SEC && left > 0
  const label = { idle: 'Ready', prep: 'Prep time', between: 'Prep over: walk in to the judge', present: 'Presentation', done: 'Time' }[t.phase]

  return (
    <Card className={cx('grid gap-4', warn && 'border-bad')}>
      <div className="flex items-center justify-between gap-2">
        <span className="eyebrow">{label}</span>
        <Button size="sm" variant="quiet" onClick={() => setSound(!sound)} aria-pressed={sound} icon={sound ? <Volume2 size={16} aria-hidden /> : <VolumeX size={16} aria-hidden />}>
          {sound ? 'Sound on' : 'Muted'}
        </Button>
      </div>

      <div
        className={cx('num text-center text-[clamp(3.5rem,16vw,6rem)] font-bold leading-none', warn && 'text-bad', t.phase === 'done' && 'text-muted')}
        role="timer"
        aria-live="off"
      >
        {t.phase === 'idle' ? '30:00' : t.phase === 'between' ? '15:00' : fmtClock(left)}
      </div>
      {warn && <p className="rounded-xl bg-bad-bg px-3 py-2 text-center font-bold text-bad animate-pop" role="alert">2-minute warning: wrap up and invite questions.</p>}

      {(t.phase === 'prep' || t.phase === 'idle') && (
        <ol className="grid grid-cols-4 gap-1.5" aria-label="Prep phases">
          {PREP_PHASES.map((p, i) => {
            const active = t.phase === 'prep' && i === phaseIdx
            const past = t.phase === 'prep' && i < phaseIdx
            return (
              <li key={p.id} className={cx('rounded-xl border px-2 py-2 text-center text-xs', active ? 'border-accent bg-accent text-accent-ink' : past ? 'border-line bg-paper-2 text-muted line-through' : 'border-line')}>
                <div className="num font-bold">{p.minutes}m</div>
                <div className="font-bold leading-tight">{p.label}</div>
              </li>
            )
          })}
        </ol>
      )}
      {t.phase === 'prep' && (
        <div className="rounded-xl bg-paper-2 p-3 text-sm" aria-live="polite">
          <b>Now: {PREP_PHASES[phaseIdx].label}.</b>
          <ul className="prose-app mt-1">{PREP_PHASES[phaseIdx].tips.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
      )}
      {t.phase === 'present' && (
        <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
          {[['0–1', 'Greet & preview'], ['1–10', 'PIs + solution'], ['10–15', 'Close & questions']].map(([m, l]) => (
            <div key={m} className="rounded-xl border border-line px-2 py-2"><div className="num font-bold">{m} min</div><div>{l}</div></div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        {t.phase === 'idle' && <Button size="lg" onClick={() => start('prep')} icon={<Play size={18} aria-hidden />}>Start 30-min prep</Button>}
        {t.phase === 'between' && <Button size="lg" onClick={() => start('present')} icon={<Play size={18} aria-hidden />}>Start 15-min presentation</Button>}
        {(t.phase === 'prep' || t.phase === 'present') && (
          <>
            {t.runningSince ? <Button variant="ghost" onClick={pause} icon={<Pause size={18} aria-hidden />}>Pause</Button> : <Button onClick={resume} icon={<Play size={18} aria-hidden />}>Resume</Button>}
            <Button variant="ghost" onClick={finishEarly}>{t.phase === 'prep' ? 'Done prepping' : 'Done presenting'}</Button>
          </>
        )}
        {t.phase !== 'idle' && <Button variant="quiet" onClick={reset} icon={<RotateCcw size={16} aria-hidden />}>Reset</Button>}
      </div>
      {t.phase === 'done' && (
        <p className="text-center text-sm text-muted">
          Prep used {fmtClock(t.prepUsed)} · presented {fmtClock(t.presentUsed)}. Now score yourselves in the Score tab.
        </p>
      )}
      <p className="text-center text-xs text-muted">Practice standing up, out loud, with a four-function calculator and blank paper only.</p>
    </Card>
  )
}
