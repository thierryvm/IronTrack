'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Crown, 
  Shield, 
  User,
  UserCheck,
  UserX,
  Search,
  Filter,
  ArrowUpDown,
  Ban,
  Key,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react'
import Image from 'next/image'
import { useAdminAuthComplete as useAdminAuth } from '@/hooks/useAdminAuthComplete'
import { createClient } from '@/utils/supabase/client'

// Types pour les utilisateurs
interface AdminUser {
  id: string
  email: string
  full_name?: string
  avatar_url?: string | null
  created_at: string
  last_sign_in_at?: string
  email_confirmed_at?: string
  is_banned?: boolean
  role: string
  // Métadonnées statistiques
  total_exercises?: number
  total_workouts?: number
  total_performance_logs?: number
  last_activity?: string
  account_age_days?: number
}

// Types pour les filtres
interface UserFilters {
  role: 'all' | 'user' | 'moderator' | 'admin' | 'super_admin'
  status: 'all' | 'active' | 'banned' | 'unconfirmed'
  search: string
}

// Types pour le tri
type SortField = 'created_at' | 'last_sign_in_at' | 'email' | 'role'
type SortDirection = 'asc' | 'desc'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [newRole, setNewRole] = useState<'user' | 'moderator' | 'admin' | 'super_admin'>('user')
  
  // États pour les filtres et tri
  const [filters, setFilters] = useState<UserFilters>({
    role: 'all',
    status: 'all',
    search: ''
  })
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [showFilters, setShowFilters] = useState(false)

  const { logAdminAction, hasPermission, user: currentUser } = useAdminAuth()
  const supabase = createClient()

  // Charger les utilisateurs avec leurs statistiques
  const loadUsers = async () => {
    setLoading(true)
    try {
      // TEMP: Créer des utilisateurs fictifs pour le développement
      // En production, vous devrez utiliser une API route avec la clé de service
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          granted_at,
          is_active,
          expires_at
        `)
        .eq('is_active', true)

      if (roleError) throw roleError

      // Pour chaque rôle, récupérer les infos utilisateur publiques
      // const userIds = roleData?.map(r => r.user_id) || []
      
      // Simuler des utilisateurs (en attendant l'API route)
      const mockUsers = roleData?.map((role, index) => ({
        id: role.user_id,
        email: index === 0 ? '***REDACTED_EMAIL***' : `utilisateur${index}@example.com`,
        full_name: index === 0 ? 'Thierry VM' : `Utilisateur ${index}`,
        avatar_url: null as string | null,
        created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        last_sign_in_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        email_confirmed_at: new Date().toISOString(),
        is_banned: false,
        role: role.role,
        total_exercises: Math.floor(Math.random() * 50),
        total_workouts: Math.floor(Math.random() * 100),
        total_performance_logs: Math.floor(Math.random() * 200),
        last_activity: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
        account_age_days: Math.floor(Math.random() * 365)
      })) || []

      setUsers(mockUsers)
      await logAdminAction('view_users', 'users', undefined, { count: mockUsers.length })
      
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasPermission('admin')) {
      loadUsers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPermission]) // Volontairement retiré loadUsers pour éviter boucle infinie

  // Filtrer et trier les utilisateurs
  const filteredAndSortedUsers = users
    .filter((user) => {
      if (filters.role !== 'all' && user.role !== filters.role) return false
      if (filters.status === 'banned' && !user.is_banned) return false
      if (filters.status === 'active' && (user.is_banned || !user.email_confirmed_at)) return false
      if (filters.status === 'unconfirmed' && user.email_confirmed_at) return false
      if (filters.search && !user.email.toLowerCase().includes(filters.search.toLowerCase()) 
          && !user.full_name?.toLowerCase().includes(filters.search.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortField) {
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'last_sign_in_at':
          const aLastSignIn = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0
          const bLastSignIn = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0
          comparison = aLastSignIn - bLastSignIn
          break
        case 'email':
          comparison = a.email.localeCompare(b.email)
          break
        case 'role':
          const roleOrder: Record<string, number> = { user: 1, moderator: 2, admin: 3, super_admin: 4 }
          comparison = (roleOrder[a.role] || 0) - (roleOrder[b.role] || 0)
          break
      }
      
      return sortDirection === 'desc' ? -comparison : comparison
    })

  // Gérer le changement de rôle
  const handleRoleChange = async (userId: string, role: 'user' | 'moderator' | 'admin' | 'super_admin') => {
    try {
      // Vérifier si l'utilisateur peut attribuer ce rôle
      if (role === 'super_admin' && currentUser?.role !== 'super_admin') {
        alert('Seuls les super admins peuvent attribuer le rôle de super admin')
        return
      }

      if ((role === 'admin' || role === 'moderator') && !hasPermission('admin')) {
        alert('Vous n\'avez pas les permissions pour attribuer ce rôle')
        return
      }

      // Supprimer l'ancien rôle et créer le nouveau
      await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', userId)

      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role,
          granted_by: currentUser?.id,
          is_active: true
        })

      if (error) throw error

      await logAdminAction('change_user_role', 'users', userId, { 
        target_user_id: userId, 
        new_role: role 
      })

      await loadUsers()
      setShowRoleModal(false)
      
    } catch (error) {
      console.error('Erreur changement rôle:', error)
      alert('Erreur lors du changement de rôle')
    }
  }

  // Gérer le bannissement
  const handleBanUser = async (userId: string, ban: boolean) => {
    try {
      if (!hasPermission('admin')) {
        alert('Vous n\'avez pas les permissions pour bannir des utilisateurs')
        return
      }

      // 🔒 SÉCURISÉ : API route pour éviter exposition du service key
      const response = await fetch('/api/admin/users/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ban })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur bannissement')
      }
      
      // Plus d'erreur car gérée dans la réponse API

      await logAdminAction(ban ? 'ban_user' : 'unban_user', 'users', userId, { 
        target_user_id: userId 
      })

      await loadUsers()
      
    } catch (error) {
      console.error('Erreur bannissement:', error)
      alert('Erreur lors du bannissement')
    }
  }

  // Gérer le tri
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Fonctions d'affichage
  const getRoleIcon = (role: string) => {
    const icons = {
      'super_admin': <Crown className="h-4 w-4 text-purple-500" />,
      'admin': <Shield className="h-4 w-4 text-red-500" />,
      'moderator': <UserCheck className="h-4 w-4 text-orange-500" />,
      'user': <User className="h-4 w-4 text-gray-500" />
    }
    return icons[role as keyof typeof icons] || icons.user
  }

  const getRoleLabel = (role: string) => {
    const labels = {
      'super_admin': 'Super Admin',
      'admin': 'Admin',
      'moderator': 'Modérateur',
      'user': 'Utilisateur'
    }
    return labels[role as keyof typeof labels] || role
  }

  const getRoleColor = (role: string) => {
    const colors = {
      'super_admin': 'bg-purple-100 text-purple-700',
      'admin': 'bg-red-100 text-red-700',
      'moderator': 'bg-orange-100 text-orange-700',
      'user': 'bg-gray-100 text-gray-700'
    }
    return colors[role as keyof typeof colors] || colors.user
  }

  const getStatusIcon = (user: AdminUser) => {
    if (user.is_banned) {
      return <UserX className="h-4 w-4 text-red-500" />
    }
    if (!user.email_confirmed_at) {
      return <Clock className="h-4 w-4 text-orange-500" />
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const getStatusLabel = (user: AdminUser) => {
    if (user.is_banned) return 'Banni'
    if (!user.email_confirmed_at) return 'Non confirmé'
    return 'Actif'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement des utilisateurs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
                <p className="text-gray-600">
                  {filteredAndSortedUsers.length} utilisateur{filteredAndSortedUsers.length !== 1 ? 's' : ''} 
                  {filters.role !== 'all' || filters.status !== 'all' || filters.search 
                    ? ` (${users.length} au total)` : ''}
                </p>
              </div>
            </div>
          </div>
          
          {/* Actions rapides */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                showFilters 
                  ? 'bg-orange-100 text-orange-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </button>
            <button
              onClick={loadUsers}
              className="flex items-center px-3 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Actualiser
            </button>
          </div>
        </div>

        {/* Barre de filtrages */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-6 border-t border-gray-200 pt-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Recherche */}
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher par email ou nom..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Filtre rôle */}
                <div>
                  <select
                    value={filters.role}
                    onChange={(e) => setFilters({ ...filters, role: e.target.value as UserFilters['role'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">Tous les rôles</option>
                    <option value="user">Utilisateurs</option>
                    <option value="moderator">Modérateurs</option>
                    <option value="admin">Admins</option>
                    <option value="super_admin">Super Admins</option>
                  </select>
                </div>

                {/* Filtre statut */}
                <div>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value as UserFilters['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actifs</option>
                    <option value="unconfirmed">Non confirmés</option>
                    <option value="banned">Bannis</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Liste des utilisateurs */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {filteredAndSortedUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
            <p className="text-gray-500">
              {filters.role !== 'all' || filters.status !== 'all' || filters.search 
                ? 'Essayez de modifier vos filtres'
                : 'Les utilisateurs apparaîtront ici'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* En-têtes de tableau */}
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('role')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>Rôle</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('created_at')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>Inscription</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('last_sign_in_at')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>Dernière connexion</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activité
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* Corps du tableau */}
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedUser(user)
                      setShowDetails(true)
                    }}
                  >
                    {/* Utilisateur */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          {user.avatar_url ? (
                            <Image 
                              src={user.avatar_url} 
                              alt={user.full_name || user.email}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-orange-600">
                              {(user.full_name || user.email).charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name || 'Nom non défini'}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Rôle */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(user.role)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </div>
                    </td>

                    {/* Statut */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(user)}
                        <span className="text-sm text-gray-900">
                          {getStatusLabel(user)}
                        </span>
                      </div>
                    </td>

                    {/* Date d'inscription */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-xs text-gray-500">
                        Il y a {user.account_age_days} jour{user.account_age_days !== 1 ? 's' : ''}
                      </div>
                    </td>

                    {/* Dernière connexion */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.last_sign_in_at ? (
                        <div>
                          <div className="text-sm text-gray-900">
                            {new Date(user.last_sign_in_at).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(user.last_sign_in_at).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Jamais</span>
                      )}
                    </td>

                    {/* Activité */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span title="Exercices créés">
                          🏋️ {user.total_exercises || 0}
                        </span>
                        <span title="Séances d'entraînement">
                          📅 {user.total_workouts || 0}
                        </span>
                        <span title="Performances enregistrées">
                          📊 {user.total_performance_logs || 0}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedUser(user)
                            setShowDetails(true)
                          }}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {hasPermission('admin') && user.id !== currentUser?.id && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedUser(user)
                                setNewRole(user.role as 'user' | 'moderator' | 'admin' | 'super_admin')
                                setShowRoleModal(true)
                              }}
                              className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Changer le rôle"
                            >
                              <Key className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleBanUser(user.id, !user.is_banned)
                              }}
                              className={`p-2 rounded-lg transition-colors ${
                                user.is_banned
                                  ? 'text-gray-400 hover:text-green-500 hover:bg-green-50'
                                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                              }`}
                              title={user.is_banned ? 'Débannir' : 'Bannir'}
                            >
                              {user.is_banned ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de détails utilisateur */}
      <AnimatePresence>
        {showDetails && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowDetails(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-4 bottom-4 md:inset-x-8 md:top-8 md:bottom-8 lg:inset-16 lg:top-16 lg:bottom-16 z-50 bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* En-tête du modal */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    {selectedUser.avatar_url ? (
                      <Image 
                        src={selectedUser.avatar_url} 
                        alt={selectedUser.full_name || selectedUser.email}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-medium text-orange-600">
                        {(selectedUser.full_name || selectedUser.email).charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedUser.full_name || 'Nom non défini'}
                    </h2>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getRoleIcon(selectedUser.role)}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}>
                    {getRoleLabel(selectedUser.role)}
                  </span>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-4"
                  >
                    <AlertTriangle className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Contenu du modal */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Informations de compte */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Informations du compte</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">ID Utilisateur:</span>
                          <span className="text-sm text-gray-900 font-mono">
                            {selectedUser.id.slice(0, 8)}...
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Statut:</span>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(selectedUser)}
                            <span className="text-sm text-gray-900">
                              {getStatusLabel(selectedUser)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Email confirmé:</span>
                          <span className="text-sm text-gray-900">
                            {selectedUser.email_confirmed_at ? 'Oui' : 'Non'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Âge du compte:</span>
                          <span className="text-sm text-gray-900">
                            {selectedUser.account_age_days} jour{selectedUser.account_age_days !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Statistiques d'activité */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Statistiques d&apos;activité</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {selectedUser.total_exercises || 0}
                          </div>
                          <div className="text-xs text-blue-700">Exercices créés</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {selectedUser.total_workouts || 0}
                          </div>
                          <div className="text-xs text-green-700">Séances</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {selectedUser.total_performance_logs || 0}
                          </div>
                          <div className="text-xs text-orange-700">Performances</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-purple-600">
                            {selectedUser.last_activity 
                              ? `${Math.floor((new Date().getTime() - new Date(selectedUser.last_activity).getTime()) / (1000 * 60 * 60 * 24))}j`
                              : 'N/A'
                            }
                          </div>
                          <div className="text-xs text-purple-700">Dernière activité</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dates importantes */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Historique</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-gray-500">Inscription</div>
                          <div className="text-sm text-gray-900">
                            {new Date(selectedUser.created_at).toLocaleString('fr-FR')}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Dernière connexion</div>
                          <div className="text-sm text-gray-900">
                            {selectedUser.last_sign_in_at 
                              ? new Date(selectedUser.last_sign_in_at).toLocaleString('fr-FR')
                              : 'Jamais connecté'
                            }
                          </div>
                        </div>
                        {selectedUser.email_confirmed_at && (
                          <div>
                            <div className="text-xs text-gray-500">Email confirmé le</div>
                            <div className="text-sm text-gray-900">
                              {new Date(selectedUser.email_confirmed_at).toLocaleString('fr-FR')}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions d'administration */}
                    {hasPermission('admin') && selectedUser.id !== currentUser?.id && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Actions d&apos;administration</h3>
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              setNewRole(selectedUser.role as 'user' | 'moderator' | 'admin' | 'super_admin')
                              setShowRoleModal(true)
                            }}
                            className="w-full flex items-center justify-center px-3 py-2 text-sm bg-white border border-orange-300 text-orange-700 rounded-md hover:bg-orange-50 transition-colors"
                          >
                            <Key className="h-4 w-4 mr-2" />
                            Modifier le rôle
                          </button>
                          
                          <button
                            onClick={() => handleBanUser(selectedUser.id, !selectedUser.is_banned)}
                            className={`w-full flex items-center justify-center px-3 py-2 text-sm rounded-md transition-colors ${
                              selectedUser.is_banned
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                          >
                            {selectedUser.is_banned ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Débannir l&apos;utilisateur
                              </>
                            ) : (
                              <>
                                <Ban className="h-4 w-4 mr-2" />
                                Bannir l&apos;utilisateur
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de changement de rôle */}
      <AnimatePresence>
        {showRoleModal && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setShowRoleModal(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-1/2 transform -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-96 z-50 bg-white rounded-xl shadow-2xl p-6"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Modifier le rôle</h3>
                <p className="text-sm text-gray-600">
                  Changer le rôle de {selectedUser.full_name || selectedUser.email}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {['user', 'moderator', 'admin', 'super_admin'].map((role) => (
                  <label key={role} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={newRole === role}
                      onChange={(e) => setNewRole(e.target.value as 'user' | 'moderator' | 'admin' | 'super_admin')}
                      className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                    />
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(role)}
                      <span className="text-sm text-gray-900">{getRoleLabel(role)}</span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleRoleChange(selectedUser.id, newRole)}
                  className="px-4 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                >
                  Modifier le rôle
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}