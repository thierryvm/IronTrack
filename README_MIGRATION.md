# Migration Base de Données - Training Partners

## Problème résolu

L'erreur `column "partnership_id" of relation "partner_sharing_settings" does not exist` était causée par l'absence de la table `partner_sharing_settings` nécessaire au fonctionnement du système Training Partners.

## Migration requise

Pour résoudre cette erreur et activer complètement le système Training Partners, vous devez créer la table `partner_sharing_settings` dans votre base de données Supabase.

### Étapes :

1. **Ouvrir Supabase Dashboard**
   - Aller sur [supabase.com](https://supabase.com)
   - Ouvrir votre projet IronTrack
   - Aller dans l'onglet "SQL Editor"

2. **Exécuter la migration**
   - Copier le contenu du fichier `migration_partner_sharing_settings.sql`
   - Coller dans l'éditeur SQL
   - Cliquer sur "Run" pour exécuter

3. **Vérification**
   - Aller dans l'onglet "Table Editor"
   - Vérifier que la table `partner_sharing_settings` existe
   - Vérifier que les RLS policies sont actives

## Fonctionnalités activées

Une fois la migration appliquée :

✅ **Acceptation d'invitations** : Fonctionne sans erreur  
✅ **Paramètres de partage** : Créés automatiquement lors de l'acceptation  
✅ **API `/api/training-partners/sharing`** : Fonctionnelle  
✅ **Gestion des permissions** : Contrôle granulaire du partage  

## Structure de la table

```sql
partner_sharing_settings (
  id uuid PRIMARY KEY,
  user_id uuid → profiles(id),
  partner_id uuid → profiles(id),
  share_workouts boolean DEFAULT false,
  share_nutrition boolean DEFAULT false,
  share_progress boolean DEFAULT false,
  created_at timestamptz,
  updated_at timestamptz,
  UNIQUE(user_id, partner_id)
)
```

## Sécurité (RLS)

- Les utilisateurs ne peuvent voir que leurs propres paramètres
- Les utilisateurs ne peuvent modifier que leurs propres paramètres
- Suppression automatique si un profil est supprimé

## Usage

Après la migration, le système Training Partners sera entièrement fonctionnel :
- Invitation/acceptation de partenaires
- Configuration des permissions de partage
- Partage sélectif des données (workouts, nutrition, progress)