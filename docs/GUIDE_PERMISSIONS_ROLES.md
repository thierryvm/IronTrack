# 🔐 GUIDE DES PERMISSIONS ET RÔLES - IronTrack Admin

## 🏗️ **HIÉRARCHIE DES RÔLES**

```
user (0) < moderator (1) < admin (2) < super_admin (3)
```

### 📊 **Niveaux d'accès :**
- **Niveau 1** : `moderator` - Modération de base
- **Niveau 2** : `admin` - Administration complète  
- **Niveau 3** : `super_admin` - Contrôle total

---

## 👤 **RÔLE: USER (niveau 0)**
- **Accès** : Interface utilisateur standard seulement
- **Restrictions** : Aucun accès à `/admin/*`

---

## 🛡️ **RÔLE: MODERATOR (niveau 1)**

### ✅ **Permissions accordées :**
- **Dashboard admin** : Lecture seule des statistiques
- **Tickets support** : 
  - Voir tous les tickets
  - Changer statut (open → in_progress → resolved)
  - Répondre aux tickets
  - Ajouter notes internes
- **Logs système** : Consultation des logs d'audit
- **Utilisateurs** : Consultation de la liste (lecture seule)

### ❌ **Restrictions :**
- **Pas de changement de rôles** d'autres utilisateurs
- **Pas de bannissement** d'utilisateurs
- **Pas d'accès settings** admin
- **Pas d'export de données**

---

## 🔧 **RÔLE: ADMIN (niveau 2)**

### ✅ **Permissions accordées :**
**Toutes les permissions MODERATOR +**
- **Gestion utilisateurs** :
  - Bannir/débannir utilisateurs
  - Promouvoir vers `user` ou `moderator` uniquement
  - Voir statistiques détaillées des utilisateurs
- **Settings admin** : Configuration système
- **Export données** : Export CSV/JSON des données
- **Tickets support** : Actions avancées (fermeture définitive)

### ❌ **Restrictions :**
- **Pas de promotion vers `admin`** ou `super_admin`
- **Pas de suppression définitive** d'utilisateurs
- **Pas de modification** de sa propre promotion

---

## 👑 **RÔLE: SUPER_ADMIN (niveau 3)**

### ✅ **Permissions accordées :**
**CONTRÔLE TOTAL - Toutes les permissions ADMIN +**
- **Gestion rôles complète** :
  - Promouvoir vers tous les niveaux (`user`, `moderator`, `admin`, `super_admin`)
  - Rétrograder tous les utilisateurs (sauf lui-même)
- **Gestion utilisateurs avancée** :
  - Supprimer définitivement des utilisateurs
  - Modifier tous les profils utilisateurs
- **Actions critiques** :
  - Accès base de données avancé
  - Modification des politiques de sécurité
  - Backup et restore des données

### 🛡️ **Protections intégrées :**
- **Auto-protection** : Ne peut pas se rétrograder lui-même
- **Logging complet** : Toutes les actions tracées dans `admin_logs`

---

## 📋 **MATRICE DES PERMISSIONS**

| Fonctionnalité | User | Moderator | Admin | Super Admin |
|---|:---:|:---:|:---:|:---:|
| **Dashboard lecture** | ❌ | ✅ | ✅ | ✅ |
| **Tickets lecture** | ❌ | ✅ | ✅ | ✅ |
| **Tickets modération** | ❌ | ✅ | ✅ | ✅ |
| **Users lecture** | ❌ | ✅ | ✅ | ✅ |
| **Users bannissement** | ❌ | ❌ | ✅ | ✅ |
| **Promotion → moderator** | ❌ | ❌ | ✅ | ✅ |
| **Promotion → admin** | ❌ | ❌ | ❌ | ✅ |
| **Promotion → super_admin** | ❌ | ❌ | ❌ | ✅ |
| **Suppression utilisateur** | ❌ | ❌ | ❌ | ✅ |
| **Settings admin** | ❌ | ❌ | ✅ | ✅ |
| **Export données** | ❌ | ❌ | ✅ | ✅ |

---

## 🔧 **IMPLÉMENTATION TECHNIQUE**

### Code de vérification des permissions :
```typescript
// Dans useAdminAuthComplete.ts
const hasPermission = (requiredRole: 'moderator' | 'admin' | 'super_admin'): boolean => {
  const roleHierarchy = {
    'moderator': 1,
    'admin': 2, 
    'super_admin': 3
  }
  return userLevel >= requiredLevel
}
```

### Exemples d'utilisation dans l'interface :
```typescript
// Afficher bouton seulement si admin ou plus
{hasPermission('admin') && (
  <button onClick={banUser}>Bannir utilisateur</button>
)}

// Afficher dropdown rôles selon permissions
{hasPermission('super_admin') ? (
  <option value="admin">Admin</option>
) : null}
```

---

## 🎯 **COMPTE DE TEST ACTUEL**

- **Email** : thierryvm@hotmail.com
- **Rôle** : `super_admin` (niveau 3)
- **Permissions** : Contrôle total de l'interface admin
- **Peut promouvoir** : Tous les utilisateurs vers tous les rôles

---

## 📝 **RECOMMANDATIONS DE SÉCURITÉ**

1. **Principe du moindre privilège** : Donner le niveau minimum nécessaire
2. **Rotation des rôles** : Réviser périodiquement les permissions
3. **Audit logging** : Toutes les actions sensibles sont tracées
4. **Formation équipe** : S'assurer que chaque niveau comprend ses limites
5. **Backup super_admin** : Avoir au moins 2 comptes super_admin actifs