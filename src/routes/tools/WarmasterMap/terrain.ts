import type { Mission, MissionKey, TerrainRule, TerrainType, Theme, ThemeKey } from './types'

export const TERRAIN_RULES: Record<TerrainType, TerrainRule> = {
  hill: {
    name: 'Hill / Slope',
    color: '#b48b54',
    tags: ['passable', 'blocks LoS', 'defended if higher'],
    rules:
      'Passable. Blocks line of sight. Infantry and artillery on higher ground count as defended against chargers or shooters from lower positions.',
  },
  wood: {
    name: 'Wood / Tall Scrub',
    color: '#587b3d',
    tags: ['difficult', 'dense', '2 cm visibility'],
    rules:
      'Difficult and dense. Usually infantry-friendly. Visibility is 2 cm. Dense terrain gives a -1 Command penalty.',
  },
  denseForest: {
    name: 'Dense Forest',
    color: '#314d2c',
    tags: ['difficult', 'dense', 'broken', '2 cm visibility'],
    rules:
      'Difficult, dense and broken. Visibility is 2 cm. Strong infantry terrain; very restrictive for mounted troops.',
  },
  rough: {
    name: 'Rough Ground / Fields',
    color: '#b69b60',
    tags: ['rough', 'no charge bonus'],
    rules:
      'Rough terrain. Accessible to infantry, cavalry and monsters. Units charging from or into it do not receive charge bonuses.',
  },
  marsh: {
    name: 'Marsh / Dunes',
    color: '#7c8f67',
    tags: ['rough', 'dense'],
    rules: 'Rough and dense. Hinders charges and gives a -1 Command penalty.',
  },
  village: {
    name: 'Village / Built-up Area',
    color: '#9a8f7b',
    tags: ['passable', 'dense', 'broken', '2 cm visibility', 'defended'],
    rules:
      'Passable, dense and broken. Infantry and artillery count as defended within. Visibility is 2 cm. Treat the footprint as the terrain, not individual buildings.',
  },
  ruin: {
    name: 'Ruins / Shrine',
    color: '#8f8674',
    tags: ['dense', 'blocks LoS', 'defended'],
    rules:
      'Dense feature that normally blocks line of sight. Infantry and artillery can count as defended in or behind it.',
  },
  river: {
    name: 'River / Deep Water',
    color: '#4f8ba8',
    tags: ['border-to-border', 'impassable', 'crossings required'],
    rules:
      'Generated from one table edge to another, or into a lake. Impassable except at marked bridges or fords. Does not block line of sight.',
  },
  stream: {
    name: 'Shallow Stream',
    color: '#73aebe',
    tags: ['edge-to-edge', 'rough', 'dense', 'crossings required'],
    rules:
      'Generated as a narrow winding line from one table edge to another, or into a lake. Rough, dense and broken. Use marked crossings when treated as a substantial watercourse.',
  },
  crossing: {
    name: 'Bridge / Ford Crossing',
    color: '#7a4f2a',
    tags: ['crossing', 'passable', 'scenario-safe'],
    rules:
      'Marked crossing point over a river, stream or large water body. Keeps water features playable and prevents a single water feature from sealing the battlefield.',
  },
  lake: {
    name: 'Lake / Water Body',
    color: '#3f7896',
    tags: ['water body', 'impassable', 'edge source'],
    rules:
      'Large water body. Usually impassable. Rivers and streams may start or end here instead of at a table edge.',
  },
  road: {
    name: 'Road / Track',
    color: '#8b6b43',
    tags: ['passable', 'column bonus'],
    rules:
      'Passable. A non-flying unit moving full distance in column along a road may gain an extra half-pace move and +1 Command for a following order.',
  },
  obstacle: {
    name: 'Low Wall / Hedge / Fence',
    color: '#6d604d',
    tags: ['linear', 'defended', 'no LoS block', 'sectioned'],
    rules:
      'Low linear obstacle. Impassable to chariots, artillery and machines. Infantry and artillery behind it count as defended. Crosses and corners are generated as sensible connected sections, not as overlapping solid blocks.',
  },
  impassable: {
    name: 'Rock / Cliff / Monolith',
    color: '#6f6a64',
    tags: ['impassable', 'blocks LoS'],
    rules: 'Impassable feature that blocks line of sight. Use sparingly in competitive layouts.',
  },
  objective: {
    name: 'Objective Marker',
    color: '#d8b64d',
    tags: ['mission'],
    rules:
      'Mission marker. It is not terrain unless both players agree. Keep distance restrictions shown by the mission.',
  },
  tower: {
    name: 'Tower / Watchtower',
    color: '#6b5a42',
    tags: ['mission', 'impassable', 'blocks LoS'],
    rules:
      'Mission feature. Battle for the Tower uses a central impassable tower with no terrain within 20 cm.',
  },
  wagon: {
    name: 'Wagon / Train Marker',
    color: '#9b6234',
    tags: ['mission', 'road'],
    rules:
      'Mission marker for Wagon Train style scenarios. Place along a clear road or track corridor.',
  },
  fortress: {
    name: 'Fortress Wall / Breach',
    color: '#5d5a55',
    tags: ['fortified', 'siege', 'blocks LoS'],
    rules:
      'Siege feature. Fortified positions use the siege rules and should be generated only for siege missions.',
  },
}

export const THEMES: Record<ThemeKey, Theme> = {
  imperial: {
    label: 'Imperial / Human lands',
    bg: '#cdbb89',
    palette: ['hill', 'wood', 'rough', 'village', 'road', 'obstacle', 'stream', 'ruin'],
    required: [],
  },
  wildlands: {
    label: 'Forest / Wildlands',
    bg: '#b7c18a',
    palette: ['wood', 'wood', 'denseForest', 'hill', 'stream', 'rough', 'marsh', 'ruin'],
    required: [],
  },
  chaos: {
    label: 'Chaos lands',
    bg: '#b69a88',
    palette: ['hill', 'rough', 'marsh', 'impassable', 'ruin', 'stream', 'obstacle', 'wood'],
    required: [],
  },
  jungle: {
    label: 'Jungle / Lustria',
    bg: '#a9b977',
    palette: ['denseForest', 'wood', 'wood', 'marsh', 'stream', 'ruin', 'hill', 'impassable'],
    required: [],
  },
  desert: {
    label: 'Desert / Araby / Nehekhara',
    bg: '#d4b978',
    palette: ['rough', 'rough', 'hill', 'impassable', 'ruin', 'obstacle', 'road', 'village'],
    required: [],
  },
}

export const MISSIONS: Record<MissionKey, Mission> = {
  agnostic: {
    label: 'Mission agnostic / Pitched battle',
    note: 'Balanced general-purpose field. Keeps open maneuver lanes, gives each half an infantry-friendly defended area, and avoids overloading deployment zones.',
  },
  takeHold: {
    label: 'Take and Hold',
    note: 'Places four objectives: two near the central line and one in each outer objective zone. Objectives are kept at least 5 cm from terrain and approximately 30 cm apart.',
  },
  tower: {
    label: 'Battle for the Tower',
    note: 'Places an impassable tower in the exact center. Terrain is excluded within 20 cm of the tower.',
  },
  village: {
    label: 'Defending the Village',
    note: 'Creates a central or near-central village objective with supporting roads and surrounding terrain. Designed to make infantry positions important without sealing the board.',
  },
  wagon: {
    label: 'Wagon Train',
    note: 'Creates a road corridor with wagon markers and flanking terrain. Keeps the road playable and avoids blocking the convoy route.',
  },
  breach: {
    label: 'Siege: Into the Breach',
    note: 'Creates a fortress edge with a breach lane and attacker approach. This is a specialized siege layout rather than a normal competitive field.',
  },
  watchtower: {
    label: 'Siege: The Watchtower',
    note: 'Places a watchtower at the center with attacker and relief-force approach zones. Maintains a clear attack lane around the tower.',
  },
}

export function isWater(type: TerrainType): boolean {
  return type === 'river' || type === 'stream'
}
