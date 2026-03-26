'use client'

import { ReactNode} from'react'
import RegisterSW from'@/components/register-sw'
import PerformanceOptimizations from'@/components/PerformanceOptimizations'

interface ClientProvidersProps {
 children: ReactNode
}

export default function ClientProviders({ children}: ClientProvidersProps) {
 return (
 <>
 <RegisterSW />
 <PerformanceOptimizations />
 {children}
 </>
 )
}