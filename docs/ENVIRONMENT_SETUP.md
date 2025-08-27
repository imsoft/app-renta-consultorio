# 🔐 Configuración de Variables de Entorno

## ⚠️ IMPORTANTE: Seguridad

**NUNCA subas claves secretas a GitHub.** Las claves secretas deben mantenerse privadas y seguras.

## 📁 Archivo .env.local

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_CONNECT_CLIENT_ID=your_stripe_connect_client_id
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Application Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

## 🔑 Cómo Obtener las Claves

### Supabase
1. Ve a tu dashboard de Supabase
2. Selecciona tu proyecto
3. Ve a Settings > API
4. Copia las claves necesarias

### Stripe
1. Ve a tu dashboard de Stripe
2. Ve a Developers > API keys
3. Copia las claves necesarias

## 🚨 Alerta de Seguridad

Si recibiste una alerta de GitHub sobre claves expuestas:

1. **Inmediatamente:** Revoca la clave expuesta
2. **Genera una nueva clave** en tu dashboard
3. **Actualiza tu archivo .env.local** con la nueva clave
4. **Verifica que no haya más claves en el código**

## ✅ Verificación

Para verificar que todo esté configurado correctamente:

```bash
# Ejecutar prueba simple
node scripts/simple-test.js

# Ejecutar prueba completa (requiere claves válidas)
node scripts/test-hourly-booking-system.js
```

## 📝 Notas

- El archivo `.env.local` está en `.gitignore` y no se subirá a GitHub
- Las claves públicas (NEXT_PUBLIC_*) son seguras de exponer
- Las claves privadas (sin NEXT_PUBLIC_) deben mantenerse secretas
