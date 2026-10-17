/**
 * Judge providers. The app ships with self-scoring only: no AI, no server, no API keys.
 *
 * To plug in an AI judge later, add a provider that calls YOUR OWN server endpoint (for example a
 * serverless function that holds the API key as a secret). Never put an API key in this client code:
 * anything shipped to the browser can be read by anyone who opens the app.
 */
import type { CaseStudy } from '@/data/cases'
import type { CaseScoreLine } from '@/types'

export interface JudgeInput {
  caseStudy: CaseStudy
  /** What the team said or planned (transcript or notes). */
  presentation: string
  notes?: string
}

export interface JudgeResult {
  lines: CaseScoreLine[]
  summary: string
  followUps: string[]
  topFix: string
}

export interface JudgeProvider {
  id: string
  label: string
  /** True when this provider can be used right now (e.g., online and configured). */
  available: () => boolean
  evaluate?: (input: JudgeInput) => Promise<JudgeResult>
}

export const selfScore: JudgeProvider = {
  id: 'self',
  label: 'Self-score with the rubric',
  available: () => true,
}

/**
 * Example shape for a future AI judge. Disabled: set VITE_JUDGE_ENDPOINT at build time to the URL of
 * your own backend proxy. The proxy, not this app, holds the API key, rate-limits requests, and returns
 * a JudgeResult as JSON.
 */
const endpoint = import.meta.env.VITE_JUDGE_ENDPOINT as string | undefined

export const remoteJudge: JudgeProvider = {
  id: 'remote',
  label: 'AI judge (your server)',
  available: () => !!endpoint && navigator.onLine,
  evaluate: async (input) => {
    if (!endpoint) throw new Error('No judge endpoint configured')
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caseId: input.caseStudy.id, presentation: input.presentation.slice(0, 12000), notes: input.notes?.slice(0, 3000) }),
    })
    if (!res.ok) throw new Error(`Judge server error ${res.status}`)
    return (await res.json()) as JudgeResult
  },
}

export const PROVIDERS: JudgeProvider[] = [selfScore, remoteJudge]

export function activeProviders(): JudgeProvider[] {
  return PROVIDERS.filter((p) => p.available())
}
