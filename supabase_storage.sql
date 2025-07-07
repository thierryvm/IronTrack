-- =====================================================
-- CONFIGURATION STORAGE - IRONTRACK
-- =====================================================

-- Créer le bucket pour les avatars utilisateurs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Créer le bucket pour les images d'exercices
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'exercise-images',
    'exercise-images',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Créer le bucket pour les vidéos d'exercices
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'exercise-videos',
    'exercise-videos',
    true,
    52428800, -- 50MB
    ARRAY['video/mp4', 'video/webm', 'video/quicktime']
);

-- Créer le bucket pour les images de repas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'meal-images',
    'meal-images',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- =====================================================
-- POLITIQUES STORAGE
-- =====================================================

-- Politiques pour avatars
CREATE POLICY "Users can upload own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Anyone can view avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

-- Politiques pour exercise-images
CREATE POLICY "Users can upload exercise images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'exercise-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own exercise images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'exercise-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own exercise images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'exercise-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Anyone can view exercise images" ON storage.objects
    FOR SELECT USING (bucket_id = 'exercise-images');

-- Politiques pour exercise-videos
CREATE POLICY "Users can upload exercise videos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'exercise-videos' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own exercise videos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'exercise-videos' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own exercise videos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'exercise-videos' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Anyone can view exercise videos" ON storage.objects
    FOR SELECT USING (bucket_id = 'exercise-videos');

-- Politiques pour meal-images
CREATE POLICY "Users can upload meal images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'meal-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own meal images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'meal-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own meal images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'meal-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Anyone can view meal images" ON storage.objects
    FOR SELECT USING (bucket_id = 'meal-images'); 