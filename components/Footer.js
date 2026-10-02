import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Zap, RefreshCw } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', marginTop: '4rem', padding: '3.5rem 0 2rem' }}>
      <div className="container">
        {/* Value props */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', marginBottom: '3rem', paddingBottom: '2.5rem', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ background: '#ecfdf5', color: '#10b981', padding: '0.75rem', borderRadius: '12px' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.98rem', marginBottom: '0.25rem' }}>Paystack Secured</h4>
              <p style={{ fontSize: '0.84rem', color: '#64748b' }}>Bank-grade payment encryption with webhook signature verification.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '0.75rem', borderRadius: '12px' }}>
              <Zap size={22} />
            </div>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.98rem', marginBottom: '0.25rem' }}>Unified Architecture</h4>
              <p style={{ fontSize: '0.84rem', color: '#64748b' }}>Next.js and Express API running seamlessly on one server port.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ background: '#fef3c7', color: '#d97706', padding: '0.75rem', borderRadius: '12px' }}>
              <RefreshCw size={22} />
            </div>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.98rem', marginBottom: '0.25rem' }}>Real-time Callbacks</h4>
              <p style={{ fontSize: '0.84rem', color: '#64748b' }}>Automated transaction verification, cart clearance, and status sync.</p>
            </div>
          </div>
        </div>

        {/* Bottom copyright & links */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
          <div>
            &copy; {new Date().getFullYear()} MarketHub E-Commerce. Clean, minimal, full-stack Next.js system.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/developer/webhook-tester" style={{ color: '#64748b' }}>Paystack Webhook Tester</Link>
            <Link href="/api/health" target="_blank" style={{ color: '#64748b' }}>API Health</Link>
            <Link href="/seller" style={{ color: '#64748b' }}>Seller Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
