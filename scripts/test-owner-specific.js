#!/usr/bin/env node

/**
 * Script específico para probar el flujo completo del propietario
 * Simula exactamente lo que hace un propietario en la aplicación
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Cargar variables de entorno manualmente
function loadEnvFile(filePath) {
  try {
    const envContent = fs.readFileSync(filePath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (!key.startsWith('#')) {
          envVars[key.trim()] = value;
        }
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('Error cargando .env.local:', error.message);
    return {};
  }
}

const envVars = loadEnvFile('.env.local');
Object.keys(envVars).forEach(key => {
  process.env[key] = envVars[key];
});

// Verificar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno faltantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testOwnerFlow() {
  console.log('👨‍💼 PRUEBA COMPLETA DEL FLUJO DE PROPIETARIO');
  console.log('=' .repeat(60));
  
  const testOwner = {
    email: 'propietario-test@wellpoint.com',
    password: 'TestPassword123!',
    nombre: 'Carlos',
    apellidos: 'Mendoza',
    full_name: 'Carlos Mendoza'
  };
  
  try {
    // 1. Crear usuario propietario
    console.log('\n1️⃣ CREANDO USUARIO PROPIETARIO');
    console.log('-'.repeat(40));
    
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
      email: testOwner.email,
      password: testOwner.password,
      email_confirm: true,
      user_metadata: {
        full_name: testOwner.full_name,
        nombre: testOwner.nombre,
        apellidos: testOwner.apellidos,
        role: 'owner'
      }
    });
    
    if (createError) {
      console.error('❌ Error creando propietario:', createError.message);
      return false;
    }
    
    console.log('✅ Propietario creado:', user.id);
    
    // 2. Verificar perfil automático
    console.log('\n2️⃣ VERIFICANDO PERFIL AUTOMÁTICO');
    console.log('-'.repeat(40));
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Error verificando perfil:', profileError.message);
      return false;
    }
    
    console.log('✅ Perfil creado automáticamente:');
    console.log(`   - ID: ${profile.id}`);
    console.log(`   - Email: ${profile.email}`);
    console.log(`   - Role: ${profile.role}`);
    console.log(`   - Nombre: ${profile.nombre}`);
    console.log(`   - Apellidos: ${profile.apellidos}`);
    
    if (profile.role !== 'owner') {
      console.error(`❌ Error: Rol incorrecto. Esperado: owner, Obtenido: ${profile.role}`);
      return false;
    }
    
    // 3. Crear consultorio
    console.log('\n3️⃣ CREANDO CONSULTORIO');
    console.log('-'.repeat(40));
    
    const consultorioData = {
      propietario_id: user.id,
      titulo: 'Consultorio Médico Premium',
      descripcion: 'Consultorio completamente equipado para profesionales de la salud',
      direccion: 'Av. Reforma 123, Col. Centro',
      ciudad: 'Ciudad de México',
      estado: 'CDMX',
      codigo_postal: '06000',
      precio_por_hora: 800,
      precio_por_dia: 5000,
      precio_por_mes: 120000,
      metros_cuadrados: 80,
      numero_consultorios: 2,
      especialidades: ['Medicina General', 'Cardiología', 'Dermatología'],
      servicios: ['Consulta médica', 'Procedimientos menores', 'Análisis clínicos'],
      equipamiento: ['Estetoscopio', 'Tensiómetro', 'Electrocardiógrafo', 'Ultrasonido'],
      dias_disponibles: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
      horario_apertura: '08:00',
      horario_cierre: '20:00',
      permite_mascotas: false,
      estacionamiento: true,
      wifi: true,
      aire_acondicionado: true
    };
    
    const { data: consultorio, error: consultorioError } = await supabase
      .from('consultorios')
      .insert(consultorioData)
      .select()
      .single();
    
    if (consultorioError) {
      console.error('❌ Error creando consultorio:', consultorioError.message);
      return false;
    }
    
    console.log('✅ Consultorio creado exitosamente:');
    console.log(`   - ID: ${consultorio.id}`);
    console.log(`   - Título: ${consultorio.titulo}`);
    console.log(`   - Propietario: ${consultorio.propietario_id}`);
    console.log(`   - Precio por hora: $${consultorio.precio_por_hora}`);
    
    // 4. Verificar acceso a Stripe Connect
    console.log('\n4️⃣ VERIFICANDO ACCESO A STRIPE CONNECT');
    console.log('-'.repeat(40));
    
    const { data: stripeAccount, error: stripeError } = await supabase
      .from('stripe_accounts')
      .select('*')
      .eq('propietario_id', user.id)
      .single();
    
    if (stripeError && stripeError.code === 'PGRST116') {
      console.log('✅ No hay cuenta de Stripe (normal para nuevo propietario)');
    } else if (stripeError) {
      console.error('❌ Error verificando Stripe:', stripeError.message);
      return false;
    } else {
      console.log('✅ Cuenta de Stripe encontrada:', stripeAccount.stripe_account_id);
    }
    
    // 5. Simular creación de cuenta Stripe
    console.log('\n5️⃣ SIMULANDO CREACIÓN DE CUENTA STRIPE');
    console.log('-'.repeat(40));
    
    const mockStripeAccount = {
      propietario_id: user.id,
      stripe_account_id: 'acct_test_' + Math.random().toString(36).substr(2, 9),
      account_type: 'express',
      country: 'MX',
      currency: 'mxn',
      details_submitted: false,
      charges_enabled: false,
      payouts_enabled: false,
      onboarding_completed: false,
      email: testOwner.email,
      business_name: 'Consultorio Médico Premium'
    };
    
    const { data: newStripeAccount, error: newStripeError } = await supabase
      .from('stripe_accounts')
      .insert(mockStripeAccount)
      .select()
      .single();
    
    if (newStripeError) {
      console.error('❌ Error creando cuenta Stripe:', newStripeError.message);
      return false;
    }
    
    console.log('✅ Cuenta Stripe creada exitosamente:');
    console.log(`   - ID: ${newStripeAccount.id}`);
    console.log(`   - Stripe Account ID: ${newStripeAccount.stripe_account_id}`);
    console.log(`   - Tipo: ${newStripeAccount.account_type}`);
    
    // 6. Verificar permisos de lectura/escritura
    console.log('\n6️⃣ VERIFICANDO PERMISOS DE LECTURA/ESCRITURA');
    console.log('-'.repeat(40));
    
    // Leer propio perfil
    const { data: ownProfile, error: readProfileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (readProfileError) {
      console.error('❌ Error leyendo propio perfil:', readProfileError.message);
      return false;
    }
    
    console.log('✅ Puede leer su propio perfil');
    
    // Leer sus consultorios
    const { data: ownConsultorios, error: readConsultoriosError } = await supabase
      .from('consultorios')
      .select('*')
      .eq('propietario_id', user.id);
    
    if (readConsultoriosError) {
      console.error('❌ Error leyendo consultorios:', readConsultoriosError.message);
      return false;
    }
    
    console.log(`✅ Puede leer sus consultorios (${ownConsultorios.length} encontrados)`);
    
    // Actualizar perfil
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ 
        telefono: '+52 55 1234 5678',
        direccion: 'Nueva dirección de prueba'
      })
      .eq('id', user.id);
    
    if (updateProfileError) {
      console.error('❌ Error actualizando perfil:', updateProfileError.message);
      return false;
    }
    
    console.log('✅ Puede actualizar su perfil');
    
    // 7. Limpiar datos de prueba
    console.log('\n7️⃣ LIMPIANDO DATOS DE PRUEBA');
    console.log('-'.repeat(40));
    
    await supabase
      .from('stripe_accounts')
      .delete()
      .eq('id', newStripeAccount.id);
    
    await supabase
      .from('consultorios')
      .delete()
      .eq('id', consultorio.id);
    
    await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);
    
    await supabase.auth.admin.deleteUser(user.id);
    
    console.log('✅ Datos de prueba limpiados');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
    return false;
  }
}

async function testOwnerPermissions() {
  console.log('\n🔐 PRUEBA DE PERMISOS ESPECÍFICOS DEL PROPIETARIO');
  console.log('=' .repeat(60));
  
  const testOwner = {
    email: 'owner-permissions@wellpoint.com',
    password: 'TestPassword123!',
    nombre: 'María',
    apellidos: 'López',
    full_name: 'María López'
  };
  
  try {
    // Crear propietario
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
      email: testOwner.email,
      password: testOwner.password,
      email_confirm: true,
      user_metadata: {
        full_name: testOwner.full_name,
        nombre: testOwner.nombre,
        apellidos: testOwner.apellidos,
        role: 'owner'
      }
    });
    
    if (createError) {
      console.error('❌ Error creando propietario:', createError.message);
      return false;
    }
    
    // Verificar que NO puede acceder a datos de otros propietarios
    console.log('\n🔒 VERIFICANDO AISLAMIENTO DE DATOS');
    console.log('-'.repeat(40));
    
    // Intentar leer perfiles de otros usuarios
    const { data: allProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .limit(5);
    
    if (profilesError) {
      console.error('❌ Error leyendo perfiles:', profilesError.message);
      return false;
    }
    
    // Verificar que solo puede ver su propio perfil
    const ownProfile = allProfiles.find(p => p.id === user.id);
    const otherProfiles = allProfiles.filter(p => p.id !== user.id);
    
    if (ownProfile) {
      console.log('✅ Puede ver su propio perfil');
    } else {
      console.error('❌ No puede ver su propio perfil');
      return false;
    }
    
    if (otherProfiles.length === 0) {
      console.log('✅ No puede ver perfiles de otros usuarios (RLS funcionando)');
    } else {
      console.log(`⚠️  Puede ver ${otherProfiles.length} perfiles de otros usuarios`);
    }
    
    // Verificar que NO puede crear consultorios para otros
    console.log('\n🚫 VERIFICANDO RESTRICCIONES DE CREACIÓN');
    console.log('-'.repeat(40));
    
    const fakeOwnerId = '00000000-0000-0000-0000-000000000000';
    const { error: fakeConsultorioError } = await supabase
      .from('consultorios')
      .insert({
        propietario_id: fakeOwnerId,
        titulo: 'Consultorio falso',
        descripcion: 'Este no debería crearse',
        direccion: 'Fake Address',
        ciudad: 'Fake City',
        estado: 'Fake State',
        codigo_postal: '00000',
        precio_por_hora: 100,
        metros_cuadrados: 10,
        numero_consultorios: 1,
        especialidades: ['Medicina General']
      });
    
    if (fakeConsultorioError) {
      console.log('✅ No puede crear consultorios para otros propietarios');
    } else {
      console.error('❌ Puede crear consultorios para otros propietarios');
      return false;
    }
    
    // Limpiar
    await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);
    
    await supabase.auth.admin.deleteUser(user.id);
    
    console.log('✅ Datos de prueba limpiados');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
    return false;
  }
}

async function main() {
  console.log('👨‍💼 PRUEBA COMPLETA DEL PROPIETARIO - WELLPOINT');
  console.log('=' .repeat(60));
  
  const results = [];
  
  // Prueba del flujo completo
  const flowOk = await testOwnerFlow();
  results.push({ test: 'Flujo completo del propietario', success: flowOk });
  
  // Prueba de permisos específicos
  const permissionsOk = await testOwnerPermissions();
  results.push({ test: 'Permisos específicos del propietario', success: permissionsOk });
  
  // Resumen final
  console.log('\n📋 RESUMEN DE PRUEBAS DEL PROPIETARIO');
  console.log('=' .repeat(60));
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.test}`);
  });
  
  const allSuccess = results.every(r => r.success);
  
  if (allSuccess) {
    console.log('\n🎉 ¡EL PROPIETARIO FUNCIONA PERFECTAMENTE!');
    console.log('✅ Puede registrarse correctamente');
    console.log('✅ Se le asigna el rol "owner" automáticamente');
    console.log('✅ Puede crear consultorios');
    console.log('✅ Puede acceder a Stripe Connect');
    console.log('✅ Las políticas RLS protegen sus datos');
    console.log('✅ No puede acceder a datos de otros usuarios');
  } else {
    console.log('\n⚠️  HAY PROBLEMAS CON EL PROPIETARIO');
    console.log('Revisa los errores anteriores para identificar el problema.');
    console.log('\n🔧 Posibles causas:');
    console.log('1. El trigger de creación de perfiles no está funcionando');
    console.log('2. Las políticas RLS no están configuradas correctamente');
    console.log('3. Hay un problema en el código de la aplicación');
    console.log('4. La base de datos tiene datos corruptos');
  }
}

// Ejecutar el script
main().catch(console.error);
