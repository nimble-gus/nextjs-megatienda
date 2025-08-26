export const uploadToCloudinary = async (file, folder = 'megatienda') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', folder);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!cloudName || !process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Faltan variables de entorno de Cloudinary. Verifica NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME y NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET');
  }

  // Determinar el tipo de archivo para usar el endpoint correcto
  const fileExtension = file.name.split('.').pop().toLowerCase();
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
  const isPdf = fileExtension === 'pdf';
  
  // Usar endpoint automático para mejor compatibilidad
  const endpoint = isPdf ? 'auto' : 'image';
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${endpoint}/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Error en Cloudinary:', errorText);
    throw new Error(`Error en la subida: ${res.statusText}`);
  }

  const data = await res.json();
  return {
    secure_url: data.secure_url,
    public_id: data.public_id
  };
};

// Mantener compatibilidad con el nombre anterior
export const uploadImageToCloudinary = async (file) => {
  const result = await uploadToCloudinary(file);
  return result.secure_url;
};
