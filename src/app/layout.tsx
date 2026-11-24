import type { Metadata } from 'next';
import { Archivo } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/components/cart';
import Header from '@/components/Header';
import { Footer } from '@/components/Closing';

const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SOLEHAUS — Sneakers, delivered in 3–4 days',
  description: 'Jordans, Dunks, New Balance and more. Cash on delivery, branded box, order on WhatsApp.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={archivo.variable}>
      <body>
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
