# Rapport de Revue de Code — IronTrack
**Date** : 17 mars 2026
**Réalisé par** : Claude Code (claude-sonnet-4-6)
**Périmètre** : `src/app/admin/page.tsx`, `src/utils/supabase/`
**Demande initiale** : Revue code admin page, audit sécurité supabase, performance ExerciseList

---

## Commandes & Agents utilisés

| Outil | Usage | Résultat |
|-------|-------|---------|
| `Read` (outil natif) | Lecture de `admin/page.tsx` | 597 lignes analysées |
| `Read` (outil natif) | Lecture de `utils/supabase/client.ts` | 23 lignes analysées |
| `Read` (outil natif) | Lecture de `utils/supabase/server.ts` | 48 lignes analysées |
| `Read` (outil natif) | Lecture de `utils/supabase/route-handler.ts` | 41 lignes analysées |
| `Glob` (outil natif) | Recherche `src/lib/**/*.ts` | Pas de `supabase.ts` → fichier introuvable |
| `Glob` (outil natif) | Recherche `src/utils/supabase/**/*.ts` | 3 fichiers trouvés |
| `Glob` (outil natif) | Recherche `src/components/Exercise*.tsx` | Aucun résultat → `ExerciseList.tsx` introuvable |
| `Glob` (outil natif) | Recherche `src/components/**/*.tsx` | Inventaire complet des composants |

> **Aucun agent spécialisé externe** n'a été invoqué pour cette analyse — les outils natifs `Read`, `Glob`, `Grep` suffisaient pour une revue directe des fichiers.
> Pour une revue plus large (toute la codebase), utiliser : `/code-review` ou `/orchestrate`.

---

## Partie 1 — Code Review : `src/app/admin/page.tsx`

### 1.1 Violations des Règles d'Or CLAUDE.md

#### 🔴 CRITIQUE — Règle 2 + Règle 5 : Variables CSS non utilisées + Dark mode hardcodé

**Problème** : Le composant utilise massivement des classes Tailwind hardcodées au lieu des variables CSS du design system.

**Fichier** : `src/app/admin/page.tsx`

**Occurrences** :
```
Ligne 253 : bg-gray-200 dark:bg-gray-700    → bg-muted
Ligne 254 : bg-gray-200 dark:bg-gray-700    → bg-muted
Ligne 265 : bg-white dark:bg-gray-900       → bg-card
Ligne 267 : bg-gray-200 dark:bg-gray-700    → bg-muted
Ligne 278 : bg-white dark:bg-gray-900       → bg-card
Ligne 295 : bg-white dark:bg-gray-900       → bg-card
Ligne 313 : bg-white dark:bg-gray-900       → bg-card
Ligne 317 : bg-gray-50 dark:bg-gray-800     → bg-muted/50
Ligne 409 : bg-white dark:bg-gray-900       → bg-card
Ligne 448 : bg-white dark:bg-gray-900       → bg-card
Ligne 478 : bg-white dark:bg-gray-900       → bg-card
Ligne 500 : dark:bg-gray-800               → bg-muted
Ligne 524 : bg-white dark:bg-gray-900       → bg-card
Ligne 559 : bg-gray-50 dark:bg-gray-800     → bg-muted
```

**Correction type** :
```tsx
// ❌ Avant
<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 ...">

// ✅ Après
<div className="bg-card border border-border ...">
```

**Skeleton complet à corriger** (lignes 249–329) :
```tsx
// ❌ Avant
<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />

// ✅ Après
<div className="h-8 bg-muted rounded w-1/3 mb-2" />
```

---

#### 🟠 HAUTE — Règle 10 : console.error en production

**Problème** : 6 appels `console.error` présents dans le code de production.

| Ligne | Contexte |
|-------|---------|
| 138 | `console.error('Erreur API stats admin:', response.status)` |
| 144 | `console.error('Erreur récupération stats admin:', error)` |
| 165 | `console.error('Erreur API admin activity:', response.status)` |
| 168 | `console.error('Erreur récupération activité admin:', error)` |
| 186 | `console.error('Erreur chargement dashboard:', error)` |

**Correction** : Créer un logger structuré ou supprimer silencieusement en production :
```ts
// src/lib/logger.ts (à créer si inexistant)
export const logger = {
  error: (msg: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(msg, ...args)
    }
    // En prod : envoyer vers un service (Sentry, etc.)
  }
}

// Dans admin/page.tsx
import { logger } from '@/lib/logger'
// Remplacer tous les console.error par logger.error
```

---

### 1.2 Problèmes React & TypeScript

#### 🔴 CRITIQUE — `createClient()` recréé à chaque render

**Ligne** : 55
**Problème** : `const supabase = createClient()` est appelé à chaque render du composant. De plus, `supabase` est dans les dépendances du `useCallback` (ligne 191), ce qui force la récréation de `loadDashboardData` à chaque render.

```tsx
// ❌ Ligne 55 — recréation à chaque render
const supabase = createClient()
```

**Correction** :
```tsx
// ✅ Option 1 : useMemo (recommandé dans un composant)
const supabase = useMemo(() => createClient(), [])

// ✅ Option 2 : déplacer hors du composant si possible
```

---

#### 🟠 HAUTE — `quickActions` recréé à chaque render

**Lignes** : 59–108
**Problème** : Le tableau `quickActions` (statique) est redéfini à chaque render.

```tsx
// ❌ Avant — dans le corps du composant
const quickActions: QuickAction[] = [ ... ]

// ✅ Après — hors du composant (données statiques)
const QUICK_ACTIONS: QuickAction[] = [ ... ]

export default function AdminDashboard() {
  // utiliser QUICK_ACTIONS directement
}
```

---

#### 🟠 HAUTE — Stale closure dans `loadDashboardData`

**Lignes** : 115–191
**Problème** : `lastRefreshTime` et `refreshing` dans les dépendances du `useCallback` créent une chaîne de récréations. Chaque changement de `lastRefreshTime` recrée `loadDashboardData`, ce qui peut déclencher `useEffect` de nouveau.

**Correction** : Utiliser des `ref` pour les valeurs de contrôle de throttling :
```tsx
const refreshingRef = useRef(false)
const lastRefreshTimeRef = useRef(0)
const REFRESH_COOLDOWN = 2000

const loadDashboardData = useCallback(async () => {
  if (refreshingRef.current) return

  const now = Date.now()
  if ((now - lastRefreshTimeRef.current) < REFRESH_COOLDOWN) return

  refreshingRef.current = true
  lastRefreshTimeRef.current = now
  setRefreshing(true)

  try {
    // ... logique fetch
  } finally {
    refreshingRef.current = false
    setRefreshing(false)
    setLoading(false)
  }
}, [logAdminAction, getAdminStats, hasPermission]) // deps stables uniquement
```

---

#### 🟠 HAUTE — Type faible `Record<string, unknown>`

**Ligne** : 49
**Problème** : `recentTickets` est typé `Array<Record<string, unknown>>` — aucune sécurité de type, multiplicité de `String(ticket.xxx || '')` dans le JSX.

**Correction** :
```tsx
// Ajouter l'interface (lignes 28-45, après les imports)
interface SupportTicket {
  id: string
  title: string
  category: string
  status: string
  priority: string
  created_at: string
}

// Remplacer ligne 49
const [recentTickets, setRecentTickets] = useState<SupportTicket[]>([])

// Dans le JSX, plus besoin de String(ticket.xxx || '')
{ticket.title}
{ticket.category}
```

---

#### 🟡 MOYENNE — Log spam sur chaque refresh

**Ligne** : 183
**Problème** : `logAdminAction('dashboard_viewed', 'dashboard')` est appelé à chaque `loadDashboardData()`, y compris les refreshes manuels — pollue les logs admin.

**Correction** :
```tsx
// Logger uniquement au premier chargement (montage du composant)
const hasLoggedView = useRef(false)

// Dans loadDashboardData, avant le finally :
if (!hasLoggedView.current) {
  await logAdminAction('dashboard_viewed', 'dashboard')
  hasLoggedView.current = true
}
```

---

#### 🟡 MOYENNE — Double nesting inutile (tickets)

**Lignes** : 499–500
**Problème** : Double `<div>` avec `onClick` et `cursor-pointer` dupliqués. Inaccessible (pas de rôle button/link).

```tsx
// ❌ Avant
<div key={...} className="cursor-pointer" onClick={() => router.push('/admin/tickets')}>
  <div className="p-3 border ... cursor-pointer">
    ...
  </div>
</div>

// ✅ Après — un seul élément, accessible
<button
  key={String(ticket.id)}
  onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
  className="w-full text-left p-3 border border-border rounded-lg hover:bg-muted transition-colors"
>
  ...
</button>
```

---

#### 🟡 MOYENNE — Incohérence sécurité : tickets via Supabase direct

**Lignes** : 175–180
**Problème** : Stats et activité passent par des routes API sécurisées (`/api/admin/stats`, `/api/admin/activity`) mais les tickets sont chargés **directement via le client Supabase**. Contourne potentiellement la vérification des permissions côté serveur.

```tsx
// ❌ Avant — Supabase direct côté client
const { data: ticketsData } = await supabase
  .from('support_tickets')
  .select('...')
  .limit(5)

// ✅ Après — Via route API sécurisée (à créer : /api/admin/tickets)
const response = await fetch('/api/admin/tickets?limit=5')
if (response.ok) {
  const { tickets } = await response.json()
  setRecentTickets(tickets)
}
```

---

#### 🟡 BASSE — `setLoading(false)` prématuré dans useEffect

**Ligne** : 204
**Problème** : `setLoading(false)` est appelé **avant** `loadDashboardData()`, ce qui peut causer un flash du contenu vide pendant le chargement.

```tsx
// ❌ Avant
useEffect(() => {
  if (hasPermission('moderator') && !stats && !authLoading) {
    setLoading(false) // ← trop tôt
    loadDashboardData()
  }
}, [...])

// ✅ Après — laisser loadDashboardData gérer le loading dans son finally
useEffect(() => {
  if (hasPermission('moderator') && !stats && !authLoading) {
    loadDashboardData()
  }
}, [hasPermission, stats, authLoading, loadDashboardData])
```

---

### 1.3 Récapitulatif des corrections admin/page.tsx

| # | Priorité | Ligne(s) | Problème | Effort |
|---|----------|----------|---------|--------|
| 1 | 🔴 Critique | 55 | `createClient()` recréé à chaque render | 5 min |
| 2 | 🔴 Critique | Multiple | `dark:bg-gray-X` → variables CSS | 20 min |
| 3 | 🟠 Haute | 59–108 | `quickActions` hors composant | 5 min |
| 4 | 🟠 Haute | 115–191 | Stale closure throttling → useRef | 15 min |
| 5 | 🟠 Haute | 49 | Type `Record<string,unknown>` → interface | 10 min |
| 6 | 🟠 Haute | 175–180 | Tickets via API route sécurisée | 30 min |
| 7 | 🟡 Moyenne | 138–186 | `console.error` → logger structuré | 10 min |
| 8 | 🟡 Moyenne | 183 | Log spam dashboard_viewed | 5 min |
| 9 | 🟡 Basse | 499–500 | Double nesting tickets | 10 min |
| 10 | 🟡 Basse | 204 | `setLoading(false)` prématuré | 2 min |

---

## Partie 2 — Audit Sécurité : `src/utils/supabase/`

### Fichiers analysés
- `src/utils/supabase/client.ts` (23 lignes)
- `src/utils/supabase/server.ts` (48 lignes)
- `src/utils/supabase/route-handler.ts` (41 lignes)

---

### 2.1 Points positifs ✅

| Aspect | Localisation | Statut |
|--------|-------------|--------|
| PKCE flow activé | `client.ts:8` | ✅ Sécurisé |
| `detectSessionInUrl: true` | `client.ts:9` | ✅ Sécurisé |
| `autoRefreshToken: true` | `client.ts:11` | ✅ Sécurisé |
| `secure: true` en production | `server.ts:26` | ✅ Correct |
| `sameSite: 'lax'` | `server.ts:28` | ✅ Correct |
| Pas de `service_role` key côté client | Tous fichiers | ✅ Sécurisé |
| `eventsPerSecond: 2` realtime | `client.ts:16` | ✅ Rate limiting |

---

### 2.2 Points d'attention ⚠️

#### 🟠 HAUTE — `httpOnly: false` (intentionnel mais risqué)

**Fichiers** : `server.ts:24`, `route-handler.ts:20`
**Explication** : La valeur `httpOnly: false` est **requise** pour que le SDK Supabase côté client accède aux tokens (PKCE flow). C'est un choix documenté dans les deux fichiers.

**Risque** : Un cookie non-httpOnly accessible en JavaScript augmente la surface d'attaque XSS — si un script malveillant s'exécute, il peut lire les tokens d'auth.

**Mitigation obligatoire** : S'assurer que le Content Security Policy (CSP) est strict pour empêcher l'injection de scripts.

```bash
# Vérifier le CSP actuel
grep -r "Content-Security-Policy" src/ next.config.*
```

**Action recommandée** : Vérifier `next.config.ts` pour la présence d'un CSP restrictif avec `script-src 'self'`.

---

#### 🟠 HAUTE — `maxAge` hardcodé à 7 jours (écrase la durée Supabase)

**Fichiers** : `server.ts:32`, `route-handler.ts:28`
**Problème** : Le `maxAge: 7 * 24 * 60 * 60` est appliqué **systématiquement**, écrasant la durée que Supabase calculerait selon le type de token (access token = 1h, refresh token = variable).

**Risque** : Le cookie reste valide 7 jours même si le token Supabase a expiré côté serveur. L'application gèrera l'erreur d'auth mais le cookie "zombie" persiste.

**Correction** :
```ts
// ✅ server.ts — Laisser passer le maxAge de Supabase
set: async (name: string, value: string, options: Record<string, unknown>) => {
  const cookieStore = await cookies()
  cookieStore.set(name, value, {
    ...options, // options inclut déjà maxAge de Supabase
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    // ❌ Supprimer le maxAge hardcodé — laisser Supabase décider
  })
},
```

---

#### 🟡 MOYENNE — Non-null assertions `!` sans validation de démarrage

**Fichiers** : `client.ts:3-4`, `server.ts:4-5`, `route-handler.ts:8-9`
**Problème** : `process.env.NEXT_PUBLIC_SUPABASE_URL!` lance `createBrowserClient(undefined, ...)` si la variable est absente — erreur peu lisible.

**Correction** :
```ts
// src/utils/supabase/client.ts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variables d\'environnement Supabase manquantes. ' +
    'Vérifier NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local'
  )
}
```

---

#### 🟡 BASSE — Incohérence async/sync entre server.ts et route-handler.ts

**Problème** :
- `server.ts` : méthodes `get`, `getAll`, `set`, `remove` toutes **async**
- `route-handler.ts` : méthodes `get`, `set`, `remove` toutes **sync**

Dans Next.js 15, `cookies()` est async — `route-handler.ts` appelle `cookieStore.get()` de manière synchrone sur un store potentiellement non-résolu.

**Correction** : Aligner `route-handler.ts` sur le pattern async de `server.ts` :
```ts
// route-handler.ts — pattern async (comme server.ts)
export async function createRouteHandlerClient() {
  const cookieStore = await cookies() // await au niveau de la fonction

  return createServerClient(url, key, {
    cookies: {
      get: (name: string) => cookieStore.get(name)?.value,
      set: (name: string, value: string, options: ...) => {
        cookieStore.set(name, value, { ...options, ... })
      },
      remove: (name: string, options: ...) => {
        cookieStore.set(name, '', { ...options, maxAge: 0 })
      }
    }
  })
}
```

---

### 2.3 Récapitulatif des corrections supabase/

| # | Priorité | Fichier | Problème | Effort |
|---|----------|---------|---------|--------|
| 1 | 🟠 Haute | server.ts + route-handler.ts | `maxAge` hardcodé → supprimer | 5 min |
| 2 | 🟠 Haute | Tous | Valider CSP contre XSS (httpOnly: false) | 30 min |
| 3 | 🟡 Moyenne | client.ts, server.ts | Non-null `!` → validation explicite | 10 min |
| 4 | 🟡 Basse | route-handler.ts | Sync → async pour cohérence | 10 min |

---

## Partie 3 — Performance : `src/components/ExerciseList.tsx`

### ⚠️ Fichier introuvable

Le fichier `src/components/ExerciseList.tsx` **n'existe pas** dans la codebase. La recherche a également vérifié :
- `src/components/Exercise*.tsx` → 0 résultat
- `src/**/*ExerciseList*` → 0 résultat

Les composants exercices réels sont dans :
```
src/components/exercises/
├── ExerciseDefaultMetricsForm.tsx
├── ExerciseWizard/
│   ├── components/
│   │   ├── FeedbackButtons.tsx
│   │   ├── FinalSummaryModal.tsx
│   │   ├── ProgressIndicator.tsx
│   │   └── SuggestionCard.tsx
│   └── steps/
│       ├── CustomForm.tsx
│       ├── PerformanceInput.tsx
│       ├── SuggestionsList.tsx
│       └── TypeSelection.tsx
```

**Action requise** : Préciser le bon chemin pour lancer l'analyse performance. Candidats probables :
- `src/components/exercises/ExerciseWizard/steps/SuggestionsList.tsx`
- La page `src/app/exercises/page.tsx`

---

## Plan d'action global

### Sprint 1 — Corrections rapides (< 1h total)

```bash
# 1. Remplacer les dark: hardcodés dans admin/page.tsx
# Recherche systématique
grep -n "dark:bg-gray" src/app/admin/page.tsx

# 2. Supprimer maxAge hardcodé dans server.ts et route-handler.ts

# 3. Déplacer quickActions hors du composant

# 4. Corriger setLoading(false) prématuré
```

### Sprint 2 — Refactoring (2-4h)

```bash
# 1. Créer /api/admin/tickets pour harmoniser avec /api/admin/stats
# 2. Implémenter interface SupportTicket
# 3. Refactoring loadDashboardData avec useRef pour throttling
# 4. Créer src/lib/logger.ts
```

### Sprint 3 — Sécurité (1-2h)

```bash
# 1. Vérifier/renforcer CSP dans next.config.ts
# 2. Ajouter validation env vars au démarrage
# 3. Aligner route-handler.ts sur pattern async
```

### Commandes de vérification post-corrections

```bash
# TypeScript — vérifier aucune régression
npm run typecheck

# ESLint — vérifier les règles
npm run lint

# Build complet
npm run build

# Audit sécurité Supabase (via MCP ou dashboard)
# Vérifier Supabase Dashboard → Security Advisor
```

---

## Slash Commands recommandées pour les corrections

| Tâche | Commande Claude Code |
|-------|---------------------|
| Corriger dark mode admin/page.tsx | `/fix-dark-mode` sur `src/app/admin/page.tsx` |
| Revue complète après corrections | `/code-review` sur `src/app/admin/page.tsx` |
| Créer `/api/admin/tickets` | `/new-component` route API admin tickets |
| Audit sécurité global | `/orchestrate` "Audite toute la sécurité Supabase" |

---

*Rapport généré le 17 mars 2026 — IronTrack v15.3.5*
