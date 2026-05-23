import { describe, expect, it } from 'vitest'
import {
  findById,
  getArmorRows,
  getHeartCount,
  getItemRows,
  getLoadout,
  getWeaponRows,
  slugifyName,
} from './card-logic'
import { catalog, SYSTEM_RULES } from './equipment'
import type { CardData, LoadoutKind } from './types'

function makeCard(overrides: Partial<CardData> = {}): CardData {
  return {
    name: 'Sir Test',
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
    ...overrides,
  }
}

describe('findById', () => {
  it('returns the item when its id matches', () => {
    expect(findById(catalog.armor, 'heavy-armor')?.name).toBe('Heavy Armor')
  })

  it('returns null when nothing matches', () => {
    expect(findById(catalog.armor, 'nonexistent')).toBeNull()
  })

  it('returns null on an empty list', () => {
    expect(findById([], 'whatever')).toBeNull()
  })
})

describe('getLoadout', () => {
  const cases: { loadout: LoadoutKind; expectShield: boolean; expectsExtra?: string }[] = [
    { loadout: 'one-free', expectShield: false, expectsExtra: SYSTEM_RULES.freeHand.id },
    { loadout: 'one-shield', expectShield: true },
    { loadout: 'two-handed', expectShield: false },
    { loadout: 'dual-same', expectShield: false, expectsExtra: SYSTEM_RULES.dualSame.id },
    { loadout: 'dual-different', expectShield: false, expectsExtra: SYSTEM_RULES.dualDifferent.id },
  ]

  for (const { loadout, expectShield, expectsExtra } of cases) {
    it(`describes ${loadout} correctly`, () => {
      const result = getLoadout(makeCard({ loadout, weaponA: 'arming-sword', weaponB: 'mace' }))
      expect(result.hasShield).toBe(expectShield)
      if (expectsExtra) {
        expect(result.extras.some((e) => e.id === expectsExtra)).toBe(true)
      } else {
        expect(result.extras).toHaveLength(0)
      }
    })
  }

  it('uses the two-handed catalog for the two-handed loadout', () => {
    const result = getLoadout(makeCard({ loadout: 'two-handed', weaponA: 'great-ax' }))
    expect(result.weapons[0]?.id).toBe('great-ax')
  })

  it('includes both primary and secondary weapons for dual-different', () => {
    const result = getLoadout(
      makeCard({ loadout: 'dual-different', weaponA: 'arming-sword', weaponB: 'mace' }),
    )
    const ids = result.weapons.map((w) => w.id)
    expect(ids).toContain('arming-sword')
    expect(ids).toContain('mace')
  })
})

describe('getWeaponRows', () => {
  it('appends the loadout extras after the chosen weapons', () => {
    const rows = getWeaponRows(makeCard({ loadout: 'one-free', weaponA: 'arming-sword' }))
    expect(rows[0]?.id).toBe('arming-sword')
    expect(rows[rows.length - 1]?.id).toBe(SYSTEM_RULES.freeHand.id)
  })
})

describe('getArmorRows', () => {
  it('returns just the base armor by default', () => {
    const rows = getArmorRows(makeCard())
    expect(rows.map((r) => r.id)).toEqual(['heavy-armor'])
  })

  it('replaces base armor with the legendary armor when one is selected', () => {
    const rows = getArmorRows(
      makeCard({ selections: { ...makeCard().selections, legendaryArmor: 'armor-lion' } }),
    )
    expect(rows.some((r) => r.id === 'heavy-armor')).toBe(false)
    expect(rows.some((r) => r.id === 'armor-lion')).toBe(true)
  })

  it('includes the shield only when the loadout has one', () => {
    const withShield = getArmorRows(makeCard({ loadout: 'one-shield', shieldType: 'kite' }))
    expect(withShield.some((r) => r.id === 'kite')).toBe(true)

    const without = getArmorRows(makeCard({ loadout: 'two-handed' }))
    expect(without.some((r) => ['buckler', 'heater', 'kite'].includes(r.id))).toBe(false)
  })

  it('appends armor upgrade when selected', () => {
    const rows = getArmorRows(
      makeCard({ selections: { ...makeCard().selections, armorUpgrade: 'coat-of-plates' } }),
    )
    expect(rows.some((r) => r.id === 'coat-of-plates')).toBe(true)
  })
})

describe('getItemRows', () => {
  it('returns the items selected, ignoring empty selections', () => {
    const rows = getItemRows(
      makeCard({
        selections: {
          ...makeCard().selections,
          worn: 'silver-ring',
          use: 'banner',
        },
      }),
    )
    const ids = rows.map((r) => r.id)
    expect(ids).toContain('silver-ring')
    expect(ids).toContain('banner')
    expect(rows).toHaveLength(2)
  })

  it('excludes armorUpgrade and legendaryArmor (those go in armor rows)', () => {
    const rows = getItemRows(
      makeCard({
        selections: {
          ...makeCard().selections,
          armorUpgrade: 'coat-of-plates',
          legendaryArmor: 'armor-lion',
          worn: 'silver-ring',
        },
      }),
    )
    expect(rows.map((r) => r.id)).toEqual(['silver-ring'])
  })

  it('drops selections whose id no longer exists in the catalog', () => {
    const rows = getItemRows(
      makeCard({
        selections: { ...makeCard().selections, worn: 'this-does-not-exist' },
      }),
    )
    expect(rows).toHaveLength(0)
  })
})

describe('getHeartCount', () => {
  it('returns 0 when hearts are hidden', () => {
    expect(getHeartCount(makeCard({ showHearts: false }))).toBe(0)
  })

  it('returns 3 for foot units when hearts are shown', () => {
    expect(getHeartCount(makeCard({ showHearts: true, unitType: 'foot' }))).toBe(3)
  })

  it('returns 6 for mounted units when hearts are shown', () => {
    expect(getHeartCount(makeCard({ showHearts: true, unitType: 'mounted' }))).toBe(6)
  })
})

describe('slugifyName', () => {
  it('lowercases and replaces unsafe chars with dashes', () => {
    expect(slugifyName('Sir Bertrand of York!')).toBe('sir-bertrand-of-york-')
  })

  it('returns the fallback for empty or whitespace-only input', () => {
    expect(slugifyName('')).toBe('greathelm-card')
    expect(slugifyName('   ')).toBe('greathelm-card')
  })

  it('accepts a custom fallback', () => {
    expect(slugifyName('', 'mycard')).toBe('mycard')
  })
})
