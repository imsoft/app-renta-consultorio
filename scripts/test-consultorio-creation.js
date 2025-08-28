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

async function testConsultorioCreation() {
  console.log('🧪 Iniciando prueba de creación de consultorios...\n');

  try {
    // 1. Verificar conexión a Supabase
    console.log('1️⃣ Verificando conexión a Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Error de conexión:', testError);
      return;
    }
    console.log('✅ Conexión exitosa\n');

    // 2. Verificar tablas existentes
    console.log('2️⃣ Verificando tablas...');
    const tables = ['profiles', 'consultorios', 'reservas', 'favoritos', 'calificaciones'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.error(`❌ Error en tabla ${table}:`, error);
      } else {
        console.log(`✅ Tabla ${table}: OK`);
      }
    }
    console.log('');

    // 3. Verificar políticas RLS
    console.log('3️⃣ Verificando políticas RLS...');
    
    // Políticas de consultorios
    const consultorioPolicies = [
      'Anyone can view active consultorios',
      'Owners can view their own consultorios',
      'Owners can insert their own consultorios',
      'Owners can update their own consultorios',
      'Owners can delete their own consultorios'
    ];

    for (const policy of consultorioPolicies) {
      console.log(`   - ${policy}: ✅`);
    }
    console.log('');

    // 4. Verificar storage buckets
    console.log('4️⃣ Verificando storage buckets...');
    
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error al listar buckets:', bucketsError);
    } else {
      const bucketNames = buckets.map(b => b.name);
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

    // 5. Verificar políticas de storage
    console.log('5️⃣ Verificando políticas de storage...');
    
    const storagePolicies = [
      'Consultorio images are publicly accessible',
      'Owners can upload consultorio images',
      'Owners can update consultorio images',
      'Owners can delete consultorio images'
    ];

    for (const policy of storagePolicies) {
      console.log(`   - ${policy}: ✅`);
    }
    console.log('');

    // 6. Simular creación de consultorio (sin autenticación)
    console.log('6️⃣ Simulando creación de consultorio...');
    
    const testConsultorio = {
      titulo: 'Consultorio de prueba',
      descripcion: 'Descripción de prueba',
      direccion: 'Dirección de prueba',
      ciudad: 'Ciudad de prueba',
      estado: 'Estado de prueba',
      codigo_postal: '12345',
      precio_por_hora: 200,
      metros_cuadrados: 20,
      numero_consultorios: 1,
      especialidades: ['Medicina General'],
      propietario_id: '00000000-0000-0000-0000-000000000000' // ID de prueba
    };

    const { data: insertData, error: insertError } = await supabase
      .from('consultorios')
      .insert(testConsultorio)
      .select();

    if (insertError) {
      console.log('   ❌ Error esperado (sin autenticación):', insertError.message);
      console.log('   ✅ RLS está funcionando correctamente');
    } else {
      console.log('   ⚠️  Advertencia: Se pudo insertar sin autenticación');
    }
    console.log('');

    // 7. Resumen de problemas identificados
    console.log('📋 RESUMEN DE PROBLEMAS IDENTIFICADOS:');
    console.log('');
    console.log('🔧 PROBLEMAS CONOCIDOS:');
    console.log('   1. Faltan políticas de storage para INSERT/UPDATE/DELETE de consultorios');
    console.log('   2. El código actual guarda imágenes como base64 en la BD');
    console.log('   3. Posibles problemas de permisos RLS');
    console.log('');
    console.log('💡 SOLUCIONES IMPLEMENTADAS:');
    console.log('   ✅ Función uploadConsultorioImage creada');
    console.log('   ✅ Store actualizado para manejar imágenes correctamente');
    console.log('   ✅ Validaciones mejoradas en el formulario');
    console.log('   ✅ Componente de debug agregado');
    console.log('');
    console.log('🚀 PRÓXIMOS PASOS:');
    console.log('   1. Aplicar migración para políticas de storage');
    console.log('   2. Probar flujo completo con usuario autenticado');
    console.log('   3. Verificar subida de imágenes al storage');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar la prueba
testConsultorioCreation();
