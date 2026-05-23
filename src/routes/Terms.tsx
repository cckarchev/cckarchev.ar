import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function Terms() {
  useDocumentTitle('Términos de uso')

  return (
    <main className="max-w-3xl mx-auto px-5 pb-16 pt-12">
      <h1 className="text-3xl tracking-wider text-accent mb-2 font-normal">Términos de uso</h1>
      <p className="text-muted text-sm mb-8">Última actualización: 23 de mayo de 2026</p>

      <div className="space-y-6 text-ink leading-relaxed">
        <section>
          <p className="m-0">
            Este sitio pertenece al Centro Cultural Karchev (CCK) y ofrece herramientas y recursos
            para el club de juegos de mesa. Al usarlo, aceptás estos términos.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-accent mb-2 font-semibold">Uso del sitio</h2>
          <p className="m-0">
            Las herramientas se ofrecen para uso personal y comunitario dentro del club. Algunas
            funciones requieren iniciar sesión con una cuenta de Google; sos responsable de la
            actividad realizada bajo tu sesión.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-accent mb-2 font-semibold">Uso aceptable</h2>
          <p className="m-0">
            No está permitido usar el sitio para fines ilegales, intentar acceder a datos de otras
            personas, ni interferir con su funcionamiento normal.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-accent mb-2 font-semibold">Disponibilidad y garantías</h2>
          <p className="m-0">
            El sitio se ofrece tal cual está, sin garantías de disponibilidad continua ni de
            ausencia de errores. Podemos modificar o discontinuar herramientas en cualquier momento.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-accent mb-2 font-semibold">Cambios</h2>
          <p className="m-0">
            Podemos actualizar estos términos. Los cambios se reflejan en esta página con su fecha
            correspondiente.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-accent mb-2 font-semibold">Contacto</h2>
          <p className="m-0">
            Por cualquier consulta, escribinos a{' '}
            <a className="text-accent underline" href="mailto:nicolas.venturo@gmail.com">
              nicolas.venturo@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  )
}
