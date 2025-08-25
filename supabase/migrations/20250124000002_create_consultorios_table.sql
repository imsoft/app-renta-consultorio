-- Crear tabla de consultorios
CREATE TABLE IF NOT EXISTS consultorios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  propietario_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  direccion TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  estado TEXT NOT NULL,
  codigo_postal TEXT,
  coordenadas POINT, -- Para geolocalización
  precio_por_hora DECIMAL(10,2) NOT NULL,
  precio_por_dia DECIMAL(10,2),
  precio_por_mes DECIMAL(10,2),
  
  -- Características del consultorio
  metros_cuadrados INTEGER,
  numero_consultorios INTEGER DEFAULT 1,
  equipamiento TEXT[], -- Array de equipamiento disponible
  servicios TEXT[], -- Array de servicios incluidos
  especialidades TEXT[], -- Array de especialidades permitidas
  
  -- Disponibilidad
  horario_apertura TIME,
  horario_cierre TIME,
  dias_disponibles TEXT[] DEFAULT '{"lunes","martes","miercoles","jueves","viernes"}',
  
  -- Estado y configuración
  activo BOOLEAN DEFAULT TRUE,
  aprobado BOOLEAN DEFAULT FALSE,
  destacado BOOLEAN DEFAULT FALSE,
  permite_mascotas BOOLEAN DEFAULT FALSE,
  estacionamiento BOOLEAN DEFAULT FALSE,
  wifi BOOLEAN DEFAULT TRUE,
  aire_acondicionado BOOLEAN DEFAULT FALSE,
  
  -- Imágenes
  imagenes TEXT[], -- Array de URLs de imágenes
  imagen_principal TEXT,
  
  -- Estadísticas
  calificacion_promedio DECIMAL(3,2) DEFAULT 0,
  total_calificaciones INTEGER DEFAULT 0,
  total_reservas INTEGER DEFAULT 0,
  vistas INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_consultorios_propietario ON consultorios(propietario_id);
CREATE INDEX idx_consultorios_ciudad ON consultorios(ciudad);
CREATE INDEX idx_consultorios_activo ON consultorios(activo);
CREATE INDEX idx_consultorios_precio ON consultorios(precio_por_hora);
CREATE INDEX idx_consultorios_calificacion ON consultorios(calificacion_promedio);

-- Habilitar RLS
ALTER TABLE consultorios ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Anyone can view active consultorios" ON consultorios
  FOR SELECT USING (activo = true AND aprobado = true);

CREATE POLICY "Owners can view their own consultorios" ON consultorios
  FOR SELECT USING (propietario_id = auth.uid());

CREATE POLICY "Owners can insert their own consultorios" ON consultorios
  FOR INSERT WITH CHECK (propietario_id = auth.uid());

CREATE POLICY "Owners can update their own consultorios" ON consultorios
  FOR UPDATE USING (propietario_id = auth.uid());

CREATE POLICY "Owners can delete their own consultorios" ON consultorios
  FOR DELETE USING (propietario_id = auth.uid());

-- Trigger para updated_at
CREATE TRIGGER update_consultorios_updated_at 
  BEFORE UPDATE ON consultorios 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
