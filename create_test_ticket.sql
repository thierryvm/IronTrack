-- Script pour créer un ticket de test si aucun ticket n'existe
-- Ceci permet de tester le dashboard admin avec des données réelles

-- 1. Vérifier d'abord s'il existe déjà des tickets
DO $$
DECLARE
    ticket_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO ticket_count FROM support_tickets;
    
    -- Si aucun ticket n'existe, en créer un de test
    IF ticket_count = 0 THEN
        RAISE NOTICE 'Aucun ticket trouvé. Création d''un ticket de test...';
        
        INSERT INTO support_tickets (
            user_id,
            title,
            description,
            category,
            priority,
            status,
            created_at,
            updated_at,
            user_email
        ) VALUES (
            gen_random_uuid(), -- ID utilisateur fictif
            'Ticket de test - Dashboard Admin',
            'Ce ticket a été créé automatiquement pour tester les statistiques du dashboard admin. Il peut être supprimé après vérification.',
            'technical',
            'medium',
            'open',
            NOW(),
            NOW(),
            'test@irontrack.com'
        );
        
        RAISE NOTICE 'Ticket de test créé avec succès.';
    ELSE
        RAISE NOTICE 'Il existe déjà % ticket(s) dans la base.', ticket_count;
    END IF;
END $$;

-- 2. Afficher le résultat
SELECT 
    id,
    title,
    status,
    category,
    priority,
    created_at,
    user_email
FROM support_tickets 
ORDER BY created_at DESC 
LIMIT 3;

-- 3. Tester immédiatement la fonction RPC
SELECT 
    'Résultat du dashboard admin:' as info,
    open_tickets,
    in_progress_tickets,
    tickets_24h,
    tickets_7d
FROM get_admin_dashboard_stats();