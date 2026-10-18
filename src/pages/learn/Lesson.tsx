import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Lightbulb, X } from 'lucide-react'
import { LESSONS, LESSON_BY_ID, type Lesson as L } from '@/data/lessons'
import { TOPIC_BY_ID } from '@/data/topics'
import { useStore } from '@/lib/store'
import { shuffle } from '@/lib/random'
import { TopicLinks } from '@/components/TopicLinks'
import { Button, Card, Empty, Html, LinkButton, PageHeader, SectionTitle, Tag, cx } from '@/components/ui'

export default function Lesson() {
  const { id } = useParams()
  const l = LESSON_BY_ID[id ?? '']
  if (!l) return <Empty title="Lesson not found" action={<LinkButton to="/learn/lessons">All lessons</LinkButton>} />
  return <LessonPage key={l.id} l={l} />
}

function LessonPage({ l }: { l: L }) {
  const [step, setStep] = useState(0)
  const idx = LESSONS.findIndex((x) => x.id === l.id)
  const next = LESSONS[idx + 1]
  const done = useStore((s) => s.lessonsDone[l.id])
  const sec = l.sections[step]

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/learn/lessons" className="mb-3 inline-flex items-center gap-1 text-sm font-bold no-underline">
        <ArrowLeft size={16} aria-hidden /> All lessons
      </Link>
      <PageHeader eyebrow={`${l.group === 'case' ? 'Case skills' : 'Buying & merch'} · ${l.minutes} min`} title={l.title}>
        {l.hook}
      </PageHeader>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {l.pis.map((p) => <Tag key={p}>{p}</Tag>)}
      </div>

      <div className="mb-3 flex gap-1.5" role="tablist" aria-label="Lesson sections">
        {l.sections.map((s, i) => (
          <button
            key={s.h}
            role="tab"
            aria-selected={i === step}
            onClick={() => setStep(i)}
            className={cx('h-2 flex-1 rounded-full transition-colors', i <= step ? 'bg-accent' : 'bg-paper-2')}
            aria-label={`${i + 1}. ${s.h}`}
          />
        ))}
      </div>

      <Card className="animate-rise" key={step}>
        <h2 className="mb-3 text-2xl">{sec.h}</h2>
        <div className="prose-app scroll-x">
          <Html html={sec.html} />
        </div>
        <div className="mt-5 flex justify-between gap-2">
          <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={step === 0}>
            <ArrowLeft size={18} aria-hidden /> Back
          </Button>
          {step < l.sections.length - 1 ? (
            <Button onClick={() => setStep(step + 1)}>
              Next <ArrowRight size={18} aria-hidden />
            </Button>
          ) : (
            <Button onClick={() => document.getElementById('check')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Quick check ↓</Button>
          )}
        </div>
      </Card>

      <SectionTitle>Use it in a BTDM case</SectionTitle>
      <Card className="grid gap-2">
        {l.caseMoves.map((m) => (
          <p key={m} className="flex gap-2">
            <Lightbulb size={18} className="mt-1 shrink-0 text-accent" aria-hidden />
            <span>{m}</span>
          </p>
        ))}
      </Card>

      <div id="check" className="scroll-mt-20">
        <SectionTitle aside={done ? <span className="text-sm font-bold text-good">✓ Completed</span> : null}>Quick check</SectionTitle>
        <Checks l={l} />
      </div>

      <SectionTitle>Keep going</SectionTitle>
      <Card className="grid gap-3">
        <span className="text-sm text-muted">Study more on <b>{TOPIC_BY_ID[l.topic]?.name}</b>:</span>
        <TopicLinks topicId={l.topic} />
        <div className="flex flex-wrap gap-2">
          {l.mathTool && <LinkButton variant="ghost" size="sm" to={`/math/${l.mathTool}`}>Math lab</LinkButton>}
          {l.visual && <LinkButton variant="ghost" size="sm" to={`/learn/visual/${l.visual}`}>Diagram</LinkButton>}
          {next && <LinkButton size="sm" to={`/learn/lessons/${next.id}`}>Next lesson: {next.title} →</LinkButton>}
        </div>
      </Card>
    </div>
  )
}

function Checks({ l }: { l: L }) {
  const [picked, setPicked] = useState<(number | null)[]>(() => l.checks.map(() => null))
  // Show options in a fresh order each visit so the right answer's position never gives it away.
  const [orders] = useState(() => l.checks.map((c) => shuffle(c.options.map((_, i) => i))))
  const all = picked.every((p) => p !== null)
  const right = picked.filter((p, i) => p === l.checks[i].answer).length

  const choose = (qi: number, oi: number) => {
    if (picked[qi] !== null) return
    const next = picked.slice()
    next[qi] = oi
    setPicked(next)
    useStore.getState().logActivity()
    if (next.every((p) => p !== null) && next.filter((p, i) => p === l.checks[i].answer).length >= Math.ceil(l.checks.length * 0.66)) {
      useStore.getState().markLesson(l.id)
    }
  }

  return (
    <div className="grid gap-3">
      {l.checks.map((c, qi) => (
        <Card key={qi} className="grid gap-2">
          <p className="font-bold">{c.q}</p>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {orders[qi].map((oi) => {
              const o = c.options[oi]
              const p = picked[qi]
              const state = p === null ? 'idle' : oi === c.answer ? 'right' : oi === p ? 'wrong' : 'idle'
              return (
                <button
                  key={oi}
                  type="button"
                  disabled={p !== null}
                  onClick={() => choose(qi, oi)}
                  className={cx(
                    'flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-left',
                    state === 'idle' && 'border-line hover:border-accent',
                    state === 'right' && 'border-good bg-good-bg',
                    state === 'right' && oi === p && 'animate-pop',
                    state === 'wrong' && 'border-bad bg-bad-bg animate-shake',
                  )}
                >
                  {state === 'right' ? <Check size={16} className="text-good" aria-label="correct" /> : state === 'wrong' ? <X size={16} className="text-bad" aria-label="incorrect" /> : null}
                  {o}
                </button>
              )
            })}
          </div>
          {picked[qi] !== null && <p className="text-sm text-muted" role="status">{c.why}</p>}
        </Card>
      ))}
      {all && (
        <p className={cx('rounded-xl px-4 py-3 font-bold', right === l.checks.length ? 'bg-good-bg text-good' : 'bg-warn-bg text-warn')} role="status">
          {right}/{l.checks.length} right. {right >= Math.ceil(l.checks.length * 0.66) ? 'Lesson marked complete.' : 'Review the sections and try again later.'}
        </p>
      )}
    </div>
  )
}
