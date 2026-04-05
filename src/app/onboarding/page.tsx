'use client'

import { useEffect, useState} from'react'
import { useRouter} from'next/navigation'

import { LoadingState } from'@/components/onboarding/LoadingState'
import type { OnboardingData } from'@/components/onboarding/OnboardingFlow'
import { OnboardingWrapper } from'@/components/onboarding/OnboardingWrapper'
import { saveOnboardingData } from'@/services/onboarding'
import { createClient } from'@/utils/supabase/client'

export default function OnboardingPage() {
 const router = useRouter()
 const [isAuthenticated, setIsAuthenticated] = useState(false)
 const [loading, setLoading] = useState(true)
 const [isSubmitting, setIsSubmitting] = useState(false)
 const [submitError, setSubmitError] = useState<string | null>(null)

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
 setSubmitError(null)
 setIsSubmitting(true)
 await saveOnboardingData(data)
 router.push('/workouts/new?onboarding=success')
 } catch (error) {
 setSubmitError(
 error instanceof Error
 ? error.message
 :'Impossible d’enregistrer ton profil pour le moment. Réessaie dans quelques instants.'
 )
 setIsSubmitting(false)
 }
 }

 if (loading) {
 return <LoadingState message="Préparation de ton profil…" />
 }

 if (!isAuthenticated) {
 return null
 }

 return (
 <OnboardingWrapper
 onComplete={handleOnboardingComplete}
 isSubmitting={isSubmitting}
 submitError={submitError}
 />
 )
}
