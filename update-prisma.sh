#!/bin/bash

# Script para actualizar Prisma después de cambiar las columnas
echo "🔄 Actualizando Prisma después de cambios en la base de datos..."

# 1. Generar el cliente de Prisma
echo "📦 Generando cliente de Prisma..."
npx prisma generate

# 2. Verificar el estado de la base de datos
echo "🔍 Verificando estado de la base de datos..."
npx prisma db pull

# 3. Aplicar los cambios del schema
echo "🚀 Aplicando cambios del schema..."
npx prisma db push

# 4. Verificar que todo está sincronizado
echo "✅ Verificando sincronización..."
npx prisma db pull --print

echo "🎉 ¡Actualización completada!"
echo ""
echo "📋 Resumen de cambios:"
echo "- ciudad_cliente → municipio_cliente"
echo "- Formulario actualizado: Estado → Departamento, Ciudad → Municipio"
echo "- Moneda cambiada: $ → Q (Quetzales)"
echo "- Imágenes de productos mejoradas"
echo ""
echo "🚀 El servidor está listo para usar los nuevos cambios."
