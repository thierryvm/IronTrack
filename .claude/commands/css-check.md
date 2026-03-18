# /css-check — Vérification CSS Tailwind avant commit

Tu es un expert CSS Tailwind. Analyse tous les fichiers TypeScript/TSX modifiés (ou un fichier/dossier spécifique si fourni en argument) pour détecter et corriger les conflits CSS Tailwind.

## Conflits à détecter

### 1. Classes dupliquées dans le même élément
```
dark:text-gray-300 ... dark:text-gray-300  ← doublon
dark:text-orange-300 ... dark:text-orange-300  ← doublon
```

### 2. Conflits CSS (même propriété, variante incompatible)
```
dark:text-gray-300 ... dark:text-orange-300   ← conflit color
dark:border-gray-700 ... dark:border-orange-800  ← conflit border-color
dark:bg-gray-800 ... dark:bg-gray-900  ← conflit background-color
```

### 3. Hover/group-hover sans dark variant
```
hover:bg-gray-50 dark:bg-gray-800   ← manque dark:hover:
hover:bg-blue-50                    ← manque dark:hover:
group-hover:text-orange-800 dark:text-orange-300  ← manque dark:group-hover:
```

### 4. Fonds clairs sans variante dark
```
bg-blue-50    ← manque dark:bg-blue-900/20
bg-green-50   ← manque dark:bg-green-900/20
bg-purple-50  ← manque dark:bg-purple-900/20
bg-white      ← manque dark:bg-*
bg-gray-50    ← manque dark:bg-*
```

### 5. Fonds de page incorrects
```
min-h-screen bg-gray-50 dark:bg-gray-800  ← utiliser bg-background
```

## Procédure

1. **Identifier les fichiers à vérifier** :
   - Si argument fourni : analyser ce fichier/dossier
   - Sinon : `git diff --name-only` pour les fichiers modifiés, filtrer les `.tsx`/`.ts`

2. **Pour chaque fichier**, lire le contenu et chercher les patterns ci-dessus avec Grep

3. **Corriger les conflits** avec Edit, en appliquant les règles :
   - Supprimer les doublons
   - Choisir la variante la plus spécifique (dark:group-hover: > dark:)
   - Ajouter les `dark:hover:` manquants
   - Remplacer les fonds de page par `bg-background`
   - Ajouter `dark:bg-*-900/20` aux fonds colorés clairs

4. **Rapport final** : liste des fichiers corrigés et nature des corrections

## Règles de correction

| Pattern détecté | Correction |
|----------------|-----------|
| `dark:X ... dark:X` | Supprimer le doublon |
| `dark:text-A ... dark:text-B` | Garder le plus sémantique, retirer l'autre |
| `hover:bg-X dark:bg-Y` | → `hover:bg-X dark:hover:bg-Y` |
| `group-hover:text-X dark:text-Y` | → `group-hover:text-X dark:group-hover:text-Y` |
| `bg-blue-50` sans dark | → ajouter `dark:bg-blue-900/20` |
| `bg-green-50` sans dark | → ajouter `dark:bg-green-900/20` |
| `bg-purple-50` sans dark | → ajouter `dark:bg-purple-900/20` |
| `bg-yellow-50` sans dark | → ajouter `dark:bg-yellow-900/20` |
| `bg-red-50` sans dark | → ajouter `dark:bg-red-900/20` |
| `bg-white` sans dark | → ajouter `dark:bg-gray-900` ou `dark:bg-card` |
| `bg-gray-50` sans dark | → ajouter `dark:bg-gray-800` |
| `min-h-screen bg-gray-50 dark:bg-gray-800` | → `min-h-screen bg-background` |
