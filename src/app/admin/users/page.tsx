'use client'

import { useState } from 'react'
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
  Eye,
  Calendar,
  Trash2,
  XCircle
} from 'lucide-react'
import Image from 'next/image'
import { useAdminUserManagement, AdminUser, BanUserOptions } from '@/hooks/useAdminUserManagement'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

// Types pour les filtres
interface UserFilters {
  role: 'all' | 'user' | 'moderator' | 'admin' | 'super_admin'
  status: 'all' | 'active' | 'banned'
  search: string
}

// Types pour le tri
type SortField = 'created_at' | 'last_workout' | 'email' | 'role' | 'total_workouts'
type SortDirection = 'asc' | 'desc'

export default function AdminUsersPage() {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showBanModal, setShowBanModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [newRole, setNewRole] = useState<'user' | 'moderator' | 'admin' | 'super_admin'>('user')
  const [banOptions, setBanOptions] = useState<BanUserOptions>({})
  
  // États pour les filtres et tri
  const [filters, setFilters] = useState<UserFilters>({
    role: 'all',
    status: 'all',
    search: ''
  })
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [showFilters, setShowFilters] = useState(false)

  // Hooks
  const { hasPermission } = useAdminAuth()
  const {
    users,
    loading,
    error,
    updateUserRole,
    banUser,
    deleteUser,
    getUsersByRole,
    getActiveUsers,
    getBannedUsers,
    clearError
  } = useAdminUserManagement()

  // Filtrer et trier les utilisateurs
  const filteredAndSortedUsers = users
    .filter((user) => {
      // Filtres par rôle
      if (filters.role !== 'all' && user.role !== filters.role) return false
      
      // Filtres par statut
      if (filters.status === 'active' && user.is_banned) return false
      if (filters.status === 'banned' && !user.is_banned) return false
      
      // Filtres par recherche
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const matchEmail = user.email.toLowerCase().includes(searchTerm)
        const matchName = user.full_name?.toLowerCase().includes(searchTerm)
        if (!matchEmail && !matchName) return false
      }
      
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortField) {
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'last_workout':
          const aLastWorkout = a.last_workout ? new Date(a.last_workout).getTime() : 0
          const bLastWorkout = b.last_workout ? new Date(b.last_workout).getTime() : 0
          comparison = aLastWorkout - bLastWorkout
          break
        case 'email':
          comparison = a.email.localeCompare(b.email)
          break
        case 'role':
          const roleOrder: Record<string, number> = { user: 1, moderator: 2, admin: 3, super_admin: 4 }
          comparison = (roleOrder[a.role] || 0) - (roleOrder[b.role] || 0)
          break
        case 'total_workouts':
          comparison = a.total_workouts - b.total_workouts
          break
      }
      
      return sortDirection === 'desc' ? -comparison : comparison
    })

  // Gérer le changement de rôle
  const handleRoleChange = async () => {
    if (!selectedUser) return
    
    const success = await updateUserRole(selectedUser.id, newRole)
    if (success) {
      setShowRoleModal(false)
      setSelectedUser(null)
    }
  }

  // Gérer le bannissement
  const handleBanSubmit = async () => {
    if (!selectedUser) return
    
    const success = await banUser(selectedUser.id, banOptions)
    if (success) {
      setShowBanModal(false)
      setSelectedUser(null)
      setBanOptions({})
    }
  }

  // Gérer la suppression
  const handleDeleteConfirm = async () => {
    if (!selectedUser) return
    
    const success = await deleteUser(selectedUser.id)
    if (success) {
      setShowDeleteModal(false)
      setSelectedUser(null)
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

  // Fonction pour formater le nom d'utilisateur
  const formatUserName = (user: AdminUser): string => {
    // 🎯 PRIORITÉ 1 : Respecter le pseudo choisi par l'utilisateur
    if (user.pseudo && user.pseudo.trim()) {
      return user.pseudo.trim()
    }
    
    // 🎯 PRIORITÉ 2 : Séparer automatiquement le nom complet
    if (user.full_name && user.full_name.trim()) {
      const name = user.full_name.trim()
      
      // Si le nom contient déjà des espaces, le retourner tel quel
      if (name.includes(' ')) {
        return name
      }
      
      // SÉPARATION AUTOMATIQUE : Mapping direct pour tous les cas connus
      const nameMapping: Record<string, string> = {
        'vanmeeterenlucas': 'Vanmeeteren Lucas',
        'Vanmeeterenlucas': 'Vanmeeteren Lucas', // Variante avec majuscule
        'vanmeeterenhugo': 'Vanmeeteren Hugo', 
        'hugovanmeteren': 'Hugo Vanmeteren',
        'josephnakouzi': 'Joseph Nakouzi',
        'fruishjeremy': 'Fruish Jeremy',
        'oceanevanmeeteren': 'Océane Vanmeeteren'
      }
      
      // Vérifier d'abord le nom exact (avec casse)
      if (nameMapping[name]) {
        return nameMapping[name]
      }
      
      // Puis vérifier en minuscules
      const lowerName = name.toLowerCase()
      
      // Debug supprimé - problème résolu
      
      if (nameMapping[lowerName]) {
        return nameMapping[lowerName]
      }
      
      // Fallback : séparation automatique pour les autres cas
      const separatedName = name
        // Séparer avant une majuscule précédée de minuscules
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        // Nettoyer les espaces multiples
        .replace(/\s+/g, ' ')
        .trim()
      
      return separatedName || name
    }
    
    // 🎯 FALLBACK : Utiliser l'email
    return user.email.split('@')[0]
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
    if (!user.is_onboarding_complete) {
      return <Clock className="h-4 w-4 text-orange-500" />
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const getStatusLabel = (user: AdminUser) => {
    if (user.is_banned) {
      // Afficher la durée du ban si disponible
      if (user.banned_until) {
        const banDate = new Date(user.banned_until)
        const now = new Date()
        if (banDate > now) {
          return `Banni (jusqu'au ${banDate.toLocaleDateString('fr-FR')})`
        }
      }
      return 'Banni'
    }
    
    if (!user.is_onboarding_complete) {
      return 'Onboarding incomplet'
    }
    
    if (!user.is_active) {
      return 'Inactif (>30j)'
    }
    
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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <p className="text-red-700">{error}</p>
          <button
            onClick={clearError}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <XCircle className="h-4 w-4" />
          </button>
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
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{getActiveUsers().length}</div>
            <div className="text-sm text-blue-700">Utilisateurs actifs</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">{getBannedUsers().length}</div>
            <div className="text-sm text-red-700">Utilisateurs bannis</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">
              {getUsersByRole('admin').length + getUsersByRole('super_admin').length}
            </div>
            <div className="text-sm text-purple-700">Administrateurs</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600">{getUsersByRole('moderator').length}</div>
            <div className="text-sm text-orange-700">Modérateurs</div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Recherche */}
                <div>
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
                    <button
                      onClick={() => handleSort('email')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>Utilisateur</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
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
                      onClick={() => handleSort('total_workouts')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>Activité</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
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
                              {formatUserName(user).charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatUserName(user)}
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
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-900">
                            {new Date(user.created_at).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(user.created_at).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Activité */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {user.total_workouts}
                        </div>
                        <div className="text-xs text-gray-500">séances</div>
                        {user.last_workout && (
                          <div className="text-xs text-gray-400 mt-1">
                            Dernier: {new Date(user.last_workout).toLocaleDateString('fr-FR')}
                          </div>
                        )}
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
                        
                        {hasPermission('admin') && (
                          <>
                            {hasPermission('super_admin') && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedUser(user)
                                  setNewRole(user.role)
                                  setShowRoleModal(true)
                                }}
                                className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Changer le rôle"
                              >
                                <Key className="h-4 w-4" />
                              </button>
                            )}
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedUser(user)
                                setBanOptions({})
                                setShowBanModal(true)
                              }}
                              className={`p-2 rounded-lg transition-colors ${
                                !user.is_banned
                                  ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                                  : 'text-gray-400 hover:text-green-500 hover:bg-green-50'
                              }`}
                              title={!user.is_banned ? 'Bannir' : 'Débannir'}
                            >
                              {!user.is_banned ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </button>

                            {hasPermission('super_admin') && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedUser(user)
                                  setShowDeleteModal(true)
                                }}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Supprimer l'utilisateur"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
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
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
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
                        {formatUserName(selectedUser).charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {formatUserName(selectedUser)}
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
                    <XCircle className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Contenu du modal - Version simplifiée pour l'instant */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Informations de base */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Informations</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">ID:</span>
                        <span className="text-sm font-mono text-gray-900">{selectedUser.id.slice(0, 8)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Statut:</span>
                        <span className="text-sm text-gray-900">{getStatusLabel(selectedUser)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Inscription:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(selectedUser.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Statistiques */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Activité</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{selectedUser.total_workouts}</div>
                        <div className="text-xs text-blue-700">Séances</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedUser.last_workout 
                            ? `${Math.floor((new Date().getTime() - new Date(selectedUser.last_workout).getTime()) / (1000 * 60 * 60 * 24))}j`
                            : 'N/A'
                          }
                        </div>
                        <div className="text-xs text-green-700">Dernière activité</div>
                      </div>
                    </div>
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
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
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
                  Changer le rôle de {formatUserName(selectedUser)}
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
                      onChange={(e) => setNewRole(e.target.value as typeof newRole)}
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
                  onClick={handleRoleChange}
                  className="px-4 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                >
                  Modifier le rôle
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de bannissement */}
      <AnimatePresence>
        {showBanModal && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
              onClick={() => setShowBanModal(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-1/2 transform -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-96 z-50 bg-white rounded-xl shadow-2xl p-6"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {!selectedUser.is_banned ? 'Bannir' : 'Débannir'} l&apos;utilisateur
                </h3>
                <p className="text-sm text-gray-600">
                  {formatUserName(selectedUser)}
                </p>
              </div>

              {!selectedUser.is_banned && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de fin du bannissement (optionnel)
                    </label>
                    <input
                      type="datetime-local"
                      value={banOptions.banned_until ? banOptions.banned_until.toISOString().slice(0, 16) : ''}
                      onChange={(e) => setBanOptions({
                        ...banOptions,
                        banned_until: e.target.value ? new Date(e.target.value) : undefined
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Raison du bannissement
                    </label>
                    <textarea
                      value={banOptions.ban_reason || ''}
                      onChange={(e) => setBanOptions({
                        ...banOptions,
                        ban_reason: e.target.value
                      })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Expliquez la raison du bannissement..."
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowBanModal(false)}
                  className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleBanSubmit}
                  className={`px-4 py-2 text-sm rounded-md transition-colors ${
                    !selectedUser.is_banned
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {!selectedUser.is_banned ? 'Bannir' : 'Débannir'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de suppression */}
      <AnimatePresence>
        {showDeleteModal && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
              onClick={() => setShowDeleteModal(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-1/2 transform -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-96 z-50 bg-white rounded-xl shadow-2xl p-6"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Supprimer l&apos;utilisateur</h3>
                <p className="text-sm text-gray-600">
                  Êtes-vous sûr de vouloir supprimer définitivement {formatUserName(selectedUser)} ?
                </p>
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-700">
                    ⚠️ Cette action est irréversible et supprimera toutes les données de l&apos;utilisateur.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Supprimer définitivement
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}