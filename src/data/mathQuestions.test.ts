import { describe, expect, it } from 'vitest'
import { QUESTION_BY_ID, QUESTIONS } from './questions'
import * as M from '@/lib/retailMath'

/** Recompute every calculation question in the bank and compare with its keyed answer. */
const EXPECTED: Record<string, string> = {
  'kit-29': M.money(12000 + 3000 - 5000).replace('.00', ''),
  'kit-30': M.money(820 - 165).replace('.00', ''),
  'kit-08': '5',
  'IM-12': String((40 + 55 + 55 + 70 + 80) / 5),
  'IM-13': '4',
  'IM-14': String(30 - 9),
  'FI-03': M.money(2400 + 9000 - 4500).replace('.00', ''),
  'FI-07': M.money(16 * 22 - 48).replace('.00', ''),
  'PI-07': M.money(M.keystone(45)).replace('.00', ''),
  'BM-06': M.money(5000 * 0.98).replace('.00', ''),
  'BM-09': `${M.reorderPoint(12, 5, 20)} units`,
  'BM-10': M.money(M.shrinkage(48000, 46800)).replace('.00', ''),
  'BM-15': M.pct(M.offRetailPct(60, 45)),
  'BM-17': M.pct(M.markupOnRetail(24, 40)),
  'BM-18': M.money(M.retailFromCostRetailPct(18, 0.6)).replace('.00', ''),
  'BM-19': M.pct(M.sellThrough(300, 400)),
  'BM-20': M.num(M.stockTurnover(600000, 150000), 1).padEnd(3, '.0'),
  'BM-21': M.money(M.gmroi(90000, 30000)),
  'BM-22': M.money(M.plannedPurchases(40000, 4000, 120000, 110000)).replace('.00', ''),
  'BM-23': M.money(M.openToBuy(30000, 12000)).replace('.00', ''),
  'BM-24': M.money(M.bomFromRatio(20000, 3.5)).replace('.00', ''),
  'BM-25': String(M.breakEvenUnits(6000, 25, 10)),
  'FI-14': `Income statement; ${M.money(400000 - 360000).replace('.00', '')}`,
}

describe('calculation questions', () => {
  it.each(Object.entries(EXPECTED))('%s keyed answer matches the formula', (id, want) => {
    const q = QUESTION_BY_ID[id]
    expect(q, id).toBeDefined()
    expect(q.options[q.answer]).toBe(want)
  })
  it('every question flagged as math has a recomputation here', () => {
    const flagged = QUESTIONS.filter((q) => q.math).map((q) => q.id)
    for (const id of flagged) expect(Object.keys(EXPECTED), id).toContain(id)
  })
})
