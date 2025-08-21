'use client';
import React from 'react';
import Image from 'next/image';
import '@/styles/WhatsappButton.css';

const WhatsappButton = () => {
  const phoneNumber = '+50245053015'; // Reemplaza con tu número real
  const message = encodeURIComponent('Hola, me interesa obtener información');

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
    >
      <Image
        src="/assets/whatsapp-icon.svg"
        alt="WhatsApp"
        width={50}
        height={50}
      />
    </a>
  );
};

export default WhatsappButton;
