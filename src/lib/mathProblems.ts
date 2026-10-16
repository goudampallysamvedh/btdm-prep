import * as M from './retailMath'
import { int, pick, step } from './random'

export type Unit = '$' | '%' | 'x' | 'units' | 'weeks'

export interface Problem {
  kind: string
  prompt: string
  given: { label: string; value: string }[]
  /** Numeric answer. Percent answers are decimals (0.4 = 40%). */
  answer: number
  unit: Unit
  steps: string[]
  /** Which math-lab tool explains this. */
  tool: string
}

export interface Generator {
  kind: string
  label: string
  tool: string
  group: string
  make: (r: () => number) => Problem
}

const ITEMS = ['graphic tee', 'denim jacket', 'backpack', 'water bottle', 'phone case', 'hoodie', 'sneaker', 'desk lamp', 'candle set', 'beanie', 'throw blanket', 'skin-care kit']
const CATS = ['juniors\' tops', 'home décor', 'athletic footwear', 'accessories', 'outerwear', 'stationery', 'beauty', 'pet supplies']

const $ = M.money
const P = (d: number) => M.pct(d)

export const GENERATORS: Generator[] = [
  {
    kind: 'mu-retail', label: 'Markup % on retail', tool: 'markup', group: 'Markup',
    make(r) {
      const retail = step(20, 150, 5, r)
      const mu = pick([35, 40, 45, 48, 50, 52, 55, 60], r) / 100
      const cost = M.round(retail * (1 - mu), 2)
      const item = pick(ITEMS, r)
      const md = retail - cost
      return {
        kind: this.kind, tool: this.tool, unit: '%',
        prompt: `A buyer pays ${$(cost)} for a ${item} and prices it at ${$(retail)}. What is the markup percentage on retail?`,
        given: [{ label: 'Cost', value: $(cost) }, { label: 'Retail', value: $(retail) }],
        answer: M.markupOnRetail(cost, retail),
        steps: [
          `Markup $ = retail − cost = ${$(retail)} − ${$(cost)} = ${$(md)}`,
          `Markup % on retail = markup $ ÷ retail = ${$(md)} ÷ ${$(retail)}`,
          `= ${P(M.markupOnRetail(cost, retail))}`,
        ],
      }
    },
  },
  {
    kind: 'mu-cost', label: 'Markup % on cost', tool: 'markup', group: 'Markup',
    make(r) {
      const cost = step(8, 80, 2, r)
      const mu = pick([25, 40, 50, 60, 75, 80, 100, 120], r) / 100
      const retail = M.round(cost * (1 + mu), 2)
      const item = pick(ITEMS, r)
      return {
        kind: this.kind, tool: this.tool, unit: '%',
        prompt: `A ${item} costs ${$(cost)} and retails for ${$(retail)}. What is the markup percentage on cost?`,
        given: [{ label: 'Cost', value: $(cost) }, { label: 'Retail', value: $(retail) }],
        answer: M.markupOnCost(cost, retail),
        steps: [
          `Markup $ = ${$(retail)} − ${$(cost)} = ${$(retail - cost)}`,
          `Markup % on cost = markup $ ÷ cost = ${$(retail - cost)} ÷ ${$(cost)}`,
          `= ${P(M.markupOnCost(cost, retail))}`,
        ],
      }
    },
  },
  {
    kind: 'retail-from-mu', label: 'Retail price from markup %', tool: 'markup', group: 'Markup',
    make(r) {
      const mu = pick([40, 45, 50, 55, 60], r) / 100
      const retail = step(20, 120, 5, r)
      const cost = M.round(retail * (1 - mu), 2)
      const item = pick(ITEMS, r)
      return {
        kind: this.kind, tool: this.tool, unit: '$',
        prompt: `A ${item} costs ${$(cost)}. The buyer wants a ${P(mu)} markup on retail. What should the retail price be?`,
        given: [{ label: 'Cost', value: $(cost) }, { label: 'Target markup on retail', value: P(mu) }],
        answer: M.retailFromCostRetailPct(cost, mu),
        steps: [
          `Cost is the part of retail that isn't markup: cost = retail × (100% − ${P(mu)}) = retail × ${P(1 - mu)}`,
          `Retail = cost ÷ (1 − markup %) = ${$(cost)} ÷ ${M.num(1 - mu)}`,
          `= ${$(M.retailFromCostRetailPct(cost, mu))}`,
          `Check: (${$(retail)} − ${$(cost)}) ÷ ${$(retail)} = ${P(mu)} ✓`,
        ],
      }
    },
  },
  {
    kind: 'cost-from-retail', label: 'Most you can pay (cost) for a price', tool: 'markup', group: 'Markup',
    make(r) {
      const retail = pick([19.99, 24.99, 29.99, 39.99, 49.99, 59.99, 79.99], r)
      const mu = pick([45, 50, 52, 55, 58, 60], r) / 100
      const ans = M.costFromRetail(retail, mu)
      return {
        kind: this.kind, tool: this.tool, unit: '$',
        prompt: `A ${pick(ITEMS, r)} will retail for ${$(retail)}. To earn a ${P(mu)} markup on retail, what is the most the buyer can pay per unit?`,
        given: [{ label: 'Retail', value: $(retail) }, { label: 'Markup on retail', value: P(mu) }],
        answer: ans,
        steps: [`Cost = retail × (1 − markup %)`, `= ${$(retail)} × ${M.num(1 - mu)}`, `= ${$(ans)}`],
      }
    },
  },
  {
    kind: 'convert', label: 'Convert markup bases', tool: 'markup', group: 'Markup',
    make(r) {
      const toRetail = r() < 0.5
      if (toRetail) {
        const c = pick([25, 50, 60, 75, 100, 150], r) / 100
        const ans = M.costPctToRetailPct(c)
        return {
          kind: this.kind, tool: this.tool, unit: '%',
          prompt: `A vendor quotes a ${P(c)} markup on cost. What is that markup as a percentage of retail?`,
          given: [{ label: 'Markup on cost', value: P(c) }],
          answer: ans,
          steps: [`Retail % = cost % ÷ (100% + cost %)`, `= ${P(c)} ÷ ${P(1 + c)}`, `= ${P(ans)}`],
        }
      }
      const rr = pick([20, 25, 33.3, 40, 50, 60], r) / 100
      const ans = M.retailPctToCostPct(rr)
      return {
        kind: this.kind, tool: this.tool, unit: '%',
        prompt: `A department plans a ${P(rr)} markup on retail. What is the equivalent markup on cost?`,
        given: [{ label: 'Markup on retail', value: P(rr) }],
        answer: ans,
        steps: [`Cost % = retail % ÷ (100% − retail %)`, `= ${P(rr)} ÷ ${P(1 - rr)}`, `= ${P(ans)}`],
      }
    },
  },
  {
    kind: 'off-retail', label: 'Markdown % off', tool: 'markdown', group: 'Markdowns',
    make(r) {
      const original = step(20, 200, 5, r)
      const off = pick([10, 15, 20, 25, 30, 40, 50, 60, 70], r) / 100
      const sale = M.round(original * (1 - off), 2)
      return {
        kind: this.kind, tool: this.tool, unit: '%',
        prompt: `A ${pick(ITEMS, r)} originally priced at ${$(original)} is marked down to ${$(sale)}. What is the markdown percentage (off the original price)?`,
        given: [{ label: 'Original retail', value: $(original) }, { label: 'Sale price', value: $(sale) }],
        answer: M.offRetailPct(original, sale),
        steps: [
          `Markdown $ = ${$(original)} − ${$(sale)} = ${$(original - sale)}`,
          `Markdown % = markdown $ ÷ original price = ${$(original - sale)} ÷ ${$(original)}`,
          `= ${P(M.offRetailPct(original, sale))}`,
          `Trap: dividing by the sale price gives ${P((original - sale) / sale)}, which is wrong.`,
        ],
      }
    },
  },
  {
    kind: 'sale-price', label: 'Sale price after % off', tool: 'markdown', group: 'Markdowns',
    make(r) {
      const original = pick([24, 36, 48, 59.99, 64, 79.5, 120, 145], r)
      const off = pick([15, 20, 25, 30, 35, 40, 45], r) / 100
      const ans = M.salePrice(original, off)
      return {
        kind: this.kind, tool: this.tool, unit: '$',
        prompt: `A ${pick(ITEMS, r)} regularly ${$(original)} goes on sale at ${P(off)} off. What is the sale price?`,
        given: [{ label: 'Original', value: $(original) }, { label: '% off', value: P(off) }],
        answer: ans,
        steps: [`Sale price = original × (1 − % off)`, `= ${$(original)} × ${M.num(1 - off)}`, `= ${$(ans)}`],
      }
    },
  },
  {
    kind: 'md-sales', label: 'Markdown % of net sales', tool: 'markdown', group: 'Markdowns',
    make(r) {
      const units = step(40, 400, 20, r)
      const each = pick([5, 8, 10, 12, 15, 20], r)
      const netSales = step(20000, 120000, 5000, r)
      const total = units * each
      const ans = M.markdownPctOfSales(total, netSales)
      return {
        kind: this.kind, tool: this.tool, unit: '%',
        prompt: `In ${pick(CATS, r)}, ${units} units were each marked down ${$(each)} this month. Net sales for the month were ${$(netSales)}. What is the markdown percentage of net sales?`,
        given: [{ label: 'Units marked down', value: String(units) }, { label: 'Markdown per unit', value: $(each) }, { label: 'Net sales', value: $(netSales) }],
        answer: ans,
        steps: [`Total markdown $ = ${units} × ${$(each)} = ${$(total)}`, `Markdown % of sales = ${$(total)} ÷ ${$(netSales)}`, `= ${P(ans)}`],
      }
    },
  },
  {
    kind: 'mmu', label: 'Maintained markup %', tool: 'margin', group: 'Margins',
    make(r) {
      const sales = step(50000, 400000, 10000, r)
      const mmu = pick([36, 38, 40, 42, 44, 46, 48, 50], r) / 100
      const cogs = M.round(sales * (1 - mmu), 2)
      return {
        kind: this.kind, tool: this.tool, unit: '%',
        prompt: `A department had net sales of ${$(sales)} and a cost of goods sold of ${$(cogs)}. What is its maintained markup percentage?`,
        given: [{ label: 'Net sales', value: $(sales) }, { label: 'Cost of goods sold', value: $(cogs) }],
        answer: M.maintainedMarkupPct(sales, cogs),
        steps: [`Maintained markup $ = net sales − COGS = ${$(sales)} − ${$(cogs)} = ${$(sales - cogs)}`, `MMU % = ${$(sales - cogs)} ÷ ${$(sales)}`, `= ${P(M.maintainedMarkupPct(sales, cogs))}`],
      }
    },
  },
  {
    kind: 'imu', label: 'Initial markup needed', tool: 'margin', group: 'Margins',
    make(r) {
      const mmu = pick([38, 40, 42, 45, 48], r) / 100
      const red = pick([5, 8, 10, 12, 15, 20], r) / 100
      const ans = M.initialMarkupPct(mmu, red)
      return {
        kind: this.kind, tool: this.tool, unit: '%',
        prompt: `A buyer wants a ${P(mmu)} maintained markup and expects reductions (markdowns, discounts, shrink) of ${P(red)} of net sales. What initial markup % must she plan?`,
        given: [{ label: 'Maintained markup goal', value: P(mmu) }, { label: 'Reductions (% of sales)', value: P(red) }],
        answer: ans,
        steps: [`IMU % = (MMU % + reductions %) ÷ (100% + reductions %)`, `= (${P(mmu)} + ${P(red)}) ÷ (100% + ${P(red)})`, `= ${M.num(mmu + red, 3)} ÷ ${M.num(1 + red, 3)}`, `= ${P(ans)}`],
      }
    },
  },
  {
    kind: 'gross-margin', label: 'Gross margin $', tool: 'margin', group: 'Margins',
    make(r) {
      const sales = step(60000, 300000, 5000, r)
      const cogs = M.round(sales * pick([0.52, 0.55, 0.58, 0.6, 0.62], r), 0)
      const cash = step(500, 4000, 250, r)
      const work = step(200, 2500, 100, r)
      const ans = M.grossMargin(sales, cogs, cash, work)
      return {
        kind: this.kind, tool: this.tool, unit: '$',
        prompt: `Net sales were ${$(sales)}, gross cost of goods sold was ${$(cogs)}, cash discounts earned were ${$(cash)}, and alteration (workroom) costs were ${$(work)}. What is the gross margin in dollars?`,
        given: [{ label: 'Net sales', value: $(sales) }, { label: 'Gross COGS', value: $(cogs) }, { label: 'Cash discounts', value: $(cash) }, { label: 'Workroom costs', value: $(work) }],
        answer: ans,
        steps: [`Maintained markup = ${$(sales)} − ${$(cogs)} = ${$(sales - cogs)}`, `Gross margin = MMU + cash discounts − workroom costs`, `= ${$(sales - cogs)} + ${$(cash)} − ${$(work)}`, `= ${$(ans)}`],
      }
    },
  },
  {
    kind: 'turnover', label: 'Stock turnover', tool: 'turnover', group: 'Inventory',
    make(r) {
      const n = pick([3, 4, 6], r)
      const readings = Array.from({ length: n + 1 }, () => step(40000, 90000, 2000, r))
      const avg = M.averageInventory(readings)
      const turn = pick([2, 2.5, 3, 3.5, 4], r) * (n / 6)
      const sales = M.round(avg * turn, 0)
      const ans = M.stockTurnover(sales, avg)
      return {
        kind: this.kind, tool: this.tool, unit: 'x',
        prompt: `Over ${n} months, a ${pick(CATS, r)} department had net sales of ${$(sales)} at retail. Its BOM inventories (at retail) were ${readings.slice(0, n).map($).join(', ')}, and its final EOM was ${$(readings[n])}. What was its stock turnover for the period?`,
        given: [{ label: 'Net sales', value: $(sales) }, { label: 'Inventory readings', value: readings.map($).join(', ') }],
        answer: ans,
        steps: [
          `Average inventory = (${n} BOMs + final EOM) ÷ ${n + 1}`,
          `= ${$(readings.reduce((a, b) => a + b, 0))} ÷ ${n + 1} = ${$(avg)}`,
          `Turnover = net sales ÷ average inventory = ${$(sales)} ÷ ${$(avg)}`,
          `= ${M.num(ans)} times`,
        ],
      }
    },
  },
  {
    kind: 'sell-through', label: 'Sell-through %', tool: 'turnover', group: 'Inventory',
    make(r) {
      const beg = step(0, 200, 20, r)
      const rec = step(100, 600, 50, r)
      const st = pick([30, 40, 45, 55, 60, 65, 70, 80], r) / 100
      const sold = Math.round((beg + rec) * st)
      const ans = M.sellThrough(sold, beg, rec)
      return {
        kind: this.kind, tool: this.tool, unit: '%',
        prompt: `A store started the month with ${beg} units of a ${pick(ITEMS, r)}, received ${rec} more, and sold ${sold}. What is the sell-through rate?`,
        given: [{ label: 'Beginning units', value: String(beg) }, { label: 'Receipts', value: String(rec) }, { label: 'Units sold', value: String(sold) }],
        answer: ans,
        steps: [`Units available = ${beg} + ${rec} = ${beg + rec}`, `Sell-through = units sold ÷ units available = ${sold} ÷ ${beg + rec}`, `= ${P(ans)}`],
      }
    },
  },
  {
    kind: 'wos', label: 'Weeks of supply', tool: 'turnover', group: 'Inventory',
    make(r) {
      const weekly = step(20, 200, 10, r)
      const weeks = pick([3, 4, 5, 6, 8, 10, 12], r)
      const onHand = weekly * weeks
      return {
        kind: this.kind, tool: this.tool, unit: 'weeks',
        prompt: `A store has ${onHand} units of a ${pick(ITEMS, r)} on hand and sells about ${weekly} a week. How many weeks of supply does it have?`,
        given: [{ label: 'On hand', value: String(onHand) }, { label: 'Weekly sales', value: String(weekly) }],
        answer: M.weeksOfSupply(onHand, weekly),
        steps: [`Weeks of supply = on hand ÷ weekly sales = ${onHand} ÷ ${weekly}`, `= ${weeks} weeks`],
      }
    },
  },
  {
    kind: 'gmroi', label: 'GMROI', tool: 'turnover', group: 'Inventory',
    make(r) {
      const inv = step(20000, 150000, 5000, r)
      const g = pick([1.5, 2, 2.4, 2.5, 3, 3.2, 4], r)
      const gm = M.round(inv * g, 0)
      return {
        kind: this.kind, tool: this.tool, unit: '$',
        prompt: `A category earned ${$(gm)} in gross margin. Its average inventory at cost was ${$(inv)}. What is its GMROI (gross margin dollars per $1 of inventory)?`,
        given: [{ label: 'Gross margin', value: $(gm) }, { label: 'Avg. inventory at cost', value: $(inv) }],
        answer: M.gmroi(gm, inv),
        steps: [`GMROI = gross margin $ ÷ average inventory at cost`, `= ${$(gm)} ÷ ${$(inv)}`, `= ${$(M.gmroi(gm, inv))} of margin per $1 invested`],
      }
    },
  },
  {
    kind: 'purchases', label: 'Planned purchases', tool: 'otb', group: 'Planning',
    make(r) {
      const sales = step(20000, 80000, 1000, r)
      const red = M.round(sales * pick([0.05, 0.08, 0.1, 0.12], r), 0)
      const bom = step(60000, 200000, 5000, r)
      const eom = step(60000, 200000, 5000, r)
      const ans = M.plannedPurchases(sales, red, eom, bom)
      if (ans <= 0) return this.make(r)
      return {
        kind: this.kind, tool: this.tool, unit: '$',
        prompt: `For next month a buyer plans sales of ${$(sales)}, reductions of ${$(red)}, a BOM stock of ${$(bom)}, and an EOM stock of ${$(eom)} (all at retail). What are planned purchases at retail?`,
        given: [{ label: 'Planned sales', value: $(sales) }, { label: 'Reductions', value: $(red) }, { label: 'EOM', value: $(eom) }, { label: 'BOM', value: $(bom) }],
        answer: ans,
        steps: [`Planned purchases = sales + reductions + EOM − BOM`, `= ${$(sales)} + ${$(red)} + ${$(eom)} − ${$(bom)}`, `= ${$(ans)}`],
      }
    },
  },
  {
    kind: 'otb', label: 'Open-to-buy at cost', tool: 'otb', group: 'Planning',
    make(r) {
      const sales = step(30000, 90000, 1000, r)
      const red = step(1000, 8000, 500, r)
      const bom = step(80000, 180000, 5000, r)
      const eom = bom + step(-20000, 30000, 5000, r)
      const purchases = M.plannedPurchases(sales, red, eom, bom)
      const onOrder = M.round(purchases * pick([0.2, 0.3, 0.4, 0.5], r), -2)
      const imu = pick([45, 48, 50, 52, 55], r) / 100
      const otbR = M.openToBuy(purchases, onOrder)
      if (otbR <= 0) return this.make(r)
      const ans = M.retailToCost(otbR, imu)
      return {
        kind: this.kind, tool: this.tool, unit: '$',
        prompt: `Planned sales ${$(sales)}, reductions ${$(red)}, EOM ${$(eom)}, BOM ${$(bom)} (retail). ${$(onOrder)} at retail is already on order. With a ${P(imu)} initial markup, what is the open-to-buy at cost?`,
        given: [{ label: 'Sales', value: $(sales) }, { label: 'Reductions', value: $(red) }, { label: 'EOM', value: $(eom) }, { label: 'BOM', value: $(bom) }, { label: 'On order', value: $(onOrder) }, { label: 'IMU', value: P(imu) }],
        answer: ans,
        steps: [
          `Planned purchases = ${$(sales)} + ${$(red)} + ${$(eom)} − ${$(bom)} = ${$(purchases)}`,
          `OTB at retail = planned purchases − on order = ${$(purchases)} − ${$(onOrder)} = ${$(otbR)}`,
          `OTB at cost = OTB retail × (1 − IMU) = ${$(otbR)} × ${M.num(1 - imu)}`,
          `= ${$(ans)}`,
        ],
      }
    },
  },
  {
    kind: 'ss-ratio', label: 'Stock-to-sales ratio', tool: 'otb', group: 'Planning',
    make(r) {
      const sales = step(10000, 60000, 1000, r)
      const ratio = pick([2, 2.5, 3, 3.2, 3.5, 4, 4.5], r)
      if (r() < 0.5) {
        const ans = M.bomFromRatio(sales, ratio)
        return {
          kind: this.kind, tool: this.tool, unit: '$',
          prompt: `A buyer plans May sales of ${$(sales)} and uses a stock-to-sales ratio of ${ratio}. What BOM stock (at retail) is needed?`,
          given: [{ label: 'Planned sales', value: $(sales) }, { label: 'Stock-to-sales ratio', value: String(ratio) }],
          answer: ans,
          steps: [`BOM = planned sales × stock-to-sales ratio`, `= ${$(sales)} × ${ratio}`, `= ${$(ans)}`],
        }
      }
      const bom = sales * ratio
      return {
        kind: this.kind, tool: this.tool, unit: 'x',
        prompt: `A department started the month with ${$(bom)} in stock (retail) and sold ${$(sales)} that month. What is its stock-to-sales ratio?`,
        given: [{ label: 'BOM stock', value: $(bom) }, { label: 'Sales', value: $(sales) }],
        answer: ratio,
        steps: [`Stock-to-sales = BOM ÷ sales = ${$(bom)} ÷ ${$(sales)}`, `= ${ratio}`],
      }
    },
  },
  {
    kind: 'reorder', label: 'Reorder point', tool: 'reorder', group: 'Inventory',
    make(r) {
      const daily = int(4, 40, r)
      const lead = int(3, 14, r)
      const safetyDays = int(2, 6, r)
      const ss = daily * safetyDays
      const ans = M.reorderPoint(daily, lead, ss)
      return {
        kind: this.kind, tool: this.tool, unit: 'units',
        prompt: `A store sells about ${daily} units a day of a basic ${pick(ITEMS, r)}. The vendor's lead time is ${lead} days, and the buyer keeps ${safetyDays} days of safety stock. At what stock level should the buyer reorder?`,
        given: [{ label: 'Daily sales', value: String(daily) }, { label: 'Lead time', value: `${lead} days` }, { label: 'Safety stock', value: `${safetyDays} days` }],
        answer: ans,
        steps: [`Safety stock = ${daily} × ${safetyDays} = ${ss} units`, `Reorder point = (daily usage × lead time) + safety stock`, `= (${daily} × ${lead}) + ${ss} = ${daily * lead} + ${ss}`, `= ${ans} units`],
      }
    },
  },
  {
    kind: 'shrink', label: 'Shrinkage %', tool: 'shrink', group: 'Inventory',
    make(r) {
      const sales = step(100000, 900000, 10000, r)
      const rate = pick([0.8, 1, 1.2, 1.4, 1.5, 1.6, 2, 2.5], r) / 100
      const shrink = M.round(sales * rate, 0)
      const physical = step(80000, 250000, 1000, r)
      const book = physical + shrink
      const ans = M.shrinkPct(book, physical, sales)
      return {
        kind: this.kind, tool: this.tool, unit: '%',
        prompt: `A store's records show ${$(book)} of inventory at retail, but the physical count finds ${$(physical)}. Net sales for the period were ${$(sales)}. What is the shrinkage as a % of sales?`,
        given: [{ label: 'Book inventory', value: $(book) }, { label: 'Physical count', value: $(physical) }, { label: 'Net sales', value: $(sales) }],
        answer: ans,
        steps: [`Shrinkage $ = book − physical = ${$(book)} − ${$(physical)} = ${$(shrink)}`, `Shrink % = ${$(shrink)} ÷ ${$(sales)}`, `= ${P(ans)}`],
      }
    },
  },
  {
    kind: 'breakeven', label: 'Break-even units', tool: 'breakeven', group: 'Pricing',
    make(r) {
      const price = step(12, 80, 1, r)
      const variable = M.round(price * pick([0.3, 0.4, 0.5, 0.6], r), 2)
      const cm = M.round(price - variable, 2)
      const units = step(100, 2000, 50, r)
      const fixed = M.round(cm * units, 0)
      const ans = M.breakEvenUnits(fixed, price, variable)
      return {
        kind: this.kind, tool: this.tool, unit: 'units',
        prompt: `A pop-up shop has fixed costs of ${$(fixed)}. It sells a ${pick(ITEMS, r)} for ${$(price)} with a variable cost of ${$(variable)} each. How many must it sell to break even?`,
        given: [{ label: 'Fixed costs', value: $(fixed) }, { label: 'Price', value: $(price) }, { label: 'Variable cost', value: $(variable) }],
        answer: Math.ceil(ans - 1e-9),
        steps: [`Contribution margin per unit = ${$(price)} − ${$(variable)} = ${$(cm)}`, `Break-even units = fixed costs ÷ contribution margin = ${$(fixed)} ÷ ${$(cm)}`, `= ${M.num(ans)} → ${Math.ceil(ans - 1e-9)} units`],
      }
    },
  },
  {
    kind: 'unit-price', label: 'Best unit price', tool: 'unitprice', group: 'Pricing',
    make(r) {
      const a = { quantity: pick([6, 8, 10, 12], r), price: 0 }
      const b = { quantity: pick([16, 18, 20, 24], r), price: 0 }
      a.price = M.round(a.quantity * pick([0.35, 0.4, 0.45, 0.5, 0.55], r) - 0.01, 2)
      b.price = M.round(b.quantity * pick([0.3, 0.36, 0.42, 0.48, 0.52], r) - 0.01, 2)
      const ua = M.unitPrice(a.price, a.quantity)
      const ub = M.unitPrice(b.price, b.quantity)
      const best = ua <= ub ? ua : ub
      return {
        kind: this.kind, tool: this.tool, unit: '$',
        prompt: `Pack A: ${a.quantity} for ${$(a.price)}. Pack B: ${b.quantity} for ${$(b.price)}. What is the unit price of the better buy? (Round to the nearest cent.)`,
        given: [{ label: 'Pack A', value: `${a.quantity} for ${$(a.price)}` }, { label: 'Pack B', value: `${b.quantity} for ${$(b.price)}` }],
        answer: M.round(best, 2),
        steps: [`Unit price A = ${$(a.price)} ÷ ${a.quantity} = ${$(ua)} (${M.num(ua, 4)})`, `Unit price B = ${$(b.price)} ÷ ${b.quantity} = ${$(ub)} (${M.num(ub, 4)})`, `Better buy: Pack ${ua <= ub ? 'A' : 'B'} at ${$(best)} each`],
      }
    },
  },
]

export const GENERATOR_BY_KIND = Object.fromEntries(GENERATORS.map((g) => [g.kind, g]))

/** Parse a typed answer: strips $, %, commas, and "x"/"times"/"units"/"weeks". */
export function parseAnswer(raw: string): number | null {
  const s = raw.replace(/[$,%\s]|times|units?|weeks?|x/gi, '')
  if (!s || !/^-?\d*\.?\d+$/.test(s)) return null
  return Number(s)
}

/** Is a typed value (in display units: percent answers typed as 40 for 40%) close enough? */
export function isCorrect(p: Pick<Problem, 'answer' | 'unit'>, typed: number): boolean {
  if (p.unit === '%') {
    const want = p.answer * 100
    return Math.abs(typed - want) <= Math.max(0.15, Math.abs(want) * 0.002)
  }
  if (p.unit === '$') return Math.abs(typed - p.answer) <= Math.max(0.011, Math.abs(p.answer) * 0.002)
  if (p.unit === 'units') return Math.abs(typed - p.answer) <= 0.5
  return Math.abs(typed - p.answer) <= Math.max(0.011, Math.abs(p.answer) * 0.005)
}

export function displayAnswer(p: Pick<Problem, 'answer' | 'unit'>): string {
  switch (p.unit) {
    case '%': return M.pct(p.answer)
    case '$': return M.money(p.answer)
    case 'x': return `${M.num(p.answer)} times`
    case 'weeks': return `${M.num(p.answer)} weeks`
    default: return `${M.num(p.answer, 0)} units`
  }
}
