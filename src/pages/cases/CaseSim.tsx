import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, Lightbulb } from 'lucide-react'
import { CASE_BY_ID, type CaseStudy } from '@/data/cases'
import { TREND_BY_ID } from '@/data/trends'
import { JUDGE_QUESTIONS } from '@/data/judgeQuestions'
import { useStore } from '@/lib/store'
import { shuffle } from '@/lib/random'
import { activeProviders } from '@/lib/judge'
import { Button, Card, Empty, LinkButton, PageHeader, Tag, cx } from '@/components/ui'
import { CaseView } from './CaseView'
import { CaseTimer, initialTimer, type TimerState } from './CaseTimer'
import { CasePlanner } from './CasePlanner'
import { CaseScorer } from './CaseScorer'

type Tab = 'case' | 'timer' | 'plan' | 'questions' | 'score' | 'key'
const TABS: { id: Tab; label: string }[] = [
  { id: 'case', label: 'Case' },
  { id: 'timer', label: 'Timer' },
  { id: 'plan', label: 'Plan' },
  { id: 'questions', label: 'Judge Qs' },
  { id: 'score', label: 'Score' },
  { id: 'key', label: 'Key points' },
]

export default function CaseSim() {
  const { id } = useParams()
  const c = CASE_BY_ID[id ?? '']
  if (!c) return <Empty title="Case not found" action={<LinkButton to="/cases">All cases</LinkButton>} />
  return <Sim key={c.id} c={c} />
}

function Sim({ c }: { c: CaseStudy }) {
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') as Tab) ?? 'case'
  const setTab = (t: Tab) => setParams({ tab: t }, { replace: true })
  const [timer, setTimer] = useState<TimerState>(initialTimer)
  const settings = useStore((s) => s.settings)
  const running = timer.phase === 'prep' || timer.phase === 'present'

  return (
    <>
      <Link to="/cases" className="mb-3 inline-flex items-center gap-1 text-sm font-bold no-underline">
        <ArrowLeft size={16} aria-hidden /> All cases
      </Link>
      <PageHeader eyebrow={`${c.company} · ${c.area}`} title={c.title}>
        Roles: <b>{c.roles[0]}</b> ({settings.partnerA}) and <b>{c.roles[1]}</b> ({settings.partnerB}). Judge: {c.judge}.
      </PageHeader>

      <div className="sticky top-[57px] z-10 -mx-4 mb-4 bg-paper/95 px-4 py-2 backdrop-blur md:top-0 md:mx-0 md:px-0">
        <div className="scroll-x flex gap-1.5" role="tablist" aria-label="Case sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cx('min-h-10 shrink-0 rounded-xl px-3.5 text-sm font-bold', tab === t.id ? 'bg-ink text-paper' : 'bg-card text-ink-2 border border-line hover:border-accent')}
            >
              {t.label}
              {t.id === 'timer' && running && <span className="ml-1.5 inline-block size-2 rounded-full bg-accent align-middle" aria-label="running" />}
            </button>
          ))}
        </div>
      </div>

      <div role="tabpanel">
        {tab === 'case' && (
          <>
            <CaseView c={c} partnerA={settings.partnerA} partnerB={settings.partnerB} />
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={() => setTab('timer')}>Start the 30-minute prep</Button>
              <Button variant="ghost" onClick={() => setTab('plan')}>Open the partner planner</Button>
            </div>
          </>
        )}
        {tab === 'timer' && (
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <CaseTimer t={timer} setT={setTimer} />
            <Card className="grid content-start gap-2 text-sm">
              <div className="font-bold">The PIs you must cover</div>
              <ol className="grid gap-1.5">
                {c.pis.map((p) => <li key={p.code} className="flex gap-2"><Tag className="shrink-0">{p.code}</Tag>{p.text}</li>)}
              </ol>
              <div className="mt-2 font-bold">What the judge wants</div>
              <ul className="prose-app">{c.tasks.map((t) => <li key={t}>{t}</li>)}</ul>
            </Card>
          </div>
        )}
        {tab === 'plan' && <CasePlanner c={c} partnerA={settings.partnerA} partnerB={settings.partnerB} />}
        {tab === 'questions' && <CaseQuestions c={c} partnerA={settings.partnerA} partnerB={settings.partnerB} />}
        {tab === 'score' && (
          <>
            {activeProviders().length > 1 && <p className="mb-3 text-sm text-muted">An AI judge is configured on this build; self-scoring is shown below.</p>}
            <CaseScorer c={c} timer={timer} partnerA={settings.partnerA} partnerB={settings.partnerB} />
          </>
        )}
        {tab === 'key' && <KeyPoints c={c} />}
      </div>
    </>
  )
}

function CaseQuestions({ c, partnerA, partnerB }: { c: CaseStudy; partnerA: string; partnerB: string }) {
  const [seed, setSeed] = useState(0)
  const extra = useMemo(() => shuffle(JUDGE_QUESTIONS).slice(0, 6), [seed])
  const [shown, setShown] = useState<Record<string, boolean>>({})
  return (
    <div className="grid gap-4">
      <Card className="grid gap-3">
        <h2 className="text-lg">The judge's standard questions</h2>
        <p className="text-sm text-muted">The judge asks every team these. Decide now who answers each: both {partnerA} and {partnerB} should answer at least one.</p>
        <ol className="grid gap-2">
          {c.judgeQuestions.map((q) => <li key={q} className="rounded-xl border-l-4 border-accent bg-accent-soft/50 px-3 py-2 italic">"{q}"</li>)}
        </ol>
      </Card>
      <Card className="grid gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg">Practice follow-ups</h2>
          <Button size="sm" variant="ghost" onClick={() => setSeed(seed + 1)}>New set</Button>
        </div>
        <p className="text-sm text-muted">Answer out loud in 30–45 seconds: pause, restate, answer in 2–3 sentences, tie it back to your plan. Alternate partners.</p>
        <ol className="grid gap-2">
          {extra.map((q, i) => (
            <li key={q.id} className="rounded-xl border border-line p-3">
              <div className="flex items-start justify-between gap-3">
                <span><span className="text-xs font-bold text-muted">{i % 2 === 0 ? partnerA : partnerB} · {q.cat}</span><br />{q.q}</span>
                <Button size="sm" variant="quiet" onClick={() => { setShown({ ...shown, [q.id]: !shown[q.id] }); useStore.getState().markJudgeQ(q.id) }} aria-expanded={!!shown[q.id]}>
                  {shown[q.id] ? 'Hide' : 'Tip'}
                </Button>
              </div>
              {shown[q.id] && <p className="mt-2 text-sm text-ink-2"><Lightbulb size={14} className="mr-1 inline text-accent" aria-hidden />{q.tip}</p>}
            </li>
          ))}
        </ol>
        <LinkButton variant="ghost" to="/cases/judge">Full judge question drill →</LinkButton>
      </Card>
    </div>
  )
}

function KeyPoints({ c }: { c: CaseStudy }) {
  const [reveal, setReveal] = useState(false)
  return (
    <div className="grid gap-4">
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm">These are what a strong answer covers, like a judge's guide. Try the case first, then compare.</p>
        <Button variant={reveal ? 'ghost' : 'primary'} onClick={() => setReveal(!reveal)} icon={reveal ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}>
          {reveal ? 'Hide key points' : 'Reveal key points'}
        </Button>
      </Card>
      {reveal && (
        <>
          {c.pis.map((p) => (
            <Card key={p.code} className="grid gap-2 animate-rise">
              <div className="flex items-center gap-2"><Tag>{p.code}</Tag><span className="font-bold">{p.text}</span></div>
              <ul className="prose-app">{p.key.map((k) => <li key={k}>{k}</li>)}</ul>
            </Card>
          ))}
          <Card className="grid gap-2 border-accent animate-rise">
            <div className="font-bold">A strong solution</div>
            <ul className="prose-app">{c.solutionKeys.map((k) => <li key={k}>{k}</li>)}</ul>
          </Card>
          <Card className="grid gap-2 animate-rise">
            <div className="font-bold">Trends that could make it unique</div>
            <div className="flex flex-wrap gap-2">
              {c.trends.map((t) => TREND_BY_ID[t] && (
                <LinkButton key={t} size="sm" variant="ghost" to={`/learn/trends/${t}`}>{TREND_BY_ID[t].title}</LinkButton>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
