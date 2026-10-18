import { describe, expect, it } from 'vitest'
import { answer, search, type Block } from './helper'

const ctx = { tests: [], leitner: {} }
const kinds = (b: Block[]) => b.map((x) => x.kind)
const firstText = (b: Block[]) => {
  const t = b.find((x) => x.kind === 'text' || x.kind === 'card')
  return t?.kind === 'text' ? `${t.title ?? ''} ${t.html}` : t?.kind === 'card' ? `${t.front} ${t.back}` : ''
}

describe('study helper search', () => {
  it.each([
    ['what is open to buy', /open-to-buy|otb/i],
    ['explain a planogram', /planogram/i],
    ['product life cycle', /life cycle/i],
    ['what does sell-through mean', /sell-through/i],
    ['how do I calculate markup on retail', /markup/i],
    ['primary vs secondary data', /primary/i],
    ['what is a SWOT analysis', /swot|strength/i],
    ['can I use a calculator in BTDM', /calculator/i],
    ['how long is prep time', /30 minutes|prep/i],
    ['what is risk transfer', /transfer/i],
    ['whats a loss leader', /loss leader/i],
    ['keystone pricing', /keystone/i],
    ['stock to sales ratio', /stock-to-sales/i],
    ['brand promise', /brand promise/i],
    ['what is bopis', /pick up/i],
    ['active listening', /listen/i],
    ['GMROI', /gross margin/i],
  ])('"%s" finds the right topic', (q, re) => {
    const b = answer(q, ctx)
    expect(firstText(b)).toMatch(re)
  })

  it('goes straight to a PI by its code', () => {
    const b = answer('explain pm 003', ctx)
    expect(firstText(b)).toMatch(/PM:003/)
  })

  it('declines anything that is not DECA or BTDM', () => {
    for (const q of ['who won the super bowl', 'help me write my english essay about the great gatsby', 'what is the capital of france', 'solve 2x + 3 = 11', 'whats the weather today', 'tell me a joke', 'who is taylor swift', 'play a game with me']) {
      const b = answer(q, ctx)
      expect(firstText(b), q).toMatch(/only help with DECA and BTDM/)
    }
  })

  it('makes quizzes, study plans, flashcard help, and the blueprint chart', () => {
    expect(kinds(answer('quiz me on markup', ctx))).toContain('quiz')
    expect(kinds(answer('quiz me on promotion', ctx))).toContain('quiz')
    expect(kinds(answer('what should I study?', ctx))).toContain('areas')
    expect(kinds(answer('help with my flashcards', ctx))).toContain('links')
    expect(kinds(answer('how many questions are on the exam', ctx))).toContain('blueprint')
  })

  it('adds a calculator for formulas and a diagram for visual topics', () => {
    expect(kinds(answer('markup on cost', ctx))).toContain('calc')
    expect(kinds(answer('promotional mix', ctx))).toContain('diagram')
  })

  it('never picks the answer to a pasted test question', () => {
    const b = answer('Which of the following is an example of publicity? A. a TV ad B. a news story C. a coupon D. a sales call', ctx)
    expect(firstText(b)).toMatch(/won't pick answers/)
  })

  it('search returns ranked hits', () => {
    expect(search('markdown').length).toBeGreaterThan(0)
  })
})
