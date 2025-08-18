// Script de prueba para verificar el checkbox de featured
const testFeaturedCheckbox = async () => {
  try {
    console.log('🧪 Probando funcionalidad del checkbox featured...');
    
    // 1. Obtener un producto para editar
    const getResponse = await fetch('http://localhost:3000/api/admin/products');
    const productsData = await getResponse.json();
    
    if (!productsData || productsData.length === 0) {
      console.log('❌ No hay productos para probar');
      return;
    }
    
    const testProduct = productsData[0];
    console.log(`📦 Producto de prueba: ${testProduct.nombre} (Featured: ${testProduct.featured})`);
    
    // 2. Probar actualización del featured
    const newFeaturedValue = !testProduct.featured;
    console.log(`🔄 Cambiando featured de ${testProduct.featured} a ${newFeaturedValue}`);
    
    const updateData = {
      nombre: testProduct.nombre,
      descripcion: testProduct.descripcion,
      categoria: testProduct.categoria,
      featured: newFeaturedValue,
      url_imagen: testProduct.url_imagen
    };
    
    const updateResponse = await fetch(`http://localhost:3000/api/admin/products/${testProduct.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    const updateResult = await updateResponse.json();
    
    if (updateResponse.ok) {
      console.log('✅ Producto actualizado exitosamente');
      console.log('📊 Resultado:', updateResult);
      
      // 3. Verificar que el cambio se guardó
      const verifyResponse = await fetch(`http://localhost:3000/api/admin/products/${testProduct.id}`);
      const verifyData = await verifyResponse.json();
      
      if (verifyData.featured === newFeaturedValue) {
        console.log('✅ Campo featured actualizado correctamente');
      } else {
        console.log('❌ Campo featured no se actualizó correctamente');
        console.log(`Esperado: ${newFeaturedValue}, Obtenido: ${verifyData.featured}`);
      }
    } else {
      console.error('❌ Error actualizando producto:', updateResult);
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
};

// Ejecutar la prueba
testFeaturedCheckbox();
