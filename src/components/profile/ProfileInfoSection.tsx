'use client'

import { useState } from 'react'
import { InlineEditField } from '@/components/ui/InlineEditField'
import { createClient } from '@/utils/supabase/client'
import { EmailChangeModal } from '@/components/profile/EmailChangeModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          Informations personnelles
        </CardTitle>
      </CardHeader>
      <CardContent>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Email - Modification sécurisée */}
        <Card className="cursor-pointer hover:shadow-sm transition-all" onClick={() => setShowEmailChangeModal(true)}>
          <CardContent className="p-4">
          <div className="text-sm text-muted-foreground font-medium mb-2 flex items-center justify-between">
            📧 Email
            <button className="text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              Modifier
            </button>
          </div>
          <div className="font-bold text-foreground text-sm break-all">
            {profile.email}
          </div>
          <div className="text-xs text-gray-600 dark:text-safe-muted mt-1">Modification sécurisée disponible</div>
          </CardContent>
        </Card>

        {/* Pseudo */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-0">
            <InlineEditField
              label="👤 Pseudo"
              value={profile.pseudo}
              onSave={(value) => updateProfile('pseudo', value)}
              placeholder="Votre pseudo public"
              type="text"
              className="p-4"
            />
          </CardContent>
        </Card>

        {/* Objectif */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 dark:border-orange-800">
          <CardContent className="p-0">
            <InlineEditField
              label="🎯 Objectif"
              value={profile.goal}
              onSave={(value) => updateProfile('goal', value)}
              type="select"
              options={goalOptions}
              placeholder="Non renseigné"
              className="p-4"
            />
          </CardContent>
        </Card>

        {/* Niveau d'expérience */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-0">
            <InlineEditField
              label="🏆 Niveau d'expérience"
              value={profile.experience}
              onSave={(value) => updateProfile('experience', value)}
              type="select"
              options={experienceOptions}
              placeholder="Non renseigné"
              className="p-4"
            />
          </CardContent>
        </Card>

        {/* Fréquence d'entraînement */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-0">
            <InlineEditField
              label="📅 Fréquence d'entraînement"
              value={profile.frequency}
              onSave={(value) => updateProfile('frequency', value)}
              type="select"
              options={frequencyOptions}
              placeholder="Non renseigné"
              className="p-4"
            />
          </CardContent>
        </Card>

        {/* Disponibilité par séance */}
        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
          <CardContent className="p-0">
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
          </CardContent>
        </Card>

        {/* Âge */}
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-0">
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
          </CardContent>
        </Card>

        {/* Taille */}
        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
          <CardContent className="p-0">
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
          </CardContent>
        </Card>

        {/* Poids actuel */}
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-0">
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
          </CardContent>
        </Card>

        {/* Poids initial */}
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-0">
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
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="text-sm font-semibold">Modification instantanée</p>
              <p className="text-xs text-muted-foreground">
                Cliquez sur n'importe quel champ pour le modifier. Vos changements sont sauvegardés automatiquement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
      </CardContent>
    </Card>
  )
}