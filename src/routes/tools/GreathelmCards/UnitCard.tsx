import type { Ref } from 'react'
import type { CardData, Item } from './types'
import { getArmorRows, getHeartCount, getItemRows, getWeaponRows } from './card-logic'

type Props = {
  data: CardData
  portraitUrl: string | null
  ref?: Ref<HTMLElement>
}

export default function UnitCard({ data, portraitUrl, ref }: Props) {
  const weaponRows = getWeaponRows(data)
  const armorRows = getArmorRows(data)
  const itemRows = getItemRows(data)
  const heartCount = getHeartCount(data)
  const isPoker = data.cardSize === 'poker'

  return (
    <section ref={ref} className={`unit-card${isPoker ? ' is-poker' : ''}`}>
      <div className="card-grid">
        <div className="panel card-info parchment">
          <div className="name-row">
            <div className="name-label">Name</div>
            <div className="name-value">{data.name}</div>
          </div>

          <div className="equipment-list">
            <Field header="Weapons" rows={weaponRows} />
            <Field header="Armor" rows={armorRows} />
            <Field header="Items" rows={itemRows} />
          </div>
        </div>

        <div className="panel card-portrait parchment">
          {portraitUrl ? (
            <img className="portrait-image" src={portraitUrl} alt="Uploaded model" />
          ) : (
            <div className="portrait-placeholder">Upload a model image</div>
          )}
          {heartCount > 0 && (
            <div className={`hearts ${data.unitType === 'mounted' ? 'is-mounted' : 'is-foot'}`}>
              {Array.from({ length: heartCount }, (_, i) => (
                <Heart key={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function Field({ header, rows }: { header: string; rows: Item[] }) {
  return (
    <section className="field">
      <div className="field-header">{header}</div>
      <div className="field-body">
        {rows.length > 0 ? (
          rows.map((item) => (
            <div key={item.id} className="field-item">
              <strong>{item.name}:</strong> <span className="rule-text">{item.rules}</span>
            </div>
          ))
        ) : (
          <div className="write-line-wrap">
            <div className="write-line" />
          </div>
        )}
      </div>
    </section>
  )
}

function Heart() {
  return (
    <div className="heart">
      <svg viewBox="0 0 64 58" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          d="M32 53 C28 49, 7 35, 7 19 C7 10, 14 5, 22 5 C27 5, 31 8, 32 12 C33 8, 37 5, 42 5 C50 5, 57 10, 57 19 C57 35, 36 49, 32 53 Z"
          fill="#d51f31"
          stroke="#2b1209"
          strokeWidth="4.6"
          strokeLinejoin="round"
        />
        <path
          d="M20 14 C22 11, 27 11, 29 15"
          fill="none"
          stroke="rgba(255,255,255,.62)"
          strokeWidth="3.6"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
