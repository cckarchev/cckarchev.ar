import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/authContext'

/** Multi-color Google "G" mark, sized by the caller via className. */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true">
      <path
        d="M117.6 61.364C117.6 57.109 117.218 53.018 116.51 49.091H60v23.209h32.291c-1.39 7.5-5.618 13.855-11.973 18.109v15.054h19.391C111.055 95.018 117.6 79.636 117.6 61.364z"
        fill="#4285F4"
      />
      <path
        d="M60 120c16.2 0 29.782-5.373 39.71-14.536L80.317 90.409C74.945 94.01 68.073 96.136 60 96.136c-15.627 0-28.855-10.554-33.573-24.736H6.382v15.545C16.255 106.555 36.545 120 60 120z"
        fill="#34A853"
      />
      <path
        d="M26.427 71.4c-1.2-3.6-1.882-7.445-1.882-11.4s.682-7.8 1.882-11.4V33.055H6.382C2.318 41.118 0 50.264 0 60s2.318 18.882 6.382 26.945L26.427 71.4z"
        fill="#FBBC05"
      />
      <path
        d="M60 23.864c8.809 0 16.718 3.027 22.936 8.972l17.209-17.209C89.745 5.927 76.164 0 60 0 36.545 0 16.255 13.445 6.382 33.055L26.427 48.6C31.145 34.418 44.373 23.864 60 23.864z"
        fill="#EA4335"
      />
    </svg>
  )
}

export default function AuthMenu() {
  const { session, signIn, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close the menu when clicking/tapping outside of it.
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  if (!session) {
    return (
      <button
        type="button"
        onClick={signIn}
        aria-label="Iniciar sesión con Google"
        className="flex items-center gap-2 rounded border border-line px-2.5 py-1.5 text-ink hover:border-accent hover:text-accent"
      >
        <GoogleIcon className="w-4 h-4" />
        <span className="hidden sm:inline">Ingresar</span>
      </button>
    )
  }

  const { user } = session
  const name = (user.user_metadata.full_name as string | undefined) ?? user.email
  const avatarUrl = user.user_metadata.avatar_url as string | undefined

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Cuenta"
        aria-expanded={open}
        className="flex items-center rounded-full border border-line p-0.5 hover:border-accent"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="w-7 h-7 rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="flex w-7 h-7 items-center justify-center rounded-full bg-surface-2 text-accent font-bold uppercase">
            {(name ?? '?').charAt(0)}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-line bg-surface py-2 shadow-lg">
          <div className="border-b border-line px-4 py-2">
            <p className="truncate text-sm font-medium text-ink">{name}</p>
            {user.user_metadata.full_name && user.email && (
              <p className="truncate text-xs text-muted">{user.email}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              signOut()
            }}
            className="w-full px-4 py-2 text-left text-sm text-muted hover:bg-surface-2 hover:text-danger"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
