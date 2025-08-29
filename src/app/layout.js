import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import WhatsappButton from '@/components/common/WhatsappButton';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="icon" href="/assets/logofav.png" sizes="any" />
        <link rel="icon" href="/assets/logofav.png" type="image/png" />
        <link rel="shortcut icon" href="/assets/logofav.png" />
      </head>
      <body suppressHydrationWarning>
        {children}
        <WhatsappButton />
      </body>
    </html>
  );
}
