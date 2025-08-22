import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import WhatsappButton from '@/components/common/WhatsappButton';
import { AuthProvider } from '@/hooks/useAuth';

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
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "Megatienda - Tu tienda online de confianza",
    description: "Descubre nuestra amplia selección de productos con los mejores precios y calidad garantizada.",
    type: "website",
    locale: "es_GT",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
          <WhatsappButton />
        </AuthProvider>
      </body>
    </html>
  );
}
