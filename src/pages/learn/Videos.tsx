import { useEffect, useState } from 'react'
import { Play, WifiOff } from 'lucide-react'
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
          <span className="inline-flex items-center gap-2"><WifiOff size={16} aria-hidden /> Videos need an internet connection. Everything else in the app works offline.</span>
        </Callout>
      )}
      {VIDEO_GROUPS.map((g) => (
        <section key={g.title}>
          <SectionTitle>{g.title}</SectionTitle>
          <p className="-mt-2 mb-3 text-sm text-muted">{g.blurb}</p>
          <ul className="grid gap-2 md:grid-cols-2">
            {g.videos.map((v) => (
              <li key={v.url}>
                <a href={v.url} target="_blank" rel="noopener noreferrer" className="card flex h-full items-start gap-3 p-3 text-ink no-underline lift hover:border-accent">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-accent-ink" aria-hidden>
                    <Play size={18} className="ml-0.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold leading-snug">{v.title}</span>
                    <span className="mt-0.5 block text-sm text-muted">{v.why}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                      {v.channel && <span>{v.channel}</span>}
                      {v.kit && <Pill>From your kit</Pill>}
                      <span className="sr-only">(opens in a new tab)</span>
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  )
}
