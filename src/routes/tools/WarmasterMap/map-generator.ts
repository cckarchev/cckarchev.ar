import { choice, randBetween, rngFromSeed, type Rng } from './prng'
import { isWater, MISSIONS, THEMES } from './terrain'
import type {
  Density,
  GeneratedMap,
  GenerationConfig,
  MissionKey,
  ObstacleSegment,
  PlayStyle,
  Point,
  TableSize,
  TerrainItem,
  TerrainType,
  Theme,
  ThemeKey,
  WaterRarity,
} from './types'

// ---- shared geometry helpers ----

function parseSize(value: string): TableSize {
  const [w, h] = value.split('x').map(Number) as [number, number]
  return { w, h }
}

function deploymentDepth(table: TableSize): number {
  if (table.h >= 120) return 20
  return Math.max(10, Math.floor((table.h - 60) / 2))
}

function terrainCount(
  table: TableSize,
  density: Density,
  mission: MissionKey,
  playStyle: PlayStyle,
): number {
  const area = table.w * table.h
  let base = Math.round((area / (180 * 120)) * 9)
  if (density === 'light') base -= 2
  if (density === 'dense') base += 3
  if (playStyle === 'clear') base -= 1
  if (playStyle === 'narrative') base += 2
  if (['tower', 'village', 'wagon', 'breach', 'watchtower'].includes(mission)) base -= 1
  return Math.max(5, Math.min(playStyle === 'narrative' ? 16 : 12, base))
}

function terrainSize(type: TerrainType, table: TableSize, rng: Rng): { w: number; h: number } {
  const scale = Math.sqrt((table.w * table.h) / (180 * 120))
  const baseW = randBetween(rng, 14, 26) * scale
  const baseH = randBetween(rng, 8, 18) * scale
  if (type === 'river' || type === 'stream') {
    return {
      w: table.w + 8,
      h: type === 'river' ? randBetween(rng, 4.5, 7) : randBetween(rng, 2.5, 4.5),
    }
  }
  if (type === 'road')
    return { w: table.w * randBetween(rng, 0.75, 1.15), h: randBetween(rng, 2.5, 5) }
  if (type === 'crossing') return { w: 10, h: 5 }
  if (type === 'lake')
    return { w: randBetween(rng, 18, 34) * scale, h: randBetween(rng, 12, 24) * scale }
  if (type === 'obstacle') return { w: randBetween(rng, 18, 34) * scale, h: 1.5 }
  if (type === 'village')
    return { w: randBetween(rng, 18, 30) * scale, h: randBetween(rng, 14, 24) * scale }
  if (type === 'tower') return { w: 7 * scale, h: 7 * scale }
  if (type === 'fortress') return { w: table.w, h: 7 }
  return { w: baseW, h: baseH }
}

function overlaps(a: TerrainItem, b: TerrainItem, padding = 3): boolean {
  return !(
    a.x + a.w + padding < b.x ||
    b.x + b.w + padding < a.x ||
    a.y + a.h + padding < b.y ||
    b.y + b.h + padding < a.y
  )
}

export function centerDistance(a: TerrainItem, b: TerrainItem): number {
  const ax = a.x + a.w / 2,
    ay = a.y + a.h / 2
  const bx = b.x + b.w / 2,
    by = b.y + b.h / 2
  return Math.hypot(ax - bx, ay - by)
}

function insideDeployment(item: TerrainItem, table: TableSize, dep: number): boolean {
  return item.y < dep || item.y + item.h > table.h - dep
}

function missionExclusion(item: TerrainItem, table: TableSize, mission: MissionKey): boolean {
  const cx = table.w / 2,
    cy = table.h / 2
  const itemCenter = { x: item.x + item.w / 2, y: item.y + item.h / 2 }
  if (mission === 'tower' || mission === 'watchtower') {
    if (Math.hypot(itemCenter.x - cx, itemCenter.y - cy) < 20) return true
  }
  if (mission === 'wagon') {
    const roadBand = table.h / 2
    if (
      Math.abs(itemCenter.y - roadBand) < 8 &&
      !['road', 'wagon', 'objective', 'crossing'].includes(item.type)
    )
      return true
  }
  if (mission === 'breach') {
    if (item.y > table.h - 18 && !['fortress', 'objective', 'road', 'crossing'].includes(item.type))
      return true
  }
  return false
}

function isWaterCourseValid(item: TerrainItem, table: TableSize): boolean {
  if (item.type !== 'river' && item.type !== 'stream') return true
  const touchesHorizontalEdges = item.x <= 0.5 && item.x + item.w >= table.w - 0.5
  const touchesVerticalEdges = item.y <= 0.5 && item.y + item.h >= table.h - 0.5
  return touchesHorizontalEdges || touchesVerticalEdges || item.lakeSource === true
}

function addItem(
  items: TerrainItem[],
  item: TerrainItem,
  table: TableSize,
  mission: MissionKey,
  fairMode: boolean,
  dep: number,
): boolean {
  const isEdgeWater = item.type === 'river' || item.type === 'stream'
  if (
    !isEdgeWater &&
    (item.x < 1 || item.y < 1 || item.x + item.w > table.w - 1 || item.y + item.h > table.h - 1)
  )
    return false
  if (missionExclusion(item, table, mission)) return false
  if (!isWaterCourseValid(item, table)) return false
  if (
    fairMode &&
    insideDeployment(item, table, dep) &&
    !['road', 'river', 'stream', 'fortress', 'crossing'].includes(item.type)
  )
    return false
  for (const existing of items) {
    if (['road', 'river', 'stream', 'crossing'].includes(existing.type)) continue
    if (['road', 'river', 'stream', 'crossing'].includes(item.type)) continue
    if (overlaps(item, existing, 4)) return false
  }
  items.push(item)
  return true
}

export function makeBlobPath(x: number, y: number, w: number, h: number, rng: Rng): string {
  const pts: [number, number][] = []
  const count = 10
  for (let i = 0; i < count; i++) {
    const a = (Math.PI * 2 * i) / count
    const r = 0.82 + rng() * 0.35
    pts.push([x + w / 2 + ((Math.cos(a) * w) / 2) * r, y + h / 2 + ((Math.sin(a) * h) / 2) * r])
  }
  return 'M ' + pts.map((p) => p.map((n) => n.toFixed(2)).join(' ')).join(' L ') + ' Z'
}

export function pointOnRoad(road: TerrainItem, t: number): Point {
  if (!road.path) return { x: road.x + road.w * t, y: road.y }
  const [p0, p1, p2, p3] = road.path
  const u = 1 - t
  return {
    x: u * u * u * p0!.x + 3 * u * u * t * p1!.x + 3 * u * t * t * p2!.x + t * t * t * p3!.x,
    y: u * u * u * p0!.y + 3 * u * u * t * p1!.y + 3 * u * t * t * p2!.y + t * t * t * p3!.y,
  }
}

// ---- label allocation ----

function labelFor(type: TerrainType, items: TerrainItem[], offset = 0): string {
  const prefix: Record<string, string> = {
    hill: 'H',
    wood: 'W',
    denseForest: 'DF',
    rough: 'R',
    marsh: 'M',
    village: 'V',
    ruin: 'RU',
    river: 'RV',
    stream: 'S',
    road: 'RD',
    obstacle: 'LO',
    impassable: 'I',
    crossing: 'C',
    lake: 'L',
    tower: 'T',
    wagon: 'WG',
    fortress: 'FW',
    objective: 'O',
  }
  const p = prefix[type] ?? 'T'
  const count = items.filter((i) => i.type === type).length + 1 + offset
  return `${p}${count}`
}

// ---- road / water builders ----

function chooseRoadAnchor(
  items: TerrainItem[],
  _table: TableSize,
  rng: Rng,
  mode: string,
): Point | null {
  const candidates = items
    .filter((i) => ['village', 'ruin', 'tower', 'crossing', 'objective'].includes(i.type))
    .map((i) => ({ x: i.x + i.w / 2, y: i.y + i.h / 2 }))
  if (!candidates.length || mode !== 'neutral') return null
  if (rng() > 0.65) return null
  return choice(rng, candidates)
}

function makeRoad(
  table: TableSize,
  rng: Rng,
  dep: number,
  items: TerrainItem[],
  mode: 'neutral' | 'convoy' | 'village' | 'approach' = 'neutral',
): TerrainItem {
  const label = labelFor('road', items)
  let p0: Point, p3: Point
  const sideY = randBetween(rng, dep + 8, table.h - dep - 8)
  const neutralY = randBetween(rng, dep + 10, table.h - dep - 10)

  if (mode === 'convoy') {
    p0 = { x: -3, y: table.h / 2 + randBetween(rng, -8, 8) }
    p3 = { x: table.w + 3, y: table.h / 2 + randBetween(rng, -8, 8) }
  } else if (mode === 'village') {
    if (rng() < 0.5) {
      p0 = { x: -3, y: neutralY }
      p3 = { x: table.w + 3, y: table.h - neutralY }
    } else {
      p0 = { x: table.w * 0.18, y: dep + 4 }
      p3 = { x: table.w * 0.82, y: table.h - dep - 4 }
    }
  } else if (mode === 'approach') {
    p0 = { x: table.w / 2 + randBetween(rng, -10, 10), y: -3 }
    p3 = { x: table.w / 2 + randBetween(rng, -8, 8), y: table.h - 8 }
  } else {
    const roll = rng()
    if (roll < 0.45) {
      p0 = { x: -3, y: sideY }
      p3 = { x: table.w + 3, y: randBetween(rng, dep + 8, table.h - dep - 8) }
    } else if (roll < 0.7) {
      p0 = {
        x: randBetween(rng, table.w * 0.12, table.w * 0.35),
        y: randBetween(rng, dep + 10, table.h - dep - 10),
      }
      p3 = {
        x: randBetween(rng, table.w * 0.65, table.w * 0.88),
        y: randBetween(rng, dep + 10, table.h - dep - 10),
      }
    } else {
      p0 = { x: -3, y: sideY }
      p3 = {
        x: randBetween(rng, table.w * 0.55, table.w * 0.86),
        y: randBetween(rng, dep + 10, table.h - dep - 10),
      }
    }
  }

  const anchor = chooseRoadAnchor(items, table, rng, mode)
  if (anchor && mode === 'neutral') {
    if (rng() < 0.5) p3 = anchor
    else p0 = anchor
  }
  const p1: Point = { x: p0.x + (p3.x - p0.x) * 0.33, y: p0.y + randBetween(rng, -12, 12) }
  const p2: Point = { x: p0.x + (p3.x - p0.x) * 0.66, y: p3.y + randBetween(rng, -12, 12) }
  const minX = Math.min(p0.x, p1.x, p2.x, p3.x)
  const maxX = Math.max(p0.x, p1.x, p2.x, p3.x)
  const minY = Math.min(p0.y, p1.y, p2.y, p3.y)
  const maxY = Math.max(p0.y, p1.y, p2.y, p3.y)
  return {
    type: 'road',
    x: minX,
    y: minY,
    w: maxX - minX,
    h: maxY - minY || 3,
    label,
    path: [p0, p1, p2, p3],
  }
}

function makeWaterCourse(
  type: TerrainType,
  table: TableSize,
  rng: Rng,
  dep: number,
  items: TerrainItem[],
): TerrainItem {
  const horizontal = rng() > 0.28
  const width = type === 'river' ? randBetween(rng, 4.5, 6.5) : randBetween(rng, 1.6, 2.8)
  const label = labelFor(type, items)
  const margin = 4
  if (horizontal) {
    const y0 = randBetween(rng, dep + 12, table.h - dep - 12)
    const y3 = randBetween(rng, dep + 12, table.h - dep - 12)
    const p0 = { x: -margin, y: y0 }
    const p3 = { x: table.w + margin, y: y3 }
    const p1 = { x: table.w * 0.33, y: y0 + randBetween(rng, -10, 10) }
    const p2 = { x: table.w * 0.66, y: y3 + randBetween(rng, -10, 10) }
    return {
      type,
      x: -margin,
      y: Math.min(y0, y3, p1.y, p2.y) - width,
      w: table.w + margin * 2,
      h: Math.max(3, Math.abs(y3 - y0) + width * 2 + 20),
      width,
      label,
      waterPath: 'horizontal',
      path: [p0, p1, p2, p3],
    }
  }
  const x0 = randBetween(rng, 18, table.w - 18)
  const x3 = randBetween(rng, 18, table.w - 18)
  const p0 = { x: x0, y: -margin }
  const p3 = { x: x3, y: table.h + margin }
  const p1 = { x: x0 + randBetween(rng, -10, 10), y: table.h * 0.33 }
  const p2 = { x: x3 + randBetween(rng, -10, 10), y: table.h * 0.66 }
  return {
    type,
    x: Math.min(x0, x3, p1.x, p2.x) - width,
    y: -margin,
    w: Math.max(3, Math.abs(x3 - x0) + width * 2 + 20),
    h: table.h + margin * 2,
    width,
    label,
    waterPath: 'vertical',
    path: [p0, p1, p2, p3],
  }
}

function addWaterCrossings(
  items: TerrainItem[],
  water: TerrainItem,
  table: TableSize,
  rng: Rng,
): void {
  const length = water.waterPath === 'vertical' ? table.h : table.w
  const crossings = Math.max(1, Math.min(4, Math.floor(length / 70)))
  for (let i = 0; i < crossings; i++) {
    const t = (i + 1) / (crossings + 1)
    const p = pointOnRoad(water, Math.max(0.12, Math.min(0.88, t + randBetween(rng, -0.04, 0.04))))
    if (water.waterPath === 'vertical') {
      items.push({
        type: 'crossing',
        x: p.x - 7,
        y: p.y - 2.5,
        w: 14,
        h: 5,
        angle: 90,
        label: `C${i + 1}`,
      })
    } else {
      items.push({
        type: 'crossing',
        x: p.x - 6,
        y: p.y - 2.5,
        w: 12,
        h: 5,
        angle: 0,
        label: `C${i + 1}`,
      })
    }
  }
}

// ---- obstacle clusters ----

function makeObstacleCluster(
  table: TableSize,
  rng: Rng,
  dep: number,
  items: TerrainItem[],
  playStyle: PlayStyle,
): TerrainItem {
  const label = labelFor('obstacle', items)
  const pattern =
    playStyle === 'narrative'
      ? choice(rng, ['straight', 'corner', 't', 'broken'])
      : choice(rng, ['straight', 'corner', 'broken'])
  const cx = randBetween(rng, table.w * 0.18, table.w * 0.82)
  const cy = randBetween(rng, dep + 8, table.h - dep - 8)
  const base = randBetween(rng, 12, 22) * Math.sqrt((table.w * table.h) / (180 * 120))
  const thickness = 1.2
  const segments: ObstacleSegment[] = []
  const addSeg = (x1: number, y1: number, x2: number, y2: number) =>
    segments.push({ x1, y1, x2, y2 })

  if (pattern === 'straight') {
    const horizontal = rng() > 0.35
    if (horizontal) addSeg(cx - base, cy, cx + base, cy + randBetween(rng, -2, 2))
    else addSeg(cx, cy - base * 0.65, cx + randBetween(rng, -2, 2), cy + base * 0.65)
  } else if (pattern === 'corner') {
    addSeg(cx - base * 0.75, cy, cx, cy)
    addSeg(cx, cy, cx, cy + base * 0.65)
  } else if (pattern === 't') {
    addSeg(cx - base * 0.8, cy, cx, cy)
    addSeg(cx, cy, cx + base * 0.8, cy)
    addSeg(cx, cy, cx, cy + base * 0.65)
  } else {
    addSeg(cx - base, cy, cx - base * 0.25, cy + randBetween(rng, -1.5, 1.5))
    addSeg(cx + base * 0.2, cy + randBetween(rng, -1.5, 1.5), cx + base, cy)
  }

  const xs = segments.flatMap((s) => [s.x1, s.x2])
  const ys = segments.flatMap((s) => [s.y1, s.y2])
  const minX = Math.max(1, Math.min(...xs) - thickness)
  const maxX = Math.min(table.w - 1, Math.max(...xs) + thickness)
  const minY = Math.max(1, Math.min(...ys) - thickness)
  const maxY = Math.min(table.h - 1, Math.max(...ys) + thickness)
  return {
    type: 'obstacle',
    x: minX,
    y: minY,
    w: maxX - minX,
    h: maxY - minY,
    label,
    segments,
    pattern,
  }
}

// ---- mission required / objectives ----

function addMissionRequired(
  items: TerrainItem[],
  _objectives: TerrainItem[],
  table: TableSize,
  mission: MissionKey,
  _themeKey: ThemeKey,
  rng: Rng,
  dep: number,
): void {
  if (mission === 'tower' || mission === 'watchtower') {
    const size = mission === 'watchtower' ? 10 : 8
    items.push({
      type: 'tower',
      x: table.w / 2 - size / 2,
      y: table.h / 2 - size / 2,
      w: size,
      h: size,
      label: mission === 'watchtower' ? 'WT1' : 'T1',
    })
  }

  if (mission === 'village') {
    const vW = Math.min(34, table.w * 0.24),
      vH = Math.min(24, table.h * 0.22)
    items.push({
      type: 'village',
      x: table.w / 2 - vW / 2,
      y: table.h / 2 - vH / 2,
      w: vW,
      h: vH,
      label: 'V1',
    })
    items.push(makeRoad(table, rng, dep, items, 'village'))
  }

  if (mission === 'wagon') {
    const road = makeRoad(table, rng, dep, items, 'convoy')
    items.push(road)
    for (let i = 0; i < 3; i++) {
      const t = 0.38 + i * 0.12
      const p = pointOnRoad(road, t)
      items.push({ type: 'wagon', x: p.x - 3, y: p.y - 3, w: 6, h: 6, label: `WG${i + 1}` })
    }
  }

  if (mission === 'breach') {
    items.push({ type: 'fortress', x: 0, y: table.h - 8, w: table.w, h: 8, label: 'FW1' })
    items.push({
      type: 'objective',
      x: table.w / 2 - 5,
      y: table.h - 8.5,
      w: 10,
      h: 9,
      label: 'BR1',
    })
    items.push(makeRoad(table, rng, dep, items, 'approach'))
  }
}

function addThemeRequired(
  items: TerrainItem[],
  table: TableSize,
  _mission: MissionKey,
  theme: Theme,
  rng: Rng,
  dep: number,
): void {
  for (const type of theme.required) {
    if (type === 'road' && !items.some((i) => i.type === 'road')) {
      items.push(makeRoad(table, rng, dep, items, 'neutral'))
    }
  }
}

function addFairTerrain(
  items: TerrainItem[],
  table: TableSize,
  mission: MissionKey,
  theme: Theme,
  density: Density,
  fairMode: boolean,
  rng: Rng,
  dep: number,
  playStyle: PlayStyle,
  waterRarity: WaterRarity,
): void {
  const target = terrainCount(table, density, mission, playStyle)
  const palette = theme.palette
  let guard = 0

  while (
    items.filter(
      (i) => !['objective', 'tower', 'wagon', 'road', 'fortress', 'crossing'].includes(i.type),
    ).length < target &&
    guard < 900
  ) {
    guard++
    const type = choice(rng, palette)
    if (mission === 'wagon' && isWater(type)) continue
    if (mission === 'breach' && type === 'village') continue

    if (type === 'road') {
      const hasRoad = items.some((i) => i.type === 'road')
      let roadChance = theme.label.includes('Imperial') ? 0.55 : 0.24
      if (playStyle === 'clear') roadChance -= 0.12
      if (playStyle === 'narrative') roadChance += 0.18
      if (!hasRoad && rng() < roadChance) items.push(makeRoad(table, rng, dep, items, 'neutral'))
      continue
    }

    if (isWater(type)) {
      const hasWaterCourse = items.some((i) => isWater(i.type))
      if (hasWaterCourse || waterRarity === 'none') continue
      let waterChance = type === 'river' ? 0.08 : 0.16
      if (waterRarity === 'normal') waterChance += 0.12
      if (waterRarity === 'scenic') waterChance += 0.26
      if (playStyle === 'clear') waterChance -= 0.05
      if (playStyle === 'narrative') waterChance += 0.1
      if (density === 'dense') waterChance += 0.06
      if (rng() > Math.max(0.02, waterChance)) continue
      const water = makeWaterCourse(type, table, rng, dep, items)
      if (addItem(items, water, table, mission, fairMode, dep))
        addWaterCrossings(items, water, table, rng)
      continue
    }

    if (type === 'obstacle') {
      const cluster = makeObstacleCluster(table, rng, dep, items, playStyle)
      addItem(items, cluster, table, mission, fairMode, dep)
      continue
    }

    const size = terrainSize(type, table, rng)
    let x = randBetween(rng, 6, table.w - size.w - 6)
    let y = randBetween(rng, dep + 4, table.h - dep - size.h - 4)

    const mirrorChance =
      playStyle === 'competitive' ? 0.68 : playStyle === 'narrative' ? 0.32 : 0.52
    if (fairMode && rng() < mirrorChance && type !== 'lake') {
      x = randBetween(rng, 8, table.w / 2 - size.w - 4)
      y = randBetween(rng, dep + 5, table.h - dep - size.h - 5)
      const a: TerrainItem = {
        type,
        x,
        y,
        w: size.w,
        h: size.h,
        angle: randBetween(rng, -22, 22),
        label: labelFor(type, items),
      }
      const mirrored: TerrainItem = {
        type,
        x: Math.max(
          6,
          Math.min(
            table.w - size.w - 6,
            table.w - x - size.w + (playStyle === 'competitive' ? randBetween(rng, -4, 4) : 0),
          ),
        ),
        y: Math.max(
          dep + 5,
          Math.min(
            table.h - dep - size.h - 5,
            table.h - y - size.h + (playStyle === 'competitive' ? randBetween(rng, -3, 3) : 0),
          ),
        ),
        w: size.w,
        h: size.h,
        angle: (a.angle ?? 0) + 180,
        label: labelFor(type, items, 1),
      }
      const before = items.length
      addItem(items, a, table, mission, fairMode, dep)
      if (items.length > before) addItem(items, mirrored, table, mission, fairMode, dep)
    } else {
      const item: TerrainItem = {
        type,
        x,
        y,
        w: size.w,
        h: size.h,
        angle: randBetween(rng, -35, 35),
        label: labelFor(type, items),
      }
      addItem(items, item, table, mission, fairMode, dep)
    }
  }

  ensureManeuverLanes(items, table, mission, dep)
}

function ensureManeuverLanes(
  items: TerrainItem[],
  table: TableSize,
  mission: MissionKey,
  dep: number,
): void {
  if (mission === 'breach' || mission === 'watchtower') return
  const lanes = [table.w * 0.25, table.w * 0.5, table.w * 0.75]
  for (const lx of lanes) {
    const blockers = items.filter(
      (i) =>
        !['road', 'objective', 'wagon', 'crossing'].includes(i.type) &&
        i.x < lx &&
        i.x + i.w > lx &&
        i.y > dep &&
        i.y + i.h < table.h - dep,
    )
    if (blockers.length > 2) {
      blockers.slice(2).forEach((b) => {
        b.x += lx < table.w / 2 ? -6 : 6
      })
    }
  }
}

function addMissionObjectives(
  items: TerrainItem[],
  objectives: TerrainItem[],
  table: TableSize,
  mission: MissionKey,
  rng: Rng,
  dep: number,
): void {
  if (mission === 'takeHold') {
    const centralY = table.h / 2
    const zoneB = 15
    const topZoneY = dep + Math.max(5, (centralY - zoneB - dep) / 2)
    const bottomZoneY = table.h - dep - Math.max(5, (centralY - zoneB - dep) / 2)
    const desired: { x: number; y: number; label: string; zone: 'A' | 'B' }[] = [
      { x: table.w * 0.28, y: centralY - Math.min(6, zoneB * 0.4), label: 'O1', zone: 'B' },
      { x: table.w * 0.72, y: centralY + Math.min(6, zoneB * 0.4), label: 'O2', zone: 'B' },
      { x: table.w * 0.5, y: topZoneY, label: 'O3', zone: 'A' },
      { x: table.w * 0.5, y: bottomZoneY, label: 'O4', zone: 'A' },
    ]
    desired.forEach((o) => placeObjectiveStrict(items, objectives, table, o, rng, dep))
  }

  if (mission === 'village') {
    placeObjective(items, objectives, table, table.w / 2, table.h / 2, 'OBJ', rng, true)
  }
}

function placeObjectiveStrict(
  items: TerrainItem[],
  objectives: TerrainItem[],
  table: TableSize,
  desired: { x: number; y: number; label: string; zone: 'A' | 'B' },
  _rng: Rng,
  dep: number,
): void {
  const size = 4
  const candidates: TerrainItem[] = []
  const minObjectiveGap = Math.min(30, Math.max(24, table.w * 0.28))
  const addCandidate = (x: number, y: number) =>
    candidates.push({
      x: x - size / 2,
      y: y - size / 2,
      w: size,
      h: size,
      type: 'objective',
      label: desired.label,
    })
  addCandidate(desired.x, desired.y)
  for (let ring = 1; ring <= 5; ring++) {
    const step = ring * 5
    for (const dx of [-step, 0, step]) {
      for (const dy of [-step, 0, step]) {
        if (dx || dy) addCandidate(desired.x + dx, desired.y + dy)
      }
    }
  }
  const legal =
    candidates.find((obj) => {
      const cy = obj.y + obj.h / 2
      if (desired.zone === 'B' && Math.abs(cy - table.h / 2) > 15) return false
      if (
        desired.zone === 'A' &&
        (cy <= dep || cy >= table.h - dep || Math.abs(cy - table.h / 2) <= 15)
      )
        return false
      if (obj.x < 5 || obj.y < dep + 1 || obj.x > table.w - 5 || obj.y > table.h - dep - 1)
        return false
      if (objectives.some((o) => centerDistance(obj, o) < minObjectiveGap)) return false
      if (
        items.some(
          (i) => !['objective', 'road', 'crossing'].includes(i.type) && centerDistance(obj, i) < 5,
        )
      )
        return false
      return true
    }) || candidates[0]!
  items.push(legal)
  objectives.push(legal)
}

function placeObjective(
  items: TerrainItem[],
  objectives: TerrainItem[],
  table: TableSize,
  x: number,
  y: number,
  label: string,
  rng: Rng,
  allowNearTerrain = false,
): void {
  const size = 4
  const obj: TerrainItem = {
    type: 'objective',
    x: x - size / 2,
    y: y - size / 2,
    w: size,
    h: size,
    label,
  }
  for (let attempt = 0; attempt < 60; attempt++) {
    const tooCloseTerrain =
      !allowNearTerrain &&
      items.some(
        (i) => !['objective', 'road', 'crossing'].includes(i.type) && centerDistance(obj, i) < 8,
      )
    const tooCloseObj = objectives.some((o) => centerDistance(obj, o) < 30)
    if (
      !tooCloseTerrain &&
      !tooCloseObj &&
      obj.x > 5 &&
      obj.y > 5 &&
      obj.x < table.w - 5 &&
      obj.y < table.h - 5
    )
      break
    obj.x += randBetween(rng, -6, 6)
    obj.y += randBetween(rng, -6, 6)
  }
  items.push(obj)
  objectives.push(obj)
}

// ---- entry point ----

export function generateMap(
  config: GenerationConfig,
  index: number,
  baseSeed: string,
): GeneratedMap {
  const table = parseSize(config.tableSize)
  const themeKey = config.theme
  const missionKey = config.mission
  const density = config.density
  const playStyle = config.playStyle
  const waterRarity = config.waterRarity
  const fairMode = config.fairMode
  const seed = `${baseSeed || Date.now()}-${index}-${table.w}x${table.h}-${themeKey}-${missionKey}-${density}-${playStyle}-${waterRarity}`
  const rng = rngFromSeed(seed)
  const theme = THEMES[themeKey]
  const dep = deploymentDepth(table)
  const items: TerrainItem[] = []
  const objectives: TerrainItem[] = []

  addMissionRequired(items, objectives, table, missionKey, themeKey, rng, dep)
  addThemeRequired(items, table, missionKey, theme, rng, dep)
  addFairTerrain(
    items,
    table,
    missionKey,
    theme,
    density,
    fairMode,
    rng,
    dep,
    playStyle,
    waterRarity,
  )
  addMissionObjectives(items, objectives, table, missionKey, rng, dep)

  return {
    seed,
    table,
    themeKey,
    missionKey,
    density,
    playStyle,
    waterRarity,
    fairMode,
    dep,
    items,
    objectives,
    title: MISSIONS[missionKey].label,
    themeLabel: theme.label,
  }
}

export function generateNewBaseSeed(): string {
  return 'WMR-' + Math.random().toString(36).slice(2, 8).toUpperCase()
}
