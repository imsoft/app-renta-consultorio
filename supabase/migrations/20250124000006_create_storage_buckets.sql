-- Crear buckets de storage para imágenes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('consultorios', 'consultorios', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Políticas de storage para consultorios
CREATE POLICY "Consultorio images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'consultorios');

CREATE POLICY "Owners can upload consultorio images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'consultorios'
    AND EXISTS (
      SELECT 1 FROM consultorios 
      WHERE id::text = (storage.foldername(name))[1]
      AND propietario_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update consultorio images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'consultorios'
    AND EXISTS (
      SELECT 1 FROM consultorios 
      WHERE id::text = (storage.foldername(name))[1]
      AND propietario_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete consultorio images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'consultorios'
    AND EXISTS (
      SELECT 1 FROM consultorios 
      WHERE id::text = (storage.foldername(name))[1]
      AND propietario_id = auth.uid()
    )
  );
