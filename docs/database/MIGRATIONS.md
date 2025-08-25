# 🗄️ Migraciones de Base de Datos - WellPoint

Esta guía explica cómo aplicar las migraciones para crear toda la estructura de la base de datos de WellPoint.

## 📋 Migraciones disponibles

Las siguientes migraciones crean todas las tablas necesarias para el funcionamiento completo de la aplicación:

### 1. `20250124000001_create_profiles_table.sql`
**Tabla de perfiles de usuario**
- Extiende la tabla `auth.users` de Supabase
- Campos: información personal, rol, verificación, etc.
- RLS habilitado para seguridad

### 2. `20250124000002_create_consultorios_table.sql`
**Tabla de consultorios médicos**
- Información completa de espacios médicos
- Precios, características, disponibilidad
- Sistema de calificaciones y estadísticas

### 3. `20250124000003_create_reservas_table.sql`
**Tabla de reservas y citas**
- Gestión de reservas por hora/día/mes
- Estados de reserva y pagos
- Función de validación de disponibilidad

### 4. `20250124000004_create_favoritos_table.sql`
**Sistema de favoritos**
- Usuarios pueden marcar consultorios favoritos
- Función para contar favoritos

### 5. `20250124000005_create_calificaciones_table.sql`
**Sistema de calificaciones y reseñas**
- Calificaciones detalladas por categorías
- Respuestas de propietarios
- Actualización automática de promedios

### 6. `20250124000006_create_storage_buckets.sql`
**Configuración de Storage para imágenes**
- Buckets para avatars y consultorios
- Políticas de seguridad para uploads

## 🚀 Cómo aplicar las migraciones

### Opción 1: Dashboard de Supabase (Recomendado)

1. **Acceder al Dashboard**:
   - Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Selecciona tu proyecto

2. **Ir al SQL Editor**:
   - Clic en "SQL Editor" en el menú lateral
   - Clic en "New query"

3. **Aplicar cada migración**:
   - Copia el contenido de cada archivo de migración
   - Pégalo en el editor SQL
   - Clic en "Run" para ejecutar
   - **Orden importante**: Ejecutar en orden numérico

### Opción 2: Supabase CLI

```bash
# Instalar Supabase CLI (si no lo tienes)
npm install -g supabase

# Inicializar en el proyecto
supabase init

# Vincular con tu proyecto
supabase link --project-ref TU_PROJECT_REF

# Aplicar todas las migraciones
supabase db push
```

### Opción 3: Ejecución manual por archivos

Ejecuta cada archivo en este orden:

```sql
-- 1. Tabla de perfiles
\i supabase/migrations/20250124000001_create_profiles_table.sql

-- 2. Tabla de consultorios  
\i supabase/migrations/20250124000002_create_consultorios_table.sql

-- 3. Tabla de reservas
\i supabase/migrations/20250124000003_create_reservas_table.sql

-- 4. Tabla de favoritos
\i supabase/migrations/20250124000004_create_favoritos_table.sql

-- 5. Tabla de calificaciones
\i supabase/migrations/20250124000005_create_calificaciones_table.sql

-- 6. Storage buckets
\i supabase/migrations/20250124000006_create_storage_buckets.sql
```

## ✅ Verificar las migraciones

Después de aplicar todas las migraciones, verifica que se crearon correctamente:

```sql
-- Verificar tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- Debería mostrar:
-- profiles
-- consultorios  
-- reservas
-- favoritos
-- calificaciones

-- Verificar buckets de storage
SELECT * FROM storage.buckets;

-- Debería mostrar:
-- avatars
-- consultorios
```

## 🔧 Datos de ejemplo (Opcional)

Para probar la aplicación, puedes insertar datos de ejemplo:

```sql
-- Insertar perfil de ejemplo
INSERT INTO profiles (id, email, full_name, nombre, apellidos, role, verificado, activo)
VALUES (
  'user-uuid-here',
  'doctor@test.com',
  'Dr. Juan Pérez',
  'Juan',
  'Pérez',
  'professional',
  true,
  true
);

-- Insertar consultorio de ejemplo
INSERT INTO consultorios (
  propietario_id, titulo, descripcion, direccion, ciudad, estado,
  precio_por_hora, metros_cuadrados, numero_consultorios,
  especialidades, servicios, activo, aprobado
) VALUES (
  'owner-uuid-here',
  'Consultorio médico centro',
  'Consultorio completamente equipado en zona céntrica',
  'Av. Principal 123, Centro',
  'Ciudad de México',
  'Ciudad de México',
  300,
  25,
  1,
  ARRAY['Medicina General', 'Cardiología'],
  ARRAY['Consulta médica', 'Electrocardiograma'],
  true,
  true
);
```

## 🛡️ Seguridad (RLS)

Todas las tablas tienen **Row Level Security (RLS)** habilitado con las siguientes políticas:

### Profiles
- ✅ Los usuarios pueden ver y editar solo su propio perfil
- ✅ Los usuarios pueden crear su propio perfil al registrarse

### Consultorios
- ✅ Cualquiera puede ver consultorios activos y aprobados
- ✅ Los propietarios pueden gestionar solo sus consultorios

### Reservas
- ✅ Los usuarios ven solo sus propias reservas
- ✅ Los propietarios ven reservas de sus consultorios

### Favoritos
- ✅ Los usuarios gestionan solo sus propios favoritos

### Calificaciones
- ✅ Cualquiera puede leer calificaciones activas
- ✅ Solo usuarios con reservas completadas pueden calificar
- ✅ Los propietarios pueden responder a calificaciones

## 🔍 Troubleshooting

### Error: "relation does not exist"
- **Causa**: Las migraciones no se ejecutaron en orden
- **Solución**: Verificar que `profiles` se creó antes que `consultorios`

### Error: "permission denied"
- **Causa**: Problemas con RLS
- **Solución**: Verificar que el usuario esté autenticado correctamente

### Error: "function does not exist"
- **Causa**: Funciones auxiliares no se crearon
- **Solución**: Ejecutar primero las migraciones de funciones

### Storage no funciona
- **Causa**: Buckets no creados o políticas incorrectas
- **Solución**: Ejecutar la migración de storage por separado

## 📚 Recursos adicionales

- [Documentación de Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [PostgreSQL Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)

---

**✨ ¡Las migraciones están listas para crear una base de datos robusta y escalable!**
