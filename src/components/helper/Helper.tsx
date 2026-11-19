import { lazy, Suspense, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { MessageCircleQuestion } from 'lucide-react'
import { helperBlocked, useHelperUi } from '@/lib/helperUi'
import { cx } from '@/components/ui'

const HelperPanel = lazy(() => import('./HelperPanel'))

const isPhone = () => window.matchMedia('(max-width: 767px)').matches

/** Opens the study helper. Phones use the header icon; larger screens a row in the sidebar. */
export function HelperButton({ variant }: { variant: 'header' | 'side' }) {
  const loc = useLocation()
  const open = useHelperUi((s) => s.open)
  const setOpen = useHelperUi((s) => s.setOpen)
  if (helperBlocked(loc.pathname)) return null
  if (variant === 'header') {
    return (
      <button type="button" onClick={() => setOpen(true)} aria-label="Open the study helper" className="grid size-11 place-items-center rounded-full text-ink-2 hover:bg-paper-2">
        <MessageCircleQuestion size={20} strokeWidth={1.75} />
      </button>
    )
  }
  // Sidebar row: sits with the navigation instead of floating over the content.
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-pressed={open}
      className={cx('flex min-h-9 w-full items-center gap-3 rounded-lg px-3 text-[0.9rem] font-medium text-ink-2 transition-colors hover:bg-paper-2', open && 'bg-paper-2 text-ink')}
    >
      <MessageCircleQuestion size={17} strokeWidth={1.75} aria-hidden /> Ask for help
    </button>
  )
}

/** The drawer itself (side panel on large screens, bottom sheet on phones). */
export function Helper() {
  const loc = useLocation()
  const open = useHelperUi((s) => s.open)
  const setOpen = useHelperUi((s) => s.setOpen)
  const blocked = helperBlocked(loc.pathname)

  // Never available while answering exam or practice questions.
  useEffect(() => {
    if (blocked) setOpen(false)
  }, [blocked, setOpen])

  if (!open || blocked) return null
  return (
    <>
      <div className="fixed inset-0 z-40 bg-ink/30 animate-[rise_0.2s_ease-out_both] md:hidden" onClick={() => setOpen(false)} aria-hidden />
      <aside
        role="dialog"
        aria-label="Study helper"
        className={cx(
          'safe-bottom fixed inset-x-0 bottom-0 top-[7dvh] z-50 overflow-hidden rounded-t-2xl border-t border-line bg-paper shadow-2xl animate-deal',
          'md:inset-x-auto md:right-0 md:top-0 md:w-[400px] md:rounded-none md:border-l md:border-t-0',
        )}
      >
        <Suspense fallback={<p className="p-4 text-sm text-muted">Loading…</p>}>
          <HelperPanel onNavigate={() => isPhone() && setOpen(false)} />
        </Suspense>
      </aside>
    </>
  )
}
