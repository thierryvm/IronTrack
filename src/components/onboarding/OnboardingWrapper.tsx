'use client'

import { useEffect, useState} from'react'
import { useRouter } from'next/navigation'

import { Logo } from'@/components/shared/Logo'
import { Button} from'@/components/ui/button'
import { createClient} from'@/utils/supabase/client'

import { LoadingState} from'./LoadingState'
import type { OnboardingData} from'./OnboardingFlow'
import { OnboardingFlow} from'./OnboardingFlow'

interface OnboardingWrapperProps {
 onComplete: (data: OnboardingData) => void | Promise<void>
 isSubmitting?: boolean
 submitError?: string | null
}

export function OnboardingWrapper({ onComplete, isSubmitting = false, submitError = null }: OnboardingWrapperProps) {
 const [existingData, setExistingData] = useState<Partial<OnboardingData>>({})
 const [loading, setLoading] = useState(true)
 const [isReturningUser, setIsReturningUser] = useState(false)
 const [loadError, setLoadError] = useState<string | null>(null)
 const router = useRouter()

 useEffect(() => {
 loadExistingData()
 }, []) // eslint-disable-line react-hooks/exhaustive-deps

 const loadExistingData = async () => {
 try {
 const supabase = createClient()
 const { data: { user } } = await supabase.auth.getUser()

 if (!user) return

 const { data, error } = await supabase
 .from('profiles')
 .select('goal, experience, frequency, availability, height, weight, age, initial_weight')
 .eq('id', user.id)
 .single()

 if (error) {
 setLoadError('Impossible de récupérer complètement ton profil. Tu peux quand même continuer la configuration.')
 return
 }

 const hasExistingData = Boolean(data?.goal || data?.experience)
 setIsReturningUser(hasExistingData)

 if (hasExistingData) {
 setExistingData({
 goal: data.goal,
 experience: data.experience,
 frequency: data.frequency,
 availability: data.availability,
 height: data.height,
 weight: data.weight,
 age: data.age,
 initial_weight: data.initial_weight,
 })
 }
 } catch (error) {
 setLoadError(
 error instanceof Error
 ? error.message
 :'Impossible de charger ton profil pour le moment.'
 )
 } finally {
 setLoading(false)
 }
 }

 if (loading) {
 return <LoadingState message="Chargement de ton profil…" />
 }

 return (
 <div className="min-h-[100dvh] bg-background px-4 py-6 sm:px-6 lg:px-8">
 <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
 <div className="flex flex-col gap-4 rounded-[28px] border border-border bg-card px-5 py-6 shadow-lg sm:px-8">
 <div className="flex items-center justify-between gap-3">
 <Logo iconSize="md" />
 <div className="rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
 Onboarding
 </div>
 </div>

 <div className="max-w-2xl space-y-2">
 <h1 className="text-3xl font-black text-foreground text-balance sm:text-4xl">
 Configure ton espace pour démarrer sans friction.
 </h1>
 <p className="text-sm leading-6 text-safe-muted sm:text-base">
 On te guide étape par étape pour préparer un profil plus utile sur mobile, avec un parcours plus clair pour l&apos;entraînement et le suivi.
 </p>
 </div>

 {loadError && (
 <div role="status" aria-live="polite" className="rounded-2xl border border-warning/25 bg-warning/10 px-4 py-3 text-sm text-warning-foreground">
 {loadError}
 </div>
 )}

 {submitError && (
 <div role="alert" aria-live="polite" className="rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
 {submitError}
 </div>
 )}
 </div>

 {isReturningUser ? (
 <div className="w-full space-y-4">
 <div className="rounded-[28px] border border-border bg-card p-6 shadow-lg sm:p-8">
 <div className="inline-flex items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 p-4">
 <span className="text-lg font-semibold text-primary">Profil existant</span>
 </div>

 <h2 className="mt-5 text-2xl font-bold text-foreground">
 Bon retour sur IronTrack !
 </h2>
 <p className="mt-2 max-w-2xl text-safe-muted">
 Un profil existe déjà. Tu peux conserver la configuration actuelle ou la compléter pour profiter du nouveau parcours.
 </p>

 <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
 <div className="rounded-2xl border border-border bg-muted/35 p-5">
 <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-safe-muted">Profil actuel</h3>
 <div className="mt-4 grid gap-3 sm:grid-cols-2">
 <p className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-safe-muted"><span className="font-medium text-foreground">Objectif:</span> {existingData.goal ||'Non défini'}</p>
 <p className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-safe-muted"><span className="font-medium text-foreground">Expérience:</span> {existingData.experience ||'Non définie'}</p>
 <p className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-safe-muted"><span className="font-medium text-foreground">Fréquence:</span> {existingData.frequency ||'Non définie'}</p>
 <p className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-safe-muted"><span className="font-medium text-foreground">Durée:</span> {existingData.availability ? `${existingData.availability} min` :'Non définie'}</p>
 </div>
 </div>

 <div className="rounded-2xl border border-primary/15 bg-primary/8 p-5">
 <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Ce que tu peux faire</h3>
 <p className="mt-3 text-sm leading-6 text-safe-muted">
 Compléter les données physiques, revoir l&apos;objectif et préparer directement ta première séance après configuration.
 </p>
 </div>
 </div>

 <div className="mt-6 grid gap-3 sm:grid-cols-2">
 <Button
 variant="outline"
 fullWidth
 onClick={() => router.push('/')}
 disabled={isSubmitting}
 >
 Garder mon profil actuel
 </Button>
 <Button
 fullWidth
 onClick={() => setIsReturningUser(false)}
 disabled={isSubmitting}
 >
 Compléter mon profil
 </Button>
 </div>
 </div>
 </div>
 ) : (
 <OnboardingFlow onComplete={onComplete} initialData={existingData} isSubmitting={isSubmitting} />
 )}
 </div>
 </div>
 )
}
