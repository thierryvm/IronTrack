# Règles UI/UX pour IronTrack

## Design System et cohérence

### Palette de couleurs
- **Primary** : Orange (`bg-orange-500`, `text-orange-600`)
- **Secondary** : Rouge (`bg-red-500` pour dégradés)
- **Success** : Vert (`bg-green-500`, `text-green-600`)
- **Warning** : Jaune (`bg-yellow-500`, `text-yellow-600`)
- **Error** : Rouge (`bg-red-500`, `text-red-600`)
- **Neutral** : Gris (`bg-gray-50`, `text-gray-900`)

### Typographie
- **Titre principal** : `text-3xl font-bold`
- **Titre section** : `text-xl font-semibold`
- **Corps de texte** : `text-base text-gray-700`
- **Texte secondaire** : `text-sm text-gray-500`
- **Labels** : `text-sm font-medium text-gray-700`

### Espacement et layout
- **Container** : `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Sections** : `py-8` vertical, `space-y-6` entre éléments
- **Cards** : `p-6` padding, `rounded-xl` coins arrondis
- **Buttons** : `px-4 py-2` ou `px-6 py-3` selon importance

## Composants standards

### Boutons
```tsx
// ✅ Bouton principal
<button className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
  Action principale
</button>

// ✅ Bouton secondaire  
<button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
  Action secondaire
</button>

// ✅ Bouton icône
<button 
  className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
  aria-label="Modifier l'élément"
>
  <Edit className="h-4 w-4" />
</button>
```

### Cards et conteneurs
```tsx
// ✅ Card standard
<div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">Titre</h3>
  <p className="text-gray-600">Contenu</p>
</div>

// ✅ Header de page avec gradient
<div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8">
  <div className="max-w-7xl mx-auto px-4">
    <h1 className="text-3xl font-bold">Titre de la page</h1>
    <p className="text-white/90">Description</p>
  </div>
</div>
```

## Responsive et mobile-first

### Breakpoints Tailwind
- **Mobile** : `< 640px` (défaut)
- **Tablet** : `sm: 640px`
- **Desktop** : `lg: 1024px`
- **Large** : `xl: 1280px`

### Patterns responsive
```tsx
// ✅ Grid responsive
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

// ✅ Flexbox responsive
<div className="flex flex-col sm:flex-row gap-4">

// ✅ Text responsive
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">

// ✅ Padding responsive
<div className="px-4 sm:px-6 lg:px-8">
```

## Animations et interactions

### Framer Motion standards
```tsx
// ✅ Animation d'entrée
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>

// ✅ Liste avec délais échelonnés
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
  >
))}

// ✅ Hover interactions
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  className="..."
>
```

### Transitions CSS
- **Standard** : `transition-colors` pour changements de couleur
- **Transform** : `transition-transform` pour échelle/rotation
- **All** : `transition-all` uniquement si nécessaire (performance)
- **Durée** : Durée par défaut (0.15s) suffisante

## États et feedback utilisateur

### Loading states
```tsx
// ✅ Spinner standard
<div className="flex items-center justify-center py-8">
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
  <p className="ml-3 text-gray-500">Chargement...</p>
</div>

// ✅ Skeleton loading
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>
```

### Messages d'erreur et succès
```tsx
// ✅ Message de succès
<div className="bg-green-50 border border-green-200 rounded-lg p-4">
  <div className="flex items-center">
    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
    <p className="text-green-800">Action réalisée avec succès</p>
  </div>
</div>

// ✅ Message d'erreur
<div className="bg-red-50 border border-red-200 rounded-lg p-4">
  <div className="flex items-center">
    <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
    <p className="text-red-800">Une erreur s'est produite</p>
  </div>
</div>
```

## Standards spécifiques IronTrack

### Mascotte IronBuddy
- **Position** : FAB en bas droite `fixed bottom-6 right-6`
- **Taille** : `w-14 h-14` sur mobile, `w-16 h-16` sur desktop
- **Z-index** : `z-50` pour être au-dessus des modals
- **Animation** : Rotation douce toutes les 15 secondes

### Cartes exercices
- **Aspect ratio** : Carré ou 4:3 pour cohérence
- **Hover** : `hover:shadow-lg transition-shadow`
- **Border-left** : Couleur selon type d'exercice
- **Typography** : Nom en `font-semibold`, type en `text-sm text-gray-500`

### Formulaires
- **Labels** : Toujours au-dessus des inputs
- **Validation** : Messages d'erreur en rouge sous le champ
- **Required** : Astérisque rouge `text-red-500`
- **Success** : Border verte après validation