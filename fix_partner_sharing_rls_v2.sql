-- Étape par étape pour corriger les policies RLS

-- 1. Supprimer toutes les policies existantes
DROP POLICY IF EXISTS "Users can manage their sharing settings" ON partner_sharing_settings;
DROP POLICY IF EXISTS "Users can manage their own sharing settings" ON partner_sharing_settings;
DROP POLICY IF EXISTS "Users can view partners sharing settings" ON partner_sharing_settings;

-- 2. Créer la policy pour gérer ses propres paramètres
CREATE POLICY "Users can manage their own sharing settings" ON partner_sharing_settings
    FOR ALL USING (auth.uid() = user_id);

-- 3. Créer la policy pour voir les paramètres des partenaires acceptés
CREATE POLICY "Users can view partners sharing settings" ON partner_sharing_settings
    FOR SELECT USING (
        auth.uid() = partner_id AND 
        EXISTS (
            SELECT 1 FROM training_partners tp 
            WHERE tp.status = 'accepted' 
            AND (
                (tp.requester_id = auth.uid() AND tp.partner_id = partner_sharing_settings.user_id) OR
                (tp.partner_id = auth.uid() AND tp.requester_id = partner_sharing_settings.user_id)
            )
        )
    );

-- 4. Vérifier que RLS est activé
ALTER TABLE partner_sharing_settings ENABLE ROW LEVEL SECURITY;