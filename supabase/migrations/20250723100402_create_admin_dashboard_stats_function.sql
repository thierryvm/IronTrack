-- ============================================================================
-- FONCTION RPC MANQUANTE: get_admin_dashboard_stats
-- Cette fonction est appelee par l'API admin mais n'existe pas dans la BDD
-- ============================================================================

-- 1. Supprimer l'ancienne fonction si elle existe avec un type different
DROP FUNCTION IF EXISTS get_admin_dashboard_stats();

-- 2. Creer la fonction RPC pour les statistiques admin dashboard
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS TABLE (
    open_tickets INTEGER,
    in_progress_tickets INTEGER,
    tickets_24h INTEGER,
    tickets_7d INTEGER,
    new_users_24h INTEGER,
    new_users_7d INTEGER,
    admin_users INTEGER,
    workouts_24h INTEGER,
    workouts_7d INTEGER
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = 'public'
AS $$
DECLARE
    now_timestamp TIMESTAMPTZ := NOW();
    yesterday_timestamp TIMESTAMPTZ := NOW() - INTERVAL '24 hours';
    week_ago_timestamp TIMESTAMPTZ := NOW() - INTERVAL '7 days';
BEGIN
    RETURN QUERY
    SELECT 
        -- Tickets ouverts
        (SELECT COUNT(*) FROM support_tickets WHERE status = 'open')::INTEGER as open_tickets,
        
        -- Tickets en cours
        (SELECT COUNT(*) FROM support_tickets WHERE status = 'in_progress')::INTEGER as in_progress_tickets,
        
        -- Tickets crees dans les 24h
        (SELECT COUNT(*) FROM support_tickets WHERE created_at >= yesterday_timestamp)::INTEGER as tickets_24h,
        
        -- Tickets crees dans les 7 jours
        (SELECT COUNT(*) FROM support_tickets WHERE created_at >= week_ago_timestamp)::INTEGER as tickets_7d,
        
        -- Nouveaux utilisateurs 24h (base sur created_at des profiles)
        (SELECT COUNT(*) FROM profiles WHERE created_at >= yesterday_timestamp)::INTEGER as new_users_24h,
        
        -- Nouveaux utilisateurs 7 jours
        (SELECT COUNT(*) FROM profiles WHERE created_at >= week_ago_timestamp)::INTEGER as new_users_7d,
        
        -- Nombre d'utilisateurs admin (tous roles admin actifs)
        (SELECT COUNT(DISTINCT user_id) FROM user_roles 
         WHERE role IN ('admin', 'super_admin', 'moderator') 
         AND is_active = true
         AND (expires_at IS NULL OR expires_at > now_timestamp))::INTEGER as admin_users,
        
        -- Workouts des 24h (estimation via workout_exercises)
        (SELECT COUNT(*) FROM workout_exercises WHERE created_at >= yesterday_timestamp)::INTEGER as workouts_24h,
        
        -- Workouts des 7 jours
        (SELECT COUNT(*) FROM workout_exercises WHERE created_at >= week_ago_timestamp)::INTEGER as workouts_7d;
END;
$$;

-- 3. Accorder les permissions
GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats() TO authenticated;

-- 4. Commentaire pour documentation
COMMENT ON FUNCTION get_admin_dashboard_stats() IS 
'Recupere les statistiques du dashboard admin: tickets, utilisateurs, workouts. Utilise par /api/admin/stats pour afficher les metriques en temps reel.';