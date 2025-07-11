-- =====================================================
-- SCHEMA IRONTRACK - Configuration complète
-- =====================================================

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES PRINCIPALES
-- =====================================================

-- Table des utilisateurs (extension de auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    location TEXT,
    avatar_url TEXT,
    height INTEGER, -- en cm
    weight DECIMAL(5,2), -- en kg
    age INTEGER,
    gender TEXT CHECK (gender IN ('Homme', 'Femme', 'Autre')),
    goal TEXT CHECK (goal IN ('Prise de masse', 'Perte de poids', 'Maintien', 'Performance')),
    experience TEXT CHECK (experience IN ('Débutant', 'Intermédiaire', 'Avancé')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des groupes musculaires
CREATE TABLE public.muscle_groups (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#f97316',
    icon TEXT DEFAULT 'Dumbbell',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des équipements
CREATE TABLE public.equipment (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des exercices
CREATE TABLE public.exercises (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    exercise_type TEXT CHECK (exercise_type IN ('Musculation', 'Cardio')) DEFAULT 'Musculation',
    muscle_group TEXT, -- Groupe musculaire en texte (pour compatibilité avec l'UI actuelle)
    muscle_group_id INTEGER REFERENCES public.muscle_groups(id),
    equipment_id INTEGER REFERENCES public.equipment(id),
    difficulty TEXT CHECK (difficulty IN ('Débutant', 'Intermédiaire', 'Avancé')) DEFAULT 'Intermédiaire',
    
    -- Champs pour Musculation
    sets INTEGER DEFAULT 3,
    
    -- Champs pour Cardio
    distance DECIMAL(8,2), -- Distance (km, m, miles)
    distance_unit TEXT DEFAULT 'km',
    speed DECIMAL(6,2), -- Vitesse (km/h, m/s, mph)
    speed_unit TEXT DEFAULT 'km/h',
    calories INTEGER, -- Calories brûlées
    
    -- Champs communs
    duration_minutes INTEGER, -- Durée en minutes
    duration_seconds INTEGER, -- Durée en secondes
    
    -- Champs existants
    description TEXT,
    instructions TEXT,
    video_url TEXT,
    image_url TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des séances d'entraînement
CREATE TABLE public.workouts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('Musculation', 'Cardio', 'Étirement', 'Repos')) DEFAULT 'Musculation',
    status TEXT CHECK (status IN ('Planifié', 'En cours', 'Terminé', 'Annulé')) DEFAULT 'Planifié',
    scheduled_date DATE,
    start_time TIME,
    end_time TIME,
    duration INTEGER, -- en minutes
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des exercices dans une séance
CREATE TABLE public.workout_exercises (
    id SERIAL PRIMARY KEY,
    workout_id INTEGER REFERENCES public.workouts(id) ON DELETE CASCADE,
    exercise_id INTEGER REFERENCES public.exercises(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    sets INTEGER DEFAULT 3,
    reps INTEGER,
    weight DECIMAL(6,2), -- en kg
    duration INTEGER, -- en secondes
    rest_time INTEGER, -- en secondes
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des performances (historique des séries)
CREATE TABLE public.performance_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    exercise_id INTEGER REFERENCES public.exercises(id) ON DELETE CASCADE,
    workout_id INTEGER REFERENCES public.workouts(id) ON DELETE SET NULL,
    set_number INTEGER,
    reps INTEGER,
    weight DECIMAL(6,2), -- en kg
    duration INTEGER, -- en secondes
    rest_time INTEGER, -- en secondes
    rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10), -- Rate of Perceived Exertion
    notes TEXT,
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des repas
CREATE TABLE public.meals (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('Petit-déjeuner', 'Déjeuner', 'Dîner', 'Collation')) NOT NULL,
    calories INTEGER,
    protein DECIMAL(6,2), -- en grammes
    carbs DECIMAL(6,2), -- en grammes
    fat DECIMAL(6,2), -- en grammes
    fiber DECIMAL(6,2), -- en grammes
    sugar DECIMAL(6,2), -- en grammes
    sodium DECIMAL(6,2), -- en mg
    meal_date DATE NOT NULL,
    meal_time TIME,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des objectifs nutritionnels
CREATE TABLE public.nutrition_goals (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    calories INTEGER NOT NULL,
    protein DECIMAL(6,2) NOT NULL, -- en grammes
    carbs DECIMAL(6,2) NOT NULL, -- en grammes
    fat DECIMAL(6,2) NOT NULL, -- en grammes
    fiber DECIMAL(6,2), -- en grammes
    sugar DECIMAL(6,2), -- en grammes
    sodium DECIMAL(6,2), -- en mg
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des objectifs d'entraînement
CREATE TABLE public.training_goals (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    exercise_id INTEGER REFERENCES public.exercises(id) ON DELETE CASCADE,
    target_weight DECIMAL(6,2), -- en kg
    target_reps INTEGER,
    target_sets INTEGER,
    target_date DATE,
    current_progress DECIMAL(6,2) DEFAULT 0,
    status TEXT CHECK (status IN ('En cours', 'Atteint', 'Abandonné')) DEFAULT 'En cours',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des badges et récompenses
CREATE TABLE public.achievements (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    category TEXT CHECK (category IN ('Séances', 'Force', 'Endurance', 'Consistance', 'Objectifs')),
    criteria JSONB, -- critères pour débloquer le badge
    unlocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des paramètres utilisateur
CREATE TABLE public.user_settings (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    theme TEXT DEFAULT 'light',
    language TEXT DEFAULT 'fr',
    notifications_enabled BOOLEAN DEFAULT true,
    workout_reminders BOOLEAN DEFAULT true,
    nutrition_reminders BOOLEAN DEFAULT true,
    goal_reminders BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES POUR LES PERFORMANCES
-- =====================================================

-- Index pour les requêtes fréquentes
CREATE INDEX idx_exercises_user_id ON public.exercises(user_id);
CREATE INDEX idx_workouts_user_id ON public.workouts(user_id);
CREATE INDEX idx_workouts_scheduled_date ON public.workouts(scheduled_date);
CREATE INDEX idx_performance_logs_user_id ON public.performance_logs(user_id);
CREATE INDEX idx_performance_logs_exercise_id ON public.performance_logs(exercise_id);
CREATE INDEX idx_performance_logs_performed_at ON public.performance_logs(performed_at);
CREATE INDEX idx_meals_user_id ON public.meals(user_id);
CREATE INDEX idx_meals_meal_date ON public.meals(meal_date);
CREATE INDEX idx_training_goals_user_id ON public.training_goals(user_id);

-- =====================================================
-- FONCTIONS ET TRIGGERS
-- =====================================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON public.exercises FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON public.workouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meals_updated_at BEFORE UPDATE ON public.meals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nutrition_goals_updated_at BEFORE UPDATE ON public.nutrition_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_goals_updated_at BEFORE UPDATE ON public.training_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement le profil
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- DONNÉES INITIALES
-- =====================================================

-- Insérer les groupes musculaires par défaut
INSERT INTO public.muscle_groups (name, description, color, icon) VALUES
('Pectoraux', 'Muscles de la poitrine', '#FF6B6B', 'Dumbbell'),
('Dos', 'Muscles du dos', '#4ECDC4', 'Target'),
('Épaules', 'Muscles des épaules', '#45B7D1', 'Target'),
('Biceps', 'Muscles des bras avant', '#96CEB4', 'Target'),
('Triceps', 'Muscles des bras arrière', '#FFEAA7', 'Target'),
('Jambes', 'Muscles des jambes', '#DDA0DD', 'Target'),
('Abdominaux', 'Muscles du ventre', '#98D8C8', 'Target'),
('Fessiers', 'Muscles des fesses', '#F7DC6F', 'Target');

-- Insérer les équipements par défaut
INSERT INTO public.equipment (name, description) VALUES
('Barre + banc', 'Barre d''haltérophilie avec banc de musculation'),
('Barre libre', 'Barre d''haltérophilie sans support'),
('Haltères', 'Haltères libres'),
('Machine', 'Machine de musculation'),
('Câble', 'Machine à câbles'),
('Barre de traction', 'Barre fixe pour tractions'),
('Poids du corps', 'Exercices sans matériel'),
('Élastiques', 'Bandes élastiques de résistance'),
('Kettlebell', 'Haltère russe'),
('Ballon de gym', 'Ballon de stabilité');

-- =====================================================
-- POLITIQUES RLS (Row Level Security)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Politiques pour profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Politiques pour exercises
CREATE POLICY "Users can view own exercises" ON public.exercises FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can insert own exercises" ON public.exercises FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own exercises" ON public.exercises FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own exercises" ON public.exercises FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour workouts
CREATE POLICY "Users can view own workouts" ON public.workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workouts" ON public.workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workouts" ON public.workouts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workouts" ON public.workouts FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour workout_exercises
CREATE POLICY "Users can view own workout exercises" ON public.workout_exercises FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.workouts WHERE id = workout_exercises.workout_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert own workout exercises" ON public.workout_exercises FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.workouts WHERE id = workout_exercises.workout_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update own workout exercises" ON public.workout_exercises FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.workouts WHERE id = workout_exercises.workout_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete own workout exercises" ON public.workout_exercises FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.workouts WHERE id = workout_exercises.workout_id AND user_id = auth.uid())
);

-- Politiques pour performance_logs
CREATE POLICY "Users can view own performance logs" ON public.performance_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own performance logs" ON public.performance_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own performance logs" ON public.performance_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own performance logs" ON public.performance_logs FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour meals
CREATE POLICY "Users can view own meals" ON public.meals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meals" ON public.meals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meals" ON public.meals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meals" ON public.meals FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour nutrition_goals
CREATE POLICY "Users can view own nutrition goals" ON public.nutrition_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own nutrition goals" ON public.nutrition_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own nutrition goals" ON public.nutrition_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own nutrition goals" ON public.nutrition_goals FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour training_goals
CREATE POLICY "Users can view own training goals" ON public.training_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own training goals" ON public.training_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own training goals" ON public.training_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own training goals" ON public.training_goals FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour achievements
CREATE POLICY "Users can view own achievements" ON public.achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques pour user_settings
CREATE POLICY "Users can view own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- COMMENTAIRES FINAUX
-- =====================================================

COMMENT ON TABLE public.profiles IS 'Profils utilisateurs étendus';
COMMENT ON TABLE public.exercises IS 'Exercices de musculation';
COMMENT ON TABLE public.workouts IS 'Séances d''entraînement';
COMMENT ON TABLE public.performance_logs IS 'Historique des performances';
COMMENT ON TABLE public.meals IS 'Repas et nutrition';
COMMENT ON TABLE public.training_goals IS 'Objectifs d''entraînement';
COMMENT ON TABLE public.achievements IS 'Badges et récompenses';

-- =====================================================
-- MIGRATIONS POUR LES NOUVEAUX CHAMPS EXERCISES
-- =====================================================

-- Ajouter les nouveaux champs à la table exercises existante
-- (À exécuter si la table existe déjà)

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