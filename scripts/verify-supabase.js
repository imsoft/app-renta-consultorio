// Script para verificar la conexión con Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leer variables de entorno desde .env.local
let supabaseUrl, supabaseKey;

try {
  const envPath = path.join(__dirname, '..', '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = value;
    if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') supabaseKey = value;
    if (key === 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') supabaseKey = value; // Fallback
  });
} catch (error) {
  console.error('❌ No se pudo leer .env.local');
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  console.log('Verifica que .env.local contenga:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=...');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=...');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyConnection() {
  console.log('🔍 Verificando conexión con Supabase...');
  
  try {
    // Verificar conexión básica
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Error de conexión:', error.message);
      return false;
    }
    
    console.log('✅ Conexión con Supabase exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
    return false;
  }
}

async function verifyTables() {
  console.log('\n📋 Verificando tablas...');
  
  const tables = ['profiles', 'consultorios', 'reservas', 'favoritos', 'calificaciones'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('count').limit(1);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: OK`);
      }
    } catch (error) {
      console.log(`❌ ${table}: Error inesperado`);
    }
  }
}

async function verifyStorage() {
  console.log('\n📸 Verificando Storage...');
  
  try {
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.log('❌ Storage:', error.message);
      return;
    }
    
    const buckets = data.map(b => b.name);
    const expectedBuckets = ['avatars', 'consultorios'];
    
    for (const bucket of expectedBuckets) {
      if (buckets.includes(bucket)) {
        console.log(`✅ Bucket '${bucket}': OK`);
      } else {
        console.log(`❌ Bucket '${bucket}': No encontrado`);
      }
    }
  } catch (error) {
    console.log('❌ Storage: Error inesperado');
  }
}

async function main() {
  console.log('🚀 WellPoint - Verificación de Supabase\n');
  
  const connectionOk = await verifyConnection();
  
  if (connectionOk) {
    await verifyTables();
    await verifyStorage();
    
    console.log('\n🎉 Verificación completada!');
    console.log('\n📝 Próximos pasos:');
    console.log('1. Ve a http://localhost:3000');
    console.log('2. Registra una cuenta como "Owner"');
    console.log('3. Ve a /consultorios/crear');
    console.log('4. Crea un consultorio de prueba');
  } else {
    console.log('\n🔧 Soluciona los problemas de conexión primero');
  }
}

main().catch(console.error);
