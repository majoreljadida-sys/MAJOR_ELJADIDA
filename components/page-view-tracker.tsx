'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Beacon léger qui envoie une vue à /api/track-view à chaque navigation
 * (changement de pathname). Posé dans le layout root.
 *
 * - Aucun cookie, aucun ID utilisateur
 * - L'API filtre elle-même les bots et les chemins internes (/admin, /coach…)
 * - Utilise navigator.sendBeacon quand disponible (n'attend pas la réponse)
 */
export function PageViewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname) return
    const body = JSON.stringify({ path: pathname })

    // sendBeacon = tir-et-oublie, ne bloque pas la navigation
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const blob = new Blob([body], { type: 'application/json' })
      try { navigator.sendBeacon('/api/track-view', blob); return } catch { /* fallback */ }
    }
    // Fallback fetch (vieux navigateurs)
    fetch('/api/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => { /* silencieux */ })
  }, [pathname])

  return null
}
