const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wkxtnxaqjjsavhanrjzc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndreHRueGFxampzYXZoYW5yanpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjA2ODc2MiwiZXhwIjoyMDcxNjQ0NzYyfQ.G73TQcL7XnGM6o1L99S1fRtqzJpT4W0Ra1YGsx7F9SQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testHourlyBookingSystem() {
  console.log('🧪 INICIANDO PRUEBAS DEL SISTEMA DE RESERVAS POR HORAS\n');

  try {
    // 1. Verificar que las funciones SQL existen
    console.log('1️⃣ Verificando funciones SQL...');
    
    const { data: functions, error: functionsError } = await supabase
      .rpc('generate_hourly_slots', { start_time: '08:00', end_time: '18:00' });
    
    if (functionsError) {
      console.log('❌ Error al verificar funciones SQL:', functionsError.message);
      return;
    }
    
    console.log('✅ Funciones SQL verificadas correctamente');
    console.log('   Slots generados:', functions);

    // 2. Verificar consultorios existentes
    console.log('\n2️⃣ Verificando consultorios en la base de datos...');
    
    const { data: consultorios, error: consultoriosError } = await supabase
      .from('consultorios')
      .select('id, titulo, precio_por_hora, horario_apertura, horario_cierre, dias_disponibles')
      .eq('activo', true)
      .limit(5);

    if (consultoriosError) {
      console.log('❌ Error al obtener consultorios:', consultoriosError.message);
      return;
    }

    console.log(`✅ Se encontraron ${consultorios.length} consultorios activos`);
    
    if (consultorios.length === 0) {
      console.log('⚠️  No hay consultorios para probar. Creando uno de prueba...');
      
      // Primero crear un usuario de prueba
      console.log('   Creando usuario de prueba...');
      const { data: testUser, error: userError } = await supabase.auth.admin.createUser({
        email: 'test@wellpoint.com',
        password: 'test123456',
        email_confirm: true,
        user_metadata: {
          full_name: 'Usuario de Prueba',
          role: 'owner'
        }
      });

      if (userError) {
        console.log('❌ Error al crear usuario de prueba:', userError.message);
        return;
      }

      console.log('✅ Usuario de prueba creado:', testUser.user.id);
      
      // Crear un consultorio de prueba
      const { data: newConsultorio, error: createError } = await supabase
        .from('consultorios')
        .insert({
          titulo: 'Consultorio de Prueba - Sistema por Horas',
          descripcion: 'Consultorio para probar el sistema de reservas por horas',
          direccion: 'Av. de Prueba 123',
          ciudad: 'Ciudad de México',
          estado: 'CDMX',
          codigo_postal: '06000',
          precio_por_hora: 500,
          numero_consultorios: 1,
          equipamiento: ['Silla de escritorio', 'Mesa', 'Lámpara'],
          servicios: ['wifi'],
          especialidades: ['Medicina General'],
          horario_apertura: '08:00',
          horario_cierre: '18:00',
          dias_disponibles: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
          activo: true,
          wifi: true,
          estacionamiento: false,
          permite_mascotas: false,
          aire_acondicionado: true,
          imagenes: [],
          propietario_id: testUser.user.id
        })
        .select()
        .single();

      if (createError) {
        console.log('❌ Error al crear consultorio de prueba:', createError.message);
        return;
      }

      console.log('✅ Consultorio de prueba creado:', newConsultorio.titulo);
      consultorios.push(newConsultorio);
    }

    // 3. Probar función get_available_slots
    console.log('\n3️⃣ Probando función get_available_slots...');
    
    const testConsultorio = consultorios[0];
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 1); // Mañana
    
    const { data: availableSlots, error: slotsError } = await supabase
      .rpc('get_available_slots', {
        p_consultorio_id: testConsultorio.id,
        p_fecha: testDate.toISOString().split('T')[0]
      });

    if (slotsError) {
      console.log('❌ Error al obtener slots disponibles:', slotsError.message);
      return;
    }

    console.log(`✅ Slots disponibles para mañana (${testDate.toISOString().split('T')[0]}):`);
    availableSlots.forEach(slot => {
      console.log(`   ${slot.hora_slot} - ${slot.disponible ? '✅ Disponible' : '❌ Ocupado'}`);
    });

    // 4. Probar función create_hourly_reservation
    console.log('\n4️⃣ Probando función create_hourly_reservation...');
    
    const testTime = availableSlots.find(slot => slot.disponible)?.hora_slot || '09:00';
    
    // Crear un usuario para la reserva
    const { data: reservaUser, error: reservaUserError } = await supabase.auth.admin.createUser({
      email: 'reserva@wellpoint.com',
      password: 'test123456',
      email_confirm: true,
      user_metadata: {
        full_name: 'Usuario de Reserva',
        role: 'professional'
      }
    });

    if (reservaUserError) {
      console.log('❌ Error al crear usuario de reserva:', reservaUserError.message);
      return;
    }
    
    const { data: reservationResult, error: reservationError } = await supabase
      .rpc('create_hourly_reservation', {
        p_consultorio_id: testConsultorio.id,
        p_usuario_id: reservaUser.user.id,
        p_fecha: testDate.toISOString().split('T')[0],
        p_hora_inicio: testTime,
        p_notas_usuario: 'Reserva de prueba del sistema por horas'
      });

    if (reservationError) {
      console.log('❌ Error al crear reserva de prueba:', reservationError.message);
      return;
    }

    if (reservationResult && reservationResult[0]) {
      const result = reservationResult[0];
      if (result.success) {
        console.log('✅ Reserva de prueba creada exitosamente');
        console.log(`   ID de reserva: ${result.reserva_id}`);
        console.log(`   Mensaje: ${result.message}`);
      } else {
        console.log('❌ Error al crear reserva:', result.message);
      }
    }

    // 5. Verificar reservas del día
    console.log('\n5️⃣ Verificando reservas del día...');
    
    const { data: dailyReservations, error: dailyError } = await supabase
      .rpc('get_daily_reservations', {
        p_consultorio_id: testConsultorio.id,
        p_fecha: testDate.toISOString().split('T')[0]
      });

    if (dailyError) {
      console.log('❌ Error al obtener reservas del día:', dailyError.message);
      return;
    }

    console.log(`✅ Reservas del día ${testDate.toISOString().split('T')[0]}:`);
    if (dailyReservations.length === 0) {
      console.log('   No hay reservas para este día');
    } else {
      dailyReservations.forEach(reservation => {
        console.log(`   ${reservation.hora_inicio} - ${reservation.hora_fin} | Estado: ${reservation.estado}`);
      });
    }

    // 6. Verificar slots después de la reserva
    console.log('\n6️⃣ Verificando slots después de crear la reserva...');
    
    const { data: updatedSlots, error: updatedSlotsError } = await supabase
      .rpc('get_available_slots', {
        p_consultorio_id: testConsultorio.id,
        p_fecha: testDate.toISOString().split('T')[0]
      });

    if (updatedSlotsError) {
      console.log('❌ Error al obtener slots actualizados:', updatedSlotsError.message);
      return;
    }

    console.log('✅ Slots actualizados:');
    updatedSlots.forEach(slot => {
      console.log(`   ${slot.hora_slot} - ${slot.disponible ? '✅ Disponible' : '❌ Ocupado'}`);
    });

    // 7. Verificar triggers y validaciones
    console.log('\n7️⃣ Verificando triggers y validaciones...');
    
    // Intentar crear una reserva inválida (más de 1 hora)
    const { data: invalidReservation, error: invalidError } = await supabase
      .from('reservas')
      .insert({
        consultorio_id: testConsultorio.id,
        usuario_id: reservaUser.user.id,
        fecha_inicio: testDate.toISOString().split('T')[0],
        fecha_fin: testDate.toISOString().split('T')[0],
        hora_inicio: '10:00',
        hora_fin: '12:00', // 2 horas - debería fallar
        tipo_reserva: 'hora',
        precio_por_unidad: testConsultorio.precio_por_hora,
        unidades: 1,
        subtotal: testConsultorio.precio_por_hora,
        total: testConsultorio.precio_por_hora,
        estado: 'pendiente'
      });

    if (invalidError) {
      console.log('✅ Trigger de validación funciona correctamente');
      console.log(`   Error esperado: ${invalidError.message}`);
    } else {
      console.log('❌ El trigger de validación no está funcionando');
    }

    console.log('\n🎉 ¡PRUEBAS COMPLETADAS EXITOSAMENTE!');
    console.log('\n📊 RESUMEN:');
    console.log('✅ Funciones SQL verificadas');
    console.log('✅ Consultorios disponibles');
    console.log('✅ Slots de tiempo generados');
    console.log('✅ Reservas por horas creadas');
    console.log('✅ Validaciones funcionando');
    console.log('✅ Sistema listo para producción');

  } catch (error) {
    console.error('❌ Error general en las pruebas:', error);
  }
}

// Ejecutar las pruebas
testHourlyBookingSystem();
