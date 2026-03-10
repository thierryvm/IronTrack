# IronTrack - Guide de Déploiement

**Version**: 1.0.0  
**Date**: 2025-01-27  
**Audience**: DevOps, Développeurs, Administrateurs Système

> 🚀 Guide complet pour déployer et maintenir IronTrack en production

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis système](#prérequis-système)
3. [Configuration initiale](#configuration-initiale)
4. [Déploiement Vercel (recommandé)](#déploiement-vercel-recommandé)
5. [Déploiement alternatif](#déploiement-alternatif)
6. [Configuration base de données](#configuration-base-de-données)
7. [Variables d'environnement](#variables-denvironnement)
8. [Monitoring & Logs](#monitoring--logs)
9. [Sauvegarde & Restauration](#sauvegarde--restauration)
10. [Troubleshooting](#troubleshooting)

---

## Vue d'ensemble

**IronTrack** est une application Next.js full-stack déployée sur **Vercel** avec base de données **Supabase PostgreSQL**. L'architecture est optimisée pour un déploiement simple et une maintenance minimale.

### 🏗️ Architecture de Production

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Vercel          │    │ Supabase        │    │ GitHub          │
│                 │    │                 │    │                 │
│ • Next.js App   │◄──►│ • PostgreSQL    │◄───│ • Source Code   │
│ • Edge Network  │    │ • Auth Service  │    │ • Auto Deploy   │
│ • Auto Deploy   │    │ • Real-time     │    │ • CI/CD         │
│ • SSL/CDN       │    │ • File Storage  │    │ • Versioning    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🎯 Avantages de cette Architecture

- **Déploiement zero-config** : Push vers GitHub = déploiement automatique
- **Scaling automatique** : Vercel s'adapte à la charge
- **SSL/HTTPS intégré** : Certificats automatiques
- **Edge Network global** : Performance mondiale optimisée
- **Base de données managée** : Pas de maintenance serveur

---

## Prérequis système

### 🔧 Outils Obligatoires

- **Node.js** : v18.17+ (recommandé v20+)
- **npm** : v9+ ou **yarn** v1.22+
- **Git** : v2.30+

### 🔐 Comptes & Access

- **GitHub** : Repository et permissions push
- **Vercel** : Compte connecté à GitHub
- **Supabase** : Projet configuré avec PostgreSQL

### 📋 Vérification Prérequis

```bash
# Vérifier versions
node --version    # v18.17+ requis
npm --version     # v9+ requis
git --version     # v2.30+ requis

# Tester accès GitHub
ssh -T git@github.com

# Tester build local
npm run build     # Doit réussir sans erreur
```

---

## Configuration initiale

### 📥 Récupération du Code

```bash
# Cloner le repository
git clone https://github.com/thierryvm/IronTrack.git
cd IronTrack

# Installer dépendances
npm install

# Vérifier intégrité
npm audit
npm run typecheck
npm run lint
```

### 🔧 Configuration Locale

```bash
# Copier template environnement
cp .env.example .env.local

# Éditer variables (voir section Variables d'environnement)
nano .env.local

# Tester configuration
npm run dev
# → Doit démarrer sur http://localhost:3000
```

---

## Déploiement Vercel (recommandé)

### 🚀 Déploiement Initial

**Option 1 : Via Dashboard Vercel** (recommandé pour première fois)

1. **Connecter à GitHub** :
   - Aller sur [vercel.com](https://vercel.com)
   - "Import Git Repository"
   - Sélectionner `thierryvm/IronTrack`

2. **Configuration automatique** :
   - Framework : "Next.js" (détecté automatiquement)
   - Build Command : `npm run build` (défaut)
   - Output Directory : `.next` (défaut)
   - Install Command : `npm install` (défaut)

3. **Variables d'environnement** :
   - Ajouter toutes les variables de `.env.local`
   - Environment : "Production"

4. **Deploy** : Cliquer "Deploy"

**Option 2 : Via CLI Vercel**

```bash
# Installer CLI Vercel
npm i -g vercel

# Login (une seule fois)
vercel login

# Déployer
vercel --prod

# Suivre les prompts :
# • Set up and deploy "IronTrack"? [Y/n] → Y
# • Which scope? → Sélectionner votre compte
# • Link to existing project? [y/N] → N (première fois)
# • What's your project's name? → irontrack
# • In which directory is your code located? → ./
```

### 🔄 Configuration Auto-Deploy

**GitHub Integration** (automatique après première configuration) :

```bash
# Chaque push vers main déclenche un déploiement
git push origin main

# Vérifier statut
vercel ls
```

### 🌍 Configuration Domaine Custom

```bash
# Ajouter domaine personnalisé (optionnel)
vercel domains add votredomaine.com

# Pointer DNS vers Vercel :
# A record: 76.76.19.61
# CNAME record: cname.vercel-dns.com
```

---

## Déploiement alternatif

### 🐳 Docker (self-hosted)

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build et run
docker build -t irontrack .
docker run -p 3000:3000 --env-file .env.local irontrack
```

### ☁️ Autres Plateformes

**Netlify** :
```bash
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[functions]
  node_bundler = "esbuild"
```

**Railway** :
```bash
# Connecter GitHub repository
# Auto-detect Next.js
# Configurer variables d'environnement
```

---

## Configuration base de données

### 🗄️ Setup Supabase

**1. Création projet** :
- Aller sur [supabase.com](https://supabase.com)
- "New Project"
- Région : "West Europe (eu-west-1)" pour users belges
- Password : Générer strong password

**2. Configuration sécurité** :
```sql
-- Activer RLS sur toutes tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_logs ENABLE ROW LEVEL SECURITY;
-- etc. pour toutes les tables
```

**3. Import schéma** :
```bash
# Via Supabase CLI
npx supabase db push --db-url "postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# Ou via Dashboard > SQL Editor
-- Copier/coller contenu des migrations
```

### 🔧 Optimisations Production

```sql
-- Index pour performance
CREATE INDEX idx_performance_logs_user_exercise ON performance_logs(user_id, exercise_id);
CREATE INDEX idx_workouts_user_date ON workouts(user_id, scheduled_date);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);

-- Policies optimisées
CREATE POLICY "Optimized user data access" ON performance_logs
FOR SELECT USING (auth.uid() = user_id);
```

---

## Variables d'environnement

### 🔐 Variables Obligatoires Production

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application
NEXT_PUBLIC_APP_URL=https://votre-app.vercel.app
NEXTAUTH_SECRET=your-super-secret-random-string-here

# Features optionnelles
OPENAI_API_KEY=sk-...  # Pour suggestions IA exercices
SENTRY_DSN=https://...  # Pour monitoring erreurs
```

### ⚙️ Configuration Vercel CLI

```bash
# Ajouter variables une par une
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Ou via fichier
vercel env pull .env.production
```

### 🔒 Sécurité Variables

**Bonnes pratiques** :
- ✅ Jamais de secrets dans le code source
- ✅ Variables `NEXT_PUBLIC_*` uniquement pour données non-sensibles
- ✅ Service role key UNIQUEMENT côté serveur
- ✅ Rotation régulière des API keys

---

## Monitoring & Logs

### 📊 Monitoring Intégré Vercel

**Analytics** (activé par défaut) :
- Page views et unique visitors
- Core Web Vitals (LCP, FID, CLS)
- Géolocalisation des users
- Device/browser breakdown

**Speed Insights** :
```bash
# Activer dans dashboard Vercel
# → Analytics tab → Enable Speed Insights
```

### 📝 Logs Application

**Vercel Logs** :
```bash
# CLI logs en temps réel
vercel logs --follow

# Logs par déploiement
vercel logs [deployment-url]
```

**Supabase Logs** :
```bash
# Dashboard Supabase → Logs
# Filtres : Errors, Slow queries, Auth events
```

### 🚨 Alertes (recommandé)

**Email Alerts Vercel** :
- Dashboard → Settings → Notifications
- Build failures ✅
- Function errors ✅  
- Budget alerts ✅

**Supabase Alerts** :
- Database performance degradation
- High connection count
- Storage quota approach

---

## Sauvegarde & Restauration

### 💾 Stratégie Backup

**Données Application** :
```bash
# Backup automatique quotidien Supabase (Plan Pro+)
# Ou backup manuel :
npx supabase db dump --db-url "[CONNECTION_STRING]" > backup-$(date +%Y%m%d).sql
```

**Code Source** :
- Git repository (GitHub = backup naturel)
- Branches multiples pour historique
- Tags pour versions stables

**Configuration** :
- Variables d'environnement documentées
- Scripts de déploiement versionnés

### 🔄 Procédure Restauration

**Database** :
```bash
# Restaurer depuis backup
psql "[CONNECTION_STRING]" < backup-20250127.sql

# Ou via Supabase Dashboard
# → Settings → Database → Restore from backup
```

**Application** :
```bash
# Rollback via Vercel
vercel rollback [deployment-url]

# Ou redéployer version stable
git checkout v1.0.0
vercel --prod
```

---

## Troubleshooting

### 🔧 Problèmes Fréquents

**Build Failures** :
```bash
# Erreur TypeScript
npm run typecheck
# → Corriger erreurs types

# Erreur ESLint  
npm run lint
# → Corriger warnings/errors

# Dépendances manquantes
npm install
# → Vérifier package-lock.json
```

**Erreurs Runtime** :
```bash
# Variables d'environnement manquantes
vercel env ls
# → Vérifier toutes variables présentes

# Erreurs Supabase
# → Vérifier RLS policies
# → Tester requêtes dans SQL Editor
```

**Performance Issues** :
```bash
# Build size trop large
npx @next/bundle-analyzer
# → Identifier gros modules

# Slow queries
# → Supabase Dashboard → Performance
# → Ajouter index si nécessaire
```

### 📞 Support Contacts

**Vercel** :
- Documentation : https://vercel.com/docs
- Community : https://github.com/vercel/vercel/discussions
- Status : https://vercel-status.com

**Supabase** :
- Documentation : https://supabase.com/docs
- Community : https://github.com/supabase/supabase/discussions
- Status : https://status.supabase.com

### 🆘 Procédure Urgence

**En cas de panne critique** :

1. **Vérifier status pages** : Vercel/Supabase
2. **Rollback dernière version stable** : `vercel rollback`
3. **Check logs** : `vercel logs --follow`
4. **Contacter support** si problème infrastructure
5. **Communication users** via status page custom

---

**© 2025 IronTrack - Deployment Guide**  
*Dernière révision : 2025-01-27*