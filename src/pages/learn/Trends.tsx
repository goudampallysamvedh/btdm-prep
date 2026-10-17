import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ExternalLink, MessageSquareQuote, TriangleAlert } from 'lucide-react'
import { TRENDS, TREND_BY_ID, TRENDS_CHECKED, type Trend } from '@/data/trends'
import { useStore } from '@/lib/store'
import { Card, LinkButton, PageHeader, Pill, Tag, cx } from '@/components/ui'

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
      <p className="text-sm text-muted">Updated weekly · last checked {new Date(TRENDS_CHECKED + 'T12:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}. Say numbers as "about" and name the source.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <LinkButton size="sm" variant="ghost" to="/cards?deck=trends">Trend flashcards</LinkButton>
        <LinkButton size="sm" variant="ghost" to="/exam/practice?mode=topic&topic=T.trends&count=8">Trend quiz</LinkButton>
      </div>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {TRENDS.map((tr) => (
          <li key={tr.id}>
            <Link to={`/learn/trends/${tr.id}`} className="card flex h-full flex-col gap-2 p-4 text-ink no-underline transition-colors hover:border-accent">
              <span className="flex items-center justify-between gap-2">
                <span className="eyebrow">{tr.kicker}</span>
                {read[tr.id] && <Pill tone="good">Read</Pill>}
              </span>
              <span className="font-display text-xl font-extrabold leading-tight" style={{ fontStretch: '108%' }}>{tr.title}</span>
              <span className="line-clamp-2 text-sm text-muted">{tr.data[0].stat}</span>
              <span className="mt-auto flex flex-wrap gap-1 pt-1">
                {tr.pis.slice(0, 3).map((p) => <Tag key={p}>{p}</Tag>)}
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
    <div className="mx-auto max-w-3xl">
      <Link to="/learn/trends" className="mb-3 inline-flex items-center gap-1 text-sm font-bold no-underline">← All trends</Link>
      <PageHeader eyebrow={t.kicker} title={t.title}>{t.what}</PageHeader>

      <Card className="receipt grid gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg">By the numbers</h2>
          <span className="eyebrow">{t.asOf}</span>
        </div>
        <ul className="grid gap-3">
          {t.data.map((d, i) => (
            <li key={i} className="grid grid-cols-[auto_1fr] gap-3">
              <span className="num mt-0.5 grid size-6 place-items-center rounded-md bg-accent-soft text-xs font-bold text-accent">{i + 1}</span>
              <span>
                {d.stat}{' '}
                <a href={t.sources[d.source].url} target="_blank" rel="noopener noreferrer" className="text-sm whitespace-nowrap">
                  [source {d.source + 1}]
                </a>
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="mt-4 grid gap-3">
        <div className="flex gap-3 rounded-2xl border-2 border-dashed border-accent/50 bg-accent-soft/40 p-4">
          <MessageSquareQuote size={22} className="mt-0.5 shrink-0 text-accent" aria-hidden />
          <div>
            <div className="mb-1 font-bold">Say it in a case</div>
            <p className="italic">{t.sayIt}</p>
          </div>
        </div>
        <Card className="grid gap-2">
          <div><b>Best fit:</b> {t.fits}</div>
          <div className="flex flex-wrap items-center gap-1.5"><b>Connects to:</b> {t.pis.map((p) => <Tag key={p}>{p}</Tag>)}</div>
        </Card>
        <div className={cx('flex gap-3 rounded-r-xl border-l-4 border-warn bg-warn-bg px-4 py-3')}>
          <TriangleAlert size={20} className="mt-0.5 shrink-0 text-warn" aria-hidden />
          <span><b>Judge pushback to expect:</b> {t.watchOut}</span>
        </div>
      </div>

      <h2 className="mb-2 mt-6 text-lg">Sources</h2>
      <ol className="grid gap-1.5 text-sm">
        {t.sources.map((s, i) => (
          <li key={s.url} className="flex gap-2">
            <span className="num text-muted">{i + 1}.</span>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1">
              {s.label} <ExternalLink size={13} className="mt-1 shrink-0" aria-hidden />
            </a>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex justify-end">
        <LinkButton variant="ghost" to={`/learn/trends/${next.id}`}>Next: {next.title} →</LinkButton>
      </div>
    </div>
  )
}
