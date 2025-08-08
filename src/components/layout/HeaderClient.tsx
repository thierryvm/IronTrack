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
  ChevronDown
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
  const [notificationCount] = useState(3) // TODO: Connecter aux vraies données

  // Vérifier l'état de connexion
  useEffect(() => {
    const supabase = createClient()
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    checkUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') setIsLoggedIn(true)
      if (event === 'SIGNED_OUT') setIsLoggedIn(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Fermer dropdown si clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isProfileDropdownOpen && !(event.target as Element).closest('[data-profile-dropdown]')) {
        setIsProfileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isProfileDropdownOpen])

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
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
              IT
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">IronTrack</h1>
              <p className="text-xs text-gray-600 dark:text-gray-300">Ton coach muscu personnel</p>
            </div>
          </Link>

          {/* Navigation desktop - Design GitHub-style */}
          <div className="hidden lg:flex items-center gap-3 flex-1 ml-6">
            {/* Menu principal */}
            <nav className="flex items-center gap-1">
              {primaryNavigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-500 text-white shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Actions - GitHub-style */}
          <div className="flex items-center gap-2">
            {/* Barre de recherche */}
            {isLoggedIn && (
              <div className="hidden md:block relative">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher exercices, séances..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 h-9 pl-10 pr-4 rounded-lg border border-gray-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 dark:bg-surface-dark dark:border-gray-700 dark:text-white placeholder-gray-500 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Notifications */}
            {isLoggedIn && (
              <button
                className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>
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
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white flex items-center justify-center font-bold text-sm">
                    T
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                
                {/* Dropdown menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-surface-darkAlt shadow-lg overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-sm text-gray-500">Connecté en tant que</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">***REDACTED_EMAIL***</p>
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

        {/* Menu mobile/hamburger */}
        {isMenuOpen && (
          <>
            {/* Overlay avec animation fade */}
            <div
              className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
                isClosing ? 'opacity-0' : 'opacity-100'
              }`}
              onClick={closeMenu}
              aria-label="Fermer le menu"
            />
            
            {/* Drawer latéral amélioré */}
            <aside className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-surface-light dark:bg-surface-dark z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${
              isClosing ? '-translate-x-full' : 'translate-x-0'
            }`}>
              {/* Header du menu */}
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-brand-600 to-brand-700">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Dumbbell className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <Link 
                      href="/" 
                      className="text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded-md px-1"
                      onClick={closeMenu}
                    >
                      IronTrack
                    </Link>
                    <p className="text-white/80 text-xs">Coach muscu personnel</p>
                  </div>
                </div>
                <button 
                  onClick={closeMenu} 
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Fermer le menu"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
              
              {/* Navigation principale mobile */}
              <nav className="flex-1 overflow-y-auto py-4 px-3">
                {/* Menu principal */}
                <div className="space-y-1 mb-6">
                  <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Navigation</h3>
                  {primaryNavigation.map((item, index) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center space-x-4 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ease-out group relative animate-slide-up ${
                          isActive
                            ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-lg'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-surface-darkAlt active:scale-[0.98]'
                        }`}
                        onClick={closeMenu}
                        style={{ 
                          animationDelay: `${index * 80}ms`,
                          animationFillMode: 'both'
                        }}
                      >
                        <div className={`p-2 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-white/20' 
                            : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-brand-100 dark:group-hover:bg-gray-600'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="flex-1">{item.name}</span>
                        {isActive && (
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        )}
                      </Link>
                    )
                  })}
                </div>

                {/* Barre de recherche mobile */}
                {isLoggedIn && (
                  <div className="px-4 mb-6">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 dark:bg-surface-dark dark:border-gray-700 dark:text-white placeholder-gray-500"
                      />
                    </div>
                  </div>
                )}

                {/* Menu secondaire */}
                <div className="space-y-1">
                  <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Compte</h3>
                  {secondaryNavigation.map((item, index) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center space-x-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ease-out group relative animate-slide-up ${
                          isActive
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.98]'
                        }`}
                        onClick={closeMenu}
                        style={{ 
                          animationDelay: `${(primaryNavigation.length + index) * 80}ms`,
                          animationFillMode: 'both'
                        }}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="flex-1">{item.name}</span>
                      </Link>
                    )
                  })}
                </div>
              </nav>
              
              {/* Footer avec actions */}
              <div className="p-4 bg-surface-lightAlt dark:bg-surface-darkAlt border-t border-gray-200 dark:border-gray-700">
                <div className="mb-3">
                  <ThemeToggle />
                </div>
                {isLoggedIn ? (
                  <button
                    onClick={() => {
                      handleLogout()
                      closeMenu()
                    }}
                    className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors active:scale-[0.98]"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Se déconnecter</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleLogin()
                      closeMenu()
                    }}
                    className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium transition-colors active:scale-[0.98]"
                  >
                    <LogIn className="h-5 w-5" />
                    <span>Se connecter</span>
                  </button>
                )}
              </div>
            </aside>
          </>
        )}
      </div>
    </header>
    </>
  )
} 