'use client'

import { useState, useEffect} from'react'

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
 FileText
} from'lucide-react'
import Link from'next/link'
import { usePathname, useRouter} from'next/navigation'
import { AdminAuthProvider, useAdminAuth} from'@/contexts/AdminAuthContext'
import { Button} from'@/components/ui/button'

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
import { createClient} from'@/utils/supabase/client'

interface AdminLayoutProps {
 children: React.ReactNode
}

// ✅ Layout admin complet avec hook useAdminAuth corrigé
export default function AdminLayout({ children}: AdminLayoutProps) {
 return (
 <AdminAuthProvider>
 <AdminLayoutInternal>{children}</AdminLayoutInternal>
 </AdminAuthProvider>
 )
}

// Layout interne qui consomme le context d'authentification
function AdminLayoutInternal({ children}: AdminLayoutProps) {
 const [sidebarOpen, setSidebarOpen] = useState(false)
 const [userMenuOpen, setUserMenuOpen] = useState(false)
 const [stats, setStats] = useState<AdminStats | null>(null)
 const pathname = usePathname()
 const router = useRouter()
 const { user, loading, error, isAuthenticated, hasPermission, logAdminAction} = useAdminAuth()
 
 // Log auth state réduit - seulement erreurs ou succès initial
 useEffect(() => {
 if (error || (!loading && isAuthenticated && user)) {
}
}, [user, loading, error, isAuthenticated])
 const supabase = createClient()

 // Navigation items avec permissions
 const navigationItems = [
 {
 name:'Dashboard',
 href:'/admin',
 icon: LayoutDashboard,
 permission:'moderator',
 active: pathname ==='/admin'
},
 {
 name:'Support Tickets',
 href:'/admin/tickets',
 icon: MessageSquare,
 permission:'moderator',
 active: pathname.startsWith('/admin/tickets'),
 badge: stats?.open_tickets
},
 {
 name:'Utilisateurs',
 href:'/admin/users',
 icon: Users,
 permission:'admin',
 active: pathname.startsWith('/admin/users')
},
 {
 name:'Documentation',
 href:'/admin/documentation',
 icon: FileText,
 permission:'admin',
 active: pathname.startsWith('/admin/documentation')
},
 {
 name:'Exports',
 href:'/admin/exports',
 icon: Download,
 permission:'admin',
 active: pathname.startsWith('/admin/exports')
},
 {
 name:'Logs & Audit',
 href:'/admin/logs',
 icon: Activity,
 permission:'admin',
 active: pathname.startsWith('/admin/logs')
},
 {
 name:'Configuration',
 href:'/admin/settings',
 icon: Settings,
 permission:'super_admin',
 active: pathname.startsWith('/admin/settings')
}
 ] as const

 // Charger les statistiques via API route sécurisée
 useEffect(() => {
 if (isAuthenticated) {
 const loadStats = async () => {
 try {
 const response = await fetch('/api/admin/stats', {
 method:'GET',
 credentials:'include',
 headers: {
'Content-Type':'application/json',
},
})
 
 if (!response.ok) {
 console.error('Erreur récupération stats admin:', response.status, response.statusText)
 return
}
 
 const data = await response.json()
 if (data.stats) {
 setStats(data.stats)
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
 await logAdminAction('logout','session')
} catch {
 // Erreur silencieuse pour éviter crash lors logout
}
 await supabase.auth.signOut()
 router.push('/')
}

 // Loading state — même structure DOM que le vrai layout pour éviter CLS
 if (loading) {
 return (
 <div className="min-h-screen bg-background">
 <div className="lg:hidden bg-card border-b border-border px-4 py-2 flex items-center justify-between h-14">
 <div className="flex items-center space-x-2">
 <div className="w-8 h-8 bg-muted rounded animate-pulse" />
 <div className="w-32 h-5 bg-muted rounded animate-pulse" />
 </div>
 </div>
 <div className="flex">
 <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-card lg:border-r lg:border-border">
 <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-border gap-3">
 <div className="w-8 h-8 bg-muted rounded animate-pulse" />
 <div className="w-36 h-5 bg-muted rounded animate-pulse" />
 </div>
 <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
 {[...Array(7)].map((_, i) => (
 <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />
 ))}
 </nav>
 </div>
 <div className="flex-1 lg:pl-64">
 <main className="p-4 lg:p-8">
 <div className="flex items-center justify-center min-h-[400px]">
 <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
 </div>
 </main>
 </div>
 </div>
 </div>
 )
}

 // Error state avec debug
 if (error || !isAuthenticated) {
 return (
 <div className="min-h-screen bg-background flex items-center justify-center">
 <div className="text-center max-w-2xl mx-auto px-4">
 <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
 <AlertTriangle className="h-8 w-8 text-safe-error" />
 </div>
 <h1 className="text-xl font-bold text-foreground mb-2">Accès Non Autorisé</h1>
 <p className="text-gray-600 mb-4">
 {error ||'Vous n\'avez pas les permissions nécessaires pour accéder à cette interface.'}
 </p>
 
 
 <div className="flex gap-4 justify-center">
 <Link
 href="/"
 className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
 >
 Retour à l'accueil
 </Link>
 <Button variant="secondary" onClick={() => window.location.reload()}>
 Recharger
 </Button>
 </div>
 </div>
 </div>
 )
}

 return (
 <div className="min-h-screen bg-background">
 {/* Header Mobile avec support safe areas iPhone */}
 <div className="lg:hidden bg-card border-b border-border px-4 py-2 flex items-center justify-between header-mobile-ios">
 <div className="flex items-center space-x-2">
 <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} aria-label="Ouvrir le menu">
 <Menu className="h-6 w-6" />
 </Button>
 <div className="flex items-center space-x-2">
 <Shield className="h-6 w-6 text-foreground" />
 <span className="font-bold text-foreground">IronTrack Admin</span>
 </div>
 </div>
 
 <div className="flex items-center space-x-2">
 {/* User menu mobile */}
 <div className="relative">
 <Button variant="ghost" onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center space-x-2 h-auto px-2 py-1">
 <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
 <span className="text-sm font-medium text-foreground">
 {user?.email.charAt(0).toUpperCase()}
 </span>
 </div>
 <ChevronDown className="h-6 w-6 text-muted-foreground" />
 </Button>
 
 {userMenuOpen && (
 <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-lg shadow-lg py-2 z-50"
 >
 <div className="px-4 py-2 border-b border-border">
 <p className="text-sm font-medium text-foreground">{user?.email}</p>
 <p className="text-xs text-gray-600 capitalize">
 {user?.role.replace('_','')}
 </p>
 </div>
 
 <Button
 variant="ghost"
 onClick={handleLogout}
 className="w-full justify-start px-4 py-2 text-sm text-destructive hover:bg-red-50 dark:hover:bg-destructive/10"
 >
 <LogOut className="h-6 w-6 mr-2" />
 Se déconnecter
 </Button>
 </div>
 )}
 </div>
 </div>
 </div>

 <div className="flex">
 {/* Sidebar Desktop */}
 <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-card lg:border-r lg:border-border">
 <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-border">
 <Shield className="h-8 w-8 text-foreground mr-2" />
 <span className="text-xl font-bold text-foreground">IronTrack Admin</span>
 </div>

 <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto min-h-[300px]">
 {navigationItems.map((item) => {
 if (!hasPermission(item.permission as'moderator' |'admin' |'super_admin')) return null

 const Icon = item.icon
 return (
 <Link
 key={item.name}
 href={item.href}
 className={`flex items-center px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
 item.active
 ?'bg-accent text-accent-foreground border border-border'
 :'text-muted-foreground hover:bg-muted hover:text-foreground'
}`}
 >
 <Icon className="h-5 w-5 mr-2" />
 {item.name}
 {'badge' in item && typeof item.badge ==='number' && item.badge > 0 && (
 <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[1.25rem] text-center">
 {item.badge > 99 ?'99+' : item.badge}
 </span>
 )}
 </Link>
 )
})}
 </nav>
 
 <div className="flex-shrink-0 border-t border-border p-4">
 <div className="flex items-center">
 <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
 <span className="text-sm font-medium text-foreground">
 {user?.email.charAt(0).toUpperCase()}
 </span>
 </div>
 <div className="ml-2 flex-1">
 <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
 <p className="text-xs text-gray-600 capitalize">
 {user?.role.replace('_','')}
 </p>
 </div>
 <Button variant="ghost" size="icon" onClick={handleLogout} title="Se déconnecter" className="hover:text-destructive">
 <LogOut className="h-6 w-6" />
 </Button>
 </div>
 </div>
 </div>

 {/* Sidebar Mobile */}
 {sidebarOpen && (
 <>
 <div
 className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
 onClick={() => setSidebarOpen(false)}
 />
 
 <div
 className="lg:hidden fixed inset-y-0 left-0 w-64 bg-card border-r border-border z-50 flex flex-col"
 >
 <div className="flex items-center justify-between h-16 px-4 border-b border-border">
 <div className="flex items-center space-x-2">
 <Shield className="h-6 w-6 text-foreground" />
 <span className="font-bold text-foreground">IronTrack Admin</span>
 </div>
 <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
 <X className="h-5 w-5" />
 </Button>
 </div>
 
 <nav className="flex-1 px-4 py-6 space-y-2">
 {navigationItems.map((item) => {
 if (!hasPermission(item.permission as'moderator' |'admin' |'super_admin')) return null
 
 const Icon = item.icon
 return (
 <Link
 key={item.name}
 href={item.href}
 onClick={() => setSidebarOpen(false)}
 className={`flex items-center px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
 item.active
 ?'bg-accent text-accent-foreground border border-border'
 :'text-muted-foreground hover:bg-muted hover:text-foreground'
}`}
 >
 <Icon className="h-5 w-5 mr-2" />
 {item.name}
 {'badge' in item && typeof item.badge ==='number' && item.badge > 0 && (
 <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
 {item.badge > 99 ?'99+' : item.badge}
 </span>
 )}
 </Link>
 )
})}
 </nav>
 </div>
 </>
 )}

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