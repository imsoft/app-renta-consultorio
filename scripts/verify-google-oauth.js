#!/usr/bin/env node

/**
 * Script para verificar la configuración de Google OAuth
 * Este script verifica que todas las variables y configuraciones necesarias estén en su lugar
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración de Google OAuth...\n');

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.bold}${colors.blue}📋 ${msg}${colors.reset}`)
};

let hasErrors = false;
let hasWarnings = false;

// 1. Verificar variables de entorno
log.section('Variables de entorno');

const envFiles = ['.env.local', '.env'];
let envContent = '';

for (const envFile of envFiles) {
  const envPath = path.join(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    log.success(`Archivo ${envFile} encontrado`);
    break;
  }
}

if (!envContent) {
  log.error('No se encontró archivo .env.local o .env');
  hasErrors = true;
} else {
  // Verificar variables requeridas de Supabase
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  for (const varName of requiredVars) {
    if (envContent.includes(varName) && !envContent.includes(`${varName}=`)) {
      log.error(`Variable ${varName} está vacía`);
      hasErrors = true;
    } else if (envContent.includes(varName)) {
      log.success(`Variable ${varName} configurada`);
    } else {
      log.error(`Variable ${varName} no encontrada`);
      hasErrors = true;
    }
  }

  // Verificar variables opcionales de Google
  const optionalVars = ['NEXT_PUBLIC_GOOGLE_CLIENT_ID'];
  for (const varName of optionalVars) {
    if (envContent.includes(varName)) {
      log.success(`Variable opcional ${varName} configurada`);
    } else {
      log.warning(`Variable opcional ${varName} no configurada (esto es normal si usas solo Supabase)`);
      hasWarnings = true;
    }
  }
}

// 2. Verificar configuración de Supabase
log.section('Configuración de código');

// Verificar que supabaseStore.ts tenga la función signInWithGoogle
const supabaseStorePath = path.join(process.cwd(), 'src/stores/supabaseStore.ts');
if (fs.existsSync(supabaseStorePath)) {
  const supabaseStoreContent = fs.readFileSync(supabaseStorePath, 'utf8');
  
  if (supabaseStoreContent.includes('signInWithGoogle')) {
    log.success('Función signInWithGoogle encontrada en supabaseStore');
  } else {
    log.error('Función signInWithGoogle no encontrada en supabaseStore');
    hasErrors = true;
  }

  if (supabaseStoreContent.includes('signInWithOAuth')) {
    log.success('Implementación signInWithOAuth encontrada');
  } else {
    log.error('Implementación signInWithOAuth no encontrada');
    hasErrors = true;
  }

  if (supabaseStoreContent.includes("provider: 'google'")) {
    log.success('Proveedor Google configurado en OAuth');
  } else {
    log.error('Proveedor Google no configurado en OAuth');
    hasErrors = true;
  }
} else {
  log.error('Archivo supabaseStore.ts no encontrado');
  hasErrors = true;
}

// Verificar que la página de login use signInWithGoogle
const loginPagePath = path.join(process.cwd(), 'src/app/(auth)/login/page.tsx');
if (fs.existsSync(loginPagePath)) {
  const loginPageContent = fs.readFileSync(loginPagePath, 'utf8');
  
  if (loginPageContent.includes('signInWithGoogle')) {
    log.success('Botón de Google configurado en página de login');
  } else {
    log.error('Botón de Google no encontrado en página de login');
    hasErrors = true;
  }

  if (loginPageContent.includes('handleGoogleSignIn')) {
    log.success('Handler de Google OAuth encontrado');
  } else {
    log.warning('Handler de Google OAuth no encontrado');
    hasWarnings = true;
  }
} else {
  log.error('Página de login no encontrada');
  hasErrors = true;
}

// 3. Verificar migraciones aplicadas
log.section('Verificación de base de datos');

log.info('Para verificar que las migraciones están aplicadas:');
log.info('1. Ve a tu Dashboard de Supabase');
log.info('2. Navega a Table Editor');
log.info('3. Verifica que existe la tabla "profiles"');
log.info('4. Verifica que la tabla tiene las columnas necesarias');

// 4. Verificar configuración de URL de redirección
log.section('URLs de redirección');

log.info('Verifica en tu Dashboard de Supabase > Authentication > URL Configuration:');
log.info('- Site URL: http://localhost:3000 (desarrollo)');
log.info('- Redirect URLs: http://localhost:3000/dashboard');
log.info('');
log.info('En Google Cloud Console > Credentials > OAuth 2.0 Client IDs:');
log.info('- Authorized JavaScript origins: http://localhost:3000');
log.info('- Authorized redirect URIs: https://[tu-proyecto].supabase.co/auth/v1/callback');

// 5. Pasos de verificación manual
log.section('Pasos de verificación manual');

log.info('Para probar Google OAuth:');
log.info('1. Ejecuta: pnpm dev');
log.info('2. Ve a: http://localhost:3000/login');
log.info('3. Haz clic en "Continuar con Google"');
log.info('4. Deberías ser redirigido a Google');
log.info('5. Después del login, deberías volver a /dashboard');

// Resumen final
log.section('Resumen');

if (hasErrors) {
  log.error('Se encontraron errores que deben corregirse');
  process.exit(1);
} else if (hasWarnings) {
  log.warning('Configuración básica completada, pero hay algunas advertencias');
  log.success('✨ Google OAuth debería funcionar correctamente');
} else {
  log.success('✨ Todas las verificaciones pasaron! Google OAuth está listo');
}

console.log('\n📚 Para más detalles, consulta: docs/auth/GOOGLE_AUTH_SETUP.md\n');
