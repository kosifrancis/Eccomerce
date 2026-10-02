import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserPlus, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const [phonenumber, setPhonenumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !phonenumber) {
      showToast('All fields are required', 'warning');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters long', 'warning');
      return;
    }

    try {
      setLoading(true);
      await register({ username, email, password, role, phonenumber });
      showToast('Account created successfully!', 'success');
      router.push(role === 'seller' ? '/seller' : '/');
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Account | MarketHub</title>
      </Head>

      <div className="container" style={{ padding: '4rem 1.5rem 6rem', maxWidth: '480px' }}>
        <div className="card" style={{ padding: '2.5rem 2rem', borderRadius: '24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ background: '#ecfdf5', width: '52px', height: '52px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#10b981' }}>
              <UserPlus size={24} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
              Create an Account
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
              Join MarketHub as a Buyer to shop or Seller to list products.
            </p>
          </div>

          <form onSubmit={handleRegister}>
            {/* Role selector */}
            <div className="form-group">
              <label className="form-label">I want to register as a:</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: `2px solid ${role === 'buyer' ? '#10b981' : '#e2e8f0'}`,
                    background: role === 'buyer' ? '#f0fdf4' : '#ffffff',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.88rem'
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    value="buyer"
                    checked={role === 'buyer'}
                    onChange={() => setRole('buyer')}
                  />
                  <span>Buyer</span>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: `2px solid ${role === 'seller' ? '#0f172a' : '#e2e8f0'}`,
                    background: role === 'seller' ? '#f8fafc' : '#ffffff',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.88rem'
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    value="seller"
                    checked={role === 'seller'}
                    onChange={() => setRole('seller')}
                  />
                  <span>Seller / Merchant</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Username / Store Name</label>
              <input
                type="text"
                placeholder="e.g. AlexStore"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                placeholder="+2348012345678"
                value={phonenumber}
                onChange={(e) => setPhonenumber(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password (min 6 characters)</label>
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
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.88rem', color: '#64748b' }}>
              Already registered?{' '}
              <Link href="/login" style={{ color: '#0f172a', fontWeight: 700 }}>
                Sign in here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
