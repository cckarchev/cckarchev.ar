import { catalog, SYSTEM_RULES } from './equipment'
import type { CardData, Item, Loadout, SelectionKey } from './types'

export function findById(items: readonly Item[], id: string): Item | null {
  return items.find((item) => item.id === id) ?? null
}

export function getLoadout(data: CardData): Loadout {
  const primaryOneHanded = findById(catalog.oneHanded, data.weaponA)
  const secondaryOneHanded = findById(catalog.oneHanded, data.weaponB)
  const primaryTwoHanded = findById(catalog.twoHanded, data.weaponA)

  switch (data.loadout) {
    case 'one-shield':
      return {
        hasShield: true,
        weapons: [primaryOneHanded].filter(Boolean) as Item[],
        extras: [],
        note: 'One hand weapon and shield.',
      }
    case 'two-handed':
      return {
        hasShield: false,
        weapons: [primaryTwoHanded].filter(Boolean) as Item[],
        extras: [],
        note: 'One two-handed weapon.',
      }
    case 'dual-same':
      return {
        hasShield: false,
        weapons: [primaryOneHanded].filter(Boolean) as Item[],
        extras: [SYSTEM_RULES.dualSame],
        note: 'Two of the same one hand weapon. Weapon abilities do not stack.',
      }
    case 'dual-different':
      return {
        hasShield: false,
        weapons: [primaryOneHanded, secondaryOneHanded].filter(Boolean) as Item[],
        extras: [SYSTEM_RULES.dualDifferent],
        note: 'Two different one hand weapons. Choose one when attacking and defending.',
      }
    default:
      return {
        hasShield: false,
        weapons: [primaryOneHanded].filter(Boolean) as Item[],
        extras: [SYSTEM_RULES.freeHand],
        note: 'One hand weapon and a free hand. +1 to bash clash tests.',
      }
  }
}

export function getWeaponRows(data: CardData): Item[] {
  const loadout = getLoadout(data)
  return [...loadout.weapons, ...loadout.extras]
}

export function getArmorRows(data: CardData): Item[] {
  const baseArmor = findById(catalog.armor, data.armor)
  const legendaryArmor = findById(catalog.items.legendaryArmor, data.selections.legendaryArmor)
  const armorUpgrade = findById(catalog.items.armorUpgrade, data.selections.armorUpgrade)
  const shield = getLoadout(data).hasShield ? findById(catalog.shields, data.shieldType) : null
  return [legendaryArmor ?? baseArmor, shield, armorUpgrade].filter(Boolean) as Item[]
}

const IGNORED_FROM_ITEMS = new Set<SelectionKey>(['armorUpgrade', 'legendaryArmor'])

export function getItemRows(data: CardData): Item[] {
  return (Object.entries(data.selections) as [SelectionKey, string][])
    .filter(([key, id]) => id && !IGNORED_FROM_ITEMS.has(key))
    .map(([key, id]) => findById(catalog.items[key as keyof typeof catalog.items] ?? [], id))
    .filter(Boolean) as Item[]
}

export function getHeartCount(data: CardData): number {
  if (!data.showHearts) return 0
  return data.unitType === 'mounted' ? 6 : 3
}

export function slugifyName(name: string, fallback = 'greathelm-card'): string {
  const cleaned = name
    .trim()
    .replace(/[^a-z0-9_-]+/gi, '-')
    .toLowerCase()
  return cleaned || fallback
}
