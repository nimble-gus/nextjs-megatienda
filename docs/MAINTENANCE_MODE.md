# Modo Mantenimiento - "Volvemos En Breve"

## Descripción

Esta funcionalidad permite pausar temporalmente el sitio web mostrando una página de "Volvemos En Breve" a los visitantes, sin necesidad de eliminar el proyecto de Vercel. Es ideal para cuando necesitas realizar mantenimiento o pausar el servicio temporalmente.

## Características

- ✅ Página moderna y atractiva de "Volvemos En Breve"
- ✅ Activación/desactivación mediante variable de entorno
- ✅ Acceso al panel de administración siempre disponible
- ✅ Las APIs continúan funcionando
- ✅ No requiere cambios en el código, solo actualizar variable de entorno

## Cómo Activar el Modo Mantenimiento

### En Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Navega a **Settings** → **Environment Variables**
3. Agrega una nueva variable de entorno:
   - **Name**: `MAINTENANCE_MODE` o `NEXT_PUBLIC_MAINTENANCE_MODE`
   - **Value**: `true`
   - **Environments**: Selecciona Production, Preview, y/o Development según necesites
4. Haz clic en **Save**
5. Vercel re-desplegará automáticamente el proyecto con el modo mantenimiento activado

### Para Activar Solo en Producción

1. Agrega la variable de entorno
2. En el campo **Environments**, selecciona solo **Production**
3. Los ambientes de desarrollo y preview seguirán funcionando normalmente

### Para Desactivar el Modo Mantenimiento

1. Ve a **Settings** → **Environment Variables** en Vercel
2. Edita la variable `MAINTENANCE_MODE` o `NEXT_PUBLIC_MAINTENANCE_MODE`
3. Cambia el valor a `false` o elimina la variable completamente
4. Vercel re-desplegará automáticamente y el sitio volverá a funcionar normalmente

## Rutas Permitidas Durante el Modo Mantenimiento

Cuando el modo mantenimiento está activado, las siguientes rutas siguen siendo accesibles:

- ✅ `/admin/*` - Panel de administración (para poder desactivar el modo)
- ✅ `/api/*` - Endpoints de API (para funcionalidades internas)
- ✅ `/maintenance` - La página de mantenimiento misma
- ✅ `/_next/*` - Archivos estáticos de Next.js
- ✅ `/favicon.ico` - Favicon
- ✅ `/assets/*` - Recursos estáticos

**Todas las demás rutas** redirigirán automáticamente a `/maintenance`.

## Página de Mantenimiento

La página de mantenimiento incluye:

- 🎨 Diseño moderno y atractivo
- ⏰ Reloj en tiempo real mostrando la hora actual
- 📅 Fecha actual completa
- 💫 Animaciones suaves y profesionales
- 📱 Diseño totalmente responsive
- ♿ Accesible y con buena legibilidad

## Desarrollo Local

### Para Probar el Modo Mantenimiento Localmente

1. Crea un archivo `.env.local` en la raíz del proyecto (si no existe):
```bash
MAINTENANCE_MODE=true
```

2. Reinicia el servidor de desarrollo:
```bash
npm run dev
```

3. Visita cualquier ruta (excepto las permitidas) y serás redirigido a `/maintenance`

### Para Desactivar en Desarrollo

1. Edita `.env.local` y cambia a `false` o elimina la variable:
```bash
MAINTENANCE_MODE=false
```

2. Reinicia el servidor de desarrollo

## Variables de Entorno Soportadas

El sistema reconoce ambas variables de entorno:

- `MAINTENANCE_MODE` - Recomendada para uso interno
- `NEXT_PUBLIC_MAINTENANCE_MODE` - Disponible en el cliente también (por si necesitas verificar en el frontend)

**Valores válidos:**
- `true` - Activa el modo mantenimiento
- Cualquier otro valor o ausencia de variable - Desactiva el modo mantenimiento

## Solución de Problemas

### El modo mantenimiento no se activa

1. Verifica que la variable de entorno esté configurada como `true` (string)
2. Asegúrate de que el proyecto se haya re-desplegado después de agregar la variable
3. Verifica que estés probando en el ambiente correcto (Production/Preview/Development)
4. Limpia la caché del navegador

### Necesitas acceder al admin durante el mantenimiento

El panel de administración (`/admin/*`) siempre está disponible durante el modo mantenimiento. Simplemente accede directamente a la URL del admin.

### Las APIs no funcionan

Verifica que la ruta de la API esté bajo `/api/*`. Todas las rutas que comienzan con `/api` son permitidas durante el modo mantenimiento.

## Notas Importantes

- ⚠️ El modo mantenimiento NO afecta las funcionalidades del panel de administración
- ⚠️ El modo mantenimiento NO afecta las APIs
- ⚠️ Solo afecta las rutas públicas del sitio
- ⚠️ Recuerda desactivar el modo cuando termines el mantenimiento

## Personalización

Si deseas personalizar el mensaje o diseño de la página de mantenimiento, edita:

- **Componente**: `src/app/maintenance/page.jsx`
- **Estilos**: `src/styles/MaintenancePage.css`

