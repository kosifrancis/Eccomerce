import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Helper to fetch user profile
  const fetchUserProfile = useCallback(async (jwtToken) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return data.user;
      } else {
        // Token expired or invalid
        localStorage.removeItem('ecom_token');
        setUser(null);
        setToken(null);
        return null;
      }
    } catch (err) {
      console.warn('Failed to fetch user profile:', err);
      return null;
    }
  }, []);

  // Hydrate auth from localStorage on mount
  useEffect(() => {
    const savedToken = typeof window !== 'undefined' ? localStorage.getItem('ecom_token') : null;
    if (savedToken) {
      setToken(savedToken);
      fetchUserProfile(savedToken).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  // Login handler
  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    const jwtToken = data.token;
    localStorage.setItem('ecom_token', jwtToken);
    setToken(jwtToken);
    const profile = await fetchUserProfile(jwtToken);
    return { token: jwtToken, user: profile };
  };

  // Register handler
  const register = async ({ username, email, password, role, phonenumber }) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, role, phonenumber })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    // Auto-login after registration
    return login(email, password);
  };

  // Quick Demo Login (instant testing helper)
  const quickDemoLogin = async (role = 'buyer') => {
    const email = role === 'seller' ? 'seller@market.com' : 'buyer@market.com';
    const password = 'password123';
    try {
      return await login(email, password);
    } catch (err) {
      // If user doesn't exist yet, auto-register them
      await register({
        username: role === 'seller' ? 'TechStore' : 'JaneBuyer',
        email,
        password,
        role,
        phonenumber: role === 'seller' ? '+2348012345678' : '+2348087654321'
      });
      return await login(email, password);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('ecom_token');
    setToken(null);
    setUser(null);
    router.push('/');
  };

  // Forgot password
  const forgotPassword = async (email) => {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to request OTP');
    }
    return data;
  };

  // Verify OTP
  const verifyOtp = async (email, otp) => {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to verify OTP');
    }
    return data;
  };

  // Set new password
  const setNewPassword = async ({ email, otp, newPassword, resetToken }) => {
    const res = await fetch('/api/auth/set-new-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword, resetToken })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to reset password');
    }
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isBuyer: user?.role === 'buyer',
        isSeller: user?.role === 'seller',
        login,
        register,
        logout,
        quickDemoLogin,
        forgotPassword,
        verifyOtp,
        setNewPassword,
        refreshProfile: () => token && fetchUserProfile(token)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
