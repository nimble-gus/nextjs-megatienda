// Script para probar productos destacados
const testFeaturedProducts = async () => {
  try {
    console.log('=== Probando Productos Destacados ===');
    
    // 1. Probar API de productos destacados
    console.log('\n1. Probando /api/featured-products');
    const featuredResponse = await fetch('http://localhost:3000/api/featured-products');
    const featuredData = await featuredResponse.json();
    
    if (featuredData.success) {
      console.log('✅ API de productos destacados funciona');
      console.log(`Productos destacados encontrados: ${featuredData.products.length}`);
      
      featuredData.products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - ${product.priceFormatted} (Featured: ${product.featured})`);
      });
    } else {
      console.log('❌ Error en API de productos destacados:', featuredData.error);
    }
    
    // 2. Probar API de productos admin
    console.log('\n2. Probando /api/admin/products');
    const adminResponse = await fetch('http://localhost:3000/api/admin/products');
    const adminData = await adminResponse.json();
    
    if (adminData.success) {
      console.log('✅ API de productos admin funciona');
      console.log(`Total productos: ${adminData.products.length}`);
      
      const featuredCount = adminData.products.filter(p => p.featured).length;
      console.log(`Productos marcados como featured: ${featuredCount}`);
    } else {
      console.log('❌ Error en API de productos admin:', adminData.error);
    }
    
    // 3. Probar actualización de producto destacado (si hay productos)
    if (adminData.success && adminData.products.length > 0) {
      const firstProduct = adminData.products[0];
      console.log(`\n3. Probando actualización de featured para producto ${firstProduct.id}`);
      
      const updateResponse = await fetch(`http://localhost:3000/api/admin/products/${firstProduct.id}/featured`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featured: !firstProduct.featured }),
      });
      
      const updateData = await updateResponse.json();
      
      if (updateData.success) {
        console.log('✅ Actualización de featured funciona');
        console.log(`Producto ${firstProduct.id} featured cambiado a: ${updateData.product.featured}`);
        
        // Revertir el cambio
        console.log('\n4. Revirtiendo cambio...');
        const revertResponse = await fetch(`http://localhost:3000/api/admin/products/${firstProduct.id}/featured`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ featured: firstProduct.featured }),
        });
        
        const revertData = await revertResponse.json();
        if (revertData.success) {
          console.log('✅ Reversión exitosa');
        }
      } else {
        console.log('❌ Error actualizando featured:', updateData.error);
      }
    }
    
    // 4. Verificar estructura de datos
    console.log('\n5. Verificando estructura de datos');
    if (featuredData.success && featuredData.products.length > 0) {
      const sampleProduct = featuredData.products[0];
      console.log('Estructura de producto destacado:');
      console.log('- id:', sampleProduct.id);
      console.log('- name:', sampleProduct.name);
      console.log('- priceFormatted:', sampleProduct.priceFormatted);
      console.log('- featured:', sampleProduct.featured);
      console.log('- hasStock:', sampleProduct.hasStock);
      console.log('- colors:', sampleProduct.colors?.length || 0, 'colores disponibles');
      
      if (sampleProduct.destacado) {
        console.log('- destacado:', {
          orden: sampleProduct.destacado.orden,
          activo: sampleProduct.destacado.activo,
          fechaInicio: sampleProduct.destacado.fechaInicio
        });
      }
    }
    
  } catch (error) {
    console.error('Error en prueba:', error);
  }
};

// Ejecutar prueba
testFeaturedProducts();
