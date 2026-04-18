# Stack & CLI IronTrack — Référence technique

> Doc de référence matérielle : versions exactes, schéma DB, commandes CLI autonomes. Règles projet → `CLAUDE.md`.
>
> **Synchronisé avec `package.json` le 2026-04-18** (commit `chore/docs-sync-reality`). Toute divergence constatée entre ce document et `package.json` doit être corrigée ici, pas l'inverse.

## 🧱 Stack (versions réelles, source: `package.json`)

| Couche | Techno | Version |
|---|---|---|
| Framework | Next.js | `^16.0.0` (App Router, Turbopack) |
| UI runtime | React | `^19.0.0` (React DOM `^19.0.0`) |
| Langage | TypeScript | `^5.9.3`, strict: true, zéro `any` |
| Styling | Tailwind CSS | `^4.1.11` (CSS-first, `@theme inline`, plugin `@tailwindcss/postcss`) |
| Composants | shadcn/ui | style `new-york` (Radix UI primitives + `class-variance-authority`) |
| Animation | CSS natif | keyframes `@keyframes rise`, transitions Tailwind, custom easing tokens (`--ease-standard`, `--ease-out`). **Pas de `framer-motion`** dans les dépendances. |
| i18n | `next-intl` | `^4.9.1` (FR/NL/EN, routing `localePrefix: 'as-needed'`) |
| Validation | Zod | `^3.25.76` |
| Formulaires | React Hook Form | `^7.72.0` + `@hookform/resolvers` `^5.2.1` |
| Icônes | Lucide | `lucide-react ^0.469.0` |
| Backend | Supabase | `@supabase/ssr ^0.9.0` + `@supabase/supabase-js ^2.100.1` (Auth + PostgreSQL + Storage + RLS) |
| Déploiement | Vercel | auto-deploy depuis `main` |
| Format | PWA | manifest `public/manifest.webmanifest` uniquement — **pas de service worker** implémenté à date (offline non supporté) |
| Runtime | Node | `>=20.0.0` (engines) |
| Pays / locale | Belgique FR-BE | système métrique, virgule décimale |

**Fonts officielles** (ne pas dévier) :
- **Titres** : Fraunces (display serif)
- **Corps** : Manrope (sans-serif)
- **Mono / chiffres** : JetBrains Mono

## 🎨 Tokens de couleur (source: `src/app/theme.css`)

Système OKLCH complet dark-first. Orange brand :
- `--primary-500` : #ff6b00 (CTA)
- `--primary-600` : #e55f00 (hover)
- `--primary-700` : #bf5200 (active)

Semantic tokens standards shadcn : `background`, `foreground`, `card`, `border`, `muted`, `accent`, `destructive`, `ring` — tous en oklch, synchronisés `:root` + `@theme inline`.

## 🗄️ Schéma base de données (tables principales)

### `exercises`
Exercices de base — `id`, `name`, `type` (`'Musculation'` | `'Cardio'`), `muscle_group`, `equipment_id`, `difficulty`.

### `performance_logs`
Logs de performance. Champs de base : `reps`, `sets`, `weight_kg`, `duration_sec`, `distance_m`, `notes`.

**Métriques cardio avancées** :
- `stroke_rate` (16-36 SPM — rameur)
- `watts` (50-500W — rameur)
- `heart_rate` (60-200 BPM)
- `incline` (0-15% — tapis)
- `cadence` (50-120 RPM — vélo)
- `resistance` (1-20 — vélo)
- `distance_unit` (`'km'` | `'m'` | `'miles'`)

### `equipment`
Liste équipements : Machine (id=1, défaut), Rameur, Tapis de course, Vélo, etc.

**Métriques par équipement** :
- Rameur → distance (m), temps, SPM, watts, HR
- Course/Tapis → distance (km), temps, vitesse, inclinaison, HR
- Vélo → distance (km), temps, cadence (RPM), résistance, HR

## 🔐 Sécurité DB — rappels critiques

- **RLS activé sur TOUTES les tables** — aucune exception
- **Vues** : toujours `SECURITY INVOKER` (jamais `SECURITY DEFINER`)
- **Fonctions** : `SET search_path = public, pg_temp` (éviter `MUTABLE`)
- **Service role key** : côté serveur uniquement, jamais `NEXT_PUBLIC_*`

## 🛠️ CLI — Configuration autonome

> ⚠️ Credentials dans `.env.local` (jamais committé). Utiliser les variables d'env, jamais en dur.

### Supabase
- **Project ID** : `taspdceblvmpvdjixyit`
- **URL** : `https://taspdceblvmpvdjixyit.supabase.co`
- **Vars env** : `SUPABASE_DB_URL`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`

```bash
# Migrations (workflow obligatoire)
npx supabase migration new nom_descriptif
# → éditer supabase/migrations/[timestamp]_nom.sql
npx supabase db push --db-url "$SUPABASE_DB_URL"
npx supabase migration list --db-url "$SUPABASE_DB_URL"

# Lien projet
npx supabase link --project-ref taspdceblvmpvdjixyit
```

### Vercel
- **Org** : `thierry-vanmeeterens-projects`
- **Project** : `irontrack`
- **Production URL** : `https://iron-track-dusky.vercel.app`
- **Var env** : `VERCEL_TOKEN`

```bash
# Déploiement manuel
npx vercel --token "$VERCEL_TOKEN" deploy --prod

# Variables d'environnement
npx vercel --token "$VERCEL_TOKEN" env add VARIABLE_NAME production
npx vercel --token "$VERCEL_TOKEN" env ls

# Lister les déploiements
npx vercel --token "$VERCEL_TOKEN" ls
```

### GitHub
- **Repo** : `https://github.com/thierryvm/IronTrack.git`
- **Branche principale** : `main` (protégée)

```bash
gh repo view thierryvm/IronTrack
gh pr create --title "titre" --body "description"
gh pr list
gh issue list
```

## 🔌 MCP Servers actifs

Configuration via CLI `claude mcp add/list/remove` (stocké dans `~/.claude.json`).

Serveurs attendus : **Context7**, **Supabase**, **Vercel**, **Figma**, **Playwright** (navigateur local pour tests/scraping), **Google Calendar**, **Gmail**, **Notion**, **Excalidraw**.

```bash
claude mcp list                    # vérifier l'état
claude mcp add <nom> npx <package> # ajouter un serveur
```

## 📜 Scripts npm

```bash
npm run dev          # Lancer en développement (Turbopack, port 3000)
npm run build        # Build de production
npm run start        # Serveur de production (port 3000)
npm run lint         # ESLint (src/**/*.{ts,tsx})
npm run typecheck    # TypeScript --noEmit
npm run format       # Prettier (src/**/*.{ts,tsx,css})
npm run db:types     # Régénérer src/lib/supabase/types.ts
npm run db:push      # supabase db push
npm run db:migration # supabase migration new
```

> ⚠️ **Tests** : `playwright.config.ts` et `jest.config.js` existent dans le repo, mais ni `@playwright/test` ni `vitest`/`jest` ne sont déclarés dans `package.json`. Aucun script `test` n'est exposé. Les fichiers sous `tests/e2e/` ne peuvent pas s'exécuter sans installer Playwright séparément. Cf. inventaire `docs/irontrack-inventory.md` §8.5.

## 🚀 Workflow déploiement standard

1. **Modif DB** → `npx supabase migration new` puis `npx supabase db push`
2. **Commit** → `git commit -m "type(scope): description"` (conventional)
3. **Push** → `git push origin main` (auto-deploy Vercel)
4. **Vérification** → `https://iron-track-dusky.vercel.app` + Vercel dashboard

## 🧠 Mode Thinking Claude Code

Déclencheurs dans le prompt :
- **`think`** — réflexion de base
- **`think harder`** / **`think longer`** — réflexion approfondie
- **`use thinking ultrahardcore`** — problèmes complexes

## 📚 Documentation externe

- Claude Code : https://docs.anthropic.com/en/docs/claude-code/overview
- Supabase : https://supabase.com/docs
- Next.js : https://nextjs.org/docs
- Tailwind v4 : https://tailwindcss.com/docs/v4-beta
- shadcn/ui : https://ui.shadcn.com

## 🪜 Migration notes — Next.js 15 → 16 / React 18 → 19

Le repo a été mis à niveau vers **Next 16 + React 19** (package.json pin `^16.0.0` / `^19.0.0`). Points d'attention pour les agents qui modifient du code :

- **Server Components async** : `params` et `searchParams` sont des `Promise<T>` dans Next 15+ App Router. Toutes les `page.tsx` actuelles font déjà `const { locale } = await params;` — conserver ce pattern.
- **React 19 APIs** : `useActionState` (remplace `useFormState`), `useFormStatus`, `useOptimistic` sont utilisables et déjà exploités (`src/app/[locale]/profile/profile-form.tsx`, `login-form.tsx`).
- **`next/font`** : configuration actuelle (`Fraunces`, `Manrope`, `JetBrains_Mono` via `next/font/google`) reste stable en Next 16.
- **Turbopack** : activé en dev (`--turbo`). Le build prod reste sur webpack par défaut.
- **Métadonnées** : `export const metadata` + `generateMetadata` async supportés normalement.

En cas de doute sur une API dépréciée, vérifier d'abord `package.json` puis la documentation Next.js avant de présumer d'un comportement Next 14/15.
