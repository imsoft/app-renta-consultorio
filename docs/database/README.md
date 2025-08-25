# Configuración de Supabase para WellPoint

Este directorio contiene las migraciones de base de datos para la aplicación WellPoint.

## Estructura de la base de datos

### Tablas principales:

1. **profiles** - Perfiles de usuario (profesionales, propietarios, administradores)
2. **consultorios** - Espacios médicos disponibles para renta
3. **reservas** - Reservaciones de consultorios
4. **favoritos** - Consultorios favoritos de los profesionales
5. **calificaciones** - Calificaciones y comentarios de los consultorios

## Configuración

### 1. Variables de entorno

Asegúrate de tener las siguientes variables en tu archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://wkxtnxaqjjsavhanrjzc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
```

### 2. Ejecutar migraciones

Para ejecutar las migraciones, puedes usar el CLI de Supabase o ejecutarlas manualmente en el dashboard de Supabase:

#### Opción A: Usando Supabase CLI
```bash
# Instalar Supabase CLI
npm install -g supabase

# Inicializar proyecto
supabase init

# Ejecutar migraciones
supabase db push
```

#### Opción B: Manualmente en el dashboard
1. Ve al dashboard de Supabase
2. Navega a SQL Editor
3. Ejecuta cada archivo de migración en orden:
   - `001_create_profiles_table.sql`
   - `002_create_consultorios_table.sql`
   - `003_create_reservas_table.sql`
   - `004_create_favoritos_table.sql`
   - `005_create_calificaciones_table.sql`

## Características de seguridad

- **Row Level Security (RLS)** habilitado en todas las tablas
- Políticas de acceso basadas en roles de usuario
- Validaciones de datos con constraints
- Triggers para actualización automática de timestamps

## Roles de usuario

- **professional**: Profesionales de la salud que rentan consultorios
- **owner**: Propietarios de consultorios
- **admin**: Administradores del sistema

## Funcionalidades principales

- Autenticación de usuarios con Supabase Auth
- Gestión de perfiles de usuario
- Publicación y gestión de consultorios
- Sistema de reservas
- Sistema de favoritos
- Sistema de calificaciones y comentarios
