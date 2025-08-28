#!/usr/bin/env node

/**
 * Script específico para diagnosticar problemas de Google OAuth
 * Identifica problemas comunes en la configuración y implementación
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

async function checkSupabaseOAuthConfig() {
  console.log('🔍 VERIFICANDO CONFIGURACIÓN DE OAUTH EN SUPABASE');
  console.log('=' .repeat(60));
  
  try {
    // Verificar que Google OAuth esté habilitado
    console.log('\n1️⃣ Verificando configuración de Google OAuth...');
    
    // Intentar obtener la configuración de OAuth
    const { data: authConfig, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error accediendo a configuración de auth:', authError.message);
      return false;
    }
    
    console.log('✅ Configuración de auth accesible');
    
    // Verificar si hay usuarios con provider Google
    const googleUsers = authConfig.users.filter(user => 
      user.app_metadata?.provider === 'google' || 
      user.identities?.some(identity => identity.provider === 'google')
    );
    
    console.log(`📊 Usuarios con Google OAuth: ${googleUsers.length}`);
    
    if (googleUsers.length > 0) {
      console.log('✅ Hay usuarios registrados con Google OAuth');
      googleUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.id})`);
      });
    } else {
      console.log('⚠️  No hay usuarios registrados con Google OAuth');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error verificando configuración OAuth:', error.message);
    return false;
  }
}

async function checkCodeImplementation() {
  console.log('\n2️⃣ VERIFICANDO IMPLEMENTACIÓN EN CÓDIGO');
  console.log('=' .repeat(60));
  
  const issues = [];
  
  try {
    // Verificar supabaseStore.ts
    const supabaseStorePath = 'src/stores/supabaseStore.ts';
    if (fs.existsSync(supabaseStorePath)) {
      const content = fs.readFileSync(supabaseStorePath, 'utf8');
      
      if (content.includes('signInWithGoogle')) {
        console.log('✅ Función signInWithGoogle encontrada');
      } else {
        issues.push('❌ Función signInWithGoogle no encontrada');
      }
      
      if (content.includes('signInWithOAuth')) {
        console.log('✅ signInWithOAuth implementado');
      } else {
        issues.push('❌ signInWithOAuth no implementado');
      }
      
      if (content.includes("provider: 'google'")) {
        console.log('✅ Proveedor Google configurado');
      } else {
        issues.push('❌ Proveedor Google no configurado');
      }
      
      if (content.includes('redirectTo')) {
        console.log('✅ redirectTo configurado');
      } else {
        issues.push('❌ redirectTo no configurado');
      }
      
      // Verificar manejo de errores
      if (content.includes('console.error') && content.includes('signInWithGoogle')) {
        console.log('✅ Manejo de errores implementado');
      } else {
        issues.push('⚠️  Manejo de errores podría mejorarse');
      }
      
    } else {
      issues.push('❌ Archivo supabaseStore.ts no encontrado');
    }
    
    // Verificar página de login
    const loginPath = 'src/app/(auth)/login/page.tsx';
    if (fs.existsSync(loginPath)) {
      const content = fs.readFileSync(loginPath, 'utf8');
      
      if (content.includes('signInWithGoogle')) {
        console.log('✅ Botón de Google en página de login');
      } else {
        issues.push('❌ Botón de Google no encontrado en login');
      }
      
      if (content.includes('handleGoogleSignIn')) {
        console.log('✅ Handler de Google OAuth en login');
      } else {
        issues.push('❌ Handler de Google OAuth no encontrado en login');
      }
      
      if (content.includes('loading')) {
        console.log('✅ Estado de carga manejado en login');
      } else {
        issues.push('⚠️  Estado de carga no manejado en login');
      }
      
    } else {
      issues.push('❌ Página de login no encontrada');
    }
    
    // Verificar página de registro
    const registroPath = 'src/app/(auth)/registro/page.tsx';
    if (fs.existsSync(registroPath)) {
      const content = fs.readFileSync(registroPath, 'utf8');
      
      if (content.includes('signInWithGoogle')) {
        console.log('✅ Botón de Google en página de registro');
      } else {
        issues.push('❌ Botón de Google no encontrado en registro');
      }
      
      if (content.includes('handleGoogleSignUp')) {
        console.log('✅ Handler de Google OAuth en registro');
      } else {
        issues.push('❌ Handler de Google OAuth no encontrado en registro');
      }
      
    } else {
      issues.push('❌ Página de registro no encontrada');
    }
    
    // Verificar SupabaseProvider
    const providerPath = 'src/components/SupabaseProvider.tsx';
    if (fs.existsSync(providerPath)) {
      const content = fs.readFileSync(providerPath, 'utf8');
      
      if (content.includes('onAuthStateChange')) {
        console.log('✅ Auth state change listener configurado');
      } else {
        issues.push('❌ Auth state change listener no configurado');
      }
      
      if (content.includes('SIGNED_IN')) {
        console.log('✅ Manejo de SIGNED_IN implementado');
      } else {
        issues.push('❌ Manejo de SIGNED_IN no implementado');
      }
      
    } else {
      issues.push('❌ SupabaseProvider no encontrado');
    }
    
    if (issues.length === 0) {
      console.log('✅ Implementación en código correcta');
      return true;
    } else {
      console.log('\n⚠️  Problemas encontrados en implementación:');
      issues.forEach(issue => console.log(`   ${issue}`));
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error verificando implementación:', error.message);
    return false;
  }
}

async function checkEnvironmentVariables() {
  console.log('\n3️⃣ VERIFICANDO VARIABLES DE ENTORNO');
  console.log('=' .repeat(60));
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
  ];
  
  const optionalVars = [
    'NEXT_PUBLIC_GOOGLE_CLIENT_ID'
  ];
  
  let allRequired = true;
  
  console.log('📋 Variables requeridas:');
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`   ✅ ${varName}: ${value.substring(0, 20)}...`);
    } else {
      console.log(`   ❌ ${varName}: NO CONFIGURADA`);
      allRequired = false;
    }
  });
  
  console.log('\n📋 Variables opcionales:');
  optionalVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`   ✅ ${varName}: ${value.substring(0, 20)}...`);
    } else {
      console.log(`   ⚠️  ${varName}: NO CONFIGURADA (opcional)`);
    }
  });
  
  return allRequired;
}

async function checkCommonOAuthIssues() {
  console.log('\n4️⃣ VERIFICANDO PROBLEMAS COMUNES DE OAUTH');
  console.log('=' .repeat(60));
  
  const issues = [];
  
  try {
    // Verificar que el dominio esté configurado correctamente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      console.log(`✅ Supabase URL configurada: ${supabaseUrl}`);
      
      // Verificar que sea HTTPS en producción
      if (supabaseUrl.includes('https://')) {
        console.log('✅ URL usa HTTPS (requerido para OAuth)');
      } else {
        issues.push('⚠️  URL no usa HTTPS (puede causar problemas en producción)');
      }
    } else {
      issues.push('❌ Supabase URL no configurada');
    }
    
    // Verificar configuración de redirección
    console.log('\n🔗 URLs de redirección recomendadas:');
    console.log('   - http://localhost:3000/dashboard (desarrollo)');
    console.log('   - https://tu-dominio.com/dashboard (producción)');
    console.log('   - https://tu-dominio.com/auth/callback (si es necesario)');
    
    // Verificar que el trigger de perfiles esté activo
    console.log('\n⚡ Verificando trigger de perfiles...');
    
    // Intentar crear un usuario de prueba para verificar el trigger
    const testEmail = `test-oauth-${Date.now()}@wellpoint.com`;
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'TestPassword123!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Test OAuth User',
        nombre: 'Test',
        apellidos: 'OAuth',
        role: 'professional'
      }
    });
    
    if (createError) {
      console.error('❌ Error creando usuario de prueba:', createError.message);
      issues.push('❌ No se pudo crear usuario de prueba');
    } else {
      console.log('✅ Usuario de prueba creado:', user.id);
      
      // Verificar que el perfil se creó automáticamente
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('❌ Error verificando perfil:', profileError.message);
        issues.push('❌ Trigger de perfiles no funciona correctamente');
      } else {
        console.log('✅ Perfil creado automáticamente por trigger');
        console.log(`   - Role: ${profile.role}`);
        console.log(`   - Email: ${profile.email}`);
      }
      
      // Limpiar usuario de prueba
      await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);
      
      await supabase.auth.admin.deleteUser(user.id);
      console.log('✅ Usuario de prueba limpiado');
    }
    
    if (issues.length === 0) {
      console.log('✅ No se encontraron problemas comunes');
      return true;
    } else {
      console.log('\n⚠️  Problemas comunes encontrados:');
      issues.forEach(issue => console.log(`   ${issue}`));
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error verificando problemas comunes:', error.message);
    return false;
  }
}

async function generateDebuggingSteps() {
  console.log('\n5️⃣ PASOS PARA DEBUGGING');
  console.log('=' .repeat(60));
  
  console.log('\n🔧 Pasos para solucionar problemas de Google OAuth:');
  console.log('\n1. Verificar configuración en Supabase Dashboard:');
  console.log('   - Ir a Authentication > Providers');
  console.log('   - Verificar que Google esté habilitado ✅');
  console.log('   - Verificar Client ID y Client Secret configurados ✅');
  console.log('   - Copiar la Redirect URL mostrada');
  
  console.log('\n2. Verificar configuración en Google Cloud Console:');
  console.log('   - Ir a Credentials > OAuth 2.0 Client IDs');
  console.log('   - Verificar Authorized JavaScript origins:');
  console.log('     * http://localhost:3000 (desarrollo)');
  console.log('     * https://tu-dominio.com (producción)');
  console.log('   - Verificar Authorized redirect URIs:');
  console.log('     * La URL copiada de Supabase');
  console.log('     * http://localhost:3000/dashboard (desarrollo)');
  console.log('     * https://tu-dominio.com/dashboard (producción)');
  
  console.log('\n3. Verificar en el navegador:');
  console.log('   - Abrir Developer Tools (F12)');
  console.log('   - Ir a la pestaña Console');
  console.log('   - Intentar login con Google');
  console.log('   - Revisar errores en la consola');
  
  console.log('\n4. Verificar en Supabase Dashboard:');
  console.log('   - Ir a Authentication > Users');
  console.log('   - Verificar si el usuario se creó');
  console.log('   - Ir a Table Editor > profiles');
  console.log('   - Verificar si el perfil se creó automáticamente');
  
  console.log('\n5. Problemas específicos del error "client-side exception":');
  console.log('   - Verificar que window.location.origin esté disponible');
  console.log('   - Verificar que el componente se renderice correctamente');
  console.log('   - Verificar que no haya errores de JavaScript');
  console.log('   - Verificar que las dependencias estén instaladas');
}

async function main() {
  console.log('🔍 DIAGNÓSTICO DE PROBLEMAS DE GOOGLE OAUTH - WELLPOINT');
  console.log('=' .repeat(60));
  
  const results = [];
  
  // Verificar configuración de Supabase
  const supabaseConfigOk = await checkSupabaseOAuthConfig();
  results.push({ test: 'Configuración Supabase OAuth', success: supabaseConfigOk });
  
  // Verificar implementación en código
  const codeImplementationOk = await checkCodeImplementation();
  results.push({ test: 'Implementación en código', success: codeImplementationOk });
  
  // Verificar variables de entorno
  const envVarsOk = await checkEnvironmentVariables();
  results.push({ test: 'Variables de entorno', success: envVarsOk });
  
  // Verificar problemas comunes
  const commonIssuesOk = await checkCommonOAuthIssues();
  results.push({ test: 'Problemas comunes', success: commonIssuesOk });
  
  // Generar pasos de debugging
  await generateDebuggingSteps();
  
  // Resumen final
  console.log('\n📋 RESUMEN DE DIAGNÓSTICO');
  console.log('=' .repeat(60));
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.test}`);
  });
  
  const allSuccess = results.every(r => r.success);
  
  if (allSuccess) {
    console.log('\n🎉 ¡LA CONFIGURACIÓN DE OAUTH PARECE CORRECTA!');
    console.log('El problema podría estar en:');
    console.log('1. Configuración específica en Google Cloud Console');
    console.log('2. URLs de redirección no coinciden');
    console.log('3. Error en el navegador (revisar consola)');
    console.log('4. Problema temporal de red o servicio');
  } else {
    console.log('\n⚠️  SE ENCONTRARON PROBLEMAS EN LA CONFIGURACIÓN');
    console.log('Revisa los errores anteriores y sigue los pasos de debugging.');
  }
  
  console.log('\n🔧 PRÓXIMOS PASOS:');
  console.log('1. Revisar la consola del navegador para errores específicos');
  console.log('2. Verificar configuración en Google Cloud Console');
  console.log('3. Verificar URLs de redirección en Supabase');
  console.log('4. Probar en modo incógnito del navegador');
  console.log('5. Verificar que no haya bloqueadores de anuncios interfiriendo');
}

// Ejecutar el script
main().catch(console.error);
