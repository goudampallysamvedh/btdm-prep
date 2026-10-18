/**
 * The study helper's "brain": no AI and no server. It searches the app's own content
 * (study guide, PI guide, flashcards, lessons, math tools, diagrams, trends, BTDM rules),
 * then builds a short answer from blocks the panel knows how to draw: text, a flip card,
 * a diagram, a calculator, a mini quiz, a chart, and links to the full page.
 */
import type { AreaCode, LeitnerState, TestRecord } from '@/types'
import { AREAS, AREA_BY_CODE } from '@/data/areas'
import { TOPICS, TOPIC_BY_ID } from '@/data/topics'
import { FLASHCARDS } from '@/data/flashcards'
import { PI_GUIDE } from '@/data/piNotes'
import { LESSONS } from '@/data/lessons'
import { TRENDS } from '@/data/trends'
import { QUESTIONS } from '@/data/questions'
import { FORMAT, PRESENTATION_FLOW, RUBRIC_POINTS } from '@/data/playbook'
import { TOOLS } from '@/pages/math/tools'
import { areaReadiness, cardEvidence, questionEvidence, topicStatuses, type TopicStatus } from './mastery'
import { shuffle } from './random'

// ---------- Answer blocks ----------

export interface HelperLink {
  to: string
  label: string
}

export type Block =
  | { kind: 'text'; html: string; title?: string }
  | { kind: 'card'; front: string; back: string; extra?: string }
  | { kind: 'cards'; ids: string[] }
  | { kind: 'diagram'; id: string }
  | { kind: 'calc'; toolId: string }
  | { kind: 'quiz'; qids: string[] }
  | { kind: 'areas'; areas: AreaCode[] }
  | { kind: 'blueprint' }
  | { kind: 'topics'; items: { id: string; status: TopicStatus }[] }
  | { kind: 'links'; topicId?: string; links: HelperLink[] }
  | { kind: 'chips'; items: string[] }

export interface HelperContext {
  tests: TestRecord[]
  leitner: Record<string, LeitnerState>
}

// ---------- Search index ----------

type DocKind = 'term' | 'card' | 'pi' | 'lesson' | 'tool' | 'diagram' | 'trend' | 'rule'

interface Doc {
  kind: DocKind
  id: string
  title: string
  html: string
  topicId?: string
  area?: AreaCode
  link?: HelperLink
  diagram?: string
  tool?: string
  extra?: string
  t: Map<string, number>
  b: Map<string, number>
}

/** Diagram ids and titles (the drawings themselves live on the diagrams page). */
export const DIAGRAM_TITLES: Record<string, [string, string]> = {
  plc: ['Product life cycle', 'Introduction, growth, maturity, decline: each stage calls for a different price and promotion move.'],
  'business-cycle': ['Business cycle', 'Expansion, peak, contraction, trough. Recession and depression happen inside contraction.'],
  channels: ['Channels of distribution', 'The path a product takes from producer to user, and what each middle step does.'],
  'promo-mix': ['Promotional mix', 'Advertising, sales promotion, personal selling, and publicity, sorted by paid vs. unpaid and personal vs. nonpersonal.'],
  segmentation: ['Market segmentation', 'Four ways to group shoppers: demographic, geographic, psychographic, and behavioral.'],
  utility: ['Economic utility', 'Five kinds of value marketing creates: form, place, time, possession, and information.'],
  research: ['Marketing research process', 'From defining the problem to acting on the findings.'],
  management: ['Levels of management', 'Top, middle, and first-line managers: who plans what, and for how long.'],
  'markdown-timing': ['Markdown timing', 'Early, gradual markdowns usually cost less margin than late, deep ones.'],
  'inventory-flow': ['Inventory flow', 'How merchandise moves from vendor to customer, and the equation behind open-to-buy.'],
}

const STOP = new Set(
  'a an the is are was were be been of to in on for and or but with what whats how why when who which that this these those it its do does did can could should would i me my we our you your about explain tell define definition mean means meaning give show help please vs versus difference between like some any one more most get have has am at by from into than then so if not no yes ok okay just really also long much know today tomorrow now'.split(' '),
)

const SYNONYMS: Record<string, string> = {
  otb: 'open to buy',
  plc: 'product life cycle',
  mmu: 'maintained markup',
  imu: 'initial markup',
  gmroi: 'gross margin return inventory',
  bopis: 'buy online pick up store',
  roi: 'return investment',
  kpi: 'key performance indicator',
  kpis: 'key performance indicator',
  pi: 'performance indicator',
  pis: 'performance indicator',
  swot: 'strengths weaknesses opportunities threats',
  sku: 'stock keeping unit sku',
}

function stem(w: string): string {
  if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3)
  if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y'
  if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2)
  if (w.length > 4 && w.endsWith('es') && /(s|x|ch|sh)es$/.test(w)) return w.slice(0, -2)
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1)
  return w
}

export function tokens(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/[^a-z0-9%$\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter(Boolean)
  const out: string[] = []
  for (const w of words) {
    const expanded = SYNONYMS[w]
    for (const x of expanded ? expanded.split(' ') : [w]) if (!STOP.has(x) && x.length > 1) out.push(stem(x))
  }
  return out
}

const counts = (ws: string[]) => {
  const m = new Map<string, number>()
  for (const w of ws) m.set(w, (m.get(w) ?? 0) + 1)
  return m
}

const strip = (html: string) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()

let INDEX: { docs: Doc[]; idf: Map<string, number> } | null = null

function doc(d: Omit<Doc, 't' | 'b'>): Doc {
  return { ...d, t: counts(tokens(d.title)), b: counts(tokens(d.html + ' ' + (d.extra ?? ''))) }
}

function visualFor(topicId?: string): string | undefined {
  return topicId ? TOPIC_BY_ID[topicId]?.links?.find((l) => l.kind === 'visual')?.id : undefined
}
function toolFor(topicId?: string): string | undefined {
  return topicId ? TOPIC_BY_ID[topicId]?.links?.find((l) => l.kind === 'math')?.id : undefined
}

function buildIndex() {
  const docs: Doc[] = []
  for (const a of AREAS)
    for (const t of a.terms)
      docs.push(doc({ kind: 'term', id: t.id, title: t.term.replace(/\s*\(NEW\)$/, ''), html: t.html, topicId: t.id, area: a.code, diagram: visualFor(t.id), tool: toolFor(t.id), link: { to: `/learn/guide/${a.code}#${encodeURIComponent(t.id)}`, label: `${a.name} study guide` } }))
  for (const c of FLASHCARDS) {
    if (c.deck === 'pi') continue
    docs.push(doc({ kind: 'card', id: c.id, title: c.front, html: c.back, topicId: c.topic, area: c.area, diagram: visualFor(c.topic), tool: toolFor(c.topic) }))
  }
  for (const p of PI_GUIDE)
    docs.push(doc({ kind: 'pi', id: p.code, title: `${p.code} ${p.text}`, html: p.plain, extra: p.inCaseLine, area: p.code.slice(0, 2) as AreaCode, topicId: `${p.code.slice(0, 2)}.pi`, link: { to: `/learn/pis?q=${encodeURIComponent(p.code)}`, label: 'Open in the PI guide' } }))
  for (const l of LESSONS)
    docs.push(doc({ kind: 'lesson', id: l.id, title: l.title, html: `${l.hook} ${l.sections.map((s) => `${s.h}. ${strip(s.html)}`).join(' ')}`, topicId: l.topic, diagram: l.visual, tool: l.mathTool, link: { to: `/learn/lessons/${l.id}`, label: `Lesson: ${l.title}` } }))
  for (const t of TOOLS)
    docs.push(doc({ kind: 'tool', id: t.id, title: t.title, html: `${t.blurb}<ul>${t.formulas.map((f) => `<li><b>${f.name}</b> = ${f.f}</li>`).join('')}</ul>`, tool: t.id, link: { to: `/math/${t.id}`, label: `${t.title} calculator` } }))
  for (const [id, [title, blurb]] of Object.entries(DIAGRAM_TITLES)) docs.push(doc({ kind: 'diagram', id, title, html: `${blurb} Tap the parts of the diagram to explore.`, diagram: id, link: { to: `/learn/visual/${id}`, label: `Diagram: ${title}` } }))
  for (const t of TRENDS) docs.push(doc({ kind: 'trend', id: t.id, title: t.title, html: `${t.kicker} ${t.what}`, extra: t.sayIt, link: { to: `/learn/trends/${t.id}`, label: `Trend: ${t.title}` } }))
  for (const f of FORMAT) docs.push(doc({ kind: 'rule', id: `fmt-${f.k}`, title: `BTDM ${f.k}`, html: f.v, link: { to: '/learn/playbook', label: 'How BTDM works' } }))
  for (const f of PRESENTATION_FLOW) docs.push(doc({ kind: 'rule', id: `flow-${f.k}`, title: `Presentation ${f.k}`, html: f.v, link: { to: '/learn/playbook', label: 'How BTDM works' } }))
  docs.push(
    doc({
      kind: 'rule',
      id: 'btdm',
      title: 'What is BTDM (Buying and Merchandising Team Decision Making)',
      html: `A DECA team event for two partners. Each takes the 100-question Marketing Cluster Exam (scores are averaged), then you get <mark>30 minutes</mark> to prepare a case together and up to <mark>15 minutes</mark> with the judge. Each case has <mark>5 PIs</mark>; each PI is worth ${RUBRIC_POINTS.pi.max} points. The presentation counts twice the averaged exam score.`,
      link: { to: '/learn/playbook', label: 'How BTDM works' },
    }),
  )

  const df = new Map<string, number>()
  for (const d of docs) for (const w of new Set([...d.t.keys(), ...d.b.keys()])) df.set(w, (df.get(w) ?? 0) + 1)
  const idf = new Map<string, number>()
  for (const [w, n] of df) idf.set(w, Math.log(1 + docs.length / n))
  INDEX = { docs, idf }
  return INDEX
}

const KIND_WEIGHT: Record<DocKind, number> = { term: 1.15, card: 1.1, lesson: 1.05, tool: 1.1, diagram: 1, trend: 0.95, rule: 1.05, pi: 0.9 }

export interface Hit {
  doc: Doc
  score: number
  coverage: number
}

export function search(query: string, limit = 6): Hit[] {
  const { docs, idf } = INDEX ?? buildIndex()
  const q = [...new Set(tokens(query))]
  if (!q.length) return []
  const phrase = q.join(' ')
  const hits: Hit[] = []
  for (const d of docs) {
    let s = 0
    let matched = 0
    for (const w of q) {
      const inT = d.t.get(w) ?? 0
      const inB = d.b.get(w) ?? 0
      if (inT || inB) matched++
      s += (idf.get(w) ?? 0) * (3 * Math.min(inT, 2) + Math.min(inB, 3))
    }
    if (!matched) continue
    const title = [...d.t.keys()].join(' ')
    if (q.length > 1 && title.includes(phrase)) s += 8
    if (title === phrase) s += 12
    hits.push({ doc: d, score: s * KIND_WEIGHT[d.kind], coverage: matched / q.length })
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit)
}

// ---------- Intents ----------

const PI_CODE = /\b([a-z]{2})\s*[:-]?\s*(\d{3})\b/i
const AREA_WORDS = AREAS.map((a) => ({ code: a.code, words: tokens(a.name) }))

function statusesFor(ctx: HelperContext) {
  return topicStatuses([...questionEvidence(ctx.tests), ...cardEvidence(ctx.leitner)].sort((a, b) => a.at - b.at))
}

function quizFor(topicId?: string, area?: AreaCode, n = 3): string[] {
  const pool = QUESTIONS.filter((q) => (topicId && !topicId.endsWith('.pi') ? q.topic === topicId : area ? q.area === area : false))
  const fallback = area ? QUESTIONS.filter((q) => q.area === area) : []
  return shuffle(pool.length >= 2 ? pool : fallback).slice(0, n).map((q) => q.id)
}

const shortTitle = (d: Doc) => (d.kind === 'pi' ? d.id : d.title.replace(/\s*\(.*?\)\s*/g, ' ').trim())

export const STARTERS = ['What should I study?', 'Quiz me on markup', 'Explain open-to-buy', 'Help with my flashcards', 'How is BTDM scored?']

/** Clearly not DECA: answer with the off-topic note even if a word happens to match. */
const OFF_WORDS = /\b(weather|joke|song|lyrics|movie|game|games|poem|recipe|essay|homework|girlfriend|boyfriend|video game|fortnite|minecraft|nba|nfl|football score|horoscope)\b/

const OFF_TOPIC = 'I can only help with DECA and BTDM: exam topics, PIs, retail math, flashcards, and the case. Try one of these:'

/** Build the helper's reply to one message. */
export function answer(input: string, ctx: HelperContext): Block[] {
  const text = input.trim()
  const low = text.toLowerCase()
  if (!text) return [{ kind: 'chips', items: STARTERS }]

  if (/^(hi|hey|hello|yo|sup)\b|^(help|what can you do|how do (i|you) use (this|you))\??$/.test(low)) {
    return [
      { kind: 'text', html: 'Hi! I explain DECA and BTDM topics using what\'s in this app, with diagrams, calculators, quick quizzes, and links to the full lesson. I can\'t help during a timed exam. Ask me about a term, a PI (like <b>PM:003</b>), or a formula.' },
      { kind: 'chips', items: STARTERS },
    ]
  }

  // A pasted test question: explain the topic, never pick the answer.
  const looksLikeTest = (low.match(/(^|\s)\(?[a-d][).:]\s/g) ?? []).length >= 3 || /which of the following/.test(low)
  const pre: Block[] = looksLikeTest
    ? [{ kind: 'text', html: 'I won\'t pick answers to test questions, but here\'s the idea the question is about so you can work it out:' }]
    : []
  const query = looksLikeTest ? text.replace(/(^|\s)\(?[a-d][).:]\s[^\n]*/gi, ' ') : text

  if (/(what|which).*(study|work on|focus)|weak(est)?|struggl|trouble with|need to learn|where (should|do) i start/.test(low)) return studyPlan(ctx)
  if (/flash ?cards?|cards? i (miss|don)|still learning|my cards/.test(low)) return flashcardHelp(ctx)
  if (/how many questions|blueprint|exam (format|layout|breakdown)|which areas (are|matter)|weight(ed|s)? of/.test(low)) return blueprint()

  const wantsQuiz = /\b(quiz|test me|practice|drill)\b/.test(low)
  const cleaned = wantsQuiz ? query.replace(/\b(quiz|test|me|on|practice|drill|questions?|about)\b/gi, ' ') : query

  // A PI code goes straight to that PI.
  const code = cleaned.match(PI_CODE)
  if (code) {
    const pi = PI_GUIDE.find((p) => p.code === `${code[1].toUpperCase()}:${code[2]}`)
    if (pi) {
      const area = pi.code.slice(0, 2) as AreaCode
      const blocks: Block[] = [
        ...pre,
        { kind: 'text', title: `${pi.code} · ${pi.text}`, html: `${pi.plain}${pi.inCaseLine ? `<br><i>In a case:</i> ${pi.inCaseLine}` : ''}` },
      ]
      const qs = QUESTIONS.filter((q) => q.pi === pi.code).map((q) => q.id)
      if (wantsQuiz && qs.length) blocks.push({ kind: 'quiz', qids: shuffle(qs).slice(0, 3) })
      blocks.push({ kind: 'links', links: [{ to: `/learn/pis?q=${encodeURIComponent(pi.code)}`, label: 'Open in the PI guide' }, { to: `/cards?deck=pi&area=${area}`, label: `${AREA_BY_CODE[area].name} PI flashcards` }] })
      blocks.push({ kind: 'chips', items: [qs.length ? `Quiz me on ${pi.code}` : `Quiz me on ${AREA_BY_CODE[area].name}`, 'What should I study?'] })
      return blocks
    }
  }

  // An exam area by name ("promotion", "channel management").
  const qTokens = tokens(cleaned)
  const area = AREA_WORDS.find((a) => a.words.length && a.words.every((w) => qTokens.includes(w)) && qTokens.length <= a.words.length + 1)
  if (area && wantsQuiz) {
    return [{ kind: 'text', html: `Three quick ${AREA_BY_CODE[area.code].name} questions. Tap an answer to check it.` }, { kind: 'quiz', qids: quizFor(undefined, area.code) }, { kind: 'areas', areas: [area.code] }, { kind: 'links', links: [{ to: `/exam/practice?mode=area&area=${area.code}&count=10`, label: `10 more ${AREA_BY_CODE[area.code].name} questions` }, { to: `/learn/guide/${area.code}`, label: 'Study guide' }] }]
  }

  const hits = search(cleaned)
  const top = hits[0]
  // Words the app has never heard of ("france", "gatsby") mean the question is probably off-topic.
  const unknown = qTokens.filter((w) => !(INDEX ?? buildIndex()).idf.has(w)).length
  if (!top || top.score < 4 || top.coverage < 0.5 || (unknown > 0 && top.score < 10) || OFF_WORDS.test(low)) {
    if (area) return areaOverview(area.code)
    return [...pre, { kind: 'text', html: OFF_TOPIC }, { kind: 'chips', items: STARTERS }]
  }

  const d = top.doc
  const blocks: Block[] = [...pre]
  if (wantsQuiz) {
    const qids = quizFor(d.topicId, d.area)
    if (qids.length) {
      blocks.push({ kind: 'text', html: `Quick quiz on <b>${shortTitle(d)}</b>. Tap an answer to check it.` }, { kind: 'quiz', qids })
      blocks.push({ kind: 'links', topicId: d.topicId, links: d.link ? [d.link] : [] })
      return blocks
    }
  }

  if (d.kind === 'card') blocks.push({ kind: 'card', front: d.title, back: d.html })
  else blocks.push({ kind: 'text', title: d.kind === 'pi' ? d.title.replace(/^(\w\w:\d{3}) /, '$1 · ') : d.title, html: d.kind === 'lesson' ? LESSONS.find((l) => l.id === d.id)!.hook : d.kind === 'pi' && d.extra ? `${d.html}<br><i>In a case:</i> ${d.extra}` : d.kind === 'trend' && d.extra ? `${d.html}<br><i>Say it in a case:</i> ${d.extra}` : d.html })

  // One interactive extra: a calculator for formulas, otherwise a diagram.
  if (d.tool) blocks.push({ kind: 'calc', toolId: d.tool })
  else if (d.diagram) blocks.push({ kind: 'diagram', id: d.diagram })

  // Related cards from the same topic make a compact second explanation.
  const related = hits.slice(1).filter((h) => h.score >= top.score * 0.45 && h.doc.title !== d.title && h.doc.kind !== 'pi').slice(0, 2)
  if (d.area) blocks.push({ kind: 'areas', areas: [d.area] })
  blocks.push({ kind: 'links', topicId: d.topicId && !d.topicId.endsWith('.pi') ? d.topicId : undefined, links: d.link ? [d.link] : [] })
  const qOk = quizFor(d.topicId, d.area).length > 0
  blocks.push({ kind: 'chips', items: [...(qOk ? [`Quiz me on ${shortTitle(d)}`] : []), ...related.map((h) => `Explain ${shortTitle(h.doc)}`)] })
  return blocks
}

function studyPlan(ctx: HelperContext): Block[] {
  const st = statusesFor(ctx)
  const weight = (a: AreaCode) => AREA_BY_CODE[a].weight
  const study = TOPICS.filter((t) => !t.hidden && !t.id.startsWith('T.'))
  const pick = (s: TopicStatus) => study.filter((t) => st[t.id] === s).sort((a, b) => weight(b.area) - weight(a.area))
  const items = [...pick('need'), ...pick('shaky')].slice(0, 4).map((t) => ({ id: t.id, status: st[t.id] }))
  const focus = [...areaReadiness(ctx.tests)].sort((a, b) => b.priority - a.priority).slice(0, 3).map((a) => a.area)
  if (!items.length) {
    const unseen = pick('unseen').slice(0, 4).map((t) => ({ id: t.id, status: 'unseen' as const }))
    return [
      { kind: 'text', html: 'You haven\'t missed enough yet for me to spot weak topics, so start with the exam areas that have the most questions:' },
      { kind: 'areas', areas: focus },
      { kind: 'topics', items: unseen },
      { kind: 'chips', items: [`Quiz me on ${AREA_BY_CODE[focus[0]].name}`, 'How many questions per area?'] },
    ]
  }
  return [
    { kind: 'text', html: 'Here\'s what to work on, based on your practice answers and flashcards. Heavier exam areas come first.' },
    { kind: 'topics', items },
    { kind: 'areas', areas: focus },
    { kind: 'chips', items: [`Quiz me on ${TOPIC_BY_ID[items[0].id].name}`, 'Help with my flashcards'] },
  ]
}

function flashcardHelp(ctx: HelperContext): Block[] {
  const learning = Object.entries(ctx.leitner)
    .filter(([id, s]) => s.last && s.box <= 2 && FLASHCARDS.some((c) => c.id === id))
    .sort((a, b) => (b[1].lapses - a[1].lapses) || ((b[1].last ?? 0) - (a[1].last ?? 0)))
    .slice(0, 5)
    .map(([id]) => id)
  if (!learning.length) {
    return [
      { kind: 'text', html: 'No cards are marked "still learning" yet. Review today\'s cards first, then come back and I\'ll go over the tricky ones.' },
      { kind: 'links', links: [{ to: '/cards?daily=1', label: 'Review today\'s flashcards' }] },
    ]
  }
  return [
    { kind: 'text', html: `These are the ${learning.length} cards you're still learning. Tap a card to flip it, then say the answer out loud before you look.` },
    { kind: 'cards', ids: learning },
    { kind: 'links', links: [{ to: '/cards', label: 'Study all flashcards' }] },
    { kind: 'chips', items: ['What should I study?'] },
  ]
}

function blueprint(): Block[] {
  return [
    { kind: 'text', html: 'The Marketing Cluster Exam has <b>100 questions</b>. Product/Service Management and Marketing-Information Management have the most (11 each), so they matter most.' },
    { kind: 'blueprint' },
    { kind: 'links', links: [{ to: '/learn/guide', label: 'Exam study guide' }, { to: '/exam', label: 'Practice questions' }] },
  ]
}

function areaOverview(code: AreaCode): Block[] {
  const a = AREA_BY_CODE[code]
  return [
    { kind: 'text', title: a.name, html: `${a.weight} of the 100 exam questions. Main topics: ${a.terms.slice(0, 6).map((t) => t.term.replace(/\s*\(NEW\)$/, '')).join(', ')}.` },
    { kind: 'areas', areas: [code] },
    { kind: 'links', links: [{ to: `/learn/guide/${code}`, label: `${a.name} study guide` }, { to: `/exam/practice?mode=area&area=${code}&count=10`, label: 'Practice 10 questions' }] },
    { kind: 'chips', items: [`Quiz me on ${a.name}`] },
  ]
}
