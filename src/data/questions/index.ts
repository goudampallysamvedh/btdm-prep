import type { AreaCode, Question } from '@/types'
import { KIT_QUESTIONS } from './kit'
import { TIER1 } from './tier1'
import { TIER2 } from './tier2'
import { TIER3 } from './tier3'
import { TREND_QUESTIONS } from '../trends'

export const QUESTIONS: Question[] = [...KIT_QUESTIONS, ...TIER1, ...TIER2, ...TIER3, ...TREND_QUESTIONS]

export const QUESTION_BY_ID: Record<string, Question> = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]))

export function questionsForArea(code: AreaCode): Question[] {
  return QUESTIONS.filter((q) => q.area === code)
}
