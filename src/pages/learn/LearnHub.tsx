import { Link } from 'react-router-dom'
import { BookOpen, Calculator, Library, MessagesSquare, PlayCircle, Shapes, TrendingUp, Trophy } from 'lucide-react'
import { PageHeader } from '@/components/ui'
import { LESSONS } from '@/data/lessons'
import { TRENDS } from '@/data/trends'
import { useStore } from '@/lib/store'

export default function LearnHub() {
  const done = useStore((s) => s.lessonsDone)
  const read = useStore((s) => s.trendsRead)
  const items = [
    { to: '/learn/playbook', icon: Trophy, title: 'BTDM playbook', sub: 'Format, rubric, the PI formula, team strategy, and what DECA\'s cases test' },
    { to: '/learn/guide', icon: Library, title: 'Exam study guide', sub: '20 areas in blueprint order, with tested terms and distractor traps' },
    { to: '/learn/lessons', icon: BookOpen, title: 'Buying & merch lessons', sub: `${Object.keys(done).length}/${LESSONS.length} completed · assortment, vendors, pricing, planning…` },
    { to: '/math', icon: Calculator, title: 'Retail math lab', sub: 'Calculators with worked steps plus endless problems' },
    { to: '/learn/visual', icon: Shapes, title: 'Visual guide', sub: 'Tap-through diagrams: life cycle, channels, promo mix, markdown timing…' },
    { to: '/learn/trends', icon: TrendingUp, title: 'Industry trends', sub: `${Object.keys(read).length}/${TRENDS.length} read · cited, dated, with lines to use in a case` },
    { to: '/learn/videos', icon: PlayCircle, title: 'Video library', sub: 'Role-play examples, strategy, exam concepts, retail math' },
    { to: '/cases/judge', icon: MessagesSquare, title: 'Judge question drill', sub: '120+ follow-up questions to practice out loud' },
  ]
  return (
    <>
      <PageHeader eyebrow="Learn" title="Study library" />
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map(({ to, icon: Icon, title, sub }) => (
          <li key={to}>
            <Link to={to} className="card flex h-full items-start gap-4 p-4 text-ink no-underline transition-colors hover:border-accent">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent" aria-hidden>
                <Icon size={22} />
              </span>
              <span>
                <span className="block font-display text-lg font-extrabold" style={{ fontStretch: '108%' }}>{title}</span>
                <span className="text-sm text-muted">{sub}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
