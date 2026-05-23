import { useCallback, useRef, useState } from 'react'
import Controls from './Controls'
import MapCard from './MapCard'
import { generateMap, generateNewBaseSeed } from './map-generator'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import './warmaster.css'
import type { GeneratedMap, GenerationConfig, PdfMode, RenderOptions } from './types'

const INITIAL_CONFIG: GenerationConfig = {
  tableSize: '180x120',
  theme: 'imperial',
  mission: 'agnostic',
  density: 'standard',
  playStyle: 'clear',
  waterRarity: 'rare',
  fairMode: true,
  mapsCount: 1,
  seed: '',
}

const INITIAL_RENDER_OPTIONS: RenderOptions = {
  showGrid: true,
  showObjectiveOverlay: true,
}

// Build the initial state once at mount via lazy useState initializers, so the
// first render already has a seeded config + a generated map. This avoids the
// useEffect-then-setState pattern (which triggers cascading renders).
function makeInitialConfig(): GenerationConfig {
  return { ...INITIAL_CONFIG, seed: generateNewBaseSeed() }
}

function makeInitialMaps(config: GenerationConfig): GeneratedMap[] {
  return Array.from({ length: config.mapsCount }, (_, i) => generateMap(config, i + 1, config.seed))
}

export default function WarmasterMap() {
  useDocumentTitle('Warmaster')

  const [config, setConfig] = useState<GenerationConfig>(makeInitialConfig)
  const [renderOptions, setRenderOptions] = useState<RenderOptions>(INITIAL_RENDER_OPTIONS)
  const [pdfMode, setPdfMode] = useState<PdfMode>('onePage')
  const [maps, setMaps] = useState<GeneratedMap[]>(() => makeInitialMaps(config))
  const [exporting, setExporting] = useState(false)

  const mapCardRefs = useRef<(HTMLElement | null)[]>([])

  // Build a fresh maps array from the given config + baseSeed.
  const generate = useCallback((cfg: GenerationConfig, baseSeed: string) => {
    const next = Array.from({ length: cfg.mapsCount }, (_, i) => generateMap(cfg, i + 1, baseSeed))
    setMaps(next)
  }, [])

  const handleGenerate = useCallback(() => {
    const baseSeed = config.seed.trim() || generateNewBaseSeed()
    if (baseSeed !== config.seed) setConfig((prev) => ({ ...prev, seed: baseSeed }))
    generate(config, baseSeed)
  }, [config, generate])

  const handleReroll = useCallback(() => {
    const fresh = generateNewBaseSeed()
    setConfig((prev) => ({ ...prev, seed: fresh }))
    generate({ ...config, seed: fresh }, fresh)
  }, [config, generate])

  const handleConfigChange = useCallback((patch: Partial<GenerationConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }))
  }, [])

  const handleRenderOptionsChange = useCallback((patch: Partial<RenderOptions>) => {
    setRenderOptions((prev) => ({ ...prev, ...patch }))
  }, [])

  const handleExportPdf = useCallback(async () => {
    if (exporting) return
    if (!maps.length) {
      // Match original behavior: generate first if nothing to export.
      handleGenerate()
      return
    }
    setExporting(true)
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const margin = 7

      const cards = mapCardRefs.current.filter((el): el is HTMLElement => el !== null)

      if (pdfMode === 'separate') {
        for (const [i, card] of cards.entries()) {
          if (i > 0) pdf.addPage()
          const canvas = await html2canvas(card, {
            scale: 2,
            backgroundColor: '#f3ead5',
            useCORS: true,
          })
          const img = canvas.toDataURL('image/jpeg', 0.95)
          const ratio = Math.min(
            (pageW - margin * 2) / canvas.width,
            (pageH - margin * 2) / canvas.height,
          )
          const w = canvas.width * ratio
          const h = canvas.height * ratio
          pdf.addImage(img, 'JPEG', (pageW - w) / 2, (pageH - h) / 2, w, h)
        }
      } else {
        const perRow = cards.length <= 2 ? cards.length : 2
        const rows = Math.ceil(cards.length / perRow)
        const cellW = (pageW - margin * 2) / perRow
        const cellH = (pageH - margin * 2) / rows
        for (const [i, card] of cards.entries()) {
          const canvas = await html2canvas(card, {
            scale: 1.5,
            backgroundColor: '#f3ead5',
            useCORS: true,
          })
          const img = canvas.toDataURL('image/jpeg', 0.9)
          const col = i % perRow
          const row = Math.floor(i / perRow)
          const ratio = Math.min((cellW - 3) / canvas.width, (cellH - 3) / canvas.height)
          const w = canvas.width * ratio
          const h = canvas.height * ratio
          const x = margin + col * cellW + (cellW - w) / 2
          const y = margin + row * cellH + (cellH - h) / 2
          pdf.addImage(img, 'JPEG', x, y, w, h)
        }
      }

      const stamp = new Date().toISOString().slice(0, 10)
      pdf.save(`warmaster-maps-${stamp}.pdf`)
    } finally {
      setExporting(false)
    }
  }, [exporting, maps.length, pdfMode, handleGenerate])

  return (
    <div className="warmaster-route">
      <header>
        <h1>Warmaster Map Generator</h1>
        <div className="subtitle">
          Rule-aware 2D battlefield generator for Warmaster Revolution. Generates fair, readable Old
          World battlefields with clear footprints, mission markers, deployment zones, water
          crossings, and a printable terrain reference.
        </div>
      </header>

      <main>
        <Controls
          config={config}
          renderOptions={renderOptions}
          pdfMode={pdfMode}
          exporting={exporting}
          onConfigChange={handleConfigChange}
          onRenderOptionsChange={handleRenderOptionsChange}
          onPdfModeChange={setPdfMode}
          onGenerate={handleGenerate}
          onReroll={handleReroll}
          onExportPdf={handleExportPdf}
        />

        <section className="maps-wrap">
          {maps.map((map, i) => (
            <MapCard
              key={map.seed}
              map={map}
              renderOptions={renderOptions}
              ref={(el) => {
                mapCardRefs.current[i] = el
              }}
            />
          ))}
        </section>
      </main>
    </div>
  )
}
