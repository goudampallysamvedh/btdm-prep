import { create } from 'zustand'
import type { Block } from './helper'

export type NewHelperMsg = { role: 'user'; text: string } | { role: 'bot'; blocks: Block[] }
export type HelperMsg = NewHelperMsg & { id: number }

/** Open/closed state and the conversation for the study helper (kept for this visit only). */
export const useHelperUi = create<{
  open: boolean
  messages: HelperMsg[]
  setOpen: (open: boolean) => void
  push: (m: NewHelperMsg) => void
  clear: () => void
}>()((set) => ({
  open: false,
  messages: [],
  setOpen: (open) => set({ open }),
  push: (m) => set((s) => ({ messages: [...s.messages, { ...m, id: (s.messages[s.messages.length - 1]?.id ?? 0) + 1 }] })),
  clear: () => set({ messages: [] }),
}))

/** No helper while answering exam or practice questions. */
export function helperBlocked(pathname: string): boolean {
  return /^\/exam\/(mock|practice)/.test(pathname)
}
