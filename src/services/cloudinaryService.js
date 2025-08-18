export const uploadToCloudinary = async (file, folder = 'megatienda') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', folder);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!cloudName || !process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Faltan variables de entorno de Cloudinary. Verifica NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME y NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET');
  }

  console.log('Subiendo imagen a Cloudinary...', {
    cloudName,
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    folder
  });

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
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
  console.log('Imagen subida exitosamente:', data.secure_url);
  
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
