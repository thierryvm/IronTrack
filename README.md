# IronTrack

Application de suivi fitness et musculation — Next.js 15 + Supabase + Vercel.

**Production** : [iron-track-dusky.vercel.app](https://iron-track-dusky.vercel.app)

---

## Fonctionnalités

| Module | Description |
|---|---|
| **Exercices** | Bibliothèque personnalisée avec assistant de création intelligent |
| **Performances** | Historique détaillé — séries, répétitions, poids, métriques cardio |
| **Cardio avancé** | Rameur (SPM, watts), tapis (inclinaison, vitesse), vélo (cadence, résistance) |
| **Nutrition** | Suivi alimentaire et calculs nutritionnels |
| **Progression** | Graphiques de progression par exercice et période |
| **Calendrier** | Planification des séances d'entraînement |
| **Partenaires** | Partage de programmes avec d'autres utilisateurs |
| **Notifications** | Rappels d'entraînement |
| **Support** | Système de tickets intégré |
| **Admin** | Panneau d'administration (utilisateurs, logs, exports) |
| **PWA** | Installable comme application native sur mobile/desktop |

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 15.5 — App Router |
| Language | TypeScript strict |
| UI | React 18 + Tailwind CSS + shadcn/ui |
| Animations | Framer Motion |
| Base de données | Supabase (PostgreSQL + RLS) |
| Authentification | Supabase Auth |
| IA | OpenAI API (suggestions d'exercices) |
| Déploiement | Vercel (auto-deploy sur push `main`) |
| Tests | Jest + Playwright |

---

## Installation

```bash
npm install
cp .env.example .env.local
# Remplir .env.local avec vos clés (voir ci-dessous)
npm run dev
```

### Variables d'environnement requises

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
OPENAI_API_KEY=<openai-key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Scripts

```bash
npm run dev                  # Développement (port 3000)
npm run build                # Build production
npm run lint                 # ESLint
npm run typecheck            # TypeScript
npm run test                 # Tests unitaires (Jest)
npm run test:e2e             # Tests end-to-end (Playwright)
npm run test:contrast        # Tests contraste WCAG
npm run test:regression      # Tests anti-régression
npm run db:push              # Push migrations Supabase
npm run db:refresh-cache     # Rafraîchir cache PostgREST
```

---

## Structure

```
src/
├── app/                    # Routes Next.js (App Router)
│   ├── (auth)/             # Pages publiques
│   ├── exercises/          # Gestion exercices
│   ├── workouts/           # Séances
│   ├── nutrition/          # Nutrition
│   ├── progress/           # Progression
│   ├── calendar/           # Calendrier
│   ├── training-partners/  # Partenaires
│   ├── admin/              # Administration
│   └── api/                # API Routes
├── components/             # Composants React
├── hooks/                  # Custom hooks
├── lib/                    # Utilitaires partagés
└── utils/supabase/         # Client Supabase
```

---

## Sécurité

- Row Level Security (RLS) activé sur toutes les tables
- Validation Zod sur toutes les entrées utilisateur
- Middleware d'authentification sur toutes les routes protégées
- Protection CSRF intégrée (Next.js)
- Conformité RGPD (utilisateurs belges)

---

## Déploiement

Push sur `main` → déploiement automatique Vercel.

```bash
# Déploiement manuel si besoin
npx vercel deploy --prod --token "$VERCEL_TOKEN"
```

---

**IronTrack** — Belgique 🇧🇪
