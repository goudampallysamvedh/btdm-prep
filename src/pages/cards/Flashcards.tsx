import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Check, RotateCcw, Undo2, X } from 'lucide-react'
import type { AreaCode, Flashcard } from '@/types'
import { useHydrated, useStore } from '@/lib/store'
import { dueCards, newCards, review, BOX_DAYS } from '@/lib/srs'
import { shuffle } from '@/lib/random'
import { FLASHCARDS } from '@/data/flashcards'
import { AREAS, areaName } from '@/data/areas'
import { TOPIC_BY_ID } from '@/data/topics'
import { PI_BY_CODE, PI_LIST } from '@/data/piList'

const PI_COUNTS = {
  all: PI_LIST.length,
  exam: PI_LIST.filter((p) => p.onExam).length,
  case: PI_LIST.filter((p) => p.inCase).length,
  tier2: PI_LIST.filter((p) => p.tier === 2).length,
}
import { Bar, Button, Disclosure, Empty, PageHeader, Segmented, Tag, cx, inputCls } from '@/components/ui'

type Deck = 'all' | 'kit' | 'merch' | 'trends' | 'pi'
type PIFilter = 'all' | 'exam' | 'case' | 'tier2'
const NEW_PER_SESSION = 15

export default function Flashcards() {
  const hydrated = useHydrated()
  if (!hydrated) return <p className="py-16 text-center text-muted" role="status">Loading…</p>
  return <FlashcardsInner />
}

function FlashcardsInner() {
  const [params, setParams] = useSearchParams()
  const leitner = useStore((s) => s.leitner)
  const topic = params.get('topic') ?? ''
  const [deck, setDeck] = useState<Deck>((params.get('deck') as Deck) ?? 'all')
  const [area, setArea] = useState<AreaCode | ''>((params.get('area') as AreaCode) ?? '')
  const [mode, setMode] = useState<'study' | 'browse'>('study')
  const [piFilter, setPiFilter] = useState<PIFilter>((params.get('pif') as PIFilter) ?? 'all')

  const filtered = useMemo(
    () =>
      FLASHCARDS.filter(
        (c) =>
          (deck === 'all' ? c.deck !== 'pi' : c.deck === deck) &&
          (!area || c.area === area) &&
          (!topic || c.topic === topic) &&
          (deck !== 'pi' || piFilter === 'all' || (piFilter === 'exam' && c.onExam) || (piFilter === 'case' && c.inCase) || (piFilter === 'tier2' && PI_BY_CODE[c.front.slice(0, 6)]?.tier === 2)),
      ),
    [deck, area, topic, piFilter],
  )

  const buildQueue = useCallback(() => {
    const st = useStore.getState().leitner
    if (mode === 'browse') return shuffle(filtered)
    const due = dueCards(filtered, st)
    const fresh = newCards(filtered, st).slice(0, topic ? 50 : NEW_PER_SESSION)
    return [...due, ...fresh]
  }, [filtered, mode, topic])

  const [queue, setQueue] = useState<Flashcard[]>(buildQueue)
  const [sessionKey, setSessionKey] = useState(0)
  useEffect(() => {
    setQueue(buildQueue())
    setSessionKey((k) => k + 1)
    // Rebuild only when the filter or mode changes, not on every review.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck, area, topic, mode, piFilter])

  const boxCounts = [1, 2, 3, 4, 5].map((b) => filtered.filter((c) => leitner[c.id]?.box === b).length)
  const mastered = filtered.filter((c) => (leitner[c.id]?.box ?? 0) >= 4).length

  return (
    <>
      <PageHeader title="Flashcards">Swipe right if you knew it, left if not. Cards you know come back less often.</PageHeader>

      <div className="mb-4 grid gap-3">
        <div className="scroll-x -mx-1 px-1">
          <Segmented<Deck>
            label="Deck"
            value={deck}
            onChange={setDeck}
            className="!flex-nowrap"
            options={[
              { value: 'all', label: 'Study topics' },
              { value: 'pi', label: 'PIs' },
              { value: 'merch', label: 'Buying & merch' },
              { value: 'kit', label: 'Exam terms' },
              { value: 'trends', label: 'Trends' },
            ]}
          />
        </div>
        {deck === 'pi' && (
          <Segmented<PIFilter>
            label="Which PIs"
            value={piFilter}
            onChange={setPiFilter}
            options={[
              { value: 'case', label: `In BTDM cases (${PI_COUNTS.case})` },
              { value: 'exam', label: `On exams (${PI_COUNTS.exam})` },
              { value: 'tier2', label: `Marketing (${PI_COUNTS.tier2})` },
              { value: 'all', label: `All ${PI_COUNTS.all}` },
            ]}
          />
        )}
        {topic && (
          <div className="flex items-center gap-2 text-sm">
            Topic: <b>{TOPIC_BY_ID[topic]?.name ?? topic}</b>
            <Button size="sm" variant="quiet" onClick={() => { params.delete('topic'); setParams(params) }}>
              Clear
            </Button>
          </div>
        )}
        <div className="flex items-center gap-3 text-sm">
          <Bar value={filtered.length ? mastered / filtered.length : 0} tone="good" label="Cards mastered (box 4+)" />
          <span className="num shrink-0 text-muted">{mastered}/{filtered.length} mastered</span>
        </div>
        <Disclosure title="More options" hint={area ? `Area: ${areaName(area)}` : mode === 'browse' ? 'Browsing all cards' : 'Filter by area, browse all, see your boxes'}>
          <div className="grid gap-4">
            <label className="grid gap-1 text-sm">
              <span className="font-bold">Area</span>
              <select className={inputCls} value={area} onChange={(e) => setArea(e.target.value as AreaCode | '')}>
                <option value="">All areas</option>
                {AREAS.filter((a) => FLASHCARDS.some((c) => c.area === a.code)).map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.code} · {a.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-1 text-sm">
              <span className="font-bold">Which cards</span>
              <Segmented label="Mode" value={mode} onChange={setMode} options={[{ value: 'study', label: 'Due & new' }, { value: 'browse', label: 'Browse all' }]} />
            </div>
            <div className="grid gap-1 text-sm">
              <span className="font-bold">Your boxes</span>
              <div className="grid grid-cols-5 gap-2" aria-label="Cards in each Leitner box">
                {boxCounts.map((n, i) => (
                  <div key={i} className="rounded-xl bg-paper-2 px-2 py-1.5 text-center">
                    <div className="num text-lg font-bold">{n}</div>
                    <div className="text-[0.68rem] leading-tight text-muted">Box {i + 1}<br />{i > 0 ? `${BOX_DAYS[i + 1]}d` : 'today'}</div>
                  </div>
                ))}
              </div>
              <span className="text-xs text-muted">Box 1 cards come back today; box 5 cards come back in 14 days.</span>
            </div>
            {deck === 'pi' && <Link to="/learn/pis" className="text-sm font-bold">Open the PI guide to read all 450 →</Link>}
          </div>
        </Disclosure>
      </div>

      <Session key={sessionKey} queue={queue} mode={mode} onRestart={() => { setQueue(buildQueue()); setSessionKey((k) => k + 1) }} filteredCount={filtered.length} />
    </>
  )
}

function Session({ queue: initial, mode, onRestart, filteredCount }: { queue: Flashcard[]; mode: 'study' | 'browse'; onRestart: () => void; filteredCount: number }) {
  const [queue, setQueue] = useState(initial)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState({ known: 0, again: 0 })
  const [history, setHistory] = useState<{ card: Flashcard; prev: ReturnType<typeof useStore.getState>['leitner'][string] | undefined; known: boolean }[]>([])
  const [drag, setDrag] = useState(0)
  const start = useRef<{ x: number; y: number } | null>(null)
  const leitner = useStore((s) => s.leitner)
  const card = queue[0]

  const answer = useCallback(
    (known: boolean) => {
      if (!card) return
      const st = useStore.getState()
      const prev = st.leitner[card.id]
      st.setLeitner(card.id, review(prev, known))
      st.logActivity()
      setHistory((h) => [...h, { card, prev, known }])
      setDone((d) => ({ known: d.known + (known ? 1 : 0), again: d.again + (known ? 0 : 1) }))
      setFlipped(false)
      setDrag(0)
      // A missed card returns later in this session.
      setQueue((q) => {
        const rest = q.slice(1)
        if (known || mode === 'browse') return rest
        const at = Math.min(rest.length, 4)
        return [...rest.slice(0, at), card, ...rest.slice(at)]
      })
    },
    [card, mode],
  )

  const undo = () => {
    const last = history[history.length - 1]
    if (!last) return
    const st = useStore.getState()
    if (last.prev) st.setLeitner(last.card.id, last.prev)
    else st.resetLeitner([last.card.id])
    setHistory((h) => h.slice(0, -1))
    setDone((d) => ({ known: d.known - (last.known ? 1 : 0), again: d.again - (last.known ? 0 : 1) }))
    setQueue((q) => [last.card, ...q.filter((c) => c.id !== last.card.id)])
    setFlipped(false)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA')) return
      if (e.key === ' ' || e.key === 'Enter') {
        if (t?.tagName === 'BUTTON' && !t.dataset.flashcard) return
        e.preventDefault()
        setFlipped((f) => !f)
      } else if (e.key === 'ArrowRight') answer(true)
      else if (e.key === 'ArrowLeft') answer(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [answer])

  if (!card) {
    return (
      <Empty
        title={done.known + done.again ? 'Session complete' : filteredCount ? 'Nothing due right now' : 'No cards match'}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={onRestart} icon={<RotateCcw size={16} aria-hidden />}>
              {done.known + done.again ? 'Study more' : 'Check again'}
            </Button>
          </div>
        }
      >
        {done.known + done.again
          ? `You reviewed ${done.known + done.again} cards: ${done.known} known, ${done.again} still learning. Missed cards come back soon; known ones move up a box.`
          : filteredCount
            ? 'Every card in this set is scheduled for later. Switch to "Browse all" to keep going, or pick another deck.'
            : 'Try a different deck or area.'}
      </Empty>
    )
  }

  const box = leitner[card.id]?.box ?? 0
  const threshold = 90
  const onPointerDown = (e: React.PointerEvent) => {
    start.current = { x: e.clientX, y: e.clientY }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!start.current) return
    const dx = e.clientX - start.current.x
    if (Math.abs(dx) > 8) setDrag(dx)
  }
  const onPointerUp = (e: React.PointerEvent) => {
    if (!start.current) return
    const dx = e.clientX - start.current.x
    const dy = e.clientY - start.current.y
    start.current = null
    if (Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy)) answer(dx > 0)
    else {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) setFlipped((f) => !f)
      setDrag(0)
    }
  }

  return (
    <div className="mx-auto grid max-w-xl justify-items-center gap-4">
      <div className="flex w-full items-center justify-between text-sm text-muted">
        <span className="num">{queue.length} left · {done.known} ✓ · {done.again} ↺</span>
        <Button size="sm" variant="quiet" onClick={undo} disabled={!history.length} icon={<Undo2 size={16} aria-hidden />}>
          Undo
        </Button>
      </div>

      <div className="relative w-full" style={{ perspective: 1200 }}>
        {/* Swipe hints */}
        <div aria-hidden className={cx('pointer-events-none absolute -left-1 top-1/2 z-10 -translate-y-1/2 rounded-full bg-bad px-3 py-1 text-sm font-bold text-card transition-opacity', drag < -30 ? 'opacity-100' : 'opacity-0')}>Still learning</div>
        <div aria-hidden className={cx('pointer-events-none absolute -right-1 top-1/2 z-10 -translate-y-1/2 rounded-full bg-good px-3 py-1 text-sm font-bold text-card transition-opacity', drag > 30 ? 'opacity-100' : 'opacity-0')}>Got it</div>
        <button
          type="button"
          data-flashcard="1"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => { start.current = null; setDrag(0) }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setFlipped((f) => !f) } }}
          aria-label={flipped ? `Definition: ${card.back}. Press space to flip back.` : `Term: ${card.front}. Press space to flip.`}
          className="relative block h-[clamp(260px,62vw,360px)] w-full touch-pan-y select-none text-left"
          style={{
            transform: `translateX(${drag}px) rotate(${drag / 25}deg)`,
            transition: start.current ? 'none' : 'transform .25s ease',
          }}
        >
          <div
            className="relative h-full w-full transition-transform duration-500"
            style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'none' }}
          >
            <Face>
              <div className="flex w-full items-center justify-between gap-2">
                <Tag>{card.area}</Tag>
                <span className="text-xs text-muted">{box ? `Box ${box}` : 'New'}</span>
              </div>
              <div className="grid flex-1 place-items-center px-2 text-center">
                <span
                  className={cx('font-display font-extrabold leading-tight', card.front.length > 48 ? 'text-[clamp(1.15rem,4.6vw,1.6rem)]' : 'text-[clamp(1.6rem,6vw,2.3rem)]')}
                  style={{ fontStretch: '108%' }}
                >
                  {card.front}
                </span>
              </div>
              <span className="text-xs text-muted">Tap to flip · {areaName(card.area)}</span>
            </Face>
            <Face back>
              <div className="flex w-full items-center justify-between gap-2">
                <span className="text-sm font-bold">{card.deck === 'pi' ? card.front.slice(0, 6) : card.front}</span>
                <span className="text-xs text-muted">{TOPIC_BY_ID[card.topic]?.name}</span>
              </div>
              <div className="grid min-h-0 flex-1 place-items-center overflow-y-auto px-2 text-center">
                <span className="grid gap-2">
                  <span className={cx('leading-relaxed', card.back.length > 140 || card.extra ? 'text-[1rem] sm:text-lg' : 'text-[1.1rem] sm:text-xl')}>{card.back}</span>
                  {card.extra && <span className="text-sm italic text-ink-2">In a case: {card.extra}</span>}
                </span>
              </div>
              <span className="text-xs text-muted">Swipe or use the buttons</span>
            </Face>
          </div>
        </button>
      </div>

      <div className="grid w-full grid-cols-2 gap-3">
        <Button variant="danger" size="lg" onClick={() => answer(false)} icon={<X size={20} aria-hidden />}>
          Still learning
        </Button>
        <Button size="lg" onClick={() => answer(true)} icon={<Check size={20} aria-hidden />} className="!bg-good !border-good !text-card">
          Got it
        </Button>
      </div>
      <p className="text-center text-xs text-muted">Keyboard: Space flips · → got it · ← still learning</p>
    </div>
  )
}

function Face({ children, back = false }: { children: React.ReactNode; back?: boolean }) {
  return (
    <div
      className={cx('card absolute inset-0 flex flex-col items-center gap-3 p-5', back && 'bg-paper-2')}
      style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: back ? 'rotateY(180deg)' : undefined }}
    >
      {children}
    </div>
  )
}
