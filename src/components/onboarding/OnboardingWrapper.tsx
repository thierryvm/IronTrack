'use client'

import { useEffect, useState} from'react'
import { createClient} from'@/utils/supabase/client'
import { OnboardingFlow} from'./OnboardingFlow'
import { LoadingState} from'./LoadingState'
import { Button} from'@/components/ui/button'
import type { OnboardingData} from'./OnboardingFlow'

interface OnboardingWrapperProps {
 onComplete: (data: OnboardingData) => void
}

export function OnboardingWrapper({ onComplete}: OnboardingWrapperProps) {
 const [existingData, setExistingData] = useState<Partial<OnboardingData>>({})
 const [loading, setLoading] = useState(true)
 const [isReturningUser, setIsReturningUser] = useState(false)

 useEffect(() => {
 loadExistingData()
}, []) // eslint-disable-line react-hooks/exhaustive-deps

 const loadExistingData = async () => {
 try {
 const supabase = createClient()
 const { data: { user}} = await supabase.auth.getUser()

 if (!user) return

 const { data, error} = await supabase
 .from('profiles')
 .select('goal, experience, frequency, availability')
 .eq('id', user.id)
 .single()

 if (error) {
 console.error('Erreur chargement profil:', error)
 return
}

 const hasExistingData = data?.goal || data?.experience
 setIsReturningUser(hasExistingData)

 if (hasExistingData) {
 setExistingData({
 goal: data.goal,
 experience: data.experience,
 frequency: data.frequency,
 availability: data.availability
})
}
} catch (error) {
 console.error('Erreur lors du chargement des données:', error)
} finally {
 setLoading(false)
}
}

 if (loading) {
 return <LoadingState message="Chargement de votre profil..." />
}

 return (
 <div className="min-h-screen bg-background flex items-center justify-center p-4">
 {isReturningUser ? (
 <div className="w-full max-w-2xl space-y-4">
 <div className="bg-card border border-border rounded-xl shadow-sm p-8 text-center">
 <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-500/10 rounded-full mb-4">
 <span className="text-2xl" role="img" aria-label="Bienvenue">👋</span>
 </div>
 <h2 className="text-2xl font-bold text-foreground mb-2">
 Bon retour sur IronTrack !
 </h2>
 <p className="text-muted-foreground mb-6">
 Vous avez déjà un profil configuré. Souhaitez-vous le mettre à jour ?
 </p>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-left">
 <div className="bg-muted p-4 rounded-lg">
 <h3 className="font-semibold text-foreground mb-2 text-sm">Profil actuel</h3>
 <div className="text-sm text-muted-foreground space-y-1">
 <p><span className="font-medium text-foreground">Objectif :</span> {existingData.goal ||'Non défini'}</p>
 <p><span className="font-medium text-foreground">Expérience :</span> {existingData.experience ||'Non définie'}</p>
 <p><span className="font-medium text-foreground">Fréquence :</span> {existingData.frequency ||'Non définie'}</p>
 <p><span className="font-medium text-foreground">Disponibilité :</span> {existingData.availability ? `${existingData.availability} min` :'Non définie'}</p>
 </div>
 </div>

 <div className="bg-brand-500/5 border border-brand-500/20 p-4 rounded-lg">
 <h3 className="font-semibold text-foreground mb-2 text-sm">Mise à jour</h3>
 <p className="text-sm text-muted-foreground">
 Complétez uniquement les champs manquants sans écraser vos données existantes.
 </p>
 </div>
 </div>

 <div className="flex gap-2 justify-center">
 <Button
 variant="outline"
 onClick={() => window.location.href ='/'}
 >
 Garder mon profil actuel
 </Button>
 <Button
 onClick={() => setIsReturningUser(false)}
 >
 Compléter mon profil
 </Button>
 </div>
 </div>
 </div>
 ) : (
 <OnboardingFlow onComplete={onComplete} initialData={existingData} />
 )}
 </div>
 )
}
