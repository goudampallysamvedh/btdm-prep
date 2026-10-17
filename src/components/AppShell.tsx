import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import {
  Home, ClipboardCheck, Layers, Briefcase, GraduationCap, Calculator, BookOpen, Shapes,
  TrendingUp, PlayCircle, LineChart, ArrowLeftRight, Settings as SettingsIcon, Library, MessagesSquare,
} from 'lucide-react'
import { cx } from './ui'
import { Logo } from './Logo'
import { UpdatePrompt } from './UpdatePrompt'

const primary = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/exam', label: 'Exam', icon: ClipboardCheck },
  { to: '/cards', label: 'Cards', icon: Layers },
  { to: '/cases', label: 'Cases', icon: Briefcase },
  { to: '/learn', label: 'Learn', icon: GraduationCap },
]

const learn = [
  { to: '/math', label: 'Retail math lab', icon: Calculator },
  { to: '/learn/guide', label: 'Exam study guide', icon: Library },
  { to: '/learn/lessons', label: 'Buying & merch lessons', icon: BookOpen },
  { to: '/learn/visual', label: 'Visual guide', icon: Shapes },
  { to: '/learn/trends', label: 'Industry trends', icon: TrendingUp },
  { to: '/learn/videos', label: 'Videos', icon: PlayCircle },
  { to: '/cases/judge', label: 'Judge question drill', icon: MessagesSquare },
]

const you = [
  { to: '/progress', label: 'Progress', icon: LineChart },
  { to: '/sync', label: 'Partner sync', icon: ArrowLeftRight },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

function SideLink({ to, label, icon: Icon, end }: { to: string; label: string; icon: typeof Home; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cx(
          'flex min-h-9 items-center gap-3 rounded-xl px-3 text-[0.92rem] font-bold no-underline transition-colors',
          isActive ? 'bg-ink text-paper' : 'text-ink-2 hover:bg-paper-2',
        )
      }
    >
      <Icon size={18} aria-hidden />
      {label}
    </NavLink>
  )
}

export function AppShell() {
  const loc = useLocation()
  const mainRef = useRef<HTMLElement>(null)

  // Move focus to main content and scroll to top on navigation (screen-reader friendly).
  useEffect(() => {
    window.scrollTo({ top: 0 })
    mainRef.current?.focus({ preventScroll: true })
  }, [loc.pathname])

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[260px_1fr]">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-card focus:p-3">
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col gap-1 overflow-y-auto border-r border-line bg-paper px-3 py-5 md:flex" aria-label="Main navigation">
        <div className="mb-3 px-2">
          <Logo />
        </div>
        <nav className="grid gap-0.5" aria-label="Main sections">
          {primary.map((l) => (
            <SideLink key={l.to} {...l} />
          ))}
        </nav>
        <div className="eyebrow mb-1 mt-4 px-3">Learn</div>
        <nav className="grid gap-0.5" aria-label="Learn">
          {learn.map((l) => (
            <SideLink key={l.to} {...l} />
          ))}
        </nav>
        <div className="eyebrow mb-1 mt-4 px-3">You</div>
        <nav className="grid gap-0.5" aria-label="You">
          {you.map((l) => (
            <SideLink key={l.to} {...l} />
          ))}
        </nav>
        <p className="mt-auto px-3 pt-6 text-xs text-muted">Unofficial study aid. Not affiliated with DECA Inc. or MBA Research.</p>
      </aside>

      <div className="min-w-0">
        {/* Mobile top bar */}
        <header className="safe-top sticky top-0 z-20 flex items-center justify-between border-b border-line bg-paper/90 px-4 py-2 backdrop-blur md:hidden">
          <Logo compact />
          <div className="flex items-center gap-1">
            <NavLink to="/progress" aria-label="Progress" className="grid size-11 place-items-center rounded-xl text-ink-2 hover:bg-paper-2">
              <LineChart size={20} />
            </NavLink>
            <NavLink to="/settings" aria-label="Settings" className="grid size-11 place-items-center rounded-xl text-ink-2 hover:bg-paper-2">
              <SettingsIcon size={20} />
            </NavLink>
          </div>
        </header>

        <main id="main" ref={mainRef} tabIndex={-1} className="mx-auto w-full max-w-5xl px-4 pb-28 pt-5 outline-none sm:px-6 md:pb-16 md:pt-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom tabs */}
      <nav
        className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 backdrop-blur md:hidden"
        aria-label="Primary"
      >
        <ul className="mx-auto grid max-w-md grid-cols-5">
          {primary.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cx(
                    'flex min-h-16 flex-col items-center justify-center gap-0.5 text-[0.7rem] font-bold no-underline',
                    isActive ? 'text-accent' : 'text-muted',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={cx('grid h-7 w-12 place-items-center rounded-full transition-colors', isActive && 'bg-accent-soft')}>
                      <Icon size={20} aria-hidden />
                    </span>
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <UpdatePrompt />
    </div>
  )
}

export const learnLinks = learn
