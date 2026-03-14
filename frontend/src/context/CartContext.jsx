import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { t } = useTranslation();
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('crocheCart');
    try {
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      console.error('Error parsing cart from localStorage', e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('crocheCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((product, quantity = 1, selectedColor = null) => {
    setCartItems(prevItems => {
      // Handle custom orders (they always get added as new items)
      if (product.isCustomOrder) {
        return [...prevItems, {
          ...product,
          quantity,
          // Generate unique ID for custom orders
          cartItemId: Date.now() + Math.random()
        }];
      }

      // Handle regular products
      const existingItem = prevItems.find(
        item => item.id === product.id && item.selectedColor === selectedColor && !item.isCustomOrder
      );

      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id && item.selectedColor === selectedColor && !item.isCustomOrder
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prevItems, { ...product, quantity, selectedColor }];
    });

    toast.success(t('cart.successToast'), {
      description: quantity > 1
        ? t('cart.itemsAdded', { count: quantity })
        : t('cart.itemAdded'),
      duration: 3000,
    });
  }, [t]);

  const removeFromCart = useCallback((productId, selectedColor, cartItemId = null) => {
    setCartItems(prevItems =>
      prevItems.filter(
        item => {
          // For custom orders, use cartItemId
          if (cartItemId) {
            return item.cartItemId !== cartItemId;
          }
          // For regular products
          return !(item.id === productId && item.selectedColor === selectedColor);
        }
      )
    );
  }, []);

  const updateQuantity = useCallback((productId, selectedColor, quantity, cartItemId = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedColor, cartItemId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item => {
        // For custom orders
        if (cartItemId && item.cartItemId === cartItemId) {
          return { ...item, quantity };
        }
        // For regular products  
        if (item.id === productId && item.selectedColor === selectedColor && !item.isCustomOrder) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => {
      // Skip items with null prices (custom crochet requests)
      if (item.price === null) return total;
      return total + item.price * (item.quantity || 1);
    }, 0);
  }, [cartItems]);

  const getCartCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const value = useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount
  }), [cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

