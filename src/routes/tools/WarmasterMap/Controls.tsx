import type { ChangeEvent } from 'react'
import {
  Button,
  CheckboxRow,
  FormLabel,
  Panel,
  PanelBody,
  PanelHead,
  Row,
  Select,
  TextInput,
} from '../../../components/ui'
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

const TABLE_SIZES: { value: string; label: string }[] = [
  { value: '90x90', label: '90 × 90 cm / 3 × 3 ft' },
  { value: '120x120', label: '120 × 120 cm / 4 × 4 ft' },
  { value: '150x120', label: '120 × 150 cm / 4 × 5 ft' },
  { value: '180x120', label: '120 × 180 cm / 4 × 6 ft' },
]

const THEME_OPTIONS: { value: ThemeKey; label: string }[] = [
  { value: 'imperial', label: 'Imperial / Human lands' },
  { value: 'wildlands', label: 'Forest / Wildlands' },
  { value: 'chaos', label: 'Chaos lands' },
  { value: 'jungle', label: 'Jungle / Lustria' },
  { value: 'desert', label: 'Desert / Araby / Nehekhara' },
]

const MISSION_OPTIONS: { value: MissionKey; label: string }[] = [
  { value: 'agnostic', label: 'Mission agnostic / Pitched battle' },
  { value: 'takeHold', label: 'Take and Hold' },
  { value: 'tower', label: 'Battle for the Tower' },
  { value: 'village', label: 'Defending the Village' },
  { value: 'wagon', label: 'Wagon Train' },
  { value: 'breach', label: 'Siege: Into the Breach' },
  { value: 'watchtower', label: 'Siege: The Watchtower' },
]

const DENSITY_OPTIONS: { value: Density; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'standard', label: 'Standard' },
  { value: 'dense', label: 'Dense' },
]

const PLAY_STYLE_OPTIONS: { value: PlayStyle; label: string }[] = [
  { value: 'clear', label: 'Battle report / clear play' },
  { value: 'competitive', label: 'Tournament / competitive' },
  { value: 'narrative', label: 'Narrative / scenic' },
]

const WATER_OPTIONS: { value: WaterRarity; label: string }[] = [
  { value: 'rare', label: 'Rare / only when useful' },
  { value: 'normal', label: 'Normal' },
  { value: 'none', label: 'No rivers or streams' },
  { value: 'scenic', label: 'Scenic / more likely' },
]

const PDF_MODE_OPTIONS: { value: PdfMode; label: string }[] = [
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
    <Panel sticky>
      <PanelHead>Battlefield Setup</PanelHead>
      <PanelBody>
        <FormLabel htmlFor="tableSize">Table size</FormLabel>
        <Select
          id="tableSize"
          value={config.tableSize}
          onChange={(e) => onConfigChange({ tableSize: e.target.value })}
        >
          {TABLE_SIZES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>

        <FormLabel htmlFor="theme">Theme</FormLabel>
        <Select
          id="theme"
          value={config.theme}
          onChange={(e) => onConfigChange({ theme: e.target.value as ThemeKey })}
        >
          {THEME_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>

        <FormLabel htmlFor="mission">Mission</FormLabel>
        <Select
          id="mission"
          value={config.mission}
          onChange={(e) => onConfigChange({ mission: e.target.value as MissionKey })}
        >
          {MISSION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>

        <Row>
          <div>
            <FormLabel htmlFor="density">Terrain density</FormLabel>
            <Select
              id="density"
              value={config.density}
              onChange={(e) => onConfigChange({ density: e.target.value as Density })}
            >
              {DENSITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <FormLabel htmlFor="mapsCount">Maps</FormLabel>
            <TextInput
              id="mapsCount"
              type="number"
              min={1}
              max={12}
              value={config.mapsCount}
              onChange={handleMapsCount}
            />
          </div>
        </Row>

        <FormLabel htmlFor="playStyle">Table style</FormLabel>
        <Select
          id="playStyle"
          value={config.playStyle}
          onChange={(e) => onConfigChange({ playStyle: e.target.value as PlayStyle })}
        >
          {PLAY_STYLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>

        <FormLabel htmlFor="waterRarity">Water features</FormLabel>
        <Select
          id="waterRarity"
          value={config.waterRarity}
          onChange={(e) => onConfigChange({ waterRarity: e.target.value as WaterRarity })}
        >
          {WATER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>

        <FormLabel htmlFor="seed">Seed</FormLabel>
        <TextInput
          id="seed"
          type="text"
          placeholder="Leave empty for random"
          value={config.seed}
          onChange={(e) => onConfigChange({ seed: e.target.value })}
        />

        <CheckboxRow checked={config.fairMode} onChange={(v) => onConfigChange({ fairMode: v })}>
          <strong>Competitive balance mode:</strong> uses semi-symmetrical placement, preserves
          cavalry lanes, avoids deployment traps, and applies mission exclusion zones.
        </CheckboxRow>

        <CheckboxRow
          checked={renderOptions.showGrid}
          onChange={(v) => onRenderOptionsChange({ showGrid: v })}
        >
          Show 10 cm grid and scale marks.
        </CheckboxRow>

        <CheckboxRow
          checked={renderOptions.showObjectiveOverlay}
          onChange={(v) => onRenderOptionsChange({ showObjectiveOverlay: v })}
        >
          Show objective validation overlay when relevant: 10 cm grid, objective zones, 5 cm terrain
          buffer and 30 cm spacing guides.
        </CheckboxRow>

        <Row className="mt-4">
          <Button onClick={onGenerate}>Generate</Button>
          <Button variant="secondary" onClick={onReroll}>
            Reroll Seed
          </Button>
        </Row>

        <div className="mt-3 grid gap-2.5 border-t border-line pt-3">
          <FormLabel htmlFor="pdfMode">PDF export mode</FormLabel>
          <Select
            id="pdfMode"
            value={pdfMode}
            onChange={(e) => onPdfModeChange(e.target.value as PdfMode)}
          >
            {PDF_MODE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <Button onClick={onExportPdf} disabled={exporting}>
            {exporting ? 'Exporting…' : 'Export PDF'}
          </Button>
        </div>

        <p className="mt-3 text-xs leading-snug text-muted">
          Terrain uses Warmaster Revolution assumptions: clear footprints first, rules tags second.
          The default style follows clean battle-report logic: readable terrain, preserved
          battlelines, subtle roads, rare water, and objectives validated against the 10 cm grid.
        </p>
      </PanelBody>
    </Panel>
  )
}
