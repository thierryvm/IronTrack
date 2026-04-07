'use client'

import { ReactNode } from 'react'
import RegisterSW from'@/components/register-sw'

interface ClientProvidersProps {
 children: ReactNode
}

export default function ClientProviders({ children}: ClientProvidersProps) {
 return (
 <>
 <RegisterSW />
 {children}
 </>
 )
}
