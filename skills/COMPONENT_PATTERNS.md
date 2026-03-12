# 🧩 Patterns Composants — IronTrack Quick Reference

## 📦 Composants UI disponibles (ne pas recréer !)

```
src/components/ui/
├── button.tsx          → <Button variant="..." size="...">
├── card.tsx            → <Card>, <CardHeader>, <CardContent>, <CardFooter>
├── input.tsx           → <Input type="..." placeholder="...">
├── badge.tsx           → <Badge variant="...">
├── dialog.tsx          → <Dialog>, <DialogContent>, <DialogHeader>...
├── select.tsx          → <Select>, <SelectContent>, <SelectItem>
├── tabs.tsx            → <Tabs>, <TabsList>, <TabsTrigger>, <TabsContent>
├── progress.tsx        → <Progress value={...} />
├── alert.tsx           → <Alert variant="...">
├── tooltip.tsx         → <Tooltip>, <TooltipContent>
└── ... (voir src/components/ui/index.ts)
```

**Règle : Toujours importer depuis `@/components/ui/[nom]` ou `@/components/ui`**

## 🏗️ Structure d'un composant feature

```
src/components/[feature]/
├── [Feature]Page.tsx       → Composant page principal (layout)
├── [Feature]Card.tsx       → Card individuelle
├── [Feature]List.tsx       → Liste de cards
├── [Feature]Form.tsx       → Formulaire création/édition
├── [Feature]Modal.tsx      → Modal de détail
└── hooks/
    └── use[Feature].ts     → Hook custom pour la logique
```

## 📋 Template Page Standard

```tsx
// src/app/[page]/page.tsx
import { Suspense } from 'react'

export default async function [Nom]Page() {
  const data = await getData() // Server-side fetch
  
  return (
    <main className="container mx-auto px-4 py-6 space-y-6">
      {/* Header de page */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Titre</h1>
          <p className="text-sm text-muted-foreground">Sous-titre</p>
        </div>
        {/* Un seul bouton primary */}
        <Button size="lg">Action principale</Button>
      </div>
      
      {/* Contenu */}
      <Suspense fallback={<div>Chargement...</div>}>
        <[Nom]Content data={data} />
      </Suspense>
    </main>
  )
}
```

## 📋 Template Card Feature

```tsx
interface [Nom]CardProps {
  item: [Nom]Type
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  className?: string
}

export function [Nom]Card({ item, onEdit, onDelete, className }: [Nom]CardProps) {
  return (
    <Card className={cn('transition-shadow hover:shadow-md', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{item.name}</CardTitle>
          {/* Actions secondaires = ghost ou outline */}
          <Button variant="ghost" size="sm" onClick={() => onEdit?.(item.id)}>
            Modifier
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{item.description}</p>
      </CardContent>
    </Card>
  )
}
```

## 📋 Template Hook Custom

```tsx
// src/components/[feature]/hooks/use[Feature].ts
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'

export function use[Feature]() {
  const [data, setData] = useState<[Type][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')
      
      const { data, error } = await supabase
        .from('[table]')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setData(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    fetch()
  }, [fetch])
  
  return { data, loading, error, refetch: fetch }
}
```

## 🚫 Anti-patterns IronTrack

```tsx
// ❌ NE PAS faire : composant spaghetti
export default function BigComponent() {
  // 400 lignes de tout mélangé...
}

// ❌ NE PAS faire : button HTML custom
<button className="bg-orange-500 text-white px-4 py-2 rounded">
  Action
</button>

// ❌ NE PAS faire : couleurs hardcodées
<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">

// ❌ NE PAS faire : fetch sans auth check
const { data } = await supabase.from('workouts').select('*')

// ✅ TOUJOURS faire
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/auth/login')
const { data } = await supabase.from('workouts').select('*').eq('user_id', user.id)
```
