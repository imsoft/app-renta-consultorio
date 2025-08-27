-- Corregir la función get_available_slots para evitar ambigüedad en columnas
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
  SELECT c.horario_apertura, c.horario_cierre, c.dias_disponibles
  INTO consultorio_record
  FROM consultorios c
  WHERE c.id = p_consultorio_id AND c.activo = true;
  
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
