#!/usr/bin/env node

/**
 * Script para verificar las URLs de redirección de OAuth
 * Ayuda a identificar problemas de configuración en Google Cloud Console
 */

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

function checkOAuthURLs() {
  console.log('🔗 VERIFICACIÓN DE URLs DE OAUTH - WELLPOINT');
  console.log('=' .repeat(60));
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL no configurada');
    return;
  }
  
  // Extraer el ID del proyecto de Supabase
  const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  
  if (!projectId) {
    console.error('❌ No se pudo extraer el ID del proyecto de Supabase');
    return;
  }
  
  console.log(`✅ Proyecto Supabase: ${projectId}`);
  console.log(`✅ URL de Supabase: ${supabaseUrl}`);
  
  console.log('\n📋 URLs QUE DEBES CONFIGURAR EN GOOGLE CLOUD CONSOLE');
  console.log('=' .repeat(60));
  
  console.log('\n🔧 1. Authorized JavaScript origins:');
  console.log('   - http://localhost:3000');
  console.log('   - https://wellpoint.app (o tu dominio de producción)');
  
  console.log('\n🔗 2. Authorized redirect URIs:');
  console.log(`   - https://${projectId}.supabase.co/auth/v1/callback`);
  console.log('   - http://localhost:3000/dashboard');
  console.log('   - https://wellpoint.app/dashboard (o tu dominio de producción)');
  
  console.log('\n📝 3. Pasos para configurar en Google Cloud Console:');
  console.log('   1. Ve a https://console.cloud.google.com/');
  console.log('   2. Selecciona tu proyecto');
  console.log('   3. Ve a "APIs & Services" > "Credentials"');
  console.log('   4. Encuentra tu OAuth 2.0 Client ID');
  console.log('   5. Haz clic en el nombre del cliente');
  console.log('   6. En "Authorized JavaScript origins", agrega:');
  console.log('      * http://localhost:3000');
  console.log('      * https://wellpoint.app');
  console.log('   7. En "Authorized redirect URIs", agrega:');
  console.log(`      * https://${projectId}.supabase.co/auth/v1/callback`);
  console.log('      * http://localhost:3000/dashboard');
  console.log('      * https://wellpoint.app/dashboard');
  console.log('   8. Haz clic en "Save"');
  
  console.log('\n🔍 4. Verificar configuración en Supabase:');
  console.log('   1. Ve a tu dashboard de Supabase');
  console.log('   2. Navega a "Authentication" > "Providers"');
  console.log('   3. Busca "Google" y verifica que esté habilitado');
  console.log('   4. Verifica que Client ID y Client Secret estén configurados');
  console.log('   5. Copia la "Redirect URL" mostrada');
  console.log('   6. Asegúrate de que esa URL esté en Google Cloud Console');
  
  console.log('\n🚨 5. Problemas comunes y soluciones:');
  console.log('   ❌ Error: "redirect_uri_mismatch"');
  console.log('      ✅ Solución: Verificar que las URLs coincidan exactamente');
  console.log('   ❌ Error: "invalid_client"');
  console.log('      ✅ Solución: Verificar Client ID y Secret en Supabase');
  console.log('   ❌ Error: "access_denied"');
  console.log('      ✅ Solución: Verificar que Google+ API esté habilitada');
  console.log('   ❌ Error: "client-side exception"');
  console.log('      ✅ Solución: Verificar configuración de URLs y CORS');
  
  console.log('\n🧪 6. Para probar la configuración:');
  console.log('   1. Abre http://localhost:3000/login');
  console.log('   2. Haz clic en "Continuar con Google"');
  console.log('   3. Deberías ser redirigido a Google');
  console.log('   4. Después de autenticarte, deberías volver a /dashboard');
  console.log('   5. Verifica en Supabase que el usuario se creó');
  
  console.log('\n📊 7. URLs específicas de tu proyecto:');
  console.log(`   Supabase Auth Callback: https://${projectId}.supabase.co/auth/v1/callback`);
  console.log('   Desarrollo: http://localhost:3000/dashboard');
  console.log('   Producción: https://wellpoint.app/dashboard');
  
  console.log('\n✅ CONFIGURACIÓN RECOMENDADA COMPLETA');
  console.log('=' .repeat(60));
  console.log('Una vez configuradas estas URLs, Google OAuth debería funcionar correctamente.');
  console.log('Si sigues teniendo problemas, revisa la consola del navegador para errores específicos.');
}

// Ejecutar el script
checkOAuthURLs();
