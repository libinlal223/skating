import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";

export const metadata: Metadata = {
  metadataBase: new URL('https://smartwheelsacademy.com'),
  title: {
    default: 'Smart Wheels Skating Academy | Train Like a Champion',
    template: '%s | Smart Wheels Skating Academy',
  },
  description: 'Professional skating training for all ages with certified coaches and world-class facilities. Join Smart Wheels Skating Academy — Kerala\'s premier roller skating academy.',
  keywords: ['skating academy', 'roller skating Kerala', 'skating training', 'skating classes', 'professional skating', 'skating coach India', 'Guinness World Record skating'],
  authors: [{ name: 'Smart Wheels Skating Academy' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://smartwheelsacademy.com',
    siteName: 'Smart Wheels Skating Academy',
    title: 'Smart Wheels Skating Academy | Train Like a Champion',
    description: 'Kerala\'s premier roller skating academy. Expert coaches, world-class facilities, and a Guinness World Record holder in our ranks.',
    images: [{ url: '/skating_action.png', width: 1200, height: 630, alt: 'Smart Wheels Skating Academy' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Smart Wheels Skating Academy',
    description: 'Kerala\'s premier roller skating academy. Train Like a Champion.',
    images: ['/skating_action.png'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LoadingScreen />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
