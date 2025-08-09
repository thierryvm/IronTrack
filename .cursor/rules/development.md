# Règles de développement IronTrack

## Architecture et structure

### Organisation des fichiers
- **Pages** : `/app` avec App Router Next.js 15
- **Composants** : `/components` organisés par domaine fonctionnel
- **Hooks** : `/hooks` avec logique métier réutilisable
- **Types** : `/types` avec interfaces TypeScript strictes
- **Utils** : `/utils` avec fonctions utilitaires testables

### Conventions de nommage
- **Composants** : PascalCase (`ExerciseCard.tsx`)
- **Hooks** : camelCase avec préfixe `use` (`useAuth.ts`)
- **Types** : PascalCase avec interfaces (`Exercise`, `WorkoutType`)
- **Constantes** : SCREAMING_SNAKE_CASE (`API_ENDPOINTS`)

## Sécurité obligatoire

### Base de données Supabase
- **RLS obligatoire** : Row Level Security sur toutes les tables
- **JAMAIS** : Utiliser `service_role_key` côté client
- **Auth** : Toujours vérifier `auth.uid()` dans les politiques RLS
- **Fonctions RPC** : Utiliser `SECURITY INVOKER` et `SET search_path = 'public'`

### Variables d'environnement
- **JAMAIS** commiter les secrets dans `.env.local`
- **Production** : Variables sensibles via Vercel Environment Variables
- **Client** : Préfixer avec `NEXT_PUBLIC_` uniquement si nécessaire côté client

## Performance et optimisation

### Images et médias
- **Obligatoire** : Utiliser `next/image` avec optimisation
- **Formats** : WebP/AVIF en priorité, fallback JPEG/PNG
- **Tailles** : Définir `width` et `height` explicites
- **Lazy loading** : Activé par défaut sur `next/image`

### Requêtes Supabase
- **Pagination** : Limite de 50 éléments par page maximum
- **SELECT** : Spécifier les colonnes exactes, éviter `SELECT *`
- **Indexes** : Vérifier les index sur colonnes fréquemment filtrées
- **RPC** : Préférer les fonctions RPC pour logique complexe

## Tests et qualité

### Tests unitaires obligatoires
- **Framework** : Jest + React Testing Library
- **Couverture** : Minimum 70% sur composants critiques
- **Fichiers** : `__tests__/` ou `.test.tsx` à côté du composant
- **Mocks** : Mocker Supabase et APIs externes

### Validation TypeScript
- **Mode strict** : `strict: true` dans `tsconfig.json`
- **Props** : Interfaces explicites pour tous les composants
- **API** : Types générés depuis Supabase avec `supabase gen types`
- **Erreurs** : Aucune erreur TypeScript tolérée en production

## Exemples de bonnes pratiques

```tsx
// ✅ Composant avec interface TypeScript
interface ExerciseCardProps {
  exercise: Exercise
  onEdit: (id: string) => void
  isSelected?: boolean
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onEdit,
  isSelected = false
}) => {
  // ✅ Hook personnalisé pour logique métier
  const { updateExercise, loading } = useExerciseManagement()
  
  return (
    <motion.div
      className="bg-white rounded-lg shadow-md p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      aria-label={`Exercice ${exercise.name}`}
    >
      {/* Contenu */}
    </motion.div>
  )
}
```

## Commandes de vérification
```bash
npm run lint          # ESLint sans erreurs
npm run typecheck     # TypeScript strict
npm test              # Tests unitaires passants
npm run build         # Build production sans warnings
```