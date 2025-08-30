console.log('🔧 SOLUCIÓN AL PROBLEMA DE GOOGLE OAUTH - PÁGINAS EN BLANCO');
console.log('=' .repeat(70));

console.log('\n📋 RESUMEN DEL PROBLEMA:');
console.log('✅ La autenticación se guarda correctamente en Supabase');
console.log('❌ El problema está en el lado del cliente (navegador)');
console.log('❌ Los usuarios ven páginas en blanco después del login');

console.log('\n🧹 PASOS PARA SOLUCIONAR:');

console.log('\n1. LIMPIAR CACHE DEL NAVEGADOR:');
console.log('   a) Abrir navegador en MODO INCOGNITO:');
console.log('      - Chrome: Cmd+Shift+N (Mac) o Ctrl+Shift+N (Windows)');
console.log('      - Firefox: Cmd+Shift+P (Mac) o Ctrl+Shift+P (Windows)');
console.log('      - Safari: Cmd+Shift+N (Mac)');

console.log('\n   b) Si no usas modo incógnito, limpiar cache:');
console.log('      - Chrome: Cmd+Shift+Delete > "Todo el tiempo" > Limpiar');
console.log('      - Firefox: Cmd+Shift+Delete > "Todo" > Limpiar');
console.log('      - Safari: Cmd+Option+E > Limpiar');

console.log('\n2. LIMPIAR DATOS DE LA APLICACIÓN:');
console.log('   a) Abrir Developer Tools (F12)');
console.log('   b) Ir a Application/Storage tab');
console.log('   c) Eliminar todo en:');
console.log('      - Local Storage > http://localhost:3000');
console.log('      - Session Storage > http://localhost:3000');
console.log('      - Cookies > http://localhost:3000');
console.log('      - IndexedDB > Bases de datos de Supabase');
console.log('      - Cache Storage > Todo');
console.log('      - Service Workers > Unregister todos');

console.log('\n3. LIMPIAR CACHE DE NEXT.JS:');
console.log('   a) Detener el servidor (Ctrl+C)');
console.log('   b) Ejecutar: rm -rf .next');
console.log('   c) Ejecutar: pnpm dev');

console.log('\n4. PROBAR LOGIN CON GOOGLE:');
console.log('   a) Ir a: http://localhost:3000/login');
console.log('   b) Hacer clic en "Continuar con Google"');
console.log('   c) Completar autenticación');
console.log('   d) Verificar redirección a /dashboard');

console.log('\n🔧 COMANDOS PARA EJECUTAR:');

console.log('\n# Detener servidor actual');
console.log('Ctrl+C');

console.log('\n# Limpiar cache de Next.js');
console.log('rm -rf .next');

console.log('\n# Limpiar cache de pnpm (opcional)');
console.log('pnpm store prune');

console.log('\n# Reinstalar dependencias (si hay problemas)');
console.log('rm -rf node_modules');
console.log('pnpm install');

console.log('\n# Iniciar servidor');
console.log('pnpm dev');

console.log('\n📊 VERIFICACIÓN POSTERIOR:');

console.log('\n1. En el navegador:');
console.log('   - Verificar que no hay datos en localStorage');
console.log('   - Verificar que no hay cookies de Supabase');
console.log('   - Verificar que el login funciona correctamente');

console.log('\n2. En Supabase Dashboard:');
console.log('   - Ir a Authentication > Users');
console.log('   - Verificar que el usuario se crea correctamente');
console.log('   - Verificar que el provider es "google"');

console.log('\n3. En la aplicación:');
console.log('   - Verificar redirección exitosa a /dashboard');
console.log('   - Verificar que el header muestra el nombre del usuario');
console.log('   - Verificar que la navegación funciona correctamente');

console.log('\n🚨 SI EL PROBLEMA PERSISTE:');

console.log('\n1. Probar en navegador diferente:');
console.log('   - Chrome, Firefox, Safari');
console.log('   - Modo incógnito vs normal');

console.log('\n2. Verificar configuración:');
console.log('   - Supabase Dashboard > Authentication > Providers > Google');
console.log('   - Google Cloud Console > Credentials > OAuth 2.0 Client IDs');

console.log('\n3. Verificar URLs de redirección:');
console.log('   - Supabase: http://localhost:3000/dashboard');
console.log('   - Google: https://wkxtnxaqjjsavhanrjzc.supabase.co/auth/v1/callback');

console.log('\n4. Probar con usuario diferente:');
console.log('   - Usar otra cuenta de Google');
console.log('   - Verificar si el problema es específico de ciertas cuentas');

console.log('\n📝 NOTAS IMPORTANTES:');

console.log('\n• El problema NO está en Supabase (la autenticación funciona)');
console.log('• El problema está en el cache/datos locales del navegador');
console.log('• La solución es limpiar completamente el estado del cliente');
console.log('• El modo incógnito es la forma más rápida de probar');

console.log('\n✅ RESULTADO ESPERADO:');
console.log('• Login exitoso con Google');
console.log('• Redirección correcta a /dashboard');
console.log('• Página carga completamente (no en blanco)');
console.log('• Usuario autenticado y navegación funcional');

console.log('\n🎯 LISTO PARA PROBAR');
