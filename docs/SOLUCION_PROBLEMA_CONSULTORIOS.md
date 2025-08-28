# 🔧 Solución al Problema de Creación de Consultorios

## 📋 Problema Reportado

El usuario reporta que no puede avanzar en el proceso de registro como proveedor/propietario, específicamente en la parte donde debe subir fotos y publicar el consultorio.

## 🔍 Análisis del Problema

### Problemas Identificados:

1. **❌ Políticas de Storage Faltantes**: Las políticas RLS para INSERT, UPDATE y DELETE en el bucket de storage `consultorios` no están aplicadas
2. **❌ Manejo Inadecuado de Imágenes**: El código actual guarda imágenes como base64 en la base de datos en lugar de subirlas al storage
3. **❌ Falta de Validaciones**: No hay validaciones suficientes para el rol de usuario y estado de autenticación
4. **❌ Mensajes de Error Genéricos**: Los errores no proporcionan información específica sobre el problema

## ✅ Soluciones Implementadas

### 1. Funciones de Storage Mejoradas

**Archivo**: `src/lib/supabase.ts`

```typescript
export const uploadConsultorioImage = async (file: File, consultorioId: string) => {
  // Sube imágenes al storage de Supabase en lugar de guardarlas como base64
}

export const deleteConsultorioImage = async (fileName: string) => {
  // Elimina imágenes del storage
}
```

### 2. Store Actualizado

**Archivo**: `src/stores/supabaseStore.ts`

- ✅ Función `createConsultorio` mejorada
- ✅ Manejo de imágenes base64 → storage
- ✅ Validaciones de usuario y rol
- ✅ Mejor manejo de errores

### 3. Formulario Mejorado

**Archivo**: `src/app/(consultorios)/consultorios/crear/page.tsx`

- ✅ Validaciones de autenticación
- ✅ Validaciones de rol de usuario
- ✅ Mensajes de error específicos
- ✅ Componente de debug para desarrollo

### 4. Componente de Debug

**Archivo**: `src/components/DebugInfo.tsx`

- ✅ Muestra información de autenticación
- ✅ Muestra rol de usuario
- ✅ Muestra estado de verificación
- ✅ Solo visible en desarrollo

## 🚀 Pasos para Aplicar la Solución

### Paso 1: Aplicar Migración de Storage

**Problema**: Faltan políticas de storage para consultorios

**Solución**: Aplicar la siguiente migración en Supabase:

```sql
-- Políticas de storage para consultorios (INSERT, UPDATE, DELETE)
CREATE POLICY "Owners can upload consultorio images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'consultorios'
    AND EXISTS (
      SELECT 1 FROM consultorios 
      WHERE id::text = (storage.foldername(name))[1]
      AND propietario_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update consultorio images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'consultorios'
    AND EXISTS (
      SELECT 1 FROM consultorios 
      WHERE id::text = (storage.foldername(name))[1]
      AND propietario_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete consultorio images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'consultorios'
    AND EXISTS (
      SELECT 1 FROM consultorios 
      WHERE id::text = (storage.foldername(name))[1]
      AND propietario_id = auth.uid()
    )
  );
```

### Paso 2: Verificar Configuración

Ejecutar el script de prueba:

```bash
node scripts/test-consultorio-creation.js
```

### Paso 3: Probar el Flujo Completo

1. **Registrar usuario como propietario**
2. **Navegar a "Crear Consultorio"**
3. **Completar formulario paso a paso**
4. **Subir imágenes**
5. **Publicar consultorio**

## 🔧 Verificaciones Adicionales

### 1. Verificar Rol de Usuario

```sql
-- Verificar que el usuario tenga rol "owner"
SELECT id, email, role FROM profiles WHERE email = 'usuario@ejemplo.com';
```

### 2. Verificar Políticas RLS

```sql
-- Verificar políticas de consultorios
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'consultorios';
```

### 3. Verificar Storage Buckets

```sql
-- Verificar buckets de storage
SELECT * FROM storage.buckets;
```

## 📝 Checklist de Verificación

- [ ] Migración de storage aplicada
- [ ] Usuario tiene rol "owner"
- [ ] Usuario está autenticado
- [ ] Políticas RLS funcionando
- [ ] Buckets de storage creados
- [ ] Políticas de storage aplicadas
- [ ] Formulario valida correctamente
- [ ] Imágenes se suben al storage
- [ ] Consultorio se crea exitosamente

## 🐛 Debugging

### Componente de Debug

En desarrollo, el componente `DebugInfo` mostrará:
- Estado de autenticación
- ID de usuario
- Email
- Rol
- Estado de verificación

### Logs de Consola

Revisar la consola del navegador para:
- Errores de validación
- Errores de storage
- Errores de RLS
- Información de debug

### Script de Prueba

El script `test-consultorio-creation.js` verifica:
- Conexión a Supabase
- Tablas existentes
- Políticas RLS
- Storage buckets
- Políticas de storage

## 🎯 Resultado Esperado

Después de aplicar todas las soluciones:

1. ✅ Los usuarios pueden registrarse como propietarios
2. ✅ Pueden navegar al formulario de crear consultorio
3. ✅ Pueden completar todos los pasos del formulario
4. ✅ Pueden subir imágenes sin problemas
5. ✅ Pueden publicar el consultorio exitosamente
6. ✅ Las imágenes se almacenan correctamente en el storage
7. ✅ El consultorio aparece en la lista de consultorios

## 📞 Soporte

Si el problema persiste después de aplicar estas soluciones:

1. Revisar los logs de Supabase
2. Verificar la consola del navegador
3. Usar el componente de debug
4. Ejecutar el script de prueba
5. Contactar al equipo de desarrollo
