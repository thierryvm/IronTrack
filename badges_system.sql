-- Système de badges pour IronTrack
-- À exécuter dans Supabase SQL Editor

-- Table des badges disponibles
CREATE TABLE IF NOT EXISTS badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT '🏅',
    color VARCHAR(20) DEFAULT 'gold',
    condition_type VARCHAR(50) NOT NULL, -- 'weekly_sessions', 'total_sessions', 'streak_days', etc.
    condition_value INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des badges obtenus par les utilisateurs
CREATE TABLE IF NOT EXISTS user_badges (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    badge_id INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);

-- Insérer les badges de base
INSERT INTO badges (name, description, icon, color, condition_type, condition_value) VALUES
('Déterminé', 'Complète 4 séances en une semaine', '🏅', 'gold', 'weekly_sessions', 4),
('Débutant', 'Complète ta première séance', '🌟', 'blue', 'total_sessions', 1),
('Assidu', 'Complète 10 séances au total', '💪', 'silver', 'total_sessions', 10),
('Champion', 'Complète 50 séances au total', '🏆', 'gold', 'total_sessions', 50),
('Série de feu', 'Maintiens une série de 7 jours', '🔥', 'red', 'streak_days', 7),
('Marathonien', 'Maintiens une série de 30 jours', '⚡', 'purple', 'streak_days', 30),
('Régulier', 'Complète 3 séances par semaine pendant 4 semaines', '📅', 'green', 'weekly_consistency', 3);

-- Politique de sécurité RLS (Row Level Security)
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Politique pour les badges (lecture publique)
CREATE POLICY "Badges are viewable by everyone" ON badges
    FOR SELECT USING (true);

-- Politique pour user_badges (utilisateur ne peut voir que ses propres badges)
CREATE POLICY "Users can view their own badges" ON user_badges
    FOR SELECT USING (auth.uid() = user_id);

-- Politique pour user_badges (insertion seulement par l'utilisateur)
CREATE POLICY "Users can insert their own badges" ON user_badges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fonction pour vérifier et attribuer les badges automatiquement
CREATE OR REPLACE FUNCTION check_and_award_badges(user_uuid UUID)
RETURNS TABLE(new_badges_count INTEGER) AS $$
DECLARE
    user_stats RECORD;
    badge_rec RECORD;
    badge_earned BOOLEAN;
BEGIN
    -- Récupérer les stats de l'utilisateur
    SELECT 
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN scheduled_date >= date_trunc('week', NOW()) THEN 1 END) as weekly_sessions,
        -- Calcul du streak (simplifié)
        0 as current_streak
    INTO user_stats
    FROM workouts 
    WHERE user_id = user_uuid AND status IN ('Réalisé', 'Terminé');

    -- Parcourir tous les badges
    FOR badge_rec IN SELECT * FROM badges LOOP
        badge_earned := FALSE;
        
        -- Vérifier les conditions selon le type
        CASE badge_rec.condition_type
            WHEN 'total_sessions' THEN
                IF user_stats.total_sessions >= badge_rec.condition_value THEN
                    badge_earned := TRUE;
                END IF;
            WHEN 'weekly_sessions' THEN
                IF user_stats.weekly_sessions >= badge_rec.condition_value THEN
                    badge_earned := TRUE;
                END IF;
            -- Ajouter d'autres conditions selon les besoins
        END CASE;
        
        -- Attribuer le badge s'il est mérité et pas encore obtenu
        IF badge_earned THEN
            INSERT INTO user_badges (user_id, badge_id)
            VALUES (user_uuid, badge_rec.id)
            ON CONFLICT (user_id, badge_id) DO NOTHING;
        END IF;
    END LOOP;
    
    -- Retourner le nombre de nouveaux badges
    SELECT COUNT(*) INTO new_badges_count FROM user_badges WHERE user_id = user_uuid;
    RETURN QUERY SELECT new_badges_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vue pour récupérer facilement les badges d'un utilisateur
CREATE OR REPLACE VIEW user_badges_view AS
SELECT 
    ub.user_id,
    ub.earned_at,
    b.name,
    b.description,
    b.icon,
    b.color,
    b.condition_type,
    b.condition_value
FROM user_badges ub
JOIN badges b ON ub.badge_id = b.id
ORDER BY ub.earned_at DESC;

-- Politique pour la vue
CREATE POLICY "Users can view their own badges in view" ON user_badges_view
    FOR SELECT USING (auth.uid() = user_id);

COMMIT;