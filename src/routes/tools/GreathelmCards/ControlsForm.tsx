import type { ChangeEvent } from 'react'
import { catalog } from './equipment'
import { getLoadout } from './card-logic'
import type {
  CardData,
  CardSize,
  LoadoutKind,
  SelectionKey,
  UnitType,
} from './types'

type Props = {
  data: CardData
  onChange: (patch: Partial<CardData>) => void
  onSelectionChange: (key: SelectionKey, value: string) => void
  onImageChange: (file: File | null) => void
  onAddToSheet: () => void
  onExportPng: () => void
  onClearSheet: () => void
  exporting?: boolean
}

const LOADOUT_OPTIONS: Array<{ value: LoadoutKind; label: string }> = [
  { value: 'one-free', label: 'One hand weapon + free hand' },
  { value: 'one-shield', label: 'One hand weapon + shield' },
  { value: 'two-handed', label: 'One two-handed weapon' },
  { value: 'dual-same', label: 'Two of the same one hand weapon' },
  { value: 'dual-different', label: 'Two different one hand weapons' },
]

const UNIT_TYPE_OPTIONS: Array<{ value: UnitType; label: string }> = [
  { value: 'foot', label: 'On foot — 3 hearts' },
  { value: 'mounted', label: 'Mounted — 6 hearts' },
]

const CARD_SIZE_OPTIONS: Array<{ value: CardSize; label: string }> = [
  { value: 'tarot', label: 'Tarot — 12 cm × 7 cm' },
  { value: 'poker', label: 'Poker — 8.89 cm × 6.35 cm' },
]

export default function ControlsForm({
  data,
  onChange,
  onSelectionChange,
  onImageChange,
  onAddToSheet,
  onExportPng,
  onClearSheet,
  exporting,
}: Props) {
  const loadout = getLoadout(data)
  const usesShield = data.loadout === 'one-shield'
  const usesSecondWeapon = data.loadout === 'dual-different'
  const weaponOptions =
    data.loadout === 'two-handed' ? catalog.twoHanded : catalog.oneHanded

  const handleLoadoutChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newLoadout = e.target.value as LoadoutKind
    const nextOptions =
      newLoadout === 'two-handed' ? catalog.twoHanded : catalog.oneHanded
    const weaponAStillValid = nextOptions.some((item) => item.id === data.weaponA)
    onChange({
      loadout: newLoadout,
      weaponA: weaponAStillValid ? data.weaponA : nextOptions[0]!.id,
    })
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    onImageChange(file)
  }

  return (
    <form className="controls" onSubmit={(e) => e.preventDefault()}>
      <h1>Greathelm Card Generator</h1>

      <label className="control-label" htmlFor="unitName">
        Name
      </label>
      <input
        id="unitName"
        type="text"
        placeholder="Leave empty for handwriting"
        value={data.name}
        onChange={(e) => onChange({ name: e.target.value })}
      />

      <label className="control-label" htmlFor="armorSelect">
        Armor
      </label>
      <ItemSelect
        id="armorSelect"
        items={catalog.armor}
        value={data.armor}
        onChange={(value) => onChange({ armor: value })}
      />

      <label className="control-label" htmlFor="weaponLoadout">
        Weapon loadout
      </label>
      <select id="weaponLoadout" value={data.loadout} onChange={handleLoadoutChange}>
        {LOADOUT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {usesShield && (
        <div>
          <label className="control-label" htmlFor="shieldType">
            Shield type
          </label>
          <ItemSelect
            id="shieldType"
            items={catalog.shields}
            value={data.shieldType}
            onChange={(value) => onChange({ shieldType: value })}
          />
        </div>
      )}

      <div className="control-grid">
        <div>
          <label className="control-label" htmlFor="weaponPrimary">
            Weapon 1
          </label>
          <ItemSelect
            id="weaponPrimary"
            items={weaponOptions}
            value={data.weaponA}
            onChange={(value) => onChange({ weaponA: value })}
          />
        </div>
        {usesSecondWeapon && (
          <div>
            <label className="control-label" htmlFor="weaponSecondary">
              Weapon 2
            </label>
            <ItemSelect
              id="weaponSecondary"
              items={catalog.oneHanded}
              value={data.weaponB}
              onChange={(value) => onChange({ weaponB: value })}
            />
          </div>
        )}
      </div>
      <p className="control-note">{loadout.note}</p>

      <SelectionRow
        id="wornItem"
        label="Worn item"
        items={catalog.items.worn}
        value={data.selections.worn}
        onChange={(v) => onSelectionChange('worn', v)}
      />
      <SelectionRow
        id="useItem"
        label="Use item"
        items={catalog.items.use}
        value={data.selections.use}
        onChange={(v) => onSelectionChange('use', v)}
      />
      <SelectionRow
        id="consumableItem"
        label="Consumable item"
        items={catalog.items.consumable}
        value={data.selections.consumable}
        onChange={(v) => onSelectionChange('consumable', v)}
      />
      <SelectionRow
        id="weaponUpgrade"
        label="Weapon upgrade"
        items={catalog.items.weaponUpgrade}
        value={data.selections.weaponUpgrade}
        onChange={(v) => onSelectionChange('weaponUpgrade', v)}
      />
      <SelectionRow
        id="armorUpgrade"
        label="Armor upgrade"
        items={catalog.items.armorUpgrade}
        value={data.selections.armorUpgrade}
        onChange={(v) => onSelectionChange('armorUpgrade', v)}
      />
      <SelectionRow
        id="legendaryWorn"
        label="Legendary worn item"
        items={catalog.items.legendaryWorn}
        value={data.selections.legendaryWorn}
        onChange={(v) => onSelectionChange('legendaryWorn', v)}
      />
      <SelectionRow
        id="legendaryUse"
        label="Legendary use item"
        items={catalog.items.legendaryUse}
        value={data.selections.legendaryUse}
        onChange={(v) => onSelectionChange('legendaryUse', v)}
      />
      <SelectionRow
        id="legendaryArmor"
        label="Legendary armor"
        items={catalog.items.legendaryArmor}
        value={data.selections.legendaryArmor}
        onChange={(v) => onSelectionChange('legendaryArmor', v)}
      />
      <SelectionRow
        id="legendaryWeaponUpgrade"
        label="Legendary weapon upgrade"
        items={catalog.items.legendaryWeaponUpgrade}
        value={data.selections.legendaryWeaponUpgrade}
        onChange={(v) => onSelectionChange('legendaryWeaponUpgrade', v)}
      />

      <div className="check-row">
        <input
          id="showHearts"
          type="checkbox"
          checked={data.showHearts}
          onChange={(e) => onChange({ showHearts: e.target.checked })}
        />
        <label htmlFor="showHearts">Show hearts</label>
      </div>

      <label className="control-label" htmlFor="unitType">
        Unit type
      </label>
      <select
        id="unitType"
        value={data.unitType}
        disabled={!data.showHearts}
        onChange={(e) => onChange({ unitType: e.target.value as UnitType })}
      >
        {UNIT_TYPE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <label className="control-label" htmlFor="cardSize">
        Card size
      </label>
      <select
        id="cardSize"
        value={data.cardSize}
        onChange={(e) => onChange({ cardSize: e.target.value as CardSize })}
      >
        {CARD_SIZE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <label className="control-label" htmlFor="modelImage">
        Upload model image
      </label>
      <input id="modelImage" type="file" accept="image/*" onChange={handleImageChange} />

      <button type="button" onClick={onAddToSheet}>
        Add card to print sheet
      </button>
      <button type="button" onClick={onExportPng} disabled={exporting}>
        {exporting ? 'Exporting…' : 'Export current card as PNG'}
      </button>
      <button type="button" onClick={() => window.print()}>
        Print / Save as PDF
      </button>
      <button type="button" onClick={onClearSheet} className="secondary-button">
        Clear print sheet
      </button>
    </form>
  )
}

function ItemSelect({
  id,
  items,
  value,
  onChange,
}: {
  id: string
  items: readonly { id: string; name: string }[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
      {items.map((item) => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </select>
  )
}

function SelectionRow({
  id,
  label,
  items,
  value,
  onChange,
}: {
  id: string
  label: string
  items: readonly { id: string; name: string }[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <>
      <label className="control-label" htmlFor={id}>
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">None</option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </>
  )
}
