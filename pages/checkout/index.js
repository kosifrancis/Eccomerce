import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ShieldCheck, CreditCard, ChevronLeft, CheckCircle2, Lock, ArrowRight } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const { user, token, isAuthenticated, isBuyer } = useAuth();
  const { showToast } = useToast();

  const [deliveryAddress, setDeliveryAddress] = useState('12 Admiralty Way, Lekki Phase 1, Lagos, Nigeria');
  const [phone, setPhone] = useState(user?.phonenumber || '+2348012345678');
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [submitting, setSubmitting] = useState(false);

  // If not authenticated
  if (!isAuthenticated || !isBuyer) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Buyer Account Required</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Please log in as a buyer to proceed with checkout.</p>
        <Link href="/login" className="btn btn-primary">
          Sign In
        </Link>
      </div>
    );
  }

  // If cart is empty
  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Your Cart is Empty</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Add some products to your cart before checking out.</p>
        <Link href="/" className="btn btn-primary">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const handleProcessOrder = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (paymentMethod === 'paystack') {
        // Initialize Paystack payment via backend
        showToast('Initiating Paystack checkout...', 'info');

        const res = await fetch('/api/payments/initialize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            email: user?.email,
            items: items.map((i) => ({
              productId: i.product?._id || i.product,
              quantity: i.quantity
            }))
          })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || data.error || 'Failed to initialize Paystack payment');
        }

        const authUrl = data.data?.authorizationUrl;
        if (authUrl) {
          window.location.href = authUrl;
        } else {
          router.push(`/checkout/success?reference=${data.data.reference}`);
        }

      } else {
        // Standard Checkout Endpoint (POST /api/orders/checkout)
        showToast('Processing standard checkout...', 'info');

        const res = await fetch('/api/orders/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Checkout failed');
        }

        showToast('Order placed successfully!', 'success');
        await clearCart();
        router.push(`/orders`);
      }
    } catch (err) {
      showToast(err.message || 'Error processing order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Checkout | MarketHub</title>
      </Head>

      <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link href="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: '#64748b', fontWeight: 600 }}>
            <ChevronLeft size={16} /> Back to Shopping Bag
          </Link>
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '2rem', letterSpacing: '-0.02em' }}>
          Secure Checkout
        </h1>

        <form onSubmit={handleProcessOrder}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
            {/* Left Column: Delivery & Payment Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Customer Contact */}
              <div className="card" style={{ padding: '1.75rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
                  1. Customer & Contact
                </h2>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={user?.username || ''}
                    disabled
                    className="form-input"
                    style={{ background: '#f8fafc' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address (for Paystack Receipt)</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="form-input"
                    style={{ background: '#f8fafc' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div className="card" style={{ padding: '1.75rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
                  2. Shipping Destination
                </h2>

                <div className="form-group">
                  <label className="form-label">Delivery Address</label>
                  <textarea
                    rows={3}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="form-textarea"
                    required
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="card" style={{ padding: '1.75rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', color: '#0f172a' }}>
                  3. Payment Method
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {/* Paystack Option */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem 1.25rem',
                      borderRadius: '12px',
                      border: `2px solid ${paymentMethod === 'paystack' ? '#10b981' : '#e2e8f0'}`,
                      background: paymentMethod === 'paystack' ? '#f0fdf4' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paystack"
                        checked={paymentMethod === 'paystack'}
                        onChange={() => setPaymentMethod('paystack')}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                          Pay with Paystack
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Debit/Credit Card, Bank Transfer, USSD, Apple Pay
                        </div>
                      </div>
                    </div>
                    <span className="badge badge-success">Recommended</span>
                  </label>

                  {/* Standard / Pay on Delivery */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem 1.25rem',
                      borderRadius: '12px',
                      border: `2px solid ${paymentMethod === 'standard' ? '#0f172a' : '#e2e8f0'}`,
                      background: paymentMethod === 'standard' ? '#f8fafc' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="standard"
                        checked={paymentMethod === 'standard'}
                        onChange={() => setPaymentMethod('standard')}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                          Standard Order Checkout
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Record order directly into database as pending
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Review & Pay Button */}
            <div className="card" style={{ padding: '1.75rem', position: 'sticky', top: '100px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem', color: '#0f172a' }}>
                Order Summary
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem', maxHeight: '240px', overflowY: 'auto' }}>
                {items.map((item, idx) => {
                  const prod = item.product || {};
                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                      <span style={{ color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                        {item.quantity}x {prod.name || 'Product'}
                      </span>
                      <span style={{ fontWeight: 600 }}>₦{((prod.price || 0) * item.quantity).toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', margin: '1rem 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem', color: '#64748b' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>₦{totalPrice.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.88rem', color: '#64748b' }}>
                <span>Shipping Dispatch</span>
                <span style={{ fontWeight: 600, color: '#10b981' }}>FREE</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.35rem', fontWeight: 800 }}>
                <span>Total Due</span>
                <span style={{ color: '#0f172a' }}>₦{totalPrice.toLocaleString()}</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-accent btn-full btn-lg"
                style={{ marginBottom: '1rem' }}
              >
                {submitting ? (
                  'Processing...'
                ) : paymentMethod === 'paystack' ? (
                  <>
                    <Lock size={16} /> Pay ₦{totalPrice.toLocaleString()} with Paystack
                  </>
                ) : (
                  <>
                    Complete Order <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#64748b' }}>
                <ShieldCheck size={16} color="#10b981" />
                <span>256-bit SSL encrypted transaction</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
