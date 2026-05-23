export type TerrainType =
  | 'hill'
  | 'wood'
  | 'denseForest'
  | 'rough'
  | 'marsh'
  | 'village'
  | 'ruin'
  | 'river'
  | 'stream'
  | 'crossing'
  | 'lake'
  | 'road'
  | 'obstacle'
  | 'impassable'
  | 'objective'
  | 'tower'
  | 'wagon'
  | 'fortress'

export type ThemeKey = 'imperial' | 'wildlands' | 'chaos' | 'jungle' | 'desert'

export type MissionKey =
  | 'agnostic'
  | 'takeHold'
  | 'tower'
  | 'village'
  | 'wagon'
  | 'breach'
  | 'watchtower'

export type Density = 'light' | 'standard' | 'dense'
export type PlayStyle = 'clear' | 'competitive' | 'narrative'
export type WaterRarity = 'rare' | 'normal' | 'none' | 'scenic'
export type PdfMode = 'onePage' | 'separate'

export type Point = { x: number; y: number }

export type ObstacleSegment = { x1: number; y1: number; x2: number; y2: number }

export type TerrainItem = {
  type: TerrainType
  x: number
  y: number
  w: number
  h: number
  angle?: number
  label?: string
  path?: Point[]
  segments?: ObstacleSegment[]
  pattern?: string
  width?: number
  waterPath?: 'horizontal' | 'vertical'
  lakeSource?: boolean
  zone?: 'A' | 'B'
}

export type TableSize = { w: number; h: number }

export type GeneratedMap = {
  seed: string
  table: TableSize
  themeKey: ThemeKey
  missionKey: MissionKey
  density: Density
  playStyle: PlayStyle
  waterRarity: WaterRarity
  fairMode: boolean
  dep: number
  items: TerrainItem[]
  objectives: TerrainItem[]
  title: string
  themeLabel: string
}

export type GenerationConfig = {
  tableSize: string
  theme: ThemeKey
  mission: MissionKey
  density: Density
  playStyle: PlayStyle
  waterRarity: WaterRarity
  fairMode: boolean
  mapsCount: number
  seed: string
}

export type RenderOptions = {
  showGrid: boolean
  showObjectiveOverlay: boolean
}

export type TerrainRule = {
  name: string
  color: string
  tags: string[]
  rules: string
}

export type Theme = {
  label: string
  bg: string
  palette: TerrainType[]
  required: TerrainType[]
}

export type Mission = {
  label: string
  note: string
}
