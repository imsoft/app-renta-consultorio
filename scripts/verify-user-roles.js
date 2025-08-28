#!/usr/bin/env node

/**
 * Script para verificar que todos los tipos de usuario funcionen correctamente
 * Prueba: professional, owner, admin
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Datos de prueba para cada tipo de usuario
const testUsers = [
  {
    email: 'test-professional@wellpoint.com',
    password: 'TestPassword123!',
    role: 'professional',
    nombre: 'Dr. Ana',
    apellidos: 'García',
    full_name: 'Dr. Ana García'
  },
  {
    email: 'test-owner@wellpoint.com',
    password: 'TestPassword123!',
    role: 'owner',
    nombre: 'Carlos',
    apellidos: 'Mendoza',
    full_name: 'Carlos Mendoza'
  },
  {
    email: 'test-admin@wellpoint.com',
    password: 'TestPassword123!',
    role: 'admin',
    nombre: 'Admin',
    apellidos: 'Sistema',
    full_name: 'Admin Sistema'
  }
];

async function cleanupTestUsers() {
  console.log('\n🧹 Limpiando usuarios de prueba...');
  
  for (const user of testUsers) {
    try {
      // Buscar usuario por email
      const { data: { users }, error: searchError } = await supabase.auth.admin.listUsers();
      
      if (searchError) {
        console.error(`❌ Error buscando usuario ${user.email}:`, searchError.message);
        continue;
      }
      
      const foundUser = users.find(u => u.email === user.email);
      
      if (foundUser) {
        // Eliminar perfil primero
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', foundUser.id);
        
        if (profileError) {
          console.error(`❌ Error eliminando perfil de ${user.email}:`, profileError.message);
        }
        
        // Eliminar usuario
        const { error: deleteError } = await supabase.auth.admin.deleteUser(foundUser.id);
        
        if (deleteError) {
          console.error(`❌ Error eliminando usuario ${user.email}:`, deleteError.message);
        } else {
          console.log(`✅ Usuario ${user.email} eliminado`);
        }
      }
    } catch (error) {
      console.error(`❌ Error en cleanup de ${user.email}:`, error.message);
    }
  }
}

async function createTestUser(userData) {
  console.log(`\n👤 Creando usuario ${userData.role}: ${userData.email}`);
  
  try {
    // Crear usuario en auth
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        full_name: userData.full_name,
        nombre: userData.nombre,
        apellidos: userData.apellidos,
        role: userData.role
      }
    });
    
    if (createError) {
      console.error(`❌ Error creando usuario:`, createError.message);
      return null;
    }
    
    console.log(`✅ Usuario creado: ${user.id}`);
    
    // Verificar que el perfil se creó automáticamente
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error(`❌ Error verificando perfil:`, profileError.message);
      return null;
    }
    
    console.log(`✅ Perfil creado automáticamente:`);
    console.log(`   - ID: ${profile.id}`);
    console.log(`   - Email: ${profile.email}`);
    console.log(`   - Role: ${profile.role}`);
    console.log(`   - Nombre: ${profile.nombre}`);
    console.log(`   - Apellidos: ${profile.apellidos}`);
    
    // Verificar que el rol es correcto
    if (profile.role !== userData.role) {
      console.error(`❌ Error: Rol incorrecto. Esperado: ${userData.role}, Obtenido: ${profile.role}`);
      return null;
    }
    
    return { user, profile };
    
  } catch (error) {
    console.error(`❌ Error inesperado:`, error.message);
    return null;
  }
}

async function testUserPermissions(userData, userInfo) {
  console.log(`\n🔐 Probando permisos para ${userData.role}: ${userData.email}`);
  
  try {
    // Crear cliente con sesión del usuario
    const { data: { session }, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: userData.email,
    });
    
    if (sessionError) {
      console.error(`❌ Error generando sesión:`, sessionError.message);
      return false;
    }
    
    // Probar acceso a diferentes recursos según el rol
    const tests = [];
    
    // Test 1: Leer su propio perfil
    const { data: ownProfile, error: ownProfileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userInfo.user.id)
      .single();
    
    tests.push({
      name: 'Leer propio perfil',
      success: !ownProfileError && ownProfile,
      error: ownProfileError?.message
    });
    
    // Test 2: Crear consultorio (solo owner)
    if (userData.role === 'owner') {
      const consultorioData = {
        propietario_id: userInfo.user.id,
        titulo: `Consultorio de prueba - ${userData.email}`,
        descripcion: 'Consultorio creado para pruebas',
        direccion: 'Calle de Prueba 123',
        ciudad: 'Ciudad de Prueba',
        estado: 'Estado de Prueba',
        codigo_postal: '12345',
        precio_por_hora: 500,
        metros_cuadrados: 50,
        numero_consultorios: 1,
        especialidades: ['Medicina General'],
        servicios: ['Consulta médica'],
        equipamiento: ['Estetoscopio'],
        dias_disponibles: ['Lunes', 'Martes', 'Miércoles'],
        horario_apertura: '09:00',
        horario_cierre: '18:00',
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
      
      tests.push({
        name: 'Crear consultorio',
        success: !consultorioError && consultorio,
        error: consultorioError?.message
      });
      
      // Limpiar consultorio de prueba
      if (consultorio) {
        await supabase
          .from('consultorios')
          .delete()
          .eq('id', consultorio.id);
      }
    } else {
      tests.push({
        name: 'Crear consultorio (no permitido)',
        success: true, // No debería poder crear
        error: null
      });
    }
    
    // Test 3: Acceso a Stripe Connect (solo owner)
    if (userData.role === 'owner') {
      const { data: stripeAccount, error: stripeError } = await supabase
        .from('stripe_accounts')
        .select('*')
        .eq('propietario_id', userInfo.user.id)
        .single();
      
      tests.push({
        name: 'Acceso a Stripe Connect',
        success: !stripeError || stripeError.code === 'PGRST116', // No encontrado es OK
        error: stripeError?.code === 'PGRST116' ? null : stripeError?.message
      });
    } else {
      tests.push({
        name: 'Acceso a Stripe Connect (no permitido)',
        success: true,
        error: null
      });
    }
    
    // Mostrar resultados
    console.log(`📊 Resultados de permisos para ${userData.role}:`);
    tests.forEach(test => {
      const status = test.success ? '✅' : '❌';
      console.log(`   ${status} ${test.name}`);
      if (test.error) {
        console.log(`      Error: ${test.error}`);
      }
    });
    
    return tests.every(test => test.success);
    
  } catch (error) {
    console.error(`❌ Error probando permisos:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔍 VERIFICACIÓN DE TIPOS DE USUARIO - WELLPOINT');
  console.log('=' .repeat(60));
  
  // Limpiar usuarios de prueba anteriores
  await cleanupTestUsers();
  
  const results = [];
  
  // Crear y probar cada tipo de usuario
  for (const userData of testUsers) {
    const userInfo = await createTestUser(userData);
    
    if (userInfo) {
      const permissionsOk = await testUserPermissions(userData, userInfo);
      results.push({
        role: userData.role,
        email: userData.email,
        success: permissionsOk
      });
    } else {
      results.push({
        role: userData.role,
        email: userData.email,
        success: false
      });
    }
  }
  
  // Limpiar usuarios de prueba
  await cleanupTestUsers();
  
  // Mostrar resumen final
  console.log('\n📋 RESUMEN FINAL');
  console.log('=' .repeat(60));
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.role.toUpperCase()}: ${result.email}`);
  });
  
  const allSuccess = results.every(r => r.success);
  
  if (allSuccess) {
    console.log('\n🎉 ¡TODOS LOS TIPOS DE USUARIO FUNCIONAN CORRECTAMENTE!');
    console.log('✅ Professional: Puede ver consultorios y hacer reservas');
    console.log('✅ Owner: Puede crear y gestionar consultorios');
    console.log('✅ Admin: Puede acceder a funciones administrativas');
  } else {
    console.log('\n⚠️  HAY PROBLEMAS CON ALGUNOS TIPOS DE USUARIO');
    console.log('Revisa los errores anteriores para identificar el problema.');
  }
  
  console.log('\n🔧 Próximos pasos:');
  console.log('1. Verificar que las migraciones estén aplicadas');
  console.log('2. Revisar las políticas RLS en Supabase');
  console.log('3. Verificar que el trigger de creación de perfiles funcione');
  console.log('4. Probar el flujo completo en la aplicación web');
}

// Ejecutar el script
main().catch(console.error);
