/** Small seeded PRNG (mulberry32) so generated problems and shuffles are reproducible in tests. */
export function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 31)
}

export function shuffle<T>(arr: readonly T[], r: () => number = Math.random): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function pick<T>(arr: readonly T[], r: () => number = Math.random): T {
  return arr[Math.floor(r() * arr.length)]
}

/** Integer in [min, max]. */
export function int(min: number, max: number, r: () => number = Math.random): number {
  return min + Math.floor(r() * (max - min + 1))
}

/** Random multiple of `step` in [min, max]. */
export function step(min: number, max: number, stepSize: number, r: () => number = Math.random): number {
  const n = Math.floor((max - min) / stepSize)
  return min + int(0, n, r) * stepSize
}
