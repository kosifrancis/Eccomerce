import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Layers, ChevronLeft, Check, Clock, User, CheckCircle2 } from 'lucide-react';

export default function SellerOrdersPage() {
  const { user, token, isAuthenticated, isSeller } = useAuth();
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadSellerOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders/seller-orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Error loading seller orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && isSeller) {
      loadSellerOrders();
    }
  }, [token, isSeller]);

  // Update order status handler (PATCH /api/orders/:orderId/status)
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update order status');
      }

      showToast(`Order status updated to ${newStatus.toUpperCase()}`, 'success');
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      showToast(err.message || 'Error updating order status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

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

  return (
    <>
      <Head>
        <title>Order Fulfillment | Seller Hub</title>
      </Head>

      <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <Link href="/seller" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: '#64748b', fontWeight: 600 }}>
            <ChevronLeft size={16} /> Back to Seller Dashboard
          </Link>
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Incoming Customer Orders
        </h1>
        <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.92rem' }}>
          View customer purchases containing your items and update fulfillment dispatch statuses.
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ color: '#64748b' }}>Loading customer orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <Layers size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>No orders yet</h3>
            <p style={{ color: '#64748b' }}>When buyers purchase your products, they will appear here for fulfillment.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orders.map((order) => {
              const buyer = order.buyer || {};
              const isPaid = order.paymentStatus === 'paid' || order.status === 'paid';

              return (
                <div key={order._id} className="card" style={{ padding: '1.5rem' }}>
                  {/* Top Bar */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                        ORDER #{order._id.substring(order._id.length - 8).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={13} /> {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', padding: '0.5rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <User size={16} color="#64748b" />
                      <div style={{ fontSize: '0.84rem' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{buyer.username || 'Customer'}</div>
                        <div style={{ color: '#64748b', fontSize: '0.76rem' }}>{buyer.email}</div>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge ${isPaid ? 'badge-success' : 'badge-pending'}`}>
                        {isPaid ? 'PAID' : 'PAYMENT PENDING'}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {order.items?.map((item, idx) => {
                      const prod = item.product || {};
                      return (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                          <div>
                            <span style={{ fontWeight: 600, color: '#0f172a' }}>{prod.name || 'Product'}</span>
                            <span style={{ color: '#64748b', marginLeft: '0.5rem' }}>Qty: {item.quantity}</span>
                          </div>
                          <div style={{ fontWeight: 700, color: '#10b981' }}>
                            ₦{(Number(item.price || 0) * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Status update controller */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Fulfillment Status:</span>
                      <select
                        value={order.status || 'pending'}
                        onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                        disabled={updatingId === order._id}
                        className="form-select"
                        style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>

                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                      Total: ₦{Number(order.totalPrice || 0).toLocaleString()}
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
