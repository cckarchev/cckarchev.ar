import { useEffect, useState } from 'react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { supabase } from '../lib/supabase'

type Member = { id: number; name: string }

export default function Members() {
  useDocumentTitle('Miembros')

  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      const { data, error } = await supabase.from('users_public').select('id, name').order('name')
      if (!active) return
      if (error) setError(true)
      else setMembers(data ?? [])
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [])

  return (
    <main className="max-w-2xl mx-auto px-5 pb-16 pt-12">
      <h1 className="text-3xl tracking-wider text-accent mb-6 font-normal">Miembros</h1>

      {loading ? (
        <p className="text-muted">Cargando…</p>
      ) : error ? (
        <p className="text-danger">No se pudieron cargar los miembros.</p>
      ) : members.length === 0 ? (
        <p className="text-muted">Todavía no hay miembros.</p>
      ) : (
        <ul className="divide-y divide-accent/15 border border-accent/20 rounded-lg overflow-hidden">
          {members.map((member) => (
            <li key={member.id} className="bg-panel px-4 py-3 text-ink">
              {member.name}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
