import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'data', 'category-images.json');

// Asegurar que el directorio existe
const ensureDataDir = () => {
  const dataDir = path.dirname(CONFIG_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Configuración por defecto
const defaultConfig = {
  1: { name: 'Juguetes', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  2: { name: 'Fitness', imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  3: { name: 'Herramientas', imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  4: { name: 'Electrónicos', imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  5: { name: 'Mascotas', imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  6: { name: 'Libros', imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
};

// Obtener configuración actual
export async function GET() {
  try {
    ensureDataDir();
    
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf8');
      const config = JSON.parse(data);
      return NextResponse.json({ success: true, config });
    } else {
      // Crear archivo con configuración por defecto
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
      return NextResponse.json({ success: true, config: defaultConfig });
    }
  } catch (error) {
    console.error('Error obteniendo configuración de imágenes:', error);
    return NextResponse.json(
      { success: false, error: 'Error obteniendo configuración' },
      { status: 500 }
    );
  }
}

// Actualizar configuración
export async function POST(request) {
  try {
    const { categoryId, imageUrl } = await request.json();
    
    if (!categoryId || !imageUrl) {
      return NextResponse.json(
        { success: false, error: 'categoryId e imageUrl son requeridos' },
        { status: 400 }
      );
    }

    ensureDataDir();
    
    // Leer configuración actual o usar por defecto
    let config = defaultConfig;
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf8');
      config = JSON.parse(data);
    }
    
    // Actualizar la imagen de la categoría
    config[categoryId] = {
      ...config[categoryId],
      imageUrl: imageUrl
    };
    
    // Guardar configuración actualizada
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Imagen actualizada correctamente',
      config 
    });
    
  } catch (error) {
    console.error('Error actualizando imagen de categoría:', error);
    return NextResponse.json(
      { success: false, error: 'Error actualizando imagen' },
      { status: 500 }
    );
  }
}

// Resetear a configuración por defecto
export async function DELETE() {
  try {
    ensureDataDir();
    
    // Restaurar configuración por defecto
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Configuración restaurada a valores por defecto',
      config: defaultConfig 
    });
    
  } catch (error) {
    console.error('Error restaurando configuración:', error);
    return NextResponse.json(
      { success: false, error: 'Error restaurando configuración' },
      { status: 500 }
    );
  }
}
