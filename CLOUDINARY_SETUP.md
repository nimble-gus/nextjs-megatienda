# Configuración de Cloudinary para Comprobantes de Transferencia

## 🎯 Objetivo
Configurar Cloudinary para subir y almacenar los comprobantes de transferencia bancaria que los clientes suben durante el checkout.

## 📋 Pasos para Configurar Cloudinary

### 1. Crear cuenta en Cloudinary
1. Ve a [cloudinary.com](https://cloudinary.com)
2. Crea una cuenta gratuita
3. Accede a tu dashboard

### 2. Obtener las credenciales
En tu dashboard de Cloudinary, necesitas:

1. **Cloud Name**: Se encuentra en la parte superior del dashboard
2. **API Key**: Ve a Settings > Access Keys
3. **API Secret**: Ve a Settings > Access Keys
4. **Upload Preset**: Ve a Settings > Upload > Upload presets

### 3. Crear Upload Preset
1. Ve a Settings > Upload > Upload presets
2. Crea un nuevo preset con:
   - **Name**: `megatienda-upload` (o el nombre que prefieras)
   - **Signing Mode**: `Unsigned`
   - **Folder**: `comprobantes-transferencia`
   - **Allowed Formats**: `jpg, jpeg, png, pdf`
   - **Max File Size**: `10MB` (o el tamaño que prefieras)

### 4. Configurar Variables de Entorno
Crea o edita el archivo `.env.local` en la raíz del proyecto:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="tu-cloud-name"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="megatienda-upload"
CLOUDINARY_API_KEY="tu-api-key"
CLOUDINARY_API_SECRET="tu-api-secret"
```

### 5. Verificar la Configuración
Ejecuta el script de prueba:

```bash
node test-transfer-upload.js
```

## 🔧 Funcionalidad Implementada

### En el Checkout (`/checkout`)
- ✅ Campo de subida de archivo para comprobantes
- ✅ Validación de tipo de archivo (imágenes y PDF)
- ✅ Envío del archivo usando FormData
- ✅ Manejo de errores de subida

### En el API (`/api/checkout/create-order`)
- ✅ Detección automática de FormData vs JSON
- ✅ Subida automática a Cloudinary
- ✅ Almacenamiento de URL en la base de datos
- ✅ Manejo de errores de subida

### En el Admin Dashboard
- ✅ Visualización de comprobantes desde Cloudinary
- ✅ Visor de imágenes y PDF
- ✅ Botón para ver comprobantes
- ✅ Información de validación

## 📁 Estructura de Archivos en Cloudinary

Los comprobantes se subirán a:
```
comprobantes-transferencia/
├── ORD-1234567890-ABC123DEF.jpg
├── ORD-1234567891-XYZ789GHI.pdf
└── ...
```

## 🚨 Solución de Problemas

### Error: "Faltan variables de entorno de Cloudinary"
- Verifica que el archivo `.env.local` existe
- Verifica que las variables están correctamente configuradas
- Reinicia el servidor después de cambiar las variables

### Error: "Error en la subida"
- Verifica que el upload preset está configurado como "Unsigned"
- Verifica que el formato de archivo está permitido
- Verifica que el tamaño del archivo no excede el límite

### Los comprobantes no se muestran en el admin
- Verifica que la URL se guardó correctamente en la base de datos
- Verifica que la URL de Cloudinary es accesible
- Verifica que el archivo se subió correctamente

## 🧪 Pruebas

Para probar la funcionalidad:

1. Ve a la página de checkout
2. Selecciona "Transferencia Bancaria" como método de pago
3. Sube un archivo de comprobante (imagen o PDF)
4. Completa la orden
5. Ve al admin dashboard > Pedidos
6. Busca la orden y haz clic en "Ver Comprobante"

## 📝 Notas Importantes

- Los archivos se suben automáticamente a Cloudinary durante el checkout
- Las URLs se almacenan en el campo `comprobante_transferencia` de la tabla `ordenes`
- El visor de comprobantes funciona con imágenes (jpg, png, gif) y PDFs
- Los archivos se organizan en la carpeta `comprobantes-transferencia` en Cloudinary
