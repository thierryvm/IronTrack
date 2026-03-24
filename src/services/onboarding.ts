import { createClient} from'@/utils/supabase/client'
import type { OnboardingData} from'@/components/onboarding/OnboardingFlow'

export async function saveOnboardingData(data: OnboardingData): Promise<void> {
 const supabase = createClient()
 
 const { data: { user}, error: userError} = await supabase.auth.getUser()
 
 if (userError || !user) {
 throw new Error('Utilisateur non connecté')
}

 // Récupérer les données existantes pour éviter l'écrasement
 const { data: existingProfile, error: fetchError} = await supabase
 .from('profiles')
 .select('goal, experience, frequency, availability, height, weight, age, initial_weight')
 .eq('id', user.id)
 .single()

 if (fetchError) {
 throw new Error(`Erreur lors de la récupération du profil: ${fetchError.message}`)
}

 // Préparer les données à mettre à jour (ne pas écraser si déjà défini)
 const updateData: {
 onboarding_completed: boolean
 goal?: string
 experience?: string
 frequency?: string
 availability?: number
 height?: number
 weight?: number
 age?: number
 initial_weight?: number
} = {
 onboarding_completed: true
}


 // Mise à jour complète : permettre l'écrasement pour re-faire l'onboarding
 // L'onboarding peut maintenant mettre à jour toutes les données
 
 // Préférences d'entraînement : toujours mettre à jour
 updateData.goal = data.goal
 updateData.experience = data.experience
 updateData.frequency = data.frequency
 updateData.availability = data.availability
 
 // Données physiques : permettre la mise à jour via onboarding
 updateData.height = data.height
 updateData.weight = data.weight
 updateData.age = data.age
 
 // Poids initial : ne mettre à jour que si pas encore défini
 if (!existingProfile?.initial_weight) {
 updateData.initial_weight = data.initial_weight
}

 const { error} = await supabase
 .from('profiles')
 .update(updateData)
 .eq('id', user.id)

 if (error) {
 throw new Error(`Erreur lors de la sauvegarde: ${error.message}`)
}
}

export async function checkOnboardingStatus(): Promise<boolean> {
 const supabase = createClient()
 
 const { data: { user}, error: userError} = await supabase.auth.getUser()
 
 if (userError || !user) {
 return false
}

 const { data, error} = await supabase
 .from('profiles')
 .select('onboarding_completed')
 .eq('id', user.id)
 .single()

 if (error) {
 console.error('Erreur lors de la vérification du statut onboarding:', error)
 return false
}

 return data?.onboarding_completed === true
}