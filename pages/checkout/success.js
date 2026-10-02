import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCart } from '../../context/CartContext';
import { CheckCircle2, ArrowRight, Package, ShieldCheck, ExternalLink } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const { reference, amount, orderId } = router.query;
  const { clearCart } = useCart();
  const [verification, setVerification] = useState(null);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    // Clear the cart upon reaching success page
    clearCart();

    if (!reference) {
      setVerifying(false);
      return;
    }

    async function verifyRef() {
      try {
        setVerifying(true);
        const res = await fetch(`/api/payments/verify/${reference}`);
        if (res.ok) {
          const data = await res.json();
          setVerification(data.data);
        }
      } catch (err) {
        console.warn('Verification check error:', err);
      } finally {
        setVerifying(false);
      }
    }

    verifyRef();
  }, [reference, clearCart]);

  const displayAmount = verification?.amount || (amount ? Number(amount) : null);
  const displayOrderId = orderId || verification?.order?.id;

  return (
    <>
      <Head>
        <title>Payment Successful | MarketHub</title>
      </Head>

      <div className="container" style={{ padding: '4rem 1.5rem 6rem', maxWidth: '640px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', borderRadius: '24px' }}>
          {/* Animated Success Badge */}
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              background: '#ecfdf5',
              border: '2px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: '#10b981',
              boxShadow: '0 0 25px rgba(16, 185, 129, 0.2)'
            }}
          >
            <CheckCircle2 size={46} strokeWidth={2.5} />
          </div>

          <span className="badge badge-success" style={{ marginBottom: '0.75rem' }}>
            Paystack Transaction Verified
          </span>

          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Payment Successful!
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem' }}>
            Your transaction has been confirmed and your order is now queued for delivery.
          </p>

          {/* Receipt Breakdown Box */}
          <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.5rem', textAlign: 'left', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
              <span style={{ color: '#64748b' }}>Payment Status</span>
              <span className="badge badge-success">PAID</span>
            </div>

            {displayAmount && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                <span style={{ color: '#64748b' }}>Amount Paid</span>
                <span style={{ fontWeight: 800, color: '#10b981', fontSize: '1.1rem' }}>
                  ₦{displayAmount.toLocaleString()}
                </span>
              </div>
            )}

            {reference && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: displayOrderId ? '1px solid #e2e8f0' : 'none', fontSize: '0.9rem' }}>
                <span style={{ color: '#64748b' }}>Payment Reference</span>
                <span style={{ fontWeight: 600, fontFamily: 'monospace', color: '#0f172a', fontSize: '0.85rem' }}>
                  {reference}
                </span>
              </div>
            )}

            {displayOrderId && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', fontSize: '0.9rem' }}>
                <span style={{ color: '#64748b' }}>Order ID</span>
                <span style={{ fontWeight: 600, fontFamily: 'monospace', color: '#0f172a', fontSize: '0.85rem' }}>
                  {displayOrderId}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/" className="btn btn-outline" style={{ flex: 1 }}>
              Back to Store
            </Link>
            <Link href="/orders" className="btn btn-primary" style={{ flex: 1 }}>
              <Package size={16} /> View My Orders
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
