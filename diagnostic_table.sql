-- Diagnostic: Vérifier la structure de la table partner_sharing_settings
-- Exécuter dans Supabase SQL Editor pour diagnostiquer les problèmes

-- 1. Vérifier si la table existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'partner_sharing_settings'
);

-- 2. Vérifier la structure de la table si elle existe
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'partner_sharing_settings'
ORDER BY ordinal_position;

-- 3. Vérifier les contraintes
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'partner_sharing_settings' 
AND tc.table_schema = 'public';

-- 4. Vérifier les politiques RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'partner_sharing_settings';

-- 5. Vérifier si RLS est activé
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'partner_sharing_settings';

-- 6. Compter les entrées existantes
SELECT COUNT(*) as total_entries FROM partner_sharing_settings;

-- 7. Vérifier s'il y a des doublons (user_id, partner_id)
SELECT user_id, partner_id, COUNT(*) as count
FROM partner_sharing_settings
GROUP BY user_id, partner_id
HAVING COUNT(*) > 1;

-- 8. Vérifier les données récentes
SELECT * FROM partner_sharing_settings
ORDER BY created_at DESC
LIMIT 10;