# Script PowerShell para actualizar Prisma después de cambiar las columnas
Write-Host "🔄 Actualizando Prisma después de cambios en la base de datos..." -ForegroundColor Yellow

# 1. Generar el cliente de Prisma
Write-Host "📦 Generando cliente de Prisma..." -ForegroundColor Cyan
npx prisma generate

# 2. Verificar el estado de la base de datos
Write-Host "🔍 Verificando estado de la base de datos..." -ForegroundColor Cyan
npx prisma db pull

# 3. Aplicar los cambios del schema
Write-Host "🚀 Aplicando cambios del schema..." -ForegroundColor Cyan
npx prisma db push

# 4. Verificar que todo está sincronizado
Write-Host "✅ Verificando sincronización..." -ForegroundColor Cyan
npx prisma db pull --print

Write-Host "🎉 ¡Actualización completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Resumen de cambios:" -ForegroundColor White
Write-Host "- ciudad_cliente → municipio_cliente" -ForegroundColor Gray
Write-Host "- Formulario actualizado: Estado → Departamento, Ciudad → Municipio" -ForegroundColor Gray
Write-Host "- Moneda cambiada: `$ → Q (Quetzales)" -ForegroundColor Gray
Write-Host "- Imágenes de productos mejoradas" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 El servidor está listo para usar los nuevos cambios." -ForegroundColor Green
