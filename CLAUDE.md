# IronTrack — Constitution Claude

> **Rôle de ce fichier** : règles non négociables pour tout agent Claude (Code ou Desktop) qui touche à IronTrack. Doit rester ≤ 150 lignes. Journal technique → `CHANGELOG.md`. Stack & CLI → `docs/stack-and-cli.md`.

## 🎯 Stack en une ligne

**Next.js 15.5.12** (App Router, TS strict) · **React 18.3.1** · **Tailwind v4** (@theme inline, oklch) · **shadcn new-york** · **Supabase** (RLS partout) · **Framer Motion** · **PWA** · **Belgique FR-BE**.

Détails, versions, DB, CLI → `docs/stack-and-cli.md`.

## 📌 LES 10 RÈGLES D'OR (non négociables)

1. **🟠 Orange = CTA primaire uniquement** — jamais de fond/décoration orange
2. **🎨 Tokens CSS toujours** — `bg-card`, `text-foreground`, `border-border` (jamais `bg-[#...]`)
3. **🔘 1 seul bouton primary** par vue/section
4. **📦 `<Button>` shadcn toujours** — jamais `<button>` HTML custom
5. **🌙 Dark mode via tokens** — pas de `dark:bg-gray-800` partout
6. **👆 Touch targets ≥ 44px** — tout élément interactif (56px pour actions critiques)
7. **⚓ Hooks AVANT early returns** — règle absolue React
8. **📏 Composant < 200 lignes** — sinon découper
9. **🔒 Auth check avant Supabase** — toujours `auth.getUser()` puis RLS
10. **🚫 Pas de `console.log`** en production — logger structuré uniquement

## 🧠 Protocole d'invocation OBLIGATOIRE

**Avant d'écrire ne serait-ce qu'une ligne, Claude DOIT lire l'agent concerné.** Pas d'improvisation, pas de « je connais déjà ».

| Déclencheur dans le prompt utilisateur | Agent à lire AVANT d'agir |
|---|---|
| design, UI, UX, couleur, token, composant shadcn, dark mode, harmonise, « c'est moche » | `.claude/agents/ui-ux.md` |
| review, refactor, propre, `any`, console.log, hooks, qualité | `.claude/agents/code-review.md` |
| structure, architecture, SOLID, pattern, découpage, organisation | `.claude/agents/architecture.md` |
| LCP, CLS, INP, bundle, lazy, lent, Core Web Vitals | `.claude/agents/performance.md` |
| a11y, accessible, WCAG, lecteur d'écran, clavier, contraste | `.claude/agents/accessibility.md` |
| sécurité, RLS, auth, RGPD, OWASP, CSP, rate limit, prompt injection | `.claude/agents/security.md` |
| test, vitest, playwright, couverture, jest-axe, TDD, E2E | `.claude/agents/testing.md` |
| déploiement, Vercel, migration, CI, rollback, env var | `.claude/agents/devops.md` |
| « améliore tout », tâche multi-dimension | `.claude/agents/orchestrator.md` (flow multi-agent) |

**Slash commands disponibles** (`.claude/commands/`) : `/design-audit`, `/code-review`, `/fix-dark-mode`, `/new-component`, `/orchestrate`, `/css-check`.

**Skills rapides** (`skills/`) : `DESIGN_RULES.md` (référence express), `COMPONENT_PATTERNS.md` (templates prêts à copier).

## 🚦 Workflow standard (toute modif)

1. **Comprendre le POURQUOI** avant de coder — si ambigu, poser 2-3 questions ciblées
2. **Lire l'agent concerné** (cf. table ci-dessus)
3. **Annoncer** les fichiers impactés et le plan
4. **Coder** en respectant les 10 règles d'or
5. **Quality gates** avant commit : `npm run lint && npm run typecheck && npm run test`
6. **Commit conventionnel** : `type(scope): description` (feat/fix/refactor/test/docs/chore/security)

## 🗣️ Langue & communication

- **Réponses à Thierry** : toujours français (il ne parle pas bien anglais)
- **Code** : commentaires EN, noms variables/fonctions EN
- **Commits, PR, docs techniques (README)** : EN
- **Documents produits pour Thierry** (rapports, plans) : FR
- **Style** : résumé → plan → détail. Direct, pas de remplissage.

## 🛡️ Règles de sécurité ABSOLUES

- **Secrets** : uniquement `.env.local` (jamais committé) ou Vercel env. Tokens → `$SUPABASE_ACCESS_TOKEN`, `$SUPABASE_DB_URL`, `$VERCEL_TOKEN`.
- **RLS activé sur 100% des tables Supabase** — aucune exception
- **Auth check OBLIGATOIRE** avant toute lecture/écriture Supabase
- **Validation Zod côté serveur** sur toutes les entrées (jamais confiance au client)
- **RGPD Belgique** : pas de PII dans les logs, consentement explicite, droit à l'oubli
- **Pas d'implémentation maison de crypto/auth** — bibliothèques éprouvées uniquement
- Détails OWASP 2025 + menaces 2026 → `.claude/agents/security.md`

## 🚫 Règles absolues (pour tout agent IA sur ce projet)

1. **Ne jamais supprimer une feature** sans confirmation explicite de Thierry
2. **Ne jamais changer le design system** sans validation (couleurs, typo, spacing)
3. **Ne jamais committer** les fichiers listés dans `.gitignore` (.env.local, mcp.json, etc.)
4. **Sujets ambigus** : présenter les options, ne jamais trancher seul
5. **Signaler proactivement** : risques sécurité, dette technique, régression
6. **1 session = 1 objectif** (feature OU bug OU refactor — jamais les trois)
7. **Vérifier que le projet compile et se lance** AVANT de déclarer terminé

## 📚 Références

- Stack complète, versions exactes, schéma DB, commandes CLI → **`docs/stack-and-cli.md`**
- Journal des corrections et décisions → **`CHANGELOG.md`**
- Documentation Claude Code → https://docs.anthropic.com/en/docs/claude-code/overview
- Documentation Supabase → https://supabase.com/docs
