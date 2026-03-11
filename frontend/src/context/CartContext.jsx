import { createContext, useContext, useState, useEffect } from 'react';
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
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('crocheCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('crocheCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1, selectedColor = null) => {
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

    toast.success(`${product.name} added to cart!`, {
      description: quantity > 1 ? `${quantity} items added` : 'Product successfully added',
      duration: 3000,
    });
  };

  const removeFromCart = (productId, selectedColor, cartItemId = null) => {
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
  };

  const updateQuantity = (productId, selectedColor, quantity, cartItemId = null) => {
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
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      // Skip items with null prices (custom crochet requests)
      if (item.price === null) return total;
      return total + item.price * (item.quantity || 1);
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
