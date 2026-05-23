import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function Privacy() {
  useDocumentTitle('Política de privacidad')

  return (
    <main className="max-w-3xl mx-auto px-5 pb-16 pt-12">
      <h1 className="text-3xl tracking-wider text-accent mb-2 font-normal">
        Política de privacidad
      </h1>
      <p className="text-muted text-sm mb-8">Última actualización: 23 de mayo de 2026</p>

      <div className="space-y-6 text-ink leading-relaxed">
        <section>
          <p className="m-0">
            Este sitio es operado por el Centro Cultural Karchev (CCK), un club de juegos de mesa.
            Esta política explica qué datos personales recopilamos cuando iniciás sesión y qué
            hacemos con ellos.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-accent mb-2 font-semibold">Qué datos recopilamos</h2>
          <p className="m-0">
            Podés navegar el sitio y usar las herramientas sin iniciar sesión. Si elegís ingresar
            con tu cuenta de Google, recibimos de Google tu <strong>nombre</strong>, tu{' '}
            <strong>dirección de correo electrónico</strong> y la <strong>foto de perfil</strong>{' '}
            asociada a esa cuenta. No accedemos a tu contraseña ni a ningún otro dato de tu cuenta
            de Google.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-accent mb-2 font-semibold">Para qué los usamos</h2>
          <p className="m-0">
            Usamos esos datos únicamente para identificarte como miembro del club y habilitarte las
            funciones que requieren una sesión iniciada. No los usamos con fines publicitarios.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-accent mb-2 font-semibold">Dónde se guardan</h2>
          <p className="m-0">
            Tus datos se almacenan en Supabase, el proveedor que usamos para autenticación y base de
            datos. No vendemos ni compartimos tus datos con terceros, salvo lo estrictamente
            necesario para operar el sitio.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-accent mb-2 font-semibold">Tus derechos</h2>
          <p className="m-0">
            Podés pedir en cualquier momento que eliminemos tu cuenta y los datos asociados.
            Escribinos a{' '}
            <a className="text-accent underline" href="mailto:nicolas.venturo@gmail.com">
              nicolas.venturo@gmail.com
            </a>{' '}
            y lo resolvemos.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-accent mb-2 font-semibold">Cambios</h2>
          <p className="m-0">
            Si actualizamos esta política, vamos a reflejar la fecha del cambio en esta misma
            página.
          </p>
        </section>
      </div>
    </main>
  )
}
