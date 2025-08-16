'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Users, 
  MessageSquare, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  RefreshCw,
  Activity,
  Shield,
  BarChart3,
  Eye,
  FileText,
  Image
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { AdminStats } from '@/hooks/useAdminAuth'
import { createClient } from '@/utils/supabase/client'

interface QuickAction {
  title: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  permission: 'moderator' | 'admin' | 'super_admin'
}

interface RecentActivity {
  id: string
  action: string
  target_type: string
  admin_email: string
  created_at: string
  details: Record<string, unknown>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [recentTickets, setRecentTickets] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  const { user, hasPermission, getAdminStats, logAdminAction, loading: authLoading } = useAdminAuth()
  const router = useRouter()
  const supabase = createClient()

  // Configuration du hook admin

  const quickActions: QuickAction[] = [
    {
      title: 'Tickets Ouverts',
      description: 'Gérer les demandes de support',
      href: '/admin/tickets?status=open',
      icon: MessageSquare,
      color: 'orange',
      permission: 'moderator'
    },
    {
      title: 'Gestion Utilisateurs',
      description: 'Administrer les comptes',
      href: '/admin/users',
      icon: Users,
      color: 'blue',
      permission: 'admin'
    },
    {
      title: 'Export Données',
      description: 'Télécharger les données',
      href: '/admin/exports',
      icon: Download,
      color: 'green',
      permission: 'admin'
    },
    {
      title: 'Logs Système',
      description: 'Audit et monitoring',
      href: '/admin/logs',
      icon: Activity,
      color: 'purple',
      permission: 'admin'
    },
    {
      title: 'Documentation Technique',
      description: 'Guides développeur et audits',
      href: '/admin/documentation',
      icon: FileText,
      color: 'indigo',
      permission: 'admin'
    },
    {
      title: 'Optimisation Images',
      description: 'Optimiser images existantes',
      href: '/admin/image-optimization',
      icon: Image,
      color: 'teal',
      permission: 'admin'
    }
  ]

  // Protection contre les appels multiples simultanés
  const [lastRefreshTime, setLastRefreshTime] = useState(0)
  const REFRESH_COOLDOWN = 2000 // 2 secondes minimum (réduit de 5s)

  // Charger les données du dashboard avec protection simple
  const loadDashboardData = useCallback(async () => {
    // Protection simple contre appels simultanés uniquement
    if (refreshing) {
      return
    }
    
    // Throttling léger seulement pour éviter spam
    const now = Date.now()
    if ((now - lastRefreshTime) < REFRESH_COOLDOWN) {
      return
    }
    
    setLastRefreshTime(now)
    try {
      setRefreshing(true)
      
      // Statistiques via API sécurisée (remplacement d'appels admin côté client)
      try {
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          const adminStats = await response.json()
          setStats(adminStats)
        } else {
          console.error('Erreur API stats admin:', response.status)
          // Fallback vers la méthode existante en cas d'échec API
          const adminStats = await getAdminStats()
          setStats(adminStats)
        }
      } catch (error) {
        console.error('Erreur récupération stats admin:', error)
        // Fallback vers la méthode existante
        const adminStats = await getAdminStats()
        setStats(adminStats)
      }
      
      // Activité récente via API sécurisée (remplacement de getUserById)
      if (hasPermission('moderator')) {
        try {
          const response = await fetch('/api/admin/activity')
          if (response.ok) {
            const { activity } = await response.json()
            const formattedActivity = activity.map((log: { id: string; action: string; target_type: string; created_at: string; admin_info?: { email_masked?: string } }) => ({
              id: log.id,
              action: log.action,
              target_type: log.target_type,
              created_at: log.created_at,
              admin_email: log.admin_info?.email_masked || 'Admin inconnu'
            }))
            setRecentActivity(formattedActivity)
          } else {
            console.error('Erreur API admin activity:', response.status)
            setRecentActivity([])
          }
        } catch (error) {
          console.error('Erreur récupération activité admin:', error)
          setRecentActivity([])
        }
      }
      
      // Tickets récents
      const { data: ticketsData } = await supabase
        .from('support_tickets')
        .select('id, title, category, status, created_at, priority')
        .order('created_at', { ascending: false })
        .limit(5)
      
      setRecentTickets(ticketsData || [])
      
      await logAdminAction('dashboard_viewed', 'dashboard')
      
    } catch (error) {
      console.error('Erreur chargement dashboard:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [refreshing, lastRefreshTime, logAdminAction, supabase, getAdminStats, hasPermission])

  // Fonction de refresh manuel pour éviter les boucles
  const handleManualRefresh = useCallback(async () => {
    if (refreshing) return
    
    setStats(null) // Reset stats pour forcer le rechargement
    await loadDashboardData()
  }, [refreshing, loadDashboardData])

  useEffect(() => {
    // Chargement initial seulement si pas déjà chargé ET auth terminée
    if (hasPermission('moderator') && !stats && !authLoading) {
      setLoading(false) // Met à jour le loading local
      loadDashboardData()
    }
  }, [hasPermission, stats, authLoading, loadDashboardData])

  const getActionColor = (color: string) => {
    const colors = {
      orange: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
      blue: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
      green: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
      purple: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100',
      teal: 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100'
    }
    return colors[color as keyof typeof colors] || colors.orange
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4 text-orange-800" />
      case 'in_progress':
        return <Activity className="h-4 w-4 text-blue-500" />
      case 'resolved':
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getCategoryEmoji = (category: string) => {
    const emojis = {
      bug: '🐛',
      feature: '💡',
      help: '❓',
      feedback: '💬',
      account: '👤',
      payment: '💳'
    }
    return emojis[category as keyof typeof emojis] || '📝'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton - Dimensions fixes */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between min-h-[80px] animate-pulse">
          <div className="flex-1">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
          <div className="mt-3 sm:mt-0 flex items-center space-x-3">
            <div className="h-8 w-20 bg-gray-200 rounded-full" />
            <div className="h-10 w-24 bg-gray-200 rounded-lg" />
          </div>
        </div>
        
        {/* Stats Skeleton - Dimensions exactes */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-3 sm:p-6 rounded-xl shadow-sm animate-pulse min-h-[120px]">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gray-200 rounded-lg" />
                <div className="w-4 h-4 bg-gray-200 rounded" />
              </div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2 mb-1" />
              <div className="h-6 sm:h-8 bg-gray-300 rounded w-1/3 mb-1" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
        
        {/* Actions Skeleton - Dimensions fixes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[200px] animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 border-2 border-gray-100 rounded-xl min-h-[100px]">
                <div className="flex items-center mb-3">
                  <div className="w-5 h-5 bg-gray-200 rounded mr-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
                <div className="h-3 bg-gray-200 rounded w-full" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Grid Sections Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[300px] animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-3 border border-gray-100 rounded-lg min-h-[80px]">
                  <div className="flex justify-between mb-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="w-4 h-4 bg-gray-200 rounded" />
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[300px] animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg min-h-[70px]">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mt-2" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Composants de debug */}
      
      {/* Header avec refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 truncate">
            Dashboard {user?.role === 'super_admin' ? 'Super Admin' : 
                      user?.role === 'admin' ? 'Admin' : 
                      user?.role === 'moderator' ? 'Modérateur' : 'Admin'}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 truncate">
            Bonjour {user?.email.split('@')[0]} 👋
          </p>
        </div>
        
        <div className="mt-3 sm:mt-0 flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3">
          <div className="flex items-center text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden xs:inline">{user?.role.replace('_', ' ').toUpperCase()}</span>
            <span className="xs:hidden">{user?.role === 'super_admin' ? 'S.ADM' : user?.role === 'admin' ? 'ADM' : 'MOD'}</span>
          </div>
          
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center px-2 sm:px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''} ${refreshing ? '' : 'sm:mr-2'}`} />
            <span className="hidden sm:inline ml-2">Actualiser</span>
          </button>
        </div>
      </div>

      {/* Statistiques principales - CLS Fix */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            title: 'Tickets Ouverts',
            value: stats?.open_tickets || 0,
            change: '+' + (stats?.tickets_24h || 0) + ' aujourd\'hui',
            icon: MessageSquare,
            color: 'orange',
            href: '/admin/tickets?status=open'
          },
          {
            title: 'Nouveaux Utilisateurs',
            value: stats?.new_users_7d || 0,
            change: '+' + (stats?.new_users_24h || 0) + ' aujourd\'hui',
            icon: Users,
            color: 'blue',
            href: '/admin/users'
          },
          {
            title: 'Feedback',
            value: stats?.open_tickets || 0,
            change: 'Retours utilisateurs',
            icon: MessageSquare,
            color: 'green',
            href: '/admin/tickets?category=feedback'
          },
          {
            title: 'Admins Actifs',
            value: stats?.admin_users || 0,
            change: 'Équipe administrative',
            icon: Shield,
            color: 'purple',
            href: '/admin/users?role=admin'
          }
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title}>
              <Link href={stat.href}>
                <div 
                  className="bg-white p-3 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer min-h-[120px]"
                  style={{ minHeight: '120px' }}
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <div className={`p-2 sm:p-3 rounded-lg ${
                      stat.color === 'orange' ? 'bg-orange-100' :
                      stat.color === 'blue' ? 'bg-blue-100' :
                      stat.color === 'green' ? 'bg-green-100' :
                      'bg-purple-100'
                    }`}>
                      <Icon className={`h-4 w-4 sm:h-6 sm:w-6 ${
                        stat.color === 'orange' ? 'text-orange-800' :
                        stat.color === 'blue' ? 'text-blue-600' :
                        stat.color === 'green' ? 'text-green-600' :
                        'text-purple-600'
                      }`} />
                    </div>
                    <Eye className="h-4 w-4 text-gray-400" />
                  </div>
                  
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                      {stat.title}
                    </h3>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900 mb-1">
                      {stat.value.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {stat.change}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          )
        })}
      </div>

      {/* Actions rapides - Dimensions fixes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[200px]" style={{ minHeight: '200px' }}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Actions Rapides
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            if (!hasPermission(action.permission)) return null
            
            const Icon = action.icon
            return (
              <Link key={action.title} href={action.href}>
                <div className={`p-4 border-2 rounded-xl transition-all cursor-pointer ${getActionColor(action.color)}`}>
                  <div className="flex items-center mb-3">
                    <Icon className="h-5 w-5 mr-2" />
                    <h3 className="font-medium">{action.title}</h3>
                  </div>
                  <p className="text-sm opacity-75">
                    {action.description}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets récents - Dimensions fixes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[300px]" style={{ minHeight: '300px' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Tickets Récents
            </h2>
            <Link 
              href="/admin/tickets"
              className="text-sm text-orange-800 hover:text-orange-700 font-medium"
            >
              Voir tous
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentTickets.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                Aucun ticket récent
              </p>
            ) : (
              recentTickets.map((ticket) => (
                <div key={String(ticket.id || '')} className="cursor-pointer" onClick={() => router.push('/admin/tickets')}>
                  <div className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">
                          {getCategoryEmoji(String(ticket.category || 'help'))}
                        </span>
                        <h4 className="font-medium text-gray-900 text-sm truncate max-w-[200px]">
                          {String(ticket.title || 'Sans titre')}
                        </h4>
                      </div>
                      {getStatusIcon(String(ticket.status || 'open'))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="capitalize">{String(ticket.category || 'general')}</span>
                      <span>{new Date(String(ticket.created_at || new Date().toISOString())).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activité récente - Dimensions fixes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[300px]" style={{ minHeight: '300px' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Activité Récente
              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Dernière heure
              </span>
            </h2>
            <Link 
              href="/admin/logs"
              className="text-sm text-orange-800 hover:text-orange-700 font-medium flex items-center space-x-1"
            >
              <Eye className="h-3 w-3" />
              <span>Logs complets</span>
            </Link>
          </div>
          
          <div className="space-y-3">
            {!hasPermission('admin') ? (
              <div className="text-center py-6">
                <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Permissions administrateur requises</p>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-6">
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Aucune activité dans la dernière heure</p>
                <p className="text-gray-400 text-xs mt-1">
                  Consultez les logs complets pour plus d'historique
                </p>
              </div>
            ) : (
              <>
                {recentActivity.slice(0, 3).map((activity) => ( // LIMITÉ à 3 au lieu de tous
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg min-h-[70px]" style={{ minHeight: '70px' }}>
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.admin_email}</span>
                        {' '}
                        <span className="text-gray-600">
                          {activity.action.replace(/_/g, ' ')}
                        </span>
                        {activity.target_type && (
                          <span className="text-gray-500"> • {activity.target_type.replace(/_/g, ' ')}</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.created_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Afficher le nombre d'activités cachées */}
                {recentActivity.length > 3 && (
                  <div className="text-center pt-2">
                    <Link 
                      href="/admin/logs"
                      className="text-xs text-orange-800 hover:text-orange-700 font-medium"
                    >
                      +{recentActivity.length - 3} activités supplémentaires → Voir tous les logs
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}