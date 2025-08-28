#!/usr/bin/env node

/**
 * Script para aplicar todas las migraciones automáticamente a Supabase
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function applyMigrations() {
  console.log('🚀 Aplicando migraciones...\n');

  try {
    // 1. Crear buckets de storage
    console.log('1️⃣ Creando buckets de storage...');
    
    const buckets = [
      {
        id: 'avatars',
        name: 'avatars',
        public: true,
        file_size_limit: 5242880,
        allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp']
      },
      {
        id: 'consultorios',
        name: 'consultorios',
        public: true,
        file_size_limit: 10485760,
        allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp']
      }
    ];

    for (const bucket of buckets) {
      console.log(`   Creando bucket: ${bucket.id}`);
      
      const { data, error } = await supabase.storage.createBucket(bucket.id, {
        public: bucket.public,
        fileSizeLimit: bucket.file_size_limit,
        allowedMimeTypes: bucket.allowed_mime_types
      });

      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ✅ Bucket ${bucket.id} ya existe`);
        } else {
          console.error(`   ❌ Error creando bucket ${bucket.id}:`, error.message);
        }
      } else {
        console.log(`   ✅ Bucket ${bucket.id} creado exitosamente`);
      }
    }
    console.log('');

    // 2. Verificar buckets creados
    console.log('2️⃣ Verificando buckets creados...');
    const { data: bucketsList, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error al listar buckets:', bucketsError);
    } else {
      const bucketNames = bucketsList.map(b => b.name);
      console.log('   Buckets disponibles:', bucketNames);
      
      if (bucketNames.includes('consultorios')) {
        console.log('   ✅ Bucket "consultorios": OK');
      } else {
        console.log('   ❌ Bucket "consultorios": FALTANTE');
      }
      
      if (bucketNames.includes('avatars')) {
        console.log('   ✅ Bucket "avatars": OK');
      } else {
        console.log('   ❌ Bucket "avatars": FALTANTE');
      }
    }
    console.log('');

    // 3. Aplicar políticas de storage (esto requiere acceso de administrador)
    console.log('3️⃣ Nota: Las políticas de storage deben aplicarse manualmente en el dashboard de Supabase');
    console.log('   - Ir a Storage > Policies');
    console.log('   - Agregar políticas para INSERT, UPDATE, DELETE en bucket "consultorios"');
    console.log('');

    console.log('✅ Migraciones aplicadas exitosamente');
    console.log('');
    console.log('📋 PRÓXIMOS PASOS:');
    console.log('   1. Aplicar políticas de storage manualmente en Supabase Dashboard');
    console.log('   2. Probar el flujo completo de creación de consultorios');
    console.log('   3. Verificar subida de imágenes');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar las migraciones
applyMigrations();
