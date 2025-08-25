-- Crear tabla de favoritos
CREATE TABLE IF NOT EXISTS favoritos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  consultorio_id UUID REFERENCES consultorios(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint para evitar duplicados
  UNIQUE(usuario_id, consultorio_id)
);

-- Índices
CREATE INDEX idx_favoritos_usuario ON favoritos(usuario_id);
CREATE INDEX idx_favoritos_consultorio ON favoritos(consultorio_id);

-- Habilitar RLS
ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Users can view their own favoritos" ON favoritos
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Users can add favoritos" ON favoritos
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Users can remove their favoritos" ON favoritos
  FOR DELETE USING (usuario_id = auth.uid());

-- Función para contar favoritos de un consultorio
CREATE OR REPLACE FUNCTION count_favoritos(consultorio_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  favorito_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO favorito_count
  FROM favoritos
  WHERE consultorio_id = consultorio_uuid;
  
  RETURN favorito_count;
END;
$$ LANGUAGE plpgsql;
