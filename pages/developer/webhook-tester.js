import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useToast } from '../../context/ToastContext';
import { ShieldCheck, Send, RefreshCw, ChevronLeft, CheckCircle2, AlertCircle, Code } from 'lucide-react';

export default function WebhookTesterPage() {
  const { showToast } = useToast();
  const [reference, setReference] = useState('PAY_SAMPLE_DEMO123');
  const [amount, setAmount] = useState('320000');
  const [email, setEmail] = useState('buyer@market.com');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  const addLog = (title, data, isError = false) => {
    setLogs((prev) => [
      {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        title,
        data,
        isError
      },
      ...prev
    ]);
  };

  // 1. Simulate and trigger Webhook
  const handleTriggerWebhook = async () => {
    setLoading(true);
    try {
      // Direct call to simulate success which executes the same order update & cart clearing logic
      const simRes = await fetch('/api/payments/simulate-success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference })
      });
      const simData = await simRes.json();

      addLog(`POST /api/payments/simulate-success (${simRes.status})`, simData, !simRes.ok);
      if (simRes.ok) {
        showToast('Webhook event processed & order status updated to PAID!', 'success');
      } else {
        showToast(simData.message || 'Webhook trigger failed', 'error');
      }
    } catch (err) {
      addLog('Webhook Dispatch Error', { error: err.message }, true);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2. Test Programmatic Reference Verification
  const handleVerifyReference = async () => {
    if (!reference) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/payments/verify/${encodeURIComponent(reference)}`);
      const data = await res.json();
      setVerifyResult(data);
      addLog(`GET /api/payments/verify/${reference} (${res.status})`, data, !res.ok);
      if (res.ok) {
        showToast('Transaction verification status retrieved!', 'success');
      } else {
        showToast(data.message || 'Verification error', 'error');
      }
    } catch (err) {
      addLog('Verification Request Failed', { error: err.message }, true);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 3. Test Callback URL
  const handleTriggerCallback = () => {
    window.open(`/api/payments/callback?reference=${encodeURIComponent(reference)}&trxref=${encodeURIComponent(reference)}`, '_blank');
  };

  return (
    <>
      <Head>
        <title>Paystack Integration Suite | MarketHub</title>
      </Head>

      <div className="container" style={{ padding: '2.5rem 1.5rem 5rem', maxWidth: '860px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: '#64748b', fontWeight: 600 }}>
            <ChevronLeft size={16} /> Back to Catalog
          </Link>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#0369a1', background: '#e0f2fe', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <Code size={14} /> DEVELOPER TOOLS
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Paystack Webhook & Callback Testing Suite
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
            Test and verify all Paystack endpoints, webhook signature handlers, and callback redirects on the unified server.
          </p>
        </div>

        {/* Controls Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {/* Card: Parameters */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', color: '#0f172a' }}>
              Transaction Parameters
            </h2>

            <div className="form-group">
              <label className="form-label">Transaction Reference</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="form-input"
                style={{ fontFamily: 'monospace' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Customer Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Amount (₦)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* Card: Actions */}
          <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>
              Test Actions
            </h2>

            <div>
              <button
                type="button"
                onClick={handleTriggerWebhook}
                disabled={loading}
                className="btn btn-primary btn-full"
                style={{ marginBottom: '0.35rem' }}
              >
                <Send size={15} /> Trigger Webhook (`charge.success`)
              </button>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Simulates Paystack charge.success webhook, updates order to PAID & clears cart.
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={handleVerifyReference}
                disabled={loading}
                className="btn btn-outline btn-full"
                style={{ marginBottom: '0.35rem' }}
              >
                <RefreshCw size={15} /> Verify via `GET /api/payments/verify/:reference`
              </button>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Inspects verified payment status and linked order object.
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={handleTriggerCallback}
                className="btn btn-secondary btn-full"
                style={{ marginBottom: '0.35rem' }}
              >
                Test Callback Redirect (`GET /api/payments/callback`)
              </button>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Opens callback URL in new tab and verifies redirect to /checkout/success.
              </div>
            </div>
          </div>
        </div>

        {/* Live Logs / JSON response */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
              Execution Logs & Responses
            </h2>
            {logs.length > 0 && (
              <button
                onClick={() => setLogs([])}
                style={{ fontSize: '0.8rem', color: '#94a3b8' }}
              >
                Clear Logs
              </button>
            )}
          </div>

          {logs.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: '0.88rem', fontStyle: 'italic', padding: '1rem 0' }}>
              No requests executed yet. Click one of the action buttons above to inspect responses.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {logs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    background: '#0b0f19',
                    color: '#f8fafc',
                    padding: '1rem',
                    borderRadius: '10px',
                    fontFamily: 'monospace',
                    fontSize: '0.82rem',
                    overflowX: 'auto',
                    border: `1px solid ${log.isError ? '#ef4444' : '#334155'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: log.isError ? '#f87171' : '#4ade80' }}>
                    <strong>{log.title}</strong>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{log.timestamp}</span>
                  </div>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
