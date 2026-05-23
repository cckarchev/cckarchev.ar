import { makeBlobPath, pointOnRoad } from './map-generator'
import { randBetween, rngFromSeed } from './prng'
import { TERRAIN_RULES, THEMES } from './terrain'
import type { GeneratedMap, RenderOptions, TerrainItem } from './types'

function escapeHtml(str: string): string {
  return String(str).replace(
    /[&<>"']/g,
    (s) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[s]!,
  )
}

function hash(str: string): string {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  return Math.abs(h).toString(36)
}

function text(
  x: number,
  y: number,
  content: string,
  size: number,
  fill: string,
  anchor: 'start' | 'middle' | 'end' = 'middle',
  weight = 'normal',
): string {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" font-family="Georgia, serif" font-weight="${weight}" fill="${fill}" stroke="rgba(0,0,0,.35)" stroke-width=".35" paint-order="stroke">${escapeHtml(content)}</text>`
}

function scaleBar(_table: { w: number; h: number }, sx: number, _sy: number, vbH: number): string {
  const x = 18,
    y = vbH - 22,
    len = 20 * sx
  return `<g><line x1="${x}" y1="${y}" x2="${x + len}" y2="${y}" stroke="#2c1b0d" stroke-width="4"/><line x1="${x}" y1="${y - 6}" x2="${x}" y2="${y + 6}" stroke="#2c1b0d" stroke-width="3"/><line x1="${x + len}" y1="${y - 6}" x2="${x + len}" y2="${y + 6}" stroke="#2c1b0d" stroke-width="3"/>${text(x + len / 2, y - 9, '20 cm', 13, '#2c1b0d', 'middle')}</g>`
}

function drawTenCmNumbers(
  map: GeneratedMap,
  sx: number,
  sy: number,
  _vbW: number,
  _vbH: number,
  showGrid: boolean,
): string {
  if (!showGrid) return ''
  let out = ''
  for (let x = 10; x < map.table.w; x += 10)
    out += text(x * sx + 2, 12, String(x), 8, 'rgba(65,45,20,.45)', 'start')
  for (let y = 10; y < map.table.h; y += 10)
    out += text(4, y * sy - 2, String(y), 8, 'rgba(65,45,20,.45)', 'start')
  return out
}

function drawObjectiveValidation(
  map: GeneratedMap,
  sx: number,
  sy: number,
  _vbW: number,
  _vbH: number,
  showOverlay: boolean,
): string {
  if (!showOverlay) return ''
  if (!map.objectives || !map.objectives.length) return ''
  let out = ''
  const minGap = Math.min(30, Math.max(24, map.table.w * 0.28))
  for (const obj of map.objectives) {
    const cx = (obj.x + obj.w / 2) * sx
    const cy = (obj.y + obj.h / 2) * sy
    out += `<circle cx="${cx}" cy="${cy}" r="${5 * sx}" fill="rgba(255,255,255,.10)" stroke="rgba(135,80,20,.55)" stroke-dasharray="4 4"/>`
    out += `<circle cx="${cx}" cy="${cy}" r="${minGap * sx}" fill="none" stroke="rgba(160,40,20,.18)" stroke-dasharray="6 8"/>`
  }
  return out
}

function drawMissionGuides(
  map: GeneratedMap,
  sx: number,
  sy: number,
  vbW: number,
  _vbH: number,
): string {
  const { table, missionKey } = map
  let out = ''
  if (missionKey === 'takeHold') {
    out += `<rect x="0" y="${(table.h / 2 - 15) * sy}" width="${vbW}" height="${30 * sy}" fill="rgba(212,170,82,.12)" stroke="rgba(120,85,20,.55)" stroke-dasharray="10 8"/>`
    out += text(vbW - 8, (table.h / 2) * sy - 18, 'Objective Zone B', 13, '#6b4a17', 'end')
  }
  if (missionKey === 'tower' || missionKey === 'watchtower') {
    out += `<circle cx="${(table.w / 2) * sx}" cy="${(table.h / 2) * sy}" r="${20 * sx}" fill="rgba(255,255,255,.13)" stroke="rgba(80,40,20,.5)" stroke-dasharray="9 7"/>`
    out += text(
      (table.w / 2) * sx,
      (table.h / 2) * sy - 25 * sx,
      '20cm clear zone',
      13,
      '#5a371c',
      'middle',
    )
  }
  if (missionKey === 'breach') {
    out += `<rect x="0" y="${(table.h - 20) * sy}" width="${vbW}" height="${20 * sy}" fill="rgba(80,80,80,.12)" stroke="rgba(80,80,80,.55)" stroke-dasharray="8 6"/>`
    out += text(vbW / 2, (table.h - 13) * sy, 'Defender fortress edge', 14, '#302b26', 'middle')
  }
  return out
}

function drawItem(
  item: TerrainItem,
  map: GeneratedMap,
  sx: number,
  sy: number,
  _vbW: number,
  _vbH: number,
): string {
  const r = TERRAIN_RULES[item.type]
  const x = item.x * sx,
    y = item.y * sy,
    w = item.w * sx,
    h = item.h * sy
  const cx = x + w / 2,
    cy = y + h / 2
  const rot = item.angle || 0
  const common = `transform="rotate(${rot} ${cx} ${cy})" filter="url(#shadow-${hash(map.seed)})"`
  let out = ''

  if (
    [
      'wood',
      'denseForest',
      'hill',
      'rough',
      'marsh',
      'village',
      'ruin',
      'impassable',
      'lake',
    ].includes(item.type)
  ) {
    const rng = rngFromSeed(map.seed + item.label)
    const path = makeBlobPath(x, y, w, h, rng)
    out += `<path d="${path}" fill="${r.color}" stroke="rgba(35,25,12,.75)" stroke-width="2" ${common}/>`
    if (item.type === 'wood' || item.type === 'denseForest') {
      for (let i = 0; i < 6; i++)
        out += `<circle cx="${x + w * (0.18 + rng() * 0.64)}" cy="${y + h * (0.18 + rng() * 0.64)}" r="${Math.max(3, Math.min(w, h) * 0.07)}" fill="rgba(20,55,22,.45)"/>`
    }
    if (item.type === 'village') {
      for (let i = 0; i < 5; i++)
        out += `<rect x="${x + w * (0.12 + rng() * 0.68)}" y="${y + h * (0.18 + rng() * 0.55)}" width="${w * 0.13}" height="${h * 0.16}" fill="#6d5540" stroke="#352618" stroke-width="1" transform="rotate(${rot + randBetween(rng, -15, 15)} ${cx} ${cy})"/>`
    }
  } else if (['road', 'river', 'stream'].includes(item.type)) {
    const color = r.color
    if (item.path) {
      const p = item.path.map((pt) => ({ x: pt.x * sx, y: pt.y * sy }))
      const pathD = `M ${p[0]!.x} ${p[0]!.y} C ${p[1]!.x} ${p[1]!.y}, ${p[2]!.x} ${p[2]!.y}, ${p[3]!.x} ${p[3]!.y}`
      if (item.type === 'road') {
        out += `<path d="${pathD}" fill="none" stroke="${color}" stroke-width="${Math.max(7, 3.5 * sy)}" stroke-linecap="round" opacity=".88"/>`
        out += `<path d="${pathD}" fill="none" stroke="rgba(50,35,20,.38)" stroke-width="1.5" stroke-dasharray="7 7"/>`
      } else {
        const waterWidth = Math.max(5, (item.width || item.h || 2.5) * sy)
        out += `<path d="${pathD}" fill="none" stroke="${color}" stroke-width="${waterWidth}" stroke-linecap="round" opacity=".9"/>`
        out += `<path d="${pathD}" fill="none" stroke="rgba(230,250,255,.34)" stroke-width="1.7" stroke-dasharray="10 9"/>`
      }
    }
  } else if (item.type === 'crossing') {
    out += `<rect x="${x}" y="${y}" width="${w}" height="${Math.max(6, h)}" rx="2" fill="${r.color}" stroke="#2c1a0c" stroke-width="2" transform="rotate(${item.angle || 0} ${cx} ${cy})" filter="url(#shadow-${hash(map.seed)})"/>`
    out += `<line x1="${x + 2}" y1="${cy}" x2="${x + w - 2}" y2="${cy}" stroke="rgba(255,230,170,.55)" stroke-width="1" transform="rotate(${item.angle || 0} ${cx} ${cy})"/>`
  } else if (item.type === 'obstacle') {
    if (item.segments && item.segments.length) {
      for (const seg of item.segments) {
        const x1 = seg.x1 * sx,
          y1 = seg.y1 * sy,
          x2 = seg.x2 * sx,
          y2 = seg.y2 * sy
        out += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${r.color}" stroke-width="${Math.max(5, 1.25 * sy)}" stroke-linecap="butt" filter="url(#shadow-${hash(map.seed)})"/>`
        out += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#2d261e" stroke-width="1" stroke-linecap="butt" opacity=".75"/>`
      }
    } else {
      out += `<rect x="${x}" y="${y}" width="${w}" height="${Math.max(4, h)}" fill="${r.color}" stroke="#2d261e" stroke-width="1.5" ${common}/>`
    }
  } else if (['objective', 'wagon', 'tower'].includes(item.type)) {
    const shapeColor = r.color
    if (item.type === 'objective')
      out += `<circle cx="${cx}" cy="${cy}" r="${Math.max(8, w / 2)}" fill="${shapeColor}" stroke="#4c3210" stroke-width="2" filter="url(#shadow-${hash(map.seed)})"/>`
    else if (item.type === 'wagon') {
      out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${shapeColor}" stroke="#3c2414" stroke-width="2" filter="url(#shadow-${hash(map.seed)})"/>`
      out += `<circle cx="${x + w * 0.2}" cy="${y + h}" r="3" fill="#2b1a10"/><circle cx="${x + w * 0.8}" cy="${y + h}" r="3" fill="#2b1a10"/>`
    } else
      out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${shapeColor}" stroke="#2f2518" stroke-width="2" filter="url(#shadow-${hash(map.seed)})"/>`
  } else if (item.type === 'fortress') {
    out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${r.color}" stroke="#252422" stroke-width="2"/>`
    for (let bx = x; bx < x + w; bx += 28)
      out += `<rect x="${bx}" y="${y}" width="14" height="${h * 0.55}" fill="#77736b"/>`
  }

  return out
}

// ---- label placement ----

function itemAnchor(item: TerrainItem, sx: number, sy: number): { x: number; y: number } {
  if (item.path && item.path.length) {
    const p = pointOnRoad(item, 0.5)
    return { x: p.x * sx, y: p.y * sy }
  }
  return { x: (item.x + item.w / 2) * sx, y: (item.y + item.h / 2) * sy }
}

type Rect = { x: number; y: number; w: number; h: number; leader?: boolean }

function itemBoundsPx(item: TerrainItem, sx: number, sy: number): Rect {
  if (item.path && item.path.length) {
    const xs = item.path.map((p) => p.x * sx)
    const ys = item.path.map((p) => p.y * sy)
    const pad = Math.max(10, (item.width || item.h || 3) * sy + 8)
    return {
      x: Math.min(...xs) - pad,
      y: Math.min(...ys) - pad,
      w: Math.max(...xs) - Math.min(...xs) + pad * 2,
      h: Math.max(...ys) - Math.min(...ys) + pad * 2,
    }
  }
  return { x: item.x * sx, y: item.y * sy, w: item.w * sx, h: item.h * sy }
}

function rectsOverlap(a: Rect, b: Rect, pad = 0): boolean {
  return !(
    a.x + a.w + pad < b.x ||
    b.x + b.w + pad < a.x ||
    a.y + a.h + pad < b.y ||
    b.y + b.h + pad < a.y
  )
}

function clampRectToMap(rect: Rect, vbW: number, vbH: number): Rect {
  return {
    x: Math.max(3, Math.min(rect.x, vbW - rect.w - 3)),
    y: Math.max(3, Math.min(rect.y, vbH - rect.h - 3)),
    w: rect.w,
    h: rect.h,
    leader: rect.leader,
  }
}

function labelCandidates(
  anchor: { x: number; y: number },
  label: string,
  itemBounds: Rect,
  vbW: number,
  vbH: number,
): Rect[] {
  const w = Math.max(28, label.length * 8.5 + 12)
  const h = 20
  const gap = 8
  const center: Rect = { x: anchor.x - w / 2, y: anchor.y - h / 2, w, h, leader: false }
  const positions: Rect[] = [
    center,
    { x: itemBounds.x + itemBounds.w + gap, y: anchor.y - h / 2, w, h, leader: true },
    { x: itemBounds.x - w - gap, y: anchor.y - h / 2, w, h, leader: true },
    { x: anchor.x - w / 2, y: itemBounds.y - h - gap, w, h, leader: true },
    { x: anchor.x - w / 2, y: itemBounds.y + itemBounds.h + gap, w, h, leader: true },
    { x: itemBounds.x + itemBounds.w + gap, y: itemBounds.y - h - gap, w, h, leader: true },
    { x: itemBounds.x - w - gap, y: itemBounds.y - h - gap, w, h, leader: true },
    {
      x: itemBounds.x + itemBounds.w + gap,
      y: itemBounds.y + itemBounds.h + gap,
      w,
      h,
      leader: true,
    },
    { x: itemBounds.x - w - gap, y: itemBounds.y + itemBounds.h + gap, w, h, leader: true },
  ]
  return positions.map((p) => clampRectToMap(p, vbW, vbH))
}

function drawReadableLabels(
  map: GeneratedMap,
  sx: number,
  sy: number,
  vbW: number,
  vbH: number,
): string {
  const occupied: Rect[] = []
  const terrainBounds = map.items.map((item) => ({ item, bounds: itemBoundsPx(item, sx, sy) }))
  const priority: Record<string, number> = {
    objective: 0,
    tower: 1,
    wagon: 2,
    crossing: 3,
    road: 4,
    river: 5,
    stream: 5,
  }
  const ordered = [...map.items].sort((a, b) => (priority[a.type] ?? 10) - (priority[b.type] ?? 10))
  let out = ''

  for (const item of ordered) {
    if (!item.label) continue
    const anchor = itemAnchor(item, sx, sy)
    const ownBounds = itemBoundsPx(item, sx, sy)
    const candidates = labelCandidates(anchor, item.label, ownBounds, vbW, vbH)
    let best = candidates[0]!
    let bestScore = Infinity

    for (const c of candidates) {
      const overlapsLabel = occupied.some((o) => rectsOverlap(c, o, 3))
      const overlapsTerrain = terrainBounds.some(
        (tb) => tb.item !== item && rectsOverlap(c, tb.bounds, 2),
      )
      const dx = c.x + c.w / 2 - anchor.x
      const dy = c.y + c.h / 2 - anchor.y
      const dist = Math.hypot(dx, dy)
      const score =
        (overlapsLabel ? 10000 : 0) + (overlapsTerrain ? 4500 : 0) + dist + (c.leader ? 18 : 0)
      if (score < bestScore) {
        bestScore = score
        best = c
      }
      if (!overlapsLabel && !overlapsTerrain) break
    }

    occupied.push(best)
    const textFill = ['road', 'stream', 'river', 'crossing'].includes(item.type)
      ? '#1d140c'
      : '#2a160b'
    const cx = best.x + best.w / 2
    const cy = best.y + best.h / 2
    if (best.leader) {
      out += `<line x1="${anchor.x}" y1="${anchor.y}" x2="${cx}" y2="${cy}" stroke="rgba(40,25,10,.55)" stroke-width="1" stroke-dasharray="3 3"/>`
    }
    out += `<rect x="${best.x}" y="${best.y}" width="${best.w}" height="${best.h}" rx="5" fill="rgba(255,244,216,.86)" stroke="rgba(55,35,15,.68)" stroke-width="1"/>`
    out += text(cx, cy + 5, item.label, 13, textFill, 'middle', 'bold')
  }
  return out
}

export function buildSvg(map: GeneratedMap, options: RenderOptions): string {
  const { table, dep } = map
  const vbW = 1000
  const vbH = Math.round((vbW * table.h) / table.w)
  const sx = vbW / table.w
  const sy = vbH / table.h
  const bg = THEMES[map.themeKey].bg
  const seedHash = hash(map.seed)
  const defs = `
    <defs>
      <pattern id="grid-${seedHash}" width="${10 * sx}" height="${10 * sy}" patternUnits="userSpaceOnUse">
        <path d="M ${10 * sx} 0 L 0 0 0 ${10 * sy}" fill="none" stroke="rgba(80,55,25,.25)" stroke-width="1"/>
      </pattern>
      <filter id="shadow-${seedHash}" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="1" dy="2" stdDeviation="1.2" flood-opacity="0.25"/></filter>
    </defs>`
  let svg = `<svg viewBox="0 0 ${vbW} ${vbH}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Warmaster battlefield map">${defs}`
  svg += `<rect x="0" y="0" width="${vbW}" height="${vbH}" fill="${bg}"/>`
  if (options.showGrid)
    svg += `<rect x="0" y="0" width="${vbW}" height="${vbH}" fill="url(#grid-${seedHash})"/>`
  svg += drawTenCmNumbers(map, sx, sy, vbW, vbH, options.showGrid)
  svg += `<rect x="0" y="0" width="${vbW}" height="${dep * sy}" fill="rgba(120,70,45,.16)" stroke="rgba(80,40,20,.35)" stroke-dasharray="8 6"/>`
  svg += `<rect x="0" y="${(table.h - dep) * sy}" width="${vbW}" height="${dep * sy}" fill="rgba(120,70,45,.16)" stroke="rgba(80,40,20,.35)" stroke-dasharray="8 6"/>`
  svg += text(8, dep * sy - 8, `Deployment ${dep}cm`, 15, '#56351d', 'start')
  svg += text(8, (table.h - dep) * sy + 20, `Deployment ${dep}cm`, 15, '#56351d', 'start')
  svg += drawMissionGuides(map, sx, sy, vbW, vbH)
  svg += drawObjectiveValidation(map, sx, sy, vbW, vbH, options.showObjectiveOverlay)
  for (const item of map.items) svg += drawItem(item, map, sx, sy, vbW, vbH)
  svg += drawReadableLabels(map, sx, sy, vbW, vbH)
  svg += `<rect x="0" y="0" width="${vbW}" height="${vbH}" fill="none" stroke="#3c2a16" stroke-width="4"/>`
  svg += scaleBar(table, sx, sy, vbH)
  svg += `</svg>`
  return svg
}
