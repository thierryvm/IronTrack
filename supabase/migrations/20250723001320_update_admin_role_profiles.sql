-- =====================================================
-- UPDATE ADMIN ROLE IN PROFILES TABLE
-- =====================================================

-- Mettre a jour le role admin dans profiles
UPDATE profiles 
SET role = 'super_admin' 
WHERE email = 'thierryvm@hotmail.com';

-- Verifier le resultat
DO $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role 
    FROM profiles 
    WHERE email = 'thierryvm@hotmail.com';
    
    IF user_role = 'super_admin' THEN
        RAISE NOTICE 'SUCCES: Role super_admin configure pour thierryvm@hotmail.com';
    ELSE
        RAISE NOTICE 'PROBLEME: Role actuel = %', COALESCE(user_role, 'NULL');
    END IF;
END $$;