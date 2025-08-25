# 🔄 Operaciones CRUD - WellPoint

Documentación completa de todas las operaciones CRUD implementadas en WellPoint usando Supabase y Zustand.

## 📋 Índice

1. [Perfiles (Profiles)](#perfiles-profiles)
2. [Consultorios](#consultorios)
3. [Reservas](#reservas)
4. [Favoritos](#favoritos)
5. [Calificaciones](#calificaciones)
6. [Storage de Imágenes](#storage-de-imágenes)

---

## 👤 Perfiles (Profiles)

### Funciones disponibles

```typescript
// Obtener perfil
getProfile(id?: string): Promise<{ data: Profile | null, error: unknown }>

// Actualizar perfil
updateProfile(updates: ProfileUpdates): Promise<{ error: unknown }>
```

### Estructura de datos

```typescript
interface Profile {
  id: string
  email: string
  full_name?: string
  nombre?: string
  apellidos?: string
  telefono?: string
  direccion?: string
  ciudad?: string
  estado?: string
  codigo_postal?: string
  fecha_nacimiento?: string
  especialidad?: string
  cedula_profesional?: string
  biografia?: string
  avatar_url?: string
  role: 'professional' | 'owner' | 'admin'
  verificado: boolean
  activo: boolean
  created_at: string
  updated_at: string
}
```

### Ejemplos de uso

```typescript
import { useSupabaseStore } from '@/stores/supabaseStore'

const { getProfile, updateProfile } = useSupabaseStore()

// Obtener perfil actual
const { data: profile, error } = await getProfile()

// Actualizar perfil
const { error } = await updateProfile({
  nombre: 'Juan',
  apellidos: 'Pérez',
  telefono: '+52 555 1234567',
  especialidad: 'Cardiología'
})
```

---

## 🏢 Consultorios

### Funciones disponibles

```typescript
// Leer
getConsultorios(filters?: ConsultorioFilters): Promise<{ data: Consultorio[] | null, error: unknown }>
getConsultorio(id: string): Promise<{ data: Consultorio | null, error: unknown }>
getMyConsultorios(): Promise<{ data: Consultorio[] | null, error: unknown }>

// Crear
createConsultorio(consultorio: ConsultorioCreate): Promise<{ data: Consultorio | null, error: unknown }>

// Actualizar
updateConsultorio(id: string, updates: Partial<ConsultorioCreate>): Promise<{ data: Consultorio | null, error: unknown }>
toggleConsultorioStatus(id: string, activo: boolean): Promise<{ error: unknown }>

// Eliminar
deleteConsultorio(id: string): Promise<{ error: unknown }>
```

### Filtros disponibles

```typescript
interface ConsultorioFilters {
  ciudad?: string
  estado?: string
  precio_min?: number
  precio_max?: number
  metros_cuadrados?: number
  especialidades?: string[]
  servicios?: string[]
  equipamiento?: string[]
}
```

### Ejemplos de uso

```typescript
// Obtener todos los consultorios
const { data: consultorios, error } = await getConsultorios()

// Filtrar por ciudad y precio
const { data: filtrados } = await getConsultorios({
  ciudad: 'Ciudad de México',
  precio_min: 200,
  precio_max: 500
})

// Crear nuevo consultorio
const { data: nuevoConsultorio, error } = await createConsultorio({
  titulo: 'Consultorio médico centro',
  descripcion: 'Consultorio completamente equipado',
  direccion: 'Av. Principal 123',
  ciudad: 'Ciudad de México',
  estado: 'Ciudad de México',
  precio_por_hora: 300,
  metros_cuadrados: 25,
  numero_consultorios: 1,
  especialidades: ['Medicina General'],
  wifi: true,
  estacionamiento: true
})

// Actualizar consultorio
const { data: actualizado } = await updateConsultorio('consultorio-id', {
  precio_por_hora: 350,
  descripcion: 'Nueva descripción'
})

// Activar/Desactivar consultorio
await toggleConsultorioStatus('consultorio-id', false)
```

---

## 📅 Reservas

### Funciones disponibles

```typescript
// Leer
getReservas(userId?: string): Promise<{ data: Reserva[] | null, error: unknown }>
getReservasByConsultorio(consultorioId: string): Promise<{ data: Reserva[] | null, error: unknown }>

// Crear
createReserva(reserva: ReservaCreate): Promise<{ data: Reserva | null, error: unknown }>

// Actualizar
updateReserva(id: string, updates: Partial<Reserva>): Promise<{ data: Reserva | null, error: unknown }>
cancelReserva(id: string, motivo?: string): Promise<{ error: unknown }>
confirmarReserva(id: string): Promise<{ error: unknown }>
```

### Estados de reserva

- `pendiente` - Reserva creada, esperando confirmación
- `confirmada` - Reserva confirmada por el propietario
- `en_progreso` - Reserva activa (en la fecha/hora reservada)
- `completada` - Reserva finalizada exitosamente
- `cancelada` - Reserva cancelada

### Ejemplos de uso

```typescript
// Crear nueva reserva
const { data: reserva, error } = await createReserva({
  consultorio_id: 'consultorio-uuid',
  fecha_inicio: '2025-02-01',
  fecha_fin: '2025-02-01',
  hora_inicio: '09:00',
  hora_fin: '12:00',
  tipo_reserva: 'hora',
  precio_por_unidad: 300,
  unidades: 3,
  subtotal: 900,
  total: 900,
  notas_usuario: 'Consulta de cardiología'
})

// Obtener reservas del usuario
const { data: misReservas } = await getReservas()

// Cancelar reserva
await cancelReserva('reserva-id', 'Cambio de planes')

// Confirmar reserva (solo propietarios)
await confirmarReserva('reserva-id')
```

---

## ⭐ Favoritos

### Funciones disponibles

```typescript
// Leer
getFavoritos(userId?: string): Promise<{ data: Favorito[] | null, error: unknown }>
isFavorito(consultorioId: string): Promise<{ isFavorito: boolean, error: unknown }>

// Crear
addFavorito(consultorioId: string): Promise<{ data: Favorito | null, error: unknown }>

// Eliminar
removeFavorito(consultorioId: string): Promise<{ error: unknown }>
```

### Ejemplos de uso

```typescript
// Verificar si un consultorio es favorito
const { isFavorito } = await isFavorito('consultorio-id')

// Agregar a favoritos
if (!isFavorito) {
  await addFavorito('consultorio-id')
}

// Remover de favoritos
await removeFavorito('consultorio-id')

// Obtener todos los favoritos
const { data: favoritos } = await getFavoritos()
```

---

## ⭐ Calificaciones

### Funciones disponibles

```typescript
// Leer
getCalificaciones(consultorioId: string): Promise<{ data: Calificacion[] | null, error: unknown }>

// Crear
createCalificacion(calificacion: CalificacionCreate): Promise<{ data: Calificacion | null, error: unknown }>

// Actualizar
updateCalificacion(id: string, updates: Partial<CalificacionCreate>): Promise<{ data: Calificacion | null, error: unknown }>
```

### Estructura de calificación

```typescript
interface CalificacionCreate {
  consultorio_id: string
  reserva_id?: string
  puntuacion: number // 1-5
  comentario?: string
  // Calificaciones detalladas (1-5)
  limpieza?: number
  ubicacion?: number
  equipamiento?: number
  atencion?: number
  relacion_precio?: number
}
```

### Ejemplos de uso

```typescript
// Crear calificación después de una reserva completada
const { data: calificacion } = await createCalificacion({
  consultorio_id: 'consultorio-id',
  reserva_id: 'reserva-id',
  puntuacion: 5,
  comentario: 'Excelente consultorio, muy bien equipado',
  limpieza: 5,
  ubicacion: 4,
  equipamiento: 5,
  atencion: 5,
  relacion_precio: 4
})

// Obtener calificaciones de un consultorio
const { data: calificaciones } = await getCalificaciones('consultorio-id')
```

---

## 📸 Storage de Imágenes

### Buckets disponibles

- `avatars` - Imágenes de perfil de usuarios
- `consultorios` - Imágenes de consultorios

### Políticas de seguridad

- **Avatars**: Solo el usuario puede subir/editar su propio avatar
- **Consultorios**: Solo el propietario puede gestionar imágenes de sus consultorios
- **Lectura**: Todas las imágenes son públicamente accesibles

### Estructura de rutas

```
avatars/
  {user_id}/
    avatar.jpg

consultorios/
  {consultorio_id}/
    imagen1.jpg
    imagen2.jpg
    ...
```

### Ejemplo de upload con Supabase

```typescript
import { supabase } from '@/lib/supabase'

// Upload avatar
const uploadAvatar = async (file: File, userId: string) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/avatar.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true })
  
  if (error) return { error }
  
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)
  
  return { url: publicUrl, error: null }
}

// Upload imagen de consultorio
const uploadConsultorioImage = async (file: File, consultorioId: string) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${consultorioId}/${Date.now()}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('consultorios')
    .upload(fileName, file)
  
  if (error) return { error }
  
  const { data: { publicUrl } } = supabase.storage
    .from('consultorios')
    .getPublicUrl(fileName)
  
  return { url: publicUrl, error: null }
}
```

---

## 🔐 Seguridad y RLS

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con políticas específicas:

#### Profiles
- ✅ SELECT: Solo su propio perfil
- ✅ UPDATE: Solo su propio perfil
- ✅ INSERT: Solo al crear su perfil

#### Consultorios
- ✅ SELECT: Consultorios activos y aprobados (público) + sus propios consultorios
- ✅ INSERT/UPDATE/DELETE: Solo sus propios consultorios

#### Reservas
- ✅ SELECT: Sus propias reservas + reservas de sus consultorios
- ✅ INSERT: Solo crear reservas para sí mismo
- ✅ UPDATE: Sus reservas + reservas de sus consultorios

#### Favoritos
- ✅ SELECT/INSERT/DELETE: Solo sus propios favoritos

#### Calificaciones
- ✅ SELECT: Calificaciones públicas activas
- ✅ INSERT: Solo con reserva completada
- ✅ UPDATE: Sus propias calificaciones + respuestas a sus consultorios

### Validaciones automáticas

- **Disponibilidad**: Función `check_availability()` evita conflictos de reservas
- **Calificaciones**: Trigger actualiza promedio automáticamente
- **Timestamps**: Triggers actualizan `updated_at` automáticamente

---

## 🧪 Testing

### Datos de prueba

```sql
-- Crear perfil de prueba
INSERT INTO profiles (id, email, full_name, role) VALUES
('test-professional', 'prof@test.com', 'Dr. Test', 'professional'),
('test-owner', 'owner@test.com', 'Owner Test', 'owner');

-- Crear consultorio de prueba
INSERT INTO consultorios (id, propietario_id, titulo, direccion, ciudad, estado, precio_por_hora, activo, aprobado) VALUES
('test-consultorio', 'test-owner', 'Consultorio Test', 'Test Address', 'Test City', 'Test State', 300, true, true);
```

### Comandos útiles de verificación

```sql
-- Ver todas las tablas
\dt

-- Verificar datos en tabla
SELECT * FROM profiles LIMIT 5;
SELECT * FROM consultorios LIMIT 5;

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

---

**🎉 ¡El sistema CRUD está completo y listo para usar!**

Para más información específica, consulta:
- [Migraciones](./MIGRATIONS.md) - Cómo configurar la base de datos
- [Documentación de autenticación](../auth/AUTH_SYSTEM.md) - Sistema de auth
