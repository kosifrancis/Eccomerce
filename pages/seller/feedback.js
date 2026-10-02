import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { MessageSquareQuote, Star, ChevronLeft, User, Package } from 'lucide-react';

export default function SellerFeedbackPage() {
  const { token, isAuthenticated, isSeller } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !isSeller) return;

    async function loadFeedback() {
      try {
        setLoading(true);
        const res = await fetch('/api/feedback/seller', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setFeedbackList(data.feedback || []);
        }
      } catch (err) {
        console.error('Error loading seller feedback:', err);
      } finally {
        setLoading(false);
      }
    }

    loadFeedback();
  }, [token, isSeller]);

  if (!isAuthenticated || !isSeller) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Seller Access Required</h2>
        <Link href="/login" className="btn btn-primary">
          Sign In as Seller
        </Link>
      </div>
    );
  }

  // Calculate average rating
  const avgRating = feedbackList.length > 0
    ? (feedbackList.reduce((acc, f) => acc + (f.rating || 0), 0) / feedbackList.length).toFixed(1)
    : '5.0';

  return (
    <>
      <Head>
        <title>Customer Feedback | Seller Hub</title>
      </Head>

      <div className="container" style={{ padding: '2.5rem 1.5rem 5rem', maxWidth: '800px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <Link href="/seller" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: '#64748b', fontWeight: 600 }}>
            <ChevronLeft size={16} /> Back to Seller Dashboard
          </Link>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Customer Feedback & Reviews
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
              Direct buyer reviews on products sold by your store.
            </p>
          </div>

          <div className="card" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b', fontSize: '1.3rem', fontWeight: 800 }}>
              <Star size={20} fill="#f59e0b" />
              {avgRating}
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Average across {feedbackList.length} reviews
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ color: '#64748b' }}>Loading customer reviews...</p>
          </div>
        ) : feedbackList.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <MessageSquareQuote size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>No reviews yet</h3>
            <p style={{ color: '#64748b' }}>Customer ratings and messages on your products will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {feedbackList.map((item) => {
              const buyer = item.buyer || {};
              const prod = item.product || {};

              return (
                <div key={item._id} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Package size={16} color="#0f172a" />
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                        {prod.name || 'Product'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b' }}>
                      {[...Array(item.rating || 5)].map((_, i) => (
                        <Star key={i} size={15} fill="#f59e0b" />
                      ))}
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.5rem' }}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.6, marginBottom: '1rem', background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px' }}>
                    "{item.message}"
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#64748b' }}>
                    <User size={14} />
                    <span>Left by <strong>{buyer.username || 'Customer'}</strong> ({buyer.email})</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
