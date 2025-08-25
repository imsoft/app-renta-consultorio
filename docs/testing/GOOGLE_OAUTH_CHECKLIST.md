# 🔐 Checklist de verificación - Google OAuth

Esta lista te ayudará a verificar que Google OAuth esté funcionando correctamente en WellPoint.

## ✅ **Configuración previa completada**

- [x] Google OAuth habilitado en Supabase Dashboard
- [x] Variables de entorno configuradas
- [x] Función `signInWithGoogle` implementada
- [x] Botón de Google agregado en página de login
- [x] SupabaseProvider configurado para manejo automático de perfiles

---

## 🧪 **Pruebas de funcionalidad**

### 1. **Verificar configuración en Supabase**

#### En Supabase Dashboard:
- [ ] Ir a Authentication > Providers
- [ ] Verificar que Google está habilitado ✅
- [ ] Verificar Client ID y Client Secret configurados ✅
- [ ] Copiar la Redirect URL mostrada

#### En Authentication > URL Configuration:
- [ ] Site URL: `http://localhost:3000`
- [ ] Redirect URLs: `http://localhost:3000/dashboard`

### 2. **Verificar configuración en Google Cloud Console**

#### En Credentials > OAuth 2.0 Client IDs:
- [ ] **Authorized JavaScript origins**:
  - `http://localhost:3000`
  - `https://tu-dominio.com` (para producción)
  
- [ ] **Authorized redirect URIs**:
  - La URL copiada de Supabase (ej: `https://wkxtnxaqjjsavhanrjzc.supabase.co/auth/v1/callback`)
  - `http://localhost:3000/auth/callback` (si es necesario)

### 3. **Aplicar nueva migración**

**IMPORTANTE**: Aplica la nueva migración para el trigger automático:

```sql
-- Copiar contenido de: supabase/migrations/20250124000007_create_auto_profile_trigger.sql
-- Ejecutar en Supabase Dashboard > SQL Editor
```

### 4. **Probar Google OAuth - Registro**

#### Primer uso (nuevo usuario):
- [ ] Abrir: `http://localhost:3000/login`
- [ ] Hacer clic en "Continuar con Google"
- [ ] **Esperado**: Redirección a Google
- [ ] Seleccionar cuenta de Google que NO haya usado antes
- [ ] **Esperado**: Redirección a `/dashboard`
- [ ] **Verificar en Supabase**:
  - [ ] Usuario creado en Authentication > Users
  - [ ] Perfil creado automáticamente en Table Editor > profiles
  - [ ] Campos poblados correctamente (nombre, email, avatar)

### 5. **Probar Google OAuth - Login**

#### Usuario existente:
- [ ] Logout de la aplicación
- [ ] Ir a: `http://localhost:3000/login`
- [ ] Hacer clic en "Continuar con Google"
- [ ] Usar la MISMA cuenta de Google del paso anterior
- [ ] **Esperado**: Login automático sin formulario adicional
- [ ] **Esperado**: Redirección a `/dashboard`
- [ ] **Verificar**: Datos del usuario se mantienen

### 6. **Verificar datos del usuario**

#### En la aplicación:
- [ ] Header muestra nombre del usuario
- [ ] Avatar de Google se muestra (si disponible)
- [ ] Ir a `/perfil` y verificar datos
- [ ] Role asignado correctamente (professional por defecto)

#### En Supabase Dashboard:
- [ ] Authentication > Users: Usuario con provider "google"
- [ ] Table Editor > profiles: Datos completos del perfil
- [ ] Verificar campos: `full_name`, `avatar_url`, `role`

### 7. **Probar diferentes escenarios**

#### Con diferentes cuentas:
- [ ] **Cuenta de Google #1**: Crear como "professional"
- [ ] **Cuenta de Google #2**: Crear como "owner" (si aplicable)
- [ ] Verificar que ambos cuentan con perfiles correctos

#### Logout y re-login:
- [ ] Logout completo de la aplicación
- [ ] Logout de Google en el navegador
- [ ] Login nuevamente con Google
- [ ] **Esperado**: Flujo completo funciona

### 8. **Verificar manejo de errores**

#### Errores comunes:
- [ ] **redirect_uri_mismatch**: 
  - Verificar URLs en Google Cloud Console
  - Verificar URLs en Supabase Dashboard
  
- [ ] **invalid_client**:
  - Verificar Client ID y Secret en Supabase
  - Verificar que el proyecto de Google esté habilitado
  
- [ ] **Error al crear perfil**:
  - Verificar que la migración 007 esté aplicada
  - Verificar políticas RLS en profiles

### 9. **Verificar navegación y estados**

#### Estados de carga:
- [ ] Botón de Google muestra "Conectando..." durante OAuth
- [ ] Spinners/loading apropiados durante redirecciones
- [ ] No hay errores en la consola del navegador

#### Rutas protegidas:
- [ ] `/dashboard` requiere autenticación
- [ ] `/perfil` requiere autenticación  
- [ ] `/consultorios/crear` requiere autenticación (y role owner)

---

## 🚨 **Problemas comunes y soluciones**

### Error: "redirect_uri_mismatch"
```
✅ Solución:
1. Ir a Google Cloud Console > Credentials
2. Editar tu OAuth Client ID
3. Agregar exactamente la URL que aparece en Supabase
4. Formato: https://xxxxx.supabase.co/auth/v1/callback
```

### Error: Usuario logueado pero no se crea perfil
```
✅ Solución:
1. Aplicar migración 007 (trigger automático)
2. Verificar políticas RLS en tabla profiles
3. Revisar logs en Supabase Dashboard > Logs
```

### Error: "Client ID not found"
```
✅ Solución:
1. Verificar Client ID en Supabase Authentication > Providers
2. Asegurarse que el proyecto de Google esté activo
3. Verificar que Google+ API esté habilitada
```

### Login funciona pero no redirecciona
```
✅ Solución:
1. Verificar Site URL en Supabase: http://localhost:3000
2. Verificar Redirect URLs en Supabase: http://localhost:3000/dashboard
3. Revisar implementación de redirectTo en signInWithGoogle
```

---

## 📊 **Verificación final**

### ✅ **Todo funciona si**:
- [ ] Google OAuth redirige correctamente
- [ ] Usuarios nuevos crean perfil automáticamente
- [ ] Usuarios existentes login sin problemas
- [ ] Datos se sincronizan correctamente
- [ ] No hay errores en consola
- [ ] Rutas protegidas funcionan
- [ ] Estados de carga son apropiados

### 🎯 **Próximos pasos después de verificación**:
1. **Configurar para producción**: URLs de producción en Google Cloud Console
2. **Personalizar flujo**: Agregar selección de role durante registro
3. **Mejorar UX**: Mensajes de bienvenida para nuevos usuarios
4. **Backup de datos**: Verificar que todos los campos importantes se guarden

---

## 📞 **¿Necesitas ayuda?**

- **Documentación completa**: [docs/auth/GOOGLE_AUTH_SETUP.md](../auth/GOOGLE_AUTH_SETUP.md)
- **Logs de Supabase**: Dashboard > Logs > Auth
- **Console del navegador**: Revisar errores de red y JavaScript

---

**🎉 ¡Una vez que todos los checkboxes estén marcados, Google OAuth estará completamente funcional!**
