import type { Metadata } from 'next'
import { createPageMetadata } from '../metadata'

export const metadata: Metadata = createPageMetadata({
  title: 'Support & Aide',
  description:
    "Centre d'aide IronTrack : démarrage, partenaires d'entraînement, nutrition, séances, progression et support produit.",
  path: '/support',
  keywords: [
    'support irontrack',
    'aide application fitness',
    'guide musculation et nutrition',
    'documentation irontrack',
  ],
  openGraphTitle: "Support IronTrack - Centre d'aide",
  openGraphDescription:
    "Guide complet pour utiliser IronTrack et retrouver rapidement les réponses utiles sur les séances, la nutrition et les partenaires.",
})

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
