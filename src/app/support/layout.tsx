import type { Metadata } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://iron-track-dusky.vercel.app'

export const metadata: Metadata = {
  title: 'Support & Aide | IronTrack',
  description:
    'Centre d\'aide IronTrack : guide de démarrage, gestion des partenaires d\'entraînement, suivi nutritionnel, timer de session, et contact support. Trouvez l\'aide dont vous avez besoin.',
  alternates: { canonical: `${APP_URL}/support` },
  openGraph: {
    title: 'Support IronTrack — Centre d\'aide',
    description:
      'Guide complet pour utiliser IronTrack : séances, exercices, nutrition, partenaires d\'entraînement et fonctionnalités avancées.',
    url: `${APP_URL}/support`,
    type: 'website',
  },
}

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
