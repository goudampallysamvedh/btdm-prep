/** Two-letter instructional-area code used as the prefix of every DECA performance indicator. */
export type AreaCode =
  | 'PM' | 'IM' | 'EI' | 'PR' | 'EC' | 'FI' | 'OP' | 'PD' | 'SE' | 'CM'
  | 'CO' | 'NF' | 'MP' | 'PI' | 'BL' | 'CR' | 'EN' | 'HR' | 'MK' | 'SM'

export interface StudyTerm {
  term: string
  /** May contain <mark> to highlight a tested phrase. */
  html: string
}

export interface Area {
  code: AreaCode
  name: string
  /** Questions per 100 on the Marketing Cluster Exam (2022 and 2025 samples). */
  weight: number
  tier: 1 | 2 | 3
  terms: StudyTerm[]
  trap?: string
}

export interface Flashcard {
  id: string
  area: AreaCode
  /** Topic id used for progress tracking; see data/topics.ts. */
  topic: string
  front: string
  back: string
  /** Extra decks beyond the area: buying & merchandising, trends. */
  deck?: 'kit' | 'merch' | 'trends' | 'pi'
  /** Optional second line on the back, e.g. how to use a PI in a case. */
  extra?: string
  /** For PI cards: flags used by deck filters. */
  onExam?: boolean
  inCase?: boolean
}

export interface Question {
  id: string
  area: AreaCode
  /** Performance indicator code, e.g. "PI:002". */
  pi: string
  /** Topic id, finer than area; see data/topics.ts. */
  topic: string
  stem: string
  options: [string, string, string, string]
  /** Index of the correct option, 0-3. */
  answer: 0 | 1 | 2 | 3
  explanation: string
  source: 'kit' | 'original'
  /** True when the question needs arithmetic; four-function calculator allowed. */
  math?: boolean
}

export interface Topic {
  id: string
  area: AreaCode
  name: string
  /** Where to study it: study-guide anchor, lesson id, or visual id. */
  links?: { kind: 'guide' | 'lesson' | 'visual' | 'math' | 'trend' | 'pi'; id: string }[]
  /** Bookkeeping topics (like an area's PI deck) that stay off the topic map. */
  hidden?: boolean
}

// ---------- Progress records ----------

export type TestKind = 'practice' | 'mock' | 'missed' | 'area' | 'math' | 'case-quiz'

export interface AnswerRecord {
  qid: string
  chosen: number | null
  correct: boolean
  ms: number
  flagged?: boolean
}

export interface TestRecord {
  id: string
  kind: TestKind
  title: string
  startedAt: number
  finishedAt: number
  /** For timed mocks: limit in seconds. */
  limitSec?: number
  answers: AnswerRecord[]
}

export interface LeitnerState {
  /** Box 1-5. */
  box: number
  /** Epoch ms when the card is next due. */
  due: number
  seen: number
  lapses: number
  last?: number
}

export type RubricLevel = 0 | 1 | 2 | 3 // Novice, Developing, Proficient, Exemplary

export interface CaseScoreLine {
  key: string
  label: string
  max: number
  points: number
}

export interface CaseAttempt {
  id: string
  caseId: string
  at: number
  partnerA: string
  partnerB: string
  lines: CaseScoreLine[]
  total: number
  notes: string
  prepSecUsed?: number
  presentSecUsed?: number
}

export interface CasePlan {
  caseId: string
  updatedAt: number
  /** PI index -> 'A' | 'B' */
  owners: Record<number, 'A' | 'B'>
  /** PI index -> what that partner will say (bullets). */
  points: Record<number, string>
  /** PI index -> handoff line spoken at the end of that PI. */
  handoffs: Record<number, string>
  opener: string
  closer: string
  solution: string
  /** Judge-question practice: who answered which. */
  judgeQs: { q: string; by: 'A' | 'B' | '' }[]
  notes: string
}

export interface MathStat {
  kind: string
  tried: number
  correct: number
  last?: number
}
