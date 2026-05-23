import { useMemo, type Ref } from 'react'
import { fairPlaySummary, shortSeed, sideChoiceSummary } from './summaries'
import { buildSvg } from './svg'
import { MISSIONS, TERRAIN_RULES } from './terrain'
import type { GeneratedMap, RenderOptions, TerrainType } from './types'

type Props = {
  map: GeneratedMap
  renderOptions: RenderOptions
  ref?: Ref<HTMLElement>
}

export default function MapCard({ map, renderOptions, ref }: Props) {
  const svgHtml = useMemo(() => buildSvg(map, renderOptions), [map, renderOptions])
  const usedTypes = useMemo(() => [...new Set(map.items.map((i) => i.type))], [map.items])
  const fairPlay = useMemo(() => fairPlaySummary(map), [map])
  const sideChoice = useMemo(() => sideChoiceSummary(map), [map])
  const scenarioNote = MISSIONS[map.missionKey].note

  return (
    <article ref={ref} className="map-card">
      <div className="map-card-header">
        <div>
          <div className="map-title">{map.title}</div>
          <div className="footer-note">
            {map.themeLabel} · {map.table.w} × {map.table.h} cm · {map.density} density
          </div>
        </div>
        <div className="map-meta">
          Seed:
          <br />
          {shortSeed(map.seed)}
          <br />
          Deployment: {map.dep} cm each side
        </div>
      </div>
      <div className="map-body">
        <div className="svg-shell" dangerouslySetInnerHTML={{ __html: svgHtml }} />
        <div>
          <div className="legend-box">
            <h3>Terrain Reference</h3>
            <div className="legend-list">
              {usedTypes.map((t) => (
                <LegendItem key={t} type={t} map={map} />
              ))}
            </div>
          </div>
          <div className="scenario-note">
            <strong>Scenario note:</strong> {scenarioNote}
          </div>
          <div className="scenario-note">
            <strong>Fair-play checks:</strong> {fairPlay}
          </div>
          <div className="scenario-note">
            <strong>Side choice:</strong> {sideChoice}
          </div>
        </div>
      </div>
    </article>
  )
}

function LegendItem({ type, map }: { type: TerrainType; map: GeneratedMap }) {
  const r = TERRAIN_RULES[type]
  const codes = map.items
    .filter((i) => i.type === type)
    .map((i) => i.label)
    .filter(Boolean)
    .join(', ')
  return (
    <div className="terrain-item">
      <span className="swatch" style={{ background: r.color }} />
      <div>
        <strong>{r.name}</strong> <span className="codes">({codes})</span>
        <br />
        {r.rules}
        <br />
        {r.tags.map((t) => (
          <span key={t} className="tag">
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}
