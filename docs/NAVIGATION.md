# 🧭 Navegación de la documentación

Índice completo de toda la documentación de WellPoint.

## 📖 Por categorías

### 🚀 Inicio rápido
- [README principal](../README.md) - Información general del proyecto
- [Configuración rápida de variables de entorno](./setup/ENV_SETUP.md)

### ⚙️ Configuración y setup
- [Variables de entorno completas](./setup/ENVIRONMENT_VARIABLES.md) - Guía detallada
- [Configuración de Google OAuth](./auth/GOOGLE_AUTH_SETUP.md) - Paso a paso para OAuth

### 🔐 Sistema de autenticación
- [Guía completa del sistema de auth](./auth/AUTH_SYSTEM.md) - Documentación completa
- [Configuración de Google OAuth](./auth/GOOGLE_AUTH_SETUP.md) - OAuth setup

### 🗄️ Base de datos
- [Configuración de Supabase](./database/README.md) - Migraciones y estructura
- [Operaciones CRUD](./database/CRUD_OPERATIONS.md) - Documentación completa de CRUD
- [Guía de migraciones](./database/MIGRATIONS.md) - Migraciones detalladas

### 🚀 Despliegue
- [Aplicar migraciones](./deployment/APPLY_MIGRATIONS.md) - Guía rápida para despliegue
- [Migraciones completas](./deployment/MIGRACIONES_PARA_APLICAR.md) - SQL completo listo para copiar

### 💻 Desarrollo
- [Resumen CRUD](./development/CRUD_IMPLEMENTATION_SUMMARY.md) - Estado de implementación

### 🧪 Testing
- [Lista de verificación](./testing/VERIFICATION_CHECKLIST.md) - Checklist de pruebas
- [Google OAuth Checklist](./testing/GOOGLE_OAUTH_CHECKLIST.md) - Verificación de Google OAuth

## 📋 Por flujo de trabajo

### Para nuevos desarrolladores:
1. [README principal](../README.md) - Entender el proyecto
2. [Configuración rápida](./setup/ENV_SETUP.md) - Setup inicial
3. [Variables de entorno](./setup/ENVIRONMENT_VARIABLES.md) - Configuración detallada
4. [Base de datos](./database/README.md) - Setup de BD
5. [Sistema de auth](./auth/AUTH_SYSTEM.md) - Entender autenticación

### Para configurar autenticación:
1. [Sistema de auth](./auth/AUTH_SYSTEM.md) - Entender el sistema
2. [Variables de entorno](./setup/ENVIRONMENT_VARIABLES.md) - Configurar Supabase
3. [Google OAuth](./auth/GOOGLE_AUTH_SETUP.md) - Configurar Google (opcional)

### Para deployment:
1. [Variables de entorno](./setup/ENVIRONMENT_VARIABLES.md) - Variables de producción
2. [Migraciones completas](./deployment/MIGRACIONES_PARA_APLICAR.md) - SQL listo para aplicar
3. [Aplicar migraciones](./deployment/APPLY_MIGRATIONS.md) - Guía paso a paso
4. [Base de datos](./database/README.md) - Migraciones en producción
5. [Google OAuth](./auth/GOOGLE_AUTH_SETUP.md) - URLs de producción

### Para testing:
1. [Lista de verificación](./testing/VERIFICATION_CHECKLIST.md) - Probar funcionalidades
2. [Google OAuth Checklist](./testing/GOOGLE_OAUTH_CHECKLIST.md) - Verificar Google OAuth
3. [Resumen CRUD](./development/CRUD_IMPLEMENTATION_SUMMARY.md) - Estado actual

## 🔍 Por tema específico

### Supabase
- [Variables de entorno](./setup/ENVIRONMENT_VARIABLES.md#supabase-obligatorio)
- [Base de datos](./database/README.md)
- [Auth con Supabase](./auth/AUTH_SYSTEM.md#flujo-de-autenticación)

### Google OAuth
- [Configuración completa](./auth/GOOGLE_AUTH_SETUP.md)
- [Variables de entorno para Google](./setup/ENVIRONMENT_VARIABLES.md#google-oauth-opcional)

### Desarrollo local
- [Setup inicial](./setup/ENV_SETUP.md)
- [Desarrollo con Supabase CLI](./setup/ENVIRONMENT_VARIABLES.md#desarrollo-con-supabase-cli-opcional)

### Producción
- [Variables de entorno de producción](./setup/ENVIRONMENT_VARIABLES.md#producción-vercelnetlify)
- [Despliegue](../README.md#-despliegue)

## 📁 Estructura de carpetas

```
docs/
├── README.md                 # Índice principal de documentación
├── NAVIGATION.md            # Este archivo - índice navegable
├── setup/                   # Configuración inicial
│   ├── ENV_SETUP.md        # Setup rápido de variables de entorno
│   └── ENVIRONMENT_VARIABLES.md # Guía completa de variables de entorno
├── auth/                    # Documentación de autenticación
│   ├── AUTH_SYSTEM.md      # Sistema completo de autenticación
│   └── GOOGLE_AUTH_SETUP.md # Configuración de Google OAuth
├── database/               # Base de datos
│   ├── README.md           # Configuración de Supabase y migraciones
│   ├── CRUD_OPERATIONS.md  # Documentación de operaciones CRUD
│   └── MIGRATIONS.md       # Guía detallada de migraciones
├── deployment/             # Despliegue
│   ├── README.md           # Información de despliegue
│   ├── APPLY_MIGRATIONS.md # Guía rápida para aplicar migraciones
│   └── MIGRACIONES_PARA_APLICAR.md # SQL completo listo para copiar
├── development/            # Desarrollo
│   ├── README.md           # Información para desarrolladores
│   └── CRUD_IMPLEMENTATION_SUMMARY.md # Resumen de implementación
└── testing/                # Testing
    ├── README.md           # Información de testing
    ├── VERIFICATION_CHECKLIST.md # Lista de verificación
    └── GOOGLE_OAUTH_CHECKLIST.md # Checklist de Google OAuth
```

## 🏷️ Tags y etiquetas

### Por nivel de dificultad:
- 🟢 **Básico**: ENV_SETUP.md, README.md, APPLY_MIGRATIONS.md, MIGRACIONES_PARA_APLICAR.md
- 🟡 **Intermedio**: AUTH_SYSTEM.md, database/README.md, VERIFICATION_CHECKLIST.md, GOOGLE_OAUTH_CHECKLIST.md
- 🔴 **Avanzado**: GOOGLE_AUTH_SETUP.md, ENVIRONMENT_VARIABLES.md, CRUD_IMPLEMENTATION_SUMMARY.md

### Por urgencia para nuevo setup:
- ⚡ **Crítico**: ENV_SETUP.md, MIGRACIONES_PARA_APLICAR.md
- 📋 **Importante**: AUTH_SYSTEM.md, database/README.md, APPLY_MIGRATIONS.md
- 🎯 **Opcional**: GOOGLE_AUTH_SETUP.md, VERIFICATION_CHECKLIST.md, GOOGLE_OAUTH_CHECKLIST.md

### Por audiencia:
- 👨‍💻 **Desarrolladores**: AUTH_SYSTEM.md, CRUD_IMPLEMENTATION_SUMMARY.md, ENVIRONMENT_VARIABLES.md
- ⚙️ **DevOps**: ENVIRONMENT_VARIABLES.md, MIGRACIONES_PARA_APLICAR.md, APPLY_MIGRATIONS.md, database/README.md
- 🧪 **QA/Testing**: VERIFICATION_CHECKLIST.md, GOOGLE_OAUTH_CHECKLIST.md, CRUD_IMPLEMENTATION_SUMMARY.md
- 🚀 **Product**: README.md, AUTH_SYSTEM.md, CRUD_IMPLEMENTATION_SUMMARY.md
