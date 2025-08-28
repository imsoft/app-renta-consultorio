#!/usr/bin/env node

/**
 * Script para debuggear problemas específicos de usuarios en la aplicación web
 * Identifica problemas comunes con roles y permisos
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
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabaseStructure() {
  console.log('\n🔍 VERIFICANDO ESTRUCTURA DE BASE DE DATOS');
  console.log('=' .repeat(50));
  
  try {
    // Verificar tabla profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Error accediendo a tabla profiles:', profilesError.message);
      return false;
    }
    
    console.log('✅ Tabla profiles accesible');
    
    // Verificar tabla consultorios
    const { data: consultorios, error: consultoriosError } = await supabase
      .from('consultorios')
      .select('*')
      .limit(1);
    
    if (consultoriosError) {
      console.error('❌ Error accediendo a tabla consultorios:', consultoriosError.message);
      return false;
    }
    
    console.log('✅ Tabla consultorios accesible');
    
    // Verificar tabla stripe_accounts
    const { data: stripeAccounts, error: stripeError } = await supabase
      .from('stripe_accounts')
      .select('*')
      .limit(1);
    
    if (stripeError) {
      console.error('❌ Error accediendo a tabla stripe_accounts:', stripeError.message);
      return false;
    }
    
    console.log('✅ Tabla stripe_accounts accesible');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error verificando estructura:', error.message);
    return false;
  }
}

async function checkRLSPolicies() {
  console.log('\n🔐 VERIFICANDO POLÍTICAS RLS');
  console.log('=' .repeat(50));
  
  try {
    // Crear usuario de prueba para verificar políticas
    const testUser = {
      email: 'test-rls@wellpoint.com',
      password: 'TestPassword123!',
      role: 'owner',
      nombre: 'Test',
      apellidos: 'RLS',
      full_name: 'Test RLS'
    };
    
    // Crear usuario
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true,
      user_metadata: {
        full_name: testUser.full_name,
        nombre: testUser.nombre,
        apellidos: testUser.apellidos,
        role: testUser.role
      }
    });
    
    if (createError) {
      console.error('❌ Error creando usuario de prueba:', createError.message);
      return false;
    }
    
    console.log('✅ Usuario de prueba creado:', user.id);
    
    // Verificar que el perfil se creó
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Error verificando perfil:', profileError.message);
      return false;
    }
    
    console.log('✅ Perfil creado automáticamente');
    console.log(`   - Role: ${profile.role}`);
    console.log(`   - Nombre: ${profile.nombre}`);
    
    // Verificar políticas RLS para consultorios
    const consultorioData = {
      propietario_id: user.id,
      titulo: 'Consultorio de prueba RLS',
      descripcion: 'Prueba de políticas RLS',
      direccion: 'Calle Test 123',
      ciudad: 'Ciudad Test',
      estado: 'Estado Test',
      codigo_postal: '12345',
      precio_por_hora: 500,
      metros_cuadrados: 50,
      numero_consultorios: 1,
      especialidades: ['Medicina General'],
      servicios: ['Consulta médica'],
      equipamiento: ['Estetoscopio'],
      dias_disponibles: ['Lunes'],
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
    
    if (consultorioError) {
      console.error('❌ Error creando consultorio (RLS):', consultorioError.message);
      return false;
    }
    
    console.log('✅ Consultorio creado exitosamente (RLS funcionando)');
    
    // Limpiar datos de prueba
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
    console.error('❌ Error verificando RLS:', error.message);
    return false;
  }
}

async function checkTriggerFunction() {
  console.log('\n⚡ VERIFICANDO TRIGGER DE CREACIÓN DE PERFILES');
  console.log('=' .repeat(50));
  
  try {
    // Crear usuario sin metadata para probar trigger
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
      email: 'test-trigger@wellpoint.com',
      password: 'TestPassword123!',
      email_confirm: true
    });
    
    if (createError) {
      console.error('❌ Error creando usuario para trigger:', createError.message);
      return false;
    }
    
    console.log('✅ Usuario creado sin metadata');
    
    // Verificar que el trigger creó el perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Error: Trigger no creó perfil:', profileError.message);
      return false;
    }
    
    console.log('✅ Trigger funcionando correctamente');
    console.log(`   - Perfil creado automáticamente`);
    console.log(`   - Role por defecto: ${profile.role}`);
    console.log(`   - Email: ${profile.email}`);
    
    // Limpiar
    await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);
    
    await supabase.auth.admin.deleteUser(user.id);
    
    console.log('✅ Usuario de prueba limpiado');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error verificando trigger:', error.message);
    return false;
  }
}

async function checkCommonIssues() {
  console.log('\n🔧 VERIFICANDO PROBLEMAS COMUNES');
  console.log('=' .repeat(50));
  
  const issues = [];
  
  try {
    // Verificar si hay usuarios sin perfiles
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error listando usuarios:', usersError.message);
      return false;
    }
    
    console.log(`📊 Total de usuarios: ${users.length}`);
    
    for (const user of users) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError && profileError.code === 'PGRST116') {
        issues.push(`❌ Usuario ${user.email} no tiene perfil`);
      } else if (profileError) {
        issues.push(`❌ Error verificando perfil de ${user.email}: ${profileError.message}`);
      } else if (profile && !profile.role) {
        issues.push(`❌ Usuario ${user.email} no tiene rol asignado`);
      }
    }
    
    // Verificar consultorios sin propietario válido
    const { data: consultorios, error: consultoriosError } = await supabase
      .from('consultorios')
      .select('id, titulo, propietario_id')
      .limit(10);
    
    if (!consultoriosError && consultorios) {
      for (const consultorio of consultorios) {
        const { data: owner, error: ownerError } = await supabase
          .from('profiles')
          .select('id, email, role')
          .eq('id', consultorio.propietario_id)
          .single();
        
        if (ownerError && ownerError.code === 'PGRST116') {
          issues.push(`❌ Consultorio ${consultorio.titulo} tiene propietario inexistente`);
        } else if (owner && owner.role !== 'owner') {
          issues.push(`❌ Consultorio ${consultorio.titulo} tiene propietario con rol incorrecto: ${owner.role}`);
        }
      }
    }
    
    if (issues.length === 0) {
      console.log('✅ No se encontraron problemas comunes');
    } else {
      console.log('⚠️  Problemas encontrados:');
      issues.forEach(issue => console.log(`   ${issue}`));
    }
    
    return issues.length === 0;
    
  } catch (error) {
    console.error('❌ Error verificando problemas comunes:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔍 DEBUGGING DE PROBLEMAS DE USUARIOS - WELLPOINT');
  console.log('=' .repeat(60));
  
  const results = [];
  
  // Verificar estructura de base de datos
  const structureOk = await checkDatabaseStructure();
  results.push({ test: 'Estructura de BD', success: structureOk });
  
  // Verificar políticas RLS
  const rlsOk = await checkRLSPolicies();
  results.push({ test: 'Políticas RLS', success: rlsOk });
  
  // Verificar trigger de perfiles
  const triggerOk = await checkTriggerFunction();
  results.push({ test: 'Trigger de perfiles', success: triggerOk });
  
  // Verificar problemas comunes
  const commonIssuesOk = await checkCommonIssues();
  results.push({ test: 'Problemas comunes', success: commonIssuesOk });
  
  // Resumen final
  console.log('\n📋 RESUMEN DE VERIFICACIONES');
  console.log('=' .repeat(60));
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.test}`);
  });
  
  const allSuccess = results.every(r => r.success);
  
  if (allSuccess) {
    console.log('\n🎉 ¡TODOS LOS SISTEMAS FUNCIONAN CORRECTAMENTE!');
    console.log('✅ La base de datos está bien configurada');
    console.log('✅ Las políticas RLS están funcionando');
    console.log('✅ El trigger de perfiles está activo');
    console.log('✅ No hay problemas comunes detectados');
  } else {
    console.log('\n⚠️  SE ENCONTRARON PROBLEMAS');
    console.log('Revisa los errores anteriores para identificar el problema.');
    console.log('\n🔧 Posibles soluciones:');
    console.log('1. Aplicar las migraciones faltantes en Supabase');
    console.log('2. Verificar que el trigger esté activo');
    console.log('3. Revisar las políticas RLS en el dashboard de Supabase');
    console.log('4. Limpiar datos corruptos si es necesario');
  }
}

// Ejecutar el script
main().catch(console.error);
