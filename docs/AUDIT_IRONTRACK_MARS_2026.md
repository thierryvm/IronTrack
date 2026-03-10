# 🏋️ IronTrack — Audit Codebase Complet
**Date :** 10 Mars 2026 | **Version :** v0.1.0 | **Stack :** Next.js 15 · React 18 · TypeScript · Supabase · Tailwind CSS v4

---

## Scores Globaux (état avant refactoring)

| Critère | Score | Cible |
|---------|-------|-------|
| 🔒 Sécurité | 4/10 | 8/10 |
| 🏗️ Architecture | 5/10 | 8/10 |
| 🧹 Qualité code | 6/10 | 8/10 |
| 🚀 DevOps / CI-CD | 4/10 | 8/10 |
| **Global** | **5/10** | **8/10** |

---

## 1. 🔴 Sécurité — Problèmes Critiques

### SEC-1 : Secrets exposés côté client (NEXT_PUBLIC_)
Les variables suivantes **NE DOIVENT PAS** avoir le préfixe `NEXT_PUBLIC_` car elles sont visibles dans le bundle JS :
- `NEXT_PUBLIC_SENTRY_AUTH_TOKEN` → renommer en `SENTRY_AUTH_TOKEN`
- `NEXT_PUBLIC_MAILTRAP_API_TOKEN` → renommer en `MAILTRAP_API_TOKEN`
- `NEXT_PUBLIC_POSTHOG_KEY` → acceptable (clé publique analytics)
- `NEXT_PUBLIC_STRIPE_API_KEY` → vérifier que c'est une clé publique `pk_`

### SEC-2 : Build TypeScript et ESLint désactivés
Dans `next.config.mjs` :
```js
ignoreBuildErrors: true,   // ❌ TypeScript ignoré au build
ignoreDuringBuilds: true,  // ❌ ESLint ignoré au build
```
**Action :** Passer les deux à `false` après correction des erreurs TS.

### SEC-3 : 6 API Routes sans vérification d'authentification
- `/api/admin/stats/route.ts`
- `/api/admin/tickets/[id]/status/route.ts`
- `/api/nutrition/search/route.ts`
- `/api/training-partners/search/route.ts`
- `/api/training-partners/sharing/route.ts`
- `/api/training-partners/[id]/route.ts`

**Note :** Le middleware exclut explicitement `/api/` du matcher — chaque route doit donc gérer son propre auth.

---

## 2. 🟠 Architecture — Problèmes Hauts

### ARC-1 : 3 configs ESLint en conflit
- `.eslintrc.js` — désactive `no-explicit-any`, `no-unused-vars`
- `.eslintrc.json` — idem mais `exhaustive-deps: off`
- `eslint.config.mjs` — format ESLint 9 flat config (celui à garder)

**Action :** Supprimer `.eslintrc.js` et `.eslintrc.json`.

### ARC-2 : 10 composants dupliqués (version "2025")
| Composant | Version normale | Version 2025 | Recommandation |
|-----------|----------------|--------------|----------------|
| ExerciseEditForm | ✅ | ✅ 4 imports | Garder 2025, supprimer l'ancienne |
| SupportTicketForm | ✅ | ✅ 2 imports | Garder 2025, supprimer l'ancienne |
| GoalSelection | ✅ | 💀 0 import | Supprimer les deux, choisir une |
| FrequencySelection | ✅ | 💀 0 import | Supprimer les deux, choisir une |
| Modal2025 | N/A | 💀 0 import | Supprimer, utiliser dialog.tsx shadcn |
| Slider2025 | N/A | ✅ 2 imports | Garder, renommer → Slider.tsx |

### ARC-3 : Pages géantes (violation SRP)
- `progress/page.tsx` : **1692 lignes** ❌
- `profile/page.tsx` : **1539 lignes** ❌
- `HomePageClient.tsx` : **928 lignes** ⚠️

### ARC-4 : Dépendances inutiles / obsolètes
| Package | Problème | Action |
|---------|---------|--------|
| `react-router-dom` | Anti-pattern dans Next.js App Router | Supprimer |
| `@supabase/auth-helpers-nextjs` | Obsolète, remplacé par @supabase/ssr | Supprimer |
| `pg` | Accès direct PostgreSQL (sécurité) | Supprimer si non utilisé |
| `node-fetch` | Inutile avec Node 18+ | Supprimer |
| `dompurify` + `isomorphic-dompurify` | Double importation | Garder isomorphic seulement |

---

## 3. 🟡 Qualité Code — Problèmes Moyens

### QUA-1 : 3 composants morts (jamais importés)
- `CriticalCSSExtractor.tsx`
- `PerformanceOptimizer.tsx`
- `AccessibilityFixes.tsx`

### QUA-2 : 4 hooks admin dupliqués
- `useAdminAuth.ts` (266 lignes) + `useAdminAuthSimple.ts` (178 lignes)
→ Consolider en un seul hook avec options

### QUA-3 : 40+ scripts one-shot dans /scripts
→ Archiver dans `scripts/archive/`, garder uniquement les scripts CI

### QUA-4 : Usage `any` TypeScript
→ Activer `@typescript-eslint/no-explicit-any` progressivement

---

## 4. 🔵 DevOps & CI/CD — Infos

### DEV-1 : 1 seul workflow GitHub Actions
Seul `contrast-check.yml` existe. Manquants :
- `ci.yml` — TypeScript + ESLint + Jest + build check
- `e2e.yml` — Tests Playwright
- `deploy-preview.yml` — Preview Vercel automatique
- `security.yml` — npm audit + secret scan

### DEV-2 : Pas de vercel.json sécurisé
→ Créer avec headers CSP, HSTS, X-Frame-Options

### PERF-1 : experimental.cpus: 1
→ Supprimer cette limitation dans next.config.mjs

---

## Plan d'Action Priorisé

### Sprint 1 — Sécurité (1-2 jours) 🔴
- [ ] S1 : Renommer `NEXT_PUBLIC_SENTRY_AUTH_TOKEN` → `SENTRY_AUTH_TOKEN`
- [ ] S2 : Renommer `NEXT_PUBLIC_MAILTRAP_API_TOKEN` → `MAILTRAP_API_TOKEN`
- [ ] S3 : Sécuriser les 6 routes API sans auth
- [ ] S4 : `ignoreBuildErrors: false` + corriger erreurs TS
- [ ] S5 : Supprimer `.eslintrc.js` et `.eslintrc.json`

### Sprint 2 — Architecture (3-5 jours) 🟠
- [ ] A1 : Supprimer composants morts (CriticalCSSExtractor, PerformanceOptimizer, AccessibilityFixes)
- [ ] A2 : Supprimer composants 2025 jamais utilisés (GoalSelection2025, FrequencySelection2025, Modal2025)
- [ ] A3 : Supprimer dépendances : react-router-dom, pg, node-fetch
- [ ] A4 : Consolider useAdminAuth + useAdminAuthSimple
- [ ] A5 : Générer types Supabase : `npx supabase gen types typescript`
- [ ] A6 : Archiver scripts one-shot dans scripts/archive/

### Sprint 3 — Refactoring (1-2 semaines) 🟡
- [ ] R1 : Découper progress/page.tsx en hooks + sous-composants
- [ ] R2 : Découper profile/page.tsx de même
- [ ] R3 : Intégrer React Query pour le cache Supabase

### Sprint 4 — DevOps (2-3 jours) 🔵
- [ ] D1 : Créer `.github/workflows/ci.yml`
- [ ] D2 : Créer `.github/workflows/e2e.yml`
- [ ] D3 : Créer `vercel.json` avec headers sécurité
- [ ] D4 : Configurer Dependabot

---

*Généré le 10 Mars 2026 — Audit réalisé avec Claude Sonnet 4.6*