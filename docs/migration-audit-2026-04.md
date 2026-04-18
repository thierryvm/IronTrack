# Migration audit — 2026-04-18

Audit ponctuel des migrations Supabase suite à la divergence repérée dans
l'inventaire `docs/irontrack-inventory.md`.

## Constat

`src/lib/profile/index.ts` (ligne 11-13) mentionne une migration qui ajoute
une colonne `locale` à `profiles` :

```ts
// `locale` a été ajouté par la migration 20260417120457 : le type généré peut
// être périmé → on étend explicitement.
export type Profile = Tables<'profiles'> & {
  locale?: string | null;
};
```

## Résultat de la recherche

| Vérification | Résultat |
|---|---|
| Présence dans `supabase/migrations/` | ❌ absente (72 migrations, toutes datées 2025-07-23 → 2025-08-17) |
| Trace dans git (toutes branches, historique complet) | ❌ aucune — ni `git log --grep`, ni `git log -S"locale"`, ni `git log -- "*locale*"` |
| Présence dans types auto-générés (`src/lib/supabase/types.ts`, daté 2026-04-15) | ❌ aucune colonne `locale` dans `profiles.Row` |
| Référence dans le code applicatif | ✅ 1 seule : le commentaire de `src/lib/profile/index.ts` |

## Diagnostic

Trois hypothèses plausibles :

1. **Migration appliquée hors-workflow** : `ALTER TABLE profiles ADD COLUMN locale TEXT`
   exécutée directement depuis la dashboard Supabase (SQL editor) ou via
   `supabase db push` avec un fichier local non committé. Aucune trace dans le
   repo.
2. **Migration planifiée mais jamais exécutée** : le commentaire du code
   anticipe une migration future, le type est étendu défensivement au cas où.
3. **Migration perdue lors d'un rebase** : peu probable — aucun reflog ni
   stash n'en conserve la trace.

**Risque** : un nouvel environnement bootstrappé à partir du repo (CI, dev
machine neuve, preview Vercel avec base fraîche) n'aura **pas** la colonne
`locale`. Toute lecture via `profile.locale` retournera `undefined` silencieux
grâce au typage défensif, mais toute tentative d'**écriture** échouerait.

## Vérification à faire côté Supabase prod

À exécuter sur la base prod `taspdceblvmpvdjixyit` pour confirmer l'état :

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name = 'locale';
```

- **Si ligne retournée** : la colonne existe → migration appliquée hors-workflow.
  Action : créer une migration de rattrapage (`CREATE ... IF NOT EXISTS`) et
  la committer pour la reproductibilité, puis régénérer les types.
- **Si vide** : la colonne n'existe pas → le commentaire de `profile/index.ts`
  anticipe à tort. Action : retirer le commentaire et l'extension de type, ou
  créer la migration manquante si la feature locale-per-user est prévue.

## Migration de rattrapage proposée (défensive, idempotente)

Si la vérification confirme que la colonne existe bien en prod, committer ce
fichier sous `supabase/migrations/20260417120457_add_profiles_locale.sql` pour
rattraper l'historique :

```sql
-- Rattrapage : colonne profiles.locale (appliquée hors-workflow le 2026-04-17).
-- Defensive: idempotent (IF NOT EXISTS) + valeur par défaut + index léger.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS locale TEXT;

-- Contrainte : l'app n'accepte que fr/nl/en (cf. LOCALES dans src/i18n/request.ts).
-- Ajouter une CHECK constraint via une deuxième migration si la contrainte est
-- désirée côté DB (pour l'instant la validation vit côté app uniquement).

COMMENT ON COLUMN public.profiles.locale IS
  'Locale préférée de l''utilisateur (fr/nl/en). NULL = fallback sur Accept-Language ou DEFAULT_LOCALE.';
```

**Étapes post-migration** :
1. `npx supabase db push --db-url "$SUPABASE_DB_URL"` (appliquera `IF NOT EXISTS` sans casser)
2. `npm run db:types` → régénère `src/lib/supabase/types.ts` avec la colonne
3. Supprimer l'extension défensive dans `src/lib/profile/index.ts` (plus nécessaire une fois les types à jour)

## Action recommandée — Step 0.5 ou suivant

Cette PR (`chore/docs-sync-reality`) **n'applique pas** la migration de
rattrapage. Objectif du Step 0 = alignement doc uniquement. La décision
d'appliquer ou non cette migration relève d'une PR séparée :
- soit après vérification prod si la colonne existe déjà
- soit au moment d'implémenter la persistance de la locale par utilisateur

## Contexte lié

- Inventaire complet : `docs/irontrack-inventory.md` §6.4 (migrations) et §4.2
  (colonnes profiles utilisées vs disponibles)
- Workflow migrations officiel : `docs/stack-and-cli.md` §🛠️ CLI Supabase
