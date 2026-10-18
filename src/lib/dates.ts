/** Local-time yyyy-mm-dd key for a date. */
export function dayKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Whole days from today (local) until a yyyy-mm-dd date. Negative if past. */
export function daysUntil(iso: string, now = new Date()): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null
  const [y, m, d] = iso.split('-').map(Number)
  const target = new Date(y, m - 1, d)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

/**
 * Consecutive study days ending today (or yesterday, so a streak survives until
 * the end of the current day).
 */
export function streak(activity: Record<string, number>, now = new Date()): number {
  const cur = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (!activity[dayKey(cur)]) cur.setDate(cur.getDate() - 1)
  let n = 0
  while (activity[dayKey(cur)]) {
    n++
    cur.setDate(cur.getDate() - 1)
  }
  return n
}

export function fmtClock(sec: number): string {
  const s = Math.max(0, Math.round(sec))
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

export function fmtDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function fmtDateTime(ms: number): string {
  return new Date(ms).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

/** Whole calendar days between a past time and now (0 = today). */
export function daysAgo(ms: number, now = new Date()): number {
  const a = new Date(ms)
  const d0 = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime()
  const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return Math.max(0, Math.round((d1 - d0) / 86_400_000))
}

/** "today", "yesterday", or "N days ago". */
export function relDay(ms: number, now = new Date()): string {
  const n = daysAgo(ms, now)
  return n === 0 ? 'today' : n === 1 ? 'yesterday' : `${n} days ago`
}

/** "just now", "5 min ago", "3 h ago", then "yesterday" / "N days ago". */
export function relTime(ms: number, now = Date.now()): string {
  const min = Math.floor((now - ms) / 60_000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min} min ago`
  if (min < 12 * 60) return `${Math.floor(min / 60)} h ago`
  return relDay(ms, new Date(now))
}
