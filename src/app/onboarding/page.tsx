'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingWrapper } from '@/components/onboarding/OnboardingWrapper'
import { LoadingState } from '@/components/onboarding/LoadingState'
import { saveOnboardingData } from '@/services/onboarding'
import { createClient } from '@/utils/supabase/client'
import type { OnboardingData } from '@/components/onboarding/OnboardingFlow'

export default function OnboardingPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuth = async () => {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      router.replace('/auth')
      return
    }

    setIsAuthenticated(true)
    setLoading(false)
  }

  const handleOnboardingComplete = async (data: OnboardingData) => {
    try {
      await saveOnboardingData(data)
      // Redirection vers le profil pour voir les modifications
      router.push('/profile?onboarding=success')
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde de vos préférences. Veuillez réessayer.')
    }
  }

  if (loading) {
    return <LoadingState message="Chargement..." />
  }

  if (!isAuthenticated) {
    return null
  }

  return <OnboardingWrapper onComplete={handleOnboardingComplete} />
}