import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { PREP_PHASES } from '@/data/playbook'
import { fmtClock } from '@/lib/dates'
import { Button, Card, Ring, cx } from '@/components/ui'

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
  const progress = t.phase === 'prep' || t.phase === 'present' ? el / limit : t.phase === 'done' ? 1 : 0

  return (
    <Card className="grid gap-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        <Button size="sm" variant="quiet" onClick={() => setSound(!sound)} aria-pressed={sound} icon={sound ? <Volume2 size={16} strokeWidth={1.75} aria-hidden /> : <VolumeX size={16} strokeWidth={1.75} aria-hidden />}>
          {sound ? 'Sound on' : 'Muted'}
        </Button>
      </div>

      <div className="grid justify-items-center">
        <Ring value={progress} size={248} stroke={5} label={`${label}: ${fmtClock(left)} left`}>
          <div
            className={cx('num text-[clamp(3rem,13vw,4.5rem)] font-normal leading-none', warn && 'text-bad', t.phase === 'done' && 'text-muted')}
            role="timer"
            aria-live="off"
          >
            {t.phase === 'idle' ? '30:00' : t.phase === 'between' ? '15:00' : fmtClock(left)}
          </div>
        </Ring>
      </div>
      {warn && <p className="animate-pop rounded-2xl bg-bad-bg px-4 py-3 text-center font-medium text-bad" role="alert">2-minute warning: wrap up and invite questions.</p>}

      {(t.phase === 'prep' || t.phase === 'idle') && (
        <ol className="grid grid-cols-4 gap-3" aria-label="Prep phases">
          {PREP_PHASES.map((p, i) => {
            const active = t.phase === 'prep' && i === phaseIdx
            const past = t.phase === 'prep' && i < phaseIdx
            return (
              <li key={p.id} className={cx('border-t-2 pt-2 text-xs', active ? 'border-accent text-ink' : past ? 'border-accent/40 text-muted' : 'border-line-2 text-muted')}>
                <div className="num">{p.minutes} min</div>
                <div className={cx('leading-tight', active ? 'font-semibold' : 'font-medium', past && 'line-through')}>{p.label}</div>
              </li>
            )
          })}
        </ol>
      )}
      {t.phase === 'prep' && (
        <div className="rounded-2xl border border-line bg-paper p-4 text-sm" aria-live="polite">
          <b className="font-semibold">Now: {PREP_PHASES[phaseIdx].label}.</b>
          <ul className="prose-app mt-1">{PREP_PHASES[phaseIdx].tips.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
      )}
      {t.phase === 'present' && (
        <div className="grid grid-cols-3 gap-3 text-xs">
          {[['0–1', 'Greet & preview'], ['1–10', 'PIs + solution'], ['10–15', 'Close & questions']].map(([m, l]) => (
            <div key={m} className="border-t-2 border-line-2 pt-2 text-muted"><div className="num">{m} min</div><div className="font-medium text-ink">{l}</div></div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        {t.phase === 'idle' && <Button size="lg" onClick={() => start('prep')} icon={<Play size={18} strokeWidth={1.75} aria-hidden />}>Start 30-min prep</Button>}
        {t.phase === 'between' && <Button size="lg" onClick={() => start('present')} icon={<Play size={18} strokeWidth={1.75} aria-hidden />}>Start 15-min presentation</Button>}
        {(t.phase === 'prep' || t.phase === 'present') && (
          <>
            {t.runningSince ? <Button variant="ghost" onClick={pause} icon={<Pause size={18} strokeWidth={1.75} aria-hidden />}>Pause</Button> : <Button onClick={resume} icon={<Play size={18} strokeWidth={1.75} aria-hidden />}>Resume</Button>}
            <Button variant="ghost" onClick={finishEarly}>{t.phase === 'prep' ? 'Done prepping' : 'Done presenting'}</Button>
          </>
        )}
        {t.phase !== 'idle' && <Button variant="quiet" onClick={reset} icon={<RotateCcw size={16} strokeWidth={1.75} aria-hidden />}>Reset</Button>}
      </div>
      {t.phase === 'done' && (
        <p className="text-center text-sm text-muted">
          Prep used <span className="num">{fmtClock(t.prepUsed)}</span> · presented <span className="num">{fmtClock(t.presentUsed)}</span>. Now score yourselves in the Score tab.
        </p>
      )}
      <p className="text-center text-xs text-muted">Practice standing up, out loud, with a four-function calculator and blank paper only.</p>
    </Card>
  )
}
