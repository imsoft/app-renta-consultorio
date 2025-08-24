-- Crear tabla de favoritos
CREATE TABLE IF NOT EXISTS public.favoritos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profesional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  consultorio_id UUID REFERENCES public.consultorios(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profesional_id, consultorio_id)
);

-- Habilitar RLS
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own favorites" ON public.favoritos
  FOR SELECT USING (auth.uid() = profesional_id);

CREATE POLICY "Users can insert their own favorites" ON public.favoritos
  FOR INSERT WITH CHECK (auth.uid() = profesional_id);

CREATE POLICY "Users can delete their own favorites" ON public.favoritos
  FOR DELETE USING (auth.uid() = profesional_id);
