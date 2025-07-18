import { createClient } from '@/utils/supabase/client'
import type { OnboardingData } from '@/components/onboarding/OnboardingFlow'

export async function saveOnboardingData(data: OnboardingData): Promise<void> {
  const supabase = createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    throw new Error('Utilisateur non connecté')
  }

  // Récupérer les données existantes pour éviter l'écrasement
  const { data: existingProfile, error: fetchError } = await supabase
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

  // Debug : log des données reçues
  console.log('🔍 Données onboarding reçues:', data)
  console.log('🔍 Profil existant:', existingProfile)

  // Mise à jour complète : permettre l'écrasement pour re-faire l'onboarding
  // L'onboarding peut maintenant mettre à jour toutes les données
  
  // Préférences d'entraînement : toujours mettre à jour
  updateData.goal = data.goal
  updateData.experience = data.experience
  updateData.frequency = data.frequency
  updateData.availability = data.availability
  console.log('✅ Mise à jour goal:', data.goal)
  console.log('✅ Mise à jour experience:', data.experience)
  console.log('✅ Mise à jour frequency:', data.frequency)
  console.log('✅ Mise à jour availability:', data.availability)
  
  // Données physiques : permettre la mise à jour via onboarding
  updateData.height = data.height
  updateData.weight = data.weight
  updateData.age = data.age
  console.log('✅ Mise à jour height:', data.height, '(ancienne valeur:', existingProfile?.height, ')')
  console.log('✅ Mise à jour weight:', data.weight, '(ancienne valeur:', existingProfile?.weight, ')')
  console.log('✅ Mise à jour age:', data.age, '(ancienne valeur:', existingProfile?.age, ')')
  
  // Poids initial : ne mettre à jour que si pas encore défini
  if (!existingProfile?.initial_weight) {
    updateData.initial_weight = data.initial_weight
    console.log('✅ Mise à jour initial_weight:', data.initial_weight)
  } else {
    console.log('⚠️ Initial_weight existant conservé:', existingProfile.initial_weight, '(pour préserver l\'historique de progression)')
  }

  console.log('🔍 Données finales à envoyer:', updateData)
  console.log('🔍 Mapping des valeurs:')
  console.log('  - Goal onboarding:', data.goal, '→ Goal DB:', updateData.goal)
  console.log('  - Experience onboarding:', data.experience, '→ Experience DB:', updateData.experience)
  console.log('  - Frequency onboarding:', data.frequency, '→ Frequency DB:', updateData.frequency)

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)

  if (error) {
    throw new Error(`Erreur lors de la sauvegarde: ${error.message}`)
  }
}

export async function checkOnboardingStatus(): Promise<boolean> {
  const supabase = createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return false
  }

  const { data, error } = await supabase
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