import HomePageClient from'@/components/HomePage/HomePageClient'

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