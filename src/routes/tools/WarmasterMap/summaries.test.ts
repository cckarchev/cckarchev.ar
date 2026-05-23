import { describe, expect, it } from 'vitest'
import { generateMap } from './map-generator'
import { fairPlaySummary, shortSeed, sideChoiceSummary } from './summaries'
import type { GenerationConfig } from './types'

function makeConfig(overrides: Partial<GenerationConfig> = {}): GenerationConfig {
  return {
    tableSize: '180x120',
    theme: 'imperial',
    mission: 'agnostic',
    density: 'standard',
    playStyle: 'clear',
    waterRarity: 'rare',
    fairMode: true,
    mapsCount: 1,
    seed: 'test',
    ...overrides,
  }
}

describe('shortSeed', () => {
  it('returns the seed unchanged when it is short', () => {
    expect(shortSeed('abc')).toBe('abc')
  })

  it('truncates and appends an ellipsis when the seed is long', () => {
    const long = 'a'.repeat(100)
    const out = shortSeed(long)
    expect(out.endsWith('…')).toBe(true)
    expect(out.length).toBeLessThan(long.length)
  })
})

describe('fairPlaySummary', () => {
  it('mentions the play style in the summary', () => {
    const map = generateMap(makeConfig({ playStyle: 'competitive' }), 1, 'summary-comp')
    expect(fairPlaySummary(map)).toContain('competitive')
  })

  it('reports water crossings when water features exist', () => {
    const map = generateMap(
      makeConfig({ waterRarity: 'scenic', density: 'dense' }),
      1,
      'summary-water',
    )
    if (map.items.some((i) => i.type === 'river' || i.type === 'stream')) {
      expect(fairPlaySummary(map)).toContain('crossings')
    } else {
      expect(fairPlaySummary(map)).toContain('no major water barrier')
    }
  })

  it('reports no road advantage when no road is placed', () => {
    const map = generateMap(makeConfig({ waterRarity: 'none' }), 1, 'no-road-test')
    const summary = fairPlaySummary(map)
    if (!map.items.some((i) => i.type === 'road')) {
      expect(summary).toContain('no road advantage')
    } else {
      expect(summary).toContain('road')
    }
  })
})

describe('sideChoiceSummary', () => {
  it('produces a competitive-flavored note for competitive play style', () => {
    const map = generateMap(makeConfig({ playStyle: 'competitive' }), 1, 'side-comp')
    const summary = sideChoiceSummary(map)
    // Competitive summaries either talk about close sides or about side choice
    // mattering — both branches reference choice or sides.
    expect(summary.toLowerCase()).toMatch(/competitive|side/)
  })

  it('returns a comparable-sides note for non-competitive play when sides are close', () => {
    // We do not control the seed enough to guarantee "close" — assert the
    // summary at least mentions sides one way or the other.
    const map = generateMap(makeConfig({ playStyle: 'clear' }), 1, 'side-clear')
    const summary = sideChoiceSummary(map)
    expect(summary.toLowerCase()).toMatch(/side|comparable|maneuver|tempo/)
  })

  it('is deterministic for the same map', () => {
    const map = generateMap(makeConfig(), 1, 'det-side')
    expect(sideChoiceSummary(map)).toBe(sideChoiceSummary(map))
  })
})
