-- =====================================================
-- MIGRATION POUR LES NOUVEAUX CHAMPS EXERCISES
-- Support des types Musculation/Cardio et champs dynamiques
-- =====================================================

-- Ajouter les nouveaux champs à la table exercises existante

-- Type d'exercice
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS exercise_type TEXT CHECK (exercise_type IN ('Musculation', 'Cardio')) DEFAULT 'Musculation';

-- Groupe musculaire en texte (pour compatibilité avec l'UI actuelle)
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS muscle_group TEXT;

-- Champs pour Musculation
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS sets INTEGER DEFAULT 3;

-- Champs pour Cardio
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS distance DECIMAL(8,2);
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS distance_unit TEXT DEFAULT 'km';
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS speed DECIMAL(6,2);
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS speed_unit TEXT DEFAULT 'km/h';
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS calories INTEGER;

-- Champs communs pour durée
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;

-- Mettre à jour les exercices existants pour avoir un type par défaut
UPDATE public.exercises SET exercise_type = 'Musculation' WHERE exercise_type IS NULL;

-- Mettre à jour les groupes musculaires existants
UPDATE public.exercises SET muscle_group = 'Pectoraux' WHERE muscle_group IS NULL AND muscle_group_id IS NOT NULL;
UPDATE public.exercises SET muscle_group = 'Dos' WHERE muscle_group IS NULL AND muscle_group_id = (SELECT id FROM public.muscle_groups WHERE name = 'Dos');
UPDATE public.exercises SET muscle_group = 'Épaules' WHERE muscle_group IS NULL AND muscle_group_id = (SELECT id FROM public.muscle_groups WHERE name = 'Épaules');
UPDATE public.exercises SET muscle_group = 'Biceps' WHERE muscle_group IS NULL AND muscle_group_id = (SELECT id FROM public.muscle_groups WHERE name = 'Biceps');
UPDATE public.exercises SET muscle_group = 'Triceps' WHERE muscle_group IS NULL AND muscle_group_id = (SELECT id FROM public.muscle_groups WHERE name = 'Triceps');
UPDATE public.exercises SET muscle_group = 'Jambes' WHERE muscle_group IS NULL AND muscle_group_id = (SELECT id FROM public.muscle_groups WHERE name = 'Jambes');
UPDATE public.exercises SET muscle_group = 'Abdominaux' WHERE muscle_group IS NULL AND muscle_group_id = (SELECT id FROM public.muscle_groups WHERE name = 'Abdominaux');
UPDATE public.exercises SET muscle_group = 'Fessiers' WHERE muscle_group IS NULL AND muscle_group_id = (SELECT id FROM public.muscle_groups WHERE name = 'Fessiers');

-- Commentaires pour documenter les nouveaux champs
COMMENT ON COLUMN public.exercises.exercise_type IS 'Type d''exercice: Musculation ou Cardio';
COMMENT ON COLUMN public.exercises.muscle_group IS 'Groupe musculaire en texte (compatibilité UI)';
COMMENT ON COLUMN public.exercises.sets IS 'Nombre de séries (pour musculation)';
COMMENT ON COLUMN public.exercises.distance IS 'Distance parcourue (pour cardio)';
COMMENT ON COLUMN public.exercises.distance_unit IS 'Unité de distance (km, m, miles)';
COMMENT ON COLUMN public.exercises.speed IS 'Vitesse (pour cardio)';
COMMENT ON COLUMN public.exercises.speed_unit IS 'Unité de vitesse (km/h, m/s, mph)';
COMMENT ON COLUMN public.exercises.calories IS 'Calories brûlées (pour cardio)';
COMMENT ON COLUMN public.exercises.duration_minutes IS 'Durée en minutes';
COMMENT ON COLUMN public.exercises.duration_seconds IS 'Durée en secondes';

-- =====================================================
-- MIGRATION TERMINÉE
-- ===================================================== 