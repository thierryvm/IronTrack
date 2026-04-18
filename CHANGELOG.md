# CHANGELOG — IronTrack

Journal chronologique des changements structurels, corrections et décisions techniques. Format inspiré de [Keep a Changelog](https://keepachangelog.com/).

Les règles projet vivent dans `CLAUDE.md`. La stack technique dans `docs/stack-and-cli.md`.

---

## [Non publié]

### Gouvernance Claude
- Refonte du `CLAUDE.md` en constitution ≤ 150 lignes (10 règles d'or + protocole d'invocation obligatoire).
- Extraction de la stack technique vers `docs/stack-and-cli.md`.
- Extraction du journal historique vers ce `CHANGELOG.md`.
- Correction typographie dans les agents `ui-ux.md` et `performance.md` : `Inter` → `Fraunces + Manrope + JetBrains Mono` (DA officielle).
- Nettoyage des gadgets : suppression de `agent-vibes/`, `personalities/`, `audio/`, `hooks/`, `plugins/`, `worktrees/angry-hofstadter/`, `background-music.cfg`, fichiers `tts-*.txt`, `.Codex/`.

---

## 2025-01-21 — Système d'administration

Structure admin finale :
```
src/app/admin/
├── layout.tsx
├── page.tsx
├── tickets/[id]/page.tsx
├── users/page.tsx
├── logs/page.tsx
└── exports/page.tsx
```

---

## 2025-01-20 — Corrections sécurité Supabase

**Audit de sécurité Supabase corrigé** :
1. ✅ Problème **SECURITY DEFINER View** (ERROR) — résolu
2. ✅ Problèmes **SEARCH_PATH MUTABLE** (WARN x5) — résolu
3. 📝 Protection **mots de passe compromis** (WARN) — guide créé

---

## 2025-01-20 — Système création/modification d'exercices

### Formulaires clarifiés
- **`ExerciseEditForm`** : modification des propriétés de l'exercice + affichage des notes de performance (lecture seule)
- **`PerformanceEditForm`** : modification complète des performances avec toutes les métriques cardio avancées
- **`ExerciseWizard`** : création d'exercices avec assistant intelligent
- Bouton **« Modifier l'exercice »** ajouté au modal de détails pour clarifier les deux types de modification

### Récupération des données
- Notes proviennent désormais de la dernière performance (`performance_logs.notes`)
- Toutes les métriques cardio avancées récupérées dans le formulaire d'édition de performance
- Gestion des erreurs 404 corrigée

### Modal de confirmation amélioré
- Affichage complet de toutes les métriques (SPM, watts, heart rate, incline, cadence, resistance)
- Affichage des notes si présentes
- Résumé visuel avec icônes pour chaque métrique

---

## 2025-01-20 — Système cardio avancé

### Formulaires de performance
- Ajout de tous les champs cardio avancés : `stroke_rate`, `watts`, `heart_rate`, `incline`, `cadence`, `resistance`, `distance_unit`
- Labels adaptés aux utilisateurs belges francophones
- Sections spécifiques par équipement (rameur / course / vélo)
- Unités correctes (mètres pour rameur, km pour course et vélo)

### Navigation
- Suppression de la page redondante `/exercises/[id]`
- Correction des boutons « X » et « Retour » (redirection vers `/exercises`)
- `ExerciseDetailsModal` comme interface principale de détail

### Base de données
- Script SQL exécuté pour ajouter les champs cardio avancés
- Contraintes adaptées au système belge (mètres, km, virgule décimale)

---

## Notes techniques persistantes

- Les notes d'exercices sont stockées dans `performance_logs.notes` (pas sur l'exercice lui-même).
- L'équipement par défaut est **Machine** (ID: 1) avec fallback intelligent.
- Les suggestions d'exercices utilisent l'API OpenAI pour l'assistance.
- Tous les textes sont adaptés aux utilisateurs belges francophones.
- Configuration MCP pour une intégration fluide avec Supabase.

---

## 📋 Prochaines améliorations possibles

- [ ] Nettoyer les 121 `console.log` en production (règle d'or #10)
- [ ] Éliminer les 36 occurrences de `any` (règle TS strict)
- [ ] Remplacer les 15 `bg-[#...]` hardcodés par des tokens CSS (règle d'or #2)
- [ ] Graphiques de progression pour les métriques cardio
- [ ] Export des données de performance
- [ ] Programmes d'entraînement personnalisés
- [ ] Notifications de rappel d'entraînement
