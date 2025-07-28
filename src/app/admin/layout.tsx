'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Settings, 
  Menu, 
  X, 
  Shield,
  Download,
  Activity,
  AlertTriangle,
  LogOut,
  ChevronDown,
  Bell
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { AdminAuthProvider, useAdminAuth } from '@/contexts/AdminAuthContext'

interface AdminStats {
  open_tickets: number
  in_progress_tickets: number
  tickets_24h: number
  tickets_7d: number
  new_users_24h: number
  new_users_7d: number
  admin_users: number
  workouts_24h: number
  workouts_7d: number
}
import { createClient } from '@/utils/supabase/client'

interface AdminLayoutProps {
  children: React.ReactNode
}

// Wrapper avec Provider - encapsule toute l'authentification admin
export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminAuthProvider>
      <AdminLayoutInternal>{children}</AdminLayoutInternal>
    </AdminAuthProvider>
  )
}

// Layout interne qui consomme le context d'authentification
function AdminLayoutInternal({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, error, isAuthenticated, hasPermission, logAdminAction } = useAdminAuth()
  
  // DEBUGGING: Log l'état d'authentification
  useEffect(() => {
    console.log('[ADMIN_LAYOUT] État auth:', {
      user: user ? `${user.email} (${user.role})` : null,
      loading,
      error,
      isAuthenticated
    })
  }, [user, loading, error, isAuthenticated])
  const supabase = createClient()

  // Navigation items avec permissions
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      permission: 'moderator',
      active: pathname === '/admin'
    },
    {
      name: 'Support Tickets',
      href: '/admin/tickets',
      icon: MessageSquare,
      permission: 'moderator',
      active: pathname.startsWith('/admin/tickets'),
      badge: stats?.open_tickets
    },
    {
      name: 'Utilisateurs',
      href: '/admin/users',
      icon: Users,
      permission: 'admin',
      active: pathname.startsWith('/admin/users')
    },
    {
      name: 'Exports',
      href: '/admin/exports',
      icon: Download,
      permission: 'admin',
      active: pathname.startsWith('/admin/exports')
    },
    {
      name: 'Logs & Audit',
      href: '/admin/logs',
      icon: Activity,
      permission: 'admin',
      active: pathname.startsWith('/admin/logs')
    },
    {
      name: 'Configuration',
      href: '/admin/settings',
      icon: Settings,
      permission: 'super_admin',
      active: pathname.startsWith('/admin/settings')
    }
  ] as const

  // Charger les statistiques via API route sécurisée
  useEffect(() => {
    if (isAuthenticated) {
      const loadStats = async () => {
        try {
          const response = await fetch('/api/admin/stats', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          
          if (!response.ok) {
            console.error('Erreur récupération stats admin:', response.status, response.statusText)
            return
          }
          
          const data = await response.json()
          if (data.stats) {
            setStats(data.stats)
            console.log('[ADMIN_STATS] Statistiques chargées:', data.stats)
          }
        } catch (error) {
          console.error('Erreur appel API stats:', error)
        }
      }
      
      loadStats()
      // Rafraîchir toutes les 5 minutes pour éviter surcharge API
      const interval = setInterval(loadStats, 300000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  // Gestion de la déconnexion
  const handleLogout = async () => {
    try {
      await logAdminAction('logout', 'session')
    } catch (error) {
      console.warn('Erreur lors du logging de déconnexion:', error)
    }
    await supabase.auth.signOut()
    router.push('/')
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Vérification des permissions admin...</p>
        </div>
      </div>
    )
  }

  // Error state avec debug
  if (error || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Accès Non Autorisé</h1>
          <p className="text-gray-600 mb-4">
            {error || 'Vous n\'avez pas les permissions nécessaires pour accéder à cette interface.'}
          </p>
          
          
          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Retour à l'accueil
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Recharger
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Mobile */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-orange-500" />
            <span className="font-bold text-gray-900">IronTrack Admin</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Notifications badge */}
          <button className="p-2 rounded-lg hover:bg-gray-100 relative">
            <Bell className="h-5 w-5 text-gray-600" />
            {stats?.open_tickets && stats.open_tickets > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {stats.open_tickets > 9 ? '9+' : stats.open_tickets}
              </span>
            )}
          </button>
          
          {/* User menu mobile */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-orange-600">
                  {user?.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>
            
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user?.role.replace('_', ' ')}
                    </p>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Se déconnecter
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Desktop */}
        <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:border-gray-200">
          <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-gray-200">
            <Shield className="h-8 w-8 text-orange-500 mr-3" />
            <span className="text-xl font-bold text-gray-900">IronTrack Admin</span>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              if (!hasPermission(item.permission as 'moderator' | 'admin' | 'super_admin')) return null
              
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.active
                      ? 'bg-orange-50 text-orange-700 border border-orange-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                  {'badge' in item && typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] text-center">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
          
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-orange-600">
                  {user?.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role.replace('_', ' ')}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Se déconnecter"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Mobile */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                onClick={() => setSidebarOpen(false)}
              />
              
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                className="lg:hidden fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 flex flex-col"
              >
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-6 w-6 text-orange-500" />
                    <span className="font-bold text-gray-900">IronTrack Admin</span>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <nav className="flex-1 px-4 py-6 space-y-2">
                  {navigationItems.map((item) => {
                    if (!hasPermission(item.permission as 'moderator' | 'admin' | 'super_admin')) return null
                    
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          item.active
                            ? 'bg-orange-50 text-orange-700 border border-orange-200'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        {item.name}
                        {'badge' in item && typeof item.badge === 'number' && item.badge > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 lg:pl-64">
          <main className="p-4 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}