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
  Menu,
  X,
  LogOut,
  LogIn
} from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { createClient } from '@/lib/supabase'
import Mascot from '@/components/ui/Mascot'

export default function HeaderClient() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const navigation = [
    { name: 'Exercices', href: '/exercises', icon: Dumbbell },
    { name: 'Calendrier', href: '/calendar', icon: Calendar },
    { name: 'Séances', href: '/workouts', icon: Calendar },
    { name: 'Progression', href: '/progress', icon: BarChart3 },
    { name: 'Nutrition', href: '/nutrition', icon: Apple },
    { name: 'Profil', href: '/profile', icon: User },
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
          <nav className="hidden xl:flex space-x-6">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-2 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-orange-600 text-white'
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
                className="hidden xl:flex items-center space-x-2 px-3 py-2 rounded-md bg-orange-700 hover:bg-red-600 text-white font-medium transition-colors"
                title="Se déconnecter"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Se déconnecter</span>
              </button>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="xl:hidden p-2 rounded-md text-orange-100 hover:bg-orange-600 hover:text-white transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Menu mobile/hamburger */}
        {isMenuOpen && (
          <>
            {/* Overlay sombre avec blur et fallback */}
            <div
              className="fixed inset-0 z-50"
              style={{
                background: 'rgba(0,0,0,0.25)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
              }}
              onClick={() => setIsMenuOpen(false)}
              aria-label="Fermer le menu latéral"
            />
            {/* Drawer latéral */}
            <aside
              className="fixed top-0 left-0 h-full w-72 max-w-[90vw] bg-white z-50 shadow-2xl flex flex-col animate-slide-in"
              style={{ animation: 'slide-in 0.3s cubic-bezier(0.4,0,0.2,1)' }}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <Dumbbell className="h-7 w-7 text-orange-500" />
                  <span className="font-bold text-lg text-orange-600">IronTrack</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded hover:bg-gray-100">
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>
              {/* Mascotte optionnelle */}
              <div className="flex items-center justify-center py-2">
                <Mascot message="Prêt à t'entraîner, Thierry ?" type="motivation" show={true} />
              </div>
              <nav className="flex-1 overflow-y-auto py-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-3 px-5 py-3 rounded-lg text-base font-medium transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] mb-1 select-none ${
                        isActive
                          ? 'bg-orange-100 text-orange-700 font-bold'
                          : 'text-gray-700 hover:bg-orange-50 hover:shadow-xl hover:scale-105 hover:border hover:border-orange-300 hover:text-orange-600 active:scale-98'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                      tabIndex={0}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
              <div className="p-4 border-t border-gray-100">
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-4 py-3 rounded-lg bg-orange-600 hover:bg-red-600 text-white font-semibold transition-colors"
                    title="Se déconnecter"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Se déconnecter</span>
                  </button>
                ) : (
                  <button
                    onClick={handleLogin}
                    className="flex items-center space-x-2 w-full px-4 py-3 rounded-lg bg-orange-600 hover:bg-green-600 text-white font-semibold transition-colors"
                    title="Se connecter"
                  >
                    <LogIn className="h-5 w-5" />
                    <span>Se connecter</span>
                  </button>
                )}
              </div>
            </aside>
            {/* Animation CSS */}
            <style jsx global>{`
              @keyframes slide-in {
                from { transform: translateX(-100%); }
                to { transform: translateX(0); }
              }
              @keyframes slide-out {
                from { transform: translateX(0); }
                to { transform: translateX(-100%); }
              }
            `}</style>
          </>
        )}
      </div>
    </header>
  )
} 