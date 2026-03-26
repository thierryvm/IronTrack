import type { Metadata } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://iron-track-dusky.vercel.app'

export const metadata: Metadata = {
  title: 'FAQ — Questions Fréquentes | IronTrack',
  description:
    'Trouvez les réponses à toutes vos questions sur IronTrack : partenaires d\'entraînement, création de séances, suivi des exercices, nutrition, progression et support technique.',
  alternates: { canonical: `${APP_URL}/faq` },
  openGraph: {
    title: 'FAQ IronTrack — Questions Fréquentes',
    description:
      'Toutes les réponses aux questions sur l\'application de musculation IronTrack : séances, exercices, nutrition, partenaires et plus.',
    url: `${APP_URL}/faq`,
    type: 'website',
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Comment inviter quelqu\'un comme partenaire d\'entraînement ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Allez dans "Training Partners" → onglet "Rechercher" → tapez le pseudo, nom ou email de la personne → cliquez "Inviter". L\'invitation sera envoyée et la personne pourra l\'accepter ou la refuser.',
      },
    },
    {
      '@type': 'Question',
      name: 'Comment créer une nouvelle séance d\'entraînement ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cliquez sur "Nouvelle séance" dans le calendrier ou allez dans "Séances" → "Ajouter". Remplissez les informations : nom, type, exercices, date/heure, puis sauvegardez.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quels types d\'exercices puis-je ajouter ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'IronTrack supporte tous types d\'exercices : Musculation, Cardio, Étirement, Yoga, Pilates, Natation, Crossfit, Gainage, Cours collectifs, etc.',
      },
    },
    {
      '@type': 'Question',
      name: 'Comment suivre ma progression ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Allez dans "Progression" pour accéder à vos graphiques détaillés : courbes de progression par exercice, volume hebdomadaire, comparaisons temporelles, et statistiques avancées.',
      },
    },
    {
      '@type': 'Question',
      name: 'IronTrack est-il conforme RGPD ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui, IronTrack est conforme au RGPD et à la loi belge sur la protection des données. Vous pouvez exporter ou supprimer vos données à tout moment depuis votre profil.',
      },
    },
    {
      '@type': 'Question',
      name: 'Puis-je utiliser IronTrack sur mobile ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui, IronTrack est une Progressive Web App (PWA) installable sur iOS et Android. Elle fonctionne parfaitement sur mobile avec une interface optimisée tactile.',
      },
    },
  ],
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  )
}
