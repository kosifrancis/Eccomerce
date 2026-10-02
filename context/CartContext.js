import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { token, isAuthenticated, isBuyer } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Fetch cart from backend
  const fetchCart = useCallback(async () => {
    if (!token || !isBuyer) {
      setItems([]);
      setTotalItems(0);
      setTotalPrice(0);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const cartItems = data.items || [];
        setItems(cartItems);
        setTotalItems(data.totalItems || cartItems.reduce((acc, i) => acc + (i.quantity || 1), 0));
        setTotalPrice(data.totalPrice || cartItems.reduce((acc, i) => acc + ((i.product?.price || 0) * (i.quantity || 1)), 0));
      }
    } catch (err) {
      console.warn('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  }, [token, isBuyer]);

  // Sync cart whenever auth status changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      showToast('Please sign in to add items to your cart', 'info');
      return false;
    }
    if (!isBuyer) {
      showToast('Only buyer accounts can add items to cart', 'warning');
      return false;
    }

    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to add item to cart');
      }

      showToast('Item added to cart!', 'success');
      await fetchCart();
      setIsCartOpen(true);
      return true;
    } catch (err) {
      showToast(err.message || 'Error adding to cart', 'error');
      return false;
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, quantity) => {
    if (!token) return;
    if (quantity <= 0) {
      return removeItem(productId);
    }

    try {
      const res = await fetch('/api/cart/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update cart');
      }
      await fetchCart();
    } catch (err) {
      showToast(err.message || 'Error updating cart', 'error');
    }
  };

  // Remove item
  const removeItem = async (productId) => {
    if (!token) return;

    try {
      const res = await fetch('/api/cart/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to remove item');
      }
      showToast('Item removed from cart', 'info');
      await fetchCart();
    } catch (err) {
      showToast(err.message || 'Error removing item', 'error');
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!token) return;

    try {
      const res = await fetch('/api/cart/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to clear cart');
      }
      setItems([]);
      setTotalItems(0);
      setTotalPrice(0);
      showToast('Cart cleared', 'info');
    } catch (err) {
      showToast(err.message || 'Error clearing cart', 'error');
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        loading,
        isCartOpen,
        setIsCartOpen,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
