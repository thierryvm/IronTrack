-- =====================================================
-- FIX SUPPORT_TICKETS CONSTRAINT NAME
-- =====================================================

-- Verifier et corriger le nom de la contrainte foreign key
DO $$
DECLARE
    constraint_exists BOOLEAN;
    current_constraint_name TEXT;
BEGIN
    -- Chercher le nom actuel de la contrainte
    SELECT tc.constraint_name INTO current_constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'support_tickets' 
    AND kcu.column_name = 'user_id'
    AND tc.constraint_type = 'FOREIGN KEY'
    LIMIT 1;
    
    IF current_constraint_name IS NOT NULL THEN
        RAISE NOTICE 'Contrainte actuelle trouvee: %', current_constraint_name;
        
        -- Si le nom n'est pas le bon, le renommer
        IF current_constraint_name != 'support_tickets_user_id_fkey' THEN
            EXECUTE format('ALTER TABLE support_tickets RENAME CONSTRAINT %I TO support_tickets_user_id_fkey', current_constraint_name);
            RAISE NOTICE 'Contrainte renommee de % vers support_tickets_user_id_fkey', current_constraint_name;
        ELSE
            RAISE NOTICE 'Contrainte support_tickets_user_id_fkey existe deja avec le bon nom';
        END IF;
    ELSE
        RAISE NOTICE 'Aucune contrainte foreign key trouvee, creation...';
        ALTER TABLE support_tickets 
        ADD CONSTRAINT support_tickets_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
        RAISE NOTICE 'Contrainte support_tickets_user_id_fkey creee';
    END IF;
END $$;