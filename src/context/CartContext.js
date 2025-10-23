// src/context/CartContext.js
// import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
// import { cartService } from '../services/cartService';

// const CartContext = createContext();

// export const useCart = () => {
//   const context = useContext(CartContext);
//   if (!context) {
//     throw new Error('useCart must be used within a CartProvider');
//   }
//   return context;
// };

// export const CartProvider = ({ children }) => {
//   const [cart, setCart] = useState({
//     items: [],
//     savedItems: [],
//     totalItems: 0,
//     totalAmount: 0,
//     appliedCoupon: null,
//     discountAmount: 0
//   });
  
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, synced, error

//   // Load cart from server on mount
//   useEffect(() => {
//     fetchCart();
//   }, []);

//   // Fetch cart from server
//   const fetchCart = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const response = await cartService.getCart();
//       setCart(response.cart || {
//         items: [],
//         savedItems: [],
//         totalItems: 0,
//         totalAmount: 0,
//         appliedCoupon: null,
//         discountAmount: 0
//       });
//       setSyncStatus('synced');
//     } catch (error) {
//       console.error('Failed to fetch cart:', error);
//       setError(error.message);
//       setSyncStatus('error');
      
//       // Fallback to localStorage if server fails
//       loadFromLocalStorage();
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Fallback: Load from localStorage
//   const loadFromLocalStorage = () => {
//     try {
//       const savedCart = localStorage.getItem('pharma_cart');
//       if (savedCart) {
//         const localCart = JSON.parse(savedCart);
//         // Convert old format to new format if necessary
//         if (Array.isArray(localCart)) {
//           setCart({
//             items: localCart.map(item => ({
//               _id: item._id,
//               tablet: item,
//               quantity: item.quantity || 1,
//               priceAtTime: item.price
//             })),
//             savedItems: [],
//             totalItems: localCart.reduce((total, item) => total + (item.quantity || 1), 0),
//             totalAmount: localCart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0),
//             appliedCoupon: null,
//             discountAmount: 0
//           });
//         } else {
//           setCart(localCart);
//         }
//       }
//     } catch (error) {
//       console.error('Error loading cart from localStorage:', error);
//     }
//   };

//   // Save to localStorage as backup
//   const saveToLocalStorage = useCallback((cartData) => {
//     try {
//       localStorage.setItem('pharma_cart', JSON.stringify(cartData));
//     } catch (error) {
//       console.error('Error saving cart to localStorage:', error);
//     }
//   }, []);

//   // Add item to cart
//   const addToCart = async (medicine, quantity = 1) => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       // Optimistically update UI
//       const existingItem = cart.items.find(item => item.tablet?._id === medicine._id);
//       if (existingItem) {
//         await updateQuantity(existingItem._id, existingItem.quantity + quantity);
//       } else {
//         const response = await cartService.addToCart(medicine._id, quantity);
//         setCart(response.cart);
//         saveToLocalStorage(response.cart);
//       }
      
//       setSyncStatus('synced');
//     } catch (error) {
//       console.error('Failed to add to cart:', error);
//       setError(error.message);
//       setSyncStatus('error');
      
//       // Fallback to local storage
//       addToLocalCart(medicine, quantity);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fallback: Add to local cart
//   const addToLocalCart = (medicine, quantity) => {
//     setCart(prevCart => {
//       const existingItem = prevCart.items.find(item => item.tablet?._id === medicine._id);
      
//       let newItems;
//       if (existingItem) {
//         newItems = prevCart.items.map(item =>
//           item.tablet?._id === medicine._id
//             ? { ...item, quantity: item.quantity + quantity }
//             : item
//         );
//       } else {
//         newItems = [...prevCart.items, {
//           _id: `local_${Date.now()}`,
//           tablet: medicine,
//           quantity,
//           priceAtTime: medicine.price
//         }];
//       }

//       const newCart = {
//         ...prevCart,
//         items: newItems,
//         totalItems: newItems.reduce((total, item) => total + item.quantity, 0),
//         totalAmount: newItems.reduce((total, item) => 
//           total + ((item.tablet?.price || item.priceAtTime) * item.quantity), 0
//         )
//       };

//       saveToLocalStorage(newCart);
//       return newCart;
//     });
//   };

//   // Update quantity
//   const updateQuantity = async (itemId, newQuantity) => {
//     if (newQuantity <= 0) {
//       await removeFromCart(itemId);
//       return;
//     }

//     try {
//       setLoading(true);
//       setError(null);
      
//       const response = await cartService.updateQuantity(itemId, newQuantity);
//       setCart(response.cart);
//       saveToLocalStorage(response.cart);
//       setSyncStatus('synced');
//     } catch (error) {
//       console.error('Failed to update quantity:', error);
//       setError(error.message);
//       setSyncStatus('error');
      
//       // Fallback to local update
//       updateLocalQuantity(itemId, newQuantity);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fallback: Update local quantity
//   const updateLocalQuantity = (itemId, newQuantity) => {
//     setCart(prevCart => {
//       const newItems = prevCart.items.map(item =>
//         item._id === itemId ? { ...item, quantity: newQuantity } : item
//       );

//       const newCart = {
//         ...prevCart,
//         items: newItems,
//         totalItems: newItems.reduce((total, item) => total + item.quantity, 0),
//         totalAmount: newItems.reduce((total, item) => 
//           total + ((item.tablet?.price || item.priceAtTime) * item.quantity), 0
//         )
//       };

//       saveToLocalStorage(newCart);
//       return newCart;
//     });
//   };

//   // Remove from cart
//   const removeFromCart = async (itemId) => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const response = await cartService.removeItem(itemId);
//       setCart(response.cart);
//       saveToLocalStorage(response.cart);
//       setSyncStatus('synced');
//     } catch (error) {
//       console.error('Failed to remove from cart:', error);
//       setError(error.message);
//       setSyncStatus('error');
      
//       // Fallback to local removal
//       removeFromLocalCart(itemId);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fallback: Remove from local cart
//   const removeFromLocalCart = (itemId) => {
//     setCart(prevCart => {
//       const newItems = prevCart.items.filter(item => item._id !== itemId);
      
//       const newCart = {
//         ...prevCart,
//         items: newItems,
//         totalItems: newItems.reduce((total, item) => total + item.quantity, 0),
//         totalAmount: newItems.reduce((total, item) => 
//           total + ((item.tablet?.price || item.priceAtTime) * item.quantity), 0
//         )
//       };

//       saveToLocalStorage(newCart);
//       return newCart;
//     });
//   };

//   // Clear cart
//   const clearCart = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       await cartService.clearCart();
//       const emptyCart = {
//         items: [],
//         savedItems: [],
//         totalItems: 0,
//         totalAmount: 0,
//         appliedCoupon: null,
//         discountAmount: 0
//       };
      
//       setCart(emptyCart);
//       saveToLocalStorage(emptyCart);
//       setSyncStatus('synced');
//     } catch (error) {
//       console.error('Failed to clear cart:', error);
//       setError(error.message);
//       setSyncStatus('error');
      
//       // Fallback to local clear
//       const emptyCart = {
//         items: [],
//         savedItems: [],
//         totalItems: 0,
//         totalAmount: 0,
//         appliedCoupon: null,
//         discountAmount: 0
//       };
//       setCart(emptyCart);
//       saveToLocalStorage(emptyCart);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Save for later
//   const saveForLater = async (itemId) => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const response = await cartService.saveForLater(itemId);
//       setCart(response.cart);
//       saveToLocalStorage(response.cart);
//       setSyncStatus('synced');
//     } catch (error) {
//       console.error('Failed to save for later:', error);
//       setError(error.message);
//       setSyncStatus('error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Move to cart from saved items
//   const moveToCart = async (savedItemId) => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const response = await cartService.moveToCart(savedItemId);
//       setCart(response.cart);
//       saveToLocalStorage(response.cart);
//       setSyncStatus('synced');
//     } catch (error) {
//       console.error('Failed to move to cart:', error);
//       setError(error.message);
//       setSyncStatus('error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Sync cart with server
//   const syncCart = async () => {
//     try {
//       setSyncStatus('syncing');
//       setError(null);
      
//       const response = await cartService.syncCart();
//       setCart(response.cart);
//       saveToLocalStorage(response.cart);
//       setSyncStatus('synced');
      
//       if (response.changes?.hasChanges) {
//         return {
//           hasChanges: true,
//           message: response.message || 'Cart updated based on current availability'
//         };
//       }
      
//       return { hasChanges: false };
//     } catch (error) {
//       console.error('Failed to sync cart:', error);
//       setError(error.message);
//       setSyncStatus('error');
//       throw error;
//     }
//   };

//   // Apply coupon
//   const applyCoupon = async (couponCode) => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const response = await cartService.applyCoupon(couponCode);
//       setCart(response.cart);
//       saveToLocalStorage(response.cart);
//       setSyncStatus('synced');
      
//       return response;
//     } catch (error) {
//       console.error('Failed to apply coupon:', error);
//       setError(error.message);
//       setSyncStatus('error');
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Remove coupon
//   const removeCoupon = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const response = await cartService.removeCoupon();
//       setCart(response.cart);
//       saveToLocalStorage(response.cart);
//       setSyncStatus('synced');
//     } catch (error) {
//       console.error('Failed to remove coupon:', error);
//       setError(error.message);
//       setSyncStatus('error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Utility functions
//   const getTotalItems = () => cart.totalItems || 0;
//   const getTotalAmount = () => cart.totalAmount || 0;
//   const getCartItem = (medicineId) => cart.items.find(item => item.tablet?._id === medicineId);
//   const isInCart = (medicineId) => cart.items.some(item => item.tablet?._id === medicineId);
//   const getSavedItems = () => cart.savedItems || [];
//   const hasItems = () => cart.items.length > 0;
//   const hasSavedItems = () => cart.savedItems && cart.savedItems.length > 0;

//   const value = {
//     // State
//     cart,
//     loading,
//     error,
//     syncStatus,
    
//     // Actions
//     addToCart,
//     removeFromCart,
//     updateQuantity,
//     clearCart,
//     saveForLater,
//     moveToCart,
//     syncCart,
//     applyCoupon,
//     removeCoupon,
//     fetchCart,
    
//     // Utilities
//     getTotalItems,
//     getTotalAmount,
//     getCartItem,
//     isInCart,
//     getSavedItems,
//     hasItems,
//     hasSavedItems,
    
//     // Error handling
//     clearError: () => setError(null)
//   };

//   return (
//     <CartContext.Provider value={value}>
//       {children}
//     </CartContext.Provider>
//   );
// };

// export { CartContext };              aslmost complete but has issues


// src/context/CartContext.js (FIXED with proper error handling)
import React, { createContext, useState, useContext, useEffect } from 'react';
import { cartService } from '../services/cartService';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({
    items: [],
    totalItems: 0,
    totalAmount: 0,
    savedItems: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load cart on mount
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await cartService.getCart();
      setCart(response.cart || { items: [], totalItems: 0, totalAmount: 0, savedItems: [] });
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setError('Failed to load cart');
      // Set empty cart on error
      setCart({ items: [], totalItems: 0, totalAmount: 0, savedItems: [] });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (medicine, quantity = 1) => {
    try {
      setError('');
      const response = await cartService.addToCart(medicine._id, quantity);
      setCart(response.cart);
      return { success: true, message: 'Item added to cart successfully' };
    } catch (error) {
      console.error('Failed to add to cart:', error);
      const errorMessage = error.message || 'Failed to add item to cart';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      setError('');
      const response = await cartService.updateQuantity(itemId, quantity);
      setCart(response.cart);
      return { success: true };
    } catch (error) {
      console.error('Failed to update quantity:', error);
      const errorMessage = error.message || 'Failed to update quantity';
      setError(errorMessage);
      throw error;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      setError('');
      const response = await cartService.removeItem(itemId);
      setCart(response.cart);
      return { success: true, message: 'Item removed from cart' };
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      const errorMessage = error.message || 'Failed to remove item from cart';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const clearCart = async () => {
    try {
      setError('');
      await cartService.clearCart();
      setCart({ items: [], totalItems: 0, totalAmount: 0, savedItems: [] });
      return { success: true, message: 'Cart cleared successfully' };
    } catch (error) {
      console.error('Failed to clear cart:', error);
      const errorMessage = error.message || 'Failed to clear cart';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const syncCart = async () => {
    try {
      setError('');
      const response = await cartService.syncCart();
      setCart(response.cart);
      return response;
    } catch (error) {
      console.error('Failed to sync cart:', error);
      const errorMessage = error.message || 'Failed to sync cart';
      setError(errorMessage);
      throw error;
    }
  };

  const getTotalItems = () => {
    return cart?.totalItems || 0;
  };

  const getTotalAmount = () => {
    return cart?.totalAmount || 0;
  };

  const getCartItem = (medicineId) => {
    return cart?.items?.find(item => item.tablet?._id === medicineId);
  };

  const isInCart = (medicineId) => {
    return cart?.items?.some(item => item.tablet?._id === medicineId) || false;
  };

  const getItemQuantity = (medicineId) => {
    const item = getCartItem(medicineId);
    return item?.quantity || 0;
  };

  const value = {
    cart,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    syncCart,
    fetchCart,
    getTotalItems,
    getTotalAmount,
    getCartItem,
    isInCart,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export { CartContext };


// import React, { createContext, useState, useContext, useEffect } from 'react';

// const CartContext = createContext();
 
// export const useCart = () => {
//   const context = useContext(CartContext);
//   if (!context) {
//     throw new Error('useCart must be used within a CartProvider');
//   }
//   return context;
// };

// export const CartProvider = ({ children }) => {
//   const [cart, setCart] = useState([]);

//   // Load cart from localStorage on component mount
//   useEffect(() => {
//     const savedCart = localStorage.getItem('pharma_cart');
//     if (savedCart) {
//       try {
//         setCart(JSON.parse(savedCart));
//       } catch (error) {
//         console.error('Error loading cart from localStorage:', error);
//         localStorage.removeItem('pharma_cart');
//       }
//     }
//   }, []);

//   // Save cart to localStorage whenever cart changes
//   useEffect(() => {
//     localStorage.setItem('pharma_cart', JSON.stringify(cart));
//   }, [cart]);

//   const addToCart = (medicine, quantity = 1) => {
//     setCart(prevCart => {
//       const existingItem = prevCart.find(item => item._id === medicine._id);
      
//       if (existingItem) {
//         // Update quantity if item already exists
//         return prevCart.map(item =>
//           item._id === medicine._id
//             ? { ...item, quantity: item.quantity + quantity }
//             : item
//         );
//       } else {
//         // Add new item to cart
//         return [...prevCart, { ...medicine, quantity }];
//       }
//     });
//   };

//   const removeFromCart = (medicineId) => {
//     setCart(prevCart => prevCart.filter(item => item._id !== medicineId));
//   };

//   const updateQuantity = (medicineId, newQuantity) => {
//     if (newQuantity <= 0) {
//       removeFromCart(medicineId);
//       return;
//     }

//     setCart(prevCart =>
//       prevCart.map(item =>
//         item._id === medicineId
//           ? { ...item, quantity: newQuantity }
//           : item
//       )
//     );
//   };

//   const clearCart = () => {
//     setCart([]);
//     localStorage.removeItem('pharma_cart');
//   };

//   const getTotalItems = () => {
//     return cart.reduce((total, item) => total + item.quantity, 0);
//   };

//   const getTotalAmount = () => {
//     return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
//   };

//   const getCartItem = (medicineId) => {
//     return cart.find(item => item._id === medicineId);
//   };

//   const isInCart = (medicineId) => {
//     return cart.some(item => item._id === medicineId);
//   };

//   const value = {
//     cart,
//     addToCart,
//     removeFromCart,
//     updateQuantity,
//     clearCart,
//     getTotalItems,
//     getTotalAmount,
//     getCartItem,
//     isInCart
//   };

//   return (
//     <CartContext.Provider value={value}>
//       {children}
//     </CartContext.Provider>
//   );
// };

// export { CartContext };