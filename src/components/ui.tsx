import { forwardRef, type ButtonHTMLAttributes, type ReactNode, useId } from 'react'
import { Link } from 'react-router-dom'

export function cx(...c: (string | false | null | undefined)[]): string {
  return c.filter(Boolean).join(' ')
}

/* Buttons are full pills, decided once. The primary is near-black; colour is kept for data. */
type Variant = 'primary' | 'ghost' | 'soft' | 'danger' | 'quiet'
const variants: Record<Variant, string> = {
  primary: 'bg-ink text-paper border-ink hover:bg-ink-2 hover:border-ink-2',
  ghost: 'bg-paper text-ink border-line-2 hover:border-ink',
  soft: 'bg-paper-2 text-ink border-transparent hover:bg-line-2',
  danger: 'bg-transparent text-bad border-bad/40 hover:bg-bad-bg',
  quiet: 'bg-transparent text-muted border-transparent hover:text-ink hover:bg-paper-2',
}
const base =
  'inline-flex items-center justify-center gap-2 rounded-full border font-semibold transition-[color,border-color,background-color,scale] duration-150 active:scale-[0.97] select-none'
const sizes = { sm: 'min-h-9 px-3.5 text-sm', md: 'min-h-11 px-5', lg: 'min-h-12 px-6' }

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', icon, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} className={cx(base, 'disabled:pointer-events-none disabled:opacity-45', sizes[size], variants[variant], className)} {...rest}>
      {icon}
      {children}
    </button>
  )
})

export function LinkButton({
  to,
  variant = 'primary',
  size = 'md',
  icon,
  className,
  children,
}: {
  to: string
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <Link to={to} className={cx(base, 'no-underline', sizes[size], variants[variant], className)}>
      {icon}
      {children}
    </Link>
  )
}

export function Card({ className, children, as: As = 'div' }: { className?: string; children: ReactNode; as?: 'div' | 'section' | 'article' | 'li' }) {
  return <As className={cx('card p-5 sm:p-6', className)}>{children}</As>
}

/** Every screen's title: the serif, with one grey line of context under it (never an eyebrow above). */
export function PageHeader({ eyebrow, title, children, actions }: { eyebrow?: string; title: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-8 grid gap-2">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <h1 className="text-[clamp(2.25rem,5vw,3rem)]">{title}</h1>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {(eyebrow || children) && (
        <div className="max-w-[68ch] text-[0.95rem] text-muted">
          {eyebrow && <span className="font-medium text-ink-2">{eyebrow}{children ? ' · ' : ''}</span>}
          {children}
        </div>
      )}
    </header>
  )
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-3 mt-10 flex items-baseline justify-between gap-3 first:mt-0">
      <h2 className="text-lg">{children}</h2>
      {aside}
    </div>
  )
}

export function Tag({ children, tone = 'plain', className }: { children: ReactNode; tone?: 'plain' | 'accent' | 'good' | 'bad' | 'warn' | 'info'; className?: string }) {
  const tones = {
    plain: '',
    accent: '!bg-accent-soft !text-accent',
    good: '!bg-good-bg !text-good',
    bad: '!bg-bad-bg !text-bad',
    warn: '!bg-warn-bg !text-warn',
    info: '!bg-info-bg !text-info',
  }
  return <span className={cx('tag', tones[tone], className)}>{children}</span>
}

export function Pill({ children, tone = 'plain' }: { children: ReactNode; tone?: 'plain' | 'good' | 'bad' | 'warn' | 'info' | 'accent' }) {
  const tones = {
    plain: 'bg-paper-2 text-ink-2',
    good: 'bg-good-bg text-good',
    bad: 'bg-bad-bg text-bad',
    warn: 'bg-warn-bg text-warn',
    info: 'bg-info-bg text-info',
    accent: 'bg-accent-soft text-accent',
  }
  return <span className={cx('inline-flex flex-none items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold', tones[tone])}>{children}</span>
}

export function Bar({ value, tone = 'accent', label, className }: { value: number; tone?: 'accent' | 'good' | 'bad' | 'warn' | 'ink'; label?: string; className?: string }) {
  const pct = Math.max(0, Math.min(1, value)) * 100
  const tones = { accent: 'bg-accent', good: 'bg-good', bad: 'bg-bad', warn: 'bg-warn', ink: 'bg-ink' }
  return (
    <div
      className={cx('h-1.5 w-full overflow-hidden rounded-full bg-paper-2', className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      aria-label={label}
    >
      {/* A true zero draws no stub. */}
      {pct > 0 && <div className={cx('animate-grow h-full rounded-full transition-[width] duration-500', tones[tone])} style={{ width: `${pct}%` }} />}
    </div>
  )
}

export function toneFor(p: number): 'good' | 'warn' | 'bad' {
  return p >= 0.75 ? 'good' : p >= 0.55 ? 'warn' : 'bad'
}

export function Ring({ value, size = 96, stroke = 6, children, label }: { value: number; size?: number; stroke?: number; children?: ReactNode; label: string }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(1, value))
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--paper-2)" strokeWidth={stroke} />
        {v > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - v)}
            className="animate-ring"
            style={{ transition: 'stroke-dashoffset .6s ease', ['--ring-from' as string]: `${c}px` }}
          />
        )}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: ReactNode }[]
  label: string
  className?: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cx('inline-flex flex-wrap gap-1 rounded-full bg-paper-2 p-1', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cx(
            'min-h-9 rounded-full px-3.5 text-sm font-semibold transition-colors',
            value === o.value ? 'bg-paper text-ink' : 'text-muted hover:text-ink',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: (id: string) => ReactNode }) {
  const id = useId()
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children(id)}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </div>
  )
}

export const inputCls =
  'min-h-11 w-full rounded-[10px] border border-line-2 bg-paper px-3 py-2 text-ink placeholder:text-muted focus:border-ink focus:outline-none'

export function Empty({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="card grid justify-items-center gap-2 p-8 text-center">
      <div className="text-lg font-semibold">{title}</div>
      {children && <div className="max-w-[46ch] text-sm text-muted">{children}</div>}
      {action}
    </div>
  )
}

export function Callout({ tone = 'info', title, children }: { tone?: 'info' | 'warn' | 'good' | 'bad' | 'accent'; title?: string; children: ReactNode }) {
  const tones = {
    info: 'bg-info-bg',
    warn: 'bg-warn-bg',
    good: 'bg-good-bg',
    bad: 'bg-bad-bg',
    accent: 'bg-accent-soft',
  }
  return (
    <div className={cx('rounded-2xl px-4 py-3 text-[0.95rem]', tones[tone])}>
      {title && <div className="mb-0.5 font-semibold">{title}</div>}
      {children}
    </div>
  )
}

export function Html({ html, className }: { html: string; className?: string }) {
  // Content is authored in this repo (data/*.ts), never user input.
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
}

/** A collapsible section: keeps advanced options one tap away instead of on screen. */
export function Disclosure({
  title,
  hint,
  children,
  defaultOpen = false,
  className,
}: {
  title: ReactNode
  hint?: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  className?: string
}) {
  return (
    <details className={cx('card group overflow-hidden', className)} open={defaultOpen || undefined}>
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{title}</span>
          {hint && <span className="block text-sm text-muted">{hint}</span>}
        </span>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden className="shrink-0 text-muted transition-transform group-open:rotate-180">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="px-5 pb-5">{children}</div>
    </details>
  )
}
