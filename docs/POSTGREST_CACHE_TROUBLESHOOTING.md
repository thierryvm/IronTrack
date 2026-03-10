# Guide de Résolution - Cache PostgREST Supabase

## 🚨 Problème Typique

**Erreur** : `"Could not find the 'column_name' column of 'table_name' in the schema cache"`

**Cause** : PostgREST utilise un cache des métadonnées de schéma qui ne se met pas toujours à jour automatiquement après les migrations.

## ✅ Solutions Éprouvées

### 1. Script Automatisé (Recommandé)

```bash
# Exécuter le script de rafraîchissement
node scripts/refresh-postgrest-cache.js
```

### 2. Commandes cURL Manuelles

#### Méthode A : RPC Function (Recommandée)
```bash
curl -X POST \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  "https://YOUR_PROJECT.supabase.co/rest/v1/rpc/refresh_postgrest_schema_cache"
```

**Réponse attendue** : `"Schema cache refresh initiated"`

#### Méthode B : Admin Endpoint (Alternative)
```bash
curl -X POST \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_PROJECT.supabase.co/rest/v1/admin/reload-schema"
```

### 3. Via PostgreSQL Direct (Si vous avez psql)
```sql
-- Se connecter à la base et envoyer un signal
NOTIFY pgrst, 'reload schema';
```

### 4. Commandes CLI Supabase

```bash
# Vérifier l'état des migrations
npx supabase db push --dry-run

# Forcer l'application des migrations
npx supabase db push --include-all

# Redémarrer l'instance locale (développement uniquement)
npx supabase stop && npx supabase start
```

## 🧪 Tests de Validation

### Vérifier que la colonne est accessible
```bash
curl -H "apikey: YOUR_SERVICE_ROLE_KEY" \
     -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
     "https://YOUR_PROJECT.supabase.co/rest/v1/TABLE_NAME?select=NEW_COLUMN&limit=1"
```

### Test d'écriture sur la nouvelle colonne
```bash
curl -X PATCH \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"NEW_COLUMN": "test_value"}' \
  "https://YOUR_PROJECT.supabase.co/rest/v1/TABLE_NAME?id=eq.RECORD_ID"
```

## 🕐 Temps de Propagation

- **RPC Function** : Immédiat (< 5 secondes)
- **Admin Endpoint** : Immédiat (< 5 secondes)
- **NOTIFY PostgreSQL** : Immédiat (< 5 secondes)
- **Auto-refresh** : 5-10 minutes (par défaut)

## ❌ Solutions Qui NE Marchent PAS

- ❌ Redémarrer l'application Next.js
- ❌ Vider le cache navigateur
- ❌ Attendre sans action
- ❌ Re-déployer l'application

## 📋 Checklist de Diagnostic

### Avant de Rafraîchir le Cache
1. ✅ Vérifier que la migration est appliquée : `npx supabase db push --dry-run`
2. ✅ Confirmer que la colonne existe en BDD directe
3. ✅ Vérifier les politiques RLS si applicable
4. ✅ Tester avec la clé `service_role` (ignore RLS)

### Après Rafraîchissement
1. ✅ Test de lecture de la nouvelle colonne
2. ✅ Test d'écriture si applicable
3. ✅ Vérification dans l'interface utilisateur
4. ✅ Tests automatisés si configurés

## 🛡️ Prévention

### Bonnes Pratiques
- **Toujours** rafraîchir le cache après les migrations en production
- **Intégrer** le script dans vos pipelines CI/CD
- **Tester** les colonnes après chaque migration
- **Documenter** les changements de schéma

### Configuration CI/CD
```yaml
# Exemple GitHub Actions
- name: Apply database migrations
  run: npx supabase db push --include-all

- name: Refresh PostgREST cache  
  run: node scripts/refresh-postgrest-cache.js

- name: Validate schema changes
  run: npm run test:schema
```

## 📊 Métriques IronTrack Spécifiques

### Problèmes Courants Résolus
- ✅ `rest_seconds` dans `performance_logs` - Résolu via RPC function
- ✅ Nouvelles colonnes de métriques cardio - Cache rafraîchi automatiquement
- ✅ Colonnes de gamification ajoutées - Script utilisé en CI/CD

### Configuration Actuelle
- **Projet ID** : `taspdceblvmpvdjixyit`
- **Région** : `eu-west-3`
- **Version PostgREST** : Stable Supabase
- **Rafraîchissement Auto** : 5 minutes

## 📞 Support

Si aucune solution ne fonctionne :
1. Vérifier le [status Supabase](https://status.supabase.com/)
2. Consulter les [docs PostgREST](https://postgrest.org/en/v12.0/)
3. Contacter le support Supabase avec les logs du script
4. Redémarrer l'instance depuis le dashboard Supabase (dernier recours)

---

**Dernière mise à jour** : 2025-08-07  
**Version script** : 1.0  
**Testé sur** : Supabase PostgREST stable