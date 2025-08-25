# 🏥 WellPoint - Plataforma de Alquiler de Consultorios Médicos

WellPoint es una plataforma moderna que conecta profesionales de la salud con propietarios de espacios médicos, facilitando el alquiler de consultorios de manera segura y eficiente.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue)

## ✨ Características principales

- 🔐 **Sistema de autenticación completo** (Email/Password + Google OAuth)
- 👨‍⚕️ **Gestión de perfiles** para profesionales y propietarios
- 🏢 **CRUD completo de consultorios** con filtros avanzados
- 📅 **Sistema de reservas** con gestión de estados y disponibilidad
- ⭐ **Sistema de favoritos** para guardar consultorios preferidos
- 🌟 **Calificaciones y reseñas** con sistema de puntuación detallado
- 📸 **Gestión de imágenes** con Supabase Storage
- 📱 **Diseño responsive** y moderno con shadcn/ui
- 🔒 **Seguridad robusta** con RLS en Supabase
- 🗄️ **Base de datos completa** con 6 tablas principales

## 🚀 Inicio rápido

### Prerrequisitos

- Node.js 18+ y pnpm
- Cuenta de Supabase
- Cuenta de Google Cloud (para OAuth)

### Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/imsoft/app-renta-consultorio.git
   cd app-renta-consultorio
   ```

2. **Instalar dependencias**:
   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**:
   ```bash
   # Crear archivo .env.local con las variables de Supabase
   ```
   Seguir la guía en [docs/setup/ENV_SETUP.md](./docs/setup/ENV_SETUP.md)

4. **Aplicar migraciones de base de datos**:
   Ver la [guía rápida](./APPLY_MIGRATIONS.md) para configurar todas las tablas

5. **Ejecutar en desarrollo**:
   ```bash
   pnpm dev
   ```

6. **Abrir en el navegador**: [http://localhost:3000](http://localhost:3000)

## 🔑 Credenciales de prueba

```
Profesional: doctor@test.com / password123
Propietario: propietario@test.com / password123
```

## 📚 Documentación

La documentación completa está disponible en la carpeta [`docs/`](./docs/):

- **[📋 Configuración inicial](./docs/setup/)** - Variables de entorno y configuración
- **[🔐 Sistema de autenticación](./docs/auth/)** - Guías de auth y OAuth
- **[🗄️ Base de datos](./docs/database/)** - Migraciones y estructura de BD

### Guías de inicio rápido:
- [Configurar variables de entorno](./docs/setup/ENV_SETUP.md)
- [Aplicar migraciones de BD](./APPLY_MIGRATIONS.md) ⚡ **NUEVO**
- [Sistema de autenticación](./docs/auth/AUTH_SYSTEM.md)
- [Operaciones CRUD completas](./docs/database/CRUD_OPERATIONS.md) ⚡ **NUEVO**
- [Configurar Google OAuth](./docs/auth/GOOGLE_AUTH_SETUP.md)

## 🛠️ Stack tecnológico

- **Frontend**: Next.js 15, React 18, TypeScript
- **Estilos**: Tailwind CSS, shadcn/ui, Lucide Icons
- **Estado**: Zustand
- **Formularios**: React Hook Form + Zod
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Despliegue**: Vercel

## 📁 Estructura del proyecto

```
wellpoint/
├── src/
│   ├── app/                    # App Router (Next.js 15)
│   │   ├── (auth)/            # Páginas de autenticación
│   │   ├── (dashboard)/       # Dashboard del usuario
│   │   ├── (consultorios)/    # Gestión de consultorios
│   │   └── (info)/            # Páginas informativas
│   ├── components/            # Componentes reutilizables
│   ├── stores/                # Estados globales (Zustand)
│   └── lib/                   # Utilidades y configuración
├── docs/                      # Documentación completa
├── supabase/                  # Migraciones y configuración
└── public/                    # Archivos estáticos
```

## 🔧 Comandos disponibles

```bash
# Desarrollo
pnpm dev              # Servidor de desarrollo
pnpm build            # Build de producción  
pnpm start            # Servidor de producción
pnpm lint             # Ejecutar ESLint

# Base de datos (requiere Supabase CLI)
supabase start        # Iniciar instancia local
supabase db reset     # Resetear base de datos
supabase gen types    # Generar tipos TypeScript
```

## 🎯 Roles de usuario

- **👨‍⚕️ Profesionales**: Buscan y reservan consultorios
- **🏢 Propietarios**: Publican y gestionan espacios médicos
- **⚙️ Administradores**: Gestionan la plataforma

## 🔐 Funcionalidades de autenticación

- ✅ Registro e inicio de sesión con email/contraseña
- ✅ Autenticación con Google OAuth
- ✅ Recuperación de contraseña
- ✅ Confirmación de email
- ✅ Rutas protegidas por roles
- ✅ Gestión de sesiones persistentes

## 🗄️ Base de datos

Utiliza Supabase con PostgreSQL y las siguientes tablas principales:

- `profiles` - Perfiles de usuario con roles y verificación
- `consultorios` - Espacios médicos con detalles completos
- `reservas` - Sistema de reservas con estados y pagos
- `favoritos` - Consultorios favoritos por usuario
- `calificaciones` - Sistema de reseñas con puntuación detallada
- `storage` - Buckets para avatars e imágenes de consultorios

**🔧 Configuración completa**:
- ✅ Row Level Security (RLS) en todas las tablas
- ✅ Triggers automáticos para timestamps
- ✅ Funciones de validación de disponibilidad
- ✅ Policies de seguridad granulares
- ✅ Storage con políticas de acceso

Ver la [documentación completa de la BD](./docs/database/README.md) y [operaciones CRUD](./docs/database/CRUD_OPERATIONS.md).

## 🚀 Despliegue

### Vercel (recomendado)

1. Conectar repositorio con Vercel
2. Configurar variables de entorno
3. Desplegar automáticamente

### Variables de entorno para producción

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

## 🤝 Contribuir

1. Fork del proyecto
2. Crear branch: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Add: nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/imsoft/app-renta-consultorio/issues)
- **Documentación**: [docs/](./docs/)

---

**Desarrollado con ❤️ para la comunidad médica**