import type { Metadata } from 'next'
import { createPageMetadata } from '../metadata'
import { faqData, faqStructuredDataIds } from './faq-content'

export const metadata: Metadata = createPageMetadata({
  title: 'FAQ - Questions fréquentes',
  description:
    "Retrouve les réponses aux questions fréquentes sur IronTrack : partenaires, séances, exercices, nutrition, progression et support technique.",
  path: '/faq',
  keywords: [
    'faq irontrack',
    'questions fréquentes fitness',
    'aide musculation',
    'support entraînement',
  ],
  openGraphTitle: 'FAQ IronTrack - Questions fréquentes',
  openGraphDescription:
    "Toutes les réponses aux questions courantes sur l'application de musculation IronTrack.",
})

const faqStructuredEntries = faqStructuredDataIds
  .map((id) => faqData.find((item) => item.id === id))
  .filter((item): item is (typeof faqData)[number] => Boolean(item))
  .map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  }))

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqStructuredEntries,
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
