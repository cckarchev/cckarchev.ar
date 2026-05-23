import { describe, expect, it } from 'vitest'
import { choice, randBetween, rngFromSeed } from './prng'

describe('rngFromSeed', () => {
  it('produces an identical sequence for the same seed', () => {
    const a = rngFromSeed('hello')
    const b = rngFromSeed('hello')
    for (let i = 0; i < 10; i++) expect(a()).toBe(b())
  })

  it('produces a different sequence for a different seed', () => {
    const a = rngFromSeed('hello')
    const b = rngFromSeed('hellp')
    // It is theoretically possible for the very first value to collide, but the
    // mulberry32 + xmur3 combination has not done so for any short string we
    // care about — checking the first value is enough to catch a broken impl.
    expect(a()).not.toBe(b())
  })

  it('outputs values in the [0, 1) range', () => {
    const rng = rngFromSeed('range-check')
    for (let i = 0; i < 100; i++) {
      const n = rng()
      expect(n).toBeGreaterThanOrEqual(0)
      expect(n).toBeLessThan(1)
    }
  })
})

describe('randBetween', () => {
  it('returns values within [min, max)', () => {
    const rng = rngFromSeed('between')
    for (let i = 0; i < 100; i++) {
      const n = randBetween(rng, 5, 10)
      expect(n).toBeGreaterThanOrEqual(5)
      expect(n).toBeLessThan(10)
    }
  })
})

describe('choice', () => {
  it('returns an element from the array', () => {
    const rng = rngFromSeed('choice')
    const items = ['a', 'b', 'c', 'd']
    for (let i = 0; i < 50; i++) {
      expect(items).toContain(choice(rng, items))
    }
  })

  it('eventually returns every element of the array', () => {
    const rng = rngFromSeed('coverage')
    const items = ['a', 'b', 'c', 'd', 'e']
    const seen = new Set<string>()
    for (let i = 0; i < 500 && seen.size < items.length; i++) {
      seen.add(choice(rng, items))
    }
    expect(seen.size).toBe(items.length)
  })
})
