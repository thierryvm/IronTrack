import type { Metadata } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://iron-track-dusky.vercel.app'

export const metadata: Metadata = {
  title: 'Politique de Confidentialité | IronTrack',
  description:
    'Politique de confidentialité d\'IronTrack : collecte et traitement des données personnelles, droits RGPD, cookies, sous-traitants, et contact DPO. Conforme à la loi belge APD.',
  alternates: { canonical: `${APP_URL}/legal/privacy` },
  robots: { index: true, follow: false },
  openGraph: {
    title: 'Politique de Confidentialité — IronTrack',
    description: 'Vos droits et notre engagement RGPD pour la protection de vos données personnelles.',
    url: `${APP_URL}/legal/privacy`,
    type: 'website',
  },
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
