import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit2, Upload, ChevronLeft, Image as ImageIcon, Check, X, Store } from 'lucide-react';

export default function SellerProductsPage() {
  const { user, token, isAuthenticated, isSeller } = useAuth();
  const { showToast } = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form States for Add Product
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load products created by seller
  const loadSellerProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products/seller/mine', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && isSeller) {
      loadSellerProducts();
    }
  }, [token, isSeller]);

  // Handle Cloudinary Image Upload
  const handleUploadImage = async (file) => {
    if (!file) return;
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/products/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Image upload failed');
      }

      const uploadedUrl = data.imageUrl || data.url;
      setImageUrl(uploadedUrl);
      showToast('Image uploaded to Cloudinary successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Cloudinary upload failed', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Create Product handler
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!name || !description || !price) {
      showToast('Please fill all required fields', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          description,
          price: Number(price),
          imageUrl: imageUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create product');
      }

      showToast('Product created successfully!', 'success');
      setIsAddModalOpen(false);
      setName('');
      setDescription('');
      setPrice('');
      setImageUrl('');
      setSelectedFile(null);
      await loadSellerProducts();
    } catch (err) {
      showToast(err.message || 'Error creating product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setName(prod.name || '');
    setDescription(prod.description || '');
    setPrice(prod.price || '');
    setImageUrl(prod.imageUrl || prod.image || '');
    setIsEditModalOpen(true);
  };

  // Save Edit Product handler
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          description,
          price: Number(price),
          imageUrl
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update product');
      }

      showToast('Product updated successfully!', 'success');
      setIsEditModalOpen(false);
      setEditingProduct(null);
      await loadSellerProducts();
    } catch (err) {
      showToast(err.message || 'Error updating product', 'error');
    } finally {
      setSubmitting(false);
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
        <title>Manage Products | Seller Hub</title>
      </Head>

      <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: '1rem' }}>
          <Link href="/seller" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: '#64748b', fontWeight: 600 }}>
            <ChevronLeft size={16} /> Back to Seller Dashboard
          </Link>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              My Product Listings
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Add new catalog items, upload high-res images to Cloudinary, and manage your inventory.
            </p>
          </div>

          <button
            onClick={() => {
              setName('');
              setDescription('');
              setPrice('');
              setImageUrl('');
              setIsAddModalOpen(true);
            }}
            className="btn btn-accent"
          >
            <Plus size={16} /> Add New Product
          </button>
        </div>

        {/* Products Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ color: '#64748b' }}>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <ImageIcon size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Products Yet</h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Start by adding your first product listing.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn btn-accent"
            >
              <Plus size={16} /> Add Product Now
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Date Added</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img
                          src={prod.imageUrl || prod.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=200&q=80'}
                          alt={prod.name}
                          style={{ width: '52px', height: '52px', borderRadius: '8px', objectFit: 'cover', background: '#f1f5f9' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{prod.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {prod.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>
                      ₦{Number(prod.price || 0).toLocaleString()}
                    </td>
                    <td style={{ fontSize: '0.84rem', color: '#64748b' }}>
                      {new Date(prod.dateAdded || Date.now()).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => openEditModal(prod)}
                        className="btn btn-outline btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Product Modal */}
        {isAddModalOpen && (
          <div className="cart-drawer-overlay" style={{ justifyContent: 'center', alignItems: 'center', padding: '1rem' }} onClick={() => setIsAddModalOpen(false)}>
            <div className="card" style={{ maxWidth: '540px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', color: '#64748b' }}
              >
                <X size={20} />
              </button>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.4rem', color: '#0f172a' }}>Add New Product</h2>
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                Fill in the details below. Images will be processed and saved to Cloudinary.
              </p>

              <form onSubmit={handleCreateProduct}>
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Wireless Noise Canceling Headphones"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Price (₦) *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 85000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    rows={3}
                    placeholder="Provide features, specifications, and details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="form-textarea"
                    required
                  />
                </div>

                {/* Cloudinary File Upload */}
                <div className="form-group">
                  <label className="form-label">Upload Product Image (Cloudinary)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        handleUploadImage(file);
                      }
                    }}
                    className="form-input"
                    style={{ padding: '0.5rem' }}
                  />
                  {uploadingImage && (
                    <div style={{ fontSize: '0.8rem', color: '#0284c7', marginTop: '0.35rem' }}>
                      Uploading image to Cloudinary...
                    </div>
                  )}
                </div>

                {/* Or image URL */}
                <div className="form-group">
                  <label className="form-label">Or Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="form-input"
                  />
                </div>

                {imageUrl && (
                  <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Image Preview:</span>
                    <img
                      src={imageUrl}
                      alt="Preview"
                      style={{ maxHeight: '140px', margin: '0 auto', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploadingImage}
                    className="btn btn-accent"
                    style={{ flex: 1 }}
                  >
                    {submitting ? 'Creating...' : 'Publish Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {isEditModalOpen && (
          <div className="cart-drawer-overlay" style={{ justifyContent: 'center', alignItems: 'center', padding: '1rem' }} onClick={() => setIsEditModalOpen(false)}>
            <div className="card" style={{ maxWidth: '540px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsEditModalOpen(false)}
                style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', color: '#64748b' }}
              >
                <X size={20} />
              </button>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.4rem', color: '#0f172a' }}>Edit Product</h2>
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                Update listing details for {editingProduct?.name}.
              </p>

              <form onSubmit={handleUpdateProduct}>
                <div className="form-group">
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Price (₦)</label>
                  <input
                    type="number"
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="form-textarea"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
