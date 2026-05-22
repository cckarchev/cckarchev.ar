export type Item = {
  id: string
  name: string
  rules: string
}

export type LoadoutKind =
  | 'one-free'
  | 'one-shield'
  | 'two-handed'
  | 'dual-same'
  | 'dual-different'

export type UnitType = 'foot' | 'mounted'
export type CardSize = 'tarot' | 'poker'

export type SelectionKey =
  | 'worn'
  | 'use'
  | 'consumable'
  | 'weaponUpgrade'
  | 'armorUpgrade'
  | 'legendaryWorn'
  | 'legendaryUse'
  | 'legendaryArmor'
  | 'legendaryWeaponUpgrade'

export type Selections = Record<SelectionKey, string>

export type CardData = {
  name: string
  armor: string
  loadout: LoadoutKind
  shieldType: string
  weaponA: string
  weaponB: string
  selections: Selections
  showHearts: boolean
  unitType: UnitType
  cardSize: CardSize
}

export type Loadout = {
  hasShield: boolean
  weapons: Item[]
  extras: Item[]
  note: string
}

export type SavedCard = {
  id: string
  data: CardData
  portraitUrl: string | null
}
