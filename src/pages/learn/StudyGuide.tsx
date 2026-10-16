import { useEffect, useMemo } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ChevronRight, TriangleAlert } from 'lucide-react'
import { AREAS, AREA_BY_CODE } from '@/data/areas'
import { EXAM_PATTERNS } from '@/data/playbook'
import { QUESTIONS } from '@/data/questions'
import { FLASHCARDS } from '@/data/flashcards'
import { useStore } from '@/lib/store'
import { areaReadiness, cardEvidence, questionEvidence, topicStatuses } from '@/lib/mastery'
import { STATUS_ICON, STATUS_STYLE, TopicLinks } from '@/components/TopicLinks'
import type { AreaCode } from '@/types'
import { Card, Html, LinkButton, PageHeader, SectionTitle, Tag, cx } from '@/components/ui'

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
      <PageHeader eyebrow="Marketing Cluster Exam" title="Exam study guide">
        Both sample exams (2022 test 1245 and 2025 test 1302) used <b>exactly the same number of questions in every area</b>. That's the blueprint, so expect it again. Four areas make up 40% of the test; nine make up 70%.
      </PageHeader>

      <Card className="grid gap-2">
        {AREAS.map((a) => {
          const r = ready.find((x) => x.area === a.code)!
          return (
            <Link key={a.code} to={`/learn/guide/${a.code}`} className="grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-2 py-1.5 text-ink no-underline hover:bg-paper-2">
              <Tag>{a.code}</Tag>
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate font-bold">{a.name}</span>
                  <span className="num shrink-0 text-xs text-muted">{r.answered ? `${Math.round(r.accuracy * 100)}%` : ''}</span>
                </div>
                <div className="mt-1 h-3 rounded-r bg-paper-2">
                  <div
                    className={cx('num flex h-full items-center justify-end rounded-r pr-1 text-[0.6rem] font-bold', a.tier === 1 ? 'bg-accent text-accent-ink' : a.tier === 2 ? 'bg-ink-2 text-paper' : 'bg-line-2 text-ink')}
                    style={{ width: `${(a.weight / 11) * 100}%` }}
                  >
                    {a.weight}
                  </div>
                </div>
              </div>
              <ChevronRight size={18} className="text-muted" aria-hidden />
            </Link>
          )
        })}
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted">
          {([1, 2, 3] as const).map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5">
              <i className={cx('inline-block size-3 rounded', t === 1 ? 'bg-accent' : t === 2 ? 'bg-ink-2' : 'bg-line-2')} /> {tierLabel[t]}
            </span>
          ))}
        </div>
      </Card>

      <SectionTitle>How these exams think</SectionTitle>
      <div className="grid gap-3 md:grid-cols-2">
        {EXAM_PATTERNS.map((p) => (
          <Card key={p.title}>
            <h3 className="mb-1 text-lg">{p.title}</h3>
            <p className="prose-app text-[0.95rem]"><Html html={p.body} /></p>
          </Card>
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
      <Link to="/learn/guide" className="mb-3 inline-flex items-center gap-1 text-sm font-bold no-underline">← All areas</Link>
      <PageHeader eyebrow={`${a.weight} question${a.weight > 1 ? 's' : ''} per exam · Tier ${a.tier}`} title={a.name}
        actions={<><LinkButton size="sm" to={`/exam/practice?mode=area&area=${code}&count=${Math.min(10, qCount)}`}>Practice ({qCount})</LinkButton><LinkButton size="sm" variant="ghost" to={`/cards?area=${code}`}>Cards ({cCount})</LinkButton></>}>
        Highlighted phrases are the ideas the sample exams tested. Tap a topic's links to practice just that topic.
      </PageHeader>

      {a.trap && (
        <div className="mb-4 flex gap-3 rounded-r-xl border-l-4 border-warn bg-warn-bg px-4 py-3">
          <TriangleAlert size={20} className="mt-0.5 shrink-0 text-warn" aria-hidden />
          <span><b>Watch out:</b> {a.trap}</span>
        </div>
      )}

      <ul className="grid gap-3">
        {a.terms.map((t) => (
          <li key={t.id} id={t.id} className="card scroll-mt-24 p-4">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg">{t.term.replace(' (NEW)', '')}</h2>
              <span className={cx('inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-xs font-bold', STATUS_STYLE[statuses[t.id]])}>
                <span aria-hidden>{STATUS_ICON[statuses[t.id]]}</span>
                {statuses[t.id] === 'unseen' ? 'Not seen yet' : statuses[t.id] === 'need' ? 'Need to learn' : statuses[t.id] === 'shaky' ? 'Still shaky' : 'Learned'}
              </span>
            </div>
            <p className="prose-app mb-3"><Html html={t.html} /></p>
            <TopicLinks topicId={t.id} compact />
          </li>
        ))}
      </ul>

      <nav className="mt-6 flex justify-between gap-3" aria-label="Areas">
        {prev ? <LinkButton variant="ghost" to={`/learn/guide/${prev.code}`}>← {prev.code}</LinkButton> : <span />}
        {next && <LinkButton variant="ghost" to={`/learn/guide/${next.code}`}>{next.code} →</LinkButton>}
      </nav>
    </>
  )
}
