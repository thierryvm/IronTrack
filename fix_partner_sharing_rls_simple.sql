-- Policy RLS simplifiée et sécurisée pour partner_sharing_settings

-- 1. Supprimer toutes les policies existantes
DROP POLICY IF EXISTS "Users can manage their sharing settings" ON partner_sharing_settings;
DROP POLICY IF EXISTS "Users can manage their own sharing settings" ON partner_sharing_settings;
DROP POLICY IF EXISTS "Users can view partners sharing settings" ON partner_sharing_settings;

-- 2. Policy pour gérer ses propres paramètres (CREATE, UPDATE, DELETE)
CREATE POLICY "Manage own sharing settings" ON partner_sharing_settings
    FOR ALL USING (auth.uid() = user_id);

-- 3. Policy simple pour voir les paramètres où on est le partenaire (SELECT seulement)
CREATE POLICY "View partner sharing settings" ON partner_sharing_settings
    FOR SELECT USING (auth.uid() = partner_id);

-- 4. Réactiver RLS
ALTER TABLE partner_sharing_settings ENABLE ROW LEVEL SECURITY;