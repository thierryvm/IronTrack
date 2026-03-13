'use client'

import { useState } from 'react'
import { X, Shield, Mail, Lock, AlertTriangle, CheckCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface EmailChangeModalProps {
  isOpen: boolean
  onClose: () => void
  currentEmail: string
  onEmailChanged?: (newEmail: string) => void
}

export function EmailChangeModal({ isOpen, onClose, currentEmail }: EmailChangeModalProps) {
  const [step, setStep] = useState<'form' | 'verification' | 'success'>('form')
  const [newEmail, setNewEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validations côté client
      if (!newEmail || !confirmEmail || !password) {
        setError('Tous les champs sont requis')
        setLoading(false)
        return
      }

      if (newEmail !== confirmEmail) {
        setError('Les emails de confirmation ne correspondent pas')
        setLoading(false)
        return
      }

      if (newEmail === currentEmail) {
        setError('Le nouvel email doit être différent de l\'email actuel')
        setLoading(false)
        return
      }

      const supabase = createClient()

      // 1. Vérifier le mot de passe en tentant une connexion
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: currentEmail,
        password: password
      })

      if (authError) {
        setError('Mot de passe incorrect')
        setLoading(false)
        return
      }

      // 2. Nettoyer les demandes expirées
      await supabase.rpc('cleanup_expired_email_requests')

      // 3. Vérifier qu'il n'y a pas déjà une demande en cours
      const { data: existingRequests } = await supabase
        .from('email_change_requests')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('status', 'pending')

      if (existingRequests && existingRequests.length > 0) {
        setError('Une demande de changement d\'email est déjà en cours')
        setLoading(false)
        return
      }

      // 4. Créer la demande de changement d'email
      const verificationToken = generateSecureToken()
      const { error: insertError } = await supabase
        .from('email_change_requests')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          old_email: currentEmail,
          new_email: newEmail,
          verification_token: verificationToken,
          status: 'pending'
        })

      if (insertError) {
        if (insertError.message.includes('duplicate key')) {
          setError('Cet email est déjà utilisé par un autre compte')
        } else {
          setError('Erreur lors de la création de la demande')
        }
        setLoading(false)
        return
      }

      // 5. Envoyer l'email de vérification (simulation pour le moment)
      await sendVerificationEmail(newEmail, verificationToken)

      // 6. Passer à l'étape de vérification
      setStep('verification')
      setLoading(false)

    } catch (err) {
      console.error('[SECURITY] Erreur lors du changement d\'email:', (err as Error)?.message || 'Erreur inconnue')
      setError('Une erreur inattendue s\'est produite')
      setLoading(false)
    }
  }

  // Fonction pour générer un token sécurisé
  const generateSecureToken = (): string => {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  // Fonction pour envoyer l'email de vérification  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sendVerificationEmail = async (email: string, token: string) => {
    // Pour le moment, on simule l'envoi d'email
    // Dans une vraie implémentation, vous utiliseriez un service comme Resend, SendGrid, etc.// Simulation d'un délai d'envoi
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const handleResendVerification = async () => {
    setLoading(true)
    try {
      await sendVerificationEmail(newEmail, 'nouveau-token')
      setLoading(false)
    } catch {
      setError('Erreur lors du renvoi de l\'email')
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep('form')
    setNewEmail('')
    setConfirmEmail('')
    setPassword('')
    setError('')
    setLoading(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  rounded-xl shadow-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Changer d'email
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Processus sécurisé</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-safe-muted" />
          </button>
        </div>

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <span className="font-medium text-amber-800">Attention</span>
              </div>
              <p className="text-sm text-amber-700">
                Changer votre email nécessitera une validation par email et vous déconnectera de tous vos appareils.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email actuel
              </label>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                {currentEmail}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="inline h-6 w-6 mr-1" />
                Nouvel email
              </label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="nouveau@email.com"
                data-testid="new-email-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirmer le nouvel email
              </label>
              <input
                type="email"
                required
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="nouveau@email.com"
                data-testid="confirm-email-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Lock className="inline h-6 w-6 mr-1" />
                Mot de passe actuel (sécurité)
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Votre mot de passe actuel"
                data-testid="password-input"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Vérification...' : 'Changer l\'email'}
              </button>
            </div>
          </form>
        )}

        {step === 'verification' && (
          <div className="text-center space-y-4">
            <div className="p-4 bg-blue-50 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
              <Mail className="h-10 w-10 text-blue-600" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Vérification requise
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Un email de confirmation a été envoyé à :
              </p>
              <p className="font-medium text-blue-600 bg-blue-50 p-2 rounded-lg text-sm">
                {newEmail}
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Important :</strong> Cliquez sur le lien dans l'email pour confirmer le changement. 
                Vérifiez également vos spams.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleResendVerification}
                disabled={loading}
                className="px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Envoi...' : 'Renvoyer l\'email'}
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4">
            <div className="p-4 bg-green-50 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Email mis à jour !
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Votre email a été changé avec succès.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Terminé
            </button>
          </div>
        )}
      </div>
    </div>
  )
}