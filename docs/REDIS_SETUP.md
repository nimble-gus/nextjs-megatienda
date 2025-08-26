# Configuración de Redis con Upstash

## 🚀 ¿Por qué Redis?

Redis proporciona un caché distribuido que funciona tanto en desarrollo local como en Vercel, resolviendo los problemas de saturación de la base de datos y mejorando significativamente el rendimiento.

## 📋 Pasos para Configurar Upstash Redis

### 1. Crear cuenta en Upstash
1. Ve a [https://upstash.com/](https://upstash.com/)
2. Crea una cuenta gratuita
3. Crea una nueva base de datos Redis

### 2. Obtener credenciales
1. En tu dashboard de Upstash, selecciona tu base de datos
2. Ve a la pestaña "REST API"
3. Copia la **URL** y el **TOKEN**

### 3. Configurar variables de entorno

#### Para desarrollo local (`.env.local`):
```env
# Redis Configuration (Upstash)
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

#### Para Vercel:
1. Ve a tu proyecto en Vercel
2. Ve a Settings > Environment Variables
3. Agrega las mismas variables:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

## 🔧 Características del Caché Redis

### TTL (Time To Live) Configurado:
- **Productos**: 2 minutos
- **Filtros**: 10 minutos
- **Categorías**: 15 minutos
- **Colores**: 15 minutos
- **Hero Images**: 30 minutos
- **Promo Banners**: 30 minutos

### Funcionalidades:
- ✅ Caché automático en todas las APIs
- ✅ Invalidación inteligente
- ✅ Estadísticas del caché
- ✅ Fallback a base de datos si Redis falla
- ✅ Compatible con Vercel serverless

## 🧪 Probar la Configuración

### 1. Verificar que Redis esté funcionando:
```bash
node test-redis-cache.js
```

### 2. Verificar estadísticas del caché:
```bash
curl http://localhost:3001/api/cache/invalidate
```

### 3. Invalidar caché específico:
```bash
curl -X POST http://localhost:3001/api/cache/invalidate \
  -H "Content-Type: application/json" \
  -d '{"type": "products"}'
```

## 📊 Beneficios

### Antes (sin Redis):
- ❌ Saturación de la base de datos
- ❌ Consultas repetidas innecesarias
- ❌ Tiempos de respuesta lentos
- ❌ Problemas en Vercel

### Después (con Redis):
- ✅ Respuestas instantáneas desde caché
- ✅ Menos carga en la base de datos
- ✅ Mejor experiencia de usuario
- ✅ Funciona perfectamente en Vercel
- ✅ Escalabilidad mejorada

## 🔍 Monitoreo

### Ver estadísticas del caché:
```javascript
// GET /api/cache/invalidate
{
  "success": true,
  "stats": {
    "totalKeys": 15,
    "products": 8,
    "filters": 1,
    "categories": 1,
    "colors": 1,
    "multimedia": 4
  }
}
```

### Invalidar tipos específicos:
- `products`: Invalida caché de productos y filtros
- `filters`: Invalida caché de filtros, categorías y colores
- `all`: Invalida todo el caché

## 🚨 Solución de Problemas

### Error: "Redis connection failed"
1. Verifica que las variables de entorno estén configuradas
2. Verifica que la URL y token de Upstash sean correctos
3. Verifica que tu base de datos Redis esté activa

### Error: "Cache not working"
1. Verifica que el servidor esté corriendo
2. Revisa los logs del servidor
3. Ejecuta `node test-redis-cache.js` para diagnosticar

### Caché no se actualiza:
1. Usa la API de invalidación: `POST /api/cache/invalidate`
2. Espera a que expire el TTL
3. Verifica que los datos en la BD hayan cambiado

## 💡 Tips

1. **Desarrollo**: El caché funciona igual en desarrollo y producción
2. **Vercel**: Cada función serverless comparte el mismo caché Redis
3. **Monitoreo**: Usa las estadísticas para optimizar TTL
4. **Invalidación**: Invalida el caché cuando actualices datos importantes
5. **Fallback**: Si Redis falla, el sistema usa la base de datos directamente

## 🔗 Enlaces Útiles

- [Upstash Dashboard](https://console.upstash.com/)
- [Upstash Redis Docs](https://docs.upstash.com/redis)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
