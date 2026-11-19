import { useEffect, useState } from 'react'
import { ArrowUpRight, Play, WifiOff } from 'lucide-react'
import { VIDEO_GROUPS, VIDEOS_CHECKED, ALL_VIDEOS } from '@/data/videos'
import { Callout, PageHeader, Pill, SectionTitle } from '@/components/ui'

export default function Videos() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  return (
    <>
      <PageHeader title="Videos">
        {ALL_VIDEOS.length} videos. Links open on YouTube or Vimeo. All were checked and working on {VIDEOS_CHECKED}; the 18 from your kit are marked.
      </PageHeader>
      {!online && (
        <Callout tone="warn" title="You're offline">
          <span className="inline-flex items-center gap-2"><WifiOff size={16} strokeWidth={1.75} aria-hidden /> Videos need an internet connection. Everything else in the app works offline.</span>
        </Callout>
      )}
      {VIDEO_GROUPS.map((g) => (
        <section key={g.title}>
          <SectionTitle>{g.title}</SectionTitle>
          <p className="-mt-2 mb-3 max-w-[68ch] text-sm text-muted">{g.blurb}</p>
          <ul className="divide-y divide-line border-t border-line">
            {g.videos.map((v) => (
              <li key={v.url}>
                <a href={v.url} target="_blank" rel="noopener noreferrer" className="group flex min-h-16 items-start gap-4 py-3.5 text-ink no-underline">
                  <Play size={16} strokeWidth={1.75} className="mt-1 shrink-0 text-muted" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium leading-snug group-hover:underline group-hover:decoration-line-2 group-hover:underline-offset-4">{v.title}</span>
                    <span className="mt-0.5 block text-sm text-muted">{v.why}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                      {v.channel && <span>{v.channel}</span>}
                      {v.kit && <Pill>From your kit</Pill>}
                      <span className="sr-only">(opens in a new tab)</span>
                    </span>
                  </span>
                  <ArrowUpRight size={16} strokeWidth={1.75} className="mt-1 shrink-0 text-muted" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  )
}
