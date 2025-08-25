-- Crear tabla de calificaciones
CREATE TABLE IF NOT EXISTS calificaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consultorio_id UUID REFERENCES consultorios(id) ON DELETE CASCADE NOT NULL,
  usuario_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reserva_id UUID REFERENCES reservas(id) ON DELETE SET NULL,
  
  -- Calificación
  puntuacion INTEGER NOT NULL CHECK (puntuacion >= 1 AND puntuacion <= 5),
  comentario TEXT,
  
  -- Desglose de calificación
  limpieza INTEGER CHECK (limpieza >= 1 AND limpieza <= 5),
  ubicacion INTEGER CHECK (ubicacion >= 1 AND ubicacion <= 5),
  equipamiento INTEGER CHECK (equipamiento >= 1 AND equipamiento <= 5),
  atencion INTEGER CHECK (atencion >= 1 AND atencion <= 5),
  relacion_precio INTEGER CHECK (relacion_precio >= 1 AND relacion_precio <= 5),
  
  -- Respuesta del propietario
  respuesta_propietario TEXT,
  fecha_respuesta TIMESTAMPTZ,
  
  -- Estado
  activo BOOLEAN DEFAULT TRUE,
  reportado BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un usuario solo puede calificar una vez por consultorio
  UNIQUE(usuario_id, consultorio_id)
);

-- Índices
CREATE INDEX idx_calificaciones_consultorio ON calificaciones(consultorio_id);
CREATE INDEX idx_calificaciones_usuario ON calificaciones(usuario_id);
CREATE INDEX idx_calificaciones_puntuacion ON calificaciones(puntuacion);

-- Habilitar RLS
ALTER TABLE calificaciones ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Anyone can view active calificaciones" ON calificaciones
  FOR SELECT USING (activo = true);

CREATE POLICY "Users can add calificaciones for completed reservas" ON calificaciones
  FOR INSERT WITH CHECK (
    usuario_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM reservas 
      WHERE id = reserva_id 
      AND usuario_id = auth.uid() 
      AND estado = 'completada'
    )
  );

CREATE POLICY "Users can update their own calificaciones" ON calificaciones
  FOR UPDATE USING (usuario_id = auth.uid());

CREATE POLICY "Owners can respond to calificaciones" ON calificaciones
  FOR UPDATE USING (
    consultorio_id IN (
      SELECT id FROM consultorios WHERE propietario_id = auth.uid()
    )
  );

-- Trigger para updated_at
CREATE TRIGGER update_calificaciones_updated_at 
  BEFORE UPDATE ON calificaciones 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar calificación promedio del consultorio
CREATE OR REPLACE FUNCTION update_consultorio_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE consultorios
    SET 
      calificacion_promedio = (
        SELECT ROUND(AVG(puntuacion)::numeric, 2)
        FROM calificaciones
        WHERE consultorio_id = NEW.consultorio_id AND activo = true
      ),
      total_calificaciones = (
        SELECT COUNT(*)
        FROM calificaciones
        WHERE consultorio_id = NEW.consultorio_id AND activo = true
      )
    WHERE id = NEW.consultorio_id;
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    UPDATE consultorios
    SET 
      calificacion_promedio = COALESCE((
        SELECT ROUND(AVG(puntuacion)::numeric, 2)
        FROM calificaciones
        WHERE consultorio_id = OLD.consultorio_id AND activo = true
      ), 0),
      total_calificaciones = (
        SELECT COUNT(*)
        FROM calificaciones
        WHERE consultorio_id = OLD.consultorio_id AND activo = true
      )
    WHERE id = OLD.consultorio_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar calificación del consultorio
CREATE TRIGGER update_consultorio_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON calificaciones
  FOR EACH ROW
  EXECUTE FUNCTION update_consultorio_rating();
