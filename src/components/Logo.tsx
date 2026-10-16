import { Link } from 'react-router-dom'

export function LogoMark({ size = 32 }: { size?: number }) {
  // A price tag with an upward sell-through tick.
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <rect width="64" height="64" rx="16" fill="var(--ink)" />
      <path d="M14 22 L30 12 H50 a2 2 0 0 1 2 2 V50 a2 2 0 0 1-2 2 H30 L14 42 Z" fill="var(--tag)" />
      <circle cx="24" cy="32" r="3.6" fill="var(--ink)" />
      <path d="M32 39 l5 5 l10-14" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 text-ink no-underline" aria-label="Sell-Through home">
      <LogoMark size={compact ? 30 : 36} />
      <span className="grid leading-none">
        <span className="font-display text-[1.15rem] font-extrabold tracking-tight" style={{ fontStretch: '115%' }}>
          Sell-Through
        </span>
        {!compact && <span className="eyebrow mt-1 !text-[0.62rem]">BTDM prep · 2026–27</span>}
      </span>
    </Link>
  )
}
