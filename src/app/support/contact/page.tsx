'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, MessageSquare, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { SupportTicketForm2025 } from '@/components/support/SupportTicketForm2025'
import { useSupport } from '@/hooks/useSupport'
import { SupportTicket } from '@/types/support'

function ContactSupportPageContent() {
  const [showForm, setShowForm] = useState(true)
  const [userTickets, setUserTickets] = useState<SupportTicket[]>([])
  const [loadingTickets, setLoadingTickets] = useState(false)
  const [initialCategory, setInitialCategory] = useState<'bug' | 'feature' | 'help' | 'feedback' | 'account' | 'payment'>('help')
  const { getUserTickets } = useSupport()
  const searchParams = useSearchParams()

  // Détecter la catégorie depuis l'URL
  useEffect(() => {
    const category = searchParams.get('category')
    if (category && ['bug', 'feature', 'help', 'feedback', 'account', 'payment'].includes(category)) {
      setInitialCategory(category as 'bug' | 'feature' | 'help' | 'feedback' | 'account' | 'payment')
    }
  }, [searchParams])

  const handleFormSuccess = async () => {
    setShowForm(false)
    // Recharger les tickets de l'utilisateur
    setLoadingTickets(true)
    const tickets = await getUserTickets()
    setUserTickets(tickets)
    setLoadingTickets(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-6 w-6 text-safe-info" />
      case 'in_progress':
        return <AlertCircle className="h-6 w-6 text-orange-800 dark:text-orange-300" />
      case 'resolved':
      case 'closed':
        return <CheckCircle className="h-6 w-6 text-safe-success" />
      default:
        return <Clock className="h-6 w-6 text-gray-600 dark:text-safe-muted" />
    }
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      'open': 'Ouvert',
      'in_progress': 'En cours',
      'waiting_user': 'En attente de votre réponse',
      'resolved': 'Résolu',
      'closed': 'Fermé'
    }
    return labels[status as keyof typeof labels] || status
  }

  const getCategoryLabel = (category: string) => {
    const labels = {
      'bug': '🐛 Bug',
      'feature': '💡 Fonctionnalité',
      'help': '❓ Aide',
      'feedback': '💬 Feedback',
      'account': '👤 Compte',
      'payment': '💳 Paiement'
    }
    return labels[category as keyof typeof labels] || category
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header avec navigation */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/support"
                className="p-2 hover:bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <MessageSquare className="h-8 w-8 text-orange-800 dark:text-orange-300" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Contact Support</h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    {showForm ? 'Décrivez votre problème ou demande' : 'Votre demande a été envoyée'}
                  </p>
                </div>
              </div>
            </div>
            
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Nouvelle demande
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire principal */}
          <div className="lg:col-span-2">
            {showForm ? (
              <SupportTicketForm2025 
                onSuccess={handleFormSuccess} 
                initialCategory={initialCategory}
              />
            ) : (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Vos demandes récentes</h2>
                
                {loadingTickets ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mr-3" />
                    <span className="text-gray-600 dark:text-gray-300">Chargement de vos tickets...</span>
                  </div>
                ) : userTickets.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-700 dark:text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-safe-muted">Aucune demande trouvée.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userTickets.map((ticket) => (
                      <div key={ticket.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{ticket.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-safe-muted">
                              <span>{getCategoryLabel(ticket.category)}</span>
                              <span>•</span>
                              <span>{new Date(ticket.created_at).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(ticket.status)}
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {getStatusLabel(ticket.status)}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">{ticket.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar avec informations */}
          <div className="space-y-6">
            {/* Temps de réponse */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">⏱️ Temps de réponse</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">🐛 Bugs critiques</span>
                  <span className="text-sm font-medium text-red-600">&lt; 2h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">👤 Problèmes de compte</span>
                  <span className="text-sm font-medium text-orange-800 dark:text-orange-300">&lt; 4h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">❓ Aide générale</span>
                  <span className="text-sm font-medium text-blue-600">&lt; 24h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">💡 Nouvelles fonctionnalités</span>
                  <span className="text-sm font-medium text-green-600">&lt; 72h</span>
                </div>
              </div>
            </div>

            {/* Conseils */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Conseils pour une réponse rapide</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Soyez précis dans votre description</li>
                <li>• Mentionnez les étapes pour reproduire le problème</li>
                <li>• Précisez votre navigateur et appareil</li>
                <li>• Joignez des captures d'écran si possible</li>
              </ul>
            </div>

            {/* Ressources alternatives */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">📚 Ressources utiles</h3>
              <div className="space-y-3">
                <Link 
                  href="/faq"
                  className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:bg-gray-800 transition-colors"
                >
                  <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">Questions Fréquentes</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Réponses aux questions courantes</p>
                </Link>
                
                <Link 
                  href="/support"
                  className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:bg-gray-800 transition-colors"
                >
                  <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">Guide d'utilisation</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Documentation complète</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ContactSupportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Chargement...</p>
        </div>
      </div>
    }>
      <ContactSupportPageContent />
    </Suspense>
  )
}