'use client'

import { useEffect, useState } from "react";

export default function VercelProviders() {
  const [mounted, setMounted] = useState(false)
  const [isProduction, setIsProduction] = useState(false)
  const [Analytics, setAnalytics] = useState<any>(null)
  const [SpeedInsights, setSpeedInsights] = useState<any>(null)
  
  useEffect(() => {
    setMounted(true)
    // Only load Vercel analytics on actual Vercel domains
    const isVercelDomain = typeof window !== 'undefined' && 
      (window.location.hostname.includes('vercel.app') || 
       window.location.hostname.includes('iron-track-dusky.vercel.app'))
    setIsProduction(process.env.NODE_ENV === 'production' && isVercelDomain)
  }, [])
  
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
  
  // Don't render anything until mounted and in production
  if (!mounted || !isProduction || !Analytics || !SpeedInsights) {
    return null
  }
  
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  )
}