import UnitCard from './UnitCard'
import type { SavedCard } from './types'

type Props = {
  cards: SavedCard[]
}

export default function PrintSheet({ cards }: Props) {
  return (
    <>
      <h2 className="sheet-title">Print Sheet</h2>
      <section className="print-sheet">
        {cards.map((card) => (
          <UnitCard key={card.id} data={card.data} portraitUrl={card.portraitUrl} />
        ))}
      </section>
    </>
  )
}
