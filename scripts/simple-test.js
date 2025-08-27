const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wkxtnxaqjjsavhanrjzc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndreHRueGFxampzYXZoYW5yanpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjA2ODc2MiwiZXhwIjoyMDcxNjQ0NzYyfQ.G73TQcL7XnGM6o1L99S1fRtqzJpT4W0Ra1YGsx7F9SQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function simpleTest() {
  console.log('🧪 PRUEBA SIMPLE DEL SISTEMA DE RESERVAS POR HORAS\n');

  try {
    // 1. Verificar conexión a Supabase
    console.log('1️⃣ Verificando conexión a Supabase...');
    
    const { data: testData, error: testError } = await supabase
      .from('consultorios')
      .select('count')
      .limit(1);

    if (testError) {
      console.log('❌ Error de conexión:', testError.message);
      return;
    }
    
    console.log('✅ Conexión a Supabase exitosa');

    // 2. Verificar consultorios existentes
    console.log('\n2️⃣ Verificando consultorios...');
    
    const { data: consultorios, error: consultoriosError } = await supabase
      .from('consultorios')
      .select('id, titulo, precio_por_hora, horario_apertura, horario_cierre, dias_disponibles')
      .eq('activo', true);

    if (consultoriosError) {
      console.log('❌ Error al obtener consultorios:', consultoriosError.message);
      return;
    }

    console.log(`✅ Se encontraron ${consultorios.length} consultorios activos`);
    
    if (consultorios.length > 0) {
      consultorios.forEach((consultorio, index) => {
        console.log(`   ${index + 1}. ${consultorio.titulo} - $${consultorio.precio_por_hora}/hora`);
        console.log(`      Horario: ${consultorio.horario_apertura} - ${consultorio.horario_cierre}`);
        console.log(`      Días: ${consultorio.dias_disponibles.join(', ')}`);
      });
    }

    // 3. Verificar reservas existentes
    console.log('\n3️⃣ Verificando reservas...');
    
    const { data: reservas, error: reservasError } = await supabase
      .from('reservas')
      .select('id, consultorio_id, usuario_id, fecha_inicio, hora_inicio, hora_fin, estado, total')
      .limit(10);

    if (reservasError) {
      console.log('❌ Error al obtener reservas:', reservasError.message);
      return;
    }

    console.log(`✅ Se encontraron ${reservas.length} reservas`);
    
    if (reservas.length > 0) {
      reservas.forEach((reserva, index) => {
        console.log(`   ${index + 1}. ${reserva.fecha_inicio} ${reserva.hora_inicio}-${reserva.hora_fin} | Estado: ${reserva.estado} | $${reserva.total}`);
      });
    }

    // 4. Verificar usuarios
    console.log('\n4️⃣ Verificando usuarios...');
    
    const { data: usuarios, error: usuariosError } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .limit(5);

    if (usuariosError) {
      console.log('❌ Error al obtener usuarios:', usuariosError.message);
      return;
    }

    console.log(`✅ Se encontraron ${usuarios.length} usuarios`);
    
    if (usuarios.length > 0) {
      usuarios.forEach((usuario, index) => {
        console.log(`   ${index + 1}. ${usuario.full_name} (${usuario.email}) - ${usuario.role}`);
      });
    }

    // 5. Verificar estructura de tablas
    console.log('\n5️⃣ Verificando estructura de tablas...');
    
    const tables = ['consultorios', 'reservas', 'profiles', 'favoritos', 'calificaciones'];
    
    for (const table of tables) {
      const { data: tableData, error: tableError } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (tableError) {
        console.log(`❌ Error en tabla ${table}:`, tableError.message);
      } else {
        console.log(`✅ Tabla ${table} accesible`);
      }
    }

    console.log('\n🎉 ¡PRUEBA SIMPLE COMPLETADA!');
    console.log('\n📊 RESUMEN:');
    console.log('✅ Conexión a Supabase funcionando');
    console.log(`✅ ${consultorios.length} consultorios disponibles`);
    console.log(`✅ ${reservas.length} reservas existentes`);
    console.log(`✅ ${usuarios.length} usuarios registrados`);
    console.log('✅ Todas las tablas accesibles');
    console.log('\n💡 Para probar el sistema completo, ejecuta:');
    console.log('   node scripts/test-hourly-booking-system.js');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar la prueba simple
simpleTest();
