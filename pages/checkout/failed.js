import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AlertCircle, RefreshCw, ShoppingBag } from 'lucide-react';

export default function CheckoutFailedPage() {
  const router = useRouter();
  const { reference = 'N/A', reason = 'Payment was declined or cancelled.' } = router.query;

  return (
    <>
      <Head>
        <title>Payment Incomplete | MarketHub</title>
      </Head>

      <div className="container" style={{ padding: '4rem 1.5rem 6rem', maxWidth: '580px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', borderRadius: '24px' }}>
          {/* Danger icon */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#fef2f2',
              border: '2px solid #ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: '#ef4444'
            }}
          >
            <AlertCircle size={44} strokeWidth={2.5} />
          </div>

          <span className="badge badge-danger" style={{ marginBottom: '0.75rem' }}>
            Transaction Failed
          </span>

          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Payment Could Not Be Completed
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem' }}>
            Your account has not been charged. You can retry the transaction or select an alternative payment method.
          </p>

          <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.25rem 1.5rem', textAlign: 'left', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0', fontSize: '0.88rem' }}>
              <span style={{ color: '#64748b' }}>Reference</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{reference}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.88rem' }}>
              <span style={{ color: '#64748b' }}>Failure Reason</span>
              <span style={{ color: '#dc2626', fontWeight: 600 }}>{reason}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/cart" className="btn btn-primary" style={{ flex: 1 }}>
              <RefreshCw size={16} /> Return to Cart & Retry
            </Link>
            <Link href="/" className="btn btn-outline" style={{ flex: 1 }}>
              Back to Catalog
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
