-- Crear tabla de reservas
CREATE TABLE IF NOT EXISTS reservas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consultorio_id UUID REFERENCES consultorios(id) ON DELETE CASCADE NOT NULL,
  usuario_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Fechas y horarios
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  
  -- Tipo de reserva
  tipo_reserva TEXT NOT NULL CHECK (tipo_reserva IN ('hora', 'dia', 'mes')) DEFAULT 'hora',
  
  -- Costos
  precio_por_unidad DECIMAL(10,2) NOT NULL, -- Precio por hora/día/mes
  unidades INTEGER NOT NULL DEFAULT 1, -- Cantidad de horas/días/meses
  descuento DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL,
  impuestos DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  
  -- Estado de la reserva
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'completada', 'en_progreso')),
  
  -- Información adicional
  notas_usuario TEXT,
  notas_propietario TEXT,
  motivo_cancelacion TEXT,
  
  -- Pago
  metodo_pago TEXT,
  referencia_pago TEXT,
  fecha_pago TIMESTAMPTZ,
  
  -- Fechas de control
  fecha_confirmacion TIMESTAMPTZ,
  fecha_cancelacion TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_reservas_consultorio ON reservas(consultorio_id);
CREATE INDEX idx_reservas_usuario ON reservas(usuario_id);
CREATE INDEX idx_reservas_fecha_inicio ON reservas(fecha_inicio);
CREATE INDEX idx_reservas_estado ON reservas(estado);

-- Habilitar RLS
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Users can view their own reservas" ON reservas
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Owners can view reservas for their consultorios" ON reservas
  FOR SELECT USING (
    consultorio_id IN (
      SELECT id FROM consultorios WHERE propietario_id = auth.uid()
    )
  );

CREATE POLICY "Users can create reservas" ON reservas
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Users can update their own reservas" ON reservas
  FOR UPDATE USING (usuario_id = auth.uid());

CREATE POLICY "Owners can update reservas for their consultorios" ON reservas
  FOR UPDATE USING (
    consultorio_id IN (
      SELECT id FROM consultorios WHERE propietario_id = auth.uid()
    )
  );

-- Trigger para updated_at
CREATE TRIGGER update_reservas_updated_at 
  BEFORE UPDATE ON reservas 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Función para validar disponibilidad
CREATE OR REPLACE FUNCTION check_availability(
  p_consultorio_id UUID,
  p_fecha_inicio DATE,
  p_fecha_fin DATE,
  p_hora_inicio TIME,
  p_hora_fin TIME,
  p_reserva_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  conflicto_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO conflicto_count
  FROM reservas
  WHERE consultorio_id = p_consultorio_id
    AND estado IN ('confirmada', 'en_progreso')
    AND (
      (fecha_inicio, fecha_fin) OVERLAPS (p_fecha_inicio, p_fecha_fin)
      AND (hora_inicio, hora_fin) OVERLAPS (p_hora_inicio, p_hora_fin)
    )
    AND (p_reserva_id IS NULL OR id != p_reserva_id);
  
  RETURN conflicto_count = 0;
END;
$$ LANGUAGE plpgsql;
