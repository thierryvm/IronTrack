'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Dumbbell, 
  Calendar, 
  BarChart3, 
  Apple, 
  User,
  Users,
  Menu,
  X,
  LogOut,
  LogIn,
  Shield,
  Settings,
  HelpCircle,
  Search,
  Bell,
  ChevronDown,
  FileText,
  HeadphonesIcon,
  Activity
} from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { createClient } from '@/utils/supabase/client'
import { useAdminRole } from '@/hooks/useAdminRole'

export default function HeaderClient() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userInitials, setUserInitials] = useState('')
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const { isAdmin, isModerator } = useAdminRole()

  // MENU PRINCIPAL - Navigation en bas mobile, en haut desktop
  const mainNav = [
    { name: 'Calendrier', href: '/calendar', icon: Calendar },
    { name: 'Exercices', href: '/exercises', icon: Dumbbell },
    { name: 'Séances', href: '/workouts', icon: Activity },
    { name: 'Partenaires', href: '/training-partners', icon: Users },
    { name: 'Nutrition', href: '/nutrition', icon: Apple },
    { name: 'Progression', href: '/progress', icon: BarChart3 },
  ]

  // MENU SECONDAIRE - Profil et administration
  const secondaryNav = [
    { name: 'Profil', href: '/profile', icon: User },
    { name: 'Paramètres', href: '/settings', icon: Settings },
    { name: 'Support', href: '/support', icon: HelpCircle },
    { name: 'FAQ', href: '/faq', icon: FileText },
    ...(isAdmin || isModerator ? [{ name: 'Admin', href: '/admin', icon: Shield }] : []),
  ]

  // États pour les nouveaux features
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{id: string, type: 'exercise' | 'workout' | 'page', name: string, href: string, description?: string}>>([])
  const [notificationCount, setNotificationCount] = useState(0)
  const [notifications, setNotifications] = useState<Array<{id: string, type: string, message: string, created_at: string, href?: string}>>([])
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)

  // Vérifier l'état de connexion et récupérer infos utilisateur
  useEffect(() => {
    const supabase = createClient()
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setIsLoggedIn(true)
        setUserEmail(user.email || '')
        
        // Récupérer l'avatar depuis la table profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single()
        
        setUserAvatar(profile?.avatar_url || null)
        
        // Générer initiales à partir de l'email
        const email = user.email || ''
        const initials = email.split('@')[0]
          .split('.')
          .map(part => part.charAt(0).toUpperCase())
          .join('')
          .substring(0, 2)
        setUserInitials(initials)
      } else {
        setIsLoggedIn(false)
        setUserEmail('')
        setUserInitials('')
        setUserAvatar(null)
      }
    }
    checkUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setIsLoggedIn(true)
        setUserEmail(session.user.email || '')
        
        // Récupérer l'avatar depuis la table profiles
        supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            setUserAvatar(profile?.avatar_url || null)
          })
        
        const email = session.user.email || ''
        const initials = email.split('@')[0]
          .split('.')
          .map(part => part.charAt(0).toUpperCase())
          .join('')
          .substring(0, 2)
        setUserInitials(initials)
      }
      if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false)
        setUserEmail('')
        setUserInitials('')
        setUserAvatar(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Charger les notifications réelles  
  useEffect(() => {
    if (!isLoggedIn) return

    const loadNotifications = async () => {
      try {
        const supabase = createClient()
        
        // Vérifier d'abord que l'utilisateur est bien authentifié
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          console.debug('Utilisateur non authentifié, pas de chargement notifications')
          return
        }// SÉCURITÉ: Charger tickets support UNIQUEMENT pour admins/modérateurs  
        let tickets = null
        let error = null
        
        // Vérification email admin en plus des hooks (fallback de sécurité)
        const isAdminEmail = user.email === '***REDACTED_EMAIL***';if (isAdmin || isModerator || isAdminEmail) {const result = await supabase
            .from('support_tickets')
            .select('*')
            .limit(3)
          tickets = result.data
          error = result.error
          console.debug('📊 Tickets trouvés:', tickets?.length || 0, tickets);
        } else {}
          
        // Charger les invitations partenaires en attente
        const { data: partnerRequests, error: partnerError } = await supabase
          .from('training_partners')
          .select('*')
          .eq('status', 'pending')
          .limit(3)
        
        if (error && error.code !== 'PGRST116') console.warn('Erreur chargement tickets:', error)
        if (partnerError && partnerError.code !== 'PGRST116') console.warn('Erreur chargement invitations:', partnerError)
        
        const notificationData: Array<{id: string, type: string, message: string, created_at: string, href?: string}> = []
        
        // Ajouter tickets support avec liens directs
        if (tickets) {
          tickets.forEach(ticket => {
            notificationData.push({
              id: `ticket-${ticket.id}`,
              type: 'support',
              message: `Ticket: ${ticket.title || ticket.description || 'Support ticket'}`,
              created_at: ticket.created_at || new Date().toISOString(),
              href: `/admin/tickets/${ticket.id}` // Lien direct vers le ticket admin
            })
          })
        }
        
        // Ajouter invitations partenaires avec liens directs
        if (partnerRequests) {
          partnerRequests.forEach(request => {
            notificationData.push({
              id: `partner-${request.id}`,
              type: 'partner',
              message: `Invitation partenaire: ${request.partner_name || request.partner_email || 'Nouveau partenaire'}`,
              created_at: request.created_at || new Date().toISOString(),
              href: `/training-partners` // Lien vers gestion partenaires
            })
          })
        }
        
        // Trier par date (plus récent d'abord)
        notificationData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        
        setNotifications(notificationData)
        setNotificationCount(notificationData.length)
        
      } catch (error) {
        console.warn('Erreur notifications:', error)
      }
    }

    loadNotifications()
  }, [isLoggedIn, isAdmin, isModerator])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setIsLoggedIn(false)
    router.push('/auth')
  }
  
  const handleLogin = () => {
    router.push('/auth')
  }

  // Fermer dropdowns au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      
      // Fermer dropdown profil
      if (isProfileDropdownOpen && !target.closest('[data-profile-dropdown]')) {
        setIsProfileDropdownOpen(false)
      }
      
      // Fermer dropdown notifications  
      if (isNotificationOpen && !target.closest('[data-notification-dropdown]')) {
        setIsNotificationOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isProfileDropdownOpen, isNotificationOpen])

  return (
    <>
      {/* Lien d'accessibilité - WCAG AA obligatoire */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-orange-600 focus:text-white focus:rounded focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
      >
        Aller au contenu principal
      </a>
      
      {/* HEADER DESKTOP - En haut */}
      <header className="hidden md:block sticky top-0 z-50 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="h-8 w-8 bg-white rounded-lg p-1 shadow-sm">
                <img 
                  src="/logo.png" 
                  alt="IronTrack Logo" 
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.outerHTML = '<div class="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-sm">IT</div>';
                  }}
                />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                IronTrack
              </span>
            </Link>

            {/* Navigation principale desktop */}
            <nav className="flex space-x-6">
              {mainNav.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'text-orange-600 dark:text-orange-400'
                      : 'text-gray-700 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-400'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* Actions utilisateur desktop */}
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <>
                  {/* Notifications */}
                  <div className="relative" data-notification-dropdown>
                    <button
                      onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                      className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Bell className="w-5 h-5" />
                      {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                          {notificationCount > 9 ? '9+' : notificationCount}
                        </span>
                      )}
                    </button>
                    
                    {/* Dropdown notifications desktop */}
                    {isNotificationOpen && (
                      <div className="absolute top-12 right-0 w-80 bg-white dark:bg-surface-dark rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">🔔 Notifications</h3>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map((notification) => (
                              <div key={notification.id} className="p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                                <p className="text-sm text-gray-900 dark:text-white">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{new Date(notification.created_at).toLocaleDateString('fr-FR')}</p>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-sm text-gray-500">
                              Aucune notification
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Avatar et dropdown profil */}
                  <div className="relative" data-profile-dropdown>
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {userAvatar ? (
                        <img src={userAvatar} alt="Avatar" className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          {userInitials}
                        </div>
                      )}
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>
                    
                    {/* Dropdown profil desktop */}
                    {isProfileDropdownOpen && (
                      <div className="absolute top-12 right-0 w-48 bg-white dark:bg-surface-dark rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                        <div className="p-2">
                          {secondaryNav.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md transition-colors"
                              onClick={() => setIsProfileDropdownOpen(false)}
                            >
                              <item.icon className="w-4 h-4" />
                              <span>{item.name}</span>
                            </Link>
                          ))}
                          <hr className="my-2 border-gray-200 dark:border-gray-700" />
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-md transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Se déconnecter</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <ThemeToggle />
                </>
              ) : (
                <>
                  <ThemeToggle />
                  <Link
                    href="/auth/login"
                    className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-400 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Connexion</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* HEADER MOBILE - En haut simplifié avec support safe areas iPhone */}
      <header className="md:hidden sticky top-0 z-50 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center px-4 py-3 header-mobile-ios">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-white rounded-lg p-1 shadow-sm">
              <img 
                src="/logo.png" 
                alt="IronTrack Logo" 
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.currentTarget.outerHTML = '<div class="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-sm">IT</div>';
                }}
              />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              IronTrack
            </span>
          </Link>

          {/* Actions utilisateur mobile */}
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                {/* Notifications mobile */}
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                  aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} non lues)` : ''}`}
                >
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </button>
                
                {/* Avatar mobile - Dropdown comme desktop */}
                <div className="relative" data-profile-dropdown>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Ouvrir menu profil"
                    aria-expanded={isProfileDropdownOpen}
                  >
                    {userAvatar ? (
                      <img src={userAvatar} alt="Avatar" className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {userInitials}
                      </div>
                    )}
                  </button>
                  
                  {/* Dropdown profil mobile - Modal style */}
                  {isProfileDropdownOpen && (
                    <div className="fixed inset-0 bg-black/50 z-[60]" onClick={() => setIsProfileDropdownOpen(false)}>
                      <div 
                        className="absolute top-20 left-4 right-4 bg-white dark:bg-surface-dark rounded-lg shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-3">
                            {userAvatar ? (
                              <img src={userAvatar} alt="Avatar" className="w-12 h-12 rounded-full" />
                            ) : (
                              <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center text-lg font-semibold">
                                {userInitials}
                              </div>
                            )}
                            <div>
                              <h3 className="text-base font-semibold text-gray-900 dark:text-white">{userEmail}</h3>
                              <p className="text-sm text-gray-500">Votre profil</p>
                            </div>
                          </div>
                        </div>
                        <div className="py-2">
                          {secondaryNav.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                              onClick={() => setIsProfileDropdownOpen(false)}
                            >
                              <item.icon className="w-5 h-5" />
                              <span>{item.name}</span>
                            </Link>
                          ))}
                          <hr className="my-2 border-gray-200 dark:border-gray-700" />
                          <button
                            onClick={() => {
                              handleLogout()
                              setIsProfileDropdownOpen(false)
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <LogOut className="w-5 h-5" />
                            <span>Se déconnecter</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="text-orange-600 font-medium text-sm"
              >
                Connexion
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>
        
        {/* Modal notifications mobile */}
        {isNotificationOpen && (
          <div className="fixed inset-0 bg-black/50 z-[60]" onClick={() => setIsNotificationOpen(false)}>
            <div 
              className="absolute top-20 left-4 right-4 bg-white dark:bg-surface-dark rounded-lg shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-700">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">🔔 Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div key={notification.id} className="p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                      <p className="text-sm text-gray-900 dark:text-white">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(notification.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-sm text-gray-500">
                    Aucune notification
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
      
      {/* NAVIGATION MOBILE EN BAS - Fixe */}
      {isLoggedIn && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-700 z-50">
          <div className="flex justify-around py-2">
            {mainNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center p-2 min-w-0 transition-colors ${
                  pathname === item.href
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-gray-600 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400'
                }`}
              >
                <item.icon className="w-6 h-6 mb-1 flex-shrink-0" />
                <span className="text-xs font-medium truncate">{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </>
  )
}