import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Card, PageHeader, cx } from '@/components/ui'

interface DiagramDef {
  id: string
  title: string
  blurb: string
  render: () => ReactNode
}

/** Shared: a set of tappable chips plus a detail panel. */
function useSelect<T extends string>(initial: T) {
  return useState<T>(initial)
}

function Detail({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-paper-2 p-4 animate-rise" role="status" aria-live="polite">
      <div className="mb-1 font-display text-lg font-extrabold" style={{ fontStretch: '108%' }}>{title}</div>
      <div className="prose-app text-[0.95rem]">{children}</div>
    </div>
  )
}

function Chips<T extends string>({ items, value, onChange, label }: { items: { id: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="tablist" aria-label={label}>
      {items.map((it) => (
        <button
          key={it.id}
          role="tab"
          aria-selected={value === it.id}
          onClick={() => onChange(it.id)}
          className={cx('min-h-10 rounded-xl border px-3 text-sm font-bold transition-colors', value === it.id ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-card text-ink-2 hover:border-accent')}
        >
          {it.label}
        </button>
      ))}
    </div>
  )
}

// ---------------- Product life cycle ----------------
const PLC = {
  intro: { label: 'Introduction', x: 100, what: 'Low sales, high costs, little or no profit. Few competitors.', moves: '<b>Penetration pricing</b> (low, build share fast) or <b>skimming</b> (high, recover development costs). Informative promotion; limited distribution.', buyer: 'Buy shallow and test. Reorder fast if sell-through is strong.' },
  growth: { label: 'Growth', x: 235, what: 'Sales climb fast and profits rise. Competitors enter.', moves: 'Add features and sizes, widen distribution, build brand preference with persuasive promotion.', buyer: 'Deepen the assortment; protect in-stock on winners.' },
  maturity: { label: 'Maturity', x: 395, what: 'Sales peak and level off. <mark>Market saturation</mark>: growth only comes from population or stealing share.', moves: 'Competitive pricing, reminder ads, product modifications, new uses or markets.', buyer: 'Manage margin; exclusives and private label help stand out.' },
  decline: { label: 'Decline', x: 545, what: 'Sales and profits fall; the product may become obsolete.', moves: 'Cut costs, harvest, or discontinue and liquidate.', buyer: 'Stop reorders, mark down early, and move remaining stock (off-price channels).' },
} as const
function PlcDiagram() {
  const [s, setS] = useSelect<keyof typeof PLC>('maturity')
  const d = PLC[s]
  return (
    <div className="grid gap-3">
      <svg viewBox="0 0 640 260" className="block h-auto w-full" role="img" aria-label="Product life cycle sales curve">
        <line x1="40" y1="230" x2="625" y2="230" stroke="var(--muted)" strokeWidth="1.5" />
        <line x1="40" y1="230" x2="40" y2="20" stroke="var(--muted)" strokeWidth="1.5" />
        <text x="46" y="50" fontSize="12" fill="var(--muted)" className="num">SALES</text>
        <text x="585" y="250" fontSize="12" fill="var(--muted)" className="num">TIME</text>
        {[160, 310, 480].map((x) => <line key={x} x1={x} y1="40" x2={x} y2="230" stroke="var(--line)" strokeDasharray="4 4" strokeWidth="1.5" />)}
        <rect x={s === 'intro' ? 40 : s === 'growth' ? 160 : s === 'maturity' ? 310 : 480} y="36" width={s === 'intro' ? 120 : s === 'growth' ? 150 : s === 'maturity' ? 170 : 145} height="194" fill="var(--accent)" opacity="0.08" style={{ transition: 'all .4s' }} />
        <path d="M40 228 C 110 225, 140 210, 190 160 S 280 62, 370 56 S 470 70, 520 120 S 590 200, 620 208" fill="none" stroke="var(--accent)" strokeWidth="3.5" />
        <path d="M40 229 C 120 229, 150 222, 200 200 S 300 120, 380 110 S 470 140, 520 175 S 590 215, 620 222" fill="none" stroke="var(--muted)" strokeWidth="2" strokeDasharray="6 5" />
        <text x="430" y="150" fontSize="12" fill="var(--muted)">profit</text>
        {(Object.keys(PLC) as (keyof typeof PLC)[]).map((k) => (
          <text key={k} x={PLC[k].x} y="22" textAnchor="middle" fontSize="15" fontWeight="800" fill={k === s ? 'var(--accent)' : 'var(--ink)'} style={{ cursor: 'pointer', fontFamily: 'var(--font-display)' }} onClick={() => setS(k)}>
            {PLC[k].label}
          </text>
        ))}
      </svg>
      <Chips label="Life-cycle stage" value={s} onChange={setS} items={(Object.keys(PLC) as (keyof typeof PLC)[]).map((k) => ({ id: k, label: PLC[k].label }))} />
      <Detail title={d.label}>
        <p><span dangerouslySetInnerHTML={{ __html: d.what }} /></p>
        <p><b>Typical moves:</b> <span dangerouslySetInnerHTML={{ __html: d.moves }} /></p>
        <p><b>Buyer's view:</b> {d.buyer}</p>
      </Detail>
    </div>
  )
}

// ---------------- Business cycle ----------------
const BC = {
  expansion: { label: 'Expansion', html: 'Rising demand; jobs and production grow; businesses expand. <b>Buyers:</b> plan higher sales, add depth, and test new categories.' },
  peak: { label: 'Peak', html: 'The high point before activity turns down. Watch inventory: don\'t overbuy at the top.' },
  contraction: { label: 'Contraction', html: 'Demand falls, unemployment rises, consumers save more, profits drop. <mark>Recession</mark> (about six months) and <mark>depression</mark> (long, severe) happen <i>inside</i> contraction. They are not phases. <b>Buyers:</b> lean into value, private label, and tighter inventory.' },
  trough: { label: 'Trough', html: 'The low point before recovery. Opportunity to gain share with value and good service.' },
} as const
function BusinessCycle() {
  const [s, setS] = useSelect<keyof typeof BC>('contraction')
  const pos = { expansion: [90, 120], peak: [180, 58], contraction: [255, 120], trough: [330, 178] }[s]
  return (
    <div className="grid gap-3">
      <svg viewBox="0 0 640 230" className="block h-auto w-full" role="img" aria-label="Business cycle wave">
        <line x1="30" y1="200" x2="625" y2="200" stroke="var(--muted)" strokeWidth="1.5" />
        <text x="36" y="22" fontSize="12" fill="var(--muted)" className="num">ECONOMIC ACTIVITY</text>
        <path d="M30 160 C 90 150, 120 60, 180 58 S 270 175, 330 178 S 440 50, 500 46 S 590 120, 620 140" fill="none" stroke="var(--accent)" strokeWidth="3.5" />
        <circle cx={pos[0]} cy={pos[1]} r="9" fill="var(--marker)" stroke="var(--ink)" strokeWidth="2" style={{ transition: 'all .45s ease' }} />
        <text x="155" y="40" fontSize="15" fontWeight="800" fill="var(--ink)">Peak</text>
        <text x="300" y="216" fontSize="15" fontWeight="800" fill="var(--ink)">Trough</text>
        <text x="62" y="110" fontSize="13" fill="var(--ink-2)">Expansion ↗</text>
        <text x="228" y="100" fontSize="13" fill="var(--ink-2)">↘ Contraction</text>
      </svg>
      <Chips label="Phase" value={s} onChange={setS} items={(Object.keys(BC) as (keyof typeof BC)[]).map((k) => ({ id: k, label: BC[k].label }))} />
      <Detail title={BC[s].label}><p dangerouslySetInnerHTML={{ __html: BC[s].html }} /></Detail>
    </div>
  )
}

// ---------------- Channels ----------------
const CHANNELS = [
  { id: 'direct', label: 'Direct', steps: ['Producer', 'Consumer'], note: 'No intermediaries: brand websites, factory stores, farmers markets.' },
  { id: 'retail', label: 'Producer → Retailer', steps: ['Producer', 'Retailer', 'Consumer'], note: 'Large retailers buy directly from manufacturers (and often pay slotting allowances for shelf space).' },
  { id: 'wholesale', label: '+ Wholesaler', steps: ['Producer', 'Wholesaler', 'Retailer', 'Consumer'], note: 'Wholesalers break bulk, store, and deliver to many small retailers.' },
  { id: 'agent', label: '+ Agent', steps: ['Producer', 'Agent', 'Wholesaler', 'Retailer', 'Consumer'], note: 'Agents bring buyers and sellers together but never take ownership (title).' },
  { id: 'industrial', label: 'Industrial', steps: ['Producer', 'Industrial user'], note: 'Direct, but for business goods, not consumer goods.' },
] as const
const ROLE: Record<string, string> = {
  Producer: 'Makes the product (form utility).',
  Agent: 'Negotiates sales for a commission; never owns the goods.',
  Wholesaler: 'Buys in bulk, stores, breaks bulk, delivers to retailers.',
  Retailer: 'Sells to final consumers; creates time, place, and possession utility.',
  Consumer: 'The ultimate user. A channel ends here or when the product is changed into something else.',
  'Industrial user': 'A business that uses the product to make other products or run operations.',
}
function Channels() {
  const [c, setC] = useState<string>('wholesale')
  const [role, setRole] = useState<string>('Wholesaler')
  const ch = CHANNELS.find((x) => x.id === c)!
  return (
    <div className="grid gap-3">
      <Chips label="Channel" value={c} onChange={(v) => { setC(v); setRole(CHANNELS.find((x) => x.id === v)!.steps[1]) }} items={CHANNELS.map((x) => ({ id: x.id, label: x.label }))} />
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-paper-2 p-3">
        {ch.steps.map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden className="text-muted">→</span>}
            <button onClick={() => setRole(s)} className={cx('min-h-10 rounded-lg border px-3 text-sm font-bold', role === s ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-card')}>{s}</button>
          </span>
        ))}
      </div>
      <Detail title={role}><p>{ROLE[role]}</p><p className="text-muted">{ch.note}</p></Detail>
      <div className="grid gap-2 sm:grid-cols-2">
        <Card className="text-sm"><b>Vertical conflict:</b> between different levels (a retailer's store brand competing with a manufacturer's national brand).</Card>
        <Card className="text-sm"><b>Horizontal conflict:</b> between members at the same level (two retailers). Root cause of most conflict: <mark>different goals</mark>.</Card>
      </div>
    </div>
  )
}

// ---------------- Promotional mix ----------------
const PROMO = {
  selling: { label: 'Personal selling', paid: 'Paid', personal: 'Personal', html: 'Best for complex or technical products. Most expensive per contact, most persuasive.' },
  advertising: { label: 'Advertising', paid: 'Paid', personal: 'Nonpersonal', html: 'TV, radio, print, digital, social, out-of-home. Reaches many people; the sponsor is identified.' },
  salespromo: { label: 'Sales promotion', paid: 'Paid', personal: 'Nonpersonal', html: 'Short-term incentives: coupons, samples, contests, premiums, displays, loyalty perks.' },
  publicity: { label: 'Publicity / PR', paid: 'Unpaid', personal: 'Nonpersonal', html: 'News coverage, press releases, events, sponsorships. <mark>Least expensive</mark>, very credible, little control.' },
  wom: { label: 'Word of mouth', paid: 'Unpaid', personal: 'Personal', html: 'Powerful and trusted, but the business has <mark>limited control</mark>. Not one of the four mix elements.' },
} as const
function PromoMix() {
  const [s, setS] = useSelect<keyof typeof PROMO>('publicity')
  const cell = (k: keyof typeof PROMO) => (
    <button key={k} onClick={() => setS(k)} className={cx('min-h-16 rounded-xl border p-2 text-sm font-bold', s === k ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-card hover:border-accent')}>
      {PROMO[k].label}
    </button>
  )
  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-[auto_1fr_1fr] gap-2 text-center">
        <span />
        <span className="eyebrow self-end">Personal</span>
        <span className="eyebrow self-end">Nonpersonal</span>
        <span className="eyebrow self-center [writing-mode:vertical-rl] rotate-180">Paid</span>
        {cell('selling')}
        <div className="grid gap-2">{cell('advertising')}{cell('salespromo')}</div>
        <span className="eyebrow self-center [writing-mode:vertical-rl] rotate-180">Unpaid</span>
        {cell('wom')}
        {cell('publicity')}
      </div>
      <Detail title={PROMO[s].label}><p><b>{PROMO[s].paid} · {PROMO[s].personal}.</b> <span dangerouslySetInnerHTML={{ __html: PROMO[s].html }} /></p></Detail>
    </div>
  )
}

// ---------------- Segmentation (sort game) ----------------
const SEG_ITEMS = [
  { t: 'Teens ages 14–17', a: 'Demographic' },
  { t: 'Shoppers in snowy northern states', a: 'Geographic' },
  { t: 'People who value sustainability', a: 'Psychographic' },
  { t: 'Customers who visit 3+ times a month', a: 'Behavioral' },
  { t: 'Households earning under $50,000', a: 'Demographic' },
  { t: 'Gamers who love collecting', a: 'Psychographic' },
  { t: 'Shoppers who buy only on sale', a: 'Behavioral' },
  { t: 'Urban apartment dwellers', a: 'Geographic' },
] as const
const SEG_TYPES = ['Demographic', 'Geographic', 'Psychographic', 'Behavioral'] as const
const SEG_DEF: Record<string, string> = {
  Demographic: 'Measurable characteristics: age, gender, income, education, occupation, family life stage.',
  Geographic: 'Where people live: region, climate, city vs. rural, population density.',
  Psychographic: 'Who people are inside: lifestyles, values, interests, personality, attitudes.',
  Behavioral: 'How people act toward the product: rate of use, benefits sought, loyalty, occasion.',
}
function Segmentation() {
  const [i, setI] = useState(0)
  const [ans, setAns] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const item = SEG_ITEMS[i % SEG_ITEMS.length]
  return (
    <div className="grid gap-3">
      <div className="grid gap-2 sm:grid-cols-2">
        {SEG_TYPES.map((t) => <Card key={t} className="text-sm"><b>{t}:</b> {SEG_DEF[t]}</Card>)}
      </div>
      <Card className="grid gap-3">
        <div className="flex items-center justify-between"><span className="eyebrow">Sort it</span><span className="num text-sm text-muted">{score} right</span></div>
        <p className="text-lg font-bold">"{item.t}"</p>
        <div className="grid grid-cols-2 gap-2">
          {SEG_TYPES.map((t) => (
            <button key={t} disabled={ans !== null} onClick={() => { setAns(t); if (t === item.a) setScore(score + 1) }}
              className={cx('min-h-11 rounded-xl border px-3 text-sm font-bold', ans === null ? 'border-line hover:border-accent' : t === item.a ? 'border-good bg-good-bg' : t === ans ? 'border-bad bg-bad-bg' : 'border-line opacity-60')}>
              {t}
            </button>
          ))}
        </div>
        {ans && (
          <div className="flex items-center justify-between gap-2" role="status">
            <span className={ans === item.a ? 'font-bold text-good' : 'font-bold text-bad'}>{ans === item.a ? 'Correct.' : `It's ${item.a}.`}</span>
            <button className="min-h-10 rounded-xl bg-accent px-4 font-bold text-accent-ink" onClick={() => { setI(i + 1); setAns(null) }}>Next</button>
          </div>
        )}
      </Card>
    </div>
  )
}

// ---------------- Utility ----------------
const UTIL = {
  form: { label: 'Form', html: 'Changing raw materials into something more useful. Lumber becomes a table; a retailer\'s alterations department hems pants.' },
  time: { label: 'Time', html: 'Available <i>when</i> needed. Snow shovels on the shelf before the first storm; a dress that arrives after the dance has none.' },
  place: { label: 'Place', html: 'Available <i>where</i> needed. Umbrellas at the subway exit; BOPIS lockers near home.' },
  possession: { label: 'Possession', html: 'Ownership transfers to the user. Checkout, layaway, and financing (like buy now, pay later) create it.' },
  information: { label: 'Information', html: 'Communication that helps buyers: labels, ads, reviews, salespeople.' },
} as const
function Utility() {
  const [s, setS] = useSelect<keyof typeof UTIL>('time')
  return (
    <div className="grid gap-3">
      <p className="text-sm text-muted">Utility is a product's ability to satisfy wants. To have any utility, a product must <mark>provide satisfaction</mark>.</p>
      <Chips label="Utility type" value={s} onChange={setS} items={(Object.keys(UTIL) as (keyof typeof UTIL)[]).map((k) => ({ id: k, label: UTIL[k].label }))} />
      <Detail title={`${UTIL[s].label} utility`}><p dangerouslySetInnerHTML={{ __html: UTIL[s].html }} /></Detail>
    </div>
  )
}

// ---------------- Research ----------------
const RESEARCH_STEPS = [
  { h: 'Define the problem', p: 'Identify the information needs first. ("Why did teen traffic drop 12%?")' },
  { h: 'Choose a design', p: '<b>Exploratory</b> (quick, cheap, define the issue) · <b>Descriptive</b> (who, what, how many) · <b>Causal</b> (cause and effect, experiments).' },
  { h: 'Pick data sources', p: '<b>Primary</b>: you collect it (surveys, focus groups, observation, experiments). <b>Secondary</b>: already exists (government data, trade publications).' },
  { h: 'Plan the sample', p: 'Who, how many, how chosen. <b>Random</b> sampling reduces bias; convenience and quota samples are faster but more biased.' },
  { h: 'Collect & process', p: 'Edit forms for completeness, code responses, tabulate.' },
  { h: 'Analyze', p: 'Mean (average), median (middle), mode (most frequent), range (high − low).' },
  { h: 'Report & act', p: 'Recommend decisions. Stay objective; never misstate data to promote a product.' },
]
function Research() {
  const [i, setI] = useState(0)
  return (
    <div className="grid gap-3">
      <ol className="grid gap-1.5">
        {RESEARCH_STEPS.map((s, k) => (
          <li key={s.h}>
            <button onClick={() => setI(k)} aria-expanded={i === k} className={cx('flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left', i === k ? 'border-accent bg-accent-soft' : 'border-line bg-card hover:border-accent')}>
              <span className="num grid size-7 shrink-0 place-items-center rounded-lg bg-ink text-sm font-bold text-paper">{k + 1}</span>
              <span className="font-bold">{s.h}</span>
            </button>
            {i === k && <p className="prose-app px-3 py-2 text-[0.95rem] animate-rise" dangerouslySetInnerHTML={{ __html: s.p }} />}
          </li>
        ))}
      </ol>
    </div>
  )
}

// ---------------- Management ----------------
const MGMT = [
  { id: 'top', label: 'Top-level', w: '45%', html: 'The whole company: strategic plans 3–5 years out, mergers and buyouts. (CEO, VP of merchandising)' },
  { id: 'middle', label: 'Middle', w: '68%', html: 'Run divisions and departments; turn strategy into plans. (General merchandise manager, district manager)' },
  { id: 'first', label: 'First-line / supervisors', w: '92%', html: 'Daily work with employees; your first stop for job problems. (Department manager, shift supervisor)' },
]
function Management() {
  const [s, setS] = useState('middle')
  const d = MGMT.find((m) => m.id === s)!
  return (
    <div className="grid gap-3">
      <div className="grid justify-items-center gap-1.5">
        {MGMT.map((m, i) => (
          <button key={m.id} onClick={() => setS(m.id)} style={{ width: m.w }} aria-pressed={s === m.id}
            className={cx('min-h-12 rounded-xl px-3 text-sm font-bold transition-colors', s === m.id ? 'bg-accent text-accent-ink' : i === 0 ? 'bg-ink text-paper' : i === 1 ? 'bg-ink-2 text-paper' : 'bg-line-2 text-ink')}>
            {m.label}
          </button>
        ))}
      </div>
      <Detail title={d.label}><p>{d.html}</p></Detail>
      <p className="text-sm text-muted">Functions at every level: planning, organizing, staffing, leading, and controlling.</p>
    </div>
  )
}

// ---------------- Markdown timing ----------------
function MarkdownTiming() {
  const [plan, setPlan] = useState<'early' | 'late'>('early')
  // Illustrative 12-week season for one style, $40 original price.
  const early = [40, 40, 40, 40, 30, 30, 30, 30, 24, 24, 16, 16]
  const late = [40, 40, 40, 40, 40, 40, 40, 40, 40, 20, 16, 12]
  const prices = plan === 'early' ? early : late
  const W = 600
  const H = 200
  const sx = (i: number) => 40 + (i / 11) * (W - 60)
  const sy = (p: number) => 20 + (1 - p / 45) * (H - 50)
  const path = (arr: number[]) => arr.map((p, i) => `${i ? 'L' : 'M'}${sx(i)},${sy(p)}${i < arr.length - 1 ? ` L${sx(i + 1)},${sy(p)}` : ''}`).join(' ')
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => setPlan('early')} aria-pressed={plan === 'early'} className={cx('min-h-10 rounded-xl border px-3 text-sm font-bold', plan === 'early' ? 'border-good bg-good text-card' : 'border-line')}>Early & gradual</button>
        <button onClick={() => setPlan('late')} aria-pressed={plan === 'late'} className={cx('min-h-10 rounded-xl border px-3 text-sm font-bold', plan === 'late' ? 'border-bad bg-bad text-card' : 'border-line')}>Late & deep</button>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`${plan === 'early' ? 'Early' : 'Late'} markdown price path over a 12-week season`}>
        {[10, 20, 30, 40].map((p) => (
          <g key={p}>
            <line x1="40" x2={W - 20} y1={sy(p)} y2={sy(p)} stroke="var(--line)" />
            <text x="34" y={sy(p) + 4} textAnchor="end" fontSize="11" fill="var(--muted)" className="num">${p}</text>
          </g>
        ))}
        <path d={path(plan === 'early' ? late : early)} fill="none" stroke="var(--line-2)" strokeWidth="2" strokeDasharray="5 5" />
        <path d={path(prices)} fill="none" stroke={plan === 'early' ? 'var(--good)' : 'var(--bad)'} strokeWidth="3.5" style={{ transition: 'd .5s' }} />
        {[0, 3, 7, 11].map((i) => <text key={i} x={sx(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--muted)">wk {i + 1}</text>)}
      </svg>
      <Detail title={plan === 'early' ? 'Early & gradual' : 'Late & deep'}>
        {plan === 'early' ? (
          <p>Smaller cuts (25% → 40% → 60%) start while the item is still in season and shoppers still want it. More units sell at higher prices, so total margin is usually higher and the floor clears for new arrivals.</p>
        ) : (
          <p>Holding full price too long leaves a pile of out-of-season stock, which then needs deep clearance (50–70% off). Fewer units sell at full price, and the leftovers often go to off-price retailers.</p>
        )}
        <p className="text-muted">Illustrative price paths. Real cadences are set by sell-through: review weekly and act when an item falls behind plan.</p>
      </Detail>
    </div>
  )
}

// ---------------- Inventory flow ----------------
const FLOW = [
  { id: 'vendor', label: 'Vendor', html: 'Ships against purchase orders. Lead time, fill rate, and on-time % are scored on a vendor scorecard.' },
  { id: 'dc', label: 'Distribution center', html: 'Receives, checks, and allocates goods to stores; may hold safety stock. RFID speeds receiving.' },
  { id: 'back', label: 'Stockroom', html: 'Backstock waiting to go to the floor. Cycle counts catch errors.' },
  { id: 'floor', label: 'Sales floor', html: 'Merchandise placed by planogram. Out-of-stocks here are lost sales.' },
  { id: 'cust', label: 'Customer', html: 'Sales reduce inventory; returns come back through reverse logistics.' },
]
function InventoryFlow() {
  const [s, setS] = useState('dc')
  const d = FLOW.find((f) => f.id === s)!
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-paper-2 p-3">
        {FLOW.map((f, i) => (
          <span key={f.id} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden className="text-muted">→</span>}
            <button onClick={() => setS(f.id)} aria-pressed={s === f.id} className={cx('min-h-10 rounded-lg border px-3 text-sm font-bold', s === f.id ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-card')}>{f.label}</button>
          </span>
        ))}
      </div>
      <Detail title={d.label}><p>{d.html}</p></Detail>
      <Card className="grid gap-2">
        <div className="eyebrow">The inventory equation (at retail)</div>
        <div className="num flex flex-wrap items-center gap-1.5 text-sm font-bold">
          <span className="rounded-lg bg-info-bg px-2 py-1 text-info">BOM</span>+
          <span className="rounded-lg bg-good-bg px-2 py-1 text-good">Receipts</span>−
          <span className="rounded-lg bg-accent-soft px-2 py-1 text-accent">Sales</span>−
          <span className="rounded-lg bg-bad-bg px-2 py-1 text-bad">Reductions</span>=
          <span className="rounded-lg bg-info-bg px-2 py-1 text-info">EOM</span>
        </div>
        <p className="text-sm text-muted">Rearrange it and you get planned purchases: receipts needed = sales + reductions + EOM − BOM.</p>
        <Link to="/math/otb" className="text-sm font-bold">Open-to-buy calculator →</Link>
      </Card>
    </div>
  )
}

const DIAGRAMS: DiagramDef[] = [
  { id: 'plc', title: 'Product life cycle', blurb: 'Know the pricing and promotion move for each stage. The exam asks it both ways.', render: () => <PlcDiagram /> },
  { id: 'business-cycle', title: 'Business cycle', blurb: 'Four phases. Recession and depression happen inside contraction.', render: () => <BusinessCycle /> },
  { id: 'channels', title: 'Channels of distribution', blurb: 'The path from producer to user. Tap each member to see its role.', render: () => <Channels /> },
  { id: 'promo-mix', title: 'Promotional mix', blurb: 'Two questions sort every element: is it paid, and is it personal?', render: () => <PromoMix /> },
  { id: 'segmentation', title: 'Market segmentation', blurb: 'Four ways to group shoppers. Sort the examples.', render: () => <Segmentation /> },
  { id: 'utility', title: 'Economic utility', blurb: 'Five kinds of value marketing and retailing create.', render: () => <Utility /> },
  { id: 'research', title: 'Marketing research process', blurb: 'From defining the problem to acting on the findings.', render: () => <Research /> },
  { id: 'management', title: 'Levels of management', blurb: 'Who plans what, and for how long.', render: () => <Management /> },
  { id: 'markdown-timing', title: 'Markdown timing', blurb: 'Early, gradual markdowns vs. late, deep ones.', render: () => <MarkdownTiming /> },
  { id: 'inventory-flow', title: 'Inventory flow', blurb: 'How merchandise moves, and the equation behind open-to-buy.', render: () => <InventoryFlow /> },
]

export default function Visual() {
  const { id } = useParams()
  const nav = useNavigate()
  const d = DIAGRAMS.find((x) => x.id === id) ?? DIAGRAMS[0]
  return (
    <>
      <PageHeader eyebrow="Visual guide" title={d.title}>{d.blurb}</PageHeader>
      <label className="mb-3 block md:hidden">
        <span className="sr-only">Choose a diagram</span>
        <select className="min-h-11 w-full rounded-xl border border-line-2 bg-card px-3" value={d.id} onChange={(e) => nav(`/learn/visual/${e.target.value}`, { replace: true })}>
          {DIAGRAMS.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}
        </select>
      </label>
      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <nav className="hidden content-start gap-1 md:grid" aria-label="Diagrams">
          {DIAGRAMS.map((x) => (
            <Link key={x.id} to={`/learn/visual/${x.id}`} replace aria-current={x.id === d.id ? 'page' : undefined}
              className={cx('rounded-xl px-3 py-2 text-sm font-bold no-underline', x.id === d.id ? 'bg-ink text-paper' : 'text-ink-2 hover:bg-paper-2')}>
              {x.title}
            </Link>
          ))}
        </nav>
        <Card key={d.id} className="min-w-0 animate-rise">{d.render()}</Card>
      </div>
    </>
  )
}
