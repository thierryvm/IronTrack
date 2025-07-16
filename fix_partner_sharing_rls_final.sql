-- Fix RLS policies for partner_sharing_settings (final version)
-- This script safely removes all existing policies and creates new ones

-- 1. Drop ALL existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can manage their sharing settings" ON partner_sharing_settings;
DROP POLICY IF EXISTS "Users can manage their own sharing settings" ON partner_sharing_settings;
DROP POLICY IF EXISTS "Users can view partners sharing settings" ON partner_sharing_settings;

-- 2. Create policy for managing own sharing settings
CREATE POLICY "Manage own sharing settings" ON partner_sharing_settings
    FOR ALL USING (auth.uid() = user_id);

-- 3. Create policy for viewing partner sharing settings
CREATE POLICY "View partner sharing settings" ON partner_sharing_settings
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

-- 4. Enable RLS
ALTER TABLE partner_sharing_settings ENABLE ROW LEVEL SECURITY;