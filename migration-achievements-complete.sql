-- ============================================
-- MIGRATION COMPLÈTE DE LA TABLE ACHIEVEMENTS
-- ============================================
-- Auteur: Claude Code
-- Date: 2025-07-13
-- Objectif: Corriger la structure de la table achievements et ajouter les colonnes manquantes

-- 1. Ajouter les colonnes manquantes
-- ----------------------------------

-- Ajouter la colonne status avec contrainte
ALTER TABLE public.achievements 
ADD COLUMN IF NOT EXISTS status TEXT 
CHECK (status IN ('En cours', 'Validé', 'Débloqué')) 
DEFAULT 'En cours';

-- Ajouter la colonne goal_id avec référence vers training_goals
ALTER TABLE public.achievements 
ADD COLUMN IF NOT EXISTS goal_id INTEGER 
REFERENCES public.training_goals(id) ON DELETE CASCADE;

-- 2. Créer les index pour optimiser les performances
-- -------------------------------------------------

-- Index pour les requêtes par goal_id
CREATE INDEX IF NOT EXISTS idx_achievements_goal_id 
ON public.achievements(goal_id);

-- Index pour les requêtes par status
CREATE INDEX IF NOT EXISTS idx_achievements_status 
ON public.achievements(status);

-- Index composite pour les requêtes combinées
CREATE INDEX IF NOT EXISTS idx_achievements_user_goal 
ON public.achievements(user_id, goal_id);

-- Index pour détecter les doublons
CREATE INDEX IF NOT EXISTS idx_achievements_duplicates 
ON public.achievements(user_id, goal_id, status);

-- 3. Vérifier et corriger les politiques RLS
-- ------------------------------------------

-- Politique pour permettre aux utilisateurs de voir leurs propres achievements
DROP POLICY IF EXISTS "Users can view own achievements" ON public.achievements;
CREATE POLICY "Users can view own achievements" 
ON public.achievements FOR SELECT 
USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de créer leurs propres achievements  
DROP POLICY IF EXISTS "Users can insert own achievements" ON public.achievements;
CREATE POLICY "Users can insert own achievements" 
ON public.achievements FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de modifier leurs propres achievements
DROP POLICY IF EXISTS "Users can update own achievements" ON public.achievements;
CREATE POLICY "Users can update own achievements" 
ON public.achievements FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de supprimer leurs propres achievements
DROP POLICY IF EXISTS "Users can delete own achievements" ON public.achievements;
CREATE POLICY "Users can delete own achievements" 
ON public.achievements FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Créer une contrainte unique pour éviter les doublons
-- ------------------------------------------------------

-- Contrainte unique pour éviter les doublons (user_id, goal_id)
-- Remarque: Cette contrainte empêchera les doublons futurs
-- Pour les doublons existants, ils doivent être nettoyés avant d'appliquer cette contrainte
-- ALTER TABLE public.achievements 
-- ADD CONSTRAINT unique_user_goal 
-- UNIQUE (user_id, goal_id);

-- 5. Fonction utilitaire pour détecter les doublons
-- ------------------------------------------------

-- Fonction pour identifier les achievements en doublon
CREATE OR REPLACE FUNCTION public.find_achievement_duplicates()
RETURNS TABLE (
    user_id UUID,
    goal_id INTEGER,
    duplicate_count BIGINT,
    achievement_ids INTEGER[]
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT 
        a.user_id,
        a.goal_id,
        COUNT(*) as duplicate_count,
        ARRAY_AGG(a.id ORDER BY 
            CASE 
                WHEN a.status = 'Validé' THEN 1
                WHEN a.status = 'En cours' THEN 2  
                WHEN a.status = 'Débloqué' THEN 3
                ELSE 4
            END,
            a.created_at ASC
        ) as achievement_ids
    FROM public.achievements a
    WHERE a.goal_id IS NOT NULL
    GROUP BY a.user_id, a.goal_id
    HAVING COUNT(*) > 1;
$$;

-- 6. Fonction pour nettoyer les doublons automatiquement
-- -----------------------------------------------------

-- Fonction pour supprimer les achievements en doublon (garde le meilleur)
CREATE OR REPLACE FUNCTION public.clean_achievement_duplicates()
RETURNS TABLE (
    deleted_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    duplicate_record RECORD;
    ids_to_delete INTEGER[];
    total_deleted INTEGER := 0;
BEGIN
    -- Pour chaque groupe de doublons
    FOR duplicate_record IN 
        SELECT * FROM public.find_achievement_duplicates()
    LOOP
        -- Garder le premier ID (le meilleur selon le tri) et supprimer les autres
        ids_to_delete := duplicate_record.achievement_ids[2:array_length(duplicate_record.achievement_ids, 1)];
        
        -- Supprimer les doublons
        DELETE FROM public.achievements 
        WHERE id = ANY(ids_to_delete);
        
        -- Compter les suppressions
        total_deleted := total_deleted + array_length(ids_to_delete, 1);
        
        -- Log pour débogage
        RAISE NOTICE 'Nettoyé % doublons pour user_id=%, goal_id=%', 
            array_length(ids_to_delete, 1), 
            duplicate_record.user_id, 
            duplicate_record.goal_id;
    END LOOP;
    
    RETURN QUERY SELECT total_deleted;
END;
$$;

-- 7. Commentaires sur les colonnes
-- --------------------------------

COMMENT ON COLUMN public.achievements.status IS 'Statut du badge: En cours, Validé, ou Débloqué';
COMMENT ON COLUMN public.achievements.goal_id IS 'Référence vers l''objectif d''entraînement associé';

-- 8. Instructions post-migration
-- ------------------------------

-- Après avoir exécuté cette migration:
-- 1. Exécuter: SELECT * FROM public.find_achievement_duplicates();
-- 2. Si des doublons existent: SELECT public.clean_achievement_duplicates();
-- 3. Puis ajouter la contrainte unique: 
--    ALTER TABLE public.achievements ADD CONSTRAINT unique_user_goal UNIQUE (user_id, goal_id);
-- 4. Tester la création d'achievements via l'application

-- ============================================
-- FIN DE LA MIGRATION
-- ============================================