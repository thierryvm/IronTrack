'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  User,
  Send,
  Paperclip,
  Download,
  Eye,
  EyeOff,
  XCircle,
  UserCheck
} from 'lucide-react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useSupport } from '@/hooks/useSupport'
import { SupportTicket, SupportTicketStatus, SupportTicketPriority, TicketResponse } from '@/types/support'
import DOMPurify from 'dompurify'

export default function AdminTicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params.id as string

  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [responses, setResponses] = useState<TicketResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingResponse, setSendingResponse] = useState(false)
  const [responseMessage, setResponseMessage] = useState('')
  const [isInternalNote, setIsInternalNote] = useState(false)
  const [showInternalNotes, setShowInternalNotes] = useState(true)

  const { hasPermission, logAdminAction } = useAdminAuth()
  const { 
    getTicketWithResponses, 
    addTicketResponse, 
    updateTicketStatus, 
    updateTicketPriority 
  } = useSupport()

  // Charger le ticket et ses réponses avec force refresh
  const loadTicketData = async (forceRefresh = false) => {
    setLoading(true)
    try {
      console.log('[DEBUG] loadTicketData - forceRefresh:', forceRefresh)
      
      const { ticket: ticketData, responses: responsesData } = await getTicketWithResponses(ticketId)
      
      if (!ticketData) {
        console.log('[DEBUG] Aucun ticket trouvé, redirection')
        router.push('/admin/tickets')
        return
      }

      console.log('[DEBUG] Ticket chargé:', ticketData.id, 'status:', ticketData.status)
      console.log('[DEBUG] Réponses chargées:', responsesData.length)

      setTicket(ticketData)
      setResponses(responsesData)
      
      await logAdminAction('view_ticket_details', 'support_ticket', ticketId)
    } catch (error) {
      console.error('Erreur chargement ticket:', error)
      router.push('/admin/tickets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (ticketId && hasPermission('admin')) {
      loadTicketData()
    } else if (!hasPermission('admin')) {
      router.push('/admin')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId, hasPermission])

  // Envoyer une réponse avec mise à jour optimiste
  const handleSendResponse = async () => {
    if (!responseMessage.trim() || !ticket) return

    setSendingResponse(true)
    
    // 🚀 OPTIMISATION UX: Ajouter immédiatement la réponse à l'interface
    const tempResponse: TicketResponse = {
      id: `temp-${Date.now()}`,
      ticket_id: ticket.id,
      user_id: 'current-admin-user', // Sera remplacé par la vraie réponse
      user_email: 'Vous',
      message: responseMessage,
      is_internal: isInternalNote,
      is_solution: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // Ajouter temporairement à la liste
    setResponses(prevResponses => [...prevResponses, tempResponse])
    
    // Nettoyer le formulaire immédiatement
    const savedMessage = responseMessage
    const savedIsInternal = isInternalNote
    setResponseMessage('')
    setIsInternalNote(false)

    try {
      console.log('[DEBUG] Envoi réponse:', savedIsInternal ? 'INTERNE' : 'PUBLIC')
      const success = await addTicketResponse(ticket.id, savedMessage, savedIsInternal)
      
      if (success) {
        console.log('[DEBUG] Réponse envoyée avec succès - synchronisation background')
        
        // 🔄 SYNCHRONISATION EN BACKGROUND: Recharger seulement les réponses pour avoir les IDs corrects
        const { responses: freshResponses } = await getTicketWithResponses(ticket.id)
        setResponses(freshResponses)
        
        await logAdminAction('send_ticket_response', 'support_ticket', ticket.id)
      } else {
        // 🔄 ROLLBACK: Restaurer l'état en cas d'échec
        console.log('[DEBUG] Échec envoi réponse, rollback interface')
        setResponses(prevResponses => prevResponses.filter(r => r.id !== tempResponse.id))
        setResponseMessage(savedMessage)
        setIsInternalNote(savedIsInternal)
      }
    } catch (error) {
      console.error('Erreur envoi réponse:', error)
      // 🔄 ROLLBACK: Restaurer l'état en cas d'erreur
      setResponses(prevResponses => prevResponses.filter(r => r.id !== tempResponse.id))
      setResponseMessage(savedMessage)
      setIsInternalNote(savedIsInternal)
    } finally {
      setSendingResponse(false)
    }
  }

  // Changer le statut du ticket
  const handleStatusChange = async (newStatus: SupportTicketStatus) => {
    if (!ticket) return

    // 🚀 OPTIMISATION UX: Mise à jour immédiate de l'interface
    const previousStatus = ticket.status
    setTicket(prevTicket => prevTicket ? { ...prevTicket, status: newStatus } : null)

    try {
      console.log('[DEBUG] Changement statut:', previousStatus, '→', newStatus)
      const success = await updateTicketStatus(ticket.id, newStatus)
      if (success) {
        console.log('[DEBUG] Statut changé avec succès côté serveur')
        await logAdminAction('update_ticket_status', 'support_ticket', ticket.id)
        // Optionnel: recharger en background pour synchroniser
        // await loadTicketData(true)
      } else {
        // 🔄 ROLLBACK: Restaurer l'ancien statut en cas d'échec
        console.log('[DEBUG] Échec changement statut, rollback interface')
        setTicket(prevTicket => prevTicket ? { ...prevTicket, status: previousStatus } : null)
      }
    } catch (error) {
      console.error('Erreur changement statut:', error)
      // 🔄 ROLLBACK: Restaurer l'ancien statut en cas d'erreur
      setTicket(prevTicket => prevTicket ? { ...prevTicket, status: previousStatus } : null)
    }
  }

  // Changer la priorité du ticket
  const handlePriorityChange = async (newPriority: SupportTicketPriority) => {
    if (!ticket) return

    // 🚀 OPTIMISATION UX: Mise à jour immédiate de l'interface
    const previousPriority = ticket.priority
    setTicket(prevTicket => prevTicket ? { ...prevTicket, priority: newPriority } : null)

    try {
      console.log('[DEBUG] Changement priorité:', previousPriority, '→', newPriority)
      const success = await updateTicketPriority(ticket.id, newPriority)
      if (success) {
        console.log('[DEBUG] Priorité changée avec succès côté serveur')
        await logAdminAction('update_ticket_priority', 'support_ticket', ticket.id)
        // Optionnel: recharger en background pour synchroniser
        // await loadTicketData(true)
      } else {
        // 🔄 ROLLBACK: Restaurer l'ancienne priorité en cas d'échec
        console.log('[DEBUG] Échec changement priorité, rollback interface')
        setTicket(prevTicket => prevTicket ? { ...prevTicket, priority: previousPriority } : null)
      }
    } catch (error) {
      console.error('Erreur changement priorité:', error)
      // 🔄 ROLLBACK: Restaurer l'ancienne priorité en cas d'erreur
      setTicket(prevTicket => prevTicket ? { ...prevTicket, priority: previousPriority } : null)
    }
  }

  // Fonctions d'affichage
  const getStatusIcon = (status: SupportTicketStatus) => {
    const icons = {
      'open': <Clock className="h-4 w-4 text-blue-500" />,
      'in_progress': <AlertTriangle className="h-4 w-4 text-orange-800" />,
      'waiting_user': <MessageSquare className="h-4 w-4 text-purple-500" />,
      'resolved': <CheckCircle className="h-4 w-4 text-green-500" />,
      'closed': <XCircle className="h-4 w-4 text-gray-500" />
    }
    return icons[status] || icons.open
  }

  const getStatusLabel = (status: SupportTicketStatus) => {
    const labels = {
      'open': 'Ouvert',
      'in_progress': 'En cours',
      'waiting_user': 'Attente utilisateur',
      'resolved': 'Résolu',
      'closed': 'Fermé'
    }
    return labels[status] || status
  }

  const getPriorityColor = (priority: SupportTicketPriority) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-700',
      'medium': 'bg-blue-100 text-blue-700',
      'high': 'bg-orange-100 text-orange-700',
      'critical': 'bg-red-100 text-red-700'
    }
    return colors[priority] || colors.medium
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

  // Filtrer les réponses selon la visibilité des notes internes
  const filteredResponses = responses.filter(response => 
    showInternalNotes || !response.is_internal
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement du ticket...</p>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Ticket non trouvé</h3>
        <p className="text-gray-500 mb-4">Ce ticket n'existe pas ou a été supprimé.</p>
        <button
          onClick={() => router.push('/admin/tickets')}
          className="px-4 py-2 bg-orange-700 text-white rounded-lg hover:bg-orange-800 transition-colors"
        >
          Retour aux tickets
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec navigation */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => router.push('/admin/tickets')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Retour aux tickets"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              {getStatusIcon(ticket.status)}
              <h1 className="text-2xl font-bold text-gray-900 line-clamp-1">
                {ticket.title}
              </h1>
            </div>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <span>{getCategoryLabel(ticket.category)}</span>
              <span>•</span>
              <span>Créé le {new Date(ticket.created_at).toLocaleDateString('fr-FR')}</span>
              <span>•</span>
              <span>Par {ticket.user_email || 'Utilisateur inconnu'}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
              {ticket.priority?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Statut:</label>
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value as SupportTicketStatus)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="open">Ouvert</option>
              <option value="in_progress">En cours</option>
              <option value="waiting_user">Attente utilisateur</option>
              <option value="resolved">Résolu</option>
              <option value="closed">Fermé</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Priorité:</label>
            <select
              value={ticket.priority}
              onChange={(e) => handlePriorityChange(e.target.value as SupportTicketPriority)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="critical">Critique</option>
            </select>
          </div>

          <button
            onClick={() => setShowInternalNotes(!showInternalNotes)}
            className={`flex items-center px-3 py-1 text-sm rounded-lg transition-colors ${
              showInternalNotes
                ? 'bg-orange-100 text-orange-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showInternalNotes ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
            Notes internes
          </button>
        </div>
      </div>

      {/* Contenu principal en deux colonnes */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Colonne principale - Conversation */}
        <div className="xl:col-span-2 space-y-6">
          {/* Description du ticket */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {ticket.user_email || 'Utilisateur'}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(ticket.created_at).toLocaleString('fr-FR')}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div 
                className="text-sm text-gray-700 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(ticket.description, {
                    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'code', 'pre'],
                    ALLOWED_ATTR: [],
                    KEEP_CONTENT: true
                  })
                }}
              />
            </div>

            {/* Pièces jointes du ticket original */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Pièces jointes ({ticket.attachments.length})
                </h4>
                <div className="space-y-2">
                  {ticket.attachments.map((attachment: { originalName?: string; type: string; size: number; url: string }, index: number) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-2 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <Paperclip className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {attachment.originalName || 'Fichier joint'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {attachment.type} • {Math.round(attachment.size / 1024)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => window.open(attachment.url, '_blank')}
                        className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                        title="Télécharger"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Fil de conversation */}
          <div className="space-y-4">
            {filteredResponses.map((response) => (
              <motion.div
                key={response.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    response.is_internal 
                      ? 'bg-orange-100' 
                      : response.user_id === ticket.user_id 
                        ? 'bg-blue-100' 
                        : 'bg-green-100'
                  }`}>
                    {response.is_internal ? (
                      <UserCheck className="h-5 w-5 text-orange-800" />
                    ) : response.user_id === ticket.user_id ? (
                      <User className="h-5 w-5 text-blue-600" />
                    ) : (
                      <UserCheck className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {response.user_email || 'Support'}
                      </span>
                      {response.is_internal && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                          Note interne
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(response.created_at).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div 
                        className="text-sm text-gray-700 whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(response.message, {
                            ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'code', 'pre'],
                            ALLOWED_ATTR: [],
                            KEEP_CONTENT: true
                          })
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Formulaire de réponse */}
          {hasPermission('moderator') && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Répondre au ticket</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="w-4 h-4 text-orange-800 focus:ring-orange-500 rounded"
                    />
                    <span className="text-sm text-gray-700">Note interne (non visible par l'utilisateur)</span>
                  </label>
                </div>

                <textarea
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder={isInternalNote 
                    ? "Rédigez une note interne pour l'équipe..."
                    : "Rédigez votre réponse à l'utilisateur..."
                  }
                />

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {responseMessage.length} caractères
                  </div>
                  <button
                    onClick={handleSendResponse}
                    disabled={!responseMessage.trim() || sendingResponse}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      !responseMessage.trim() || sendingResponse
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isInternalNote
                          ? 'bg-orange-600 text-white hover:bg-orange-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {sendingResponse ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {sendingResponse 
                      ? 'Envoi...' 
                      : isInternalNote 
                        ? 'Ajouter note interne'
                        : 'Envoyer réponse'
                    }
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Informations du ticket */}
        <div className="space-y-6">
          {/* Informations utilisateur */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilisateur</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {ticket.user_email || 'Email non disponible'}
                </span>
              </div>
              {ticket.profiles?.full_name && (
                <div className="text-sm text-gray-600">
                  {ticket.profiles.full_name}
                </div>
              )}
            </div>
          </div>

          {/* Détails du ticket */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">ID:</span>
                <span className="text-sm font-mono text-gray-900">
                  {ticket.id.slice(0, 8)}...
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Statut:</span>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(ticket.status)}
                  <span className="text-sm text-gray-900">
                    {getStatusLabel(ticket.status)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Priorité:</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority?.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Créé:</span>
                <span className="text-sm text-gray-900">
                  {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Modifié:</span>
                <span className="text-sm text-gray-900">
                  {new Date(ticket.updated_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Réponses:</span>
                <span className="text-sm font-medium text-gray-900">
                  {responses.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Notes internes:</span>
                <span className="text-sm font-medium text-gray-900">
                  {responses.filter(r => r.is_internal).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Réponses publiques:</span>
                <span className="text-sm font-medium text-gray-900">
                  {responses.filter(r => !r.is_internal).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}