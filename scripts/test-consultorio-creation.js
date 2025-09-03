// Script de prueba para verificar la creación de consultorios
// Ejecutar con: node scripts/test-consultorio-creation.js

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase (usar variables de entorno)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  console.log('Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConsultorioCreation() {
  console.log('🧪 Iniciando pruebas de creación de consultorios...\n');

  try {
    // 1. Verificar conexión a Supabase
    console.log('1️⃣ Verificando conexión a Supabase...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('⚠️  No hay usuario autenticado, esto es normal para pruebas');
    } else if (user) {
      console.log(`✅ Usuario autenticado: ${user.email}`);
    }

    // 2. Verificar estructura de la tabla consultorios
    console.log('\n2️⃣ Verificando estructura de la tabla consultorios...');
    const { data: consultorioColumns, error: columnsError } = await supabase
      .from('consultorios')
      .select('*')
      .limit(1);

    if (columnsError) {
      console.error('❌ Error al acceder a la tabla consultorios:', columnsError);
      return;
    }

    console.log('✅ Tabla consultorios accesible');
    console.log('📋 Columnas disponibles:', Object.keys(consultorioColumns[0] || {}));

    // 3. Verificar bucket de storage
    console.log('\n3️⃣ Verificando bucket de storage...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error al listar buckets:', bucketsError);
    } else {
      const consultoriosBucket = buckets.find(b => b.name === 'consultorios');
      if (consultoriosBucket) {
        console.log('✅ Bucket "consultorios" encontrado');
        console.log('📊 Información del bucket:', {
          name: consultoriosBucket.name,
          public: consultoriosBucket.public,
          file_size_limit: consultoriosBucket.file_size_limit,
          allowed_mime_types: consultoriosBucket.allowed_mime_types
        });
      } else {
        console.log('❌ Bucket "consultorios" no encontrado');
      }
    }

    // 4. Verificar políticas de storage
    console.log('\n4️⃣ Verificando políticas de storage...');
    const { data: storagePolicies, error: policiesError } = await supabase
      .rpc('get_storage_policies');

    if (policiesError) {
      console.log('⚠️  No se pudieron obtener las políticas de storage directamente');
      console.log('💡 Esto puede ser normal en algunos entornos');
    } else {
      console.log('📋 Políticas de storage:', storagePolicies);
    }

    // 5. Verificar RLS en la tabla consultorios
    console.log('\n5️⃣ Verificando RLS en consultorios...');
    const { data: rlsInfo, error: rlsError } = await supabase
      .rpc('get_table_rls_info', { table_name: 'consultorios' });

    if (rlsError) {
      console.log('⚠️  No se pudo obtener información de RLS directamente');
    } else {
      console.log('🔒 Información de RLS:', rlsInfo);
    }

    // 6. Intentar crear un consultorio de prueba (solo si hay usuario autenticado)
    if (user) {
      console.log('\n6️⃣ Probando creación de consultorio...');
      
      const testConsultorio = {
        titulo: "Consultorio de prueba",
        descripcion: "Descripción de prueba",
        direccion: "Calle de prueba 123",
        ciudad: "Ciudad de prueba",
        estado: "Estado de prueba",
        codigo_postal: "12345",
        precio_por_hora: 200,
        metros_cuadrados: 25,
        numero_consultorios: 1,
        especialidades: ["Medicina General"],
        servicios: ["Consulta médica"],
        equipamiento: ["Estetoscopio"],
        permite_mascotas: false,
        estacionamiento: true,
        wifi: true,
        aire_acondicionado: false,
        propietario_id: user.id
      };

      const { data: newConsultorio, error: createError } = await supabase
        .from('consultorios')
        .insert(testConsultorio)
        .select()
        .single();

      if (createError) {
        console.error('❌ Error al crear consultorio:', createError);
        
        // Analizar el error
        if (createError.code === '42501') {
          console.log('🔒 Error de permisos - verificar políticas RLS');
        } else if (createError.code === '23505') {
          console.log('🔑 Error de clave duplicada');
        } else if (createError.code === '23502') {
          console.log('📝 Error de campo requerido faltante');
        }
      } else {
        console.log('✅ Consultorio creado exitosamente:', newConsultorio.id);
        
        // Limpiar el consultorio de prueba
        const { error: deleteError } = await supabase
          .from('consultorios')
          .delete()
          .eq('id', newConsultorio.id);
        
        if (deleteError) {
          console.log('⚠️  No se pudo eliminar el consultorio de prueba:', deleteError);
        } else {
          console.log('🧹 Consultorio de prueba eliminado');
        }
      }
    } else {
      console.log('\n6️⃣ Omitiendo prueba de creación (no hay usuario autenticado)');
    }

    // 7. Verificar políticas de la tabla consultorios
    console.log('\n7️⃣ Verificando políticas de la tabla consultorios...');
    const { data: tablePolicies, error: tablePoliciesError } = await supabase
      .rpc('get_table_policies', { table_name: 'consultorios' });

    if (tablePoliciesError) {
      console.log('⚠️  No se pudieron obtener las políticas de la tabla directamente');
    } else {
      console.log('📋 Políticas de la tabla consultorios:', tablePolicies);
    }

    console.log('\n✅ Pruebas completadas');
    console.log('\n📝 Resumen de problemas encontrados:');
    console.log('- Si hay errores de permisos, verificar políticas RLS');
    console.log('- Si no se puede crear consultorio, verificar estructura de la tabla');
    console.log('- Si no se pueden subir imágenes, verificar políticas de storage');

  } catch (error) {
    console.error('❌ Error general durante las pruebas:', error);
  }
}

// Ejecutar las pruebas
testConsultorioCreation();
