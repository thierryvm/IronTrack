import type { Metadata } from 'next'

import HomePageClient from'@/components/HomePage/HomePageClient'
import { createPageMetadata } from '@/app/metadata'

export const metadata: Metadata = createPageMetadata({
  title: 'IronTrack | Fitness, musculation, nutrition et progression',
  description:
    "IronTrack est l'application fitness, musculation et nutrition pour planifier tes séances, suivre ta charge de travail, garder un timer utile et mesurer ta progression.",
  path: '/',
  keywords: [
    'IronTrack',
    'application fitness',
    'application musculation',
    'application nutrition',
    'suivi entrainement',
    'progression musculation',
    'timer repos musculation',
    'planning fitness',
    'coach musculation',
    'PWA fitness',
  ],
  openGraphTitle: 'IronTrack | Application fitness, musculation et nutrition',
  openGraphDescription:
    'Planifie tes séances, mesure ta progression, suis ta nutrition et garde un cockpit d’entraînement clair avec IronTrack.',
})

const webAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'IronTrack',
  description:
    'Application web de suivi d\'entraînement de musculation avec timer, nutrition, partenaires et progression. Interface mobile-first, conforme RGPD, disponible comme PWA.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://iron-track-dusky.vercel.app',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'Web, iOS (PWA), Android (PWA)',
  inLanguage: 'fr',
  isAccessibleForFree: true,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
  audience: {
    '@type': 'Audience',
    audienceType: 'Pratiquants de musculation, coachs sportifs, groupes fitness',
    geographicArea: 'Belgique, France, Suisse',
  },
  featureList: [
    'Suivi des entraînements de musculation',
    'Timer de session multi-étapes',
    'Gestion de la nutrition et macronutriments',
    'Partenaires d\'entraînement',
    'Graphiques de progression',
    'Calendrier d\'entraînement',
    'Export des données RGPD',
    'Mode hors-ligne (PWA)',
  ],
  creator: {
    '@type': 'Organization',
    name: 'IronTrack',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://iron-track-dusky.vercel.app',
  },
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />
      <HomePageClient />
    </>
  )
}
