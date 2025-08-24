# Configuración de Variables de Entorno

Para que la aplicación funcione correctamente, necesitas crear un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://wkxtnxaqjjsavhanrjzc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndreHRueGFxampzYXZoYW5yanpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNjg3NjIsImV4cCI6MjA3MTY0NDc2Mn0.wbd4cupJhRgrgJYnFHtcxeWaMl5wIpNFNIxW8urAj6k
```

## Pasos para configurar:

1. Crea un archivo llamado `.env.local` en la raíz del proyecto
2. Copia y pega el contenido de arriba en el archivo
3. Guarda el archivo
4. Reinicia el servidor de desarrollo si está corriendo

## Verificación:

Después de crear el archivo `.env.local`, ejecuta:

```bash
pnpm build
```

El build debería completarse exitosamente sin errores de Supabase.
