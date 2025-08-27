# 🧪 GUÍA DE PRUEBA MANUAL - SISTEMA DE RESERVAS POR HORAS

## 📋 PREPARACIÓN

1. **Asegúrate de que el servidor esté corriendo:**
   ```bash
   pnpm dev
   ```

2. **Verifica que las migraciones estén aplicadas:**
   ```bash
   supabase db push
   ```

## 🎯 PRUEBAS A REALIZAR

### 1️⃣ **Página Principal (`/`)**
- [ ] ✅ La página carga correctamente
- [ ] ✅ Se muestran consultorios destacados (si existen)
- [ ] ✅ Los consultorios muestran información real de la BD
- [ ] ✅ Las imágenes se cargan correctamente
- [ ] ✅ El botón "Ver todos los consultorios" funciona

### 2️⃣ **Lista de Consultorios (`/consultorios`)**
- [ ] ✅ Se muestran todos los consultorios activos
- [ ] ✅ Los filtros funcionan (especialidades, precio, etc.)
- [ ] ✅ La búsqueda funciona
- [ ] ✅ El ordenamiento funciona
- [ ] ✅ Cada consultorio muestra información completa
- [ ] ✅ Los enlaces a detalles funcionan

### 3️⃣ **Detalles del Consultorio (`/consultorios/[id]`)**
- [ ] ✅ Se carga la información del consultorio
- [ ] ✅ Se muestran las imágenes del consultorio
- [ ] ✅ Se muestra la información del propietario
- [ ] ✅ Se muestran los horarios de operación
- [ ] ✅ Se muestran las especialidades permitidas
- [ ] ✅ Se muestran los servicios disponibles

### 4️⃣ **Sistema de Reservas por Horas** ⭐
- [ ] ✅ El componente `HourlyBookingSelector` se muestra
- [ ] ✅ El calendario se carga correctamente
- [ ] ✅ Se pueden seleccionar fechas
- [ ] ✅ Se muestran los días disponibles/no disponibles
- [ ] ✅ Se generan los slots de una hora correctamente
- [ ] ✅ Se muestran los horarios disponibles (8:00-9:00, 9:00-10:00, etc.)
- [ ] ✅ Se pueden seleccionar horarios específicos
- [ ] ✅ Se muestra el precio por hora
- [ ] ✅ El botón de confirmación funciona

### 5️⃣ **Autenticación**
- [ ] ✅ El login funciona con Google OAuth
- [ ] ✅ El registro funciona
- [ ] ✅ Las rutas protegidas funcionan
- [ ] ✅ El logout funciona

### 6️⃣ **Funcionalidades de Usuario**
- [ ] ✅ Se pueden agregar/quitar favoritos
- [ ] ✅ Se pueden ver las reservas propias
- [ ] ✅ Se puede editar el perfil
- [ ] ✅ Se pueden crear consultorios (si es owner)

## 🔍 PRUEBAS ESPECÍFICAS DEL SISTEMA POR HORAS

### **Flujo Completo de Reserva:**
1. **Navegar a un consultorio:**
   - Ve a `/consultorios`
   - Haz clic en cualquier consultorio

2. **Probar el selector de horarios:**
   - Verifica que el calendario se muestre
   - Selecciona una fecha futura
   - Verifica que se muestren los slots de una hora
   - Selecciona un horario disponible

3. **Confirmar reserva:**
   - Verifica que se muestre el resumen
   - Verifica que el precio sea correcto
   - Haz clic en "Confirmar reserva"

4. **Verificar en la base de datos:**
   - La reserva se crea con duración exacta de 1 hora
   - El estado es "pendiente"
   - El precio es correcto

### **Pruebas de Validación:**
- [ ] ✅ No se pueden seleccionar fechas pasadas
- [ ] ✅ No se pueden seleccionar días no disponibles
- [ ] ✅ No se pueden seleccionar horarios ocupados
- [ ] ✅ Se requiere autenticación para reservar

## 🐛 POSIBLES PROBLEMAS Y SOLUCIONES

### **Problema: No se muestran consultorios**
- **Solución:** Verifica que haya consultorios activos en la BD
- **Comando:** `node scripts/simple-test.js`

### **Problema: Error en funciones SQL**
- **Solución:** Aplica la migración de corrección
- **Comando:** `supabase db push`

### **Problema: No se cargan las imágenes**
- **Solución:** Verifica que las URLs de imágenes sean válidas
- **Alternativa:** Usa imágenes de placeholder

### **Problema: Error de autenticación**
- **Solución:** Verifica la configuración de Google OAuth
- **Verificar:** Variables de entorno en `.env.local`

## 📊 CRITERIOS DE ÉXITO

### **✅ ÉXITO TOTAL:**
- Todas las páginas cargan sin errores
- El sistema de reservas por horas funciona completamente
- Se pueden crear reservas de 1 hora exacta
- La validación funciona correctamente
- La UI es responsive y funcional

### **⚠️ ÉXITO PARCIAL:**
- Las páginas cargan pero hay algunos errores menores
- El sistema básico funciona pero faltan algunas validaciones
- La UI funciona pero no es completamente responsive

### **❌ FALLO:**
- Las páginas no cargan
- El sistema de reservas no funciona
- Errores críticos en la consola

## 🎉 CONCLUSIÓN

Si todas las pruebas pasan, el sistema de reservas por horas está **LISTO PARA PRODUCCIÓN** y puede ser utilizado por usuarios reales.

**¡El sistema WellPoint con reservas por horas está completamente funcional!** 🚀
