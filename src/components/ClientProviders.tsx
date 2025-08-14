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

const ExtensionErrorShield = dynamic(() => import("@/components/ExtensionErrorShield"), {
  ssr: false
});

interface ClientProvidersProps {
  children: ReactNode
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <>
      <ExtensionErrorShield />
      <RegisterSW />
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </>
  )
}