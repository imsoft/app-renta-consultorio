-- Crear tabla de reservas
CREATE TABLE IF NOT EXISTS public.reservas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consultorio_id UUID REFERENCES public.consultorios(id) ON DELETE CASCADE NOT NULL,
  profesional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  fecha_fin TIMESTAMP WITH TIME ZONE NOT NULL,
  duracion_horas INTEGER NOT NULL,
  precio_total DECIMAL(10, 2) NOT NULL,
  estado TEXT CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'completada')) DEFAULT 'pendiente',
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own reservations" ON public.reservas
  FOR SELECT USING (auth.uid() = profesional_id);

CREATE POLICY "Owners can view reservations for their consultorios" ON public.reservas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.consultorios 
      WHERE consultorios.id = reservas.consultorio_id 
      AND consultorios.propietario_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own reservations" ON public.reservas
  FOR INSERT WITH CHECK (auth.uid() = profesional_id);

CREATE POLICY "Users can update their own reservations" ON public.reservas
  FOR UPDATE USING (auth.uid() = profesional_id);

CREATE POLICY "Owners can update reservations for their consultorios" ON public.reservas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.consultorios 
      WHERE consultorios.id = reservas.consultorio_id 
      AND consultorios.propietario_id = auth.uid()
    )
  );

-- Trigger para actualizar updated_at
CREATE TRIGGER update_reservas_updated_at
  BEFORE UPDATE ON public.reservas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
