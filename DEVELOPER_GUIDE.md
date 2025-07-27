# IronTrack - Guide Développeur Complet

**Version**: 1.0.0  
**Dernière mise à jour**: 2025-01-27  
**Contact**: Développeurs & Administrateurs IronTrack  

> 📋 Ce guide permet à tout développeur de reprendre facilement le projet IronTrack, que ce soit pour maintenance, développement de nouvelles fonctionnalités, ou transfert d'ownership.

## 📖 Table des Matières

1. [Vue d'ensemble du projet](#vue-densemble-du-projet)
2. [Architecture technique](#architecture-technique)
3. [Configuration initiale](#configuration-initiale)
4. [Base de données](#base-de-données)
5. [Authentification & Autorisation](#authentification--autorisation)
6. [Déploiement](#déploiement)
7. [Tests & Qualité](#tests--qualité)
8. [Maintenance & Monitoring](#maintenance--monitoring)
9. [Développement de nouvelles fonctionnalités](#développement-de-nouvelles-fonctionnalités)
10. [Ressources & Documentation](#ressources--documentation)

---

## Vue d'ensemble du projet

**IronTrack** est une application web de suivi d'entraînement sportif développée en Next.js avec TypeScript, ciblant principalement les utilisateurs belges francophones.

### 🎯 Fonctionnalités Principales

- **Gestion des exercices** : Création, modification, suivi des performances
- **Calendrier d'entraînement** : Planning des séances avec vue mensuelle
- **Système de progression** : Badges, objectifs, statistiques
- **Training Partners** : Partage de séances entre utilisateurs
- **Interface Admin** : Gestion complète des utilisateurs et du support
- **Mascotte IronBuddy** : Assistant intelligent avec 384 contenus français
- **Support intégré** : Système de tickets avec réponses

### 🔧 Technologies Clés

- **Frontend** : Next.js 15.3.5, TypeScript, Tailwind CSS, Framer Motion
- **Backend** : Next.js API Routes, Supabase (PostgreSQL)
- **Authentification** : Supabase Auth avec système de rôles
- **Déploiement** : Vercel (auto-deploy depuis GitHub)
- **Outils** : ESLint, Prettier, CLI Supabase, Vercel CLI

---

## Architecture technique

### 📁 Structure du projet

```
irontrack/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── admin/             # Interface d'administration
│   │   ├── api/               # API Routes Next.js
│   │   ├── calendar/          # Module calendrier
│   │   ├── exercises/         # Gestion des exercices
│   │   └── profile/           # Profil utilisateur
│   ├── components/            # Composants React réutilisables
│   │   ├── ui/                # Composants UI génériques
│   │   ├── admin/             # Composants spécifiques admin
│   │   └── onboarding/        # Processus d'intégration
│   ├── contexts/              # React Contexts (Auth, Admin)
│   ├── hooks/                 # Custom React Hooks
│   ├── lib/                   # Utilitaires et configurations
│   ├── services/              # Services métier
│   ├── types/                 # Types TypeScript
│   └── utils/                 # Fonctions utilitaires
├── public/                    # Assets statiques
├── supabase/                  # Migrations et types Supabase
├── CLAUDE.md                  # Instructions développement
└── package.json               # Dépendances et scripts
```

### 🏗️ Architecture logicielle

**Pattern**: Component-based avec hooks et contexts  
**State Management**: React Context + useState/useEffect  
**Routing**: Next.js App Router (file-based)  
**Styling**: Tailwind CSS avec composants custom  
**API**: RESTful avec Next.js API Routes  

### 🔄 Flux de données

1. **Client** → **Next.js API Routes** → **Supabase** → **PostgreSQL**
2. **Authentication** : Supabase Auth → **Middleware** → **Protected Routes**
3. **Real-time** : Supabase Realtime pour notifications

---

## Configuration initiale

### 📋 Prérequis

- **Node.js** : v18+ (recommandé v20+)
- **npm/yarn** : Gestionnaire de paquets
- **Git** : Contrôle de version
- **Comptes** : GitHub, Vercel, Supabase

### ⚙️ Installation

```bash
# 1. Cloner le repository
git clone https://github.com/thierryvm/IronTrack.git
cd IronTrack

# 2. Installer les dépendances
npm install

# 3. Copier les variables d'environnement
cp .env.example .env.local

# 4. Configurer les variables (voir section suivante)
# Éditer .env.local avec vos clés

# 5. Démarrer en développement
npm run dev
```

### 🔐 Variables d'environnement

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://taspdceblvmpvdjixyit.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-... # Pour suggestions d'exercices IA
NEXT_PUBLIC_APP_URL=http://localhost:3000 # ou URL production
```

### 🛠️ Scripts npm essentiels

```bash
npm run dev          # Développement (localhost:3000)
npm run build        # Build production
npm run start        # Serveur production
npm run lint         # Vérification ESLint
npm run typecheck    # Vérification TypeScript
```

---

## Base de données

### 🗄️ Schéma principal

**13 tables principales** organisées par domaine :

#### Utilisateurs & Authentification
- **`profiles`** : Profils utilisateurs (extension auth.users)
- **`user_badges`** : Attribution des badges aux utilisateurs

#### Entraînement
- **`exercises`** : Catalogue des exercices
- **`equipment`** : Équipements sportifs
- **`muscle_groups`** : Groupes musculaires
- **`performance_logs`** : Données de performance (métriques cardio avancées)
- **`workouts`** : Séances d'entraînement
- **`badges`** : Système de récompenses

#### Système
- **`support_tickets`** : Tickets de support
- **`ticket_responses`** : Réponses aux tickets
- **`admin_logs`** : Logs d'audit administrateur

#### Fonctionnalités avancées
- **`training_goals`** : Objectifs personnalisés
- **`nutrition_logs`** : Suivi nutritionnel (future)

### 🔧 Configuration Supabase CLI

```bash
# Configuration initiale
npx supabase login
npx supabase link --project-ref taspdceblvmpvdjixyit

# Gestion des migrations
npx supabase migration new nom_migration
npx supabase db push

# Génération des types TypeScript
npx supabase gen types typescript --project-id taspdceblvmpvdjixyit > src/types/supabase.ts
```

### 🛡️ Row Level Security (RLS)

**Toutes les tables ont RLS activé** avec politiques spécifiques :

```sql
-- Exemple : Table profiles
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles  
FOR UPDATE USING (auth.uid() = id);

-- Exemple : Données admin uniquement
CREATE POLICY "Admin access only" ON admin_logs
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);
```

### 📊 Métriques cardio avancées

**Nouvelles colonnes `performance_logs`** (ajout 2025-01-20) :
- `stroke_rate` : Cadence rameur (16-36 SPM)
- `watts` : Puissance rameur (50-500W)
- `heart_rate` : Rythme cardiaque (60-200 BPM)
- `incline` : Inclinaison tapis (0-15%)
- `cadence` : Cadence vélo (50-120 RPM)
- `resistance` : Résistance vélo (1-20)
- `distance_unit` : Unité distance ('km', 'm', 'miles')

---

## Authentification & Autorisation

### 🔐 Système de rôles

**4 niveaux d'autorisation** :

1. **`user`** : Utilisateur standard (défaut)
2. **`moderator`** : Modération des contenus
3. **`admin`** : Administration complète
4. **`super_admin`** : Accès total + gestion des admins

### 🛡️ Protection des routes

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // Protection des routes /admin/*
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const user = await getUser(request)
    if (!user || !['moderator', 'admin', 'super_admin'].includes(user.role)) {
      return NextResponse.redirect('/login')
    }
  }
}
```

### 👨‍💼 Compte superadmin de test

**Credentials de développement** :
- **Email** : thierryvm@hotmail.com
- **Password** : Lucas24052405@
- **Rôle** : super_admin
- **Usage** : Tests et développement uniquement

### 🔄 Contexts d'authentification

**`AdminAuthContext`** : Authentification admin centralisée
**`useAdminAuth()`** : Hook pour les composants admin

```typescript
const { user, isAdmin, isSuperAdmin, refreshUserRoles } = useAdminAuth()
```

---

## Déploiement

### 🚀 Vercel (Production)

**Configuration automatique** via GitHub :

```bash
# Vercel CLI (optionnel)
npx vercel --token to8SMa1nL6Ed2TVyetbM87FO

# Variables d'environnement production
npx vercel env add VARIABLE_NAME production

# Déploiement manuel
npx vercel deploy --prod
```

**URLs de production** :
- **App** : https://iron-track-dusky.vercel.app
- **Admin** : https://iron-track-dusky.vercel.app/admin

### 🔧 Configuration Vercel

**vercel.json** (si nécessaire) :
```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### 📊 Variables d'environnement production

**Obligatoires** :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_APP_URL`

### 🔄 Workflow de déploiement

1. **Développement** : Commit sur branche feature
2. **Review** : Pull Request vers `main`
3. **Tests** : Vérification automatique (ESLint, TypeScript)
4. **Deploy** : Auto-déploiement via GitHub → Vercel
5. **Verification** : Tests manuels sur production

---

## Tests & Qualité

### 🧪 Scripts de qualité

```bash
# Vérifications code
npm run lint            # ESLint
npm run typecheck       # TypeScript
npm run build           # Build test

# Tests (à configurer)
npm run test            # Jest (non configuré)
npm run test:e2e        # Playwright (non configuré)
```

### 📏 Standards code

**ESLint** : Configuration Next.js + TypeScript strict
**Prettier** : Formatage automatique
**TypeScript** : Mode strict activé

### 🔍 Audit sécurité

**Supabase Security** : Audit régulier RLS et fonctions
**Dependencies** : `npm audit` pour vulnérabilités
**Secrets** : Vérification .gitignore et variables env

---

## Maintenance & Monitoring

### 📊 Monitoring (recommandé)

- **Vercel Analytics** : Métriques de performance
- **Sentry** : Monitoring erreurs (à configurer)
- **Supabase Dashboard** : Métriques base de données
- **GitHub Actions** : CI/CD (à configurer)

### 🔧 Tâches de maintenance

**Hebdomadaire** :
- Vérification logs erreurs Vercel
- Audit performances Supabase
- Mise à jour dépendances critiques

**Mensuel** :
- `npm audit` et correction vulnérabilités
- Backup base de données
- Review des logs admin

**Trimestriel** :
- Mise à jour Next.js et dépendances majeures
- Audit complet sécurité Supabase
- Optimisation performances

### 💾 Sauvegarde

**Base de données** :
```bash
# Backup Supabase (CLI)
npx supabase db dump --db-url "postgresql://..." > backup.sql

# Backup via dashboard Supabase
# Settings → Database → Backup
```

**Code source** : GitHub (repository principal + forks)

---

## Développement de nouvelles fonctionnalités

### 🎯 Workflow développement

1. **Analyse** : Étude des besoins + impact technique
2. **Design** : Maquettes UI/UX + architecture
3. **Implementation** : Code + tests
4. **Review** : Code review + validation
5. **Deploy** : Staging → Production

### 🧩 Patterns recommandés

**Composants** :
```typescript
// Pattern type-safe avec interfaces claires
interface ComponentProps {
  data: TypedData
  onAction: (id: string) => Promise<void>
}

export const Component: React.FC<ComponentProps> = ({ data, onAction }) => {
  // Implementation
}
```

**Hooks custom** :
```typescript
// Encapsulation logique métier
export function useFeature() {
  const [state, setState] = useState<FeatureState>()
  
  const performAction = useCallback(async () => {
    // Business logic
  }, [])
  
  return { state, performAction }
}
```

**API Routes** :
```typescript
// src/app/api/feature/route.ts
export async function POST(request: Request) {
  try {
    // Validation input
    // Business logic
    // Return response
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Message' }, { status: 500 })
  }
}
```

### 🗄️ Modifications base de données

**Process obligatoire** :
1. Créer migration Supabase : `npx supabase migration new feature_name`
2. Écrire SQL dans le fichier généré
3. Tester localement : `npx supabase db reset`
4. Push en production : `npx supabase db push`
5. Générer types : `npx supabase gen types typescript`

### 🎨 Ajout de composants UI

**Standards** :
- Utiliser Tailwind CSS pour le styling
- Composants responsive (mobile-first)
- Support thème sombre/clair
- Accessibilité (ARIA, keyboard navigation)
- Types TypeScript stricts

---

## Ressources & Documentation

### 📚 Documentation officielle

- **Next.js** : https://nextjs.org/docs
- **Supabase** : https://supabase.com/docs  
- **Tailwind CSS** : https://tailwindcss.com/docs
- **TypeScript** : https://www.typescriptlang.org/docs

### 🔗 Repositories & Outils

- **GitHub** : https://github.com/thierryvm/IronTrack
- **Vercel Dashboard** : https://vercel.com/thierry-vanmeeterens-projects
- **Supabase Dashboard** : https://supabase.com/dashboard/project/taspdceblvmpvdjixyit

### 📋 Configuration système

**IDs et tokens** (voir CLAUDE.md pour détails complets) :
- **Supabase Project ID** : `taspdceblvmpvdjixyit`
- **Vercel Project** : `irontrack`
- **GitHub Repo** : `thierryvm/IronTrack`

### 🆘 Support technique

**En cas de problème** :
1. Consulter logs Vercel Dashboard
2. Vérifier logs Supabase Dashboard  
3. Check GitHub Issues
4. Documentation technique dans CLAUDE.md
5. Contact développeur principal si nécessaire

### 🔄 Mise à jour de ce guide

**Ce guide doit être maintenu à jour** lors de :
- Changements d'architecture majeurs
- Nouvelles fonctionnalités importantes  
- Modifications des processus de déploiement
- Évolution des outils et dépendances

---

**© 2025 IronTrack - Guide Développeur**  
*Dernière révision : 2025-01-27*