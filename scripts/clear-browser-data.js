console.log('🧹 Limpieza de datos del navegador y cache');
console.log('=' .repeat(50));

console.log('\n📋 INSTRUCCIONES PARA LIMPIAR DATOS:');
console.log('\n1. ABRIR NAVEGADOR EN MODO INCOGNITO:');
console.log('   - Chrome: Ctrl+Shift+N (Windows) o Cmd+Shift+N (Mac)');
console.log('   - Firefox: Ctrl+Shift+P (Windows) o Cmd+Shift+P (Mac)');
console.log('   - Safari: Cmd+Shift+N (Mac)');

console.log('\n2. LIMPIAR CACHE Y COOKIES (si no usas modo incógnito):');
console.log('   - Chrome: Ctrl+Shift+Delete > Seleccionar "Todo el tiempo" > Limpiar');
console.log('   - Firefox: Ctrl+Shift+Delete > Seleccionar "Todo" > Limpiar');
console.log('   - Safari: Cmd+Option+E > Limpiar');

console.log('\n3. LIMPIAR LOCALSTORAGE Y SESSIONSTORAGE:');
console.log('   - Abrir Developer Tools (F12)');
console.log('   - Ir a Application/Storage tab');
console.log('   - Local Storage > http://localhost:3000 > Eliminar todo');
console.log('   - Session Storage > http://localhost:3000 > Eliminar todo');
console.log('   - Cookies > http://localhost:3000 > Eliminar todo');

console.log('\n4. LIMPIAR INDEXEDDB:');
console.log('   - En Application/Storage tab');
console.log('   - IndexedDB > Eliminar bases de datos de Supabase');

console.log('\n5. LIMPIAR CACHE DE SERVICE WORKERS:');
console.log('   - En Application/Storage tab');
console.log('   - Service Workers > Unregister todos');

console.log('\n6. LIMPIAR CACHE DE LA APLICACIÓN:');
console.log('   - En Application/Storage tab');
console.log('   - Cache Storage > Eliminar todo');

console.log('\n7. REINICIAR EL SERVIDOR DE DESARROLLO:');
console.log('   - Detener el servidor (Ctrl+C)');
console.log('   - Ejecutar: pnpm dev');

console.log('\n8. PROBAR LOGIN CON GOOGLE:');
console.log('   - Ir a: http://localhost:3000/login');
console.log('   - Hacer clic en "Continuar con Google"');
console.log('   - Usar una cuenta de Google diferente o la misma');

console.log('\n🔧 COMANDOS ADICIONALES:');

console.log('\nLimpiar cache de Next.js:');
console.log('   rm -rf .next');
console.log('   pnpm dev');

console.log('\nLimpiar node_modules (si hay problemas):');
console.log('   rm -rf node_modules');
console.log('   pnpm install');
console.log('   pnpm dev');

console.log('\nLimpiar cache de pnpm:');
console.log('   pnpm store prune');

console.log('\n📊 VERIFICACIÓN:');
console.log('\nDespués de limpiar, verificar:');
console.log('1. No hay datos en localStorage (Developer Tools > Application)');
console.log('2. No hay cookies de Supabase');
console.log('3. No hay sesiones activas en Supabase Dashboard');
console.log('4. El login con Google funciona correctamente');

console.log('\n🚨 SI EL PROBLEMA PERSISTE:');
console.log('1. Probar en navegador diferente (Chrome, Firefox, Safari)');
console.log('2. Probar en dispositivo diferente');
console.log('3. Verificar configuración de Google OAuth en Supabase');
console.log('4. Verificar URLs de redirección en Google Cloud Console');

console.log('\n✅ LISTO PARA PROBAR');
