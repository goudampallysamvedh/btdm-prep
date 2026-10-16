import * as M from '@/lib/retailMath'

export interface Field {
  key: string
  label: string
  unit: '$' | '%' | '#' | 'days'
  default: number
}

export interface Output {
  label: string
  value: string
  steps: string[]
  primary?: boolean
}

export interface ToolMode {
  id: string
  label: string
  fields: Field[]
  compute: (v: Record<string, number>) => Output[]
}

export interface Tool {
  id: string
  title: string
  group: string
  blurb: string
  formulas: { name: string; f: string }[]
  /** Why it matters in a BTDM case. */
  caseUse: string
  modes: ToolMode[]
  /** Generator kinds for practice. */
  practice: string[]
}

const $ = M.money
const P = (d: number) => M.pct(d)
const pc = (v: number) => v / 100

export const TOOLS: Tool[] = [
  {
    id: 'markup', title: 'Markup: on cost vs. on retail', group: 'Pricing',
    blurb: 'Retailers usually quote markup as a % of retail. Vendors and new buyers often think in % of cost. Same dollars, different base.',
    formulas: [
      { name: 'Markup $', f: 'Retail − Cost' },
      { name: 'Markup % on retail', f: 'Markup $ ÷ Retail' },
      { name: 'Markup % on cost', f: 'Markup $ ÷ Cost' },
      { name: 'Retail from cost', f: 'Cost ÷ (1 − Markup % on retail)' },
      { name: 'Convert cost % → retail %', f: 'Cost % ÷ (100% + Cost %)' },
      { name: 'Convert retail % → cost %', f: 'Retail % ÷ (100% − Retail %)' },
    ],
    caseUse: '"Our exclusive costs us $12 and retails at $25.99, a 54% markup, above the 50% keystone target."',
    practice: ['mu-retail', 'mu-cost', 'retail-from-mu', 'cost-from-retail', 'convert'],
    modes: [
      {
        id: 'both', label: 'Cost + retail → markup',
        fields: [{ key: 'cost', label: 'Cost', unit: '$', default: 24 }, { key: 'retail', label: 'Retail', unit: '$', default: 40 }],
        compute: ({ cost, retail }) => {
          const md = M.markupDollars(cost, retail)
          return [
            { label: 'Markup $', value: $(md), steps: [`${$(retail)} − ${$(cost)} = ${$(md)}`] },
            { label: 'Markup % on retail', value: P(M.markupOnRetail(cost, retail)), steps: [`${$(md)} ÷ ${$(retail)} = ${P(M.markupOnRetail(cost, retail))}`], primary: true },
            { label: 'Markup % on cost', value: P(M.markupOnCost(cost, retail)), steps: [`${$(md)} ÷ ${$(cost)} = ${P(M.markupOnCost(cost, retail))}`] },
          ]
        },
      },
      {
        id: 'price', label: 'Cost + target % → retail',
        fields: [{ key: 'cost', label: 'Cost', unit: '$', default: 18 }, { key: 'mu', label: 'Markup on retail', unit: '%', default: 60 }],
        compute: ({ cost, mu }) => {
          const r = M.retailFromCostRetailPct(cost, pc(mu))
          return [
            { label: 'Retail price', value: $(r), steps: [`${$(cost)} ÷ (1 − ${P(pc(mu))}) = ${$(cost)} ÷ ${M.num(1 - pc(mu))} = ${$(r)}`], primary: true },
            { label: 'Markup $', value: $(r - cost), steps: [`${$(r)} − ${$(cost)} = ${$(r - cost)}`] },
            { label: 'Same markup on cost', value: P(M.retailPctToCostPct(pc(mu))), steps: [`${P(pc(mu))} ÷ ${P(1 - pc(mu))} = ${P(M.retailPctToCostPct(pc(mu)))}`] },
          ]
        },
      },
      {
        id: 'cost', label: 'Retail + target % → max cost',
        fields: [{ key: 'retail', label: 'Retail', unit: '$', default: 29.99 }, { key: 'mu', label: 'Markup on retail', unit: '%', default: 55 }],
        compute: ({ retail, mu }) => {
          const c = M.costFromRetail(retail, pc(mu))
          return [{ label: 'Most you can pay', value: $(c), steps: [`${$(retail)} × (1 − ${P(pc(mu))}) = ${$(retail)} × ${M.num(1 - pc(mu))} = ${$(c)}`], primary: true }]
        },
      },
      {
        id: 'convert', label: 'Convert % bases',
        fields: [{ key: 'pct', label: 'Markup % on cost', unit: '%', default: 100 }],
        compute: ({ pct }) => [
          { label: 'As % of retail', value: P(M.costPctToRetailPct(pc(pct))), steps: [`${P(pc(pct))} ÷ ${P(1 + pc(pct))} = ${P(M.costPctToRetailPct(pc(pct)))}`], primary: true },
          ...(pct < 100 ? [{ label: `If ${P(pc(pct))} were on retail, on cost it's`, value: P(M.retailPctToCostPct(pc(pct))), steps: [`${P(pc(pct))} ÷ ${P(1 - pc(pct))} = ${P(M.retailPctToCostPct(pc(pct)))}`] }] : []),
        ],
      },
    ],
  },
  {
    id: 'markdown', title: 'Markdowns', group: 'Pricing',
    blurb: 'Shoppers see "% off" (based on the original price). Buyers track markdowns as a % of net sales in their plans.',
    formulas: [
      { name: 'Markdown $', f: 'Original price − Sale price' },
      { name: 'Off-retail %', f: 'Markdown $ ÷ Original price' },
      { name: 'Sale price', f: 'Original × (1 − % off)' },
      { name: 'Markdown % of sales', f: 'Total markdown $ ÷ Net sales' },
    ],
    caseUse: '"Taking 25% off now while it still sells costs less than 60% off in August."',
    practice: ['off-retail', 'sale-price', 'md-sales'],
    modes: [
      {
        id: 'pct', label: 'Original + sale → % off',
        fields: [{ key: 'orig', label: 'Original price', unit: '$', default: 60 }, { key: 'sale', label: 'Sale price', unit: '$', default: 45 }],
        compute: ({ orig, sale }) => [
          { label: 'Markdown $', value: $(orig - sale), steps: [`${$(orig)} − ${$(sale)} = ${$(orig - sale)}`] },
          { label: 'Off-retail %', value: P(M.offRetailPct(orig, sale)), steps: [`${$(orig - sale)} ÷ ${$(orig)} = ${P(M.offRetailPct(orig, sale))}`, `(Not ÷ the sale price: that would give ${P((orig - sale) / sale)}.)`], primary: true },
        ],
      },
      {
        id: 'sale', label: 'Original + % off → sale price',
        fields: [{ key: 'orig', label: 'Original price', unit: '$', default: 79.5 }, { key: 'off', label: '% off', unit: '%', default: 30 }],
        compute: ({ orig, off }) => [{ label: 'Sale price', value: $(M.salePrice(orig, pc(off))), steps: [`${$(orig)} × (1 − ${P(pc(off))}) = ${$(orig)} × ${M.num(1 - pc(off))} = ${$(M.salePrice(orig, pc(off)))}`], primary: true }],
      },
      {
        id: 'sales', label: 'Markdown % of sales',
        fields: [{ key: 'md', label: 'Total markdown $', unit: '$', default: 6000 }, { key: 'ns', label: 'Net sales', unit: '$', default: 50000 }],
        compute: ({ md, ns }) => [{ label: 'Markdown % of sales', value: P(M.markdownPctOfSales(md, ns)), steps: [`${$(md)} ÷ ${$(ns)} = ${P(M.markdownPctOfSales(md, ns))}`], primary: true }],
      },
    ],
  },
  {
    id: 'margin', title: 'Maintained markup & gross margin', group: 'Profit',
    blurb: 'Initial markup is what you plan. Maintained markup is what\'s left after markdowns, discounts, and shrink. Gross margin also adds cash discounts and subtracts workroom costs.',
    formulas: [
      { name: 'Maintained markup $', f: 'Net sales − Cost of goods sold' },
      { name: 'MMU %', f: 'MMU $ ÷ Net sales' },
      { name: 'Gross margin $', f: 'MMU $ + Cash discounts − Workroom costs' },
      { name: 'Initial markup % needed', f: '(MMU % + Reductions %) ÷ (100% + Reductions %)' },
    ],
    caseUse: '"Even after planned 10% markdowns, a 47% initial markup keeps our maintained markup at 42%."',
    practice: ['mmu', 'imu', 'gross-margin'],
    modes: [
      {
        id: 'gm', label: 'Sales + costs → MMU & GM',
        fields: [
          { key: 'ns', label: 'Net sales', unit: '$', default: 100000 },
          { key: 'cogs', label: 'Gross cost of goods sold', unit: '$', default: 58000 },
          { key: 'cash', label: 'Cash discounts earned', unit: '$', default: 2000 },
          { key: 'work', label: 'Workroom costs', unit: '$', default: 1000 },
        ],
        compute: ({ ns, cogs, cash, work }) => {
          const mmu = M.maintainedMarkup(ns, cogs)
          const gm = M.grossMargin(ns, cogs, cash, work)
          return [
            { label: 'Maintained markup', value: `${$(mmu)} (${P(mmu / ns)})`, steps: [`${$(ns)} − ${$(cogs)} = ${$(mmu)}`, `${$(mmu)} ÷ ${$(ns)} = ${P(mmu / ns)}`] },
            { label: 'Gross margin', value: `${$(gm)} (${P(gm / ns)})`, steps: [`${$(mmu)} + ${$(cash)} − ${$(work)} = ${$(gm)}`, `${$(gm)} ÷ ${$(ns)} = ${P(gm / ns)}`], primary: true },
          ]
        },
      },
      {
        id: 'imu', label: 'MMU goal → IMU needed',
        fields: [{ key: 'mmu', label: 'Maintained markup goal', unit: '%', default: 40 }, { key: 'red', label: 'Reductions (% of sales)', unit: '%', default: 10 }],
        compute: ({ mmu, red }) => {
          const imu = M.initialMarkupPct(pc(mmu), pc(red))
          return [{ label: 'Initial markup needed', value: P(imu), steps: [`(${P(pc(mmu))} + ${P(pc(red))}) ÷ (100% + ${P(pc(red))})`, `= ${M.num(pc(mmu) + pc(red), 3)} ÷ ${M.num(1 + pc(red), 3)} = ${P(imu)}`], primary: true }]
        },
      },
    ],
  },
  {
    id: 'turnover', title: 'Turnover, sell-through & GMROI', group: 'Inventory',
    blurb: 'How fast inventory sells and how hard each inventory dollar works. Higher turn and GMROI mean less money tied up in stock.',
    formulas: [
      { name: 'Average inventory', f: '(Each BOM + final EOM) ÷ (months + 1)' },
      { name: 'Stock turnover', f: 'Net sales ÷ Average inventory (same basis)' },
      { name: 'Sell-through %', f: 'Units sold ÷ (Beginning units + Receipts)' },
      { name: 'Weeks of supply', f: 'On hand ÷ Average weekly sales' },
      { name: 'GMROI', f: 'Gross margin $ ÷ Average inventory at cost' },
    ],
    caseUse: '"We\'ll judge the test after four weeks: 60%+ sell-through means we reorder; under 35% means we mark down."',
    practice: ['turnover', 'sell-through', 'wos', 'gmroi'],
    modes: [
      {
        id: 'turn', label: 'Stock turnover',
        fields: [
          { key: 'sales', label: 'Net sales (retail)', unit: '$', default: 600000 },
          { key: 'b1', label: 'Inventory reading 1', unit: '$', default: 140000 },
          { key: 'b2', label: 'Inventory reading 2', unit: '$', default: 160000 },
          { key: 'b3', label: 'Inventory reading 3', unit: '$', default: 150000 },
          { key: 'b4', label: 'Final EOM', unit: '$', default: 150000 },
        ],
        compute: ({ sales, b1, b2, b3, b4 }) => {
          const avg = M.averageInventory([b1, b2, b3, b4])
          const t = M.stockTurnover(sales, avg)
          return [
            { label: 'Average inventory', value: $(avg), steps: [`(${[b1, b2, b3, b4].map($).join(' + ')}) ÷ 4 = ${$(avg)}`] },
            { label: 'Stock turnover', value: `${M.num(t)} times`, steps: [`${$(sales)} ÷ ${$(avg)} = ${M.num(t)}`], primary: true },
          ]
        },
      },
      {
        id: 'st', label: 'Sell-through',
        fields: [{ key: 'sold', label: 'Units sold', unit: '#', default: 300 }, { key: 'beg', label: 'Beginning units', unit: '#', default: 100 }, { key: 'rec', label: 'Units received', unit: '#', default: 300 }],
        compute: ({ sold, beg, rec }) => [{ label: 'Sell-through', value: P(M.sellThrough(sold, beg, rec)), steps: [`${sold} ÷ (${beg} + ${rec}) = ${sold} ÷ ${beg + rec} = ${P(M.sellThrough(sold, beg, rec))}`], primary: true }],
      },
      {
        id: 'gmroi', label: 'GMROI',
        fields: [{ key: 'gm', label: 'Gross margin $', unit: '$', default: 90000 }, { key: 'inv', label: 'Average inventory at cost', unit: '$', default: 30000 }],
        compute: ({ gm, inv }) => [{ label: 'GMROI', value: $(M.gmroi(gm, inv)), steps: [`${$(gm)} ÷ ${$(inv)} = ${$(M.gmroi(gm, inv))} of margin per $1 of inventory`], primary: true }],
      },
      {
        id: 'wos', label: 'Weeks of supply',
        fields: [{ key: 'oh', label: 'Units on hand', unit: '#', default: 240 }, { key: 'wk', label: 'Average weekly sales', unit: '#', default: 40 }],
        compute: ({ oh, wk }) => [{ label: 'Weeks of supply', value: `${M.num(M.weeksOfSupply(oh, wk))} weeks`, steps: [`${oh} ÷ ${wk} = ${M.num(M.weeksOfSupply(oh, wk))}`], primary: true }],
      },
    ],
  },
  {
    id: 'otb', title: 'Open-to-buy & stock-to-sales', group: 'Planning',
    blurb: 'Open-to-buy is the budget a buyer still has for a month. It keeps buyers from overbuying and leaves room for hot reorders.',
    formulas: [
      { name: 'Planned purchases', f: 'Sales + Reductions + EOM − BOM' },
      { name: 'Open-to-buy (retail)', f: 'Planned purchases − On order' },
      { name: 'OTB at cost', f: 'OTB retail × (1 − Initial markup %)' },
      { name: 'Stock-to-sales ratio', f: 'BOM stock ÷ Month\'s sales' },
      { name: 'BOM needed', f: 'Planned sales × Stock-to-sales ratio' },
    ],
    caseUse: '"We\'ll fund the collab from July open-to-buy, about $18,000 at retail, without cutting core basics."',
    practice: ['purchases', 'otb', 'ss-ratio'],
    modes: [
      {
        id: 'otb', label: 'Open-to-buy',
        fields: [
          { key: 'sales', label: 'Planned sales', unit: '$', default: 40000 },
          { key: 'red', label: 'Planned reductions', unit: '$', default: 4000 },
          { key: 'eom', label: 'Planned EOM', unit: '$', default: 120000 },
          { key: 'bom', label: 'Planned BOM', unit: '$', default: 110000 },
          { key: 'oo', label: 'Already on order', unit: '$', default: 12000 },
          { key: 'imu', label: 'Initial markup', unit: '%', default: 50 },
        ],
        compute: ({ sales, red, eom, bom, oo, imu }) => {
          const pp = M.plannedPurchases(sales, red, eom, bom)
          const otb = M.openToBuy(pp, oo)
          return [
            { label: 'Planned purchases', value: $(pp), steps: [`${$(sales)} + ${$(red)} + ${$(eom)} − ${$(bom)} = ${$(pp)}`] },
            { label: 'Open-to-buy (retail)', value: $(otb), steps: [`${$(pp)} − ${$(oo)} = ${$(otb)}`], primary: true },
            { label: 'Open-to-buy (cost)', value: $(M.retailToCost(otb, pc(imu))), steps: [`${$(otb)} × (1 − ${P(pc(imu))}) = ${$(M.retailToCost(otb, pc(imu)))}`] },
          ]
        },
      },
      {
        id: 'ss', label: 'Stock-to-sales',
        fields: [{ key: 'sales', label: 'Planned sales', unit: '$', default: 20000 }, { key: 'ratio', label: 'Stock-to-sales ratio', unit: '#', default: 3.5 }],
        compute: ({ sales, ratio }) => [{ label: 'BOM stock needed', value: $(M.bomFromRatio(sales, ratio)), steps: [`${$(sales)} × ${ratio} = ${$(M.bomFromRatio(sales, ratio))}`], primary: true }],
      },
    ],
  },
  {
    id: 'six-month-plan', title: 'Six-month merchandise plan', group: 'Planning',
    blurb: 'The buyer\'s budget for a season: sales by month, the stock needed to support them, reductions, and the purchases that result. Edit any cell.',
    formulas: [
      { name: 'Monthly sales', f: 'Season sales × Month\'s % of season' },
      { name: 'BOM stock', f: 'Monthly sales × Stock-to-sales ratio' },
      { name: 'EOM stock', f: 'Next month\'s BOM' },
      { name: 'Purchases', f: 'Sales + Reductions + EOM − BOM' },
    ],
    caseUse: '"Spring sales peak in May, so we plan the most stock in April and May and let it run down in July."',
    practice: ['purchases', 'ss-ratio'],
    modes: [],
  },
  {
    id: 'reorder', title: 'Reorder point & safety stock', group: 'Inventory',
    blurb: 'For basics that should never run out: reorder before you hit zero, with a cushion for slow deliveries or sales spikes.',
    formulas: [
      { name: 'Reorder point', f: '(Daily usage × Lead time) + Safety stock' },
      { name: 'Safety stock (simple)', f: 'Daily usage × Days of protection' },
      { name: 'Safety stock (max–avg)', f: '(Max daily × Max lead) − (Avg daily × Avg lead)' },
    ],
    caseUse: '"Selling 20 a day with a 10-day lead time and 3 days of safety stock, we reorder the bestseller at 260 units."',
    practice: ['reorder'],
    modes: [
      {
        id: 'rop', label: 'Reorder point',
        fields: [{ key: 'd', label: 'Average daily sales (units)', unit: '#', default: 12 }, { key: 'l', label: 'Lead time', unit: 'days', default: 5 }, { key: 's', label: 'Safety stock (days)', unit: 'days', default: 2 }],
        compute: ({ d, l, s }) => {
          const ss = M.safetyStockDays(d, s)
          return [
            { label: 'Safety stock', value: `${M.num(ss)} units`, steps: [`${d} × ${s} = ${M.num(ss)}`] },
            { label: 'Reorder point', value: `${M.num(M.reorderPoint(d, l, ss))} units`, steps: [`(${d} × ${l}) + ${M.num(ss)} = ${M.num(d * l)} + ${M.num(ss)} = ${M.num(M.reorderPoint(d, l, ss))}`], primary: true },
          ]
        },
      },
      {
        id: 'maxavg', label: 'Safety stock (max–avg)',
        fields: [{ key: 'md', label: 'Max daily sales', unit: '#', default: 20 }, { key: 'ml', label: 'Max lead time', unit: 'days', default: 8 }, { key: 'ad', label: 'Avg daily sales', unit: '#', default: 12 }, { key: 'al', label: 'Avg lead time', unit: 'days', default: 5 }],
        compute: ({ md, ml, ad, al }) => [{ label: 'Safety stock', value: `${M.num(M.safetyStockMaxAvg(md, ml, ad, al))} units`, steps: [`(${md} × ${ml}) − (${ad} × ${al}) = ${md * ml} − ${ad * al} = ${M.num(M.safetyStockMaxAvg(md, ml, ad, al))}`], primary: true }],
      },
    ],
  },
  {
    id: 'shrink', title: 'Shrinkage', group: 'Inventory',
    blurb: 'Inventory that disappears through theft, damage, or errors. It\'s found when a physical count comes in below the book (recorded) inventory.',
    formulas: [
      { name: 'Shrinkage $', f: 'Book inventory − Physical inventory' },
      { name: 'Shrink %', f: 'Shrinkage $ ÷ Net sales' },
    ],
    caseUse: '"RFID tags on the collab line cut shrink and keep sizes in stock."',
    practice: ['shrink'],
    modes: [
      {
        id: 'shrink', label: 'Shrinkage',
        fields: [{ key: 'book', label: 'Book inventory', unit: '$', default: 48000 }, { key: 'phys', label: 'Physical count', unit: '$', default: 46800 }, { key: 'ns', label: 'Net sales', unit: '$', default: 80000 }],
        compute: ({ book, phys, ns }) => [
          { label: 'Shrinkage $', value: $(M.shrinkage(book, phys)), steps: [`${$(book)} − ${$(phys)} = ${$(M.shrinkage(book, phys))}`] },
          { label: 'Shrink %', value: P(M.shrinkPct(book, phys, ns)), steps: [`${$(M.shrinkage(book, phys))} ÷ ${$(ns)} = ${P(M.shrinkPct(book, phys, ns))}`], primary: true },
        ],
      },
    ],
  },
  {
    id: 'breakeven', title: 'Break-even', group: 'Profit',
    blurb: 'How many units (or dollars) you must sell before a new item, pop-up, or event starts making money.',
    formulas: [
      { name: 'Contribution margin', f: 'Price − Variable cost per unit' },
      { name: 'Break-even units', f: 'Fixed costs ÷ Contribution margin' },
      { name: 'Break-even $', f: 'Fixed costs ÷ (Contribution margin ÷ Price)' },
    ],
    caseUse: '"The pop-up breaks even at 400 candles, about 3 weeks at our test-store pace."',
    practice: ['breakeven'],
    modes: [
      {
        id: 'be', label: 'Break-even',
        fields: [{ key: 'f', label: 'Fixed costs', unit: '$', default: 6000 }, { key: 'p', label: 'Price per unit', unit: '$', default: 25 }, { key: 'v', label: 'Variable cost per unit', unit: '$', default: 10 }],
        compute: ({ f, p, v }) => {
          const u = M.breakEvenUnits(f, p, v)
          return [
            { label: 'Contribution margin', value: $(p - v), steps: [`${$(p)} − ${$(v)} = ${$(p - v)}`] },
            { label: 'Break-even units', value: `${M.num(Math.ceil(u - 1e-9), 0)} units`, steps: [`${$(f)} ÷ ${$(p - v)} = ${M.num(u)} → round up to ${Math.ceil(u - 1e-9)}`], primary: true },
            { label: 'Break-even sales $', value: $(M.breakEvenDollars(f, p, v)), steps: [`${$(f)} ÷ (${$(p - v)} ÷ ${$(p)}) = ${$(M.breakEvenDollars(f, p, v))}`] },
          ]
        },
      },
    ],
  },
  {
    id: 'unitprice', title: 'Unit pricing', group: 'Pricing',
    blurb: 'Price per unit (ounce, count, sheet) lets shoppers and buyers compare package sizes fairly.',
    formulas: [{ name: 'Unit price', f: 'Price ÷ Quantity' }],
    caseUse: '"Our $12.99 3-pack works out to $4.33 a pair vs. $6 for a single, a clear value message for teens."',
    practice: ['unit-price'],
    modes: [
      {
        id: 'cmp', label: 'Compare two packs',
        fields: [{ key: 'pa', label: 'Pack A price', unit: '$', default: 3.99 }, { key: 'qa', label: 'Pack A quantity', unit: '#', default: 12 }, { key: 'pb', label: 'Pack B price', unit: '$', default: 5.49 }, { key: 'qb', label: 'Pack B quantity', unit: '#', default: 18 }],
        compute: ({ pa, qa, pb, qb }) => {
          const ua = M.unitPrice(pa, qa)
          const ub = M.unitPrice(pb, qb)
          return [
            { label: 'Pack A unit price', value: `$${M.num(ua, 4)}`, steps: [`${$(pa)} ÷ ${qa} = $${M.num(ua, 4)}`] },
            { label: 'Pack B unit price', value: `$${M.num(ub, 4)}`, steps: [`${$(pb)} ÷ ${qb} = $${M.num(ub, 4)}`] },
            { label: 'Better buy', value: ua === ub ? 'Same' : ua < ub ? 'Pack A' : 'Pack B', steps: [`Lower unit price wins`], primary: true },
          ]
        },
      },
    ],
  },
]

export const TOOL_BY_ID = Object.fromEntries(TOOLS.map((t) => [t.id, t]))
