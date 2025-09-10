export async function GET() {
  try {
    // Verificar variables de Cloudinary
    const cloudinaryCheck = {
      hasCloudName: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      hasUploadPreset: !!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
      hasApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'No configurado',
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'No configurado',
      apiKeyLength: process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.length : 0,
      apiSecretLength: process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.length : 0,
      nodeEnv: process.env.NODE_ENV || 'No configurado',
      vercelEnv: process.env.VERCEL_ENV || 'No configurado'
    };

    // Verificar si todas las variables necesarias están presentes
    const isConfigured = cloudinaryCheck.hasCloudName && cloudinaryCheck.hasUploadPreset;

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      cloudinary: cloudinaryCheck,
      isConfigured: isConfigured,
      message: isConfigured ? 'Cloudinary está configurado correctamente' : 'Cloudinary no está configurado completamente'
    });

  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}