import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LogIn, Sparkles, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { redirect } = router.query;
  const { login, quickDemoLogin } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter your email and password', 'warning');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      showToast('Welcome back, ' + (res.user?.username || 'user') + '!', 'success');
      router.push(redirect ? decodeURIComponent(redirect) : res.user?.role === 'seller' ? '/seller' : '/');
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role) => {
    try {
      setLoading(true);
      const res = await quickDemoLogin(role);
      showToast(`Signed in as demo ${role}!`, 'success');
      router.push(role === 'seller' ? '/seller' : '/');
    } catch (err) {
      showToast(err.message || 'Demo login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign In | MarketHub</title>
      </Head>

      <div className="container" style={{ padding: '4rem 1.5rem 6rem', maxWidth: '440px' }}>
        <div className="card" style={{ padding: '2.5rem 2rem', borderRadius: '24px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ background: '#f1f5f9', width: '52px', height: '52px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#0f172a' }}>
              <LogIn size={24} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
              Welcome Back
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
              Sign in to manage your orders, catalog, and payments.
            </p>
          </div>

          {/* Quick Demo Login Switcher */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.75rem', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.6rem' }}>
              Instant Demo Testing
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleDemo('buyer')}
                disabled={loading}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.82rem', borderColor: '#cbd5e1' }}
              >
                ⚡ Demo Buyer
              </button>
              <button
                type="button"
                onClick={() => handleDemo('seller')}
                disabled={loading}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.82rem', borderColor: '#cbd5e1' }}
              >
                🏪 Demo Seller
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Password</label>
                <Link href="/forgot-password" style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.88rem', color: '#64748b' }}>
              Don't have an account?{' '}
              <Link href="/register" style={{ color: '#0f172a', fontWeight: 700 }}>
                Create one now
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
