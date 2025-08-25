# 🚀 MIGRACIONES PARA APLICAR EN SUPABASE

## Instrucciones:
1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto WellPoint  
3. Haz clic en "SQL Editor" → "New query"
4. Copia y pega cada migración EN ORDEN
5. Haz clic en "Run" después de cada una

---

## 📋 MIGRACIÓN 1: Tabla Profiles

```sql
-- Crear tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  nombre TEXT,
  apellidos TEXT,
  telefono TEXT,
  direccion TEXT,
  ciudad TEXT,
  estado TEXT,
  codigo_postal TEXT,
  fecha_nacimiento DATE,
  especialidad TEXT,
  cedula_profesional TEXT,
  biografia TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'professional' CHECK (role IN ('professional', 'owner', 'admin')),
  verificado BOOLEAN DEFAULT FALSE,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para profiles
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 📋 MIGRACIÓN 2: Tabla Consultorios

```sql
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
  coordenadas POINT,
  precio_por_hora DECIMAL(10,2) NOT NULL,
  precio_por_dia DECIMAL(10,2),
  precio_por_mes DECIMAL(10,2),
  
  -- Características del consultorio
  metros_cuadrados INTEGER,
  numero_consultorios INTEGER DEFAULT 1,
  equipamiento TEXT[],
  servicios TEXT[],
  especialidades TEXT[],
  
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
  imagenes TEXT[],
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
```

---

## 📋 MIGRACIÓN 3: Tabla Reservas

```sql
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
  precio_por_unidad DECIMAL(10,2) NOT NULL,
  unidades INTEGER NOT NULL DEFAULT 1,
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
```

---

## 📋 MIGRACIÓN 4: Tabla Favoritos

```sql
-- Crear tabla de favoritos
CREATE TABLE IF NOT EXISTS favoritos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  consultorio_id UUID REFERENCES consultorios(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
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
```

---

## 📋 MIGRACIÓN 5: Tabla Calificaciones

```sql
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

CREATE POLICY "Users can add calificaciones" ON calificaciones
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

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
```

---

## 📋 MIGRACIÓN 6: Storage Buckets

```sql
-- Crear buckets de storage para imágenes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('consultorios', 'consultorios', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Políticas de storage para consultorios
CREATE POLICY "Consultorio images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'consultorios');

CREATE POLICY "Owners can upload consultorio images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'consultorios'
    AND EXISTS (
      SELECT 1 FROM consultorios 
      WHERE id::text = (storage.foldername(name))[1]
      AND propietario_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update consultorio images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'consultorios'
    AND EXISTS (
      SELECT 1 FROM consultorios 
      WHERE id::text = (storage.foldername(name))[1]
      AND propietario_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete consultorio images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'consultorios'
    AND EXISTS (
      SELECT 1 FROM consultorios 
      WHERE id::text = (storage.foldername(name))[1]
      AND propietario_id = auth.uid()
    )
  );
```

---

## 📋 MIGRACIÓN 7: Trigger Automático para Perfiles

```sql
-- Función para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, nombre, apellidos, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'nombre', SPLIT_PART(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 1)),
    COALESCE(NEW.raw_user_meta_data->>'apellidos', TRIM(SUBSTRING(COALESCE(NEW.raw_user_meta_data->>'full_name', '') FROM POSITION(' ' IN COALESCE(NEW.raw_user_meta_data->>'full_name', '')) + 1))),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'professional')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Política adicional para permitir que el trigger funcione
CREATE POLICY "Enable insert for authenticated users only" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');
```

---

## ✅ VERIFICACIÓN FINAL

Después de aplicar todas las migraciones, ejecuta esta query para verificar:

```sql
-- Verificar tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verificar storage buckets
SELECT name FROM storage.buckets;
```

Deberías ver:
- ✅ calificaciones
- ✅ consultorios  
- ✅ favoritos
- ✅ profiles
- ✅ reservas

Y buckets:
- ✅ avatars
- ✅ consultorios

## 🎉 ¡Una vez aplicadas todas las migraciones, tu proyecto estará 100% funcional!
