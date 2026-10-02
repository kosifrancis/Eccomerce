import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';

export default function CartSlideOver() {
  const router = useRouter();
  const { isCartOpen, setIsCartOpen, items, totalItems, totalPrice, updateQuantity, removeItem, clearCart, loading } = useCart();
  const { isAuthenticated, isBuyer } = useAuth();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    router.push('/checkout');
  };

  return (
    <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag size={20} color="#0f172a" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Shopping Bag</h3>
            <span className="badge badge-buyer" style={{ marginLeft: '0.25rem' }}>
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            style={{ padding: '0.4rem', borderRadius: '50%', color: '#64748b' }}
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="cart-drawer-body">
          {!isAuthenticated ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ background: '#f1f5f9', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#64748b' }}>
                <ShoppingBag size={24} />
              </div>
              <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Sign in to view cart</h4>
              <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '1.5rem' }}>
                Please log in with a buyer account to start shopping.
              </p>
              <Link
                href="/login"
                onClick={() => setIsCartOpen(false)}
                className="btn btn-primary btn-full"
              >
                Sign In / Demo Login
              </Link>
            </div>
          ) : !isBuyer ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Seller Account</h4>
              <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '1.5rem' }}>
                You are currently signed in as a seller. Shopping carts are available for buyer accounts.
              </p>
              <Link
                href="/seller/products"
                onClick={() => setIsCartOpen(false)}
                className="btn btn-primary btn-full"
              >
                Go to Seller Dashboard
              </Link>
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <div style={{ background: '#f8fafc', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#94a3b8' }}>
                <ShoppingBag size={28} />
              </div>
              <h4 style={{ fontWeight: 700, marginBottom: '0.35rem' }}>Your bag is empty</h4>
              <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '1.5rem' }}>
                Explore our catalog and find something you love!
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="btn btn-primary"
              >
                Explore Products
              </button>
            </div>
          ) : (
            <>
              {items.map((item, index) => {
                const prod = item.product || {};
                const prodId = prod._id || item.product;
                const prodImg = prod.imageUrl || prod.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80';
                const prodPrice = prod.price || item.price || 0;

                return (
                  <div key={prodId || index} className="cart-item-row">
                    <img
                      src={prodImg}
                      alt={prod.name || 'Product'}
                      className="cart-item-img"
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {prod.name || 'Product'}
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981', marginTop: '0.2rem' }}>
                        ₦{prodPrice.toLocaleString()}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.6rem' }}>
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
                          style={{ color: '#94a3b8', padding: '0.35rem', transition: 'color 0.15s ease' }}
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                <button
                  onClick={clearCart}
                  style={{ fontSize: '0.8rem', color: '#94a3b8', textDecoration: 'underline' }}
                >
                  Clear Bag
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {isAuthenticated && isBuyer && items.length > 0 && (
          <div className="cart-drawer-footer">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem', color: '#64748b' }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>₦{totalPrice.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '1.1rem', fontWeight: 800 }}>
              <span>Total Amount</span>
              <span style={{ color: '#10b981' }}>₦{totalPrice.toLocaleString()}</span>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="btn btn-accent btn-full btn-lg"
              style={{ marginBottom: '0.75rem' }}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#64748b' }}>
              <ShieldCheck size={14} color="#10b981" />
              Secured with Paystack payment gateway
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
