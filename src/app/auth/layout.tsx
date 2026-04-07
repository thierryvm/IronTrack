import type { Metadata } from 'next';

import { createProtectedPageMetadata } from '../metadata';

export const metadata: Metadata = createProtectedPageMetadata({
  title: 'Accès sécurisé',
  description:
    "Connexion, réinitialisation et reprise d'accès à IronTrack. Cette zone ne doit pas être indexée par les moteurs.",
  path: '/auth',
  keywords: ['connexion irontrack', 'authentification fitness', 'espace membre irontrack'],
  openGraphTitle: 'IronTrack | Accès sécurisé',
  openGraphDescription:
    "Accède à ton espace IronTrack pour retrouver tes séances, ta nutrition et ta progression dans un environnement sécurisé.",
});

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
