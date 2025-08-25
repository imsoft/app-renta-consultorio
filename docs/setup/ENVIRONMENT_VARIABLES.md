# 🔧 Variables de entorno - WellPoint

Esta guía detalla todas las variables de entorno necesarias para configurar WellPoint correctamente.

## 📋 Variables requeridas

### Supabase (Obligatorio)

Obtén estas variables de tu proyecto de Supabase:
Dashboard > Settings > API

```env
NEXT_PUBLIC_SUPABASE_URL=https://wkxtnxaqjjsavhanrjzc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Google OAuth (Opcional)

Solo necesario si vas a usar autenticación con Google:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
```

## 📁 Configuración por entorno

### Desarrollo local

Crear archivo `.env.local` en la raíz del proyecto:

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://wkxtnxaqjjsavhanrjzc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndreHRueGFxampzYXZoYW5yanpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNjg3NjIsImV4cCI6MjA3MTY0NDc2Mn0.wbd4cupJhRgrgJYnFHtcxeWaMl5wIpNFNIxW8urAj6k
```

### Desarrollo con Supabase CLI (Opcional)

Si usas Supabase CLI para desarrollo local:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_local_anon_key
```

### Producción (Vercel)

Configurar en Vercel Dashboard:
- Project Settings > Environment Variables
- Agregar las mismas variables que en desarrollo

### Producción (Netlify)

Configurar en Netlify Dashboard:
- Site Settings > Environment Variables
- Agregar las mismas variables que en desarrollo

## 🔒 Seguridad

### ⚠️ Variables públicas vs privadas

**Variables públicas** (NEXT_PUBLIC_):
- Se exponen al navegador
- Solo incluir información no sensible
- Supabase anon key es seguro para el frontend

**Variables privadas**:
- Solo disponibles en el servidor
- Para API keys sensibles
- No usar NEXT_PUBLIC_ prefix

### ✅ Buenas prácticas

1. **Nunca commitear archivos .env**
2. **Usar diferentes proyectos** para dev/staging/prod
3. **Rotar keys regularmente** en producción
4. **Usar valores de ejemplo** en documentación
5. **Configurar RLS** correctamente en Supabase

## 🛠️ Verificación

### Comprobar configuración

```bash
# Verificar que las variables están cargadas
pnpm dev

# En la consola del navegador debería aparecer:
# Supabase initialized successfully
```

### Problemas comunes

1. **"supabaseKey is required"**
   - Verificar que existe `.env.local`
   - Comprobar nombres de variables
   - Reiniciar el servidor de desarrollo

2. **"Invalid API key"**
   - Verificar que la URL y key son correctas
   - Comprobar que el proyecto de Supabase esté activo

3. **CORS errors**
   - Configurar dominios permitidos en Supabase
   - Verificar URLs de origen en configuración

## 📝 Plantilla de .env.local

```env
# =============================================================================
# SUPABASE CONFIGURATION (OBLIGATORIO)
# =============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui

# =============================================================================
# GOOGLE OAUTH (OPCIONAL)
# =============================================================================
NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu_google_client_id_aqui

# =============================================================================
# DESARROLLO LOCAL CON SUPABASE CLI (OPCIONAL)
# =============================================================================
# NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
# NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_local_anon_key
```

## 🚀 Siguiente paso

Una vez configuradas las variables de entorno:

1. **Ejecutar la aplicación**: `pnpm dev`
2. **Verificar conexión**: Ir a `/login` y comprobar que no hay errores
3. **Configurar Google OAuth**: Seguir [GOOGLE_AUTH_SETUP.md](../auth/GOOGLE_AUTH_SETUP.md)
4. **Aplicar migraciones**: Seguir [database/README.md](../database/README.md)
