import { describe, expect, it } from 'vitest'
import * as M from './retailMath'

const close = (a: number, b: number, dp = 6) => expect(M.round(a, dp)).toBe(M.round(b, dp))

describe('markup', () => {
  it('computes dollars and both percentages', () => {
    expect(M.markupDollars(24, 40)).toBe(16)
    close(M.markupOnRetail(24, 40), 0.4)
    close(M.markupOnCost(24, 40), 2 / 3)
  })
  it('prices from a markup % on retail and on cost', () => {
    close(M.retailFromCostRetailPct(18, 0.6), 45)
    close(M.retailFromCostCostPct(50, 0.8), 90)
    close(M.costFromRetail(45, 0.6), 18)
  })
  it('converts between bases', () => {
    close(M.costPctToRetailPct(1), 0.5) // keystone
    close(M.retailPctToCostPct(0.5), 1)
    close(M.retailPctToCostPct(0.4), 2 / 3)
    close(M.costPctToRetailPct(0.25), 0.2)
    // Round-trip
    for (const r of [0.1, 0.35, 0.48, 0.62]) close(M.costPctToRetailPct(M.retailPctToCostPct(r)), r)
  })
  it('keystone doubles cost', () => expect(M.keystone(45)).toBe(90))
  it('rejects impossible inputs', () => {
    expect(() => M.markupOnRetail(10, 0)).toThrow()
    expect(() => M.retailFromCostRetailPct(10, 1)).toThrow()
  })
})

describe('markdowns', () => {
  it('computes off-retail % on the original price', () => {
    close(M.offRetailPct(60, 45), 0.25)
    expect(M.markdownDollars(60, 45)).toBe(15)
  })
  it('computes a sale price', () => close(M.salePrice(80, 0.3), 56))
  it('computes markdown % of net sales', () => close(M.markdownPctOfSales(6000, 50000), 0.12))
})

describe('maintained markup and gross margin', () => {
  it('computes MMU and gross margin', () => {
    expect(M.maintainedMarkup(100000, 58000)).toBe(42000)
    close(M.maintainedMarkupPct(100000, 58000), 0.42)
    expect(M.grossMargin(100000, 58000, 2000, 1000)).toBe(43000)
    close(M.grossMarginPct(100000, 58000, 2000, 1000), 0.43)
  })
  it('finds the initial markup needed for a maintained markup', () => {
    // MMU 40%, reductions 10% of sales: IMU = 0.5 / 1.1 = 45.45%
    close(M.initialMarkupPct(0.4, 0.1), 0.5 / 1.1)
    close(M.mmuFromImu(M.initialMarkupPct(0.4, 0.1), 0.1), 0.4)
  })
  it('agrees with a dollar walk-through', () => {
    // Net sales 1000, reductions 100 → original retail 1100. Cost 600.
    const imu = (1100 - 600) / 1100
    const mmu = (1000 - 600) / 1000
    close(M.initialMarkupPct(mmu, 0.1), imu)
  })
})

describe('turnover, sell-through, GMROI', () => {
  it('averages BOMs plus the final EOM', () => {
    // 6 BOMs + final EOM = 7 readings
    close(M.averageInventory([100, 120, 110, 130, 90, 80, 70]), 700 / 7)
  })
  it('computes stock turnover and needed inventory', () => {
    expect(M.stockTurnover(600000, 150000)).toBe(4)
    expect(M.inventoryForTurn(600000, 4)).toBe(150000)
  })
  it('computes sell-through with receipts', () => {
    close(M.sellThrough(300, 400), 0.75)
    close(M.sellThrough(90, 50, 150), 0.45)
  })
  it('computes weeks of supply', () => expect(M.weeksOfSupply(240, 40)).toBe(6))
  it('computes GMROI', () => expect(M.gmroi(90000, 30000)).toBe(3))
})

describe('planning', () => {
  it('computes planned purchases and OTB', () => {
    expect(M.plannedPurchases(40000, 4000, 120000, 110000)).toBe(54000)
    expect(M.openToBuy(30000, 12000)).toBe(18000)
    close(M.retailToCost(18000, 0.48), 9360)
  })
  it('computes stock-to-sales ratio and BOM', () => {
    close(M.stockToSales(70000, 20000), 3.5)
    expect(M.bomFromRatio(20000, 3.5)).toBe(70000)
  })
  it('builds a consistent six-month plan', () => {
    const months = [
      { name: 'Feb', salesPct: 0.12, ssRatio: 4, reductionsPct: 0.05 },
      { name: 'Mar', salesPct: 0.16, ssRatio: 3.5, reductionsPct: 0.05 },
      { name: 'Apr', salesPct: 0.18, ssRatio: 3.2, reductionsPct: 0.06 },
      { name: 'May', salesPct: 0.2, ssRatio: 3, reductionsPct: 0.08 },
      { name: 'Jun', salesPct: 0.19, ssRatio: 3, reductionsPct: 0.1 },
      { name: 'Jul', salesPct: 0.15, ssRatio: 3.4, reductionsPct: 0.15 },
    ]
    const rows = M.sixMonthPlan(500000, months, 220000, 0.5)
    expect(rows).toHaveLength(6)
    close(rows.reduce((s, r) => s + r.sales, 0), 500000)
    // EOM of each month equals next month's BOM
    for (let i = 0; i < 5; i++) close(rows[i].eom, rows[i + 1].bom)
    // Feb: sales 60,000; BOM 240,000; EOM = Mar BOM = 80,000 × 3.5 = 280,000; reductions 3,000
    close(rows[0].sales, 60000)
    close(rows[0].bom, 240000)
    close(rows[0].eom, 280000)
    close(rows[0].purchases, 60000 + 3000 + 280000 - 240000)
    close(rows[0].purchasesCost, rows[0].purchases * 0.5)
    expect(rows[5].eom).toBe(220000)
  })
})

describe('reorder point, shrink, break-even, unit price', () => {
  it('computes reorder point and safety stock', () => {
    expect(M.reorderPoint(12, 5, 20)).toBe(80)
    expect(M.safetyStockDays(12, 3)).toBe(36)
    expect(M.safetyStockMaxAvg(20, 8, 12, 5)).toBe(100)
  })
  it('computes shrinkage', () => {
    expect(M.shrinkage(48000, 46800)).toBe(1200)
    close(M.shrinkPct(48000, 46800, 80000), 0.015)
  })
  it('computes break-even', () => {
    expect(M.breakEvenUnits(6000, 25, 10)).toBe(400)
    close(M.breakEvenDollars(6000, 25, 10), 10000)
    expect(() => M.breakEvenUnits(100, 5, 5)).toThrow()
  })
  it('finds the best unit price', () => {
    close(M.unitPrice(3.99, 12), 0.3325)
    expect(M.bestValue([{ price: 3.99, quantity: 12 }, { price: 5.49, quantity: 18 }, { price: 1.5, quantity: 4 }])).toBe(1)
  })
})

describe('formatting', () => {
  it('formats money, percent, and numbers', () => {
    expect(M.money(1234.5)).toBe('$1,234.50')
    expect(M.money(-3)).toBe('−$3.00')
    expect(M.pct(0.25)).toBe('25%')
    expect(M.pct(2 / 3)).toBe('66.7%')
    expect(M.num(3.456)).toBe('3.46')
  })
})
