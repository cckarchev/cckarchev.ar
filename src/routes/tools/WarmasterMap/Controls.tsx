import type { ChangeEvent } from 'react'
import type {
  Density,
  GenerationConfig,
  MissionKey,
  PdfMode,
  PlayStyle,
  RenderOptions,
  ThemeKey,
  WaterRarity,
} from './types'

type Props = {
  config: GenerationConfig
  renderOptions: RenderOptions
  pdfMode: PdfMode
  exporting: boolean
  onConfigChange: (patch: Partial<GenerationConfig>) => void
  onRenderOptionsChange: (patch: Partial<RenderOptions>) => void
  onPdfModeChange: (mode: PdfMode) => void
  onGenerate: () => void
  onReroll: () => void
  onExportPdf: () => void
}

const TABLE_SIZES: Array<{ value: string; label: string }> = [
  { value: '90x90', label: '90 × 90 cm / 3 × 3 ft' },
  { value: '120x120', label: '120 × 120 cm / 4 × 4 ft' },
  { value: '150x120', label: '120 × 150 cm / 4 × 5 ft' },
  { value: '180x120', label: '120 × 180 cm / 4 × 6 ft' },
]

const THEME_OPTIONS: Array<{ value: ThemeKey; label: string }> = [
  { value: 'imperial', label: 'Imperial / Human lands' },
  { value: 'wildlands', label: 'Forest / Wildlands' },
  { value: 'chaos', label: 'Chaos lands' },
  { value: 'jungle', label: 'Jungle / Lustria' },
  { value: 'desert', label: 'Desert / Araby / Nehekhara' },
]

const MISSION_OPTIONS: Array<{ value: MissionKey; label: string }> = [
  { value: 'agnostic', label: 'Mission agnostic / Pitched battle' },
  { value: 'takeHold', label: 'Take and Hold' },
  { value: 'tower', label: 'Battle for the Tower' },
  { value: 'village', label: 'Defending the Village' },
  { value: 'wagon', label: 'Wagon Train' },
  { value: 'breach', label: 'Siege: Into the Breach' },
  { value: 'watchtower', label: 'Siege: The Watchtower' },
]

const DENSITY_OPTIONS: Array<{ value: Density; label: string }> = [
  { value: 'light', label: 'Light' },
  { value: 'standard', label: 'Standard' },
  { value: 'dense', label: 'Dense' },
]

const PLAY_STYLE_OPTIONS: Array<{ value: PlayStyle; label: string }> = [
  { value: 'clear', label: 'Battle report / clear play' },
  { value: 'competitive', label: 'Tournament / competitive' },
  { value: 'narrative', label: 'Narrative / scenic' },
]

const WATER_OPTIONS: Array<{ value: WaterRarity; label: string }> = [
  { value: 'rare', label: 'Rare / only when useful' },
  { value: 'normal', label: 'Normal' },
  { value: 'none', label: 'No rivers or streams' },
  { value: 'scenic', label: 'Scenic / more likely' },
]

const PDF_MODE_OPTIONS: Array<{ value: PdfMode; label: string }> = [
  { value: 'onePage', label: 'Put all maps on one PDF page if possible' },
  { value: 'separate', label: 'Each map on a separate PDF page' },
]

export default function Controls({
  config,
  renderOptions,
  pdfMode,
  exporting,
  onConfigChange,
  onRenderOptionsChange,
  onPdfModeChange,
  onGenerate,
  onReroll,
  onExportPdf,
}: Props) {
  const handleMapsCount = (e: ChangeEvent<HTMLInputElement>) => {
    const n = Number(e.target.value)
    onConfigChange({ mapsCount: Math.max(1, Math.min(12, isNaN(n) ? 1 : n)) })
  }

  return (
    <section className="panel controls">
      <div className="panel-head">
        <h2>Battlefield Setup</h2>
      </div>
      <div className="panel-body">
        <label htmlFor="tableSize">Table size</label>
        <select
          id="tableSize"
          value={config.tableSize}
          onChange={(e) => onConfigChange({ tableSize: e.target.value })}
        >
          {TABLE_SIZES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <label htmlFor="theme">Theme</label>
        <select
          id="theme"
          value={config.theme}
          onChange={(e) => onConfigChange({ theme: e.target.value as ThemeKey })}
        >
          {THEME_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <label htmlFor="mission">Mission</label>
        <select
          id="mission"
          value={config.mission}
          onChange={(e) => onConfigChange({ mission: e.target.value as MissionKey })}
        >
          {MISSION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <div className="row">
          <div>
            <label htmlFor="density">Terrain density</label>
            <select
              id="density"
              value={config.density}
              onChange={(e) => onConfigChange({ density: e.target.value as Density })}
            >
              {DENSITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="mapsCount">Maps</label>
            <input
              id="mapsCount"
              type="number"
              min={1}
              max={12}
              value={config.mapsCount}
              onChange={handleMapsCount}
            />
          </div>
        </div>

        <label htmlFor="playStyle">Table style</label>
        <select
          id="playStyle"
          value={config.playStyle}
          onChange={(e) => onConfigChange({ playStyle: e.target.value as PlayStyle })}
        >
          {PLAY_STYLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <label htmlFor="waterRarity">Water features</label>
        <select
          id="waterRarity"
          value={config.waterRarity}
          onChange={(e) => onConfigChange({ waterRarity: e.target.value as WaterRarity })}
        >
          {WATER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <label htmlFor="seed">Seed</label>
        <input
          id="seed"
          type="text"
          placeholder="Leave empty for random"
          value={config.seed}
          onChange={(e) => onConfigChange({ seed: e.target.value })}
        />

        <div className="checkbox-row">
          <input
            id="fairMode"
            type="checkbox"
            checked={config.fairMode}
            onChange={(e) => onConfigChange({ fairMode: e.target.checked })}
          />
          <label htmlFor="fairMode">
            <strong>Competitive balance mode:</strong> uses semi-symmetrical placement, preserves cavalry
            lanes, avoids deployment traps, and applies mission exclusion zones.
          </label>
        </div>

        <div className="checkbox-row">
          <input
            id="showGrid"
            type="checkbox"
            checked={renderOptions.showGrid}
            onChange={(e) => onRenderOptionsChange({ showGrid: e.target.checked })}
          />
          <label htmlFor="showGrid">Show 10 cm grid and scale marks.</label>
        </div>

        <div className="checkbox-row">
          <input
            id="showObjectiveOverlay"
            type="checkbox"
            checked={renderOptions.showObjectiveOverlay}
            onChange={(e) => onRenderOptionsChange({ showObjectiveOverlay: e.target.checked })}
          />
          <label htmlFor="showObjectiveOverlay">
            Show objective validation overlay when relevant: 10 cm grid, objective zones, 5 cm terrain
            buffer and 30 cm spacing guides.
          </label>
        </div>

        <div className="button-grid">
          <button type="button" onClick={onGenerate}>
            Generate
          </button>
          <button type="button" className="secondary" onClick={onReroll}>
            Reroll Seed
          </button>
        </div>

        <div className="export-tools">
          <label htmlFor="pdfMode">PDF export mode</label>
          <select id="pdfMode" value={pdfMode} onChange={(e) => onPdfModeChange(e.target.value as PdfMode)}>
            {PDF_MODE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button type="button" onClick={onExportPdf} disabled={exporting}>
            {exporting ? 'Exporting…' : 'Export PDF'}
          </button>
        </div>

        <div className="small-note">
          Terrain uses Warmaster Revolution assumptions: clear footprints first, rules tags second. The
          default style follows clean battle-report logic: readable terrain, preserved battlelines, subtle
          roads, rare water, and objectives validated against the 10 cm grid.
        </div>
      </div>
    </section>
  )
}
