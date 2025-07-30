# 📁 Scripts Directory - IronTrack

## 🛡️ Sécurité

**IMPORTANT** : Ce dossier contient des scripts utilitaires pour le développement local.
- ✅ **Conservé en local** pour les opérations de développement
- ❌ **Pas commité dans Git** pour éviter l'exposition de données sensibles
- 🔐 **Variables d'environnement requises** : `.env.local`

## 📋 Scripts Disponibles

### 🔧 Scripts de Développement
- `dev-setup.js` : Configuration environnement dev/prod (SÉCURISÉ)
- `activate-realtime-autonomous.js` : Activation Realtime Supabase

### 📊 Scripts d'Analyse  
- `analyze-with-env.js` : Analyse doublons avec authentification
- `analyze-duplicates-comprehensive.js` : Analyse complète base de données
- `analyze-exercises-duplicates.js` : Analyse spécifique exercices

### 🔄 Scripts de Consolidation
- `consolidate-duplicates.js` : Consolidation automatique doublons
- `consolidate-duplicates-fixed.js` : Version corrigée consolidation
- `consolidation-strategy.md` : Documentation stratégie

## ⚠️ Usage

```bash
# Exemple : Analyse des doublons
node scripts/analyze-with-env.js

# Configuration développement
node scripts/dev-setup.js dev

# Configuration production  
node scripts/dev-setup.js prod
```

## 🚨 Règles de Sécurité

1. **Ne jamais commiter ce dossier** si il contient des données sensibles
2. **Utiliser les variables d'environnement** pour les secrets
3. **Vérifier .gitignore** avant tout commit
4. **Pas de Project ID ou URLs en dur** dans les scripts