-- Script de vérification de la table support_tickets et test de la fonction RPC

-- 1. Vérifier la structure de la table support_tickets
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'support_tickets' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Vérifier s'il y a des données dans support_tickets
SELECT 
    COUNT(*) as total_tickets,
    COUNT(CASE WHEN status = 'open' THEN 1 END) as open_tickets,
    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tickets,
    COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_tickets
FROM support_tickets;

-- 3. Afficher les tickets récents (s'il y en a)
SELECT 
    id,
    title,
    status,
    category,
    priority,
    created_at,
    user_id
FROM support_tickets 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. Tester la fonction RPC get_admin_dashboard_stats
SELECT * FROM get_admin_dashboard_stats();

-- 5. Si pas de tickets, créer un ticket de test (OPTIONNEL - à décommenter si nécessaire)
/*
INSERT INTO support_tickets (
    user_id,
    title,
    description,
    category,
    priority,
    status,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(), -- ID utilisateur fictif
    'Ticket de test pour dashboard admin',
    'Ce ticket a été créé pour tester les statistiques du dashboard admin',
    'technical',
    'medium',
    'open',
    NOW(),
    NOW()
);
*/

-- 6. Vérifier les autres tables utilisées par la fonction
SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'user_roles' as table_name, COUNT(*) as count FROM user_roles
UNION ALL
SELECT 'workout_exercises' as table_name, COUNT(*) as count FROM workout_exercises;