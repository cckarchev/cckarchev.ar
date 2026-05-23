import { pointOnRoad } from './map-generator'
import { isWater } from './terrain'
import type { GeneratedMap, TerrainItem } from './types'

export function shortSeed(seed: string): string {
  return seed.length > 42 ? seed.slice(0, 42) + '…' : seed
}

export function fairPlaySummary(map: GeneratedMap): string {
  const styleNames: Record<string, string> = {
    clear: 'battle-report clarity',
    competitive: 'competitive semi-symmetry',
    narrative: 'narrative scenery',
  }
  const water = map.items.some((i) => isWater(i.type)) ? 'water has marked crossings' : 'no major water barrier'
  const roads = map.items.some((i) => i.type === 'road') ? 'subtle functional road' : 'no road advantage'
  const comp =
    map.playStyle === 'competitive'
      ? 'paired terrain is intentionally close but not identical'
      : 'terrain is balanced by lanes and readability'
  return `${styleNames[map.playStyle] || 'clear play'}; ${comp}; explicit footprints; clear deployment zones; central maneuver space; ${roads}; ${water}; objective buffers shown when enabled.`
}

function sideLaneScore(map: GeneratedMap, north: boolean): { score: number } {
  const y = north
    ? map.dep + (map.table.h / 2 - map.dep) * 0.45
    : map.table.h - map.dep - (map.table.h / 2 - map.dep) * 0.45
  const lanes = [map.table.w * 0.25, map.table.w * 0.5, map.table.w * 0.75]
  let open = 0
  for (const lx of lanes) {
    const blocked = map.items.some(
      (i: TerrainItem) =>
        !['road', 'objective', 'crossing', 'wagon'].includes(i.type) &&
        i.x < lx &&
        i.x + i.w > lx &&
        i.y < y &&
        i.y + i.h > y,
    )
    if (!blocked) open++
  }
  return { score: open * 0.22 }
}

function sideScore(map: GeneratedMap, side: 'north' | 'south'): { total: number; tags: string[] } {
  const topHalf = side === 'north'
  const dep = map.dep
  const bandMin = topHalf ? dep : map.table.h / 2
  const bandMax = topHalf ? map.table.h / 2 : map.table.h - dep
  let total = 0
  const tags: string[] = []
  const add = (score: number, tag: string) => {
    total += score
    if (tag && !tags.includes(tag)) tags.push(tag)
  }
  for (const item of map.items) {
    const cy = item.path && item.path.length ? pointOnRoad(item, 0.5).y : item.y + item.h / 2
    if (cy < bandMin || cy > bandMax) continue
    if (['wood', 'denseForest', 'village', 'ruin'].includes(item.type)) add(1.2, 'defended/dense ground')
    else if (item.type === 'hill') add(1.0, 'hill positions')
    else if (item.type === 'rough' || item.type === 'marsh') add(0.7, 'charge-breaking terrain')
    else if (item.type === 'obstacle') add(0.55, 'linear defenses')
    else if (item.type === 'road') add(0.35, 'road access')
    else if (item.type === 'crossing') add(0.45, 'crossing control')
    else if (isWater(item.type)) add(-0.4, 'water pressure')
  }
  const lanes = sideLaneScore(map, topHalf)
  total += lanes.score
  if (lanes.score > 0.4) tags.push('clear maneuver lanes')
  return { total, tags: tags.slice(0, 3) }
}

export function sideChoiceSummary(map: GeneratedMap): string {
  const north = sideScore(map, 'north')
  const south = sideScore(map, 'south')
  const diff = north.total - south.total
  const better = diff >= 0 ? north : south
  const other = diff >= 0 ? south : north
  const betterName = diff >= 0 ? 'North' : 'South'
  const otherName = diff >= 0 ? 'South' : 'North'
  const close = Math.abs(diff) < 1.6
  if (map.playStyle === 'competitive') {
    if (close)
      return 'Competitive mode keeps both long-edge sides close in value, with small asymmetries so choosing side matters without deciding the game. The player not choosing side should still have a viable first-turn benefit.'
    return `${betterName} side has a slight positional edge (${better.tags.join(', ') || 'terrain access'}); ${otherName} side has counterplay through ${other.tags.join(', ') || 'clearer lanes / tempo'}. Intended for side choice to matter, not to dominate.`
  }
  return close
    ? 'Both long-edge sides are broadly comparable.'
    : `${betterName} side is a little more terrain-favoured; ${otherName} side should have clearer maneuver or tempo options.`
}
