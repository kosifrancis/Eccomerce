import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { Search, SlidersHorizontal, Sparkles, ShoppingBag, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  const { token, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [priceFilter, setPriceFilter] = useState('all');

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/products', { headers });
        if (res.ok) {
          const data = await res.json();
          setProducts(Array.isArray(data) ? data : []);
        } else {
          console.warn('Could not load products:', res.status);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [token]);

  // Filter & sort logic
  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      (prod.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prod.description || '').toLowerCase().includes(searchTerm.toLowerCase());

    const price = Number(prod.price || 0);
    let matchesPrice = true;
    if (priceFilter === 'under100k') matchesPrice = price < 100000;
    else if (priceFilter === '100k-500k') matchesPrice = price >= 100000 && price <= 500000;
    else if (priceFilter === 'over500k') matchesPrice = price > 500000;

    return matchesSearch && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return Number(a.price) - Number(b.price);
    if (sortBy === 'price-high') return Number(b.price) - Number(a.price);
    return new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
  });

  return (
    <>
      <Head>
        <title>MarketHub | Modern Curated Catalog</title>
      </Head>

      {/* Hero Section */}
      <section style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '3.5rem 0 3rem' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#ecfdf5', color: '#065f46', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            <Sparkles size={15} color="#10b981" />
            <span>End-to-End E-Commerce & Paystack Gateway</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.15, marginBottom: '1rem', color: '#0f172a' }}>
            Effortless Shopping.<br />
            <span style={{ background: 'linear-gradient(135deg, #10b981, #0284c7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Seamless Checkout.
            </span>
          </h1>

          <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '620px', margin: '0 auto 2rem' }}>
            Discover top-tier electronics and gear with instant Paystack checkout, verified order callbacks, and real-time inventory tracking.
          </p>

          {/* Search bar */}
          <div style={{ position: 'relative', maxWidth: '580px', margin: '0 auto' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search products by name or specification..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: '46px',
                paddingRight: '16px',
                height: '52px',
                borderRadius: '9999px',
                fontSize: '0.95rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
              }}
            />
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <section className="container" style={{ padding: '2.5rem 1.5rem 4rem' }}>
        {/* Filters and Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
              Featured Products
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#64748b' }}>
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Price Filter */}
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '0.5rem 0.85rem', fontSize: '0.86rem', borderRadius: '8px' }}
            >
              <option value="all">All Prices</option>
              <option value="under100k">Under ₦100,000</option>
              <option value="100k-500k">₦100,000 - ₦500,000</option>
              <option value="over500k">Over ₦500,000</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '0.5rem 0.85rem', fontSize: '0.86rem', borderRadius: '8px' }}
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#0f172a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.9rem' }}>Loading catalog...</p>
            <style jsx>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <ShoppingBag size={40} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>No products found</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {searchTerm ? 'Try adjusting your search criteria or price filters.' : 'The store catalog is currently empty.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setPriceFilter('all');
                }}
                className="btn btn-outline btn-sm"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
