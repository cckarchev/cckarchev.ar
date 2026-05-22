import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <main className="max-w-4xl mx-auto px-5 pb-16 pt-12">
      <section className="text-center py-8 mb-12 border-b border-accent/20">
        <h1 className="text-4xl tracking-wider text-accent mb-2 font-normal">
          Centro Cultural Karchev
        </h1>
        <p className="text-muted text-lg m-0">
          Herramientas y recursos para el club de juegos
        </p>
      </section>

      <section>
        <h2 className="text-xl tracking-widest uppercase text-muted mb-5 font-semibold">
          Herramientas
        </h2>
        <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
          <a
            href="/tools/warmaster-map/"
            className="block bg-panel border border-accent/20 rounded-lg p-5 no-underline text-inherit hover:border-accent hover:bg-panel-2 hover:-translate-y-0.5 transition"
          >
            <h3 className="text-accent text-lg mb-1.5 font-semibold">
              Warmaster Maps
            </h3>
            <p className="text-muted text-sm m-0">
              Generador de campos de batalla para Warmaster Revolution.
            </p>
          </a>
          <Link
            to="/tools/greathelm-cards"
            className="block bg-panel border border-accent/20 rounded-lg p-5 no-underline text-inherit hover:border-accent hover:bg-panel-2 hover:-translate-y-0.5 transition"
          >
            <h3 className="text-accent text-lg mb-1.5 font-semibold">
              Greathelm Cards
            </h3>
            <p className="text-muted text-sm m-0">
              Generador de cartas de unidades para Greathelm.
            </p>
          </Link>
        </div>
      </section>
    </main>
  )
}
