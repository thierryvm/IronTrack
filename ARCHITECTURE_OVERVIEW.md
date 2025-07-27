# IronTrack - Vue d'ensemble Architecture

**Version**: 1.0.0  
**Date**: 2025-01-27  
**Audience**: Développeurs, Architectes, Product Owners

> 📋 Document de référence pour comprendre rapidement l'architecture et les décisions techniques d'IronTrack

## 🏗️ Architecture Générale

### Stack Technique Principal

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│                 │    │                 │    │                 │
│ Next.js 15.3.5  │◄──►│ Next.js API     │◄──►│ Supabase        │
│ TypeScript      │    │ Routes          │    │ PostgreSQL      │
│ Tailwind CSS    │    │ Middleware      │    │ Row Level       │
│ Framer Motion   │    │                 │    │ Security        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🎯 Choix Architecturaux Clés

**Monolith Frontend + API Routes** : Simplicité déploiement, DX optimale  
**Supabase Backend-as-a-Service** : Développement rapide, auth intégrée  
**TypeScript Strict** : Qualité code, maintenance à long terme  
**App Router Next.js** : Performance, SEO, patterns modernes  

## 📁 Organisation du Code

### Structure par Domaine Fonctionnel

```
src/
├── app/                    # Pages & API Routes (App Router)
│   ├── (auth)/            # Auth routes (grouping)
│   ├── admin/             # Interface administration
│   ├── api/               # Backend API endpoints
│   ├── calendar/          # Module calendrier
│   ├── exercises/         # Gestion exercices
│   └── profile/           # Profil utilisateur
├── components/            # Composants React
│   ├── ui/                # Design system
│   ├── admin/             # Admin-specific
│   └── [feature]/         # Feature-specific
├── contexts/              # React Contexts (state global)
├── hooks/                 # Custom hooks (logique réutilisable)
├── services/              # Business logic (API calls)
├── types/                 # TypeScript definitions
└── utils/                 # Utilitaires purs
```

### 🧩 Patterns de Code

**Composants** : Functional components + hooks  
**State Management** : React Context + hooks (pas de Redux)  
**API Calls** : Services centralisés + hooks custom  
**Styling** : Tailwind CSS + composants design system  
**Forms** : Controlled components + validation custom  

## 🔐 Système d'Authentification

### Architecture Auth Multi-niveaux

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Client Request  │    │ Next.js         │    │ Supabase Auth   │
│                 │    │ Middleware      │    │                 │
│ /admin/users    │───►│ Route Guard     │───►│ JWT Validation  │
│ + Cookie        │    │ Role Check      │    │ + User Data     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                ▼
                       ┌─────────────────┐
                       │ Protected Page  │
                       │ + User Context  │
                       └─────────────────┘
```

### 🎭 Gestion des Rôles

**4 niveaux** : `user` → `moderator` → `admin` → `super_admin`  
**Inheritance** : Chaque niveau hérite des permissions inférieures  
**Context centralisé** : `AdminAuthContext` pour l'interface admin  

## 🗄️ Modèle de Données

### Schéma Entité-Relations Principal

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   profiles   │    │   workouts   │    │  exercises   │
│              │    │              │    │              │
│ id (FK auth) │◄──►│ user_id (FK) │    │ id (PK)      │
│ role         │    │ date         │    │ name         │
│ onboarding   │    │ status       │    │ type         │
└──────────────┘    └──────────────┘    └──────────────┘
       ▲                     ▼                   ▲
       │            ┌──────────────┐             │
       │            │workout_exers │             │
       │            │              │             │
       │            │ workout_id   │─────────────┘
       │            │ exercise_id  │
       │            └──────────────┘
       │                     ▼
       │            ┌──────────────┐
       │            │performance_  │
       │            │logs          │
       │            │              │
       └────────────│ user_id (FK) │
                    │ exercise_id  │
                    │ weight/reps  │
                    │ cardio_data  │
                    └──────────────┘
```

### 📊 Données Métriques Avancées

**Performance Logs enrichi** (2025-01-20) :
- **Musculation** : poids, reps, sets, repos, RPE
- **Cardio générique** : distance, durée, calories, rythme cardiaque
- **Rameur** : + SPM (stroke rate), watts, distance en mètres
- **Course/Tapis** : + inclinaison, vitesse, distance en km
- **Vélo** : + cadence RPM, résistance, distance en km

## 🎨 Design System & UX

### Composants UI Centralisés

```
components/ui/
├── Button.tsx             # Boutons variants
├── Modal.tsx              # Modals réutilisables  
├── Badge.tsx              # Badges & tags
├── Avatar.tsx             # Avatars utilisateurs
├── CalendarDayCell.tsx    # Cellules calendrier
└── IronBuddyFAB.tsx       # Mascotte & support
```

### 🎭 Système Mascotte IronBuddy

**4 personnalités** : IronBuddy, Félix, RoboCoach, SuperStar  
**3 intensités** : Discret, Normal, Ambianceur  
**384 contenus** : Blagues, conseils, motivations, défis  
**Pattern FAB** : Floating Action Button avec modes Support/Coach  

### 📱 Responsive Design

**Mobile-first** : Design adaptatif avec breakpoints Tailwind  
**Touch-friendly** : Éléments tactiles optimisés (>44px)  
**Performance** : Images optimisées Next.js, lazy loading  

## 🔄 Flux de Données

### Pattern Data Flow

```
1. User Action (Click/Form)
        ▼
2. Component Handler
        ▼  
3. Custom Hook (useFeature)
        ▼
4. Service Layer (API call)
        ▼
5. Next.js API Route
        ▼
6. Supabase Client
        ▼
7. PostgreSQL + RLS
        ▼
8. Response + State Update
        ▼
9. UI Re-render
```

### 🔄 State Management Strategy

**Local State** : `useState` pour UI temporaire  
**Global State** : React Context pour auth, admin  
**Server State** : Pas de cache client, fresh data à chaque requête  
**Form State** : Controlled components sans bibliothèque externe  

## 🚀 Performance & Optimisations

### 📈 Métriques Clés

**Core Web Vitals** : LCP <2.5s, FID <100ms, CLS <0.1  
**Bundle Size** : <200KB gzipped pour page type  
**API Response** : <500ms pour requêtes standard  
**Database** : Index optimisés sur colonnes fréquentes  

### ⚡ Optimisations Implémentées

**Next.js** :
- Image optimization automatique
- Static generation pour pages marketing
- Dynamic imports pour code splitting
- Middleware pour auth rapide

**Supabase** :
- Row Level Security pour sécurité native
- Index B-tree sur foreign keys
- Connection pooling activé
- Fonctions RPC pour queries complexes

**Frontend** :
- React.memo() sur composants coûteux
- Debounce sur recherches
- Pagination par défaut (50 items max)
- Lazy loading conditionnel

## 🛡️ Sécurité

### 🔒 Layers de Sécurité

```
┌─────────────────┐
│ Frontend        │ ← Input validation, XSS protection
├─────────────────┤
│ Next.js         │ ← CSRF protection, secure headers
├─────────────────┤  
│ Middleware      │ ← Auth verification, role checks
├─────────────────┤
│ API Routes      │ ← Rate limiting, data validation
├─────────────────┤
│ Supabase        │ ← Row Level Security, JWT validation
├─────────────────┤
│ PostgreSQL      │ ← Database constraints, encryption at rest
└─────────────────┘
```

### 🛡️ Mesures Spécifiques

**Authentification** :
- JWT tokens avec rotation automatique
- Session management via Supabase Auth
- Password policies (8+ chars, complexity)
- Email verification obligatoire

**Autorisation** :
- RLS policies sur toutes les tables sensibles
- Middleware de protection des routes admin
- Principe du moindre privilège
- Audit trail sur actions admin

**Données** :
- Validation stricte des inputs (côté client + serveur)
- Sanitization automatique des requêtes SQL
- Chiffrement HTTPS obligatoire
- Pas de données sensibles en localStorage

## 🔧 DevOps & Déploiement

### 🚀 Pipeline CI/CD

```
GitHub (main) → Vercel Auto-Deploy → Production
     ▲               ▼
   PR Review    Build + Typecheck
     ▲               ▼
Feature Branch   Preview Deploy
```

### 📊 Monitoring Stack

**Performance** : Vercel Analytics + Core Web Vitals  
**Erreurs** : Console errors + API error responses  
**Database** : Supabase Dashboard metrics  
**Uptime** : Vercel status + health checks  

## 🔮 Évolution Future

### 🎯 Roadmap Technique

**Q1 2025** :
- [ ] Tests automatisés (Jest + Playwright)
- [ ] Système i18n pour multilingue
- [ ] PWA + notifications push
- [ ] Migration vers React 19 + Next.js 16

**Q2 2025** :
- [ ] GraphQL avec Supabase (optionnel)
- [ ] Microservices pour IA (recommandations)
- [ ] Optimisations mobile natives
- [ ] Analytics avancées (conversion funnels)

### 🏗️ Considérations Scalabilité

**Database** : Partitioning par user_id si >100k utilisateurs  
**Frontend** : Micro-frontends si équipes multiples  
**API** : Rate limiting + cache Redis si charge élevée  
**CDN** : CloudFront pour assets statiques si global  

---

**© 2025 IronTrack - Architecture Overview**  
*Mis à jour : 2025-01-27 | Version : 1.0.0*