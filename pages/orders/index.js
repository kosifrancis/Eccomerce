import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Package, Clock, ShieldCheck, ChevronRight, Star, AlertCircle, ShoppingBag } from 'lucide-react';

export default function MyOrdersPage() {
  const { token, isAuthenticated, isBuyer } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !isBuyer) return;

    async function loadOrders() {
      try {
        setLoading(true);
        const res = await fetch('/api/orders/my-orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [token, isBuyer]);

  if (!isAuthenticated || !isBuyer) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Buyer Account Required</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Please log in to view your orders.</p>
        <Link href="/login" className="btn btn-primary">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Orders | MarketHub</title>
      </Head>

      <div className="container" style={{ padding: '2.5rem 1.5rem 5rem', maxWidth: '860px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          My Purchase Orders
        </h1>
        <p style={{ color: '#64748b', marginBottom: '2.5rem' }}>
          Track real-time shipment updates, Paystack references, and order status.
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ color: '#64748b' }}>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <ShoppingBag size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>No orders found</h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>You haven't placed any orders yet.</p>
            <Link href="/" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orders.map((order) => {
              const isPaid = order.paymentStatus === 'paid' || order.status === 'paid';

              return (
                <div key={order._id} className="card" style={{ padding: '1.5rem' }}>
                  {/* Order header */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>ORDER #{order._id.substring(order._id.length - 8).toUpperCase()}</div>
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                        <Clock size={13} /> {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge ${isPaid ? 'badge-success' : 'badge-pending'}`}>
                        {isPaid ? 'PAID' : 'PAYMENT PENDING'}
                      </span>
                      <span className={`badge ${order.status === 'delivered' ? 'badge-buyer' : order.status === 'shipped' ? 'badge-success' : 'badge-pending'}`}>
                        STATUS: {order.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
                    {order.items?.map((item, idx) => {
                      const prod = item.product || {};
                      const prodId = prod._id || item.product;

                      return (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0f172a' }} />
                            <div>
                              <Link href={`/products/${prodId}`} style={{ fontWeight: 600, color: '#0f172a' }}>
                                {prod.name || 'Product Item'}
                              </Link>
                              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Qty: {item.quantity} × ₦{Number(item.price || 0).toLocaleString()}</div>
                            </div>
                          </div>

                          <div style={{ fontWeight: 700, color: '#0f172a' }}>
                            ₦{(Number(item.price || 0) * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Footer */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      {order.paymentReference && (
                        <span>Ref: <code style={{ color: '#0f172a', fontWeight: 600 }}>{order.paymentReference}</code></span>
                      )}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', marginRight: '0.5rem' }}>Total:</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                        ₦{Number(order.totalPrice || 0).toLocaleString()}
                      </span>
                    </div>
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
