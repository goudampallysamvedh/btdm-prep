import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, ExternalLink, TriangleAlert } from 'lucide-react'
import { TRENDS, TREND_BY_ID, TRENDS_CHECKED, type Trend } from '@/data/trends'
import { useStore } from '@/lib/store'
import { LinkButton, PageHeader, Tag } from '@/components/ui'

export default function Trends() {
  const { id } = useParams()
  const read = useStore((s) => s.trendsRead)
  const t = id ? TREND_BY_ID[id] : undefined

  if (t) return <TrendPage t={t} />

  return (
    <>
      <PageHeader title="Industry trends">
        One current trend makes your case solution stand out. Each has a line you can say to the judge.
      </PageHeader>
      <p className="-mt-4 mb-4 text-sm text-muted">Updated weekly · last checked {new Date(TRENDS_CHECKED + 'T12:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}. Say numbers as "about" and name the source.</p>
      <div className="mb-6 flex flex-wrap gap-2">
        <LinkButton size="sm" variant="ghost" to="/cards?deck=trends">Trend flashcards</LinkButton>
        <LinkButton size="sm" variant="ghost" to="/exam/practice?mode=topic&topic=T.trends&count=8">Trend quiz</LinkButton>
      </div>
      <ul className="divide-y divide-line border-t border-line">
        {TRENDS.map((tr) => (
          <li key={tr.id}>
            <Link to={`/learn/trends/${tr.id}`} className="group grid gap-1.5 py-5 text-ink no-underline md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-10">
              <span className="grid content-start gap-1">
                <span className="font-display text-[1.45rem] font-normal leading-tight group-hover:underline group-hover:decoration-line-2 group-hover:underline-offset-4">{tr.title}</span>
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                  {tr.kicker}
                  {read[tr.id] && <span className="inline-flex items-center gap-1 text-good"><Check size={14} strokeWidth={2} aria-hidden /> Read</span>}
                </span>
              </span>
              <span className="grid content-start gap-2">
                <span className="line-clamp-2 text-[0.95rem] text-ink-2">{tr.data[0].stat}</span>
                <span className="flex flex-wrap gap-1">
                  {tr.pis.slice(0, 3).map((p) => <Tag key={p}>{p}</Tag>)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}

function TrendPage({ t }: { t: Trend }) {
  useEffect(() => {
    useStore.getState().markTrend(t.id)
  }, [t.id])
  const idx = TRENDS.findIndex((x) => x.id === t.id)
  const next = TRENDS[(idx + 1) % TRENDS.length]
  return (
    <div className="mx-auto max-w-[44rem]">
      <Link to="/learn/trends" className="mb-4 inline-flex min-h-9 items-center gap-1.5 text-sm font-medium text-muted no-underline hover:text-ink"><ArrowLeft size={16} strokeWidth={1.75} aria-hidden /> All trends</Link>
      <PageHeader title={t.title}>{t.kicker} · {t.what}</PageHeader>

      <section>
        <div className="flex items-baseline justify-between gap-2 border-b border-line pb-2">
          <h2 className="text-[0.95rem]">By the numbers</h2>
          <span className="text-sm text-muted">{t.asOf}</span>
        </div>
        <ol className="divide-y divide-line">
          {t.data.map((d, i) => (
            <li key={i} className="grid grid-cols-[1.5rem_1fr] gap-3 py-3">
              <span className="num pt-0.5 text-sm text-muted">{i + 1}</span>
              <span className="leading-relaxed">
                {d.stat}{' '}
                <a href={t.sources[d.source].url} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap text-sm text-ink underline decoration-line-2 underline-offset-2">
                  [source {d.source + 1}]
                </a>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-8 grid gap-3">
        <div className="card p-5 sm:p-6">
          <div className="mb-1 text-sm font-semibold">Say it in a case</div>
          <p className="font-display text-xl leading-snug">&ldquo;{t.sayIt.replace(/^["“]|["”]$/g, '')}&rdquo;</p>
        </div>
        <div className="grid gap-2 px-1 text-[0.95rem]">
          <div><b className="font-semibold">Best fit:</b> {t.fits}</div>
          <div className="flex flex-wrap items-center gap-1.5"><b className="font-semibold">Connects to:</b> {t.pis.map((p) => <Tag key={p}>{p}</Tag>)}</div>
        </div>
        <div className="flex gap-3 rounded-2xl bg-warn-bg px-4 py-3">
          <TriangleAlert size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-warn" aria-hidden />
          <span><b className="font-semibold">Judge pushback to expect:</b> {t.watchOut}</span>
        </div>
      </div>

      <h2 className="mb-2 mt-8 text-[0.95rem]">Sources</h2>
      <ol className="grid gap-1.5 text-sm">
        {t.sources.map((s, i) => (
          <li key={s.url} className="flex gap-2">
            <span className="num text-muted">{i + 1}.</span>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1 text-ink underline decoration-line-2 underline-offset-2">
              {s.label} <ExternalLink size={13} strokeWidth={1.75} className="mt-1 shrink-0 text-muted" aria-hidden />
            </a>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex justify-end">
        <LinkButton variant="ghost" to={`/learn/trends/${next.id}`} icon={<ArrowRight size={16} aria-hidden />} className="flex-row-reverse">Next: {next.title}</LinkButton>
      </div>
    </div>
  )
}
