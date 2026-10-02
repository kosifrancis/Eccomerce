import React from 'react';
import Head from 'next/head';
import '../styles/globals.css';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartSlideOver from '../components/CartSlideOver';

export default function MyApp({ Component, pageProps, router }) {
  const isSimulator = router.pathname.startsWith('/payment/simulator');

  return (
    <>
      <Head>
        <title>MarketHub | Modern E-Commerce</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Clean, fast, minimal e-commerce platform with Paystack payments and Next.js." />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🛍️</text></svg>" />
      </Head>

      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            {!isSimulator && <Navbar />}
            {!isSimulator && <CartSlideOver />}
            <main style={{ minHeight: isSimulator ? '100vh' : 'calc(100vh - 280px)' }}>
              <Component {...pageProps} />
            </main>
            {!isSimulator && <Footer />}
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </>
  );
}
