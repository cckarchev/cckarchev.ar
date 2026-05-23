import { createContext, useContext } from 'react'
import type { Session } from '@supabase/supabase-js'

export type AuthContextValue = {
  /** The current Supabase session, or null when signed out. */
  session: Session | null
  /** Start the Google OAuth sign-in redirect. */
  signIn: () => void
  /** Sign out and clear the local session. */
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
