const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://wkxtnxaqjjsavhanrjzc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndreHRueGFxampzYXZoYW5yanpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNjg3NjIsImV4cCI6MjA3MTY0NDc2Mn0.wbd4cupJhRgrgJYnFHtcxeWaMl5wIpNFNIxW8urAj6k';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabaseSessions() {
  console.log('🔍 Verificando sesiones activas en Supabase');
  console.log('=' .repeat(50));

  try {
    // Verificar sesión actual
    console.log('\n📋 1. Verificando sesión actual...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Error al obtener sesión:', sessionError.message);
    } else if (session) {
      console.log('✅ Sesión activa encontrada:');
      console.log(`   - Usuario: ${session.user.email}`);
      console.log(`   - ID: ${session.user.id}`);
      console.log(`   - Provider: ${session.user.app_metadata?.provider || 'email'}`);
      console.log(`   - Creado: ${session.user.created_at}`);
      console.log(`   - Último login: ${session.user.last_sign_in_at}`);
      
      // Verificar perfil
      console.log('\n📋 2. Verificando perfil del usuario...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) {
        if (profileError.code === 'PGRST116') {
          console.log('⚠️ Perfil no encontrado en la base de datos');
        } else {
          console.error('❌ Error al obtener perfil:', profileError.message);
        }
      } else {
        console.log('✅ Perfil encontrado:');
        console.log(`   - Nombre: ${profile.full_name}`);
        console.log(`   - Role: ${profile.role}`);
        console.log(`   - Avatar: ${profile.avatar_url ? 'Sí' : 'No'}`);
      }
    } else {
      console.log('ℹ️ No hay sesión activa');
    }

    // Verificar usuarios recientes
    console.log('\n📋 3. Verificando usuarios recientes...');
    
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (profilesError) {
        console.error('❌ Error al obtener perfiles:', profilesError.message);
      } else {
        console.log(`✅ Perfiles encontrados: ${profiles.length}`);
        profiles.forEach((profile, index) => {
          console.log(`   ${index + 1}. ${profile.email} (${profile.role}) - ${profile.created_at}`);
        });
      }
    } catch (error) {
      console.error('❌ Error al obtener perfiles:', error.message);
    }

    // Instrucciones para limpiar sesión
    console.log('\n🧹 INSTRUCCIONES PARA LIMPIAR SESIÓN:');
    console.log('\n1. En el navegador:');
    console.log('   - Ir a http://localhost:3000');
    console.log('   - Abrir Developer Tools (F12)');
    console.log('   - Ir a Application > Storage');
    console.log('   - Eliminar todo en Local Storage y Session Storage');
    console.log('   - Eliminar cookies de localhost:3000');

    console.log('\n2. En Supabase Dashboard:');
    console.log('   - Ir a Authentication > Users');
    console.log('   - Buscar el usuario activo');
    console.log('   - Hacer clic en "..." > "Delete user" (opcional)');

    console.log('\n3. Probar login limpio:');
    console.log('   - Abrir navegador en modo incógnito');
    console.log('   - Ir a http://localhost:3000/login');
    console.log('   - Hacer clic en "Continuar con Google"');

    console.log('\n🔧 COMANDOS PARA LIMPIAR CACHE:');
    console.log('\nLimpiar cache de Next.js:');
    console.log('   rm -rf .next');
    console.log('   pnpm dev');

    console.log('\nLimpiar cache del navegador:');
    console.log('   - Chrome: Ctrl+Shift+Delete > Todo el tiempo > Limpiar');
    console.log('   - Firefox: Ctrl+Shift+Delete > Todo > Limpiar');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  }
}

// Ejecutar verificación
checkSupabaseSessions()
  .then(() => {
    console.log('\n✅ Verificación completada');
  })
  .catch(error => {
    console.error('❌ Error en la verificación:', error);
  });
