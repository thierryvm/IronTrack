# Règles d'accessibilité pour IronTrack

## Règles obligatoires WCAG 2.1 AA

### Contraste des couleurs
- **Ratio minimum** : 4.5:1 pour le texte normal, 3:1 pour le texte large (18px+)
- **INTERDIT** : `text-orange-100`, `text-orange-200` sur fond orange
- **INTERDIT** : `text-red-100`, `text-red-200` sur fond rouge
- **AUTORISÉ** : `text-white/90`, `text-white/80`, `text-gray-900`

### Labels ARIA obligatoires
- **Boutons sans texte** : Toujours ajouter `aria-label="Description explicite"`
- **Boutons avec icônes uniquement** : `aria-label` descriptif en français
- **Boutons d'expansion** : Ajouter `aria-expanded="true/false"`
- **Liens avec icônes** : `aria-label` avec contexte précis

### Tailles tactiles
- **Minimum** : 44x44px pour tous les éléments interactifs
- **Mobile** : Espacement minimum 8px entre éléments tactiles
- **Desktop** : Focus visible avec outline ou border

### Navigation clavier
- **Obligatoire** : Tous les éléments interactifs accessibles via Tab
- **Focus management** : Focus visible et logique
- **Raccourcis** : Eviter les conflits avec les raccourcis navigateur

## Exemples corrects

```tsx
// ✅ Bouton avec aria-label
<button 
  className="p-2 hover:bg-gray-50 rounded-lg"
  aria-label="Modifier l'exercice"
>
  <Edit className="h-4 w-4" />
</button>

// ✅ Contraste correct
<p className="text-white/90">Texte sur fond coloré</p>

// ✅ Bouton expansible
<button 
  aria-label="Développer les détails"
  aria-expanded={isExpanded}
  onClick={toggle}
>
  <ChevronDown className="h-4 w-4" />
</button>
```

## Vérifications automatiques
- Utiliser le script `scripts/fix-accessibility.js` pour audit
- Tester avec Lighthouse Accessibility (score minimum 95)
- Valider avec lecteur d'écran (NVDA/VoiceOver)