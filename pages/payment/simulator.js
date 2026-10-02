import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ShieldCheck, CreditCard, Lock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function PaystackSimulatorPage() {
  const router = useRouter();
  const { reference = 'PAY_TEST_REF', amount = '0', orderId = '', email = 'customer@example.com' } = router.query;

  const [cardNumber, setCardNumber] = useState('4084 0840 0840 0840');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('408');
  const [pin, setPin] = useState('1234');
  const [processing, setProcessing] = useState(false);

  const numAmount = Number(amount || 0);

  const handleSimulateSuccess = async () => {
    setProcessing(true);
    try {
      // 1. Call backend simulate endpoint to update order & payment in database
      const res = await fetch('/api/payments/simulate-success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference })
      });

      // 2. Redirect to frontend success page
      router.push(`/checkout/success?reference=${encodeURIComponent(reference)}&amount=${encodeURIComponent(numAmount)}&orderId=${encodeURIComponent(orderId)}`);
    } catch (err) {
      console.error('Simulation error:', err);
      router.push(`/checkout/success?reference=${encodeURIComponent(reference)}&amount=${encodeURIComponent(numAmount)}&orderId=${encodeURIComponent(orderId)}`);
    }
  };

  const handleSimulateFailure = () => {
    router.push(`/checkout/failed?reference=${encodeURIComponent(reference)}&reason=${encodeURIComponent('Declined by issuer (Test Simulation)')}`);
  };

  return (
    <>
      <Head>
        <title>Paystack Checkout Sandbox | MarketHub</title>
      </Head>

      <div className="simulator-overlay">
        <div className="simulator-box">
          {/* Header */}
          <div className="simulator-header">
            <div>
              <div style={{ fontSize: '0.8rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                PAYSTACK SECURED CHECKOUT
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                ₦{numAmount.toLocaleString()}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                TEST MODE
              </span>
              <div style={{ fontSize: '0.78rem', opacity: 0.9, marginTop: '0.25rem' }}>
                {email}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="simulator-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#166534' }}>
              <ShieldCheck size={18} color="#16a34a" />
              <span>Simulated Paystack gateway ready. Test cards enabled.</span>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.82rem' }}>CARD NUMBER</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="form-input"
                  style={{ fontFamily: 'monospace', letterSpacing: '1px', paddingRight: '40px' }}
                />
                <CreditCard size={18} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.82rem' }}>CARD EXPIRY</label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="form-input"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.82rem' }}>CVV</label>
                <input
                  type="password"
                  maxLength={4}
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="form-input"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
            </div>

            {/* Test Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={handleSimulateSuccess}
                disabled={processing}
                className="btn btn-accent btn-full btn-lg"
                style={{ background: '#09a5db', boxShadow: '0 4px 14px rgba(9, 165, 219, 0.4)' }}
              >
                <Lock size={16} />
                {processing ? 'Confirming Payment...' : `Pay ₦${numAmount.toLocaleString()}`}
              </button>

              <button
                type="button"
                onClick={handleSimulateFailure}
                disabled={processing}
                className="btn btn-outline btn-full btn-sm"
                style={{ color: '#ef4444', borderColor: '#fecaca' }}
              >
                Simulate Payment Failure / Decline
              </button>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => router.push('/cart')}
                style={{ fontSize: '0.82rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <ArrowLeft size={14} /> Cancel and return to store
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
