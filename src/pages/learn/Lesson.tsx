import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react'
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
  const idx = LESSONS.findIndex((x) => x.id === l.id)
  const prev = LESSONS[idx - 1]
  const next = LESSONS[idx + 1]
  const done = useStore((s) => s.lessonsDone[l.id])

  return (
    <div className="mx-auto max-w-[44rem]">
      <Link to="/learn/lessons" className="mb-4 inline-flex min-h-9 items-center gap-1.5 text-sm font-medium text-muted no-underline hover:text-ink">
        <ArrowLeft size={16} strokeWidth={1.75} aria-hidden /> All lessons
      </Link>
      <PageHeader title={l.title}>
        {l.group === 'case' ? 'Case skills' : 'Buying & merch'} · {l.minutes} min read · {l.sections.length} sections
      </PageHeader>
      <p className="-mt-2 mb-4 text-[1.1rem] leading-relaxed text-ink-2">{l.hook}</p>
      <div className="mb-10 flex flex-wrap gap-1.5">
        {l.pis.map((p) => <Tag key={p}>{p}</Tag>)}
      </div>

      {/* The lesson reads straight through; the numbers jump between sections. */}
      <nav aria-label="Lesson sections" className="mb-8 flex flex-wrap gap-x-4 gap-y-1 border-y border-line py-3 text-sm">
        {l.sections.map((s, i) => (
          <a key={s.h} href={`#sec-${i}`} onClick={(e) => { e.preventDefault(); document.getElementById(`sec-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} className="text-muted no-underline hover:text-ink">
            <span className="num mr-1.5">{i + 1}</span>{s.h}
          </a>
        ))}
      </nav>

      <div className="grid gap-9">
        {l.sections.map((sec, i) => (
          <section key={sec.h} id={`sec-${i}`} className="scroll-mt-20">
            <h2 className="mb-2 text-xl">{sec.h}</h2>
            <div className="prose-app scroll-x text-[1.0625rem] leading-[1.7]">
              <Html html={sec.html} />
            </div>
          </section>
        ))}
      </div>

      <SectionTitle>Use it in a BTDM case</SectionTitle>
      <ul className="divide-y divide-line border-t border-line">
        {l.caseMoves.map((m) => (
          <li key={m} className="py-3 leading-relaxed">{m}</li>
        ))}
      </ul>

      <div id="check" className="scroll-mt-20">
        <SectionTitle aside={done ? <span className="inline-flex items-center gap-1 text-sm font-medium text-good"><Check size={15} strokeWidth={2} aria-hidden /> Completed</span> : null}>Quick check</SectionTitle>
        <Checks l={l} />
      </div>

      <div className="card mt-10 grid gap-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="font-semibold">{done ? 'You finished this lesson' : 'Finished reading?'}</div>
            <div className="text-sm text-muted">{done ? 'It counts toward your lessons on Learn.' : 'Passing the quick check marks it done, or mark it yourself.'}</div>
          </div>
          <Button
            variant={done ? 'soft' : 'primary'}
            icon={done ? <Check size={17} strokeWidth={2} aria-hidden /> : undefined}
            disabled={!!done}
            onClick={() => useStore.getState().markLesson(l.id)}
          >
            {done ? 'Done' : 'Mark as done'}
          </Button>
        </div>
        <div className="grid gap-2 border-t border-line pt-4">
          <span className="text-sm text-muted">Study more on <b className="font-semibold text-ink">{TOPIC_BY_ID[l.topic]?.name}</b></span>
          <TopicLinks topicId={l.topic} />
          {(l.mathTool || l.visual) && (
            <div className="flex flex-wrap gap-2">
              {l.mathTool && <LinkButton variant="ghost" size="sm" to={`/math/${l.mathTool}`}>Math lab</LinkButton>}
              {l.visual && <LinkButton variant="ghost" size="sm" to={`/learn/visual/${l.visual}`}>Diagram</LinkButton>}
            </div>
          )}
        </div>
      </div>

      <nav aria-label="More lessons" className="mt-6 grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link to={`/learn/lessons/${prev.id}`} className="grid gap-0.5 rounded-2xl border border-line px-4 py-3 text-ink no-underline transition-colors hover:border-line-2">
            <span className="inline-flex items-center gap-1 text-sm text-muted"><ArrowLeft size={14} strokeWidth={1.75} aria-hidden /> Previous</span>
            <span className="font-display text-lg leading-tight">{prev.title}</span>
          </Link>
        ) : <span />}
        {next && (
          <Link to={`/learn/lessons/${next.id}`} className="grid gap-0.5 rounded-2xl border border-line px-4 py-3 text-ink no-underline transition-colors hover:border-line-2 sm:text-right">
            <span className="inline-flex items-center gap-1 text-sm text-muted sm:justify-self-end">Next lesson <ArrowRight size={14} strokeWidth={1.75} aria-hidden /></span>
            <span className="font-display text-lg leading-tight">{next.title}</span>
          </Link>
        )}
      </nav>
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
          <p className="font-semibold">{c.q}</p>
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
                    'flex min-h-11 items-center gap-2 rounded-2xl border bg-paper px-3.5 py-2 text-left',
                    state === 'idle' && 'border-line hover:border-ink',
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
        <p className={cx('rounded-2xl px-4 py-3 font-semibold', right === l.checks.length ? 'bg-good-bg text-good' : 'bg-warn-bg text-warn')} role="status">
          {right}/{l.checks.length} right. {right >= Math.ceil(l.checks.length * 0.66) ? 'Lesson marked complete.' : 'Review the sections and try again later.'}
        </p>
      )}
    </div>
  )
}
