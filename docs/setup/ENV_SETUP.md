# ⚡ Configuración rápida de Variables de Entorno

**⚠️ Nota**: Para la documentación completa de variables de entorno, ver [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)

## 🚀 Configuración rápida

Para que WellPoint funcione correctamente, necesitas crear un archivo `.env.local` en la raíz del proyecto:

### 1. Crear archivo `.env.local`

```bash
# En la raíz del proyecto
touch .env.local
```

### 2. Agregar variables de Supabase

```env
NEXT_PUBLIC_SUPABASE_URL=https://wkxtnxaqjjsavhanrjzc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndreHRueGFxampzYXZoYW5yanpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNjg3NjIsImV4cCI6MjA3MTY0NDc2Mn0.wbd4cupJhRgrgJYnFHtcxeWaMl5wIpNFNIxW8urAj6k
```

### 3. Reiniciar servidor

```bash
# Si el servidor está corriendo, reiniciarlo
pnpm dev
```

## ✅ Verificación rápida

```bash
# El build debe completarse sin errores
pnpm build
```

## 📚 Documentación completa

- **[Variables de entorno completas](./ENVIRONMENT_VARIABLES.md)** - Guía detallada
- **[Configurar Google OAuth](../auth/GOOGLE_AUTH_SETUP.md)** - Para autenticación con Google
- **[Base de datos](../database/README.md)** - Configurar Supabase y migraciones
