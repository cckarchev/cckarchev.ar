import type { Item } from './types'

type Triple = readonly [string, string, string]

const toItem = ([id, name, rules]: Triple): Item => ({ id, name, rules })

const RAW = {
  armor: [
    ['full-plate', 'Full Plate', 'Upgrade. Roll 1d6 on the armor table when suffering damage. Impervious on 5–6.'],
    ['heavy-armor', 'Heavy Armor', 'Roll 1d6 on the armor table when suffering damage.'],
    ['medium-armor', 'Medium Armor', 'Roll 1d6 on the armor table when suffering damage. +1 to dodge defense. Armor table rolls of 1–2 count as Pierced.'],
    ['light-armor', 'Light Armor', 'Roll 1d6 on the armor table when suffering damage. +2 to dodge defense. +1” to run, walk and step actions. Armor table rolls of 1–3 count as Pierced.'],
  ],
  shields: [
    ['buckler', 'Buckler', '+1 to block defense. +1 to bash action.'],
    ['heater', 'Heater', '+2 to block defense.'],
    ['kite', 'Kite', 'Momentum limit decreased to 2. +2 to block defense. +3 to block defense against ranged attacks.'],
  ],
  oneHanded: [
    ['arming-sword', 'Arming Sword', '+1 to light melee attack.'],
    ['hand-ax', 'Hand Ax', 'Cannot riposte defense. +1 to heavy melee attack.'],
    ['mace', 'Mace', 'Cannot riposte defense. Successful light melee attacks may move the defender 1”.'],
    ['falchion', 'Falchion', 'Successful light melee attacks remove 2 momentum from the defender.'],
    ['warhammer', 'Warhammer', 'Cannot riposte defense. Successful heavy melee attacks may move the defender 1”.'],
    ['flail', 'Flail', 'Cannot riposte or parry defense. +1 to light melee attack. Defender cannot riposte defense.'],
    ['short-spear', 'Short Spear', 'Cannot riposte defense. Parry defense only gains 1 momentum. Counts as an allied knight during a clash test when in base contact with the attacker.'],
    ['knife', 'Knife', 'Improvised weapon. Cannot riposte defense. Heavy melee attack deals 1 damage. +1 to light melee attack.'],
    ['woodmans-ax', 'Woodman’s Ax', 'Improvised weapon. Cannot riposte defense. Heavy melee attack deals 1 damage. +1 to heavy melee attack.'],
    ['club', 'Club', 'Improvised weapon. Cannot riposte defense. Heavy melee attack deals 1 damage. Successful light melee attacks may move the defender up to 1”.'],
    ['hand-weapon', 'Hand Weapon', 'Improvised weapon. Heavy melee attacks deal 1 damage. +1 to light melee attack.'],
  ],
  twoHanded: [
    ['great-ax', 'Great Ax', 'Cannot riposte defense. +1 to heavy melee attack. Defenders without momentum cannot gain the block defense bonus.'],
    ['long-sword', 'Long Sword', '+1 to light melee attack. +1 to riposte defense.'],
    ['long-spear', 'Long Spear', 'Cannot riposte defense. Parry defense only gains 1 momentum. +1 to light melee attack. Counts as an allied knight during a clash test when in base contact with the attacker or defender.'],
    ['kriegsmesser', 'Kriegsmesser', '+1 to heavy melee attack. Successful heavy melee attacks remove 2 momentum from the defender.'],
    ['warmaul', 'Warmaul', 'Cannot riposte defense. +1 to heavy melee attack. Successful heavy melee attacks may move the defender up to 2”.'],
    ['war-flail', 'War Flail', 'Cannot riposte defense. Parry defense only gains 1 momentum. +1 to light & heavy melee attack. Defender cannot riposte defense.'],
    ['polearm', 'Polearm', 'Cannot riposte defense. Parry defense only gains 1 momentum. +1 to heavy melee attack. Counts as an allied knight during a clash test when in base contact with the attacker or defender.'],
    ['bow-dagger', 'Bow & Dagger', 'Cannot riposte defense. Gain light ranged attack.'],
    ['crossbow-dagger', 'Crossbow & Dagger', 'Cannot riposte defense. Complex weapon. Gain heavy ranged attack.'],
    ['farm-tools', 'Farm Tools', 'Improvised two-handed weapon. Cannot riposte defense. Parry defense only gains 1 momentum. Heavy melee attack deals 1 damage. +1 to light melee attack. Counts as an allied knight during a clash test when in base contact with the attacker or defender.'],
    ['wooden-flail', 'Wooden Flail', 'Improvised two-handed weapon. Cannot riposte defense. Parry defense only gains 1 momentum. +1 to heavy melee attack. Defender cannot riposte defense.'],
    ['wooden-staff', 'Wooden Staff', 'Improvised two-handed weapon. Cannot riposte defense. Heavy melee attack deals 1 damage. +1 to light melee attack.'],
    ['sling-knife', 'Sling & Knife', 'Improvised two-handed ranged weapon. Cannot riposte defense. Heavy melee attacks deal 1 damage. Gain light ranged attack.'],
    ['bow-knife', 'Bow & Knife', 'Improvised two-handed ranged weapon. Cannot riposte defense. Heavy melee attacks deal 1 damage. Gain light ranged attack.'],
  ],
  items: {
    worn: [
      ['silver-ring', 'Silver Ring', '+1 to light melee attack action.'],
      ['ruby-ring', 'Ruby Ring', '+1 to heavy melee attack action.'],
      ['ebon-ring', 'Ebon Ring', '+1 to bash action.'],
      ['jade-amulet', 'Jade Amulet', '+1 to dodge defense.'],
      ['jet-amulet', 'Jet Amulet', '+1 to parry defense.'],
      ['fire-opal-amulet', 'Fire Opal Amulet', '+1 to riposte defense.'],
      ['belt-of-speed', 'Belt of Speed', '+1” to run actions.'],
      ['belt-of-strides', 'Belt of Strides', '+1” to walk actions.'],
      ['belt-of-agility', 'Belt of Agility', '+1” to step actions.'],
      ['orle-of-bravery', 'Orle of Bravery', '+1 to courage tests.'],
      ['orle-of-might', 'Orle of Might', '+1 to clash tests when outnumbered.'],
      ['orle-of-dread', 'Orle of Dread', '+1 difficulty to enemy courage tests within 3”.'],
    ],
    use: [
      ['banner', 'Banner', 'Use to raise the Banner until the end of the turn. While raised, allied knights move an extra 2” with Step actions.'],
      ['horn', 'Horn', 'Use to blow horn. When blown, redistribute 3 momentum within 6”.'],
      ['lovers-handkerchief', 'Lovers Handkerchief', 'Use to peek at the handkerchief and gain 3 momentum.'],
      ['orders', 'Orders', 'Use to order an ally within 3” to immediately perform a Lunge action.'],
      ['relic', 'Relic', 'Use to raise the Relic until the end of the turn. While raised, allied knights automatically pass courage tests.'],
      ['throwing-weapon', 'Throwing Weapon', 'Use to throw the weapon, and remove 1 momentum from 2 enemy knights within 3” and in line of sight.'],
    ],
    consumable: [
      ['healing-herb', 'Healing Herb', 'Use to remove 1 damage and gain 2 momentum.'],
      ['medicinal-tincture', 'Medicinal Tincture', 'Use to remove 2 damage.'],
      ['alacrity-tincture', 'Alacrity Tincture', 'Use to gain +1 on clash tests for the rest of the scene.'],
      ['rose-oils', 'Rose Oils', 'Use to automatically pass courage tests for the rest of the scene.'],
      ['lavender-oils', 'Lavender Oils', 'Use to gain +2 to dodge tests for the rest of the scene.'],
      ['jasmin-oils', 'Jasmin Oils', 'Use to move up to 3”. Two uses.'],
      ['chamomile-oils', 'Chamomile Oils', 'Use to gain +2 to armor table rolls for the rest of the scene.'],
      ['fire-powder-pot', 'Fire Powder Pot', 'Use to force all knights within 3” to perform a Shift action. Move up to 1”. Cannot contact enemy.'],
    ],
    weaponUpgrade: [
      ['balanced-light', 'Balanced Light weapon upgrade', 'Re-roll results of 1 during clash tests when performing a light melee attack.'],
      ['balanced-heavy', 'Balanced Heavy weapon upgrade', 'Re-roll results of 1 during clash tests when performing a heavy melee attack.'],
      ['nimble-edge', 'Nimble Edge weapon upgrade', 'Re-roll results of 1 during clash tests when defending with a riposte.'],
      ['tempered-edge', 'Tempered Edge weapon upgrade', 'Re-roll results of 1 during clash tests when defending with a parry.'],
      ['reinforced-shield', 'Reinforced Shield upgrade', 'Re-roll results of 1 during clash tests when defending with a block.'],
      ['improved-enarmes', 'Improved Enarmes Shield upgrade', 'Re-roll results of 1 during clash tests when performing a bash action.'],
    ],
    armorUpgrade: [
      ['bevor-besagews', 'Bevor and Besagews', 'Re-roll armor table results of 1.'],
      ['couters-poleyns', 'Couters and Poleyns', 'Re-roll armor table results of 2 and 3.'],
      ['coat-of-plates', 'Coat of Plates', 'Re-roll armor table results of 4 and 5.'],
    ],
    legendaryWorn: [
      ['ancient-amulet', 'Ancient Amulet', 'Momentum limit is increased by 1.'],
      ['belt-of-bashing', 'Belt of Bashing', 'Deal 1 automatic damage to the defender when you win a clash using a bash action.'],
      ['belt-of-blocking', 'Belt of Blocking', 'Move the attacker 2” away when you win a clash by defending with a block.'],
      ['belt-of-dodging', 'Belt of Dodging', 'Move up to 3” away when you win a clash by defending with a dodge.'],
      ['orle-of-disdain', 'Orle of Disdain', 'Deal 1 automatic damage to an enemy in base contact after you pass a courage test.'],
      ['soul-ring', 'Soul Ring', 'When you win a clash as the attacker, you may steal 1 momentum from the defender.'],
    ],
    legendaryUse: [
      ['ancient-artifact', 'Ancient Artifact', 'Use to raise the artifact. When raised, remove up to 2 gruesomely slain markers.'],
      ['dark-mirror', 'Dark Mirror', 'Use to raise the dark mirror. When raised, force a single enemy knight within 3” to immediately perform a courage test.'],
      ['orle-of-light', 'Orle of Light', 'Use to force all enemy knights within 3” to perform a shift action. Move up to 1”. Cannot contact enemy.'],
      ['ornate-banner', 'Ornate Banner', 'Use to raise the banner until the end of the turn. While raised, allied knights automatically pass courage tests.'],
      ['swan-horn', 'Swan Horn', 'Use to blow horn. When blown, redistribute d6 momentum within the play area.'],
      ['tear-of-alethea', 'Tear of Alethea', 'Use to raise the tear. When raised, immediately remove up to 2 damage from allied knights within 2”.'],
    ],
    legendaryArmor: [
      ['armor-wraith', 'Armor of the Wraith', 'Roll 1d6 on the armor table when suffering damage. When you pass a courage test, all enemy knights within 3” test courage.'],
      ['armor-bear', 'Armor of the Bear', 'Roll 1d6 on the armor table when suffering damage. You begin the game with 2 momentum.'],
      ['armor-lion', 'Armor of the Lion', 'Roll 1d6 on the armor table when suffering damage. When you battle cry, allies gain momentum on 3+ instead of 4+.'],
      ['armor-mountain', 'Armor of the Mountain', 'Roll 1d6 on the armor table when suffering damage. Bash actions only move you 1”.'],
      ['armor-blade', 'Armor of the Blade', 'Roll 1d6 on the armor table when suffering damage. When you roll a perfect clash, the clash test ends and you win.'],
      ['ancestral-heavy-armor', 'Ancestral Heavy Armor', 'Roll 2d6 on the armor table when suffering damage and take the highest result.'],
    ],
    legendaryWeaponUpgrade: [
      ['ancestral-shield', 'Ancestral Shield upgrade', 'Roll 2d6 when defending with a block and take the highest result.'],
      ['biting-blade', 'Biting Blade upgrade', 'Deal 2 damage to the attacker when you win a clash by defending with a riposte.'],
      ['defenders-blade', 'Defenders Blade upgrade', 'Counts as an allied knight during a clash test when in base contact with the attacker or defender.'],
      ['gorgons-shield', 'Gorgon’s Shield upgrade', 'Deal 1 damage to the attacker when you win a clash by defending with a block.'],
      ['mirror-blade', 'Mirror Blade upgrade', 'Deal 1 damage to the attacker when you win a clash by defending with a parry.'],
      ['vipers-blade', 'Vipers Blade upgrade', 'Light attacks deal 2 damage.'],
    ],
  },
} as const satisfies {
  armor: readonly Triple[]
  shields: readonly Triple[]
  oneHanded: readonly Triple[]
  twoHanded: readonly Triple[]
  items: Record<string, readonly Triple[]>
}

export const SYSTEM_RULES = {
  freeHand: toItem(['free-hand', 'Free Hand', '+1 bonus to clash test when performing bash actions.']),
  dualSame: toItem(['dual-same', 'Dual Wielding', 'Two of the same one-handed weapon: +1 to parry defense. Weapon abilities do not stack.']),
  dualDifferent: toItem(['dual-different', 'Dual Wielding', 'Two different one-handed weapons: choose one weapon to use when you attack and when you defend.']),
} as const

export const catalog = {
  armor: RAW.armor.map(toItem),
  shields: RAW.shields.map(toItem),
  oneHanded: RAW.oneHanded.map(toItem),
  twoHanded: RAW.twoHanded.map(toItem),
  items: {
    worn: RAW.items.worn.map(toItem),
    use: RAW.items.use.map(toItem),
    consumable: RAW.items.consumable.map(toItem),
    weaponUpgrade: RAW.items.weaponUpgrade.map(toItem),
    armorUpgrade: RAW.items.armorUpgrade.map(toItem),
    legendaryWorn: RAW.items.legendaryWorn.map(toItem),
    legendaryUse: RAW.items.legendaryUse.map(toItem),
    legendaryArmor: RAW.items.legendaryArmor.map(toItem),
    legendaryWeaponUpgrade: RAW.items.legendaryWeaponUpgrade.map(toItem),
  },
} as const
