# IronTrack - Notes de développement

## 🤖 Système d'Agents & Commandes Claude Code

### Slash Commands (dans Cursor avec l'addon Claude Code)
| Commande | Description |
|----------|-------------|
| `/design-audit` | Audite design d'un fichier/page (couleurs, dark mode, boutons) |
| `/code-review` | Revue complète du code (TypeScript, hooks, sécurité) |
| `/fix-dark-mode` | Corrige les incohérences dark mode |
| `/new-component` | Crée un composant conforme au design system |
| `/orchestrate` | Agent maître — délègue selon la demande |

### Agents de référence (`agents/`)
| Agent | Fichier | Usage |
|-------|---------|-------|
| Orchestrateur | `agents/orchestrator.md` | Coordination multi-agents |
| UI/UX | `agents/ui-ux.md` | Design system, tokens, composants |
| Code Review | `agents/code-review.md` | Qualité, TypeScript, hooks |
| Architecture | `agents/architecture.md` | Next.js, SOLID, structure |
| Performance | `agents/performance.md` | Core Web Vitals, optimisation |
| Accessibilité | `agents/accessibility.md` | WCAG 2.2 AA |
| Sécurité | `agents/security.md` | Supabase RLS, RGPD |

### Skills rapides (`skills/`)
| Fichier | Contenu |
|---------|---------|
| `skills/DESIGN_RULES.md` | Règles design en référence rapide |
| `skills/COMPONENT_PATTERNS.md` | Templates composants prêts à l'emploi |

## 📌 LES 10 RÈGLES D'OR (TOUJOURS RESPECTER)

1. **🟠 Orange = CTA primaire uniquement** — pas de fond/décoration orange
2. **🎨 Variables CSS = toujours** — `bg-card`, `text-foreground`, `border-border`
3. **🔘 1 seul bouton primary** par vue/section
4. **📦 `<Button>` shadcn toujours** — jamais de `<button>` HTML custom
5. **🌙 Dark mode via variables CSS** — pas de `dark:bg-gray-800` partout
6. **👆 Touch targets ≥ 44px** — tout élément interactif
7. **⚓ Hooks AVANT early returns** — règle absolue React
8. **📏 Composant < 200 lignes** — diviser en sous-composants
9. **🔒 Auth check avant Supabase** — toujours vérifier l'utilisateur
10. **🚫 Pas de console.log** en production

---

## Informations du projet
- **Framework**: Next.js 15.3.5 avec TypeScript
- **Base de données**: Supabase
- **Styling**: Tailwind CSS + Framer Motion
- **MCP Servers**: Configuration via mcp.json pour Supabase et autres services
- **Pays**: Belgique (système métrique adapté)

## Commandes importantes
```bash
npm run dev          # Lancer en développement
npm run build        # Build de production
npm run lint         # Vérifier les erreurs ESLint
npm run typecheck    # Vérifier les erreurs TypeScript
```

## Structure de la base de données

### Table `exercises`
- Exercices de base (nom, type, groupe musculaire, équipement, difficulté)
- Types: 'Musculation' ou 'Cardio'

### Table `performance_logs`
- Données de performance pour chaque exercice
- **Métriques cardio avancées** (ajoutées récemment):
  - `stroke_rate` (16-36 SPM pour rameur)
  - `watts` (50-500W pour rameur)
  - `heart_rate` (60-200 BPM)
  - `incline` (0-15% pour tapis)
  - `cadence` (50-120 RPM pour vélo)
  - `resistance` (1-20 pour vélo)
  - `distance_unit` ('km', 'm', 'miles')

### Table `equipment`
- Liste des équipements disponibles
- Inclut: Rameur, Tapis de course, Vélo, etc.

## Corrections récentes (2025-01-20)

### ✅ Système cardio corrigé
1. **Formulaires de performance**:
   - Ajout de tous les champs cardio avancés
   - Labels adaptés aux utilisateurs belges
   - Sections spécifiques par équipement (rameur, course, vélo)
   - Unités correctes (mètres pour rameur, km pour course)

2. **Navigation corrigée**:
   - Suppression de la page redondante `/exercises/[id]`
   - Correction des boutons "X" et "Retour" (redirection vers `/exercises`)
   - Modal ExerciseDetailsModal comme interface principale

3. **Base de données**:
   - Script SQL exécuté pour ajouter les champs cardio avancés
   - Contraintes adaptées au système belge

### ✅ Système création/modification d'exercices finalisé
1. **Formulaires de modification clarifiés**:
   - **ExerciseEditForm**: Modification des propriétés de l'exercice + affichage des notes de performance (lecture seule)
   - **PerformanceEditForm**: Modification complète des performances avec toutes les métriques cardio avancées
   - Bouton "Modifier l'exercice" ajouté au modal de détails pour clarifier les deux types de modification

2. **Récupération des données corrigée**:
   - Notes proviennent maintenant de la dernière performance (performance_logs.notes)
   - Toutes les métriques cardio avancées récupérées dans le formulaire d'édition de performance
   - Gestion des erreurs 404 corrigée

3. **Modal de confirmation amélioré**:
   - Affichage complet de toutes les métriques (SPM, watts, heart rate, incline, cadence, resistance)
   - Affichage des notes si présentes
   - Résumé visuel avec icônes pour chaque métrique

### 📝 Architecture des formulaires
- **ExerciseEditForm**: Modification des exercices + notes (lecture seule)
- **PerformanceEditForm**: Modification des performances individuelles
- **ExerciseWizard**: Création d'exercices avec assistant intelligent

### 🎯 Métriques par équipement
- **Rameur**: Distance (m), temps, SPM, watts, heart rate
- **Course/Tapis**: Distance (km), temps, vitesse, inclinaison, heart rate
- **Vélo**: Distance (km), temps, cadence (RPM), résistance, heart rate

## Configuration MCP
- **Fichier de config**: `mcp.json` configuré pour Supabase
- **Services disponibles**: Intégration directe avec la base de données via MCP servers
- **Avantages**: Accès optimisé aux données et requêtes simplifiées

## 🔧 Configuration CLI Complète - RÉFÉRENCE AUTONOME

> ⚠️ **SÉCURITÉ** : Les credentials sont dans `.env.local` (jamais committé).
> Utiliser `$SUPABASE_DB_URL`, `$SUPABASE_ACCESS_TOKEN`, `$VERCEL_TOKEN` depuis l'environnement.

### ✅ Supabase CLI
- **Project ID**: `taspdceblvmpvdjixyit`
- **URL**: `https://taspdceblvmpvdjixyit.supabase.co`
- **DB Password**: voir `.env.local` → `SUPABASE_DB_PASSWORD`
- **Access Token**: voir `.env.local` → `SUPABASE_ACCESS_TOKEN`
- **Connection String**: voir `.env.local` → `SUPABASE_DB_URL`

**Commandes essentielles** :
```bash
npx supabase db push --db-url "$SUPABASE_DB_URL"
npx supabase migration new nom_migration
npx supabase link --project-ref taspdceblvmpvdjixyit
```

### ✅ Vercel CLI
- **Token**: voir `.env.local` → `VERCEL_TOKEN`
- **Org**: `thierry-vanmeeterens-projects`
- **Project**: `irontrack`
- **Production URL**: `https://iron-track-dusky.vercel.app`

**Commandes essentielles** :
```bash
npx vercel --token "$VERCEL_TOKEN" deploy --prod
npx vercel --token "$VERCEL_TOKEN" env add VARIABLE_NAME production
npx vercel --token "$VERCEL_TOKEN" ls
```

### ✅ GitHub CLI
- **Repo**: `https://github.com/thierryvm/IronTrack.git`
- **Branch principale**: `main`

**Commandes essentielles** :
```bash
gh repo view thierryvm/IronTrack
gh pr create --title "titre" --body "description"
gh issue list
```

### 🎯 Workflow Claude Code Autonome
1. **Modifications DB** → Utiliser `npx supabase migration new` puis `npx supabase db push`
2. **Déploiement** → Git push (auto-deploy Vercel) OU `npx vercel deploy --prod`
3. **Debug production** → Utiliser les tokens pour accès direct CLI
4. **Variables env** → `npx vercel env add` pour ajouter en production

## 🧠 Mode Thinking Avancé de Claude Code
### Comment l'utiliser :
- **"think"** : Mode de réflexion de base
- **"think harder"** ou **"think longer"** : Réflexion approfondie
- **"use thinking ultrahardcore"** : Mode de réflexion maximum pour problèmes complexes

## 📚 Références Documentation
### Claude Code
- **Documentation officielle** : https://docs.anthropic.com/en/docs/claude-code/overview

### Supabase
- **Documentation officielle** : https://supabase.com/docs

## Notes importantes
- Les notes d'exercices sont stockées dans `performance_logs.notes`
- L'équipement par défaut est "Machine" (ID: 1) avec fallback intelligent
- Les suggestions d'exercices utilisent l'API OpenAI pour l'assistance
- Tous les textes sont adaptés aux utilisateurs belges francophones
- Configuration MCP pour une intégration fluide avec Supabase

## 🛡️ Rappels de Sécurité Critiques

### 🚨 RÈGLES DE SÉCURITÉ ABSOLUES
- **RÉPONDRE TOUJOURS EN FRANÇAIS** : Claude doit répondre uniquement en français pour tous les projets IronTrack
- **FICHIERS SENSIBLES** : Ne jamais commiter les fichiers listés dans .gitignore (CAHIER_DES_CHARGES_UX.md, mcp.json, etc.)
- **DONNÉES PERSONNELLES** : Respecter les contraintes RGPD pour tous les utilisateurs belges
- **BASE DE DONNÉES** : Toujours utiliser les politiques RLS et SECURITY INVOKER pour les vues
- **AUTHENTIFICATION** : Maintenir la sécurité Supabase avec middleware approprié

## 🔒 Corrections de Sécurité (2025-01-20)

### ✅ Audit de sécurité Supabase corrigé AVEC SUCCÈS
1. **Problème SECURITY DEFINER View (ERROR)** ✅ **RÉSOLU**
2. **Problèmes SEARCH_PATH MUTABLE (WARN x5)** ✅ **RÉSOLU**
3. **Protection mots de passe compromis (WARN)**: Guide créé

## ✅ SYSTÈME D'ADMINISTRATION COMPLET (2025-01-21)

### 📁 Structure Admin Finale
```
src/app/admin/
├── layout.tsx
├── page.tsx
├── tickets/[id]/page.tsx
├── users/page.tsx
├── logs/page.tsx
└── exports/page.tsx
```

## Prochaines améliorations possibles
- [ ] Amélioration design global (en cours — voir agents/ui-ux.md)
- [ ] Graphiques de progression pour les métriques cardio
- [ ] Export des données de performance
- [ ] Programmes d'entraînement personnalisés
- [ ] Notifications de rappel d'entraînement
