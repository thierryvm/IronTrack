import type { Metadata } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://iron-track-dusky.vercel.app'

export const metadata: Metadata = {
  title: 'Conditions Générales d\'Utilisation | IronTrack',
  description:
    'Conditions générales d\'utilisation d\'IronTrack : accès au service, règles d\'utilisation, responsabilités, propriété intellectuelle et résiliation. Application de suivi de musculation belge.',
  alternates: { canonical: `${APP_URL}/legal/terms` },
  robots: { index: true, follow: false },
  openGraph: {
    title: 'CGU — Conditions Générales d\'Utilisation IronTrack',
    description: 'Conditions d\'utilisation du service IronTrack, application de suivi de musculation.',
    url: `${APP_URL}/legal/terms`,
    type: 'website',
  },
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
