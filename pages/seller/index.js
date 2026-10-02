import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Store, Package, Layers, MessageSquareQuote, Plus, ArrowUpRight, TrendingUp, DollarSign } from 'lucide-react';

export default function SellerDashboardPage() {
  const { user, token, isAuthenticated, isSeller } = useAuth();
  const [stats, setStats] = useState({
    productsCount: 0,
    ordersCount: 0,
    feedbackCount: 0,
    totalSales: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !isSeller) return;

    async function loadStats() {
      try {
        setLoading(true);
        // Load seller products
        const prodRes = await fetch('/api/products/seller/mine', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const prodData = prodRes.ok ? await prodRes.json() : [];

        // Load seller orders
        const ordRes = await fetch('/api/orders/seller-orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const ordData = ordRes.ok ? await ordRes.json() : { orders: [] };
        const orders = ordData.orders || [];

        // Load seller feedback
        const feedRes = await fetch('/api/feedback/seller', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const feedData = feedRes.ok ? await feedRes.json() : { feedback: [] };
        const feedback = feedData.feedback || [];

        // Calculate sales
        const sales = orders.reduce((acc, o) => acc + (o.paymentStatus === 'paid' ? (o.totalPrice || 0) : 0), 0);

        setStats({
          productsCount: prodData.length || 0,
          ordersCount: orders.length || 0,
          feedbackCount: feedback.length || 0,
          totalSales: sales
        });
      } catch (err) {
        console.error('Error loading seller dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [token, isSeller]);

  if (!isAuthenticated || !isSeller) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Seller Access Required</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>You must be logged in as a verified seller to access the seller hub.</p>
        <Link href="/login" className="btn btn-primary">
          Sign In as Seller
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Seller Hub | MarketHub</title>
      </Head>

      <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#b45309', background: '#fef3c7', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              <Store size={14} /> MERCHANT PORTAL
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em' }}>
              Welcome back, {user?.username}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Manage your product listings, fulfillment queues, and customer feedback.</p>
          </div>

          <Link href="/seller/products" className="btn btn-accent">
            <Plus size={16} /> Add New Product
          </Link>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
              <span>ACTIVE PRODUCTS</span>
              <Package size={18} color="#0f172a" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
              {stats.productsCount}
            </div>
            <Link href="/seller/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.82rem', color: '#10b981', fontWeight: 600, marginTop: '0.5rem' }}>
              Manage Catalog <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
              <span>INCOMING ORDERS</span>
              <Layers size={18} color="#0f172a" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
              {stats.ordersCount}
            </div>
            <Link href="/seller/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.82rem', color: '#10b981', fontWeight: 600, marginTop: '0.5rem' }}>
              Fulfill Orders <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
              <span>REVIEWS RECEIVED</span>
              <MessageSquareQuote size={18} color="#0f172a" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
              {stats.feedbackCount}
            </div>
            <Link href="/seller/feedback" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.82rem', color: '#10b981', fontWeight: 600, marginTop: '0.5rem' }}>
              View Feedback <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
              <span>PAID REVENUE</span>
              <DollarSign size={18} color="#10b981" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>
              ₦{stats.totalSales.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.5rem' }}>
              Verified transactions
            </div>
          </div>
        </div>

        {/* Quick Nav Cards */}
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem', color: '#0f172a' }}>
          Merchant Management Tools
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <Link href="/seller/products" className="card" style={{ padding: '1.75rem', textDecoration: 'none' }}>
            <div style={{ background: '#ecfdf5', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '1rem' }}>
              <Package size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>Product Listings & Cloudinary Upload</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
              Create new inventory, upload product photography directly to Cloudinary, and update pricing.
            </p>
          </Link>

          <Link href="/seller/orders" className="card" style={{ padding: '1.75rem', textDecoration: 'none' }}>
            <div style={{ background: '#e0f2fe', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', marginBottom: '1rem' }}>
              <Layers size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>Order Fulfillment</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
              Track customer purchases, update status from Pending to Shipped or Delivered.
            </p>
          </Link>

          <Link href="/seller/feedback" className="card" style={{ padding: '1.75rem', textDecoration: 'none' }}>
            <div style={{ background: '#fef3c7', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', marginBottom: '1rem' }}>
              <MessageSquareQuote size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>Customer Feedback & Ratings</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
              Read direct buyer feedback and customer ratings across your product portfolio.
            </p>
          </Link>
        </div>
      </div>
    </>
  );
}
