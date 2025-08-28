-- Migración para agregar políticas de storage faltantes para consultorios
-- Fecha: 2025-01-24

-- Políticas de storage para consultorios (INSERT, UPDATE, DELETE)
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

-- Comentario sobre la migración
COMMENT ON POLICY "Owners can upload consultorio images" ON storage.objects IS 'Permite a los propietarios subir imágenes para sus consultorios';
COMMENT ON POLICY "Owners can update consultorio images" ON storage.objects IS 'Permite a los propietarios actualizar imágenes de sus consultorios';
COMMENT ON POLICY "Owners can delete consultorio images" ON storage.objects IS 'Permite a los propietarios eliminar imágenes de sus consultorios';
