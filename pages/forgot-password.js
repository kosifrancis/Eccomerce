import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { KeyRound, Mail, CheckCircle2, ChevronLeft, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, verifyOtp, setNewPassword } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [testOtpHint, setTestOtpHint] = useState('');

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email', 'warning');
      return;
    }

    try {
      setLoading(true);
      const res = await forgotPassword(email);
      showToast('OTP sent to your email!', 'success');
      if (res.testOtp) {
        setTestOtpHint(res.testOtp);
      }
      setStep(2);
    } catch (err) {
      showToast(err.message || 'Failed to request OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      showToast('Please enter the 6-digit OTP', 'warning');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyOtp(email, otp);
      showToast('OTP verified successfully!', 'success');
      setResetToken(res.resetToken);
      setStep(3);
    } catch (err) {
      showToast(err.message || 'Invalid or expired OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'warning');
      return;
    }

    try {
      setLoading(true);
      await setNewPassword({ email, otp, newPassword, resetToken });
      showToast('Password reset successful! Please sign in.', 'success');
      router.push('/login');
    } catch (err) {
      showToast(err.message || 'Error updating password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Reset Password | MarketHub</title>
      </Head>

      <div className="container" style={{ padding: '4rem 1.5rem 6rem', maxWidth: '440px' }}>
        <div className="card" style={{ padding: '2.5rem 2rem', borderRadius: '24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ background: '#ecfdf5', width: '52px', height: '52px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#10b981' }}>
              <KeyRound size={24} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
              Reset Password
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
              {step === 1 && 'Enter your registered email to receive a 6-digit OTP code.'}
              {step === 2 && 'Enter the 6-digit verification code sent to your email.'}
              {step === 3 && 'Choose a strong new password for your account.'}
            </p>
          </div>

          {/* Stepper indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <div style={{ width: '32px', height: '4px', borderRadius: '2px', background: step >= 1 ? '#10b981' : '#e2e8f0' }} />
            <div style={{ width: '32px', height: '4px', borderRadius: '2px', background: step >= 2 ? '#10b981' : '#e2e8f0' }} />
            <div style={{ width: '32px', height: '4px', borderRadius: '2px', background: step >= 3 ? '#10b981' : '#e2e8f0' }} />
          </div>

          {/* Step 1: Email Form */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp}>
              <div className="form-group">
                <label className="form-label">Registered Email</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                {loading ? 'Sending OTP...' : 'Send Verification Code'}
              </button>

              <div style={{ textAlign: 'center' }}>
                <Link href="/login" style={{ fontSize: '0.88rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ChevronLeft size={16} /> Back to Sign In
                </Link>
              </div>
            </form>
          )}

          {/* Step 2: OTP Form */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp}>
              {testOtpHint && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem', borderRadius: '8px', fontSize: '0.82rem', color: '#166534', marginBottom: '1.25rem' }}>
                  Test Mode OTP: <strong style={{ letterSpacing: '2px' }}>{testOtpHint}</strong>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">6-Digit OTP Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="form-input"
                  style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '6px', fontWeight: 800 }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-full btn-lg"
                style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ fontSize: '0.85rem', color: '#64748b' }}
                >
                  Change email or resend
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New Password Form */}
          {step === 3 && (
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-accent btn-full btn-lg"
                style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}
              >
                {loading ? 'Updating Password...' : 'Save New Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
