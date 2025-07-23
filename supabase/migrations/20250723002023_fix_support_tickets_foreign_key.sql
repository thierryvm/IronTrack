-- =====================================================
-- FIX SUPPORT_TICKETS FOREIGN KEY RELATIONSHIP
-- =====================================================

-- Verifier la structure actuelle de support_tickets
DO $$
BEGIN
    -- Verifier si la table existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'support_tickets') THEN
        RAISE NOTICE 'Table support_tickets existe';
        
        -- Verifier si user_id existe et a une foreign key
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'support_tickets' AND column_name = 'user_id'
        ) THEN
            RAISE NOTICE 'Colonne user_id existe dans support_tickets';
            
            -- Verifier si la foreign key existe
            IF EXISTS (
                SELECT 1 FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
                WHERE tc.table_name = 'support_tickets' 
                AND kcu.column_name = 'user_id'
                AND tc.constraint_type = 'FOREIGN KEY'
            ) THEN
                RAISE NOTICE 'Foreign key user_id vers profiles existe deja';
            ELSE
                -- Ajouter la foreign key
                ALTER TABLE support_tickets 
                ADD CONSTRAINT support_tickets_user_id_fkey 
                FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
                
                RAISE NOTICE 'Foreign key support_tickets_user_id_fkey ajoutee';
            END IF;
        ELSE
            RAISE NOTICE 'ERREUR: Colonne user_id manquante dans support_tickets';
        END IF;
    ELSE
        -- Creer la table support_tickets si elle n'existe pas
        CREATE TABLE support_tickets (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
            priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
            category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('bug', 'feature', 'account', 'billing', 'general')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Activer RLS
        ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
        
        -- Politique: users voient leurs propres tickets
        CREATE POLICY "Users can view own tickets" ON support_tickets
            FOR SELECT TO authenticated
            USING (user_id = auth.uid());
            
        -- Politique: users peuvent creer leurs tickets
        CREATE POLICY "Users can create own tickets" ON support_tickets
            FOR INSERT TO authenticated
            WITH CHECK (user_id = auth.uid());
            
        RAISE NOTICE 'Table support_tickets creee avec foreign key';
    END IF;
END $$;