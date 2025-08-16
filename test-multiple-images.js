// Script de prueba para múltiples imágenes
const testMultipleImages = async () => {
  console.log('🧪 Probando funcionalidad de múltiples imágenes...\n');

  try {
    // 1. Crear un producto con múltiples imágenes
    console.log('1️⃣ Creando producto con múltiples imágenes...');
    
    const productData = {
      sku: `SKU-TEST-${Date.now()}`,
      nombre: 'Producto con Múltiples Imágenes',
      descripcion: 'Este es un producto de prueba para verificar la funcionalidad de múltiples imágenes',
      url_imagen: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', // Imagen principal
      categoria_id: 1,
      imagenes_adicionales: [
        'https://res.cloudinary.com/demo/image/upload/sample2.jpg',
        'https://res.cloudinary.com/demo/image/upload/sample3.jpg',
        'https://res.cloudinary.com/demo/image/upload/sample4.jpg'
      ],
      stock: [
        {
          color_id: 1,
          cantidad: 10,
          precio: 150.00
        }
      ]
    };

    const createResponse = await fetch('http://localhost:3000/api/products/full', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });

    if (!createResponse.ok) {
      throw new Error(`Error creando producto: ${createResponse.status}`);
    }

    const createResult = await createResponse.json();
    console.log('✅ Producto creado:', createResult);
    console.log(`📸 Imágenes guardadas: ${createResult.imagenesGuardadas}\n`);

    // 2. Obtener el producto creado para verificar las imágenes
    console.log('2️⃣ Obteniendo producto para verificar imágenes...');
    
    const getResponse = await fetch(`http://localhost:3000/api/products/${createResult.productId}`);
    
    if (!getResponse.ok) {
      throw new Error(`Error obteniendo producto: ${getResponse.status}`);
    }

    const product = await getResponse.json();
    console.log('✅ Producto obtenido:');
    console.log(`   - Nombre: ${product.name}`);
    console.log(`   - Imagen principal: ${product.mainImage}`);
    console.log(`   - Imágenes adicionales: ${product.images.length}`);
    product.images.forEach((img, index) => {
      console.log(`     ${index + 1}. ${img}`);
    });

    // 3. Verificar en productos destacados
    console.log('\n3️⃣ Verificando en productos destacados...');
    
    const featuredResponse = await fetch('http://localhost:3000/api/featured-products');
    
    if (!featuredResponse.ok) {
      throw new Error(`Error obteniendo productos destacados: ${featuredResponse.status}`);
    }

    const featuredResult = await featuredResponse.json();
    console.log(`✅ Productos destacados: ${featuredResult.products.length}`);
    
    // Buscar nuestro producto en destacados
    const ourProduct = featuredResult.products.find(p => p.id === createResult.productId);
    if (ourProduct) {
      console.log(`   - Nuestro producto encontrado en destacados`);
      console.log(`   - Thumbnail: ${ourProduct.thumbnailImage}`);
    }

    console.log('\n🎉 ¡Prueba completada exitosamente!');
    console.log('📋 Resumen:');
    console.log(`   - Producto creado con ID: ${createResult.productId}`);
    console.log(`   - Imagen principal: 1`);
    console.log(`   - Imágenes adicionales: ${createResult.imagenesGuardadas}`);
    console.log(`   - Total de imágenes: ${createResult.imagenesGuardadas + 1}`);

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error('Stack:', error.stack);
  }
};

// Ejecutar la prueba
testMultipleImages();
