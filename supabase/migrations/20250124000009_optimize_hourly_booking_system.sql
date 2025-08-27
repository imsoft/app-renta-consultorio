-- Optimización del sistema de reservas por horas
-- Esta migración mejora el sistema para manejar reservas específicamente por rangos de una hora

-- Función para generar slots de tiempo de una hora
CREATE OR REPLACE FUNCTION generate_hourly_slots(
  start_time TIME,
  end_time TIME
) RETURNS TIME[] AS $$
DECLARE
  slots TIME[] := '{}';
  current_slot TIME := start_time;
BEGIN
  WHILE current_slot < end_time LOOP
    slots := array_append(slots, current_slot);
    current_slot := current_slot + INTERVAL '1 hour';
  END LOOP;
  
  RETURN slots;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener horarios disponibles de un consultorio en una fecha específica
CREATE OR REPLACE FUNCTION get_available_slots(
  p_consultorio_id UUID,
  p_fecha DATE,
  p_dia_semana TEXT DEFAULT NULL
)
RETURNS TABLE(
  hora_slot TIME,
  disponible BOOLEAN,
  reserva_id UUID
) AS $$
DECLARE
  consultorio_record RECORD;
  horario_apertura TIME;
  horario_cierre TIME;
  slots_generados TIME[];
  slot TIME;
  reserva_existente UUID;
BEGIN
  -- Obtener información del consultorio
  SELECT horario_apertura, horario_cierre, dias_disponibles
  INTO consultorio_record
  FROM consultorios 
  WHERE id = p_consultorio_id AND activo = true;
  
  -- Si no existe el consultorio o no está activo
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Determinar el día de la semana si no se proporciona
  IF p_dia_semana IS NULL THEN
    p_dia_semana := CASE EXTRACT(DOW FROM p_fecha)
      WHEN 1 THEN 'lunes'
      WHEN 2 THEN 'martes'
      WHEN 3 THEN 'miercoles'
      WHEN 4 THEN 'jueves'
      WHEN 5 THEN 'viernes'
      WHEN 6 THEN 'sabado'
      WHEN 0 THEN 'domingo'
    END;
  END IF;
  
  -- Verificar si el consultorio está disponible ese día
  IF NOT (p_dia_semana = ANY(consultorio_record.dias_disponibles)) THEN
    RETURN;
  END IF;
  
  -- Generar slots de una hora
  slots_generados := generate_hourly_slots(
    consultorio_record.horario_apertura, 
    consultorio_record.horario_cierre
  );
  
  -- Para cada slot, verificar disponibilidad
  FOREACH slot IN ARRAY slots_generados LOOP
    -- Verificar si hay una reserva en este slot
    SELECT r.id INTO reserva_existente
    FROM reservas r
    WHERE r.consultorio_id = p_consultorio_id
      AND r.fecha_inicio = p_fecha
      AND r.hora_inicio = slot
      AND r.estado IN ('confirmada', 'en_progreso', 'pendiente')
    LIMIT 1;
    
    -- Retornar el slot con su estado de disponibilidad
    hora_slot := slot;
    disponible := (reserva_existente IS NULL);
    reserva_id := reserva_existente;
    
    RETURN NEXT;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Función para crear una reserva de una hora
CREATE OR REPLACE FUNCTION create_hourly_reservation(
  p_consultorio_id UUID,
  p_usuario_id UUID,
  p_fecha DATE,
  p_hora_inicio TIME,
  p_notas_usuario TEXT DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  reserva_id UUID
) AS $$
DECLARE
  consultorio_record RECORD;
  nueva_reserva_id UUID;
  precio_hora DECIMAL(10,2);
  hora_fin TIME;
BEGIN
  -- Calcular hora de fin (una hora después)
  hora_fin := p_hora_inicio + INTERVAL '1 hour';
  
  -- Obtener información del consultorio
  SELECT c.precio_por_hora, c.activo, c.horario_apertura, c.horario_cierre
  INTO consultorio_record
  FROM consultorios c
  WHERE c.id = p_consultorio_id;
  
  -- Verificar si el consultorio existe y está activo
  IF NOT FOUND OR NOT consultorio_record.activo THEN
    success := false;
    message := 'Consultorio no encontrado o no está activo';
    reserva_id := NULL;
    RETURN NEXT;
    RETURN;
  END IF;
  
  -- Verificar que la hora esté dentro del horario de operación
  IF p_hora_inicio < consultorio_record.horario_apertura OR 
     hora_fin > consultorio_record.horario_cierre THEN
    success := false;
    message := 'La hora seleccionada está fuera del horario de operación';
    reserva_id := NULL;
    RETURN NEXT;
    RETURN;
  END IF;
  
  -- Verificar disponibilidad
  IF NOT check_availability(
    p_consultorio_id, 
    p_fecha, 
    p_fecha, 
    p_hora_inicio, 
    hora_fin
  ) THEN
    success := false;
    message := 'El horario seleccionado no está disponible';
    reserva_id := NULL;
    RETURN NEXT;
    RETURN;
  END IF;
  
  -- Crear la reserva
  INSERT INTO reservas (
    consultorio_id,
    usuario_id,
    fecha_inicio,
    fecha_fin,
    hora_inicio,
    hora_fin,
    tipo_reserva,
    precio_por_unidad,
    unidades,
    subtotal,
    total,
    notas_usuario,
    estado
  ) VALUES (
    p_consultorio_id,
    p_usuario_id,
    p_fecha,
    p_fecha,
    p_hora_inicio,
    hora_fin,
    'hora',
    consultorio_record.precio_por_hora,
    1,
    consultorio_record.precio_por_hora,
    consultorio_record.precio_por_hora,
    p_notas_usuario,
    'pendiente'
  ) RETURNING id INTO nueva_reserva_id;
  
  success := true;
  message := 'Reserva creada exitosamente';
  reserva_id := nueva_reserva_id;
  
  RETURN NEXT;
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener reservas de un día específico
CREATE OR REPLACE FUNCTION get_daily_reservations(
  p_consultorio_id UUID,
  p_fecha DATE
)
RETURNS TABLE(
  reserva_id UUID,
  usuario_id UUID,
  hora_inicio TIME,
  hora_fin TIME,
  estado TEXT,
  precio_total DECIMAL(10,2),
  notas_usuario TEXT,
  usuario_nombre TEXT,
  usuario_email TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id as reserva_id,
    r.usuario_id,
    r.hora_inicio,
    r.hora_fin,
    r.estado,
    r.total as precio_total,
    r.notas_usuario,
    p.full_name as usuario_nombre,
    p.email as usuario_email
  FROM reservas r
  JOIN profiles p ON p.id = r.usuario_id
  WHERE r.consultorio_id = p_consultorio_id
    AND r.fecha_inicio = p_fecha
  ORDER BY r.hora_inicio ASC;
END;
$$ LANGUAGE plpgsql;

-- Función para validar que las reservas sean de exactamente una hora
CREATE OR REPLACE FUNCTION validate_hourly_duration()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo aplicar validación para reservas de tipo 'hora'
  IF NEW.tipo_reserva = 'hora' THEN
    -- Verificar que sea exactamente una hora
    IF (NEW.hora_fin - NEW.hora_inicio) != INTERVAL '1 hour' THEN
      RAISE EXCEPTION 'Las reservas por hora deben ser de exactamente 1 hora de duración';
    END IF;
    
    -- Verificar que sea en la misma fecha
    IF NEW.fecha_inicio != NEW.fecha_fin THEN
      RAISE EXCEPTION 'Las reservas por hora deben ser en la misma fecha';
    END IF;
    
    -- Verificar que las unidades sean 1
    IF NEW.unidades != 1 THEN
      NEW.unidades := 1;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para validar duración de reservas por hora
DROP TRIGGER IF EXISTS validate_hourly_reservation ON reservas;
CREATE TRIGGER validate_hourly_reservation
  BEFORE INSERT OR UPDATE ON reservas
  FOR EACH ROW
  EXECUTE FUNCTION validate_hourly_duration();

-- Índices adicionales para optimizar consultas de horarios
CREATE INDEX IF NOT EXISTS idx_reservas_fecha_hora ON reservas(fecha_inicio, hora_inicio) WHERE tipo_reserva = 'hora';
CREATE INDEX IF NOT EXISTS idx_reservas_consultorio_fecha ON reservas(consultorio_id, fecha_inicio) WHERE estado IN ('confirmada', 'en_progreso', 'pendiente');

-- Política RLS adicional para las nuevas funciones
CREATE POLICY "Anyone can view availability" ON reservas
  FOR SELECT USING (
    -- Permitir ver reservas para verificar disponibilidad (solo datos básicos)
    estado IN ('confirmada', 'en_progreso')
  );

-- Comentarios para documentación
COMMENT ON FUNCTION generate_hourly_slots(TIME, TIME) IS 'Genera un array de slots de tiempo de una hora entre dos horarios';
COMMENT ON FUNCTION get_available_slots(UUID, DATE, TEXT) IS 'Obtiene todos los slots disponibles de un consultorio en una fecha específica';
COMMENT ON FUNCTION create_hourly_reservation(UUID, UUID, DATE, TIME, TEXT) IS 'Crea una reserva de una hora con validaciones automáticas';
COMMENT ON FUNCTION get_daily_reservations(UUID, DATE) IS 'Obtiene todas las reservas de un consultorio en una fecha específica';
COMMENT ON FUNCTION validate_hourly_duration() IS 'Trigger function para validar que las reservas por hora sean exactamente de 1 hora';
