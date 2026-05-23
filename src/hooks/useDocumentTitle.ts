import { useEffect } from 'react'

const SITE_NAME = 'CCK'

/** Page-specific title used when no route sets its own (Home, unknown URLs). */
export const DEFAULT_TITLE = 'Centro Cultural Karchev'

/** Builds the full tab title: `${title} · CCK`. */
export function formatTitle(title: string): string {
  return `${title} · ${SITE_NAME}`
}

/**
 * Sets `document.title` to `${title} · CCK` while the calling component is
 * mounted. Pass the page-specific part only; the site suffix is appended here
 * so every tab reads the same way. Tab labels truncate from the right, so the
 * page-specific part stays visible when many tabs are open.
 *
 * Runs in a passive effect, so it overrides the default set by
 * `ResetDocumentTitle` (a layout effect) — see src/App.tsx.
 */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = formatTitle(title)
  }, [title])
}
