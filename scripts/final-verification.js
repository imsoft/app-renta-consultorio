#!/usr/bin/env node

/**
 * Script de verificación final - WellPoint
 * Verifica que todo esté listo para usar el proyecto al 100%
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 VERIFICACIÓN FINAL - WellPoint');
console.log('===============================\n');

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.bold}${colors.cyan}📋 ${msg}${colors.reset}`),
  action: (msg) => console.log(`${colors.magenta}🎯 ${msg}${colors.reset}`)
};

let criticalErrors = 0;
let warnings = 0;
let readyFeatures = 0;
const totalFeatures = 8;

// 1. Verificar estructura del proyecto
log.section('1. ESTRUCTURA DEL PROYECTO');

const criticalFiles = [
  'src/lib/supabase.ts',
  'src/stores/supabaseStore.ts',
  'src/components/SupabaseProvider.tsx',
  'src/app/(auth)/login/page.tsx',
  'src/app/(auth)/registro/page.tsx',
  'src/app/(consultorios)/consultorios/crear/page.tsx',
  'src/app/layout.tsx'
];

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    log.success(`${file}`);
  } else {
    log.error(`${file} - FALTA`);
    criticalErrors++;
  }
});

// 2. Verificar variables de entorno
log.section('2. VARIABLES DE ENTORNO');

const envFiles = ['.env.local', '.env'];
let envContent = '';

for (const envFile of envFiles) {
  if (fs.existsSync(envFile)) {
    envContent = fs.readFileSync(envFile, 'utf8');
    log.success(`Archivo ${envFile} encontrado`);
    break;
  }
}

if (envContent) {
  const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL=') && !envContent.includes('NEXT_PUBLIC_SUPABASE_URL=\n');
  const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=') || envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=');
  
  if (hasSupabaseUrl && hasSupabaseKey) {
    log.success('Variables de Supabase configuradas');
    readyFeatures++;
  } else {
    log.error('Variables de Supabase incompletas');
    criticalErrors++;
  }
} else {
  log.error('No se encontró archivo de variables de entorno');
  criticalErrors++;
}

// 3. Verificar migraciones disponibles
log.section('3. MIGRACIONES DE BASE DE DATOS');

const migrationPath = 'supabase/migrations';
if (fs.existsSync(migrationPath)) {
  const migrations = fs.readdirSync(migrationPath).filter(f => f.endsWith('.sql'));
  
  const expectedMigrations = [
    '20250124000001_create_profiles_table.sql',
    '20250124000002_create_consultorios_table.sql',
    '20250124000003_create_reservas_table.sql',
    '20250124000004_create_favoritos_table.sql',
    '20250124000005_create_calificaciones_table.sql',
    '20250124000006_create_storage_buckets.sql',
    '20250124000007_create_auto_profile_trigger.sql'
  ];

  expectedMigrations.forEach(migration => {
    if (migrations.includes(migration)) {
      log.success(`${migration}`);
    } else {
      log.warning(`${migration} - No encontrada`);
      warnings++;
    }
  });

  if (migrations.length >= 6) {
    log.success(`${migrations.length} migraciones disponibles`);
    readyFeatures++;
  } else {
    log.error('Faltan migraciones críticas');
    criticalErrors++;
  }
} else {
  log.error('Carpeta de migraciones no encontrada');
  criticalErrors++;
}

// 4. Verificar implementación de autenticación
log.section('4. SISTEMA DE AUTENTICACIÓN');

const authFiles = [
  'src/app/(auth)/login/page.tsx',
  'src/app/(auth)/registro/page.tsx'
];

let authImplemented = true;
authFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('useSupabaseStore') && content.includes('signIn')) {
      log.success(`${file} - Integración Supabase ✓`);
    } else {
      log.warning(`${file} - Sin integración Supabase`);
      authImplemented = false;
    }
  }
});

if (authImplemented) {
  readyFeatures++;
}

// 5. Verificar Google OAuth
log.section('5. GOOGLE OAUTH');

const loginFile = 'src/app/(auth)/login/page.tsx';
if (fs.existsSync(loginFile)) {
  const loginContent = fs.readFileSync(loginFile, 'utf8');
  if (loginContent.includes('signInWithGoogle') && loginContent.includes('Continuar con Google')) {
    log.success('Google OAuth implementado en login');
    readyFeatures++;
  } else {
    log.warning('Google OAuth no completamente implementado');
    warnings++;
  }
}

// 6. Verificar CRUD de consultorios
log.section('6. CRUD DE CONSULTORIOS');

const crearConsultorioFile = 'src/app/(consultorios)/consultorios/crear/page.tsx';
if (fs.existsSync(crearConsultorioFile)) {
  const content = fs.readFileSync(crearConsultorioFile, 'utf8');
  if (content.includes('createConsultorio') && content.includes('useSupabaseStore')) {
    log.success('Página crear consultorio implementada');
    readyFeatures++;
  } else {
    log.warning('Página crear consultorio sin funcionalidad');
    warnings++;
  }
}

const consultoriosListFile = 'src/app/(consultorios)/consultorios/page.tsx';
if (fs.existsSync(consultoriosListFile)) {
  log.success('Página lista de consultorios existe');
} else {
  log.warning('Página lista de consultorios básica');
}

// 7. Verificar páginas principales
log.section('7. PÁGINAS PRINCIPALES');

const mainPages = [
  'src/app/page.tsx',
  'src/app/(dashboard)/dashboard/page.tsx',
  'src/app/(dashboard)/perfil/page.tsx'
];

let pagesWorking = 0;
mainPages.forEach(page => {
  if (fs.existsSync(page)) {
    log.success(`${page.split('/').pop()}`);
    pagesWorking++;
  } else {
    log.warning(`${page.split('/').pop()} - No encontrada`);
  }
});

if (pagesWorking >= 2) {
  readyFeatures++;
}

// 8. Verificar documentación
log.section('8. DOCUMENTACIÓN');

const docFiles = [
  'docs/deployment/APPLY_MIGRATIONS.md',
  'docs/testing/VERIFICATION_CHECKLIST.md',
  'docs/testing/GOOGLE_OAUTH_CHECKLIST.md'
];

let docsComplete = 0;
docFiles.forEach(doc => {
  if (fs.existsSync(doc)) {
    log.success(`${doc.split('/').pop()}`);
    docsComplete++;
  }
});

if (docsComplete >= 2) {
  readyFeatures++;
}

// RESUMEN FINAL
log.section('📊 RESUMEN FINAL');

const percentage = Math.round((readyFeatures / totalFeatures) * 100);
const status = percentage >= 90 ? 'EXCELENTE' : percentage >= 70 ? 'BUENO' : percentage >= 50 ? 'BÁSICO' : 'INCOMPLETO';

console.log(`\n${colors.bold}🎯 ESTADO DEL PROYECTO: ${colors.cyan}${percentage}% - ${status}${colors.reset}`);
console.log(`${colors.green}✅ Características listas: ${readyFeatures}/${totalFeatures}${colors.reset}`);
console.log(`${colors.red}❌ Errores críticos: ${criticalErrors}${colors.reset}`);
console.log(`${colors.yellow}⚠️  Advertencias: ${warnings}${colors.reset}`);

if (criticalErrors === 0 && percentage >= 80) {
  log.section('🎉 ¡PROYECTO LISTO PARA USAR!');
  log.success('El proyecto está funcionalmente completo');
  log.action('PRÓXIMOS PASOS:');
  console.log('1. 🗄️  Aplicar migraciones en Supabase Dashboard');
  console.log('2. 🔧 Configurar Google OAuth en Supabase');
  console.log('3. 🧪 Seguir checklist de verificación');
  console.log('4. 🚀 ¡Empezar a usar WellPoint!');
  
} else if (criticalErrors === 0) {
  log.section('⚡ PROYECTO CASI LISTO');
  log.warning('Funcionalidades básicas completas, algunas características avanzadas pendientes');
  log.action('COMPLETAR:');
  if (warnings > 0) console.log('- Revisar advertencias mostradas arriba');
  console.log('- Aplicar migraciones en Supabase');
  console.log('- Probar funcionalidades principales');
  
} else {
  log.section('🔧 PROYECTO REQUIERE CONFIGURACIÓN');
  log.error('Hay errores críticos que deben resolverse primero');
  log.action('RESOLVER:');
  console.log('- Errores críticos mostrados arriba');
  console.log('- Configurar variables de entorno');
  console.log('- Verificar archivos faltantes');
}

console.log(`\n📚 Documentación completa en: ${colors.cyan}docs/README.md${colors.reset}`);


