-- Script para limpiar roles en la base de datos
-- Ejecutar en Supabase SQL Editor

-- 1. Actualizar todos los usuarios con roles 'professional' o 'owner' a 'user'
UPDATE profiles 
SET role = 'user' 
WHERE role IN ('professional', 'owner');

-- 2. Verificar que solo existan roles 'user' y 'admin'
SELECT DISTINCT role, COUNT(*) as total_users
FROM profiles 
GROUP BY role 
ORDER BY role;

-- 3. Verificar que no haya usuarios con roles inválidos
SELECT id, email, role 
FROM profiles 
WHERE role NOT IN ('user', 'admin');

-- 4. Opcional: Si quieres eliminar usuarios con roles inválidos (¡CUIDADO!)
-- DELETE FROM profiles WHERE role NOT IN ('user', 'admin');

-- 5. Verificar la estructura de la tabla profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;
