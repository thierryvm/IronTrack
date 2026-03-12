'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

// Import des icônes critiques uniquement
import { 
  Dumbbell, 
  Calendar, 
  BarChart3, 
  Apple, 
  User,
  Users,
  LogOut,
  LogIn,
  Shield,
  HelpCircle,
  Bell,
  ChevronDown,
  FileText,
  Activity
} from 'lucide-react'

// Import statique pour éviter les bailouts SSR
import ThemeToggle from '@/components/ui/ThemeToggle'

// Import direct du hook (correction erreur hooks React)
import { useAdminRole } from '@/hooks/useAdminRole'
import ClientOnlyNavigation from './ClientOnlyNavigation'

export default function HeaderClient() {
  // États de menu désactivés - UI simplifiée mobile 2025
  const pathname = usePathname()
  const router = useRouter()
  
  
  // Logo avec lazy loading pour éviter preload warnings
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
    { name: 'Support', href: '/support', icon: HelpCircle },
    { name: 'FAQ', href: '/faq', icon: FileText },
    ...(isAdmin || isModerator ? [{ name: 'Admin', href: '/admin', icon: Shield }] : []),
  ]

  // États pour les features actifs
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const [notifications, setNotifications] = useState<Array<{id: string, type: string, message: string, created_at: string, href?: string}>>([])
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)

  // Protection contre les re-chargements multiples
  const lastAdminState = useRef<boolean | null>(null)


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

    // ✅ PROTECTION: Éviter re-chargement si admin state régresse (optimisée)
    const currentAdminState = isAdmin || isModerator
    if (lastAdminState.current === true && currentAdminState === false) {
      return
    }
    lastAdminState.current = currentAdminState

    const loadNotifications = async () => {
      try {
        const supabase = createClient()
        
        // Vérifier d'abord que l'utilisateur est bien authentifié
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          return
        }
        
        // SÉCURITÉ: Charger tickets selon le rôle  
        let tickets = null
        let error = null
        
        if (isAdmin || isModerator) {
          // Admin/Modérateurs: TOUS les tickets
          const result = await supabase
            .from('support_tickets')
            .select('*')
            .in('status', ['open', 'in_progress', 'waiting_user'])
            .limit(3)
            .order('created_at', { ascending: false })
          tickets = result.data
          error = result.error
          if (error) console.error('🔔 [NOTIFICATIONS] Erreur requête tickets:', error)
          
        } else if (user) {
          // Utilisateurs normaux: UNIQUEMENT leurs propres tickets
          const result = await supabase
            .from('support_tickets')
            .select('*')
            .eq('user_id', user.id)
            .in('status', ['open', 'in_progress', 'waiting_user'])
            .limit(3)
            .order('created_at', { ascending: false })
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
              // SÉCURITÉ: Liens différents selon le rôle
              href: (isAdmin || isModerator) 
                ? `/admin/tickets/${ticket.id}` 
                : `/support/tickets/${ticket.id}`
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

  // Ne pas rendre le header sur les pages auth (évite le preload inutile)
  if (pathname?.startsWith('/auth')) {
    return null
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
      
      {/* HEADER DESKTOP - En haut */}
      <header className="hidden md:block sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="h-12 w-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-1 shadow-sm">
                <Image 
                  src="/logo-32.webp" 
                  alt="IronTrack Logo" 
                  width={40}
                  height={40}
                  className="h-full w-full object-contain"
                  sizes="40px"
                  quality={95}
                  loading="lazy"
                />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                IronTrack
              </span>
            </Link>

            {/* Navigation principale desktop */}
            <ClientOnlyNavigation
              items={mainNav}
              className="flex space-x-6"
              itemClassName="flex items-center space-x-1 text-sm font-medium transition-colors"
              activeClassName="text-orange-600 dark:text-orange-400"
              inactiveClassName="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-orange-400"
            />

            {/* Actions utilisateur desktop */}
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <>
                  {/* Notifications */}
                  <div className="relative" data-notification-dropdown>
                    <button
                      onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                      className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors focus:outline-none"
                      aria-label={`Notifications ${notificationCount > 0 ? `(${notificationCount} nouvelles)` : ''}`}
                      aria-expanded={isNotificationOpen}
                    >
                      <Bell className="w-5 h-5" aria-hidden="true" />
                      {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                          {notificationCount > 9 ? '9+' : notificationCount}
                        </span>
                      )}
                    </button>
                    
                    {/* Dropdown notifications desktop */}
                    {isNotificationOpen && (
                      <div className="absolute top-12 right-0 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-50">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">🔔 Notifications</h3>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map((notification) => (
                              <div key={notification.id} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                                {notification.href ? (
                                  <Link
                                    href={notification.href}
                                    className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    onClick={() => setIsNotificationOpen(false)}
                                  >
                                    <p className="text-sm text-gray-900 dark:text-white">{notification.message}</p>
                                    <p className="text-xs text-gray-600 dark:text-safe-muted mt-1">{new Date(notification.created_at).toLocaleDateString('fr-FR')}</p>
                                  </Link>
                                ) : (
                                  <div className="p-4">
                                    <p className="text-sm text-gray-900 dark:text-white">{notification.message}</p>
                                    <p className="text-xs text-gray-600 dark:text-safe-muted mt-1">{new Date(notification.created_at).toLocaleDateString('fr-FR')}</p>
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-sm text-gray-600 dark:text-safe-muted">
                              Aucune notification
                            </div>
                          )}
                        </div>
                        {/* Lien permanent vers support/tickets */}
                        <div className="p-3 border-t border-gray-200 dark:border-gray-600">
                          <Link
                            href="/notifications"
                            className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 dark:text-safe-muted dark:hover:text-gray-200 dark:hover:bg-gray-800 rounded-md transition-colors"
                            onClick={() => setIsNotificationOpen(false)}
                            >
                              Voir mes notifications
                            </Link>
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
                        <Image 
                          src={userAvatar} 
                          alt="Avatar" 
                          className="w-8 h-8 rounded-full object-cover" 
                          width={32} 
                          height={32}
                          sizes="40px"
                          quality={60}
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-orange-600 dark:bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          {userInitials}
                        </div>
                      )}
                      <ChevronDown className="w-4 h-4 text-gray-600 dark:text-safe-muted" />
                    </button>
                    
                    {/* Dropdown profil desktop */}
                    {isProfileDropdownOpen && (
                      <div className="absolute top-12 right-0 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-50">
                        {/* Header utilisateur comme sur mobile */}
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                          <div className="flex items-center space-x-3">
                            {userAvatar ? (
                              <Image 
                                src={userAvatar} 
                                alt="Avatar" 
                                className="w-10 h-10 rounded-full object-cover" 
                                width={40} 
                                height={40}
                                sizes="40px"
                                quality={60}
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-orange-600 dark:bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                {userInitials}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{userEmail}</h3>
                            </div>
                          </div>
                        </div>
                        <div className="p-2">
                          {secondaryNav.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                              onClick={() => setIsProfileDropdownOpen(false)}
                            >
                              <item.icon className="w-4 h-4" />
                              <span>{item.name}</span>
                            </Link>
                          ))}
                          <hr className="my-2 border-gray-200 dark:border-gray-600" />
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-safe-error dark:hover:bg-red-900/20 rounded-md transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Se déconnecter</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="w-px h-5 bg-gray-200 dark:bg-gray-600" aria-hidden="true" />
                  <ThemeToggle />
                </>
              ) : (
                <>
                  <ThemeToggle />
                  <Link
                    href="/auth/login"
                    className="flex items-center space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-orange-400 transition-colors"
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
      <header className="md:hidden sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center px-4 py-3 header-mobile-ios">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-12 w-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-1 shadow-sm">
              <Image 
                src="/logo-32.webp" 
                alt="IronTrack Logo" 
                width={32}
                height={32}
                className="h-full w-full object-contain"
                sizes="32px"
                quality={95}
                loading="lazy"
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
                  className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors focus:outline-none"
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
                      <Image 
                        src={userAvatar} 
                        alt="Avatar" 
                        className="w-8 h-8 rounded-full object-cover" 
                        width={32} 
                        height={32}
                        sizes="40px"
                        quality={60}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-orange-600 dark:bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {userInitials}
                      </div>
                    )}
                  </button>
                  
                  {/* Dropdown profil mobile - Modal style */}
                  {isProfileDropdownOpen && (
                    <div className="fixed inset-0 bg-black/50 z-[60]" onClick={() => setIsProfileDropdownOpen(false)}>
                      <div 
                        className="absolute top-20 left-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                          <div className="flex items-center space-x-3">
                            {userAvatar ? (
                              <Image 
                                src={userAvatar} 
                                alt="Avatar" 
                                className="w-12 h-12 rounded-full object-cover" 
                                width={48} 
                                height={48}
                                sizes="48px"
                                quality={70}
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-orange-600 dark:bg-orange-500 text-white rounded-full flex items-center justify-center text-lg font-semibold">
                                {userInitials}
                              </div>
                            )}
                            <div>
                              <h3 className="text-base font-semibold text-gray-900 dark:text-white">{userEmail}</h3>
                              <p className="text-sm text-gray-600 dark:text-safe-muted">Votre profil</p>
                            </div>
                          </div>
                        </div>
                        <div className="py-2">
                          {secondaryNav.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              onClick={() => setIsProfileDropdownOpen(false)}
                            >
                              <item.icon className="w-5 h-5" />
                              <span>{item.name}</span>
                            </Link>
                          ))}
                          <hr className="my-2 border-gray-200 dark:border-gray-600" />
                          <button
                            onClick={() => {
                              handleLogout()
                              setIsProfileDropdownOpen(false)
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:text-safe-error dark:hover:bg-red-900/20 transition-colors"
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
            <div className="w-px h-5 bg-gray-200 dark:bg-gray-600" aria-hidden="true" />
            <ThemeToggle />
          </div>
        </div>
        
        {/* Modal notifications mobile */}
        {isNotificationOpen && (
          <div className="fixed inset-0 bg-black/50 z-[60]" onClick={() => setIsNotificationOpen(false)}>
            <div 
              className="absolute top-20 left-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-700">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">🔔 Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div key={notification.id} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                      {notification.href ? (
                        <Link
                          href={notification.href}
                          className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          onClick={() => setIsNotificationOpen(false)}
                        >
                          <p className="text-sm text-gray-900 dark:text-white">{notification.message}</p>
                          <p className="text-xs text-gray-600 dark:text-safe-muted mt-1">{new Date(notification.created_at).toLocaleDateString('fr-FR')}</p>
                        </Link>
                      ) : (
                        <div className="p-4">
                          <p className="text-sm text-gray-900 dark:text-white">{notification.message}</p>
                          <p className="text-xs text-gray-600 dark:text-safe-muted mt-1">{new Date(notification.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-sm text-gray-600 dark:text-safe-muted">
                    Aucune notification
                  </div>
                )}
              </div>
              {/* Lien permanent vers support/tickets - Mobile */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-600">
                <Link
                  href="/notifications"
                  className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 dark:text-safe-muted dark:hover:text-gray-200 dark:hover:bg-gray-800 rounded-md transition-colors"
                  onClick={() => setIsNotificationOpen(false)}
                >
                  Voir mes notifications
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
      
      {/* NAVIGATION MOBILE EN BAS - Fixe */}
      {isLoggedIn && (
        <nav aria-label="Navigation mobile" className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50">
          <div className="flex justify-around py-2" role="list">
            <ClientOnlyNavigation
              items={mainNav}
              className="contents"
              itemClassName="flex flex-col items-center p-2 min-w-0 transition-colors"
              activeClassName="text-orange-600 dark:text-orange-400"
              inactiveClassName="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-orange-400"
              isMobile={true}
              ariaLabel="Navigation mobile bas de page"
            />
          </div>
        </nav>
      )}
    </>
  )
}