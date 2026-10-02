import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck, ChevronLeft } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart, loading } = useCart();
  const { isAuthenticated, isBuyer } = useAuth();

  const handleCheckout = () => {
    router.push('/checkout');
  };

  return (
    <>
      <Head>
        <title>Shopping Cart | MarketHub</title>
      </Head>

      <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: '#64748b', fontWeight: 600 }}>
            <ChevronLeft size={16} /> Continue Shopping
          </Link>
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '2rem', letterSpacing: '-0.02em' }}>
          Shopping Bag ({totalItems} {totalItems === 1 ? 'item' : 'items'})
        </h1>

        {!isAuthenticated ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <ShoppingBag size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Please Sign In</h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              You need to be signed in as a buyer to manage your cart and checkout.
            </p>
            <Link href="/login" className="btn btn-primary">
              Sign In to Your Account
            </Link>
          </div>
        ) : !isBuyer ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Seller Account Detected</h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              Shopping carts are designed for buyer accounts. Switch to a buyer account to purchase items.
            </p>
            <Link href="/seller" className="btn btn-primary">
              Go to Seller Dashboard
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <ShoppingBag size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Your shopping bag is empty</h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              Explore our wide range of gadgets and products to get started.
            </p>
            <Link href="/" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
            {/* Items Column */}
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {items.map((item, idx) => {
                  const prod = item.product || {};
                  const prodId = prod._id || item.product;
                  const prodImg = prod.imageUrl || prod.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80';
                  const prodPrice = prod.price || item.price || 0;

                  return (
                    <div key={prodId || idx} className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', padding: '1.25rem' }}>
                      <img
                        src={prodImg}
                        alt={prod.name || 'Product'}
                        style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', background: '#f1f5f9' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Link href={`/products/${prodId}`}>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                            {prod.name || 'Product'}
                          </h3>
                        </Link>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10b981', marginBottom: '0.5rem' }}>
                          ₦{prodPrice.toLocaleString()}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div className="qty-counter">
                            <button
                              onClick={() => updateQuantity(prodId, item.quantity - 1)}
                              className="qty-btn"
                              disabled={loading}
                            >
                              -
                            </button>
                            <span className="qty-val">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(prodId, item.quantity + 1)}
                              className="qty-btn"
                              disabled={loading}
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(prodId)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ef4444', fontSize: '0.82rem', fontWeight: 600 }}
                          >
                            <Trash2 size={15} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                <Link href="/" className="btn btn-outline btn-sm">
                  <ChevronLeft size={16} /> Add More Products
                </Link>
                <button
                  onClick={clearCart}
                  style={{ color: '#64748b', fontSize: '0.85rem', textDecoration: 'underline' }}
                >
                  Clear Entire Bag
                </button>
              </div>
            </div>

            {/* Order Summary Column */}
            <div className="card" style={{ padding: '1.75rem', position: 'sticky', top: '100px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem', color: '#0f172a' }}>
                Order Summary
              </h2>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem', color: '#64748b' }}>
                <span>Subtotal ({totalItems} items)</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>₦{totalPrice.toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem', color: '#64748b' }}>
                <span>Shipping Dispatch</span>
                <span style={{ fontWeight: 600, color: '#10b981' }}>FREE</span>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', margin: '1rem 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 800 }}>
                <span>Total</span>
                <span style={{ color: '#0f172a' }}>₦{totalPrice.toLocaleString()}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="btn btn-accent btn-full btn-lg"
                style={{ marginBottom: '1rem' }}
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#64748b', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
                <ShieldCheck size={16} color="#10b981" />
                <span>Transactions secured with Paystack payment gateway</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
