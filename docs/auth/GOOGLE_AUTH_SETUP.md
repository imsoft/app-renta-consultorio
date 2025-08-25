# Configuración de Google OAuth en Supabase

Para habilitar la autenticación con Google en tu aplicación WellPoint, necesitas configurar Google OAuth en Supabase.

## Pasos para configurar Google OAuth

### 1. Crear un proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la Google+ API (Google People API)

### 2. Configurar OAuth consent screen

1. En el menú lateral, ve a "APIs & Services" > "OAuth consent screen"
2. Selecciona "External" y haz clic en "Create"
3. Completa la información requerida:
   - **App name**: WellPoint
   - **User support email**: tu email
   - **Developer contact information**: tu email
4. Guarda y continúa

### 3. Crear credenciales OAuth

1. Ve a "APIs & Services" > "Credentials"
2. Haz clic en "Create Credentials" > "OAuth 2.0 Client IDs"
3. Selecciona "Web application"
4. Agrega los siguientes URIs autorizados:
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (para desarrollo)
     - `https://tu-dominio.com` (para producción)
   - **Authorized redirect URIs**:
     - `https://wkxtnxaqjjsavhanrjzc.supabase.co/auth/v1/callback` (reemplaza con tu proyecto)
     - `http://localhost:3000/auth/v1/callback` (para desarrollo)

### 4. Configurar en Supabase

1. Ve a tu dashboard de Supabase
2. Navega a "Authentication" > "Providers"
3. Busca "Google" y habilítalo
4. Agrega las credenciales de Google:
   - **Client ID**: El Client ID que obtuviste de Google Cloud Console
   - **Client Secret**: El Client Secret que obtuviste de Google Cloud Console
5. Copia la Redirect URL que aparece en Supabase y agrégala a las Authorized redirect URIs en Google Cloud Console

### 5. Variables de entorno (opcional)

Si quieres personalizar la configuración, puedes agregar estas variables a tu `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu_client_id_aqui
```

### 6. URLs de redirección para producción

Una vez que tengas tu dominio de producción, asegúrate de:

1. Actualizar las URLs autorizadas en Google Cloud Console
2. Actualizar la configuración en Supabase si es necesario

## Verificación

Para verificar que la configuración funciona:

1. Ve a la página de login de tu aplicación
2. Haz clic en "Continuar con Google"
3. Deberías ser redirigido a Google para autenticar
4. Después de autenticar, deberías volver a tu aplicación logueado

## Problemas comunes

### Error "redirect_uri_mismatch"
- Verifica que las URLs de redirección en Google Cloud Console coincidan exactamente con las configuradas en Supabase
- Asegúrate de incluir tanto HTTP (desarrollo) como HTTPS (producción)

### Error "invalid_client"
- Verifica que el Client ID y Client Secret sean correctos
- Asegúrate de que el proyecto de Google Cloud tenga habilitada la Google+ API

### Error en desarrollo local
- Asegúrate de incluir `http://localhost:3000` en las JavaScript origins autorizadas
- Verifica que el puerto coincida con el que estás usando para desarrollo

## Seguridad

- Nunca expongas tu Client Secret en el código del frontend
- Usa variables de entorno para información sensible
- Revisa regularmente los permisos y accesos en Google Cloud Console
