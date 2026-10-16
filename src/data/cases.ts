import type { CompetencyKey } from './playbook'

export interface DataTable {
  title: string
  columns: string[]
  rows: (string | number)[][]
  note?: string
}

export interface CasePI {
  code: string
  text: string
  /** Which role it fits best: 0 = first role, 1 = second role. */
  fits: 0 | 1
  /** What a strong answer covers for this PI (judge key points). */
  key: string[]
}

export interface CaseStudy {
  id: string
  title: string
  company: string
  /** Instructional area printed on the case cover. */
  area: string
  roles: [string, string]
  judge: string
  situation: string[]
  tasks: string[]
  pis: CasePI[]
  competencies: CompetencyKey[]
  data: DataTable[]
  /** The two standard questions every team is asked. */
  judgeQuestions: [string, string]
  solutionKeys: string[]
  /** Suggested trend ids that would make a solution more unique. */
  trends: string[]
  difficulty: 1 | 2 | 3
}

export const CASES: CaseStudy[] = []
