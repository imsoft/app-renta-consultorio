const fs = require('fs');
const path = require('path');

// Rutas que sabemos que existen
const existingRoutes = [
  '/',
  '/login',
  '/registro',
  '/recuperar-password',
  '/dashboard',
  '/reservas',
  '/favoritos',
  '/ingresos',
  '/mis-consultorios',
  '/perfil',
  '/consultorios',
  '/consultorios/crear',
  '/como-funciona',
  '/contacto',
  '/faq',
  '/centro-ayuda',
  '/reportar-problema',
  '/terminos-servicio',
  '/politica-privacidad',
  '/cookies',
  '/pagos-seguros',
  '/publicar-espacio',
  '/admin/security',
  '/pagos/dashboard',
  '/pagos/conectar',
  '/pagos/conectado',
  '/checkout'
];

// Función para extraer enlaces de un archivo
function extractLinks(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const links = [];
  
  // Buscar enlaces href=
  const hrefMatches = content.match(/href=["']([^"']+)["']/g);
  if (hrefMatches) {
    hrefMatches.forEach(match => {
      const href = match.match(/href=["']([^"']+)["']/)[1];
      if (href.startsWith('/') && !href.startsWith('/api')) {
        links.push(href);
      }
    });
  }
  
  // Buscar enlaces Link to=
  const linkMatches = content.match(/to=["']([^"']+)["']/g);
  if (linkMatches) {
    linkMatches.forEach(match => {
      const to = match.match(/to=["']([^"']+)["']/)[1];
      if (to.startsWith('/') && !to.startsWith('/api')) {
        links.push(to);
      }
    });
  }
  
  // Buscar router.push
  const routerMatches = content.match(/router\.push\(["']([^"']+)["']\)/g);
  if (routerMatches) {
    routerMatches.forEach(match => {
      const route = match.match(/router\.push\(["']([^"']+)["']\)/)[1];
      if (route.startsWith('/') && !route.startsWith('/api')) {
        links.push(route);
      }
    });
  }
  
  return links;
}

// Función para verificar si una ruta existe
function routeExists(route) {
  // Rutas dinámicas que sabemos que existen
  if (route.includes('/consultorios/') && route.includes('/editar')) {
    return true; // /consultorios/[id]/editar
  }
  if (route.includes('/consultorios/') && !route.includes('/editar') && !route.includes('/crear')) {
    return true; // /consultorios/[id]
  }
  if (route.includes('/mis-consultorios/')) {
    return true; // /mis-consultorios/[id]
  }
  if (route.includes('/checkout/')) {
    return true; // /checkout/[reservaId]
  }
  
  return existingRoutes.includes(route);
}

// Función para buscar archivos recursivamente
function findFiles(dir, extensions = ['.tsx', '.ts', '.js', '.jsx']) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    });
  }
  
  traverse(dir);
  return files;
}

// Función principal
function verifyLinks() {
  console.log('🔍 Verificando enlaces en el proyecto...\n');
  
  const srcDir = path.join(__dirname, '..', 'src');
  const files = findFiles(srcDir);
  
  const brokenLinks = [];
  const allLinks = new Set();
  
  files.forEach(file => {
    try {
      const links = extractLinks(file);
      const relativePath = path.relative(process.cwd(), file);
      
      links.forEach(link => {
        allLinks.add(link);
        
        if (!routeExists(link)) {
          brokenLinks.push({
            file: relativePath,
            link: link
          });
        }
      });
    } catch (error) {
      console.error(`Error procesando archivo ${file}:`, error.message);
    }
  });
  
  // Mostrar resultados
  console.log(`📊 Resumen:`);
  console.log(`   - Archivos procesados: ${files.length}`);
  console.log(`   - Enlaces únicos encontrados: ${allLinks.size}`);
  console.log(`   - Enlaces rotos: ${brokenLinks.length}\n`);
  
  if (brokenLinks.length > 0) {
    console.log('❌ Enlaces rotos encontrados:');
    brokenLinks.forEach(({ file, link }) => {
      console.log(`   - ${file}: ${link}`);
    });
    console.log('\n💡 Sugerencias:');
    console.log('   - Verifica que las rutas existan en src/app/');
    console.log('   - Asegúrate de que los enlaces dinámicos tengan la estructura correcta');
    console.log('   - Revisa que no haya errores tipográficos en las rutas');
  } else {
    console.log('✅ ¡Todos los enlaces están correctos!');
  }
  
  // Mostrar todas las rutas únicas encontradas
  console.log('\n📋 Todas las rutas encontradas:');
  Array.from(allLinks).sort().forEach(link => {
    const status = routeExists(link) ? '✅' : '❌';
    console.log(`   ${status} ${link}`);
  });
}

// Ejecutar verificación
verifyLinks();
