import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import {
  ShoppingBag,
  CreditCard,
  Star,
  ChevronLeft,
  ShieldCheck,
  Truck,
  Store,
  MessageSquare,
  Check
} from 'lucide-react';

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { token, isAuthenticated, isBuyer } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [initializingPaystack, setInitializingPaystack] = useState(false);

  // Review states
  const [rating, setRating] = useState(5);
  const [reviewMessage, setReviewMessage] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!id) return;

    async function loadProduct() {
      try {
        setLoading(true);
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`/api/products/${id}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        } else {
          showToast('Product not found', 'error');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id, token, showToast]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    await addToCart(product._id, quantity);
    setAddingToCart(false);
  };

  // Direct Paystack Checkout for this product
  const handleDirectPaystack = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to complete checkout', 'info');
      router.push('/login?redirect=' + encodeURIComponent(`/products/${id}`));
      return;
    }
    if (!isBuyer) {
      showToast('Only buyer accounts can initialize payments', 'warning');
      return;
    }

    try {
      setInitializingPaystack(true);
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: [
            {
              productId: product._id,
              quantity: quantity
            }
          ]
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Payment initialization failed');
      }

      showToast('Redirecting to Paystack...', 'success');
      const authUrl = data.data?.authorizationUrl;
      if (authUrl) {
        window.location.href = authUrl;
      } else {
        router.push(`/checkout/success?reference=${data.data.reference}`);
      }
    } catch (err) {
      showToast(err.message || 'Payment initiation failed', 'error');
    } finally {
      setInitializingPaystack(false);
    }
  };

  // Submit Feedback / Review
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !isBuyer) {
      showToast('Sign in as a buyer to leave feedback', 'warning');
      return;
    }
    if (!reviewMessage.trim()) {
      showToast('Please enter a feedback message', 'warning');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product: product._id,
          rating: Number(rating),
          message: reviewMessage
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit feedback');
      }

      showToast('Thank you for your review!', 'success');
      setReviews((prev) => [
        {
          _id: data.feedback?._id || Date.now(),
          rating,
          message: reviewMessage,
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);
      setReviewMessage('');
      setRating(5);
    } catch (err) {
      showToast(err.message || 'Error submitting feedback', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Product Not Found</h2>
        <Link href="/" className="btn btn-primary">
          <ChevronLeft size={16} /> Back to Catalog
        </Link>
      </div>
    );
  }

  const fallbackImage = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80';
  const imgUrl = product.imageUrl || product.image || fallbackImage;
  const price = Number(product.price || 0);

  return (
    <>
      <Head>
        <title>{product.name} | MarketHub</title>
      </Head>

      <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: '#64748b', fontWeight: 600 }}>
            <ChevronLeft size={16} /> Back to Catalog
          </Link>
        </div>

        {/* Product Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'start' }}>
          {/* Left: Product Image */}
          <div style={{ background: '#ffffff', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: '100%', height: '420px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={imgUrl}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.src = fallbackImage;
                }}
              />
            </div>
          </div>

          {/* Right: Product Info */}
          <div>
            {/* Seller Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="badge badge-seller" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Store size={12} /> {product.seller?.username ? `Sold by ${product.seller.username}` : 'Official Store'}
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)', fontWeight: 800, color: '#0f172a', lineHeight: 1.25, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              {product.name}
            </h1>

            {/* Price Box */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem 1.5rem', marginBottom: '1.75rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Price</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
                ₦{price.toLocaleString()}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Description</h3>
              <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6 }}>
                {product.description}
              </p>
            </div>

            {/* Quantity Stepper */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Quantity:</span>
              <div className="qty-counter" style={{ padding: '0.2rem' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="qty-btn"
                  style={{ width: '34px', height: '34px' }}
                >
                  -
                </button>
                <span className="qty-val" style={{ minWidth: '36px', fontSize: '0.95rem' }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="qty-btn"
                  style={{ width: '34px', height: '34px' }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              <button
                onClick={handleDirectPaystack}
                disabled={initializingPaystack}
                className="btn btn-accent btn-lg btn-full"
              >
                <CreditCard size={18} />
                {initializingPaystack ? 'Initializing Paystack...' : `Instant Paystack Checkout (₦${(price * quantity).toLocaleString()})`}
              </button>

              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="btn btn-outline btn-lg btn-full"
              >
                <ShoppingBag size={18} />
                {addingToCart ? 'Adding to bag...' : 'Add to Shopping Bag'}
              </button>
            </div>

            {/* Guarantees */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.86rem', color: '#64748b' }}>
                <ShieldCheck size={18} color="#10b981" />
                <span>Verified Paystack Payment Protection</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.86rem', color: '#64748b' }}>
                <Truck size={18} color="#0284c7" />
                <span>Standard Delivery Dispatch within 24-48 Hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Feedback & Reviews Section */}
        <section style={{ marginTop: '5rem', borderTop: '1px solid #e2e8f0', paddingTop: '3.5rem' }}>
          <div style={{ maxWidth: '720px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <MessageSquare size={22} color="#0f172a" />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                Customer Reviews & Feedback
              </h2>
            </div>

            {/* Leave Review Form */}
            <div className="card" style={{ marginBottom: '2.5rem', background: '#ffffff' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>
                Leave a Rating & Feedback
              </h3>

              <form onSubmit={handleSubmitFeedback}>
                <div className="form-group">
                  <label className="form-label">Rating (1 to 5 Stars)</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '8px',
                          background: star <= rating ? '#fef3c7' : '#f1f5f9',
                          color: star <= rating ? '#f59e0b' : '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontWeight: 700
                        }}
                      >
                        <Star size={18} fill={star <= rating ? '#f59e0b' : 'none'} />
                        {star}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Your Feedback</label>
                  <textarea
                    rows={3}
                    placeholder="Share your experience with this product..."
                    value={reviewMessage}
                    onChange={(e) => setReviewMessage(e.target.value)}
                    className="form-textarea"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn btn-primary"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            </div>

            {/* Review List */}
            {reviews.length > 0 && (
              <div>
                <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Recent Reviews</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reviews.map((rev) => (
                    <div key={rev._id} className="card" style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b' }}>
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} size={15} fill="#f59e0b" />
                          ))}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.5 }}>
                        {rev.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
