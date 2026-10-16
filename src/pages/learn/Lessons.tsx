import { Link } from 'react-router-dom'
import { CheckCircle2, Clock } from 'lucide-react'
import { LESSONS } from '@/data/lessons'
import { useStore } from '@/lib/store'
import { PageHeader } from '@/components/ui'

export default function Lessons() {
  const done = useStore((s) => s.lessonsDone)
  return (
    <>
      <PageHeader eyebrow="Buying & merchandising" title="Lessons">
        Short, interactive lessons on what buyers actually do. Each ends with a quick check and moves you can use in a BTDM case.
      </PageHeader>
      <ol className="grid gap-3 sm:grid-cols-2">
        {LESSONS.map((l, i) => (
          <li key={l.id}>
            <Link to={`/learn/lessons/${l.id}`} className="card flex h-full gap-4 p-4 text-ink no-underline transition-colors hover:border-accent">
              <span className="num grid size-10 shrink-0 place-items-center rounded-xl bg-paper-2 font-bold text-accent">{String(i + 1).padStart(2, '0')}</span>
              <span className="min-w-0">
                <span className="block font-display text-lg font-extrabold leading-tight" style={{ fontStretch: '108%' }}>{l.title}</span>
                <span className="mt-1 line-clamp-2 block text-sm text-muted">{l.hook}</span>
                <span className="mt-2 flex items-center gap-3 text-xs text-muted">
                  <span className="inline-flex items-center gap-1"><Clock size={13} aria-hidden /> {l.minutes} min</span>
                  {done[l.id] && <span className="inline-flex items-center gap-1 font-bold text-good"><CheckCircle2 size={13} aria-hidden /> Done</span>}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </>
  )
}
