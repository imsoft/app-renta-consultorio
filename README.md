# 🏥 WellPoint - Plataforma de Alquiler de Consultorios Médicos

WellPoint es una plataforma moderna que conecta profesionales de la salud con propietarios de espacios médicos, facilitando el alquiler de consultorios de manera segura y eficiente.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-green)
![Stripe](https://img.shields.io/badge/Stripe-Connect-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue)

## ✨ Características principales

- 🔐 **Sistema de autenticación completo** (Email/Password + Google OAuth)
- 👨‍⚕️ **Gestión de perfiles** para profesionales y propietarios
- 🏢 **CRUD completo de consultorios** con filtros avanzados
- 📅 **Sistema de reservas** con gestión de estados y disponibilidad
- 💳 **Sistema de pagos completo** con Stripe Connect (comisión 3% automática)
- ⭐ **Sistema de favoritos** para guardar consultorios preferidos
- 🌟 **Calificaciones y reseñas** con sistema de puntuación detallado
- 📸 **Gestión de imágenes** con Supabase Storage
- 📱 **Diseño responsive** y moderno con shadcn/ui
- 🔒 **Seguridad robusta** con RLS en Supabase
- 🗄️ **Base de datos completa** con 9 tablas principales
- 🤖 **Webhooks automáticos** para sincronización de pagos

## 🚀 Inicio rápido

### Prerrequisitos

- Node.js 18+ y pnpm
- Cuenta de Supabase
- Cuenta de Google Cloud (para OAuth)
- Cuenta de Stripe (para pagos)

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
   # Crear archivo .env.local con variables de Supabase y Stripe
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
   STRIPE_SECRET_KEY=sk_test_tu_stripe_secret
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu_stripe_public
   STRIPE_CONNECT_CLIENT_ID=ca_tu_connect_client_id
   STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret
   ```
   Seguir la guía completa en [docs/setup/ENV_SETUP.md](./docs/setup/ENV_SETUP.md)

4. **Aplicar migraciones de base de datos**:
   Ver la [guía rápida](./docs/deployment/APPLY_MIGRATIONS.md) para configurar todas las tablas

5. **Configurar webhooks de Stripe**:
   - Crear endpoint en Stripe Dashboard: `https://tu-dominio.com/api/stripe/webhooks`
   - Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`, `account.updated`
   - Copiar webhook secret al `.env.local`

6. **Ejecutar en desarrollo**:
   ```bash
   pnpm dev
   ```

7. **Abrir en el navegador**: [http://localhost:3000](http://localhost:3000)

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
- **[🚀 Despliegue](./docs/deployment/)** - Migraciones y configuración de producción
- **[🧪 Testing](./docs/testing/)** - Verificación y listas de comprobación
- **[⚡ Desarrollo](./docs/development/)** - Guías para desarrolladores

### Guías de inicio rápido:
- [Configurar variables de entorno](./docs/setup/ENV_SETUP.md)
- [Aplicar migraciones de BD](./docs/deployment/APPLY_MIGRATIONS.md) ⚡ **ACTUALIZADO**
- [Sistema de autenticación](./docs/auth/AUTH_SYSTEM.md)
- [Operaciones CRUD completas](./docs/database/CRUD_OPERATIONS.md) 
- [Configurar Google OAuth](./docs/auth/GOOGLE_AUTH_SETUP.md)
- [Sistema de pagos Stripe](./docs/development/STRIPE_SETUP.md) 🆕 **NUEVO**

## 🛠️ Stack tecnológico

- **Frontend**: Next.js 15, React 18, TypeScript
- **Estilos**: Tailwind CSS, shadcn/ui, Lucide Icons
- **Estado**: Zustand
- **Formularios**: React Hook Form + Zod
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Pagos**: Stripe Connect (marketplace payments)
- **Despliegue**: Vercel

## 📁 Estructura del proyecto

```
wellpoint/
├── src/
│   ├── app/                    # App Router (Next.js 15)
│   │   ├── (auth)/            # Páginas de autenticación
│   │   ├── (dashboard)/       # Dashboard del usuario
│   │   │   ├── checkout/      # Sistema de pagos
│   │   │   └── pagos/         # Dashboard de pagos
│   │   ├── (consultorios)/    # Gestión de consultorios
│   │   ├── (info)/            # Páginas informativas
│   │   └── api/               # API Routes
│   │       └── stripe/        # Endpoints de Stripe
│   ├── components/            # Componentes reutilizables
│   │   ├── checkout/          # Componentes de pagos
│   │   └── ui/               # Componentes base
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

## 💳 Sistema de pagos

- ✅ **Stripe Connect** para marketplace payments
- ✅ **Comisión automática** del 3% para la plataforma
- ✅ **97% directo a propietarios** sin intermediarios
- ✅ **Onboarding simplificado** para cuentas Express
- ✅ **Checkout seguro** con elementos de Stripe
- ✅ **Webhooks automáticos** para sincronización
- ✅ **Dashboard de ganancias** para propietarios
- ✅ **Soporte internacional** de tarjetas

### 💰 Modelo de monetización

```
Transacción de $100 MXN:
├── $97 MXN → Owner (97%)
├── $3 MXN → WellPoint (3%)
└── Transferencia automática
```

**Flujo de pago:**
1. Professional reserva consultorio
2. Paga con tarjeta en checkout seguro
3. Stripe procesa pago automáticamente
4. Owner recibe 97% directo en su cuenta
5. WellPoint recibe 3% de comisión
6. Webhook actualiza estados en tiempo real

## 🗄️ Base de datos

Utiliza Supabase con PostgreSQL y las siguientes tablas principales:

- `profiles` - Perfiles de usuario con roles y verificación
- `consultorios` - Espacios médicos con detalles completos
- `reservas` - Sistema de reservas con estados y pagos
- `favoritos` - Consultorios favoritos por usuario
- `calificaciones` - Sistema de reseñas con puntuación detallada
- `stripe_accounts` - Cuentas conectadas de Stripe para owners
- `stripe_payments` - Transacciones y comisiones de pagos
- `stripe_webhooks` - Log de eventos de Stripe para debugging
- `storage` - Buckets para avatars e imágenes de consultorios

**🔧 Configuración completa**:
- ✅ Row Level Security (RLS) en todas las tablas
- ✅ Triggers automáticos para timestamps
- ✅ Funciones de validación de disponibilidad
- ✅ Policies de seguridad granulares
- ✅ Storage con políticas de acceso
- ✅ Función `get_owner_earnings` para estadísticas de pagos
- ✅ Webhooks logging para debugging de Stripe

Ver la [documentación completa de la BD](./docs/database/README.md) y [operaciones CRUD](./docs/database/CRUD_OPERATIONS.md).

## 🔌 API Endpoints

### Stripe Connect
- `POST /api/stripe/connect/create-account` - Crear cuenta Express
- `GET /api/stripe/connect/account-status` - Estado de cuenta
- `POST /api/stripe/payments/create-payment-intent` - Crear payment intent
- `POST /api/stripe/webhooks` - Recibir eventos de Stripe

### Autenticación & Usuarios  
- Manejada automáticamente por Supabase Auth
- Google OAuth integrado
- RLS automático en todas las consultas

### Gestión de Contenido
- CRUD de consultorios vía Supabase client
- Sistema de reservas con validación
- Favoritos y calificaciones por usuario

## 🚀 Despliegue

### Vercel (recomendado)

1. Conectar repositorio con Vercel
2. Configurar variables de entorno
3. Desplegar automáticamente

### Variables de entorno para producción

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Stripe Connect
STRIPE_SECRET_KEY=sk_live_tu_stripe_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_tu_stripe_public
STRIPE_CONNECT_CLIENT_ID=ca_tu_connect_client_id
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret
```

### Configuración adicional para producción

1. **Stripe Webhooks**:
   - Crear endpoint: `https://tu-dominio.com/api/stripe/webhooks`
   - Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`, `account.updated`

2. **Supabase RLS**:
   - Verificar que todas las políticas estén activas
   - Configurar Storage buckets con políticas correctas

3. **Dominio personalizado**:
   - Configurar DNS para `wellpoint.app`
   - Certificado SSL automático con Vercel

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