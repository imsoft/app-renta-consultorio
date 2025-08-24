-- Crear tabla de calificaciones
CREATE TABLE IF NOT EXISTS public.calificaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consultorio_id UUID REFERENCES public.consultorios(id) ON DELETE CASCADE NOT NULL,
  profesional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  calificacion INTEGER CHECK (calificacion >= 1 AND calificacion <= 5) NOT NULL,
  comentario TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(consultorio_id, profesional_id)
);

-- Habilitar RLS
ALTER TABLE public.calificaciones ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Anyone can view ratings for active consultorios" ON public.calificaciones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.consultorios 
      WHERE consultorios.id = calificaciones.consultorio_id 
      AND consultorios.estado_publicacion = 'activo'
    )
  );

CREATE POLICY "Users can view their own ratings" ON public.calificaciones
  FOR SELECT USING (auth.uid() = profesional_id);

CREATE POLICY "Owners can view ratings for their consultorios" ON public.calificaciones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.consultorios 
      WHERE consultorios.id = calificaciones.consultorio_id 
      AND consultorios.propietario_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own ratings" ON public.calificaciones
  FOR INSERT WITH CHECK (auth.uid() = profesional_id);

CREATE POLICY "Users can update their own ratings" ON public.calificaciones
  FOR UPDATE USING (auth.uid() = profesional_id);

CREATE POLICY "Users can delete their own ratings" ON public.calificaciones
  FOR DELETE USING (auth.uid() = profesional_id);
