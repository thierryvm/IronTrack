-- =====================================================
-- VERIFICATION STRUCTURE TABLE PROFILES
-- =====================================================

-- Ajouter champ role a profiles si manquant
DO $$
BEGIN
    -- Verifier si le champ role existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'role'
        AND table_schema = 'public'
    ) THEN
        -- Ajouter le champ role
        ALTER TABLE profiles ADD COLUMN role TEXT CHECK (role IN ('user', 'moderator', 'admin', 'super_admin')) DEFAULT 'user';
        
        -- Mettre a jour le role pour l'admin principal
        UPDATE profiles 
        SET role = 'super_admin' 
        WHERE email = '***REDACTED_EMAIL***';
        
        RAISE NOTICE 'Champ role ajoute a la table profiles et admin configure';
    ELSE
        RAISE NOTICE 'Champ role existe deja dans profiles';
    END IF;
END $$;