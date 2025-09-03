// Script para limpiar TODOS los roles que no sean 'user' o 'admin'
// Ejecutar con: node scripts/cleanup-all-roles.js

const fs = require('fs');
const path = require('path');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Función para buscar y reemplazar en archivos
function replaceInFile(filePath, searchRegex, replacement) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    content = content.replace(searchRegex, replacement);
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    log(`❌ Error procesando ${filePath}: ${error.message}`, 'red');
    return false;
  }
}

// Función para procesar un archivo
function processFile(filePath) {
  let changes = 0;
  
  // Reemplazos para roles
  const replacements = [
    {
      search: /role:\s*['"]professional['"]/g,
      replacement: "role: 'user'",
      description: "role: 'professional' → role: 'user'"
    },
    {
      search: /role:\s*['"]owner['"]/g,
      replacement: "role: 'user'",
      description: "role: 'owner' → role: 'user'"
    },
    {
      search: /role:\s*['"]user['"]\s*\|\s*['"]professional['"]\s*\|\s*['"]owner['"]\s*\|\s*['"]admin['"]/g,
      replacement: "role: 'user' | 'admin'",
      description: "role union types → role: 'user' | 'admin'"
    },
    {
      search: /role:\s*['"]professional['"]\s*\|\s*['"]owner['"]\s*\|\s*['"]admin['"]/g,
      replacement: "role: 'user' | 'admin'",
      description: "role union types → role: 'user' | 'admin'"
    },
    {
      search: /role:\s*['"]owner['"]\s*\|\s*['"]admin['"]/g,
      replacement: "role: 'user' | 'admin'",
      description: "role union types → role: 'user' | 'admin'"
    },
    {
      search: /role:\s*['"]professional['"]\s*\|\s*['"]admin['"]/g,
      replacement: "role: 'user' | 'admin'",
      description: "role union types → role: 'user' | 'admin'"
    },
    {
      search: /allowedRoles=\{\["professional",\s*"owner",\s*"admin"\]\}/g,
      replacement: 'allowedRoles={["user", "admin"]}',
      description: "allowedRoles → ['user', 'admin']"
    },
    {
      search: /allowedRoles=\{\["professional",\s*"admin"\]\}/g,
      replacement: 'allowedRoles={["user", "admin"]}',
      description: "allowedRoles → ['user', 'admin']"
    },
    {
      search: /allowedRoles=\{\["owner",\s*"admin"\]\}/g,
      replacement: 'allowedRoles={["user", "admin"]}',
      description: "allowedRoles → ['user', 'admin']"
    },
    {
      search: /role\s*!==\s*['"]owner['"]/g,
      replacement: "role !== 'user'",
      description: "role !== 'owner' → role !== 'user'"
    },
    {
      search: /role\s*!==\s*['"]professional['"]/g,
      replacement: "role !== 'user'",
      description: "role !== 'professional' → role !== 'user'"
    },
    {
      search: /role\s*===\s*['"]owner['"]/g,
      replacement: "role === 'user'",
      description: "role === 'owner' → role === 'user'"
    },
    {
      search: /role\s*===\s*['"]professional['"]/g,
      replacement: "role === 'user'",
      description: "role === 'professional' → role === 'user'"
    },
    {
      search: /rol\s*!==\s*['"]owner['"]/g,
      replacement: "rol !== 'user'",
      description: "rol !== 'owner' → rol !== 'user'"
    },
    {
      search: /rol\s*!==\s*['"]professional['"]/g,
      replacement: "rol !== 'user'",
      description: "rol !== 'professional' → rol !== 'user'"
    },
    {
      search: /rol\s*===\s*['"]owner['"]/g,
      replacement: "rol === 'user'",
      description: "rol === 'owner' → rol === 'user'"
    },
    {
      search: /rol\s*===\s*['"]professional['"]/g,
      replacement: "rol === 'user'",
      description: "rol === 'professional' → rol === 'user'"
    }
  ];
  
  replacements.forEach(({ search, replacement, description }) => {
    if (replaceInFile(filePath, search, replacement)) {
      changes++;
      log(`  ✅ ${description}`, 'green');
    }
  });
  
  return changes;
}

// Función para procesar directorios recursivamente
function processDirectory(dirPath, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let totalChanges = 0;
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Ignorar directorios del sistema
        if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(item)) {
          totalChanges += processDirectory(fullPath, extensions);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          log(`📁 Procesando: ${fullPath}`, 'blue');
          const changes = processFile(fullPath);
          totalChanges += changes;
          if (changes > 0) {
            log(`  📊 Total de cambios en este archivo: ${changes}`, 'cyan');
          }
        }
      }
    }
  } catch (error) {
    log(`❌ Error accediendo al directorio ${dirPath}: ${error.message}`, 'red');
  }
  
  return totalChanges;
}

// Función principal
async function main() {
  log('🧹 INICIANDO LIMPIEZA COMPLETA DE ROLES', 'magenta');
  log('Este script eliminará TODOS los roles que no sean "user" o "admin"', 'yellow');
  log('');
  
  const projectRoot = process.cwd();
  log(`📂 Directorio del proyecto: ${projectRoot}`, 'blue');
  
  // Procesar archivos del proyecto
  log('\n🔍 Buscando archivos para procesar...', 'blue');
  const totalChanges = processDirectory(projectRoot);
  
  log('\n📊 RESUMEN DE LIMPIEZA', 'magenta');
  log(`Total de cambios realizados: ${totalChanges}`, totalChanges > 0 ? 'green' : 'yellow');
  
  if (totalChanges > 0) {
    log('\n✅ Limpieza completada exitosamente!', 'green');
    log('📝 Los siguientes roles han sido reemplazados:', 'cyan');
    log('   • "professional" → "user"', 'cyan');
    log('   • "owner" → "user"', 'cyan');
    log('   • Solo se mantienen: "user" y "admin"', 'cyan');
  } else {
    log('\n✨ No se encontraron roles inválidos para limpiar', 'green');
  }
  
  log('\n⚠️  IMPORTANTE:', 'yellow');
  log('1. Revisa los cambios realizados', 'yellow');
  log('2. Ejecuta "npm run build" para verificar que no hay errores', 'yellow');
  log('3. Aplica los cambios en la base de datos usando el script cleanup-roles.sql', 'yellow');
  
  log('\n🎯 Próximos pasos:', 'blue');
  log('1. Revisar los archivos modificados', 'blue');
  log('2. Ejecutar el script SQL en Supabase para limpiar la BD', 'blue');
  log('3. Probar la funcionalidad', 'blue');
}

// Ejecutar el script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { processFile, processDirectory };
