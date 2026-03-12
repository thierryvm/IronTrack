# 🎯 Agent Orchestrateur — IronTrack

**Rôle** : Coordinateur principal. Je délègue aux agents spécialisés selon le contexte.

## 🗺️ Carte des Agents IronTrack

```
ORCHESTRATEUR
├── 🎨 Design & UX
│   ├── agents/ui-ux.md          → Design system, tokens, composants
│   ├── .claude/commands/design-audit.md    → Audit d'une page (/design-audit)
│   ├── .claude/commands/fix-dark-mode.md   → Fix dark mode (/fix-dark-mode)
│   └── .claude/commands/new-component.md  → Nouveau composant (/new-component)
│
├── 🔍 Qualité Code
│   ├── agents/code-review.md    → Référence revue de code
│   └── .claude/commands/code-review.md    → Revue automatique (/code-review)
│
├── 🏗️ Architecture
│   └── agents/architecture.md  → Patterns Next.js, SOLID, structure
│
├── ⚡ Performance
│   └── agents/performance.md   → Core Web Vitals, optimisation
│
├── ♿ Accessibilité
│   └── agents/accessibility.md → WCAG 2.2, a11y
│
└── 🔒 Sécurité
    └── agents/security.md      → Supabase RLS, RGPD, auth
```

## 🧭 Routage Automatique par Type de Demande

### Demandes Design/UX
> "améliore le design", "c'est moche", "incohérent", "harmonise", "dark mode cassé"

**Actions** :
1. Lire `agents/ui-ux.md` pour le contexte design system
2. Exécuter le protocole `/design-audit` sur le fichier concerné
3. Si dark mode → exécuter `/fix-dark-mode`
4. Présenter les corrections avec justification

### Demandes Code Quality
> "review le code", "est-ce propre", "est-ce correct", "refactorise", "améliore"

**Actions** :
1. Lire `agents/code-review.md` pour les critères
2. Exécuter le protocole `/code-review` sur le fichier
3. Prioriser les corrections par sévérité
4. Appliquer si demandé

### Demandes Architecture
> "comment structurer", "est-ce bien architecturé", "refactorise pour plus de clarté"

**Actions** :
1. Lire `agents/architecture.md`
2. Analyser la structure actuelle
3. Proposer les améliorations avec exemples concrets

### Demandes Performance
> "page lente", "optimise", "LCP", "Core Web Vitals"

**Actions** :
1. Lire `agents/performance.md`
2. Auditer les métriques actuelles
3. Prioriser les gains de performance

### Demandes Sécurité
> "sécurité", "faille", "RLS", "protection données"

**Actions** :
1. Lire `agents/security.md`
2. Auditer les points critiques
3. Proposer les corrections dans l'ordre de criticité

### Demandes Accessibilité
> "accessible", "WCAG", "lecteur d'écran", "contraste"

**Actions** :
1. Lire `agents/accessibility.md`
2. Audit WCAG 2.2 AA
3. Corrections avec exemples

## 🔄 Flow Multi-Agent (tâches complexes)

Pour "améliore tout ce fichier/cette page" :

```
Étape 1 → Design Audit    (tous les problèmes visuels)
Étape 2 → Dark Mode Fix   (incohérences dark mode)
Étape 3 → Code Review     (dimension TypeScript + Hooks)
Étape 4 → Accessibilité   (contraste, touch targets)
Étape 5 → Résumé          (liste complète des changements)
```

## 📌 Les 10 Règles d'Or IronTrack (à mémoriser)

1. **🟠 Orange = CTA primaire uniquement** — pas de fond orange décoratif
2. **🎨 Variables CSS = toujours** — `bg-card`, `text-foreground`, `border-border`
3. **🔘 Un seul bouton primary** par vue/section
4. **📦 `<Button>` shadcn** — jamais de `<button>` HTML custom
5. **🌙 Dark mode automatique** — via variables CSS, pas de `dark:` manuel partout
6. **👆 Touch targets ≥ 44px** — tout élément cliquable/tapable
7. **⚓ Hooks avant tout** — early returns APRÈS les hooks React
8. **📏 Composant < 200 lignes** — diviser si plus grand
9. **🔒 Auth check avant Supabase** — toujours vérifier l'utilisateur
10. **🚫 Console.log = jamais** en production (sauf logs structurés)

## 💬 Exemples d'Utilisation

```
"La page homepage a des boutons qui ne matchent pas"
→ /design-audit src/app/page.tsx

"Le composant WorkoutCard est trop long et complexe"  
→ /code-review src/components/exercises/WorkoutCard.tsx

"Je veux créer un composant de stats"
→ /new-component

"Harmonise tout le design du profil"
→ /design-audit + /fix-dark-mode sur src/app/profile/

"Le texte du bouton 'Voir le planning' est invisible en dark"
→ /fix-dark-mode src/components/HomePage/
```
