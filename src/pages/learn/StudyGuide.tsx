import { useEffect, useMemo } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, TriangleAlert } from 'lucide-react'
import { AREAS, AREA_BY_CODE } from '@/data/areas'
import { EXAM_PATTERNS } from '@/data/playbook'
import { QUESTIONS } from '@/data/questions'
import { FLASHCARDS } from '@/data/flashcards'
import { useStore } from '@/lib/store'
import { areaReadiness, cardEvidence, questionEvidence, topicStatuses } from '@/lib/mastery'
import { STATUS_ICON, STATUS_STYLE, TopicLinks } from '@/components/TopicLinks'
import type { AreaCode } from '@/types'
import { Html, LinkButton, PageHeader, SectionTitle, Tag, cx } from '@/components/ui'

export default function StudyGuide() {
  const { area } = useParams()
  const code = area?.toUpperCase() as AreaCode | undefined
  return code && AREA_BY_CODE[code] ? <AreaPage code={code} /> : <Overview />
}

function Overview() {
  const tests = useStore((s) => s.tests)
  const ready = useMemo(() => areaReadiness(tests), [tests])
  const tierLabel = { 1: 'Tier 1 · study first', 2: 'Tier 2 · 5–6 questions', 3: 'Tier 3 · 1–4 questions' }
  return (
    <>
      <PageHeader title="Exam study guide">
        The 20 exam areas, most questions first. Tap an area to study it.
      </PageHeader>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-12">
        <div className="card p-5 sm:p-6 md:col-span-8">
          <ul className="divide-y divide-line">
            {AREAS.map((a) => {
              const r = ready.find((x) => x.area === a.code)!
              return (
                <li key={a.code}>
                  <Link to={`/learn/guide/${a.code}`} className="group grid min-h-14 grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3 py-2.5 text-ink no-underline">
                    <Tag>{a.code}</Tag>
                    <div className="min-w-0">
                      <div className="flex items-baseline justify-between gap-2 text-sm">
                        <span className="truncate font-medium group-hover:underline group-hover:decoration-line-2 group-hover:underline-offset-4">{a.name}</span>
                        <span className="num shrink-0 text-xs text-muted">{r.answered ? `${Math.round(r.accuracy * 100)}%` : '—'}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-paper-2" title={`${a.weight} exam questions`}>
                        <div className={cx('h-full rounded-full', a.tier === 1 ? 'bg-accent' : a.tier === 2 ? 'bg-ink-2' : 'bg-line-2')} style={{ width: `${(a.weight / 11) * 100}%` }} />
                      </div>
                    </div>
                    <span className="num text-xs text-muted">{a.weight} Q</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
        <aside className="grid content-start gap-3 md:col-span-4">
          <h2 className="text-[0.95rem]">Reading the bars</h2>
          <p className="text-sm text-muted">Each bar is the area&rsquo;s share of the exam. The percentage is your accuracy so far.</p>
          <ul className="grid gap-1.5 text-sm text-ink-2">
            {([1, 2, 3] as const).map((t) => (
              <li key={t} className="inline-flex items-center gap-2">
                <i className={cx('inline-block h-1.5 w-6 rounded-full', t === 1 ? 'bg-accent' : t === 2 ? 'bg-ink-2' : 'bg-line-2')} /> {tierLabel[t]}
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <SectionTitle>How these exams think</SectionTitle>
      <div className="grid divide-y divide-line border-t border-line">
        {EXAM_PATTERNS.map((p) => (
          <div key={p.title} className="grid gap-1 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-8">
            <h3 className="text-[0.95rem]">{p.title}</h3>
            <p className="prose-app text-[0.95rem] text-ink-2"><Html html={p.body} /></p>
          </div>
        ))}
      </div>
    </>
  )
}

function AreaPage({ code }: { code: AreaCode }) {
  const a = AREA_BY_CODE[code]
  const loc = useLocation()
  const tests = useStore((s) => s.tests)
  const leitner = useStore((s) => s.leitner)
  const statuses = useMemo(() => topicStatuses([...questionEvidence(tests), ...cardEvidence(leitner)].sort((x, y) => x.at - y.at)), [tests, leitner])
  const idx = AREAS.findIndex((x) => x.code === code)
  const prev = AREAS[idx - 1]
  const next = AREAS[idx + 1]
  const qCount = QUESTIONS.filter((q) => q.area === code).length
  const cCount = FLASHCARDS.filter((c) => c.area === code).length

  useEffect(() => {
    const id = decodeURIComponent(loc.hash.replace(/^#/, ''))
    if (id) document.getElementById(id)?.scrollIntoView({ block: 'start' })
  }, [loc.hash, code])

  return (
    <>
      <Link to="/learn/guide" className="mb-4 inline-flex min-h-9 items-center gap-1.5 text-sm font-medium text-muted no-underline hover:text-ink"><ArrowLeft size={16} strokeWidth={1.75} aria-hidden /> All areas</Link>
      <PageHeader eyebrow={`${a.weight} question${a.weight > 1 ? 's' : ''} per exam · Tier ${a.tier}`} title={a.name}
        actions={<><LinkButton size="sm" to={`/exam/practice?mode=area&area=${code}&count=${Math.min(10, qCount)}`}>Practice ({qCount})</LinkButton><LinkButton size="sm" variant="ghost" to={`/cards?area=${code}`}>Cards ({cCount})</LinkButton></>}>
        Highlighted phrases are the ideas the sample exams tested. Tap a topic's links to practice just that topic.
      </PageHeader>

      {a.trap && (
        <div className="mb-6 flex gap-3 rounded-2xl bg-warn-bg px-4 py-3">
          <TriangleAlert size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-warn" aria-hidden />
          <span><b>Watch out:</b> {a.trap}</span>
        </div>
      )}

      <ul className="divide-y divide-line border-t border-line">
        {a.terms.map((t) => (
          <li key={t.id} id={t.id} className="grid scroll-mt-24 gap-3 py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] md:gap-8">
            <div className="grid content-start justify-items-start gap-2">
              <h2 className="text-[0.95rem]">{t.term.replace(' (NEW)', '')}</h2>
              <span className={cx('inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold', STATUS_STYLE[statuses[t.id]])}>
                <span aria-hidden>{STATUS_ICON[statuses[t.id]]}</span>
                {statuses[t.id] === 'unseen' ? 'Not seen yet' : statuses[t.id] === 'need' ? 'Need to learn' : statuses[t.id] === 'shaky' ? 'Still shaky' : 'Learned'}
              </span>
            </div>
            <div className="grid min-w-0 gap-3">
              <p className="prose-app text-ink-2"><Html html={t.html} /></p>
              <TopicLinks topicId={t.id} compact />
            </div>
          </li>
        ))}
      </ul>

      <nav className="mt-8 flex justify-between gap-3" aria-label="Areas">
        {prev ? <LinkButton variant="ghost" to={`/learn/guide/${prev.code}`} icon={<ArrowLeft size={16} aria-hidden />}>{prev.code}</LinkButton> : <span />}
        {next && <LinkButton variant="ghost" to={`/learn/guide/${next.code}`} icon={<ArrowRight size={16} aria-hidden />} className="flex-row-reverse">{next.code}</LinkButton>}
      </nav>
    </>
  )
}
