'use client'

import { useEffect, useState } from "react";

export default function VercelProviders() {
  const [mounted, setMounted] = useState(false)
  const [isProduction, setIsProduction] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    setIsProduction(process.env.NODE_ENV === 'production')
  }, [])
  
  // Don't render anything until mounted (prevents hydration mismatch)
  if (!mounted || !isProduction) {
    return null
  }
  
  // Dynamic imports only in production to avoid hydration issues
  const [Analytics, setAnalytics] = useState<any>(null)
  const [SpeedInsights, setSpeedInsights] = useState<any>(null)
  
  useEffect(() => {
    if (isProduction) {
      import("@vercel/analytics/react").then(module => {
        setAnalytics(() => module.Analytics)
      })
      import("@vercel/speed-insights/next").then(module => {
        setSpeedInsights(() => module.SpeedInsights)
      })
    }
  }, [isProduction])
  
  if (!Analytics || !SpeedInsights) {
    return null
  }
  
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  )
}