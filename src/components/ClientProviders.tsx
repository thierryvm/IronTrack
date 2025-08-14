'use client'

import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

// Lazy loading pour composants clients
const ThemeProvider = dynamic(() => import("@/components/ui/ThemeProvider").then(mod => ({ default: mod.ThemeProvider })), {
  ssr: false
});

const RegisterSW = dynamic(() => import("@/components/register-sw"), {
  ssr: false
});

// ExtensionErrorShield supprimé - maintenant géré directement dans layout.tsx head

interface ClientProvidersProps {
  children: ReactNode
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <>
      <RegisterSW />
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </>
  )
}