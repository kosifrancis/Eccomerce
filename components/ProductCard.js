import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ArrowUpRight, Check } from 'lucide-react';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const fallbackImage = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';
  const imgUrl = product.imageUrl || product.image || fallbackImage;
  const price = Number(product.price || 0);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    const success = await addToCart(product._id, 1);
    setAdding(false);
    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    }
  };

  return (
    <div className="product-card">
      <Link href={`/products/${product._id}`}>
        <div className="product-image-wrap">
          <img
            src={imgUrl}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = fallbackImage;
            }}
          />
        </div>
      </Link>

      <div className="product-details">
        <div className="product-seller-tag">
          {product.seller?.username ? `By ${product.seller.username}` : 'Verified Seller'}
        </div>

        <Link href={`/products/${product._id}`}>
          <h3 className="product-title" title={product.name}>
            {product.name}
          </h3>
        </Link>

        <p className="product-desc">
          {product.description}
        </p>

        <div className="product-footer">
          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', fontWeight: 600 }}>PRICE</span>
            <div className="product-price">₦{price.toLocaleString()}</div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={adding}
            className={`btn btn-sm ${added ? 'btn-accent' : 'btn-outline'}`}
            style={{ minWidth: '95px' }}
          >
            {added ? (
              <>
                <Check size={14} /> Added
              </>
            ) : adding ? (
              'Adding...'
            ) : (
              <>
                <ShoppingBag size={14} /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
