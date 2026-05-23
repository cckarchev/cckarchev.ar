import { useCallback, useEffect, useRef, useState } from 'react'
import ControlsForm from './ControlsForm'
import UnitCard from './UnitCard'
import PrintSheet from './PrintSheet'
import { slugifyName } from './card-logic'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import './greathelm.css'
import type { CardData, SavedCard, SelectionKey } from './types'

const INITIAL_DATA: CardData = {
  name: '',
  armor: 'heavy-armor',
  loadout: 'one-free',
  shieldType: 'heater',
  weaponA: 'arming-sword',
  weaponB: 'hand-ax',
  selections: {
    worn: '',
    use: '',
    consumable: '',
    weaponUpgrade: '',
    armorUpgrade: '',
    legendaryWorn: '',
    legendaryUse: '',
    legendaryArmor: '',
    legendaryWeaponUpgrade: '',
  },
  showHearts: false,
  unitType: 'foot',
  cardSize: 'tarot',
}

export default function GreathelmCards() {
  useDocumentTitle('Greathelm')

  const [data, setData] = useState<CardData>(INITIAL_DATA)
  const [savedCards, setSavedCards] = useState<SavedCard[]>([])
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const cardRef = useRef<HTMLElement>(null)
  const previewAreaRef = useRef<HTMLDivElement>(null)
  const scaleWrapperRef = useRef<HTMLDivElement>(null)

  const recalcScale = useCallback(() => {
    if (!cardRef.current || !previewAreaRef.current || !scaleWrapperRef.current) return

    scaleWrapperRef.current.style.setProperty('--preview-scale', '1')
    const cardBox = cardRef.current.getBoundingClientRect()
    const availableWidth = Math.max(280, previewAreaRef.current.clientWidth - 24)
    const preferredScale = window.innerWidth > 1200 ? 1.55 : window.innerWidth > 800 ? 1.25 : 1
    const scale = Math.max(0.55, Math.min(preferredScale, availableWidth / cardBox.width))

    scaleWrapperRef.current.style.setProperty('--preview-scale', String(scale))
    previewAreaRef.current.style.minHeight = `${cardBox.height * scale + 44}px`
  }, [])

  // Recalculate on mount, when card dimensions change, when portrait loads,
  // and on window resize.
  useEffect(() => {
    recalcScale()
    window.addEventListener('resize', recalcScale)
    return () => window.removeEventListener('resize', recalcScale)
  }, [recalcScale, data.cardSize, portraitUrl])

  const handleChange = useCallback((patch: Partial<CardData>) => {
    setData((prev) => ({ ...prev, ...patch }))
  }, [])

  const handleSelectionChange = useCallback((key: SelectionKey, value: string) => {
    setData((prev) => ({
      ...prev,
      selections: { ...prev.selections, [key]: value },
    }))
  }, [])

  const handleImageChange = useCallback((file: File | null) => {
    if (!file) return
    // Object URLs are intentionally not revoked: saved cards still reference
    // earlier URLs, and the browser reclaims them on page unload anyway.
    setPortraitUrl(URL.createObjectURL(file))
  }, [])

  const handleAddToSheet = useCallback(() => {
    setSavedCards((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        data: { ...data, selections: { ...data.selections } },
        portraitUrl,
      },
    ])
  }, [data, portraitUrl])

  const handleClearSheet = useCallback(() => {
    setSavedCards([])
  }, [])

  const handleExportPng = useCallback(async () => {
    if (!cardRef.current || exporting) return
    setExporting(true)
    try {
      const { default: html2canvas } = await import('html2canvas')

      if (document.fonts?.ready) await document.fonts.ready
      const portraitImage = cardRef.current.querySelector<HTMLImageElement>('.portrait-image')
      if (portraitImage?.decode) {
        try {
          await portraitImage.decode()
        } catch {
          // Image may already be ready or the decode API may not be available;
          // proceed with capture regardless.
        }
      }

      // Clone the card off-screen at natural size (no preview scale) so the
      // capture is rendered at 4x crisp resolution.
      const clone = cardRef.current.cloneNode(true) as HTMLElement
      clone.style.transform = 'none'
      clone.style.boxShadow = 'none'

      const host = document.createElement('div')
      Object.assign(host.style, {
        position: 'fixed',
        left: '-10000px',
        top: '0',
        background: 'transparent',
        zIndex: '-1',
      })
      host.appendChild(clone)
      document.body.appendChild(host)

      try {
        await new Promise((resolve) => requestAnimationFrame(resolve))

        const canvas = await html2canvas(clone, {
          scale: 4,
          backgroundColor: null,
          useCORS: true,
          logging: false,
        })

        const link = document.createElement('a')
        link.download = `${slugifyName(data.name)}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      } finally {
        document.body.removeChild(host)
      }
    } finally {
      setExporting(false)
    }
  }, [data.name, exporting])

  return (
    <div className="greathelm-route">
      <ControlsForm
        data={data}
        onChange={handleChange}
        onSelectionChange={handleSelectionChange}
        onImageChange={handleImageChange}
        onAddToSheet={handleAddToSheet}
        onExportPng={handleExportPng}
        onClearSheet={handleClearSheet}
        exporting={exporting}
      />

      <main className="workspace">
        <div className="preview-area" ref={previewAreaRef}>
          <div className="preview-scale" ref={scaleWrapperRef}>
            <UnitCard data={data} portraitUrl={portraitUrl} ref={cardRef} />
          </div>
        </div>

        <PrintSheet cards={savedCards} />
      </main>
    </div>
  )
}
