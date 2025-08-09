'use client'

/**
 * Skip Link pour navigation rapide - Améliore l'accessibilité
 * Requis pour un bon score PageSpeed Insights
 */
export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-orange-700 focus:text-white focus:rounded focus:shadow-lg focus:font-semibold"
      tabIndex={0}
    >
      Aller au contenu principal
    </a>
  )
}