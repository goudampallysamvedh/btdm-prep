import type { AreaCode, Question } from '@/types'

/**
 * Author helper for original questions. The correct answer is written first;
 * the app shuffles options every time a question is shown, so authored order never leaks.
 */
export function Q(
  id: string,
  pi: string,
  topic: string,
  stem: string,
  correct: string,
  wrong: [string, string, string],
  explanation: string,
  opts: { math?: boolean } = {},
): Question {
  return {
    id,
    area: pi.slice(0, 2) as AreaCode,
    pi,
    topic,
    stem,
    options: [correct, ...wrong] as Question['options'],
    answer: 0,
    explanation,
    source: 'original',
    ...(opts.math ? { math: true } : {}),
  }
}
