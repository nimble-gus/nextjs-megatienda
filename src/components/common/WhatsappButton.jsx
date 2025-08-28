'use client';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import '@/styles/WhatsappButton.css';

const WhatsappButton = () => {
  const pathname = usePathname();
  
  // Determinar número y mensaje basado en la ruta
  const isAdminPage = pathname.startsWith('/admin');
  
  const phoneNumber = isAdminPage ? '+50254164264' : '+50245053015';
  const message = isAdminPage 
    ? encodeURIComponent('Hola, necesito ayuda con el panel de administración')
    : encodeURIComponent('Hola, me interesa obtener información');

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      title={isAdminPage ? 'Soporte Admin' : 'Atención al Cliente'}
    >
      <Image
        src="/assets/whatsapp-icon.svg"
        alt="WhatsApp"
        width={50}
        height={50}
        priority
      />
    </a>
  );
};

export default WhatsappButton;
