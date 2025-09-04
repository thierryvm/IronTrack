'use client'

import { ReactNode } from 'react'
import ThemeProvider from '@/components/ui/ThemeProvider'
import RegisterSW from '@/components/register-sw'

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