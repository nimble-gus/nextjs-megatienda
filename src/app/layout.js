import { Inter, Poppins, Space_Grotesk } from "next/font/google";
import "./globals.css";
import WhatsappButton from '@/components/common/WhatsappButton';
import { ClientAuthProvider } from '@/contexts/ClientAuthContext';
import { CartProvider } from '@/contexts/CartContext';

// Fuente principal para textos generales
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Fuente para títulos y elementos destacados
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// Fuente para elementos técnicos y códigos
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "Megatienda - Tu tienda online de confianza",
  description: "Descubre nuestra amplia selección de productos con los mejores precios y calidad garantizada.",
  keywords: "tienda online, productos, compras, ecommerce",
  authors: [{ name: "Megatienda Team" }],
  robots: "index, follow",
  icons: {
    icon: [
      { url: '/assets/logofav.png', sizes: '32x32', type: 'image/png' },
      { url: '/assets/logofav.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/assets/logofav.png',
    apple: '/assets/logofav.png',
    other: [
      { rel: 'icon', url: '/assets/logofav.png' },
      { rel: 'shortcut icon', url: '/assets/logofav.png' },
    ],
  },
  openGraph: {
    title: "Megatienda - Tu tienda online de confianza",
    description: "Descubre nuestra amplia selección de productos con los mejores precios y calidad garantizada.",
    type: "website",
    locale: "es_GT",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${inter.variable} ${poppins.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link rel="icon" href="/assets/logofav.png" sizes="any" />
        <link rel="icon" href="/assets/logofav.png" type="image/png" />
        <link rel="shortcut icon" href="/assets/logofav.png" />
      </head>
      <body suppressHydrationWarning>
        <ClientAuthProvider>
          <CartProvider>
            {children}
            <WhatsappButton />
          </CartProvider>
        </ClientAuthProvider>
      </body>
    </html>
  );
}
