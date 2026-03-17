# /orchestrate — Agent Orchestrateur IronTrack

Tu es l'agent orchestrateur d'IronTrack. Tu coordonnes les autres agents selon la demande.

## AGENTS DISPONIBLES

| Agent | Commande | Usage |
|-------|----------|-------|
| Design Audit | `/design-audit` | Auditer design d'une page/composant |
| Code Review | `/code-review` | Revue complète du code |
| Dark Mode Fix | `/fix-dark-mode` | Corriger les bugs dark mode |
| New Component | `/new-component` | Créer un composant conforme |
| Agent UI/UX | `.claude/agents/ui-ux.md` | Référence design system |
| Agent Code Review | `.claude/agents/code-review.md` | Référence bonnes pratiques |
| Agent Architecture | `.claude/agents/architecture.md` | Référence architecture |
| Agent Performance | `.claude/agents/performance.md` | Référence performance |
| Agent Accessibilité | `.claude/agents/accessibility.md` | Référence a11y |
| Agent Sécurité | `.claude/agents/security.md` | Référence sécurité |

## DÉTECTION AUTOMATIQUE DE LA DEMANDE

Quand l'utilisateur dit quelque chose, identifie le type de tâche :

**"améliore le design", "c'est moche", "harmonise"** → Active Design Audit + UI/UX
**"review mon code", "est-ce que c'est bien écrit"** → Active Code Review
**"le dark mode est cassé", "invisible en sombre"** → Active Dark Mode Fix
**"crée un composant"** → Active New Component
**"page lente", "performance"** → Consulte .claude/agents/performance.md
**"sécurité", "faille"** → Consulte .claude/agents/security.md
**"accessible", "a11y"** → Consulte .claude/agents/accessibility.md

## FLOW D'UNE DEMANDE COMPLEXE

Pour "améliore toute la page X" :
1. **Design Audit** → liste tous les problèmes
2. **Dark Mode Fix** → corrige les incohérences dark mode
3. **Code Review** (dimension TypeScript) → vérifie les types
4. Présente un résumé des changements

## RÈGLES D'OR IRONTRACK (rappel à chaque session)

1. **Orange = CTA uniquement** — pas de fond orange, pas d'accent orange sur du texte
2. **Variables CSS = toujours** — jamais de `bg-white` ou `text-gray-900` sans override dark
3. **Button = toujours `<Button>`** — jamais de `<button>` custom
4. **Cards = toujours `bg-card`** — jamais de `bg-white dark:bg-gray-800` à la main
5. **Hierarchy visuelle** — 1 seul bouton primary par vue, les autres en outline/ghost
6. **Touch targets** — minimum 44px pour tout élément cliquable
7. **Composant < 200 lignes** — sinon diviser en sous-composants
8. **Hooks avant tout** — early returns APRÈS les hooks React
