'use client'

import { useState } from 'react'
import { InlineEditField } from '@/components/ui/InlineEditField'
import { createClient } from '@/utils/supabase/client'
import { EmailChangeModal } from '@/components/profile/EmailChangeModal'

interface ProfileData {
  id: string
  email: string
  pseudo?: string
  goal?: 'Prise de masse' | 'Perte de poids' | 'Maintien' | 'Performance'
  experience?: 'Débutant' | 'Intermédiaire' | 'Avancé'
  frequency?: 'Faible' | 'Modérée' | 'Élevée'
  availability?: number
  initial_weight?: number
  height?: number
  weight?: number
  age?: number
  joinDate?: string
}

interface ProfileInfoSectionProps {
  profile: ProfileData
  onProfileUpdate: (updates: Partial<ProfileData>) => void
  onProgressionReload?: () => void
}

export function ProfileInfoSection({ profile, onProfileUpdate, onProgressionReload }: ProfileInfoSectionProps) {
  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false)
  const updateProfile = async (field: string, value: string | number) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('profiles')
      .update({ [field]: value })
      .eq('id', profile.id)

    if (error) {
      throw new Error(`Erreur lors de la mise à jour: ${error.message}`)
    }

    // Mettre à jour le profil local
    onProfileUpdate({ [field]: value })
    
    // Recharger les stats de progression si le poids ou le poids initial change
    if ((field === 'weight' || field === 'initial_weight') && onProgressionReload) {
      onProgressionReload()
    }
  }

  const goalOptions = [
    { value: 'Prise de masse', label: 'Prise de masse' },
    { value: 'Perte de poids', label: 'Perte de poids' },
    { value: 'Maintien', label: 'Maintien' },
    { value: 'Performance', label: 'Performance' }
  ]

  const experienceOptions = [
    { value: 'Débutant', label: 'Débutant' },
    { value: 'Intermédiaire', label: 'Intermédiaire' },
    { value: 'Avancé', label: 'Avancé' }
  ]

  const frequencyOptions = [
    { value: 'Faible', label: 'Faible (1-2 fois/semaine)' },
    { value: 'Modérée', label: 'Modérée (3-4 fois/semaine)' },
    { value: 'Élevée', label: 'Élevée (5+ fois/semaine)' }
  ]

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="font-bold text-gray-900 mb-6 text-xl">
        Informations personnelles
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Email - Modification sécurisée */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 group cursor-pointer hover:shadow-sm transition-all" onClick={() => setShowEmailChangeModal(true)}>
          <div className="text-sm text-gray-600 font-medium mb-2 flex items-center justify-between">
            📧 Email
            <button className="text-xs text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity">
              Modifier
            </button>
          </div>
          <div className="font-bold text-gray-800 text-sm break-all">
            {profile.email}
          </div>
          <div className="text-xs text-gray-500 mt-1">Modification sécurisée disponible</div>
        </div>

        {/* Pseudo */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
          <InlineEditField
            label="👤 Pseudo"
            value={profile.pseudo}
            onSave={(value) => updateProfile('pseudo', value)}
            placeholder="Votre pseudo public"
            type="text"
            className="p-4"
          />
        </div>

        {/* Objectif */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
          <InlineEditField
            label="🎯 Objectif"
            value={profile.goal}
            onSave={(value) => updateProfile('goal', value)}
            type="select"
            options={goalOptions}
            placeholder="Non renseigné"
            className="p-4"
          />
        </div>

        {/* Niveau d'expérience */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
          <InlineEditField
            label="🏆 Niveau d'expérience"
            value={profile.experience}
            onSave={(value) => updateProfile('experience', value)}
            type="select"
            options={experienceOptions}
            placeholder="Non renseigné"
            className="p-4"
          />
        </div>

        {/* Fréquence d'entraînement */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
          <InlineEditField
            label="📅 Fréquence d'entraînement"
            value={profile.frequency}
            onSave={(value) => updateProfile('frequency', value)}
            type="select"
            options={frequencyOptions}
            placeholder="Non renseigné"
            className="p-4"
          />
        </div>

        {/* Disponibilité par séance */}
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl border border-teal-200">
          <InlineEditField
            label="⏱️ Disponibilité par séance"
            value={profile.availability}
            onSave={(value) => updateProfile('availability', value)}
            type="number"
            min={30}
            max={180}
            unit="min"
            placeholder="Non renseigné"
            className="p-4"
          />
        </div>

        {/* Âge */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200">
          <InlineEditField
            label="🎂 Âge"
            value={profile.age}
            onSave={(value) => updateProfile('age', value)}
            type="number"
            min={13}
            max={100}
            unit="ans"
            placeholder="Non renseigné"
            className="p-4"
          />
        </div>

        {/* Taille */}
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl border border-cyan-200">
          <InlineEditField
            label="📏 Taille"
            value={profile.height}
            onSave={(value) => updateProfile('height', value)}
            type="number"
            min={100}
            max={250}
            unit="cm"
            placeholder="Non renseigné"
            className="p-4"
          />
        </div>

        {/* Poids actuel */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
          <InlineEditField
            label="⚖️ Poids actuel"
            value={profile.weight}
            onSave={(value) => updateProfile('weight', value)}
            type="number"
            min={30}
            max={300}
            step={0.1}
            unit="kg"
            placeholder="Non renseigné"
            className="p-4"
          />
        </div>

        {/* Poids initial */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200">
          <InlineEditField
            label="📊 Poids initial"
            value={profile.initial_weight}
            onSave={(value) => updateProfile('initial_weight', value)}
            type="number"
            min={30}
            max={300}
            step={0.1}
            unit="kg"
            placeholder="Non renseigné"
            className="p-4"
          />
        </div>
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="text-sm font-semibold text-blue-800">Modification instantanée</p>
            <p className="text-xs text-blue-700">
              Cliquez sur n'importe quel champ pour le modifier. Vos changements sont sauvegardés automatiquement.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de changement d'email sécurisé */}
      <EmailChangeModal
        isOpen={showEmailChangeModal}
        onClose={() => setShowEmailChangeModal(false)}
        currentEmail={profile.email}
        onEmailChanged={(newEmail) => {
          onProfileUpdate({ email: newEmail })
          setShowEmailChangeModal(false)
        }}
      />
    </div>
  )
}