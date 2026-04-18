# Stack & CLI IronTrack — Référence technique

> Doc de référence matérielle : versions exactes, schéma DB, commandes CLI autonomes. Règles projet → `CLAUDE.md`.

## 🧱 Stack (versions réelles, source: `package.json`)

| Couche | Techno | Version |
|---|---|---|
| Framework | Next.js | 15.5.12 (App Router, Turbopack) |
| UI runtime | React | 18.3.1 |
| Langage | TypeScript | strict: true, zéro `any` |
| Styling | Tailwind CSS | v4 (CSS-first, `@theme inline`) |
| Composants | shadcn/ui | style `new-york` |
| Animation | Framer Motion | activé sur transitions principales |
| Backend | Supabase | Auth + PostgreSQL + Storage + RLS |
| Déploiement | Vercel | auto-deploy depuis `main` |
| Format | PWA | manifest + service worker |
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
npm run dev          # Lancer en développement (Turbopack)
npm run build        # Build de production
npm run lint         # ESLint
npm run typecheck    # TypeScript --noEmit
npm run test         # Vitest
npm run test:coverage # Avec couverture
```

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
