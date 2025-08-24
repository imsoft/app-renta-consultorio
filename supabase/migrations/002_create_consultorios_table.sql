-- Crear tabla de consultorios
CREATE TABLE IF NOT EXISTS public.consultorios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  direccion TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  estado TEXT NOT NULL,
  codigo_postal TEXT NOT NULL,
  latitud DECIMAL(10, 8),
  longitud DECIMAL(11, 8),
  precio_hora DECIMAL(10, 2) NOT NULL,
  precio_dia DECIMAL(10, 2) NOT NULL,
  precio_mes DECIMAL(10, 2) NOT NULL,
  capacidad INTEGER NOT NULL DEFAULT 1,
  equipamiento TEXT[] DEFAULT '{}',
  horarios_disponibles TEXT NOT NULL,
  imagenes TEXT[] DEFAULT '{}',
  propietario_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  estado_publicacion TEXT CHECK (estado_publicacion IN ('activo', 'inactivo', 'pendiente')) DEFAULT 'pendiente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.consultorios ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Anyone can view active consultorios" ON public.consultorios
  FOR SELECT USING (estado_publicacion = 'activo');

CREATE POLICY "Owners can view their own consultorios" ON public.consultorios
  FOR SELECT USING (auth.uid() = propietario_id);

CREATE POLICY "Owners can insert their own consultorios" ON public.consultorios
  FOR INSERT WITH CHECK (auth.uid() = propietario_id);

CREATE POLICY "Owners can update their own consultorios" ON public.consultorios
  FOR UPDATE USING (auth.uid() = propietario_id);

CREATE POLICY "Owners can delete their own consultorios" ON public.consultorios
  FOR DELETE USING (auth.uid() = propietario_id);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_consultorios_updated_at
  BEFORE UPDATE ON public.consultorios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
