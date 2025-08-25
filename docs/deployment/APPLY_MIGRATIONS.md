# 🚀 Guía rápida: Aplicar Migraciones

Esta guía te ayudará a aplicar todas las migraciones necesarias para que WellPoint funcione completamente.

## ⚡ Pasos rápidos

### 1. Acceder a Supabase Dashboard
- Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Selecciona tu proyecto WellPoint

### 2. Ir al SQL Editor
- Clic en "SQL Editor" en el menú lateral
- Clic en "New query"

### 3. Aplicar migraciones (en orden)

**IMPORTANTE**: Ejecuta cada migración en el orden mostrado.

#### Migración 1: Perfiles
```sql
-- Copia y pega el contenido de: supabase/migrations/20250124000001_create_profiles_table.sql
-- Clic en "Run"
```

#### Migración 2: Consultorios
```sql
-- Copia y pega el contenido de: supabase/migrations/20250124000002_create_consultorios_table.sql
-- Clic en "Run"
```

#### Migración 3: Reservas
```sql
-- Copia y pega el contenido de: supabase/migrations/20250124000003_create_reservas_table.sql
-- Clic en "Run"
```

#### Migración 4: Favoritos
```sql
-- Copia y pega el contenido de: supabase/migrations/20250124000004_create_favoritos_table.sql
-- Clic en "Run"
```

#### Migración 5: Calificaciones
```sql
-- Copia y pega el contenido de: supabase/migrations/20250124000005_create_calificaciones_table.sql
-- Clic en "Run"
```

#### Migración 6: Storage
```sql
-- Copia y pega el contenido de: supabase/migrations/20250124000006_create_storage_buckets.sql
-- Clic en "Run"
```

### 4. Verificar
Ejecuta esta query para verificar que todo se creó correctamente:

```sql
-- Verificar tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verificar storage buckets
SELECT name FROM storage.buckets;
```

Deberías ver:
- **Tablas**: `calificaciones`, `consultorios`, `favoritos`, `profiles`, `reservas`
- **Buckets**: `avatars`, `consultorios`

## ✅ ¡Listo!

Una vez aplicadas todas las migraciones:

1. **Reinicia la aplicación**: `pnpm dev`
2. **Prueba el registro**: Ve a `/registro` y crea una cuenta
3. **Prueba crear consultorio**: Ve a `/consultorios/crear`

## 📚 Documentación completa

- [Guía detallada de migraciones](../database/MIGRATIONS.md)
- [Documentación completa de CRUD](../database/CRUD_OPERATIONS.md)

## 🆘 Si algo sale mal

1. **Error en migración**: Revisa que copiaste el SQL completo
2. **Tablas no aparecen**: Verifica que ejecutaste en orden
3. **Problemas de permisos**: Asegúrate de ser owner del proyecto

**¿Necesitas ayuda?** Revisa la documentación completa en `../database/`
