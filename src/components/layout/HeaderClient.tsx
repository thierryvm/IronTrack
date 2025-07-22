'use client'

import { useState, useEffect } from 'react'
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
  Shield
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

  const navigation = [
    { name: 'Exercices', href: '/exercises', icon: Dumbbell },
    { name: 'Calendrier', href: '/calendar', icon: Calendar },
    { name: 'Séances', href: '/workouts', icon: Calendar },
    { name: 'Partenaires', href: '/training-partners', icon: Users },
    { name: 'Progression', href: '/progress', icon: BarChart3 },
    { name: 'Nutrition', href: '/nutrition', icon: Apple },
    { name: 'Profil', href: '/profile', icon: User },
  ]

  // Navigation admin (conditionnelle)
  const adminNavigation = [
    ...(isAdmin || isModerator ? [{ name: '👑 Admin', href: '/admin', icon: Shield }] : []),
  ]

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
    <header className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo et nom */}
          <Link href="/" className="flex items-center space-x-3 group focus:outline-none">
            <div className="flex-shrink-0">
              <Dumbbell className="h-8 w-8 text-yellow-300 group-hover:scale-110 transition-transform" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold">IronTrack</h1>
              <p className="text-xs text-orange-100">Ton coach muscu personnel</p>
            </div>
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden xl:flex space-x-4">
            {[...navigation, ...adminNavigation].map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-orange-100 hover:bg-orange-600 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="hidden xl:flex items-center justify-center p-2 rounded-lg bg-red-500/80 hover:bg-red-600 text-white transition-colors shadow-sm"
                title="Se déconnecter"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => isMenuOpen ? closeMenu() : setIsMenuOpen(true)}
              className="xl:hidden p-2 rounded-md text-orange-100 hover:bg-orange-600 hover:text-white transition-colors"
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
            <aside className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${
              isClosing ? '-translate-x-full' : 'translate-x-0'
            }`}>
              {/* Header du menu */}
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-orange-500 to-red-500">
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
                    <p className="text-orange-100 text-xs">Coach muscu personnel</p>
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
              
              {/* Navigation principale */}
              <nav className="flex-1 overflow-y-auto py-4 px-3">
                <div className="space-y-1">
                  {[...navigation, ...adminNavigation].map((item, index) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center space-x-4 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ease-out group relative animate-slide-up ${
                          isActive
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-800 active:scale-[0.98]'
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
                            : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-orange-100 dark:group-hover:bg-gray-600'
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
              </nav>
              
              {/* Footer avec actions */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
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
  )
} 