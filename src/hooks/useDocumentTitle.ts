import { useEffect } from 'react'

const SITE_NAME = 'CCK'

/**
 * Sets `document.title` to `${title} · CCK` while the calling component is
 * mounted. Pass the page-specific part only; the site suffix is appended here
 * so every tab reads the same way. Tab labels truncate from the right, so the
 * page-specific part stays visible when many tabs are open.
 */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} · ${SITE_NAME}`
  }, [title])
}
