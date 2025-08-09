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
  HeadphonesIcon
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

  // MENU PRINCIPAL - Navigation fluide selon design system
  const primaryNavigation = [
    { name: 'Calendrier', href: '/calendar', icon: Calendar },
    { name: 'Exercices', href: '/exercises', icon: Dumbbell },
    { name: 'Séances', href: '/workouts', icon: Calendar },
    { name: 'Partenaires', href: '/training-partners', icon: Users },
    { name: 'Nutrition', href: '/nutrition', icon: Apple },
    { name: 'Progression', href: '/progress', icon: BarChart3 },
  ]

  // MENU SECONDAIRE - GitHub-style dropdown
  const secondaryNavigation = [
    { name: 'Profil', href: '/profile', icon: User },
    { name: 'Paramètres', href: '/profile', icon: Settings },
    { name: 'Support', href: '/support', icon: HelpCircle },
    { name: 'FAQ', href: '/faq', icon: HelpCircle },
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
        }
        
        // SÉCURITÉ: Charger tickets support UNIQUEMENT pour admins/modérateurs  
        let tickets = null
        let error = null
        if (isAdmin || isModerator) {
          const result = await supabase
            .from('support_tickets')
            .select('*')
            .limit(3)
          tickets = result.data
          error = result.error
        }
          
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
  }, [isLoggedIn])

  // Fermer dropdowns et menu mobile si clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      
      // Fermer menu mobile si clic sur overlay
      if (isMenuOpen && target.closest('[data-menu-overlay]')) {
        closeMenu()
      }
      
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
  }, [isProfileDropdownOpen, isNotificationOpen, isMenuOpen])

  // Recherche intelligente en temps réel avec vraies données Supabase
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([])
      return
    }

    const searchSupabase = async () => {
      try {
        const supabase = createClient()
        const query = searchQuery.toLowerCase()
        const results: Array<{id: string, type: 'exercise' | 'workout' | 'page', name: string, href: string, description?: string}> = []
        
        // Vérifier d'abord l'authentification
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (!authError && user) {
          // Utilisateur connecté - rechercher dans les données Supabase
          try {
            // Rechercher dans les exercices
            const { data: exercises, error: exerciseError } = await supabase
              .from('exercises')
              .select('id, name')
              .ilike('name', `%${query}%`)
              .limit(3)
            
            // Rechercher dans les séances
            const { data: workouts, error: workoutError } = await supabase
              .from('workouts')
              .select('id, name')
              .ilike('name', `%${query}%`)
              .limit(3)
            
            if (exerciseError && exerciseError.code !== 'PGRST116') {
              console.debug('Info recherche exercices:', exerciseError.message)
            }
            if (workoutError && workoutError.code !== 'PGRST116') {
              console.debug('Info recherche séances:', workoutError.message)
            }
            
            // Ajouter exercices trouvés
            if (exercises) {
              exercises.forEach(exercise => {
                results.push({
                  id: exercise.id,
                  type: 'exercise',
                  name: exercise.name,
                  href: `/exercises/${exercise.id}`
                })
              })
            }
            
            // Ajouter séances trouvées
            if (workouts) {
              workouts.forEach(workout => {
                results.push({
                  id: workout.id,
                  type: 'workout', 
                  name: workout.name,
                  href: `/workouts/${workout.id}`
                })
              })
            }
          } catch (dbError) {
            console.debug('Recherche base données indisponible:', dbError)
          }
        } else {
          console.debug('Utilisateur non authentifié, recherche limitée aux pages')
        }
        
        // Ajouter pages du site (FAQ, Support, etc.)
        const sitePages = [
          { id: 'faq', type: 'page' as const, name: 'FAQ - Questions fréquentes', href: '/faq', description: 'Réponses aux questions courantes' },
          { id: 'support', type: 'page' as const, name: 'Support - Aide', href: '/support', description: 'Centre d\'aide et support' },
          { id: 'contact', type: 'page' as const, name: 'Contact - Support', href: '/support/contact', description: 'Contacter le support' },
          { id: 'privacy', type: 'page' as const, name: 'Confidentialité', href: '/legal/privacy', description: 'Politique de confidentialité' },
          { id: 'terms', type: 'page' as const, name: 'Conditions d\'utilisation', href: '/legal/terms', description: 'Conditions générales' },
          { id: 'profile', type: 'page' as const, name: 'Profil utilisateur', href: '/profile', description: 'Gérer votre profil' },
          { id: 'progress', type: 'page' as const, name: 'Progression', href: '/progress', description: 'Suivre vos progrès' },
          { id: 'nutrition', type: 'page' as const, name: 'Nutrition', href: '/nutrition', description: 'Suivi nutritionnel' },
          { id: 'calendar', type: 'page' as const, name: 'Calendrier', href: '/calendar', description: 'Planning entraînements' },
          { id: 'partners', type: 'page' as const, name: 'Partenaires d\'entraînement', href: '/training-partners', description: 'Gérer vos partenaires' }
        ].filter(page => 
          page.name.toLowerCase().includes(query) || 
          page.description.toLowerCase().includes(query)
        )
        
        // Ajouter les pages trouvées (limiter à 2)
        results.push(...sitePages.slice(0, 2))
        
        setSearchResults(results)
        
      } catch (error) {
        console.warn('Erreur recherche Supabase:', error)
        setSearchResults([])
      }
    }

    // Debounce la recherche
    const timeoutId = setTimeout(() => {
      searchSupabase()
    }, 300)
    
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const closeMenu = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsMenuOpen(false)
      setIsClosing(false)
    }, 200)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setIsLoggedIn(false)
    router.push('/auth')
  }
  
  const handleLogin = () => {
    router.push('/auth')
  }

  return (
    <>
      {/* Lien d'accessibilité - WCAG AA obligatoire */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-orange-600 focus:text-white focus:rounded focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
      >
        Aller au contenu principal
      </a>
      
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-surface-dark/80 backdrop-blur text-gray-900 dark:text-white shadow-lg border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo et nom */}
          <Link href="/" className="flex items-center space-x-3 group focus:outline-none">
            <div className="relative h-10 w-10 rounded-lg overflow-hidden shadow-md group-hover:scale-110 transition-transform">
              <img 
                src="/logo.png" 
                alt="IronTrack Logo" 
                className="h-full w-full object-contain bg-white rounded-lg"
                loading="eager"
                width={40}
                height={40}
                onError={(e) => {
                  console.error('Logo failed to load');
                  e.currentTarget.outerHTML = '<div class="h-10 w-10 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-md">IT</div>';
                }}
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">IronTrack</h1>
              <p className="text-xs text-gray-600 dark:text-gray-300">Ton coach muscu personnel</p>
            </div>
          </Link>

          {/* Navigation desktop - Design GitHub-style selon design-system-irontrack.html */}
          <div className="hidden lg:flex items-center gap-3 flex-1 ml-2">
            {/* Menu principal */}
            <nav className="flex items-center gap-1">
              {primaryNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={isActive 
                      ? 'px-3 py-2 rounded-lg text-sm font-medium bg-orange-600 text-white shadow-md transition-all duration-200'
                      : 'px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/20 hover:text-orange-700 dark:hover:text-orange-300 transition-all duration-200'
                    }
                  >
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Actions - GitHub-style */}
          <div className="flex items-center gap-2">
            {/* Barre de recherche avec résultats */}
            {isLoggedIn && (
              <div className="hidden md:block relative">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchOpen(true)}
                    onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                    className="w-48 h-9 pl-9 pr-3 rounded-lg border border-gray-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 dark:bg-surface-dark dark:border-gray-700 dark:text-white placeholder-gray-500 text-sm"
                  />
                  
                  {/* Résultats de recherche */}
                  {isSearchOpen && searchResults.length > 0 && (
                    <div className="absolute top-full mt-1 w-64 bg-white dark:bg-surface-darkAlt border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
                      {searchResults.map((result) => (
                        <Link
                          key={result.id}
                          href={result.href}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          onClick={() => {
                            setSearchQuery('')
                            setIsSearchOpen(false)
                          }}
                        >
                          {result.type === 'exercise' ? (
                            <Dumbbell className="w-4 h-4 text-brand-500" />
                          ) : result.type === 'workout' ? (
                            <Calendar className="w-4 h-4 text-blue-500" />
                          ) : (
                            <FileText className="w-4 h-4 text-purple-500" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{result.name}</p>
                            <p className="text-xs text-gray-500 capitalize">
                              {result.type === 'exercise' ? 'Exercice' : result.type === 'workout' ? 'Séance' : 'Page'}
                              {result.description && ` • ${result.description}`}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                  
                  {/* Message "Aucun résultat" */}
                  {isSearchOpen && searchQuery.length >= 2 && searchResults.length === 0 && (
                    <div className="absolute top-full mt-1 w-64 bg-white dark:bg-surface-darkAlt border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        Aucun résultat pour "{searchQuery}"
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notifications */}
            {isLoggedIn && (
              <div className="relative" data-notification-dropdown>
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Notifications"
                  title="Notifications"
                  aria-haspopup="true"
                  aria-expanded={isNotificationOpen}
                >
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </button>
                
                {/* Notifications MOBILE-FRIENDLY */}
                {isNotificationOpen && (
                  <div className="absolute right-0 mt-2 w-full max-w-sm sm:w-80 rounded-lg border border-gray-300 bg-white shadow-2xl overflow-hidden z-50">
                    
                    {/* Header lisible */}
                    <div className="px-4 py-3 bg-orange-50 border-b border-orange-200">
                      <h3 className="text-base font-bold text-gray-900">🔔 Notifications</h3>
                    </div>
                    
                    {/* Contenu notifications */}
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <Link 
                            key={notification.id} 
                            href={notification.href || '/notifications'}
                            className="block px-4 py-4 hover:bg-orange-50 border-b border-gray-100 last:border-b-0"
                            onClick={() => setIsNotificationOpen(false)}
                          >
                            <div className="flex items-start gap-3">
                              {notification.type === 'support' ? (
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  💬
                                </div>
                              ) : (
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  👥
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 leading-5">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <div className="text-4xl mb-2">📭</div>
                          <p className="text-gray-600 text-sm">Aucune notification</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                        <Link 
                          href="/notifications" 
                          className="block text-center text-sm text-orange-600 hover:text-orange-800 font-semibold"
                          onClick={() => setIsNotificationOpen(false)}
                        >
                          📋 Voir toutes les notifications
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Profile dropdown - GitHub-style */}
            {isLoggedIn && (
              <div className="relative" data-profile-dropdown>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-haspopup="true"
                  aria-expanded={isProfileDropdownOpen}
                >
                  {userAvatar ? (
                    <img 
                      src={userAvatar} 
                      alt="Avatar utilisateur" 
                      className="h-7 w-7 rounded-full object-cover ring-2 ring-white/20"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-white flex items-center justify-center font-bold text-sm shadow-lg ring-2 ring-white/30">
                      {userInitials || 'U'}
                    </div>
                  )}
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                
                {/* Dropdown menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-surface-darkAlt shadow-lg overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-sm text-gray-500">Connecté en tant que</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{userEmail}</p>
                    </div>
                    <div className="py-1">
                      {secondaryNavigation.map((item) => {
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <Icon className="w-4 h-4" />
                            {item.name}
                          </Link>
                        )
                      })}
                      <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>
                      <button
                        onClick={() => {
                          handleLogout()
                          setIsProfileDropdownOpen(false)
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Login button for non-logged users */}
            {!isLoggedIn && (
              <button
                onClick={handleLogin}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors"
              >
                <LogIn className="h-4 w-4" />
                Se connecter
              </button>
            )}
            <button
              onClick={() => isMenuOpen ? closeMenu() : setIsMenuOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
              aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Menu mobile ULTRA-SIMPLE - GARANTI FONCTIONNEL */}
        {isMenuOpen && (
          <>
            {/* Overlay cliquable */}
            <div
              className="fixed inset-0 z-40 bg-black opacity-50"
              onClick={closeMenu}
              aria-label="Fermer le menu"
            />
            
            {/* Menu latéral SIMPLE */}
            <div className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white z-50 shadow-xl">
              
              {/* Header simple */}
              <div className="flex items-center justify-between p-4 bg-orange-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-white/20 rounded flex items-center justify-center overflow-hidden">
                    <img 
                      src="/logo.png" 
                      alt="IronTrack Logo" 
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        e.currentTarget.outerHTML = '<div class="font-bold text-sm">IT</div>';
                      }}
                    />
                  </div>
                  <span className="font-bold">IronTrack</span>
                </div>
                <button 
                  onClick={closeMenu} 
                  className="p-1 hover:bg-white/10 rounded"
                  aria-label="Fermer"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {/* Navigation ULTRA-SIMPLE */}
              <div className="p-4">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Navigation</div>
                  
                  <Link href="/calendar" onClick={closeMenu} className="block p-3 bg-gray-100 hover:bg-orange-100 rounded text-gray-900 font-medium">
                    📅 Calendrier
                  </Link>
                  
                  <Link href="/exercises" onClick={closeMenu} className="block p-3 bg-gray-100 hover:bg-orange-100 rounded text-gray-900 font-medium">
                    💪 Exercices
                  </Link>
                  
                  <Link href="/workouts" onClick={closeMenu} className="block p-3 bg-gray-100 hover:bg-orange-100 rounded text-gray-900 font-medium">
                    🏋️ Séances
                  </Link>
                  
                  <Link href="/training-partners" onClick={closeMenu} className="block p-3 bg-gray-100 hover:bg-orange-100 rounded text-gray-900 font-medium">
                    👥 Partenaires
                  </Link>
                  
                  <Link href="/nutrition" onClick={closeMenu} className="block p-3 bg-gray-100 hover:bg-orange-100 rounded text-gray-900 font-medium">
                    🍎 Nutrition
                  </Link>
                  
                  <Link href="/progress" onClick={closeMenu} className="block p-3 bg-gray-100 hover:bg-orange-100 rounded text-gray-900 font-medium">
                    📊 Progression
                  </Link>
                </div>

                {/* Menu secondaire simple */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Compte</div>
                  <div className="space-y-2">
                    <Link href="/profile" onClick={closeMenu} className="block p-2 text-gray-600 hover:text-orange-600 text-sm">
                      👤 Profil
                    </Link>
                    <Link href="/support" onClick={closeMenu} className="block p-2 text-gray-600 hover:text-orange-600 text-sm">
                      💬 Support
                    </Link>
                    {(isAdmin || isModerator) && (
                      <Link href="/admin" onClick={closeMenu} className="block p-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                        🛡️ Admin
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout()
                        closeMenu()
                      }}
                      className="block w-full text-left p-2 text-red-600 hover:text-red-800 text-sm"
                    >
                      🚪 Déconnexion
                    </button>
                  </div>
                </div>
              </div>
              
            </div>
          </>
        )}
      </div>
    </header>
    </>
  )
} 