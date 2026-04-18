# IronTrack — Inventaire exhaustif (2026-04-18)

> Snapshot de l'état réel du codebase pour alimenter la refonte design via
> Claude Design. Source de vérité = `src/` + `supabase/migrations/` + `package.json`.
> Les docs `CLAUDE.md`, `CHANGELOG.md`, `docs/stack-and-cli.md` sont utilisées en
> contexte mais **toutes les divergences observées sont signalées**.

---

## 0. Métadonnées du snapshot

- **Branche** : `docs/irontrack-inventory` (basée sur `main` post-PR #49)
- **Dernier commit main** : `e696d68` (governance refactor)
- **Stack réelle (package.json)** — ⚠️ diverge de `docs/stack-and-cli.md` :
  - Next.js **^16.0.0** (doc dit « 15.5.12 »)
  - React **^19.0.0** (doc dit « 18.3.1 »)
  - Tailwind **^4.1.11** ✅
  - Supabase SSR `^0.9.0`, JS `^2.100.1` ✅
  - TypeScript `^5.9.3`, Node `>=20.0.0`
  - **Pas de `framer-motion` dans les deps** (doc dit « activé »)
  - **Pas de config PWA / service worker** visible malgré `manifest.webmanifest`
  - `next-intl ^4.9.1` (i18n FR/NL/EN) — présent et utilisé

---

## 1. Routes et pages

Tout passe par `src/app/[locale]/…` sauf routes techniques. Locales : `fr`, `nl`, `en`.

| Chemin (sans locale) | page | layout | loading | error | Rendering | Accès | État |
|---|---|---|---|---|---|---|---|
| `/[locale]` (landing) | ✅ | ✅ (root) | ❌ | ✅ `error.tsx` | Server | public | ✅ fonctionnel |
| `/[locale]/login` | ✅ | hérite | ❌ | hérite | Server + Client form | public | ✅ fonctionnel |
| `/[locale]/dashboard` | ✅ | hérite | ❌ | hérite | Server | auth requis (`requireUser`) | ✅ fonctionnel |
| `/[locale]/exercises` | ✅ | hérite | ❌ | hérite | Server | auth requis | ✅ fonctionnel (filtres URL) |
| `/[locale]/history` | ✅ | hérite | ❌ | hérite | Server | auth requis | ✅ fonctionnel (paginé cursor) |
| `/[locale]/workouts/[id]` | ✅ | hérite | ❌ | hérite | Server | auth requis + RLS | ✅ fonctionnel (lecture seule) |
| `/[locale]/profile` | ✅ | hérite | ❌ | hérite | Server + Client form | auth requis | ✅ fonctionnel |
| `/[locale]/legal/privacy` | ✅ | ✅ `legal/layout` | ❌ | hérite | Server | public | ✅ fonctionnel ❓ (non lu en détail) |
| `/[locale]/legal/terms` | ✅ | ✅ `legal/layout` | ❌ | hérite | Server | public | ✅ fonctionnel ❓ |
| `/[locale]/auth/error` | ✅ | hérite | ❌ | hérite | Server | public | ✅ fonctionnel ❓ |
| `/[locale]/[...rest]` | ✅ | hérite | ❌ | hérite | Server | public | ✅ catch-all → `not-found.tsx` localisé |
| `/auth/callback` | route handler `route.ts` | — | — | — | Server (OAuth) | public | ✅ fonctionnel |

Pages techniques supplémentaires (hors `[locale]`) :
- `src/app/global-error.tsx` — fallback global
- `src/app/not-found.tsx` — 404 non-localisé
- `src/app/robots.ts` — SEO
- `src/app/sitemap.ts` — SEO
- `src/app/[locale]/not-found.tsx` — 404 localisé
- `src/app/[locale]/error.tsx` — erreur localisée
- `src/app/[locale]/actions.ts` — server action `signOut`

**Routes absentes alors que référencées ailleurs :**
- ❌ `/admin/*` — aucune page admin sur filesystem (mais CHANGELOG prétend une structure complète)
- ❌ `/settings`, `/account` — pas de page dédiée préférences
- ❌ `/nutrition`, `/meals` — pas d'UI malgré schéma DB complet
- ❌ `/workouts` (liste, hors détail `[id]`) — pas de page index, `/history` fait office
- ❌ `/workouts/new`, `/workouts/[id]/edit` — pas de création/édition

**Total routes inventoriées** : **12 pages applicatives + 5 fichiers techniques = 17 fichiers routing**.

---

## 2. Features par domaine

### 2.1 Auth
**Fonctionnel :**
- Signup / signin email+password (`src/app/[locale]/login/actions.ts`)
- OAuth Google via `signInWithGoogle` (Supabase Auth)
- Signout (server action `src/app/[locale]/actions.ts`)
- Middleware Supabase session refresh (`src/lib/supabase/middleware.ts`)
- Rate-limit sur login (`src/lib/rate-limit.ts`)
- Guard serveur `requireUser(locale)` utilisé dans chaque page protégée

**Partiel / Absent :**
- ❌ Reset password (aucun flow visible)
- ❌ Magic link / OTP
- ❌ Email verification UI (table `email_change_requests` en DB mais pas d'UI)
- ❌ MFA / 2FA

**Flux utilisateur (signup/signin) :**
1. Landing `/[locale]` → CTA "Créer mon compte" → `/[locale]/login`
2. Choix Google OAuth ou email+password (toggle signin/signup)
3. Succès → redirect `/[locale]/dashboard` (via `onAuthStateChange`)

### 2.2 Dashboard
**Fonctionnel :**
- Stats streak (`workout_streaks.streak`, `max_streak`)
- Compteur 7 jours (séances terminées)
- 5 dernières séances (liste)
- Dernière performance (metric pertinent selon type)
- Onboarding inline si `profile.pseudo` ET `profile.full_name` absents
- Empty state si 0 data

**Absent :**
- ❌ Graphiques de progression (mentionnés dans landing "02 · PROGRESSION" mais **pas de code**)
- ❌ Volume hebdo, fréquence par groupe musculaire (promesse landing non tenue)
- ❌ Records personnels (RPC `get_personal_records` en DB, non appelée)
- ❌ 1RM estimé (promesse landing non tenue)

### 2.3 Exercises (bibliothèque)
**Fonctionnel :**
- Liste filtrable par type (`all`/`strength`/`cardio`), muscle group, ownership (mine/public), recherche texte
- Full SSR, filtres passés via URL (`?type=…&muscle=…&q=…`)
- RLS + `.or('user_id.eq.X,is_public.eq.true')` — user voit les siens + publics
- Parsing défensif Zod (`exerciseTypeSchema`, `exerciseOwnershipSchema`)
- Badges "MINE", affichage muscle/type/équipement/difficulté

**Absent :**
- ❌ Création d'exercice (UI) — `ExerciseWizard` mentionné dans CHANGELOG mais fichier absent
- ❌ Édition d'exercice — `ExerciseEditForm` mentionné dans CHANGELOG mais absent
- ❌ Page détail / modal — uniquement list view
- ❌ Suggestions IA (mention CHANGELOG OpenAI, aucun code frontend)
- ❌ Favoris / épingler

**Flux utilisateur :**
1. `/[locale]/dashboard` → lien "Exercices" → `/[locale]/exercises`
2. Filtres par pilules (type/ownership/muscle) + search → URL mise à jour
3. Click sur carte exercice → **pas d'action actuellement** (pas de href)

### 2.4 Performance / Workouts
**Fonctionnel :**
- Détail d'une séance `/[locale]/workouts/[id]` (lecture seule)
- Grouping des `performance_logs` par exercice
- Rendu métriques cardio avancées (watts, SPM, RPM, incline, HR, RPE)
- Parsing strict de `id` (rejette `NaN`, flottants)

**Absent :**
- ❌ Création de séance (pas d'`/workouts/new`)
- ❌ Édition en cours (mode live mentionné dans landing, absent du code)
- ❌ Timer de repos (promesse landing, absent)
- ❌ Suppression / archivage
- ❌ `PerformanceEditForm` (mentionné CHANGELOG, fichier absent)

### 2.5 History
**Fonctionnel :**
- Liste paginée par cursor (end_time desc)
- Filtres période (`7d`/`30d`/`90d`/`all`) + type (strength/cardio/all)
- Parsing Zod + fallback safe
- Empty state + "Charger plus"

**Absent :**
- ❌ Filtres par muscle / équipement
- ❌ Export CSV/JSON (mention CHANGELOG "Prochaines améliorations")

### 2.6 Profile
**Fonctionnel :**
- Édition pseudo (3-30 chars, regex `[a-z0-9_]{3,30}`)
- Édition full_name (max 50 chars)
- Upload avatar (`avatar-uploader.tsx`) → Supabase Storage bucket `AVATAR_BUCKET`
- Validation MIME type + taille (`isAvatarMimeType`, `AVATAR_MAX_BYTES`)
- Rate-limit sur `updateProfile` (10/min par IP)
- Affichage initiales fallback si pas d'avatar
- Détection onboarding via `needsProfileOnboarding()`

**Absent :**
- ❌ Édition email (table `email_change_requests` en DB, pas d'UI)
- ❌ Changement de mot de passe
- ❌ Préférences (théme, langue → via `<LangSwitcher>` uniquement, pas dans `/profile`)
- ❌ Suppression de compte (RGPD — droit à l'oubli)
- ❌ Export données personnelles (RGPD)

### 2.7 Admin — **TOTALEMENT ABSENT du code frontend**
Malgré la structure annoncée dans CHANGELOG (2025-01-21) :
```
src/app/admin/layout.tsx | page.tsx | tickets/[id]/page.tsx | users/page.tsx | logs/page.tsx | exports/page.tsx
```
→ **aucune route `src/app/admin/*` n'existe aujourd'hui**. Voir §3.

### 2.8 Nutrition / Meals — **ABSENT du code frontend**
Tables DB présentes (`meals`, `nutrition_logs`, `nutrition_goals`, `saved_recipes`, `saved_recipe_ingredients`, vue `recipe_with_ingredients`) mais aucune page ni composant. Landing promeut pourtant le scan code-barres Colruyt/Delhaize/Carrefour (section "03 · NUTRITION BE").

### 2.9 Partners / Training Goals / Badges / Achievements — **ABSENT du code frontend**
Tables DB présentes (`training_partners`, `partner_sharing_settings`, `training_goals`, `badges`, `user_badges`, `achievements`, vue `user_badges_view`) mais aucune UI.

### 2.10 Support tickets — **ABSENT du code frontend**
Tables DB + nombreuses RPC admin (`get_admin_tickets_with_users`, `get_ticket_with_responses`, `get_admin_ticket_with_user`, `get_ticket_responses_with_users`) mais aucune UI publique ni admin.

### 2.11 Landing publique
**Fonctionnel :**
- Hero éditorial (Fraunces serif, accent orange italic, swash acid sous "vis")
- Sections : Features (4 cards avec icônes Lucide + accents couleur), How (3 étapes), VS (tableau comparatif Hevy/Strava/Whoop), Manifesto (section noire)
- Switcher langue FR/NL/EN
- JSON-LD `SoftwareApplication` pour SEO/GEO
- Grain overlay SVG

---

## 3. Panel admin (focus spécifique)

### 3.1 État filesystem
**Aucune route `src/app/admin/*` n'existe.** La structure annoncée dans CHANGELOG 2025-01-21 a été **supprimée** ou n'a jamais été migrée dans la v2.

### 3.2 État backend Supabase (persistant)
Tables admin **toujours présentes** (voir `src/lib/supabase/types.ts`) :
- `admin_activity_logs`
- `admin_log_throttle`
- `admin_logs`
- `support_tickets`, `ticket_responses`, `ticket_votes`
- `user_roles` (admin role)
- Enum `support_ticket_category`, `support_ticket_priority`, `support_ticket_status`

RPC functions admin encore exposées :
- `check_is_admin`, `is_admin`, `is_user_admin`, `is_moderator_or_admin`, `check_user_admin_role`
- `admin_change_user_role`, `update_user_role_admin`, `sync_user_role_change`
- `ban_user_admin`, `delete_user_admin`
- `get_admin_activity`, `get_admin_activity_recent`, `get_admin_dashboard_stats`
- `get_all_users_admin`, `get_user_stats_admin`
- `get_admin_ticket_with_user`, `get_admin_tickets_simple`, `get_admin_tickets_with_users`
- `get_ticket_responses_with_users`, `get_ticket_with_responses`
- `log_admin_action_throttled`
- `test_admin_functions`

### 3.3 Tests e2e encore présents
`tests/e2e/admin-final-test.spec.ts`, `admin-ticket-detail.spec.ts`, `admin-with-auth.spec.ts` — ces tests ciblent des routes admin **qui n'existent plus**. Probablement cassés ou skippés. ❓

### 3.4 Permissions (middleware)
Le middleware `src/middleware.ts` **n'a aucun guard admin** — il n'y a pas de routes admin à protéger côté frontend. RLS Supabase et les RPC avec `check_is_admin` restent les seules barrières.

### 3.5 Composants admin
**Aucun** composant admin (table admin, filtres admin, export CSV, etc.) dans `src/components/`.

---

## 4. Profil utilisateur (focus spécifique)

### 4.1 Route
- `/[locale]/profile` (`src/app/[locale]/profile/page.tsx`)

### 4.2 Table `profiles` — colonnes utilisées vs disponibles
**Utilisées dans l'UI actuelle :**
- `id`, `email` (affichage)
- `pseudo` (édité)
- `full_name` (édité)
- `avatar_url` (upload)

**Disponibles mais non exposées dans l'UI v2 :**
- `age`, `availability`, `ban_reason`, `banned_until`, `experience`, `frequency`, `gender`, `goal`, `height`, `initial_weight`, `is_banned`, `is_onboarding_complete`, `last_active`, `location`, `onboarding_completed`, `phone`, `role`, `weight`
- `locale` — ajoutée par migration `20260417120457` (référencée dans `src/lib/profile/index.ts` mais **absente du filesystem** des migrations : gap possible entre prod et local)

### 4.3 UI édition
- ✅ Formulaire shadcn (`<Input>`, `<Label>`, `<Button>`) dans `profile-form.tsx`
- ✅ Upload avatar dans `avatar-uploader.tsx` (Client component, optimistic UI, cache-buster)
- ✅ Zod validation côté serveur (`profileFormSchema`)
- ✅ Rate-limit 10/min/IP

### 4.4 Préférences utilisateur
Table `user_settings` existe (theme, language, notifications, reminders, ironbuddy_level) — **aucun code frontend ne la lit ni l'édite**. Préférences invisibles pour l'user.

### 4.5 Unités métriques / format
- Pas de préférence stockée — tout est dur-codé en métrique (kg, m, km, bpm, RPM, SPM, W, RPE, °C implicite)
- `distance_unit` existe sur `performance_logs` (`km`/`m`/`miles`) mais aucune UI de choix

---

## 5. Composants `src/components/`

Arborescence plate, très légère :

```
src/components/
├── avatar.tsx              (93 lignes, déjà custom, pas shadcn)
├── icons/google.tsx        (SVG Google OAuth)
├── lang-switcher.tsx       (client comp FR/NL/EN)
├── scroll-to-top.tsx       (client comp bouton retour)
└── ui/                     (shadcn new-york — 10 primitives)
    ├── badge.tsx
    ├── button.tsx          (cva 7 variants + 4 sizes, tokens oklch)
    ├── card.tsx
    ├── dialog.tsx
    ├── dropdown-menu.tsx
    ├── form.tsx
    ├── input.tsx
    ├── label.tsx
    ├── tabs.tsx
    └── tooltip.tsx
```

### 5.1 Avatar (`avatar.tsx`)
- **Utilisé dans** : `dashboard/page.tsx`, `_home/hero.tsx`, `profile/avatar-uploader.tsx`
- **Props** : `src`, `displayName`, `size` (`sm`|`md`|`lg`|`xl`), `className?`, `decorative?`
- **Règles d'or** : ✅ tokens (`--color-foreground`, `--color-muted`), ❌ utilise `<img>` et pas `next/image` (comment dans le fichier justifie), ❓ touch target non applicable (non interactif seul)

### 5.2 `ui/button.tsx`
- **Utilisé dans** : `profile-form.tsx`, `avatar-uploader.tsx`, `login-form.tsx` **uniquement**
- **Variants** : default (orange brand), secondary, ghost, outline, destructive, **acid** (accent vert lime), link
- **Sizes** : default (h-11/44px), sm (h-9/36px ⚠️ < 44px WCAG), lg (h-12/48px ⚠️ < 56px règle #6), icon
- **Règles d'or** : ✅ tokens oklch, ✅ focus ring, ❌ taille `lg=48px` vs règle d'or "56px actions critiques" (désalignement à signaler)

### 5.3 Constat shadcn vs brutalism
Seulement **3 fichiers** importent `@/components/ui/button` :
- `profile-form.tsx`, `avatar-uploader.tsx`, `login-form.tsx` (tous 3 client forms)

Les **pages serveur** (`dashboard`, `exercises`, `history`, `workouts/[id]`, `_home/hero`, etc.) utilisent toutes des `<button>` et `<Link>` HTML custom avec classes Tailwind brutalistes (`border-2 border-foreground`, `font-mono`, `tracking-widest`) **sans passer par `<Button>` shadcn**.

→ **Contradiction directe avec la règle d'or #4** de CLAUDE.md ("Button shadcn toujours"). Voir §8.

### 5.4 Composants feature
**Aucun** composant spécifique (`ExerciseCard`, `WorkoutCard`, `PerformanceRow`, etc.) — tout est inline dans les pages. Risque de duplication et de dépassement du seuil 200 lignes.

### 5.5 Tailles de fichiers clés
- `src/app/[locale]/exercises/page.tsx` : **346 lignes** ⚠️ (règle #8 : < 200)
- `src/app/[locale]/dashboard/page.tsx` : **326 lignes** ⚠️
- `src/app/[locale]/workouts/[id]/page.tsx` : **273 lignes** ⚠️
- `src/app/[locale]/history/page.tsx` : **268 lignes** ⚠️
- `src/lib/dashboard/index.ts` : 157 lignes ✅
- `src/lib/workouts/index.ts` : 143 lignes ✅

---

## 6. Base de données

### 6.1 Schéma observé (via `src/lib/supabase/types.ts`, auto-généré 2026-04-15)

**Tables actives (utilisées par le frontend actuel) :**
| Table | Usage frontend | RLS | Notes |
|---|---|---|---|
| `profiles` | ✅ lecture/écriture | ✅ | ~25 colonnes, 5 seulement utilisées |
| `workouts` | ✅ lecture | ✅ | joint avec `performance_logs` |
| `performance_logs` | ✅ lecture | ✅ | métriques cardio avancées présentes |
| `exercises` | ✅ lecture (+ `is_public`) | ✅ | user exercises + catalogue public |
| `equipment` | ✅ lecture (joint) | ✅ | seed : Machine (id=1), Rameur, Tapis, Vélo |
| `workout_streaks` | ✅ lecture | ✅ | singleton par user |

**Tables zombies (aucune utilisation frontend) :**
| Table | Domaine | Commentaire |
|---|---|---|
| `achievements` | gamification | — |
| `admin_activity_logs` | admin | orpheline post-suppression admin |
| `admin_log_throttle` | admin | — |
| `admin_logs` | admin | — |
| `badges`, `user_badges`, vue `user_badges_view` | gamification | — |
| `email_change_requests` | auth avancée | pas de flow UI |
| `exercise_templates` | catalogue | migration 2025-08 créé système templates non exploité |
| `meals` | nutrition | — |
| `muscle_groups` | catalogue | référencée mais pas de UI dédiée |
| `nutrition_goals` | nutrition | — |
| `nutrition_logs` | nutrition | scan code-barres absent |
| `partner_sharing_settings` | partners | — |
| `saved_recipe_ingredients`, `saved_recipes`, vue `recipe_with_ingredients` | nutrition | — |
| `suggestion_feedback` | IA | — |
| `support_tickets`, `ticket_responses`, `ticket_votes` | support | — |
| `training_goals`, vue `training_goals_view` | objectifs | — |
| `training_partners` | partners | — |
| `user_roles` | admin | role admin encore en base |
| `user_settings` | préférences | theme/language/reminders pas d'UI |
| `user_sounds` | personnalisation | vestige fonctionnalité audio |
| `workout_exercises` | templates | alternative à `performance_logs`, peu claire ❓ |

**Vues :**
- `recipe_with_ingredients`, `training_goals_view`, `user_badges_view` — non utilisées
- `security_monitor` — vue audit sécurité (DBA uniquement)

### 6.2 RPC / Functions
~40 fonctions PL/pgSQL, dont :
- Admin (~15) : `check_is_admin`, `is_admin`, `ban_user_admin`, `get_admin_*`, `admin_change_user_role`, etc. → **aucune** appelée par le frontend actuel
- Exercise (~5) : `create_exercise_from_template`, `search_exercises_and_templates` → non appelées
- Badges (~1) : `check_and_award_badges` → non appelée
- Stats (~2) : `get_personal_records`, `get_progression_stats` → non appelées
- Security (~4) : `security_audit`, `check_function_security`, `refresh_postgrest_schema_cache` → DBA
- Tickets (~4) : non appelées

### 6.3 RLS
Les types TS ne renseignent pas les policies (normal). À vérifier au cas par cas via Supabase dashboard. Convention projet : **RLS activé sur 100% des tables** (CLAUDE.md règle absolue). Audit sécurité 2025-01-20 mentionne résolution des pbs `SECURITY DEFINER` et `SEARCH_PATH MUTABLE`.

### 6.4 Migrations filesystem (`supabase/migrations/`)
**72 migrations** datées du `2025-07-23` au `2025-08-17`. Pas une seule migration 2025-09/10/11/12 ni **aucune migration 2026**.

Le code Next.js (`src/lib/profile/index.ts` ligne 13) mentionne pourtant une migration `20260417120457` ajoutant une colonne `locale` à `profiles`. **Gap filesystem** : la migration 2026 n'est pas committée localement. ❓

---

## 7. État DA actuel (audit design)

### 7.1 Fonts
- **Layout** `src/app/[locale]/layout.tsx` charge : **Fraunces** (display serif, axes `opsz` + `SOFT`), **Manrope** (sans), **JetBrains Mono** (mono) via `next/font/google`
- **Tokens CSS** `src/app/globals.css` : `--font-display`, `--font-sans`, `--font-mono` pointent correctement
- **Inter** : ❌ aucune occurrence — propre ✅

### 7.2 Tokens CSS respectés
Grep des hardcodes de couleur sur `src/**` :
- `bg-[#...]` : **0 occurrence** ✅
- `text-[#...]` : **0 occurrence** ✅
- `border-[#...]` : **0 occurrence** ✅
- `bg-[oklch(...)]` : **1 occurrence** (`login/page.tsx` ligne 58, accent éditorial décoratif) — non bloquant, justifié

Tous les autres styles utilisent soit :
- Classes Tailwind token (`bg-background`, `text-foreground`, `bg-muted`, `border-border`, `text-muted-foreground`, `bg-foreground`, `text-background`, `text-destructive`)
- `style={{ color: 'var(--color-…)' }}` inline — moins idiomatique mais respecte tokens

### 7.3 Dark mode
- Système `class="dark"` via `@custom-variant dark (&:is(.dark *))` dans `globals.css`
- Surcharges propres dans `.dark { --color-background: var(--color-obsidian); … }`
- **Aucun `dark:bg-gray-800` / `dark:text-gray-400` hardcodé** (grep négatif) ✅
- Palette dark pensée : `--color-obsidian` (`#0A0A0A`), `--color-chalk`, `--color-rule-dark`
- ⚠️ Attention : aucun toggle dark mode visible dans l'UI (pas de `<ThemeToggle>`). Le mode dark dépend uniquement du `prefers-color-scheme` via `themeColor` viewport meta. ❓ volontaire ?

### 7.4 Responsive
- **Mobile-first** : toutes les pages auditées utilisent `grid gap-N`, puis `sm:`, `md:`, `lg:` pour les tailles supérieures
- Touch targets : `min-h-11` (44px) et `min-h-[44px]` systématiques, `min-h-[48px]` pour forms critiques (login/profile). ⚠️ **aucune utilisation de 56px** (règle d'or #6) malgré la règle

### 7.5 Animations
- `framer-motion` : **non présent dans `package.json`** ❌ (contrairement à `docs/stack-and-cli.md`)
- Animations natives CSS : keyframe `rise` (opacity + translateY 20px) dans `globals.css`, classe `.rise` utilisée dans home (hero, features)
- Transitions Tailwind (`transition`, `transition-all`, `transition-transform`, `duration-200`) avec custom easing `var(--ease-standard)` et `var(--ease-out)`
- Hover micro-interactions : `hover:-translate-y-[1px]`, `hover:shadow-glow`, `group-hover:translate-x-0.5`

### 7.6 Style éditorial brutaliste
Signatures visibles partout :
- `border-2 border-foreground` (pas de radius sur la plupart des sections)
- `font-mono text-xs uppercase tracking-widest` pour eyebrows et labels
- `font-display text-4xl/5xl/6xl leading-[1.05] tracking-tight` pour titres
- Grain overlay global (`.grain::before` SVG noise 5% opacity)
- Gradients radiaux décoratifs (orange + acid) en background fixed
- Accent `var(--color-acid)` (vert lime `#D4FF3A`) pour surlignages et CTAs secondaires (validés comme token dans `theme.css`)

### 7.7 Iconographie
`lucide-react 0.469.0` — utilisé dans `_home/features.tsx` (`Activity`, `BarChart3`, `Apple`, `Sparkles`). Peu d'icônes ailleurs.

---

## 8. Dette et gaps connus

### 8.1 Metrics CHANGELOG vs réalité mesurée

| Item CHANGELOG (2026-04) | Réclamé | Mesuré | État réel |
|---|---|---|---|
| `console.log` en production | 121 | **0 `console.log`** (16 `console.error` légitimes en error handlers serveur) | ✅ **résolu** — CHANGELOG obsolète |
| `any` occurrences | 36 | **0** (`: any`, `as any`, `<any>`) | ✅ **résolu** — CHANGELOG obsolète |
| `bg-[#…]` hardcodés | 15 | **0** | ✅ **résolu** — CHANGELOG obsolète |

→ **Ces 3 items doivent être retirés de la section "Prochaines améliorations" du CHANGELOG**.

### 8.2 Features "Prochaines améliorations" — état
| Item | État |
|---|---|
| Graphiques de progression cardio | ❌ non commencé |
| Export données de performance | ❌ non commencé |
| Programmes d'entraînement personnalisés | ❌ non commencé |
| Notifications rappel entraînement | ❌ non commencé (colonne `workout_reminders` dans `user_settings` non exploitée) |

### 8.3 Contradictions règles d'or ↔ implémentation
1. **Règle #4** « Button shadcn toujours » → violée dans ~9 pages server component (dashboard, exercises, history, workouts/[id], profile header, _home/*). Volontaire (style brutaliste) ? à trancher.
2. **Règle #6** « 56px pour actions critiques » → aucune occurrence `min-h-[56px]` dans `src/`, shadcn Button `lg` = 48px max. Désalignement systémique.
3. **Règle #8** « Composant < 200 lignes » → 4 pages au-dessus du seuil (326, 346, 273, 268 lignes). À découper.

### 8.4 Divergences doc vs code
1. `docs/stack-and-cli.md` dit « Next 15.5.12 » → **réalité Next ^16.0.0** (PR #49 à corriger)
2. `docs/stack-and-cli.md` dit « React 18.3.1 » → **réalité React ^19.0.0**
3. `docs/stack-and-cli.md` dit « Framer Motion activé » → **absent de `package.json`**
4. `docs/stack-and-cli.md` dit « PWA manifest + service worker » → manifest OK, **service worker non présent** (ou non-trouvé dans `src/`)
5. `docs/stack-and-cli.md` dit « shadcn new-york » → confirmé (`components/ui/*` oui)
6. `CHANGELOG.md` structure admin → **code supprimé mais tests e2e et tables DB persistent**

### 8.5 Vestiges / zones à nettoyer
- **Tests e2e admin obsolètes** : `admin-final-test.spec.ts`, `admin-ticket-detail.spec.ts`, `admin-with-auth.spec.ts` — ciblent des routes absentes. À supprimer ou à restaurer l'admin.
- **25 tables DB zombies** (nutrition, partners, badges, tickets, admin_logs, etc.) — décision produit à prendre : conserver pour v3 ? drop via migration ? Aucun code ne les lit.
- **~40 RPC functions non appelées** : coût de maintenance, surface d'attaque, dette de sécurité.
- **Migration `20260417120457` (profiles.locale)** référencée dans le code mais absente du filesystem → désync env local vs prod.
- **Cadre « legacy v1 » mentionné dans `profile/index.ts`** : 25 colonnes profiles dont 20 non utilisées. Nettoyage DB envisageable.
- **`scroll-to-top.tsx`** : vérifié utilisé (hero page), OK.

### 8.6 Promesses landing non tenues (communication ↔ produit)
- "Musculation détaillée" ✅
- "Cardio (rameur, vélo, course)" ✅ (logs, pas de mode live)
- **"Nutrition + scan code-barres"** ❌ non implémenté
- **"Produits belges natifs"** ❌ non implémenté
- **"Coach IA"** ❌ non implémenté
- "Sans pub" ✅
- "Code ouvert" ❓ (repo privé)

Tableau comparatif landing `Pourquoi pas Hevy, Strava, Whoop ?` affiche 5/6 ✅ côté IronTrack alors que la réalité est 2/6.

---

## 📊 Synthèse

### Chiffres-clés
- **Routes applicatives inventoriées** : 12 pages (fr/nl/en × 12 = 36 URL publiques)
- **Features fonctionnelles** : 11 (auth, signup/signin Google+email, signout, dashboard stats, exercises listing/filter/search, history paginé filtré, workout detail lecture seule, profile édition, avatar upload, locale switch, landing SSR SEO)
- **Features partielles** : 2 (dashboard sans graphiques promis, exercises sans CRUD)
- **Features absentes mais promises (CHANGELOG/landing)** : 14+ (admin complet, nutrition, scan code-barres, coach IA, graphiques progression, PRs, partners, badges, tickets support, reset password, change email, unités préférences, notifications, programmes)
- **Tables DB utilisées par le frontend** : 6 / ~31 (19 %)
- **RPC functions appelées par le frontend** : 0 / ~40 (0 %) — tout passe par queries Supabase standard avec RLS
- **Composants shadcn réellement utilisés** : 3 primitives (`Button`, `Input`, `Label`) dans 3 fichiers — reste du codebase = HTML brutaliste inline
- **Tests e2e** : 11 fichiers, dont 3 cassés (admin) et ~3 suspects (menu mobile debug, audit-vitrine-pro)

### Top 3 surprises
1. 🎉 **Bonne surprise — dette tech CHANGELOG complètement obsolète** : 0 `console.log`, 0 `any`, 0 `bg-[#...]` au lieu des 121+36+15 annoncés. Le codebase est bien plus propre que le CHANGELOG ne le laisse croire. La Phase 2b est **quasi vide**, il ne reste qu'à mettre à jour le CHANGELOG.
2. 😱 **Mauvaise surprise — gap doc ↔ package.json** : `docs/stack-and-cli.md` (tout juste committé via PR #49) affirme Next 15.5.12 + React 18.3.1, alors que `package.json` pin Next ^16 + React ^19. Même `framer-motion` est annoncé dans la doc mais pas dans les deps.
3. 🧟 **Mauvaise surprise — énorme fossé DB/frontend** : ~25 tables + ~40 RPC fonctions admin/nutrition/partners/badges/tickets dorment dans Supabase sans aucun consommateur frontend. Les tests e2e admin ciblent des routes supprimées. La dette n'est pas dans le code visible, elle est dans l'infrastructure persistante derrière.

### Estimation effort cleanup gaps critiques

| Chantier | Effort | Priorité |
|---|---|---|
| **Corriger `docs/stack-and-cli.md` (versions Next 16, React 19, retirer framer-motion, statut PWA réel)** | 15 min | 🔴 immédiat |
| **Nettoyer `CHANGELOG.md` section "Prochaines améliorations"** (retirer les 3 items dette résolus) | 10 min | 🔴 immédiat |
| **Supprimer ou restaurer tests e2e admin** (3 fichiers) | 20 min | 🟡 next PR |
| **Décider du sort des 25 tables DB zombies** (drop migration vs roadmap v3) | 2 h cadrage + N migrations | 🟡 décision produit |
| **Décider position landing vs réalité** (nutrition/coach IA : retirer des claims ou livrer) | décision produit | 🟡 |
| **Aligner règle d'or #4 et #6 avec le style brutaliste réel** (Button shadcn ↔ `<button>` custom ; 56px critique ↔ 48px) | 30 min discussion | 🟡 décision design |
| **Découper 4 pages > 200 lignes** (dashboard, exercises, history, workouts/[id]) | 3-4 h total | 🟢 refacto |
| **Retrouver et committer la migration 2026 `profiles.locale`** | 15 min | 🟢 |

**Total effort cleanup critique minimal** : ~1 h (doc + CHANGELOG + e2e admin). Le reste dépend de décisions produit/design à prendre avec Thierry.

---

## Notes & caveats

- Pages `/legal/privacy`, `/legal/terms`, `/auth/error` non lues en détail — état supposé ✅ basé sur la structure.
- `src/app/[locale]/_home/vs.tsx`, `how.tsx`, `manifesto.tsx`, `features.tsx` partiellement lus — confirmés comme sections de la landing.
- `tests/e2e/*.spec.ts` non lus en entier — statut obsolète déduit des noms et de l'absence des routes ciblées.
- Policies RLS précises non vérifiées (nécessiterait `supabase db dump --role-only` ou requêtes sur `pg_policies`).
- Certaines features peuvent exister dans des branches feature non mergées que ce snapshot ne voit pas.

Fin de l'inventaire.
