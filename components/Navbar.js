import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  ShoppingBag,
  User,
  Package,
  Store,
  LogOut,
  LogIn,
  ChevronDown,
  Layers,
  Sparkles,
  MessageSquareQuote
} from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, isBuyer, isSeller, logout, quickDemoLogin } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <>
      {/* Top Demo Banner for easy testing */}
      <div className="demo-banner">
        <div className="container demo-banner-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={14} color="#10b981" />
            <span>
              {isAuthenticated ? (
                <>Signed in as <strong>{user?.username}</strong> ({user?.role?.toUpperCase()})</>
              ) : (
                'Quick Switcher / Test Account:'
              )}
            </span>
          </div>
          <div className="demo-btn-group">
            <button
              onClick={() => quickDemoLogin('buyer')}
              className="demo-pill-btn"
              title="1-Click login as demo buyer"
            >
              ⚡ Demo Buyer
            </button>
            <button
              onClick={() => quickDemoLogin('seller')}
              className="demo-pill-btn"
              title="1-Click login as demo seller"
            >
              🏪 Demo Seller
            </button>
            <Link href="/developer/webhook-tester" className="demo-pill-btn" style={{ background: 'rgba(16, 185, 129, 0.2)', borderColor: '#10b981' }}>
              💳 Paystack Tools
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="header-nav">
        <div className="container nav-inner">
          {/* Logo */}
          <Link href="/" className="brand-logo">
            <span>MarketHub</span>
            <div className="brand-dot" />
          </Link>

          {/* Nav Links */}
          <nav className="nav-links">
            <Link
              href="/"
              className={`nav-link ${router.pathname === '/' ? 'active' : ''}`}
            >
              Catalog
            </Link>

            {isBuyer && (
              <Link
                href="/orders"
                className={`nav-link ${router.pathname === '/orders' ? 'active' : ''}`}
              >
                My Orders
              </Link>
            )}

            {isSeller && (
              <>
                <Link
                  href="/seller"
                  className={`nav-link ${router.pathname === '/seller' ? 'active' : ''}`}
                >
                  Seller Hub
                </Link>
                <Link
                  href="/seller/products"
                  className={`nav-link ${router.pathname === '/seller/products' ? 'active' : ''}`}
                >
                  Manage Products
                </Link>
                <Link
                  href="/seller/orders"
                  className={`nav-link ${router.pathname === '/seller/orders' ? 'active' : ''}`}
                >
                  Fulfillment
                </Link>
                <Link
                  href="/seller/feedback"
                  className={`nav-link ${router.pathname === '/seller/feedback' ? 'active' : ''}`}
                >
                  Feedback
                </Link>
              </>
            )}
          </nav>

          {/* Right Actions */}
          <div className="nav-actions">
            {/* Cart Button (For Buyers / Unauthenticated) */}
            {(!isAuthenticated || isBuyer) && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="btn btn-outline"
                style={{ position: 'relative', padding: '0.6rem 0.85rem' }}
                aria-label="View Shopping Cart"
              >
                <ShoppingBag size={18} />
                {totalItems > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      background: '#10b981',
                      color: '#ffffff',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(16, 185, 129, 0.4)'
                    }}
                  >
                    {totalItems}
                  </span>
                )}
              </button>
            )}

            {/* Auth Dropdown / Buttons */}
            {isAuthenticated ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '0.4rem', borderRadius: '9999px', padding: '0.4rem 0.85rem' }}
                >
                  <User size={15} />
                  <span>{user?.username}</span>
                  <span className={`badge ${user?.role === 'seller' ? 'badge-seller' : 'badge-buyer'}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                    {user?.role}
                  </span>
                  <ChevronDown size={14} />
                </button>

                {userMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      width: '220px',
                      background: '#ffffff',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                      border: '1px solid #e2e8f0',
                      padding: '0.5rem',
                      zIndex: 100
                    }}
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user?.username}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{user?.email}</div>
                    </div>

                    {isBuyer && (
                      <Link
                        href="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.75rem', fontSize: '0.85rem', color: '#334155', borderRadius: '6px' }}
                      >
                        <Package size={16} /> My Orders
                      </Link>
                    )}

                    {isSeller && (
                      <>
                        <Link
                          href="/seller/products"
                          onClick={() => setUserMenuOpen(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.75rem', fontSize: '0.85rem', color: '#334155', borderRadius: '6px' }}
                        >
                          <Store size={16} /> My Products
                        </Link>
                        <Link
                          href="/seller/orders"
                          onClick={() => setUserMenuOpen(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.75rem', fontSize: '0.85rem', color: '#334155', borderRadius: '6px' }}
                        >
                          <Layers size={16} /> Seller Orders
                        </Link>
                        <Link
                          href="/seller/feedback"
                          onClick={() => setUserMenuOpen(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.75rem', fontSize: '0.85rem', color: '#334155', borderRadius: '6px' }}
                        >
                          <MessageSquareQuote size={16} /> Customer Feedback
                        </Link>
                      </>
                    )}

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        width: '100%',
                        padding: '0.6rem 0.75rem',
                        fontSize: '0.85rem',
                        color: '#ef4444',
                        borderRadius: '6px',
                        textAlign: 'left',
                        marginTop: '0.25rem',
                        borderTop: '1px solid #f1f5f9'
                      }}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link href="/login" className="btn btn-outline btn-sm">
                  <LogIn size={15} /> Sign In
                </Link>
                <Link href="/register" className="btn btn-primary btn-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
