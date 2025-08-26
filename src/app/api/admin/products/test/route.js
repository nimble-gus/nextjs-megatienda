import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Datos de prueba
    const testProducts = [
      {
        id: 1,
        sku: 'TEST-001',
        nombre: 'Producto de Prueba 1',
        descripcion: 'Descripción del producto de prueba',
        url_imagen: 'https://via.placeholder.com/300x300',
        categoria: 'Ropa',
        stock: 10,
        precio: 29.99
      },
      {
        id: 2,
        sku: 'TEST-002',
        nombre: 'Producto de Prueba 2',
        descripcion: 'Descripción del segundo producto',
        url_imagen: 'https://via.placeholder.com/300x300',
        categoria: 'Electrónica',
        stock: 5,
        precio: 99.99
      }
    ];
    return NextResponse.json(testProducts);
    
  } catch (error) {
    console.error('Error en API de prueba:', error);
    return NextResponse.json(
      { error: 'Error en API de prueba' },
      { status: 500 }
    );
  }
}






