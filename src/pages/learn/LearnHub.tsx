import { Link } from 'react-router-dom'
import { BookOpen, Calculator, Library, ListChecks, MessagesSquare, PlayCircle, Shapes, TrendingUp, Trophy } from 'lucide-react'
import { PageHeader } from '@/components/ui'
import { LESSONS } from '@/data/lessons'
import { useStore } from '@/lib/store'

type Item = { to: string; icon: typeof Trophy; title: string; sub: string }

export default function LearnHub() {
  const done = useStore((s) => s.lessonsDone)
  const groups: { title: string; items: Item[] }[] = [
    {
      title: 'Start here',
      items: [{ to: '/learn/playbook', icon: Trophy, title: 'How BTDM works', sub: 'Rules, scoring, and how to win the case' }],
    },
    {
      title: 'Learn the material',
      items: [
        { to: '/learn/guide', icon: Library, title: 'Exam study guide', sub: 'The 20 exam areas, most-tested first' },
        { to: '/learn/pis', icon: ListChecks, title: 'PI guide', sub: 'All 450 performance indicators, explained' },
        { to: '/learn/lessons', icon: BookOpen, title: 'Buying & merch lessons', sub: `${Object.keys(done).length} of ${LESSONS.length} done` },
        { to: '/learn/visual', icon: Shapes, title: 'Diagrams', sub: 'Tap-through visuals of key ideas' },
      ],
    },
    {
      title: 'Practice skills',
      items: [
        { to: '/math', icon: Calculator, title: 'Retail math lab', sub: 'Calculators and endless problems' },
        { to: '/cases/judge', icon: MessagesSquare, title: 'Judge question drill', sub: 'Answer out loud in 45 seconds' },
      ],
    },
    {
      title: 'Stay current',
      items: [
        { to: '/learn/trends', icon: TrendingUp, title: 'Industry trends', sub: 'Updated weekly, with lines to use in a case' },
        { to: '/learn/videos', icon: PlayCircle, title: 'Videos', sub: 'Role-play examples and explainers' },
      ],
    },
  ]
  return (
    <>
      <PageHeader title="Learn" />
      <div className="grid gap-6">
        {groups.map((g) => (
          <section key={g.title}>
            <h2 className="eyebrow mb-2">{g.title}</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {g.items.map(({ to, icon: Icon, title, sub }) => (
                <li key={to}>
                  <Link to={to} className="card flex h-full min-h-16 items-center gap-3 px-4 py-3 text-ink no-underline transition-colors hover:border-accent">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent" aria-hidden>
                      <Icon size={20} />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-bold">{title}</span>
                      <span className="block text-sm text-muted">{sub}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  )
}
