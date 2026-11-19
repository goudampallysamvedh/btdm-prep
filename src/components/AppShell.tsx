import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { animate } from 'motion/react'
import {
  Home, ClipboardCheck, Layers, Briefcase, GraduationCap, Calculator, BookOpen, Shapes,
  TrendingUp, PlayCircle, LineChart, ListChecks, ArrowLeftRight, Settings as SettingsIcon, Library, MessagesSquare,
  Users, Menu,
} from 'lucide-react'
import { cx } from './ui'
import { Logo } from './Logo'
import { UpdatePrompt } from './UpdatePrompt'
import { Helper, HelperButton } from './helper/Helper'
import { TooltipProvider } from './shadcn/tooltip'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from './shadcn/sheet'
import { prefersReducedMotion } from '@/lib/motion'

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
  { to: '/learn/pis', label: 'PI guide (all 450)', icon: ListChecks },
  { to: '/learn/lessons', label: 'Lessons', icon: BookOpen },
  { to: '/learn/visual', label: 'Visual guide', icon: Shapes },
  { to: '/learn/trends', label: 'Industry trends', icon: TrendingUp },
  { to: '/learn/videos', label: 'Videos', icon: PlayCircle },
  { to: '/cases/judge', label: 'Judge question drill', icon: MessagesSquare },
]

const you = [
  { to: '/progress', label: 'Progress', icon: LineChart },
  { to: '/partner', label: 'Partner', icon: Users },
  { to: '/sync', label: 'Sync', icon: ArrowLeftRight },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

type NavItem = { to: string; label: string; icon: typeof Home; end?: boolean }

/** A navigation row: the active screen is a quiet grey pill, the label unchanged. */
function SideLink({ to, label, icon: Icon, end, onNavigate }: NavItem & { onNavigate?: () => void }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cx(
          'group flex min-h-9 items-center gap-3 rounded-lg px-3 text-[0.9rem] font-medium no-underline transition-colors',
          isActive ? 'bg-line text-ink' : 'text-ink-2 hover:bg-line/60 hover:text-ink',
        )
      }
    >
      <Icon size={17} strokeWidth={1.75} aria-hidden className="text-muted transition-colors group-hover:text-ink group-aria-[current=page]:text-ink" />
      {label}
    </NavLink>
  )
}

function NavGroup({ title, items, onNavigate }: { title?: string; items: NavItem[]; onNavigate?: () => void }) {
  return (
    <nav className="grid gap-0.5" aria-label={title ?? 'Main sections'}>
      {title && <div className="mb-1 mt-6 px-3 text-xs font-medium text-muted">{title}</div>}
      {items.map((l) => (
        <SideLink key={l.to} {...l} onNavigate={onNavigate} />
      ))}
    </nav>
  )
}

export function AppShell() {
  const loc = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  // On navigation: scroll to top, move focus to the content (screen-reader friendly), and ease the
  // new screen in. Animating in place (not remounting) leaves each screen's own state untouched.
  useEffect(() => {
    window.scrollTo({ top: 0 })
    const main = mainRef.current
    if (!main) return
    main.focus({ preventScroll: true })
    if (prefersReducedMotion()) return
    const a = animate(main, { opacity: [0, 1], y: [10, 0] }, { duration: 0.32, ease: [0.2, 0.8, 0.2, 1] })
    return () => a.stop()
  }, [loc.pathname])

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-dvh md:grid md:grid-cols-[232px_1fr]">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-paper focus:p-3">
          Skip to content
        </a>

        {/* Desktop sidebar: on the chrome tint, no rule, so it and the sheet read as one frame. */}
        <aside className="sticky top-0 hidden h-dvh flex-col overflow-y-auto px-3 pb-4 pt-5 md:flex" aria-label="Main navigation">
          <div className="mb-6 px-2">
            <Logo />
          </div>
          <NavGroup items={primary} />
          <NavGroup title="You" items={you} />
          <div className="mt-auto grid gap-3 pt-6">
            <HelperButton variant="side" />
            <p className="px-3 text-xs leading-snug text-muted">Unofficial study aid. Not affiliated with DECA Inc. or MBA Research.</p>
          </div>
        </aside>

        {/* The sheet: white page inset from the window's top, right and bottom on desktop. */}
        <div className="min-w-0 bg-paper md:my-2 md:mr-2 md:min-h-[calc(100dvh-1rem)] md:rounded-2xl md:border md:border-line">
          {/* Mobile top bar */}
          <header className="safe-top sticky top-0 z-20 flex h-14 items-center justify-between gap-2 border-b border-line bg-paper px-2 md:hidden">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger className="grid size-11 place-items-center rounded-full text-ink-2 hover:bg-paper-2" aria-label="Open menu">
                <Menu size={21} strokeWidth={1.75} />
              </SheetTrigger>
              <SheetContent side="left" className="w-[86vw] max-w-sm gap-0 overflow-y-auto border-line bg-chrome px-3 pb-6 pt-5">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="mb-5 px-2" onClick={() => setMenuOpen(false)}>
                  <Logo />
                </div>
                <NavGroup items={primary} onNavigate={() => setMenuOpen(false)} />
                <NavGroup title="Study tools" items={learn} onNavigate={() => setMenuOpen(false)} />
                <NavGroup title="You" items={you} onNavigate={() => setMenuOpen(false)} />
              </SheetContent>
            </Sheet>
            <Logo compact />
            <HelperButton variant="header" />
          </header>

          <main id="main" ref={mainRef} tabIndex={-1} className="mx-auto w-full max-w-[1148px] px-4 pb-28 pt-6 outline-none sm:px-6 md:pb-20 md:pt-12">
            <Outlet />
          </main>
        </div>

        {/* Mobile bottom tabs */}
        <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper md:hidden" aria-label="Primary">
          <ul className="mx-auto grid max-w-md grid-cols-5">
            {primary.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cx('flex min-h-16 flex-col items-center justify-center gap-1 text-[0.72rem] font-medium no-underline', isActive ? 'text-ink' : 'text-muted')
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={cx('grid h-7 w-12 place-items-center rounded-full transition-colors', isActive && 'bg-paper-2')}>
                        <Icon size={20} strokeWidth={isActive ? 2 : 1.75} aria-hidden />
                      </span>
                      {label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <Helper />
        <UpdatePrompt />
      </div>
    </TooltipProvider>
  )
}

export const learnLinks = learn
