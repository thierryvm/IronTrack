-- Migration pour ajouter la colonne type à la table workouts si elle n'existe pas
-- Date: 2025-07-13

-- Vérifier si la colonne type existe déjà
DO $$ 
BEGIN
    -- Essayer d'ajouter la colonne type si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='workouts' 
        AND column_name='type'
    ) THEN
        ALTER TABLE public.workouts 
        ADD COLUMN type TEXT CHECK (type IN ('Musculation', 'Cardio', 'Étirement', 'Repos', 'Cours collectif', 'Gainage', 'Natation', 'Crossfit', 'Yoga', 'Pilates')) DEFAULT 'Musculation';
        
        RAISE NOTICE 'Colonne type ajoutée à la table workouts';
    ELSE
        RAISE NOTICE 'Colonne type existe déjà dans la table workouts';
    END IF;
END $$;

-- Mettre à jour les séances existantes qui n'ont pas de type
UPDATE public.workouts 
SET type = CASE 
    WHEN LOWER(name) LIKE '%cardio%' THEN 'Cardio'
    WHEN LOWER(name) LIKE '%étirement%' OR LOWER(name) LIKE '%etirement%' OR LOWER(name) LIKE '%stretch%' THEN 'Étirement'
    WHEN LOWER(name) LIKE '%cours%' OR LOWER(name) LIKE '%collectif%' OR LOWER(name) LIKE '%group%' THEN 'Cours collectif'
    WHEN LOWER(name) LIKE '%gainage%' OR LOWER(name) LIKE '%core%' OR LOWER(name) LIKE '%abs%' THEN 'Gainage'
    WHEN LOWER(name) LIKE '%natation%' OR LOWER(name) LIKE '%piscine%' OR LOWER(name) LIKE '%swim%' THEN 'Natation'
    WHEN LOWER(name) LIKE '%crossfit%' OR LOWER(name) LIKE '%cross fit%' OR LOWER(name) LIKE '%wod%' THEN 'Crossfit'
    WHEN LOWER(name) LIKE '%yoga%' THEN 'Yoga'
    WHEN LOWER(name) LIKE '%pilates%' THEN 'Pilates'
    WHEN LOWER(name) LIKE '%repos%' OR LOWER(name) LIKE '%rest%' THEN 'Repos'
    ELSE 'Musculation'
END
WHERE type IS NULL OR type = '';

-- Vérification des résultats
SELECT type, COUNT(*) as count 
FROM public.workouts 
GROUP BY type 
ORDER BY type;