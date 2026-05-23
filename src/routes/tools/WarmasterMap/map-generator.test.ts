import { describe, expect, it } from 'vitest'
import { generateMap } from './map-generator'
import type { GenerationConfig, MissionKey } from './types'

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
    seed: 'test-seed',
    ...overrides,
  }
}

// Summarize a map down to its stable shape (counts and labels), avoiding
// position floats that would make snapshot tests fragile across refactors.
function summarize(map: ReturnType<typeof generateMap>) {
  const typeCounts: Record<string, number> = {}
  for (const item of map.items) typeCounts[item.type] = (typeCounts[item.type] ?? 0) + 1
  return {
    seed: map.seed,
    table: map.table,
    dep: map.dep,
    typeCounts,
    objectiveLabels: map.objectives.map((o) => o.label).sort(),
  }
}

describe('generateMap', () => {
  it('is deterministic: same config + seed → identical output', () => {
    const a = generateMap(makeConfig(), 1, 'fixed-seed')
    const b = generateMap(makeConfig(), 1, 'fixed-seed')
    expect(summarize(a)).toEqual(summarize(b))
  })

  it('produces different output for different seeds', () => {
    const a = generateMap(makeConfig(), 1, 'seed-A')
    const b = generateMap(makeConfig(), 1, 'seed-B')
    expect(summarize(a)).not.toEqual(summarize(b))
  })

  it('produces different output for the same seed but different config knobs', () => {
    const baseSeed = 'shared-seed'
    const a = generateMap(makeConfig({ playStyle: 'clear' }), 1, baseSeed)
    const b = generateMap(makeConfig({ playStyle: 'narrative' }), 1, baseSeed)
    expect(summarize(a)).not.toEqual(summarize(b))
  })

  it('produces different output for different map indexes with the same baseSeed', () => {
    const a = generateMap(makeConfig(), 1, 'base')
    const b = generateMap(makeConfig(), 2, 'base')
    expect(a.seed).not.toBe(b.seed)
  })

  it('places exactly one tower at the center for the tower mission', () => {
    const map = generateMap(makeConfig({ mission: 'tower' }), 1, 'tower-test')
    const towers = map.items.filter((i) => i.type === 'tower')
    expect(towers).toHaveLength(1)
    const t = towers[0]!
    expect(t.x + t.w / 2).toBeCloseTo(map.table.w / 2, 1)
    expect(t.y + t.h / 2).toBeCloseTo(map.table.h / 2, 1)
  })

  it('includes a fortress wall on the breach mission', () => {
    const map = generateMap(makeConfig({ mission: 'breach' }), 1, 'breach-test')
    expect(map.items.some((i) => i.type === 'fortress')).toBe(true)
  })

  it('includes wagon markers on the wagon mission', () => {
    const map = generateMap(makeConfig({ mission: 'wagon' }), 1, 'wagon-test')
    const wagons = map.items.filter((i) => i.type === 'wagon')
    expect(wagons.length).toBeGreaterThanOrEqual(3)
  })

  it('places four objectives for takeHold', () => {
    const map = generateMap(makeConfig({ mission: 'takeHold' }), 1, 'takehold-test')
    expect(map.objectives).toHaveLength(4)
    expect(map.objectives.map((o) => o.label).sort()).toEqual(['O1', 'O2', 'O3', 'O4'])
  })

  it('respects waterRarity=none by producing no water features', () => {
    const map = generateMap(makeConfig({ waterRarity: 'none' }), 1, 'no-water')
    const water = map.items.filter((i) => i.type === 'river' || i.type === 'stream')
    expect(water).toHaveLength(0)
  })

  it('threads mission into the output unchanged', () => {
    const missions: MissionKey[] = [
      'agnostic',
      'takeHold',
      'tower',
      'village',
      'wagon',
      'breach',
      'watchtower',
    ]
    for (const m of missions) {
      const map = generateMap(makeConfig({ mission: m }), 1, `m-${m}`)
      expect(map.missionKey).toBe(m)
    }
  })
})
