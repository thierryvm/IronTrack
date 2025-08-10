'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { HeadphonesIcon, Users, Calendar, Bell, ArrowLeft, ExternalLink } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useAdminRole } from '@/hooks/useAdminRole'

interface Notification {
  id: string
  type: string
  message: string
  created_at: string
  href?: string
  description?: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const { isAdmin, isModerator, loading: roleLoading } = useAdminRole()

  useEffect(() => {
    console.log('[NOTIFICATIONS DEBUG] useEffect triggered - roleLoading:', roleLoading, 'isAdmin:', isAdmin, 'isModerator:', isModerator)
    
    // Attendre que les rôles soient chargés avant de récupérer les notifications
    if (roleLoading) {
      console.log('[NOTIFICATIONS DEBUG] Role still loading, waiting...')
      return
    }

    const loadAllNotifications = async () => {
      try {
        console.log('[NOTIFICATIONS DEBUG] Starting loadAllNotifications...')
        const supabase = createClient()
        
        // Vérifier l'authentification d'abord
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        console.log('[NOTIFICATIONS DEBUG] Current user:', user?.email, 'userError:', userError)
        
        console.log('[NOTIFICATIONS DEBUG] Loading notifications - isAdmin:', isAdmin, 'isModerator:', isModerator)
        
        // SÉCURITÉ: Charger tickets support UNIQUEMENT pour admins/modérateurs
        let tickets = null
        let error = null
        if (isAdmin || isModerator) {
          console.log('[NOTIFICATIONS DEBUG] User has admin/moderator role, fetching support tickets...')
          const result = await supabase
            .from('support_tickets')
            .select('*')
            .order('created_at', { ascending: false })
          tickets = result.data
          error = result.error
          console.log('[NOTIFICATIONS DEBUG] Support tickets result:', { ticketsCount: tickets?.length || 0, tickets, error })
        } else {
          console.log('[NOTIFICATIONS DEBUG] User does NOT have admin/moderator role, skipping support tickets')
        }
          
        // Charger toutes les invitations partenaires
        console.log('[NOTIFICATIONS DEBUG] Fetching partner requests...')
        const { data: partnerRequests, error: partnerError } = await supabase
          .from('training_partners')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
        console.log('[NOTIFICATIONS DEBUG] Partner requests result:', { partnerRequestsCount: partnerRequests?.length || 0, partnerError })
        
        if (error) console.warn('[NOTIFICATIONS DEBUG] Erreur chargement tickets:', error)
        if (partnerError) console.warn('[NOTIFICATIONS DEBUG] Erreur chargement invitations:', partnerError)
        
        const allNotifications: Notification[] = []
        
        // Ajouter tickets support
        if (tickets) {
          console.log('[NOTIFICATIONS DEBUG] Processing', tickets.length, 'support tickets')
          tickets.forEach(ticket => {
            allNotifications.push({
              id: `ticket-${ticket.id}`,
              type: 'support',
              message: `Ticket Support: ${ticket.title || ticket.description || 'Nouveau ticket'}`,
              created_at: ticket.created_at || new Date().toISOString(),
              href: `/admin/tickets/${ticket.id}`,
              description: `Status: ${ticket.status || 'En cours'} • Priorité: ${ticket.priority || 'Normale'}`
            })
          })
        } else {
          console.log('[NOTIFICATIONS DEBUG] No support tickets found or user not authorized')
        }
        
        // Ajouter invitations partenaires
        if (partnerRequests) {
          console.log('[NOTIFICATIONS DEBUG] Processing', partnerRequests.length, 'partner requests')
          partnerRequests.forEach(request => {
            allNotifications.push({
              id: `partner-${request.id}`,
              type: 'partner',
              message: `Invitation Partenaire: ${request.partner_name || request.partner_email || 'Nouveau partenaire'}`,
              created_at: request.created_at || new Date().toISOString(),
              href: `/training-partners`,
              description: 'Invitation en attente de réponse'
            })
          })
        }
        
        // Trier par date (plus récent d'abord)
        allNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        
        console.log('[NOTIFICATIONS DEBUG] Final notifications:', {
          total: allNotifications.length,
          supportCount: allNotifications.filter(n => n.type === 'support').length,
          partnerCount: allNotifications.filter(n => n.type === 'partner').length,
          notifications: allNotifications
        })
        setNotifications(allNotifications)
        
      } catch (error) {
        console.error('[NOTIFICATIONS DEBUG] Error in loadAllNotifications:', error)
      } finally {
        console.log('[NOTIFICATIONS DEBUG] Setting loading to false')
        setLoading(false)
      }
    }

    loadAllNotifications()
  }, [isAdmin, isModerator, roleLoading])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'support':
        return <HeadphonesIcon className="w-5 h-5 text-blue-500" />
      case 'partner':
        return <Users className="w-5 h-5 text-green-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'support':
        return 'Support'
      case 'partner':
        return 'Partenaires'
      default:
        return 'Notification'
    }
  }

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-surface-dark dark:to-surface-darkAlt">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-surface-dark rounded-lg p-4 mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-5 h-5 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-surface-dark dark:to-surface-darkAlt">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/"
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            aria-label="Retour à l'accueil"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Gérer vos notifications et alertes importantes
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-surface-dark rounded-lg p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <HeadphonesIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Support</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {notifications.filter(n => n.type === 'support').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-surface-dark rounded-lg p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Partenaires</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {notifications.filter(n => n.type === 'partner').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-surface-dark rounded-lg p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Bell className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {notifications.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des notifications */}
        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div key={notification.id} className="bg-white dark:bg-surface-dark rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.message}
                          </p>
                          {notification.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {notification.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
                              {getNotificationTypeLabel(notification.type)}
                            </span>
                            <span>
                              {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                        
                        {notification.href && (
                          <Link 
                            href={notification.href}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-brand-600 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                          >
                            Voir
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-surface-dark rounded-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucune notification
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Vous n'avez aucune notification pour le moment.
              </p>
            </div>
          )}
        </div>
        
        {/* Actions rapides */}
        <div className="mt-8 p-4 bg-white dark:bg-surface-dark rounded-lg border border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Actions rapides</h3>
          <div className="flex flex-wrap gap-3">
            <Link 
              href="/admin/tickets" 
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <HeadphonesIcon className="w-4 h-4" />
              Gérer tickets support
            </Link>
            
            <Link 
              href="/training-partners" 
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Users className="w-4 h-4" />
              Gérer partenaires
            </Link>
            
            <Link 
              href="/support/contact" 
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Contacter le support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}