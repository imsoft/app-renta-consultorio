#!/usr/bin/env node

/**
 * Script para aplicar todas las migraciones automáticamente a Supabase
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 APLICANDO MIGRACIONES A SUPABASE');
console.log('===================================\n');

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

// Obtener las migraciones en orden
const migrationPath = 'supabase/migrations';
const migrations = fs.readdirSync(migrationPath)
  .filter(f => f.endsWith('.sql'))
  .sort()
  .map(filename => ({
    name: filename.replace('.sql', ''),
    filename,
    path: path.join(migrationPath, filename),
    content: fs.readFileSync(path.join(migrationPath, filename), 'utf8')
  }));

log.section('Migraciones encontradas');
migrations.forEach((migration, index) => {
  log.info(`${index + 1}. ${migration.filename}`);
});

log.section('INSTRUCCIONES PARA APLICAR MIGRACIONES');

log.action('Sigue estos pasos:');
console.log('1. 🌐 Ve a tu Dashboard de Supabase: https://supabase.com/dashboard');
console.log('2. 📂 Selecciona tu proyecto WellPoint');
console.log('3. 🛠️  Haz clic en "SQL Editor" en el menú lateral');
console.log('4. ➕ Haz clic en "New query"');
console.log('5. 📋 Copia y pega cada migración en el orden mostrado');
console.log('6. ▶️  Haz clic en "Run" después de cada una');

log.section('MIGRACIONES A APLICAR (EN ORDEN)');

migrations.forEach((migration, index) => {
  console.log(`\n${colors.bold}${colors.magenta}=== MIGRACIÓN ${index + 1}: ${migration.filename} ===${colors.reset}`);
  console.log(`${colors.cyan}--- COPIAR DESDE AQUÍ ---${colors.reset}`);
  console.log(migration.content);
  console.log(`${colors.cyan}--- COPIAR HASTA AQUÍ ---${colors.reset}`);
  
  if (index < migrations.length - 1) {
    console.log(`\n${colors.yellow}⚠️  Después de ejecutar esta migración, continúa con la siguiente...${colors.reset}`);
  }
});

log.section('VERIFICACIÓN DESPUÉS DE APLICAR');

console.log(`
${colors.bold}Para verificar que todo se aplicó correctamente:${colors.reset}

1. En Supabase Dashboard > Table Editor, deberías ver:
   ${colors.green}✅ profiles${colors.reset}
   ${colors.green}✅ consultorios${colors.reset}
   ${colors.green}✅ reservas${colors.reset}
   ${colors.green}✅ favoritos${colors.reset}
   ${colors.green}✅ calificaciones${colors.reset}

2. En Supabase Dashboard > Storage, deberías ver:
   ${colors.green}✅ avatars bucket${colors.reset}
   ${colors.green}✅ consultorios bucket${colors.reset}

3. Ejecuta esta query de verificación en SQL Editor:
`);

console.log(`${colors.cyan}--- QUERY DE VERIFICACIÓN ---${colors.reset}`);
console.log(`-- Verificar tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verificar storage buckets
SELECT name FROM storage.buckets;

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;`);

console.log(`${colors.cyan}--- FIN QUERY ---${colors.reset}`);

log.section('¿TODO LISTO?');

console.log(`
${colors.bold}Una vez aplicadas todas las migraciones:${colors.reset}

${colors.green}1. ✅ Ejecuta: node scripts/final-verification.js${colors.reset}
${colors.green}2. ✅ Ve a: http://localhost:3000/registro${colors.reset}
${colors.green}3. ✅ Crea una cuenta de prueba${colors.reset}
${colors.green}4. ✅ Prueba crear un consultorio${colors.reset}
${colors.green}5. ✅ ¡Disfruta WellPoint!${colors.reset}

${colors.yellow}📞 Si hay algún problema, revisa los logs en:${colors.reset}
${colors.yellow}   Supabase Dashboard > Logs > Database${colors.reset}
`);

log.success('¡Migraciones preparadas para aplicar!');
