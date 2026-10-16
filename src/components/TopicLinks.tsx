import { Link } from 'react-router-dom'
import { BookOpen, Calculator, ClipboardCheck, Layers, Library, Shapes, TrendingUp } from 'lucide-react'
import { TOPIC_BY_ID } from '@/data/topics'
import { FLASHCARDS } from '@/data/flashcards'
import { QUESTIONS } from '@/data/questions'
import type { TopicStatus } from '@/lib/mastery'
import { cx } from './ui'

const linkCls = 'inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-2.5 text-sm font-bold text-ink-2 no-underline hover:border-accent hover:text-accent'

/** Where to go to study one topic: guide, lesson, diagram, math tool, flashcards, practice. */
export function TopicLinks({ topicId, compact = false }: { topicId: string; compact?: boolean }) {
  const t = TOPIC_BY_ID[topicId]
  if (!t) return null
  const hasCards = FLASHCARDS.some((c) => c.topic === topicId)
  const hasQs = QUESTIONS.some((q) => q.topic === topicId)
  return (
    <div className="flex flex-wrap gap-1.5">
      {t.links?.map((l, i) => {
        if (l.kind === 'guide')
          return (
            <Link key={i} to={`/learn/guide/${l.id}#${encodeURIComponent(topicId)}`} className={linkCls}>
              <Library size={15} aria-hidden /> {compact ? 'Guide' : 'Study guide'}
            </Link>
          )
        if (l.kind === 'lesson')
          return (
            <Link key={i} to={`/learn/lessons/${l.id}`} className={linkCls}>
              <BookOpen size={15} aria-hidden /> Lesson
            </Link>
          )
        if (l.kind === 'visual')
          return (
            <Link key={i} to={`/learn/visual/${l.id}`} className={linkCls}>
              <Shapes size={15} aria-hidden /> Diagram
            </Link>
          )
        if (l.kind === 'math')
          return (
            <Link key={i} to={`/math/${l.id}`} className={linkCls}>
              <Calculator size={15} aria-hidden /> Math lab
            </Link>
          )
        if (l.kind === 'trend')
          return (
            <Link key={i} to="/learn/trends" className={linkCls}>
              <TrendingUp size={15} aria-hidden /> Trends
            </Link>
          )
        return null
      })}
      {hasCards && (
        <Link to={`/cards?topic=${encodeURIComponent(topicId)}`} className={linkCls}>
          <Layers size={15} aria-hidden /> Cards
        </Link>
      )}
      {hasQs && (
        <Link to={`/exam/practice?mode=topic&topic=${encodeURIComponent(topicId)}&count=5`} className={linkCls}>
          <ClipboardCheck size={15} aria-hidden /> Practice
        </Link>
      )}
    </div>
  )
}

export const STATUS_STYLE: Record<TopicStatus, string> = {
  learned: 'bg-good-bg text-good border-good/30',
  shaky: 'bg-warn-bg text-warn border-warn/30',
  need: 'bg-bad-bg text-bad border-bad/30',
  unseen: 'bg-paper-2 text-muted border-line',
}

export const STATUS_ICON: Record<TopicStatus, string> = { learned: '✓', shaky: '~', need: '!', unseen: '·' }

export function StatusChip({ status, children, className }: { status: TopicStatus; children: React.ReactNode; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-sm font-bold', STATUS_STYLE[status], className)}>
      <span aria-hidden className="num">{STATUS_ICON[status]}</span>
      {children}
    </span>
  )
}
