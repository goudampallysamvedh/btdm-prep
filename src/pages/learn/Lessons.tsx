import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { LESSONS, type Lesson } from '@/data/lessons'
import { useStore } from '@/lib/store'
import { PageHeader } from '@/components/ui'

const GROUPS: { title: string; hint: string; lessons: Lesson[] }[] = [
  { title: 'Case skills', hint: 'Use data, research, customers, goals, and risk in your case', lessons: LESSONS.filter((l) => l.group === 'case') },
  { title: 'Buying & merchandising', hint: 'What buyers do every day', lessons: LESSONS.filter((l) => l.group !== 'case') },
]

export default function Lessons() {
  const done = useStore((s) => s.lessonsDone)
  return (
    <>
      <PageHeader title="Lessons">
        Short lessons, each with a quick check and lines to use in a case. {Object.keys(done).length} of {LESSONS.length} done.
      </PageHeader>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-10 md:grid-cols-12">
        {GROUPS.map((g) => (
          <section key={g.title} className="md:col-span-6">
            <h2 className="text-[0.95rem]">{g.title}</h2>
            <p className="mb-2 text-sm text-muted">{g.hint}</p>
            <ol className="divide-y divide-line border-t border-line">
              {g.lessons.map((l) => (
                <li key={l.id}>
                  <Link to={`/learn/lessons/${l.id}`} className="group flex min-h-16 items-start gap-3 py-3.5 text-ink no-underline">
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-xl font-normal leading-tight group-hover:underline group-hover:decoration-line-2 group-hover:underline-offset-4">{l.title}</span>
                      <span className="mt-1 line-clamp-2 block text-sm text-muted">{l.hook}</span>
                    </span>
                    <span className="num mt-1 flex shrink-0 items-center gap-2 text-sm text-muted">
                      {done[l.id] && <Check size={16} strokeWidth={1.75} className="text-good" aria-label="Done" />}
                      {l.minutes} min
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </>
  )
}
