# 📚 Documentación WellPoint

Bienvenido a la documentación completa de WellPoint, la plataforma de alquiler de consultorios médicos.

## 🗂️ Estructura de la documentación

> 🧭 **[Ver navegación completa](./NAVIGATION.md)** - Índice detallado por categorías y flujos de trabajo

### 📋 [Configuración inicial](./setup/)
- **[Setup rápido](./setup/ENV_SETUP.md)** - Configuración rápida de variables de entorno
- **[Variables de entorno completas](./setup/ENVIRONMENT_VARIABLES.md)** - Guía detallada de todas las variables

### 🔐 [Sistema de autenticación](./auth/)
- **[Guía completa del sistema](./auth/AUTH_SYSTEM.md)** - Documentación completa del sistema de autenticación
- **[Configuración de Google OAuth](./auth/GOOGLE_AUTH_SETUP.md)** - Paso a paso para configurar Google OAuth

### 🗄️ [Base de datos](./database/)
- **[Configuración de Supabase](./database/README.md)** - Migraciones, RLS y estructura de la base de datos
- **[Operaciones CRUD](./database/CRUD_OPERATIONS.md)** - Documentación completa de operaciones CRUD
- **[Guía de migraciones](./database/MIGRATIONS.md)** - Documentación detallada de migraciones

### 🚀 [Despliegue](./deployment/)
- **[Aplicar migraciones](./deployment/APPLY_MIGRATIONS.md)** - Guía rápida para aplicar migraciones en Supabase
- **[Migraciones completas](./deployment/MIGRACIONES_PARA_APLICAR.md)** - Todas las migraciones SQL listas para copiar y pegar

### 💻 [Desarrollo](./development/)
- **[Resumen CRUD](./development/CRUD_IMPLEMENTATION_SUMMARY.md)** - Resumen completo de la implementación CRUD

### 🧪 [Testing](./testing/)
- **[Lista de verificación](./testing/VERIFICATION_CHECKLIST.md)** - Checklist completo para probar funcionalidades
- **[Google OAuth Checklist](./testing/GOOGLE_OAUTH_CHECKLIST.md)** - Verificación específica de Google OAuth

## 🚀 Inicio rápido

1. **Configurar variables de entorno**:
   ```bash
   # Seguir la guía en docs/setup/ENV_SETUP.md
   cp .env.example .env.local
   ```

2. **Instalar dependencias**:
   ```bash
   pnpm install
   ```

3. **Configurar Supabase**:
   - Seguir [docs/setup/ENV_SETUP.md](./setup/ENV_SETUP.md)
   - Aplicar migraciones según [docs/database/README.md](./database/README.md)

4. **Configurar autenticación**:
   - Para Google OAuth: [docs/auth/GOOGLE_AUTH_SETUP.md](./auth/GOOGLE_AUTH_SETUP.md)

5. **Ejecutar en desarrollo**:
   ```bash
   pnpm dev
   ```

## 🔧 Comandos principales

```bash
# Desarrollo
pnpm dev              # Servidor de desarrollo
pnpm build            # Build de producción
pnpm start            # Servidor de producción

# Linting y formato
pnpm lint             # Ejecutar ESLint
pnpm lint:fix         # Corregir errores de ESLint

# Base de datos (Supabase CLI)
supabase start        # Iniciar instancia local
supabase db reset     # Resetear base de datos
supabase gen types    # Generar tipos TypeScript
```

## 📁 Estructura del proyecto

```
wellpoint/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── (auth)/            # Páginas de autenticación
│   │   ├── (dashboard)/       # Dashboard del usuario
│   │   ├── (consultorios)/    # Gestión de consultorios
│   │   └── (info)/            # Páginas informativas
│   ├── components/            # Componentes reutilizables
│   │   ├── ui/                # Componentes de UI base
│   │   ├── Header.tsx         # Header principal
│   │   ├── Footer.tsx         # Footer principal
│   │   └── SupabaseProvider.tsx # Provider de Supabase
│   ├── stores/                # Estados globales (Zustand)
│   │   ├── authStore.ts       # Store de autenticación
│   │   └── supabaseStore.ts   # Store de Supabase
│   └── lib/                   # Utilidades y configuración
│       ├── supabase.ts        # Cliente de Supabase
│       └── utils.ts           # Utilidades generales
├── docs/                      # Documentación
│   ├── setup/                 # Guías de configuración
│   ├── auth/                  # Documentación de autenticación
│   └── database/              # Documentación de base de datos
├── supabase/                  # Configuración de Supabase
│   └── migrations/            # Migraciones de base de datos
└── public/                    # Archivos estáticos
```

## 🛠️ Stack tecnológico

- **Frontend**: Next.js 15, React, TypeScript
- **Estilos**: Tailwind CSS, shadcn/ui
- **Estado**: Zustand
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Formularios**: React Hook Form + Zod
- **Despliegue**: Vercel (recomendado)

## 📝 Guías específicas

### Para desarrolladores
- [Sistema de autenticación](./auth/AUTH_SYSTEM.md) - Guía completa del sistema de auth
- [Base de datos](./database/README.md) - Estructura y configuración de BD

### Para administradores
- [Variables de entorno](./setup/ENV_SETUP.md) - Configuración inicial
- [Google OAuth](./auth/GOOGLE_AUTH_SETUP.md) - Configuración de proveedores OAuth

## 🐛 Solución de problemas

### Errores comunes

1. **"supabaseKey is required"**
   - Verificar archivo `.env.local`
   - Seguir [docs/setup/ENV_SETUP.md](./setup/ENV_SETUP.md)

2. **"redirect_uri_mismatch" (Google OAuth)**
   - Verificar configuración en Google Cloud Console
   - Seguir [docs/auth/GOOGLE_AUTH_SETUP.md](./auth/GOOGLE_AUTH_SETUP.md)

3. **Errores de build**
   - Ejecutar `pnpm build` y revisar errores de TypeScript
   - Verificar que todas las variables de entorno estén configuradas

### Logs útiles
- Console del navegador para errores de frontend
- Supabase Dashboard > Logs para errores de backend
- Network tab para problemas de API

## 🤝 Contribuir

1. Fork del repositorio
2. Crear branch para feature: `git checkout -b feature/nombre-feature`
3. Commit de cambios: `git commit -m 'Add: nueva funcionalidad'`
4. Push al branch: `git push origin feature/nombre-feature`
5. Crear Pull Request

## 📞 Soporte

- **Issues**: Usar GitHub Issues para reportar bugs
- **Documentación**: Actualizar docs al hacer cambios
- **Preguntas**: Contactar al equipo de desarrollo

---

**Última actualización**: Enero 2025
**Versión**: 1.0.0
