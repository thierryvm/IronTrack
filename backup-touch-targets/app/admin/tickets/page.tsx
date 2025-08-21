'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import DOMPurify from 'dompurify'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  User,
  Calendar,
  Filter,
  Search,
  ArrowUpDown,
  MessageCircle,
  Eye,
  CheckCircle2,
  XCircle,
  Paperclip,
  Download
} from 'lucide-react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useSupport } from '@/hooks/useSupport'
// import AntiSpamDashboard from '@/components/admin/AntiSpamDashboard'
import { SupportTicket, SupportTicketPriority, SupportTicketStatus, SupportTicketCategory } from '@/types/support'

// Types pour les filtres
interface TicketFilters {
  status: SupportTicketStatus | 'all'
  category: SupportTicketCategory | 'all'
  priority: SupportTicketPriority | 'all'
  search: string
}

// Types pour le tri
type SortField = 'created_at' | 'priority' | 'status' | 'category'
type SortDirection = 'asc' | 'desc'

// ✅ Fonction throttle pour éviter appels API excessifs
const throttle = <T extends unknown[]>(func: (...args: T) => void, wait: number) => {
  let lastCall = 0
  return (...args: T) => {
    const now = Date.now()
    if (now - lastCall >= wait) {
      lastCall = now
      func(...args)
    }
  }
}

export default function AdminTicketsPage() {
  // Référence pour éviter les doubles appels
  const initialized = useRef(false)
  
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  // const [activeTab, setActiveTab] = useState<'tickets' | 'antispam'>('tickets')
  
  // États pour les filtres et tri
  const [filters, setFilters] = useState<TicketFilters>({
    status: 'all',
    category: 'all', 
    priority: 'all',
    search: ''
  })
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [showFilters, setShowFilters] = useState(false)

  const { logAdminAction, hasPermission } = useAdminAuth()
  const { getAllTickets, updateTicketStatus, updateTicketPriority } = useSupport()

  // ✅ CORRECTION CRITIQUE: Throttler les logs admin pour éviter appels excessifs
  const throttledLogAdminAction = useCallback(
    throttle((action: string, targetType: string) => {
      logAdminAction(action, targetType)
    }, 2000), // 2 secondes minimum entre les logs
    [logAdminAction]
  )

  // Charger les tickets - Version finale sans dépendances problématiques  
  const loadTickets = async (skipLogging = false) => {
    setLoading(true)
    try {
      const allTickets = await getAllTickets()
      setTickets(allTickets)
      
      // ✅ CORRECTION CRITIQUE: Utiliser throttled logging pour éviter boucles
      if (!skipLogging) {
        throttledLogAdminAction('tickets_viewed', 'tickets')
      }
    } catch (error) {
      console.error('[ERROR] Erreur chargement tickets:', (error as Error).message)
      setTickets([]) // S'assurer qu'on a au moins un tableau vide
    } finally {
      setLoading(false)
    }
  }

  // Chargement initial au mount - une seule fois avec protection useRef
  useEffect(() => {
    // Éviter les doubles appels avec useRef
    if (initialized.current) return
    initialized.current = true

    loadTickets()
    
    // Cleanup function pour reset lors des changements de route
    return () => {
      initialized.current = false
    }
  }, [loadTickets]) // Dependencies corrigées

  // Filtrer et trier les tickets
  const filteredAndSortedTickets = tickets
    .filter((ticket) => {
      if (filters.status !== 'all' && ticket.status !== filters.status) return false
      if (filters.category !== 'all' && ticket.category !== filters.category) return false
      if (filters.priority !== 'all' && ticket.priority !== filters.priority) return false
      if (filters.search && !ticket.title.toLowerCase().includes(filters.search.toLowerCase()) 
          && !ticket.description.toLowerCase().includes(filters.search.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortField) {
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 }
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        case 'category':
          comparison = a.category.localeCompare(b.category)
          break
      }
      
      return sortDirection === 'desc' ? -comparison : comparison
    })

  // Gérer le changement de statut
  const handleStatusChange = async (ticketId: string, newStatus: SupportTicketStatus) => {
    try {
      await updateTicketStatus(ticketId, newStatus)
      await loadTickets(true) // PATCH: Skip logging pour éviter boucle
      
      // Mettre à jour selectedTicket si c'est le ticket modifié
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus })
      }
    } catch (error) {
      console.error('Erreur mise à jour statut:', (error as Error).message)
    }
  }

  // Gérer le changement de priorité
  const handlePriorityChange = async (ticketId: string, newPriority: SupportTicketPriority) => {
    try {
      await updateTicketPriority(ticketId, newPriority)
      await loadTickets(true) // PATCH: Skip logging pour éviter boucle
      
      // Mettre à jour selectedTicket si c'est le ticket modifié
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, priority: newPriority })
      }
    } catch (error) {
      console.error('Erreur mise à jour priorité:', (error as Error).message)
    }
  }

  // Gérer le tri
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Fonctions d'affichage
  const getStatusIcon = (status: SupportTicketStatus) => {
    const icons = {
      'pending': <Clock className="h-4 w-4 text-yellow-500" />,
      'open': <Clock className="h-4 w-4 text-blue-500" />,
      'in_progress': <AlertTriangle className="h-4 w-4 text-orange-800 dark:text-orange-300" />,
      'waiting_user': <MessageCircle className="h-4 w-4 text-purple-500" />,
      'resolved': <CheckCircle className="h-4 w-4 text-green-500" />,
      'closed': <XCircle className="h-4 w-4 text-gray-600" />
    }
    return icons[status] || icons.open
  }

  const getStatusLabel = (status: SupportTicketStatus) => {
    const labels = {
      'pending': 'En attente',
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
      'low': 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
      'medium': 'bg-blue-100 text-blue-700',
      'high': 'bg-orange-100 text-orange-700',
      'critical': 'bg-red-100 text-red-700'
    }
    return colors[priority] || colors.medium
  }

  const getPriorityLabel = (priority: SupportTicketPriority) => {
    const labels = {
      'low': '📝 Faible',
      'medium': '📋 Normale', 
      'high': '🔥 Élevée',
      'critical': '🚨 Critique'
    }
    return labels[priority] || priority
  }

  const getCategoryLabel = (category: SupportTicketCategory) => {
    const labels = {
      'bug': '🐛 Bug',
      'feature': '💡 Fonctionnalité',
      'help': '❓ Aide',
      'feedback': '💬 Feedback',
      'account': '👤 Compte',
      'payment': '💳 Paiement'
    }
    return labels[category] || category
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-700">Chargement des tickets de support...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-orange-800 dark:text-orange-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestion des Tickets</h1>
                <p className="text-gray-600 dark:text-gray-700">
                  {filteredAndSortedTickets.length} ticket{filteredAndSortedTickets.length !== 1 ? 's' : ''} 
                  {filters.status !== 'all' || filters.category !== 'all' || filters.priority !== 'all' || filters.search 
                    ? ` (${tickets.length} au total)` : ''}
                </p>
              </div>
            </div>
          </div>
          
          {/* Actions rapides */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                showFilters 
                  ? 'bg-orange-100 text-orange-700' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </button>
            <button
              onClick={() => loadTickets(true)}
              className="flex items-center px-3 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              title="Recharger la liste des tickets"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Actualiser
            </button>
          </div>
        </div>

        {/* Barre de filtrages */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-6 border-t border-gray-200 dark:border-gray-600 pt-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Recherche */}
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-700" />
                    <input
                      type="text"
                      placeholder="Rechercher dans les tickets..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Filtre statut */}
                <div>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value as SupportTicketStatus | 'all' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="open">Ouvert</option>
                    <option value="in_progress">En cours</option>
                    <option value="waiting_user">Attente utilisateur</option>
                    <option value="resolved">Résolu</option>
                    <option value="closed">Fermé</option>
                  </select>
                </div>

                {/* Filtre catégorie */}
                <div>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value as SupportTicketCategory | 'all' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">Toutes catégories</option>
                    <option value="bug">Bug</option>
                    <option value="feature">Fonctionnalité</option>
                    <option value="help">Aide</option>
                    <option value="feedback">Feedback</option>
                    <option value="account">Compte</option>
                    <option value="payment">Paiement</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Liste des tickets */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden">
          {filteredAndSortedTickets.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Aucun ticket trouvé</h3>
            <p className="text-gray-600">
              {filters.status !== 'all' || filters.category !== 'all' || filters.search 
                ? 'Essayez de modifier vos filtres'
                : 'Les tickets de support apparaîtront ici'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* En-têtes de tableau */}
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('created_at')}
                      className="flex items-center space-x-1 hover:text-gray-700 dark:text-gray-300"
                    >
                      <span>Date</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center space-x-1 hover:text-gray-700 dark:text-gray-300"
                    >
                      <span>Statut</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('priority')}
                      className="flex items-center space-x-1 hover:text-gray-700 dark:text-gray-300"
                    >
                      <span>Priorité</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* Corps du tableau */}
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200">
                {filteredAndSortedTickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    className="hover:bg-gray-50 dark:bg-gray-800 cursor-pointer"
                    onClick={() => {
                      // 🔄 REDIRECTION vers page dédiée au lieu du modal
                      window.location.href = `/admin/tickets/${ticket.id}`
                    }}
                  >
                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-700" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="text-xs text-gray-600">
                            {new Date(ticket.created_at).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Ticket */}
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                            {ticket.title}
                          </span>
                          {ticket.attachments && ticket.attachments.length > 0 && (
                            <Paperclip className="h-3 w-3 text-gray-700" />
                          )}
                        </div>
                        <div className="text-xs text-gray-600">
                          {getCategoryLabel(ticket.category)}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-700 line-clamp-2 mt-1">
                          {ticket.description}
                        </div>
                      </div>
                    </td>

                    {/* Statut */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(ticket.status)}
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {getStatusLabel(ticket.status)}
                        </span>
                      </div>
                    </td>

                    {/* Priorité */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {getPriorityLabel(ticket.priority)}
                      </span>
                    </td>

                    {/* Utilisateur */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-700" />
                        <div>
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {ticket.profiles?.email || ticket.user_email || 'Email non disponible'}
                          </div>
                          {(ticket.profiles?.full_name || ticket.user_metadata?.name) && (
                            <div className="text-xs text-gray-600">
                              {ticket.profiles?.full_name || ticket.user_metadata?.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedTicket(ticket)
                            setShowDetails(true)
                          }}
                          className="p-2 text-gray-700 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {hasPermission('moderator') && ticket.status === 'open' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStatusChange(ticket.id, 'in_progress')
                            }}
                            className="p-2 text-gray-700 hover:text-orange-800 dark:text-orange-300 hover:bg-orange-50 dark:bg-orange-900/20 rounded-lg transition-colors"
                            title="Prendre en charge"
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </button>
                        )}
                        
                        {hasPermission('moderator') && ticket.status === 'in_progress' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStatusChange(ticket.id, 'resolved')
                            }}
                            className="p-2 text-gray-700 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                            title="Marquer comme résolu"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>

      {/* Modal de détails du ticket */}
      <AnimatePresence>
        {showDetails && selectedTicket && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={() => setShowDetails(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-4 bottom-4 md:inset-x-8 md:top-8 md:bottom-8 lg:inset-x-16 lg:top-12 lg:bottom-12 z-50 bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* En-tête du modal */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(selectedTicket.status)}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
                      {selectedTicket.title}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-700">
                      {getCategoryLabel(selectedTicket.category)} • 
                      {new Date(selectedTicket.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                    {getPriorityLabel(selectedTicket.priority)}
                  </span>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-2 hover:bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors"
                  >
                    <XCircle className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Contenu du modal */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Contenu principal */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Description</h3>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div 
                          className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(selectedTicket.description, {
                              ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'code', 'pre'],
                              ALLOWED_ATTR: [],
                              KEEP_CONTENT: true
                            })
                          }}
                        />
                      </div>
                    </div>

                    {/* Pièces jointes */}
                    {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                          Pièces jointes ({selectedTicket.attachments.length})
                        </h3>
                        <div className="space-y-2">
                          {selectedTicket.attachments.map((attachment: {originalName?: string; type: string; size: number; url: string}, index: number) => (
                            <div 
                              key={index}
                              className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <Paperclip className="h-4 w-4 text-gray-700" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {attachment.originalName || 'Fichier joint'}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {attachment.type} • {Math.round(attachment.size / 1024)} KB
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => window.open(attachment.url, '_blank')}
                                className="p-2 text-gray-700 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
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

                  {/* Sidebar avec actions */}
                  <div className="space-y-6">
                    {/* Informations utilisateur */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Utilisateur</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-700" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {selectedTicket.user_email || 'Email non disponible'}
                          </span>
                        </div>
                        {selectedTicket.user_metadata?.name && (
                          <div className="text-sm text-gray-600 dark:text-gray-700">
                            {selectedTicket.user_metadata.name}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions de modération */}
                    {hasPermission('moderator') && (
                      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Actions</h3>
                        <div className="space-y-2">
                          {/* Changer le statut */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Statut
                            </label>
                            <select
                              value={selectedTicket.status}
                              onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value as SupportTicketStatus)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                              <option value="pending">En attente</option>
                              <option value="open">Ouvert</option>
                              <option value="in_progress">En cours</option>
                              <option value="waiting_user">Attente utilisateur</option>
                              <option value="resolved">Résolu</option>
                              <option value="closed">Fermé</option>
                            </select>
                          </div>

                          {/* Changer la priorité */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Priorité
                            </label>
                            <select
                              value={selectedTicket.priority}
                              onChange={(e) => handlePriorityChange(selectedTicket.id, e.target.value as SupportTicketPriority)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                              <option value="low">📝 Faible</option>
                              <option value="medium">📋 Normale</option>
                              <option value="high">🔥 Élevée</option>
                              <option value="critical">🚨 Critique</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Statistiques du ticket */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Informations</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Créé le:</span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {new Date(selectedTicket.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Dernière MAJ:</span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {new Date(selectedTicket.updated_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">ID Ticket:</span>
                          <span className="text-gray-900 dark:text-gray-100 font-mono text-xs">
                            {selectedTicket.id.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}