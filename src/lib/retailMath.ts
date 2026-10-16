/**
 * Retail math formulas used by the math lab, calculators, and problem generator.
 * Percentages are passed and returned as decimals (0.4 = 40%) unless a name ends in "Pct".
 * Every formula here is unit-tested in retailMath.test.ts.
 */

const isNum = (n: number) => Number.isFinite(n)

function req(cond: boolean, msg: string) {
  if (!cond) throw new RangeError(msg)
}

// ---------- Rounding & formatting ----------

export const round = (n: number, dp = 2) => {
  const f = 10 ** dp
  return Math.round((n + Number.EPSILON) * f) / f
}

export function money(n: number): string {
  const sign = n < 0 ? '−' : ''
  return `${sign}$${Math.abs(round(n, 2)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function pct(decimal: number, dp = 1): string {
  const v = round(decimal * 100, dp)
  return `${Number.isInteger(v) ? v : v.toFixed(dp)}%`
}

export function num(n: number, dp = 2): string {
  const v = round(n, dp)
  return v.toLocaleString('en-US', { maximumFractionDigits: dp })
}

// ---------- Markup ----------

/** Markup dollars = retail − cost. */
export const markupDollars = (cost: number, retail: number) => retail - cost

/** Markup % on retail = (retail − cost) ÷ retail. */
export function markupOnRetail(cost: number, retail: number): number {
  req(retail > 0, 'Retail must be greater than 0')
  return (retail - cost) / retail
}

/** Markup % on cost = (retail − cost) ÷ cost. */
export function markupOnCost(cost: number, retail: number): number {
  req(cost > 0, 'Cost must be greater than 0')
  return (retail - cost) / cost
}

/** Retail price that gives a target markup % on retail: cost ÷ (1 − MU%). */
export function retailFromCostRetailPct(cost: number, muRetail: number): number {
  req(muRetail < 1, 'Markup on retail must be under 100%')
  return cost / (1 - muRetail)
}

/** Retail price from a markup % on cost: cost × (1 + MU%). */
export const retailFromCostCostPct = (cost: number, muCost: number) => cost * (1 + muCost)

/** Highest cost a buyer can pay to hit a retail price and markup on retail: retail × (1 − MU%). */
export const costFromRetail = (retail: number, muRetail: number) => retail * (1 - muRetail)

/** Convert markup on cost → markup on retail: c ÷ (1 + c). */
export const costPctToRetailPct = (muCost: number) => muCost / (1 + muCost)

/** Convert markup on retail → markup on cost: r ÷ (1 − r). */
export function retailPctToCostPct(muRetail: number): number {
  req(muRetail < 1, 'Markup on retail must be under 100%')
  return muRetail / (1 - muRetail)
}

/** Keystone: retail = 2 × cost. */
export const keystone = (cost: number) => cost * 2

// ---------- Markdowns ----------

export const markdownDollars = (original: number, sale: number) => original - sale

/** Off-retail % = markdown $ ÷ original price (the "% off" a shopper sees). */
export function offRetailPct(original: number, sale: number): number {
  req(original > 0, 'Original price must be greater than 0')
  return (original - sale) / original
}

/** Sale price after a % off. */
export const salePrice = (original: number, pctOff: number) => original * (1 - pctOff)

/** Markdown % of net sales = total markdown $ ÷ net sales $. */
export function markdownPctOfSales(totalMarkdown: number, netSales: number): number {
  req(netSales > 0, 'Net sales must be greater than 0')
  return totalMarkdown / netSales
}

// ---------- Maintained markup & gross margin ----------

/** Maintained markup $ = net sales − gross cost of goods sold. */
export const maintainedMarkup = (netSales: number, cogs: number) => netSales - cogs

export function maintainedMarkupPct(netSales: number, cogs: number): number {
  req(netSales > 0, 'Net sales must be greater than 0')
  return (netSales - cogs) / netSales
}

/**
 * Gross margin $ = maintained markup − workroom/alteration costs + cash discounts earned.
 * (Equivalently: net sales − total cost of goods sold, where total COGS already nets those out.)
 */
export const grossMargin = (netSales: number, cogs: number, cashDiscounts = 0, workroom = 0) => netSales - cogs + cashDiscounts - workroom

export function grossMarginPct(netSales: number, cogs: number, cashDiscounts = 0, workroom = 0): number {
  req(netSales > 0, 'Net sales must be greater than 0')
  return grossMargin(netSales, cogs, cashDiscounts, workroom) / netSales
}

/**
 * Initial markup % needed to achieve a maintained markup % after reductions.
 * IMU% = (MMU% + reductions%) ÷ (100% + reductions%), with both percentages of net sales.
 */
export const initialMarkupPct = (mmuPct: number, reductionsPct: number) => (mmuPct + reductionsPct) / (1 + reductionsPct)

/** Maintained markup % that results from an initial markup % and reductions % of net sales. */
export const mmuFromImu = (imuPct: number, reductionsPct: number) => imuPct * (1 + reductionsPct) - reductionsPct

// ---------- Inventory turnover ----------

/** Average inventory = (each BOM + the final EOM) ÷ (number of months + 1). Pass all readings. */
export function averageInventory(readings: number[]): number {
  req(readings.length > 0, 'Need at least one inventory figure')
  return readings.reduce((a, b) => a + b, 0) / readings.length
}

/** Stock turnover = net sales ÷ average inventory (both at retail, both at cost, or both in units). */
export function stockTurnover(sales: number, avgInventory: number): number {
  req(avgInventory > 0, 'Average inventory must be greater than 0')
  return sales / avgInventory
}

/** Average inventory needed to hit a turnover goal. */
export function inventoryForTurn(sales: number, turn: number): number {
  req(turn > 0, 'Turnover must be greater than 0')
  return sales / turn
}

/** Weeks of supply = on-hand ÷ average weekly sales. */
export function weeksOfSupply(onHand: number, weeklySales: number): number {
  req(weeklySales > 0, 'Weekly sales must be greater than 0')
  return onHand / weeklySales
}

// ---------- Sell-through ----------

/** Sell-through % = units sold ÷ (beginning on-hand + receipts). */
export function sellThrough(sold: number, beginning: number, receipts = 0): number {
  const available = beginning + receipts
  req(available > 0, 'Units available must be greater than 0')
  return sold / available
}

// ---------- GMROI ----------

/** GMROI = gross margin $ ÷ average inventory at cost. */
export function gmroi(grossMarginDollars: number, avgInventoryCost: number): number {
  req(avgInventoryCost > 0, 'Average inventory at cost must be greater than 0')
  return grossMarginDollars / avgInventoryCost
}

// ---------- Planning: purchases, OTB, stock-to-sales ----------

/** Planned purchases (retail) = planned sales + planned reductions + planned EOM − planned BOM. */
export const plannedPurchases = (sales: number, reductions: number, eom: number, bom: number) => sales + reductions + eom - bom

/** Open-to-buy (retail) = planned purchases − merchandise on order. */
export const openToBuy = (purchases: number, onOrder: number) => purchases - onOrder

/** Convert a retail amount to cost using the initial markup %. */
export const retailToCost = (retail: number, imuPct: number) => retail * (1 - imuPct)

/** Stock-to-sales ratio = BOM stock ÷ sales for the month. */
export function stockToSales(bom: number, sales: number): number {
  req(sales > 0, 'Sales must be greater than 0')
  return bom / sales
}

/** BOM stock needed = planned sales × stock-to-sales ratio. */
export const bomFromRatio = (sales: number, ratio: number) => sales * ratio

export interface PlanMonth {
  name: string
  salesPct: number // share of season sales, decimal
  ssRatio: number
  reductionsPct: number // planned reductions as % of the month's sales
}

export interface PlanRow {
  name: string
  sales: number
  bom: number
  eom: number
  reductions: number
  purchases: number
  purchasesCost: number
}

/**
 * Six-month merchandise plan. BOM for each month = sales × stock-to-sales ratio; EOM = next month's BOM
 * (the final month uses `endingEom`); purchases = sales + reductions + EOM − BOM.
 */
export function sixMonthPlan(seasonSales: number, months: PlanMonth[], endingEom: number, imuPct: number): PlanRow[] {
  const sales = months.map((m) => seasonSales * m.salesPct)
  const bom = months.map((m, i) => sales[i] * m.ssRatio)
  return months.map((m, i) => {
    const eom = i < months.length - 1 ? bom[i + 1] : endingEom
    const reductions = sales[i] * m.reductionsPct
    const purchases = plannedPurchases(sales[i], reductions, eom, bom[i])
    return { name: m.name, sales: sales[i], bom: bom[i], eom, reductions, purchases, purchasesCost: retailToCost(purchases, imuPct) }
  })
}

// ---------- Reorder point & safety stock ----------

/** Reorder point = (average daily usage × lead time in days) + safety stock. */
export const reorderPoint = (dailyUsage: number, leadDays: number, safetyStock: number) => dailyUsage * leadDays + safetyStock

/** Safety stock (simple) = daily usage × days of protection. */
export const safetyStockDays = (dailyUsage: number, days: number) => dailyUsage * days

/** Safety stock (max–average method) = (max daily usage × max lead time) − (avg daily usage × avg lead time). */
export const safetyStockMaxAvg = (maxDaily: number, maxLead: number, avgDaily: number, avgLead: number) => maxDaily * maxLead - avgDaily * avgLead

// ---------- Shrinkage ----------

/** Shrinkage $ = book (recorded) inventory − physical count. */
export const shrinkage = (book: number, physical: number) => book - physical

/** Shrink % = shrinkage $ ÷ net sales for the period. */
export function shrinkPct(book: number, physical: number, netSales: number): number {
  req(netSales > 0, 'Net sales must be greater than 0')
  return (book - physical) / netSales
}

// ---------- Break-even ----------

/** Break-even units = fixed costs ÷ (price − variable cost per unit). */
export function breakEvenUnits(fixed: number, price: number, variable: number): number {
  req(price > variable, 'Price must be greater than variable cost')
  return fixed / (price - variable)
}

/** Break-even sales $ = fixed costs ÷ contribution margin ratio. */
export function breakEvenDollars(fixed: number, price: number, variable: number): number {
  req(price > variable && price > 0, 'Price must be greater than variable cost')
  return fixed / ((price - variable) / price)
}

// ---------- Unit pricing ----------

export function unitPrice(price: number, quantity: number): number {
  req(quantity > 0, 'Quantity must be greater than 0')
  return price / quantity
}

/** Index of the better (lowest unit price) option. Ties go to the first. */
export function bestValue(options: { price: number; quantity: number }[]): number {
  let best = 0
  options.forEach((o, i) => {
    if (unitPrice(o.price, o.quantity) < unitPrice(options[best].price, options[best].quantity)) best = i
  })
  return best
}

export { isNum }
