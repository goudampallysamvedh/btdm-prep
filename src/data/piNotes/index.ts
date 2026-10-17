import { PI_LIST, type PIRow } from '../piList'
import { NOTES_A } from './a'
import { NOTES_B } from './b'
import { NOTES_C } from './c'
import { NOTES_D } from './d'
import { NOTES_E } from './e'

export const PI_NOTES: Record<string, [string, string?]> = { ...NOTES_A, ...NOTES_B, ...NOTES_C, ...NOTES_D, ...NOTES_E }

export interface PIEntry extends PIRow {
  /** What it means, in plain words. */
  plain: string
  /** A line you could say in a BTDM case, when one fits. */
  inCaseLine?: string
}

export const PI_GUIDE: PIEntry[] = PI_LIST.map((p) => ({ ...p, plain: PI_NOTES[p.code]?.[0] ?? '', inCaseLine: PI_NOTES[p.code]?.[1] }))

export const LEVEL_NAME = { PQ: 'Prerequisite', CS: 'Career-sustaining', SP: 'Specialist' } as const
