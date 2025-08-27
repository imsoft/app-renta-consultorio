#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔒 INICIANDO AUDITORÍA DE SEGURIDAD AUTOMATIZADA\n');

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const AUDIT_CONFIG = {
  // URLs a auditar
  targetUrls: [
    'http://localhost:3000',
    'http://localhost:3000/consultorios',
    'http://localhost:3000/login',
    'http://localhost:3000/registro'
  ],
  
  // Archivos a revisar
  filesToCheck: [
    'src/app/api/**/*.ts',
    'src/components/**/*.tsx',
    'src/lib/**/*.ts',
    'src/stores/**/*.ts'
  ],
  
  // Patrones de seguridad a buscar
  securityPatterns: {
    // Patrones peligrosos
    dangerous: [
      /eval\s*\(/gi,
      /innerHTML\s*=/gi,
      /document\.write/gi,
      /setTimeout\s*\([^,]*,\s*[^)]*\)/gi,
      /setInterval\s*\([^,]*,\s*[^)]*\)/gi
    ],
    
    // Patrones de validación (deberían existir)
    validation: [
      /validateUUID/gi,
      /validateEmail/gi,
      /sanitizeInput/gi,
      /z\.string\(\)\.email/gi,
      /z\.string\(\)\.uuid/gi
    ],
    
    // Patrones de seguridad (deberían existir)
    security: [
      /Content-Security-Policy/gi,
      /X-XSS-Protection/gi,
      /X-Frame-Options/gi,
      /rateLimit/gi,
      /securityMiddleware/gi
    ]
  }
};

// ============================================================================
// FUNCIONES DE AUDITORÍA
// ============================================================================

function checkDependencies() {
  console.log('📦 Verificando dependencias de seguridad...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const securityPackages = [
      'helmet',
      'express-rate-limit',
      'cors',
      'helmet-csp',
      'express-validator',
      'bcryptjs',
      'jsonwebtoken'
    ];
    
    const missingPackages = securityPackages.filter(pkg => !dependencies[pkg]);
    
    if (missingPackages.length > 0) {
      console.log('⚠️  Paquetes de seguridad faltantes:');
      missingPackages.forEach(pkg => console.log(`   - ${pkg}`));
    } else {
      console.log('✅ Todas las dependencias de seguridad están instaladas');
    }
    
  } catch (error) {
    console.log('❌ Error al verificar dependencias:', error.message);
  }
}

function checkCodePatterns() {
  console.log('\n🔍 Analizando patrones de código...');
  
  const results = {
    dangerous: [],
    validation: [],
    security: []
  };
  
  AUDIT_CONFIG.filesToCheck.forEach(pattern => {
    try {
      // Buscar archivos que coincidan con el patrón
      const files = execSync(`find . -path "${pattern}" -type f`, { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(f => f);
      
      files.forEach(file => {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          
          // Buscar patrones peligrosos
          AUDIT_CONFIG.securityPatterns.dangerous.forEach((pattern, index) => {
            const matches = content.match(pattern);
            if (matches) {
              results.dangerous.push({
                file,
                pattern: pattern.toString(),
                matches: matches.length
              });
            }
          });
          
          // Buscar patrones de validación
          AUDIT_CONFIG.securityPatterns.validation.forEach((pattern, index) => {
            const matches = content.match(pattern);
            if (matches) {
              results.validation.push({
                file,
                pattern: pattern.toString(),
                matches: matches.length
              });
            }
          });
          
          // Buscar patrones de seguridad
          AUDIT_CONFIG.securityPatterns.security.forEach((pattern, index) => {
            const matches = content.match(pattern);
            if (matches) {
              results.security.push({
                file,
                pattern: pattern.toString(),
                matches: matches.length
              });
            }
          });
        }
      });
    } catch (error) {
      // Ignorar errores de find
    }
  });
  
  // Mostrar resultados
  if (results.dangerous.length > 0) {
    console.log('🚨 PATRONES PELIGROSOS ENCONTRADOS:');
    results.dangerous.forEach(item => {
      console.log(`   - ${item.file}: ${item.pattern} (${item.matches} ocurrencias)`);
    });
  } else {
    console.log('✅ No se encontraron patrones peligrosos');
  }
  
  if (results.validation.length > 0) {
    console.log('✅ PATRONES DE VALIDACIÓN ENCONTRADOS:');
    results.validation.forEach(item => {
      console.log(`   - ${item.file}: ${item.pattern} (${item.matches} ocurrencias)`);
    });
  }
  
  if (results.security.length > 0) {
    console.log('🛡️ PATRONES DE SEGURIDAD ENCONTRADOS:');
    results.security.forEach(item => {
      console.log(`   - ${item.file}: ${item.pattern} (${item.matches} ocurrencias)`);
    });
  }
}

function checkEnvironmentVariables() {
  console.log('\n🔐 Verificando variables de entorno...');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('⚠️  Variables de entorno faltantes:');
    missingVars.forEach(varName => console.log(`   - ${varName}`));
  } else {
    console.log('✅ Todas las variables de entorno están configuradas');
  }
}

function checkFilePermissions() {
  console.log('\n📁 Verificando permisos de archivos...');
  
  const sensitiveFiles = [
    '.env.local',
    '.env',
    'package.json',
    'next.config.ts'
  ];
  
  sensitiveFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      const permissions = stats.mode.toString(8).slice(-3);
      
      if (permissions !== '600' && file.startsWith('.env')) {
        console.log(`⚠️  Permisos inseguros en ${file}: ${permissions} (debería ser 600)`);
      } else {
        console.log(`✅ Permisos correctos en ${file}: ${permissions}`);
      }
    }
  });
}

function generateSecurityReport() {
  console.log('\n📊 GENERANDO REPORTE DE SEGURIDAD...');
  
  const report = {
    timestamp: new Date().toISOString(),
    checks: {
      dependencies: 'completed',
      codePatterns: 'completed',
      environment: 'completed',
      permissions: 'completed'
    },
    recommendations: [
      'Implementar WAF (Web Application Firewall)',
      'Configurar monitoreo de seguridad',
      'Realizar auditoría manual de penetración',
      'Implementar logging de seguridad centralizado'
    ]
  };
  
  const reportPath = 'security-audit-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`✅ Reporte guardado en: ${reportPath}`);
}

// ============================================================================
// EJECUCIÓN DE LA AUDITORÍA
// ============================================================================

async function runSecurityAudit() {
  try {
    checkDependencies();
    checkCodePatterns();
    checkEnvironmentVariables();
    checkFilePermissions();
    generateSecurityReport();
    
    console.log('\n🎉 AUDITORÍA DE SEGURIDAD COMPLETADA');
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('1. Revisar el reporte generado');
    console.log('2. Corregir cualquier problema encontrado');
    console.log('3. Considerar una auditoría manual profesional');
    
  } catch (error) {
    console.error('❌ Error durante la auditoría:', error);
  }
}

// Ejecutar auditoría
runSecurityAudit();
