import { useState } from 'react'
import { ExternalLink, FileText, Trash2 } from 'lucide-react'
import { useStore, newId } from '@/lib/store'
import { fmtDate } from '@/lib/dates'
import { Button, Card, inputCls } from '@/components/ui'

/**
 * DECA posts one Marketing Cluster sample exam per season. We link to it (never copy it) and let
 * students log the score they got, so official results appear on the progress chart.
 */
export const OFFICIAL_EXAMS = [
  { label: '2026 Marketing Cluster sample exam (posted March 2026)', url: 'https://cdn.prod.website-files.com/635c470cc81318fc3e9c1e0e/69a1eeab6e1e15a9025b6321_Marketing-District%20Exam.pdf' },
  { label: 'BTDM event page on deca.org (current sample exam and case)', url: 'https://www.deca.org/compete/buying-and-merchandising-team-decision-making' },
]

const EXAM_NAMES = ['2026 sample (test posted Mar 2026)', '2025 sample (test 1302)', '2022 sample (test 1245)', 'Other official exam']

export function OfficialExams({ bare = false }: { bare?: boolean }) {
  const scores = useStore((s) => s.officialScores)
  const [exam, setExam] = useState(EXAM_NAMES[0])
  const [score, setScore] = useState('')
  const n = Number(score)
  const valid = score !== '' && Number.isInteger(n) && n >= 0 && n <= 100

  const body = (
    <>
      <p className="text-sm text-muted">
        Take the real sample exam cold and timed, on paper or the PDF, with only a four-function calculator. Grade it with the key at the end of the PDF, then log your score here. The app's own questions are original, so these are your best check.
      </p>
      <ul className="grid gap-1.5 text-sm">
        {OFFICIAL_EXAMS.map((e) => (
          <li key={e.url}>
            <a href={e.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1 font-bold">
              {e.label} <ExternalLink size={13} className="mt-1 shrink-0" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (!valid) return
          useStore.getState().addOfficial({ id: newId('off'), exam, score: n, at: Date.now() })
          useStore.getState().logActivity(5)
          setScore('')
        }}
      >
        <label className="grid min-w-0 flex-1 gap-1 text-sm">
          <span className="font-bold">Exam</span>
          <select className={inputCls} value={exam} onChange={(e) => setExam(e.target.value)}>
            {EXAM_NAMES.map((x) => <option key={x}>{x}</option>)}
          </select>
        </label>
        <label className="grid w-28 gap-1 text-sm">
          <span className="font-bold">Score /100</span>
          <input className={inputCls + ' num'} inputMode="numeric" value={score} onChange={(e) => setScore(e.target.value.replace(/\D/g, ''))} placeholder="e.g. 78" />
        </label>
        <Button type="submit" disabled={!valid}>Log score</Button>
      </form>
      {scores.length > 0 && (
        <ul className="grid gap-1 text-sm">
          {[...scores].sort((a, b) => b.at - a.at).map((o) => (
            <li key={o.id} className="flex items-center justify-between gap-2 border-b border-line pb-1">
              <span>{fmtDate(o.at)} · {o.exam}</span>
              <span className="flex items-center gap-1">
                <b className="num">{o.score}</b>
                <Button size="sm" variant="quiet" aria-label="Delete score" onClick={() => useStore.getState().deleteOfficial(o.id)}><Trash2 size={14} aria-hidden /></Button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  )
  if (bare) return <div className="grid gap-3">{body}</div>
  return (
    <Card className="grid content-start gap-3">
      <div className="flex items-center gap-2">
        <FileText size={20} className="text-accent" aria-hidden />
        <h2 className="text-xl">Official DECA sample exams</h2>
      </div>
      {body}
    </Card>
  )
}
