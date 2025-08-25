# Sistema de Autenticación WellPoint

Este documento describe el sistema de autenticación implementado en WellPoint, incluyendo las funcionalidades, componentes y configuración.

## 🚀 Características implementadas

### ✅ Autenticación con Email y Contraseña
- Registro de usuarios con validación robusta
- Login con email y contraseña
- Recuperación de contraseña
- Confirmación de email

### ✅ Autenticación con Google OAuth
- Login/registro con cuenta de Google
- Sincronización automática de perfil
- Redirección automática después del login

### ✅ UX/UI Mejorada
- Diseño moderno con gradientes y efectos
- Indicadores de carga con spinners
- Mensajes de error y éxito claros
- Validación en tiempo real
- Responsive design

### ✅ Gestión de Estados
- Estados de carga unificados
- Manejo de errores robusto
- Sincronización entre stores
- Persistencia de sesión

### ✅ Rutas Protegidas
- Componente ProtectedRoute
- Control de acceso por roles
- Redirecciones automáticas
- Páginas de error personalizadas

## 📁 Estructura de archivos

```
src/
├── app/(auth)/
│   ├── layout.tsx              # Layout específico para auth
│   ├── login/page.tsx          # Página de login
│   ├── registro/page.tsx       # Página de registro
│   └── recuperar-password/page.tsx # Recuperación de contraseña
├── components/
│   ├── SupabaseProvider.tsx    # Provider de Supabase
│   └── ProtectedRoute.tsx      # Componente de rutas protegidas
├── stores/
│   ├── authStore.ts           # Store de autenticación (Zustand)
│   └── supabaseStore.ts       # Store de Supabase (Zustand)
└── lib/
    └── supabase.ts            # Cliente de Supabase
```

## 🔧 Configuración

### Variables de entorno requeridas

Crear archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://wkxtnxaqjjsavhanrjzc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Configuración de Supabase

1. **Autenticación por email**: Ya habilitada por defecto
2. **Google OAuth**: Seguir guía en `GOOGLE_AUTH_SETUP.md`
3. **Confirmación de email**: Configurar templates en Supabase
4. **Políticas RLS**: Configuradas en las migraciones

## 🔄 Flujo de autenticación

### Registro con Email
1. Usuario completa formulario de registro
2. Validación con Zod en frontend
3. `signUp()` envía datos a Supabase
4. Supabase envía email de confirmación
5. Usuario confirma email
6. Perfil se crea automáticamente
7. Redirección al dashboard

### Login con Email
1. Usuario completa formulario de login
2. Validación básica
3. `signIn()` autentica con Supabase
4. Sesión se establece automáticamente
5. Datos de usuario se sincronizan con stores
6. Redirección al dashboard

### Login con Google
1. Usuario hace clic en "Continuar con Google"
2. `signInWithGoogle()` inicia flujo OAuth
3. Redirección a Google para autenticación
4. Google redirecciona de vuelta con token
5. Supabase procesa el token
6. Perfil se crea/actualiza automáticamente
7. Usuario logueado en la aplicación

### Recuperación de contraseña
1. Usuario ingresa email en formulario
2. `resetPassword()` envía email de recuperación
3. Usuario hace clic en enlace del email
4. Redirección a página de cambio de contraseña
5. Usuario establece nueva contraseña

## 🔐 Roles y permisos

### Roles disponibles
- `professional`: Profesionales de la salud
- `owner`: Propietarios de consultorios
- `admin`: Administradores del sistema

### Control de acceso
```tsx
// Proteger ruta para solo propietarios
<ProtectedRoute allowedRoles={["owner"]}>
  <CrearConsultorioPage />
</ProtectedRoute>

// Proteger ruta para cualquier usuario autenticado
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>
```

## 🎨 Componentes de UI

### LoginPage
- Formulario con validación Zod
- Campo de email con icono
- Campo de contraseña con toggle de visibilidad
- Checkbox "Recordarme"
- Enlace a recuperación de contraseña
- Botón de Google OAuth
- Estados de carga y error

### RegistroPage
- Campos de nombre y apellido
- Validación de contraseña robusta
- Confirmación de contraseña
- Checkbox de términos y condiciones
- Botón de Google OAuth
- Mensajes de éxito para confirmación de email

### RecuperarPasswordPage
- Campo de email únicamente
- Validación básica
- Mensaje de confirmación
- Enlace de vuelta al login

## 📱 Responsive Design

- Breakpoints móviles optimizados
- Componentes que se adaptan a pantallas pequeñas
- Formularios que funcionan bien en touch devices
- Navegación optimizada para móvil

## 🛠️ Stores de Estado

### authStore (Zustand)
```typescript
interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User) => void
  clearUser: () => void
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}
```

### supabaseStore (Zustand)
```typescript
interface SupabaseState {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: unknown }>
  signUp: (email: string, password: string, userData: UserData) => Promise<{ error: unknown }>
  signInWithGoogle: () => Promise<{ error: unknown }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: unknown }>
}
```

## 🔍 Debugging

### Logs útiles
- `Auth state changed:` - Cambios en el estado de autenticación
- `Error in auth state change:` - Errores durante cambios de estado
- `Login error:` - Errores específicos de login
- `Registration error:` - Errores específicos de registro

### Herramientas de desarrollo
- Panel de Supabase para ver usuarios
- Redux DevTools para inspeccionar stores de Zustand
- Console del navegador para logs de autenticación

## 🚀 Próximos pasos

1. **Verificación por SMS**: Agregar autenticación por teléfono
2. **2FA**: Implementar autenticación de dos factores
3. **Más proveedores OAuth**: Facebook, Apple, etc.
4. **Magic Links**: Links de acceso sin contraseña
5. **Roles avanzados**: Sistema de permisos más granular

## 🐛 Problemas conocidos

- Google OAuth requiere HTTPS en producción
- Algunos emails pueden ir a spam
- Rate limiting en desarrollo puede causar errores temporales

## 📞 Soporte

Para problemas con la autenticación:
1. Revisar logs en la consola del navegador
2. Verificar configuración de variables de entorno
3. Comprobar estado de servicios de Supabase
4. Revisar configuración de Google OAuth si aplica
