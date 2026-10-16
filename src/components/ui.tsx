import { forwardRef, type ButtonHTMLAttributes, type ReactNode, useId } from 'react'
import { Link } from 'react-router-dom'

export function cx(...c: (string | false | null | undefined)[]): string {
  return c.filter(Boolean).join(' ')
}

type Variant = 'primary' | 'ghost' | 'soft' | 'danger' | 'quiet'
const variants: Record<Variant, string> = {
  primary: 'bg-accent text-accent-ink border-accent hover:brightness-110 active:brightness-95',
  ghost: 'bg-transparent text-ink border-line-2 hover:border-accent hover:text-accent',
  soft: 'bg-accent-soft text-accent border-transparent hover:brightness-[0.98]',
  danger: 'bg-transparent text-bad border-bad/40 hover:bg-bad-bg',
  quiet: 'bg-transparent text-muted border-transparent hover:text-ink hover:bg-paper-2',
}

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
    <button
      ref={ref}
      type={type}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-xl border font-bold transition-[filter,color,border-color,background-color] disabled:opacity-45 disabled:pointer-events-none select-none',
        size === 'sm' && 'min-h-9 px-3 text-sm',
        size === 'md' && 'min-h-11 px-4',
        size === 'lg' && 'min-h-13 px-6 text-lg',
        variants[variant],
        className,
      )}
      {...rest}
    >
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
    <Link
      to={to}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-xl border font-bold no-underline transition-[filter,color,border-color] select-none',
        size === 'sm' && 'min-h-9 px-3 text-sm',
        size === 'md' && 'min-h-11 px-4',
        size === 'lg' && 'min-h-13 px-6 text-lg',
        variants[variant],
        className,
      )}
    >
      {icon}
      {children}
    </Link>
  )
}

export function Card({ className, children, as: As = 'div' }: { className?: string; children: ReactNode; as?: 'div' | 'section' | 'article' | 'li' }) {
  return <As className={cx('card p-4 sm:p-5', className)}>{children}</As>
}

export function PageHeader({ eyebrow, title, children, actions }: { eyebrow?: string; title: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-5 grid gap-2 animate-rise">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-[clamp(1.9rem,6vw,2.7rem)]">{title}</h1>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children && <div className="max-w-[68ch] text-muted">{children}</div>}
    </header>
  )
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-3 mt-7 flex items-baseline justify-between gap-3 first:mt-0">
      <h2 className="text-xl sm:text-2xl">{children}</h2>
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
  return <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold', tones[tone])}>{children}</span>
}

export function Bar({ value, tone = 'accent', label, className }: { value: number; tone?: 'accent' | 'good' | 'bad' | 'warn' | 'ink'; label?: string; className?: string }) {
  const pct = Math.max(0, Math.min(1, value)) * 100
  const tones = { accent: 'bg-accent', good: 'bg-good', bad: 'bg-bad', warn: 'bg-warn', ink: 'bg-ink' }
  return (
    <div
      className={cx('h-2 w-full overflow-hidden rounded-full bg-paper-2', className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      aria-label={label}
    >
      <div className={cx('h-full rounded-full transition-[width] duration-500', tones[tone])} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function toneFor(p: number): 'good' | 'warn' | 'bad' {
  return p >= 0.75 ? 'good' : p >= 0.55 ? 'warn' : 'bad'
}

export function Ring({ value, size = 96, stroke = 10, children, label }: { value: number; size?: number; stroke?: number; children?: ReactNode; label: string }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(1, value))
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--paper-2)" strokeWidth={stroke} />
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
          style={{ transition: 'stroke-dashoffset .6s ease' }}
        />
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
    <div role="radiogroup" aria-label={label} className={cx('inline-flex flex-wrap gap-1 rounded-xl bg-paper-2 p-1', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cx(
            'min-h-9 rounded-lg px-3 text-sm font-bold transition-colors',
            value === o.value ? 'bg-card text-ink shadow-sm' : 'text-muted hover:text-ink',
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
    <div className="grid gap-1">
      <label htmlFor={id} className="text-sm font-bold">
        {label}
      </label>
      {children(id)}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </div>
  )
}

export const inputCls =
  'min-h-11 w-full rounded-xl border border-line-2 bg-card px-3 py-2 text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none'

export function Empty({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="card grid justify-items-center gap-2 p-8 text-center">
      <div className="text-lg font-bold">{title}</div>
      {children && <div className="max-w-[46ch] text-sm text-muted">{children}</div>}
      {action}
    </div>
  )
}

export function Callout({ tone = 'info', title, children }: { tone?: 'info' | 'warn' | 'good' | 'bad' | 'accent'; title?: string; children: ReactNode }) {
  const tones = {
    info: 'border-info bg-info-bg',
    warn: 'border-warn bg-warn-bg',
    good: 'border-good bg-good-bg',
    bad: 'border-bad bg-bad-bg',
    accent: 'border-accent bg-accent-soft',
  }
  return (
    <div className={cx('rounded-r-xl border-l-4 px-4 py-3 text-[0.95rem]', tones[tone])}>
      {title && <div className="mb-0.5 font-bold">{title}</div>}
      {children}
    </div>
  )
}

export function Html({ html, className }: { html: string; className?: string }) {
  // Content is authored in this repo (data/*.ts), never user input.
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
